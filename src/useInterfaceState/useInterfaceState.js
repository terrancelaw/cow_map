import { 
	useEffect, 
	useReducer, 
	useCallback 
} from 'react';
import {
	initLinkPaneList,
	initSourcePaneList,
	initTargetPaneList,
	toggleItemList,
	selectItemList,
	updateSourcePaneList,
	updateTargetPaneList,
} from './updateDataSelectionPanes';
import {
	updateLinkTypeList,
	updateLinkTypeListColor,
	updateLinkList
} from './updateVisualizationPane';
import { 
	updateTimelineSliderState,
	generateTimelineSliderMin,
	generateTimelineSliderMax
} from './updateTimelineSlider';
import { 
	updateDetailPaneState,
	checkIsDirected,
	checkIsWeighted,
	checkIsNetworkMetric,
	generateSubOption1List,
	generateSubOption2List,
	checkIsOverflown
} from './updateDetailPane';
import {
	initColorPaneState,
	generateColorPaneAttribute,
	updateAppliedColoringList
} from './updateColorPane';
import {
	initFilterPaneState,
	generateFilterPaneAttributeValueList,
	generateFilterPaneAttributeValue,
	updateAppliedFilterList
} from './updateFilterPane';
import { 
	timelineSliderOptions 
} from '../config';

const initialState = {
	linkPane: { list: [] },
	sourcePane: { list: [] },
	targetPane: { list: [] },
	visualizationPane: { 
		linkTypeList: [], // for generating legend and Defs
		linkList: [], // for generating links
		linkTypeToColor: {} // for preserving color change
	},
	colorPicker: {
		isOpen: false,
		linkKey: null,
		currColor: null,
		colorTop: null,
		colorLeft: null,
		colorWidth: null,
		colorHeight: null
	},
	timelineSlider: {
		yearAttribute: timelineSliderOptions['no-filter'],
		yearAttributeList: [ timelineSliderOptions['no-filter'] ],
		min: new Date().getFullYear() - 10, 
		max: new Date().getFullYear() + 10, 
		value: new Date().getFullYear()
	},
	detailPane: { 
		isOpen: false,
		mainOption: null,
		mainOptionList: [ null ],
		subOption1: null,
		subOption1List: [ null ],
		subOption2: null,
		subOption2List: [ null ]
	},
	colorPane: {
		isOpen: false,
		dataSetList: [ null ],
		dataSet: null,
		attributeList: [ null ],
		attribute: null,
		appliedColoringList: [] // { dataSet, attribute }
	},
	filterPane: {
		isOpen: false,
		dataSetList: [ null ],
		dataSet: null,
		attributeList: [ null ],
		attribute: null,
		// categorical: { key, displayName, isSelected }
		// numerical: [ lower, upper ]
		attributeValueList: [ null ],
		// categorical: not matter
		// numerical: [ selected lower, selected upper ]
		attributeValue: null,
		appliedFilterList: [] // { dataSet, attribute, attributeValueList (no need to compute again), attributeValue } 
	},
	searchWindow: { isOpen: false },
	reference: { isOpen: false },
	hover: { object: null, data: null },
	focus: { object: null, data: null },
	isLoading: true
};

const reducer = (prevState, dataState, action) => {
	switch (action.type) {
		case 'INIT_INTERFACE': {
			const { 
				nodeList,
				linkDataList, 
				timeSeriesDataList, 
				countryIDToData 
			} = dataState;
			const { 
				visualizationPane: { linkTypeToColor: prevLinkTypeToColor },
				detailPane: prevDetailPaneState
			} = prevState;
			const newLinkPaneList = initLinkPaneList(linkDataList);
			const newColorPaneState = initColorPaneState(newLinkPaneList);
			const newFilterPaneState = initFilterPaneState(newLinkPaneList);
			const [ 
				newLinkTypeList, 
				newLinkTypeToColor 
			] = updateLinkTypeList(
				newLinkPaneList,
				newColorPaneState.appliedColoringList,
				newFilterPaneState.appliedFilterList,
				prevLinkTypeToColor,
				countryIDToData
			);
			const newSourcePaneList = initSourcePaneList(newLinkTypeList, nodeList);
			const newTargetPaneList = initTargetPaneList(newLinkTypeList, nodeList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkTypeList);
			const newLinkList = updateLinkList(
				newLinkTypeList, 
				newSourcePaneList, 
				newTargetPaneList, 
				newTimelineSliderState,
				newColorPaneState.appliedColoringList
			);
			const newDetailPaneState = updateDetailPaneState(newLinkList, timeSeriesDataList, prevDetailPaneState);

			return { ...prevState,
				linkPane: { list: newLinkPaneList },
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { 
					linkList: newLinkList,
					linkTypeList: newLinkTypeList,
					linkTypeToColor: newLinkTypeToColor
				},
				detailPane: newDetailPaneState,
				colorPane: newColorPaneState,
				filterPane: newFilterPaneState,
				isLoading: false
			};
		}

		// data selection pane

		case 'SELECT_LINK_PANE_ITEM': {
			const { linkKey } = action;
			const { 
				timeSeriesDataList,
				countryIDToData
			} = dataState;
			const {
				visualizationPane: { linkTypeToColor: prevLinkTypeToColor },
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				detailPane: prevDetailPaneState,
				colorPane: { appliedColoringList: prevAppliedColoringList },
				filterPane: { appliedFilterList: prevAppliedFilterList }
			} = prevState;
			const newLinkPaneList = toggleItemList(prevLinkPaneList, linkKey);
			const [ 
				newLinkTypeList, 
				newLinkTypeToColor 
			] = updateLinkTypeList(
				newLinkPaneList, 
				prevAppliedColoringList, 
				prevAppliedFilterList, 
				prevLinkTypeToColor, 
				countryIDToData
			);
			const newSourcePaneList = updateSourcePaneList(newLinkTypeList, prevSourcePaneList);
			const newTargetPaneList = updateTargetPaneList(newLinkTypeList, prevTargetPaneList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkTypeList);
			const newLinkList = updateLinkList(
				newLinkTypeList, 
				newSourcePaneList, 
				newTargetPaneList, 
				newTimelineSliderState,
				prevAppliedColoringList
			);
			const newDetailPaneState = updateDetailPaneState(newLinkList, timeSeriesDataList, prevDetailPaneState);

			return { ...prevState,
				linkPane: { list: newLinkPaneList },
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: {
					linkList: newLinkList,
					linkTypeList: newLinkTypeList,
					linkTypeToColor: newLinkTypeToColor
				},
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_LINK_PANE_ITEMS': {
			const { isSelected } = action;
			const { 
				timeSeriesDataList,
				countryIDToData
			} = dataState;
			const { 
				visualizationPane: { linkTypeToColor: prevLinkTypeToColor },
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				detailPane: prevDetailPaneState,
				colorPane: { appliedColoringList: prevAppliedColoringList },
				filterPane: { appliedFilterList: prevAppliedFilterList }
			} = prevState;
			const newLinkPaneList = selectItemList(prevLinkPaneList, isSelected);
			const [ 
				newLinkTypeList, 
				newLinkTypeToColor 
			] = updateLinkTypeList(
				newLinkPaneList, 
				prevAppliedColoringList, 
				prevAppliedFilterList, 
				prevLinkTypeToColor, 
				countryIDToData
			);
			const newSourcePaneList = updateSourcePaneList(newLinkTypeList, prevSourcePaneList);
			const newTargetPaneList = updateTargetPaneList(newLinkTypeList, prevTargetPaneList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkTypeList);
			const newLinkList = updateLinkList(
				newLinkTypeList, 
				newSourcePaneList, 
				newTargetPaneList, 
				newTimelineSliderState,
				prevAppliedColoringList
			);
			const newDetailPaneState = updateDetailPaneState(newLinkList, timeSeriesDataList, prevDetailPaneState);

			return { ...prevState,
				linkPane: { list: newLinkPaneList },
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: {
					linkList: newLinkList,
					linkTypeList: newLinkTypeList,
					linkTypeToColor: newLinkTypeToColor
				},
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_SOURCE_PANE_ITEM': {
			const { sourceKey } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				visualizationPane: { linkTypeList: prevLinkTypeList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState,
				colorPane: { appliedColoringList: prevAppliedColoringList }
			} = prevState;
			const newSourcePaneList = toggleItemList(prevSourcePaneList, sourceKey);
			const newLinkList = updateLinkList(
				prevLinkTypeList, 
				newSourcePaneList, 
				prevTargetPaneList, 
				prevTimelineSliderState,
				prevAppliedColoringList
			);
			const newDetailPaneState = updateDetailPaneState(newLinkList, timeSeriesDataList, prevDetailPaneState);

			return { ...prevState, 
				sourcePane: { list: newSourcePaneList },
				visualizationPane: { 
					...prevState.visualizationPane, 
					linkList: newLinkList 
				},
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_SOURCE_PANE_ITEMS': {
			const { isSelected } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				visualizationPane: { linkTypeList: prevLinkTypeList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState,
				colorPane: { appliedColoringList: prevAppliedColoringList }
			} = prevState;
			const newSourcePaneList = selectItemList(prevSourcePaneList, isSelected);
			const newLinkList = updateLinkList(
				prevLinkTypeList, 
				newSourcePaneList, 
				prevTargetPaneList, 
				prevTimelineSliderState,
				prevAppliedColoringList
			);
			const newDetailPaneState = updateDetailPaneState(newLinkList, timeSeriesDataList, prevDetailPaneState);

			return { ...prevState, 
				sourcePane: { list: newSourcePaneList },
				visualizationPane: { 
					...prevState.visualizationPane, 
					linkList: newLinkList 
				},
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_TARGET_PANE_ITEM': {
			const { targetKey } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				visualizationPane: { linkTypeList: prevLinkTypeList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState,
				colorPane: { appliedColoringList: prevAppliedColoringList }
			} = prevState;
			const newTargetPaneList = toggleItemList(prevTargetPaneList, targetKey);
			const newLinkList = updateLinkList(
				prevLinkTypeList, 
				prevSourcePaneList, 
				newTargetPaneList, 
				prevTimelineSliderState,
				prevAppliedColoringList
			);
			const newDetailPaneState = updateDetailPaneState(newLinkList, timeSeriesDataList, prevDetailPaneState);

			return { ...prevState,
				targetPane: { list: newTargetPaneList },
				visualizationPane: {
					...prevState.visualizationPane, 
					linkList: newLinkList
				},
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_TARGET_PANE_ITEMS': {
			const { isSelected } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				visualizationPane: { linkTypeList: prevLinkTypeList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState,
				colorPane: { appliedColoringList: prevAppliedColoringList }
			} = prevState;
			const newTargetPaneList = selectItemList(prevTargetPaneList, isSelected);
			const newLinkList = updateLinkList(
				prevLinkTypeList, 
				prevSourcePaneList, 
				newTargetPaneList, 
				prevTimelineSliderState,
				prevAppliedColoringList
			);
			const newDetailPaneState = updateDetailPaneState(newLinkList, timeSeriesDataList, prevDetailPaneState);

			return { ...prevState,
				targetPane: { list: newTargetPaneList },
				visualizationPane: {
					...prevState.visualizationPane, 
					linkList: newLinkList
				},
				detailPane: newDetailPaneState
			};
		}
		case 'MOUSE_ENTER_DATA_SELECTION_PANE_ITEM': {
			const { textEl } = action;
			const { top, height } = textEl.getBoundingClientRect();

			return { ...prevState, hover: { 
				object: 'DATA_SELECTION_PANE_ITEM', 
				data: { 
					left: 240, // avoid blocking the close button 
					top: top - 8 + height / 2,
					text: textEl.innerText
				}
			} };
		}
		case 'MOUSE_LEAVE_DATA_SELECTION_PANE_ITEM': {
			return { ...prevState, hover: { object: null, data: null } };
		}

		// visualizataion pane

		case 'CHANGE_TIMELINE_SLIDER': {
			const { value } = action;
			const { timeSeriesDataList } = dataState;
			const {
				visualizationPane: { linkTypeList: prevLinkTypeList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState,
				colorPane: { appliedColoringList: prevAppliedColoringList }
			} = prevState;
			const newTimelineSliderState = { ...prevTimelineSliderState, value };
			const newLinkList = updateLinkList(
				prevLinkTypeList, 
				prevSourcePaneList, 
				prevTargetPaneList, 
				newTimelineSliderState,
				prevAppliedColoringList
			);
			const newDetailPaneState = updateDetailPaneState(newLinkList, timeSeriesDataList, prevDetailPaneState);

			return { ...prevState, 
				timelineSlider: newTimelineSliderState,
				visualizationPane: {
					...prevState.visualizationPane, 
					linkList: newLinkList
				},
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_YEAR_ATTRIBUTE': {
			const { yearAttribute } = action;
			const { timeSeriesDataList } = dataState;
			const {
				visualizationPane: { linkTypeList: prevLinkTypeList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState,
				colorPane: { appliedColoringList: prevAppliedColoringList }
			} = prevState;
			const newTimelineSliderState = yearAttribute.key === 'no-filter' ? {
				...prevTimelineSliderState, 
				yearAttribute: yearAttribute,
				min: new Date().getFullYear() - 10, 
				max: new Date().getFullYear() + 10, 
				value: new Date().getFullYear()
			} : {
				...prevTimelineSliderState,
				yearAttribute: yearAttribute,
				min: generateTimelineSliderMin(prevLinkTypeList, yearAttribute),
				max: generateTimelineSliderMax(prevLinkTypeList, yearAttribute),
				value: yearAttribute.type === 'point' ? new Date().getFullYear() : [
					generateTimelineSliderMin(prevLinkTypeList, yearAttribute),
					generateTimelineSliderMax(prevLinkTypeList, yearAttribute)
				]
			};
			const newLinkList = updateLinkList(
				prevLinkTypeList, 
				prevSourcePaneList, 
				prevTargetPaneList, 
				newTimelineSliderState,
				prevAppliedColoringList
			);
			const newDetailPaneState = updateDetailPaneState(newLinkList, timeSeriesDataList, prevDetailPaneState);

			return { ...prevState, 
				timelineSlider: newTimelineSliderState,
				visualizationPane: {
					...prevState.visualizationPane, 
					linkList: newLinkList
				},
				detailPane: newDetailPaneState
			};
		}
		case 'MOUSE_ENTER_VIS_PANE_LABEL': {
			const { nodeID } = action;

			return { ...prevState, hover: { 
				object: 'NODE', 
				data: { nodeID }
			} };
		}
		case 'MOUSE_LEAVE_VIS_PANE_LABEL': {
			return { ...prevState, hover: { object: null, data: null } };
		}
		case 'MOUSE_MOVE_VIS_PANE_LINK': {
			const { 
				top, 
				left,
				sourceID, 
				targetID, 
				linkType,
				linkRowList, 
				tooltipAttrList,
				eventName
			} = action;

			return { ...prevState, hover: { 
				object: 'LINK', 
				data: {
					top, 
					left,
					sourceID, 
					targetID,
					linkType,
					linkRowList, 
					tooltipAttrList,
					eventName
				}
			} };
		}
		case 'MOUSE_LEAVE_VIS_PANE_LINK': {
			return { ...prevState, hover: { object: null, data: null } };
		}
		case 'CLICK_VIS_PANE_LINK': {
			const {
				sourceID, 
				targetID, 
				linkRowList, 
				dataTableAttrList,
				eventName
			} = action;

			return { ...prevState, 
				focus: { object: 'LINK', data: {
					sourceID, 
					targetID, 
					linkRowList, 
					dataTableAttrList,
					eventName
				} },
				hover: { object: null, data: null } // when click on link, remove highlight and tooltip
			};
		}
		case 'CLOSE_POP_UP_WINDOW': {
			return { ...prevState, focus: { object: null, data: null } };
		}
		case 'OPEN_COLOR_PICKER': {
			const { linkKey, currColor, colorEl } = action;
			const { top, left, width, height } = colorEl.getBoundingClientRect();

			return { ...prevState, 
				colorPicker: { 
					isOpen: true,
					linkKey: linkKey,
					currColor: currColor,
					colorTop: top - 8,
					colorLeft: left - 8,
					colorWidth: width,
					colorHeight: height
				} 
			};
		}
		case 'CLOSE_COLOR_PICKER': {
			return { ...prevState, 
				colorPicker: { 
					isOpen: false, 
					linkKey: null,
					currColor: null,
					colorTop: null,
					colorLeft: null,
					colorWidth: null,
					colorHeight: null
				} 
			};
		}
		case 'SELECT_COLOR': {
			const { linkKey, newColor } = action;
			const { 
				visualizationPane: { 
					linkTypeList: prevLinkTypeList,
					linkTypeToColor: prevLinkTypeToColor
				},
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				colorPane: { appliedColoringList: prevAppliedColoringList }
			} = prevState;
			const [ 
				newLinkTypeList, 
				newLinkTypeToColor 
			] = updateLinkTypeListColor(
				prevLinkTypeList, 
				prevLinkTypeToColor, 
				linkKey, 
				newColor
			);
			const newLinkList = updateLinkList(
				newLinkTypeList, 
				prevSourcePaneList, 
				prevTargetPaneList, 
				prevTimelineSliderState,
				prevAppliedColoringList
			);

			return { ...prevState,
				visualizationPane: {
					linkTypeList: newLinkTypeList,
					linkList: newLinkList,
					linkTypeToColor: newLinkTypeToColor
				},
				colorPicker: { 
					isOpen: false, 
					linkKey: null,
					currColor: null,
					colorTop: null,
					colorLeft: null,
					colorWidth: null,
					colorHeight: null
				}
			};
		}
		case 'MOUSE_ENTER_CONTROL_BUTTON': {
			const { buttonEl, text, isDark } = action;
			const buttonBBox = buttonEl.getBoundingClientRect();
			const top = buttonBBox.top - 8 + buttonBBox.height / 2;
			const left = buttonBBox.left - 8 - 8;

			return { ...prevState, hover: { 
				object: 'CONTROL_BUTTON', 
				data: { top, left, text, isDark }
			} };
		}
		case 'MOUSE_LEAVE_CONTROL_BUTTON': {
			return { ...prevState, hover: { object: null, data: null } };
		}

		// search window

		case 'OPEN_SEARCH_WINDOW': {
			return { ...prevState, 
				searchWindow: {  isOpen: true },
				hover: { object: null, data: null }
			};
		}
		case 'CLOSE_SEARCH_WINDOW': {
			return { ...prevState, searchWindow: {  isOpen: false } };
		}

		// detail pane

		case 'TOGGLE_DETAIL_PANE': {
			const { timeSeriesDataList } = dataState;
			const {
				visualizationPane: { linkList: prevLinkList },
				detailPane: { isOpen: prevIsOpen },
				colorPane: prevColorPaneState,
				filterPane: prevFilterPaneState
			} = prevState;
			const newDetailPaneState = updateDetailPaneState(prevLinkList, timeSeriesDataList, { 
				...prevState.detailPane, isOpen: !prevIsOpen 
			});
			const newColorPaneState = { ...prevColorPaneState, isOpen: false }; // always close
			const newFilterPaneState = { ...prevFilterPaneState, isOpen: false }; // always close

			return { ...prevState, 
				detailPane: newDetailPaneState,
				colorPane: newColorPaneState,
				filterPane: newFilterPaneState,
				hover: { object: null, data: null } // remove tooltip when open or close
			};
		}
		case 'SELECT_DETAIL_PANE_MAIN_OPTION': {
			const { option: newMainOption } = action;
			const { timeSeriesDataList } = dataState;
			const { visualizationPane: { linkList: prevLinkList } } = prevState;
			const isDirected = checkIsDirected(prevLinkList);
			const isWeighted = checkIsWeighted(prevLinkList);
			const isNetworkMetric = checkIsNetworkMetric(newMainOption);
			const newSubOption1List = generateSubOption1List(timeSeriesDataList, newMainOption, isDirected);
			const newSubOption1 = newSubOption1List[0];
			const newSubOption2List = generateSubOption2List(timeSeriesDataList, newMainOption, isWeighted);
			const newSubOption2 = !isNetworkMetric ? newSubOption2List[newSubOption2List.length - 1] : newSubOption2List[0];

			return { ...prevState, detailPane: { ...prevState.detailPane,
				mainOption: newMainOption,
				subOption1: newSubOption1,
				subOption1List: newSubOption1List,
				subOption2: newSubOption2,
				subOption2List: newSubOption2List
			} };
		}
		case 'SELECT_DETAIL_PANE_SUB_OPTION': {
			const { key, option } = action;

			return { ...prevState, 
				detailPane: { ...prevState.detailPane, [ key ]: option }
			};
		}
		case 'MOUSE_ENTER_DETAIL_PANE_ITEM': {
			const { itemEl, titleEl, titleText, itemData } = action;
			const isHoveredNode = 'nodeID' in itemData;
			const hoverStateObject = isHoveredNode ? 'DETAIL_PANE_NODE' : 'DETAIL_PANE_LINK';
			const hoverStateData = { ...itemData, showTooltip: false };
			const isTextTooLong = checkIsOverflown(titleEl);

			if (isTextTooLong) {
				const itemBBox = itemEl.getBoundingClientRect();
				const right = 250 + 5; // 250 is width of detail pane
				const top = itemBBox.top - 8 + itemBBox.height / 2;

				hoverStateData.showTooltip = true;
				hoverStateData.right = right;
				hoverStateData.top = top;
				hoverStateData.text = titleText;
			}

			return { ...prevState, hover: { 
				object: hoverStateObject, 
				data: hoverStateData 
			} };
		}
		case 'MOUSE_LEAVE_DETAIL_PANE_ITEM': {
			return { ...prevState, hover: { object: null, data: null } };
		}
		case 'CLICK_DETAIL_PANE_DETAIL_BUTTON': {
			const { mainOption, subOption1, subOption2, entryList } = action;
			const isSelectedNetworkMetric = checkIsNetworkMetric(mainOption);
			const focusStateObject = isSelectedNetworkMetric ? 'BAR_LIST' : 'SPARK_LINE_LIST';
			const headerText = isSelectedNetworkMetric ? `${ mainOption } (${ subOption1 } + ${ subOption2 })` : mainOption;
			const focusStateData = { headerText, entryList };

			return { ...prevState, focus: { 
				object: focusStateObject, 
				data: focusStateData 
			} };
		}

		// color pane

		case 'TOGGLE_COLOR_PANE': {
			const {
				detailPane: prevDetailPaneState,
				colorPane: prevColorPaneState,
				filterPane: prevFilterPaneState
			} = prevState;
			const newDetailPaneState = { ...prevDetailPaneState, isOpen: false };
			const newColorPaneState = { ...prevColorPaneState, isOpen: !prevColorPaneState.isOpen };
			const newFilterPaneState = { ...prevFilterPaneState, isOpen: false };
			
			return { ...prevState, 
				detailPane: newDetailPaneState,
				colorPane: newColorPaneState,
				filterPane: newFilterPaneState,
				hover: { object: null, data: null } // remove tooltip when open or close
			};
		}
		case 'SELECT_COLOR_PANE_DATASET': {
			const { option: newDataSet } = action;
			const { colorPane: { 
				dataSet: prevDataSet, 
				appliedColoringList: prevAppliedColoringList 
			} } = prevState;
			const newAttributeList = [ { key: 'NONE', displayName: 'NONE' }, ...newDataSet.colorPane.attributeList ];
			const newAttribute = generateColorPaneAttribute(newDataSet, newAttributeList, prevAppliedColoringList);

			if (newDataSet === prevDataSet)
				return prevState;

			return { ...prevState, colorPane: { ...prevState.colorPane,
				dataSet: newDataSet,
				attributeList: newAttributeList,
				attribute: newAttribute
			} };
		}
		case 'SELECT_COLOR_PANE_ATTRIBUTE': {
			const { option: newAttribute } = action;
			const {
				nodeList,
				countryIDToData
			} = dataState;
			const {
				linkPane: { list: prevLinkPaneList },
				visualizationPane: { linkTypeToColor: prevLinkTypeToColor },
				colorPane: { 
					dataSet: prevDataSet, 
					attribute: prevAttribute, 
					appliedColoringList: prevAppliedColoringList 
				},
				filterPane: { appliedFilterList: prevAppliedFilterList }
			} = prevState;
			const newAppliedColoringList = updateAppliedColoringList(prevAppliedColoringList, { 
				dataSet: prevDataSet,
				attribute: newAttribute 
			});
			const [
				newLinkTypeList,
				newLinkTypeToColor
			] = updateLinkTypeList(
				prevLinkPaneList, 
				newAppliedColoringList, 
				prevAppliedFilterList, 
				prevLinkTypeToColor, 
				countryIDToData
			);
			const newSourcePaneList = initSourcePaneList(newLinkTypeList, nodeList);
			const newTargetPaneList = initTargetPaneList(newLinkTypeList, nodeList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkTypeList);
			const newLinkList = updateLinkList(
				newLinkTypeList, 
				newSourcePaneList, 
				newTargetPaneList, 
				newTimelineSliderState,
				newAppliedColoringList
			);

			if (newAttribute === prevAttribute)
				return prevState;

			return { ...prevState,
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { 
					linkList: newLinkList,
					linkTypeList: newLinkTypeList,
					linkTypeToColor: newLinkTypeToColor
				},
				colorPane: { 
					...prevState.colorPane,
					attribute: newAttribute,
					appliedColoringList: newAppliedColoringList
				}
			};
		}
		case 'REMOVE_COLOR_PANE_LIST_ITEM': {
			const { listItem: selectedAppliedColoringListItem } = action;
			const {
				nodeList,
				countryIDToData
			} = dataState;
			const {
				linkPane: { list: prevLinkPaneList },
				visualizationPane: { linkTypeToColor: prevLinkTypeToColor },
				colorPane: { 
					dataSet: prevDataSet, 
					attributeList: prevAttributeList,
					appliedColoringList: prevAppliedColoringList
				},
				filterPane: { appliedFilterList: prevAppliedFilterList }
			} = prevState;
			const newAppliedColoringList = prevAppliedColoringList
				.filter(listItem => listItem !== selectedAppliedColoringListItem);
			const newAttribute = generateColorPaneAttribute(prevDataSet, prevAttributeList, newAppliedColoringList);
			const [ 
				newLinkTypeList,
				newLinkTypeToColor
			] = updateLinkTypeList(
				prevLinkPaneList,
				newAppliedColoringList,
				prevAppliedFilterList, 
				prevLinkTypeToColor, 
				countryIDToData
			);
			const newSourcePaneList = initSourcePaneList(newLinkTypeList, nodeList);
			const newTargetPaneList = initTargetPaneList(newLinkTypeList, nodeList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkTypeList);
			const newLinkList = updateLinkList(
				newLinkTypeList, 
				newSourcePaneList, 
				newTargetPaneList, 
				newTimelineSliderState,
				newAppliedColoringList
			);

			return { ...prevState,
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { 
					linkList: newLinkList,
					linkTypeList: newLinkTypeList,
					linkTypeToColor: newLinkTypeToColor
				},
				colorPane: { 
					...prevState.colorPane,
					attribute: newAttribute,
					appliedColoringList: newAppliedColoringList
				}
			};
		}

		// filter pane

		case 'TOGGLE_FILTER_PANE': {
			const { 
				detailPane: prevDetailPaneState,
				colorPane: prevColorPaneState,
				filterPane: prevFilterPaneState
			} = prevState;
			const newDetailPaneState = { ...prevDetailPaneState, isOpen: false };
			const newColorPaneState = { ...prevColorPaneState, isOpen: false };
			const newFilterPaneState = { ...prevFilterPaneState, isOpen: !prevFilterPaneState.isOpen };

			return { ...prevState, 
				detailPane: newDetailPaneState,
				colorPane: newColorPaneState,
				filterPane: newFilterPaneState,
				hover: { object: null, data: null } // remove tooltip when open or close
			};
		}
		case 'SELECT_FILTER_PANE_DATASET': {
			const { option: newDataSet } = action;
			const { filterPane: { dataSet: prevDataSet } } = prevState;
			const newAttributeList = [ 
				{ key: 'NONE', displayName: 'SELECT AN ATTRIBUTE' }, 
				...newDataSet.filterPane.attributeList 
			];
			const newAttribute = newAttributeList[0];
			const newAttributeValueList = [];
			const newAttributeValue = '';

			if (newDataSet === prevDataSet)
				return prevState;

			return { ...prevState, filterPane: { ...prevState.filterPane,
				dataSet: newDataSet,
				attributeList: newAttributeList,
				attribute: newAttribute,
				attributeValueList: newAttributeValueList,
				attributeValue: newAttributeValue
			} };
		}
		case 'SELECT_FILTER_PANE_ATTRIBUTE': {
			const { option: newAttribute } = action;
			const { countryIDToData } = dataState;
			const { filterPane: { 
				dataSet: prevDataSet, 
				attribute: prevAttribute, 
				appliedFilterList: prevAppliedFilterList 
			} } = prevState;
			const newAttributeValueList = generateFilterPaneAttributeValueList(prevDataSet, newAttribute, prevAppliedFilterList, countryIDToData);
			const newAttributeValue = generateFilterPaneAttributeValue(prevDataSet, newAttribute, newAttributeValueList, prevAppliedFilterList);

			if (newAttribute === prevAttribute)
				return prevState;

			return { ...prevState, filterPane: { ...prevState.filterPane,
				attribute: newAttribute,
				attributeValueList: newAttributeValueList,
				attributeValue: newAttributeValue
			} };
		}
		case 'SELECT_FILTER_PANE_CATEGORY': {
			const { itemKey } = action;
			const {
				nodeList,
				countryIDToData
			} = dataState;
			const {
				linkPane: { list: prevLinkPaneList },
				visualizationPane: { linkTypeToColor: prevLinkTypeToColor },
				colorPane: { appliedColoringList: prevAppliedColoringList },
				filterPane: {
					dataSet: prevDataSet, 
					attribute: prevAttribute, 
					attributeValueList: prevAttributeValueList, 
					appliedFilterList: prevAppliedFilterList
				} 
			} = prevState;
			const newAttributeValueList = prevAttributeValueList
				.map(listItem => listItem.key === itemKey ? { ...listItem, isSelected: !listItem.isSelected } : listItem);
			const newAppliedFilterList = updateAppliedFilterList(prevAppliedFilterList, {
				dataSet: prevDataSet,
				attribute: prevAttribute,
				attributeValueList: newAttributeValueList,
				attributeValue: '' // categorical attr => ''
			});
			const [ 
				newLinkTypeList,
				newLinkTypeToColor
			] = updateLinkTypeList(
				prevLinkPaneList, 
				prevAppliedColoringList, 
				newAppliedFilterList, 
				prevLinkTypeToColor, 
				countryIDToData
			);
			const newSourcePaneList = initSourcePaneList(newLinkTypeList, nodeList);
			const newTargetPaneList = initTargetPaneList(newLinkTypeList, nodeList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkTypeList);
			const newLinkList = updateLinkList(
				newLinkTypeList, 
				newSourcePaneList, 
				newTargetPaneList, 
				newTimelineSliderState,
				prevAppliedColoringList
			);

			return { ...prevState,
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { 
					linkList: newLinkList,
					linkTypeList: newLinkTypeList,
					linkTypeToColor: newLinkTypeToColor
				},
				filterPane: { 
					...prevState.filterPane,
					attributeValueList: newAttributeValueList,
					appliedFilterList: newAppliedFilterList
				} 
			};
		}
		case 'SELECT_FILTER_PANE_CATEGORIES': {
			const { isSelected } = action;
			const {
				nodeList,
				countryIDToData
			} = dataState;
			const {
				linkPane: { list: prevLinkPaneList },
				visualizationPane: { linkTypeToColor: prevLinkTypeToColor },
				colorPane: { appliedColoringList: prevAppliedColoringList },
				filterPane: {
					dataSet: prevDataSet, 
					attribute: prevAttribute, 
					attributeValueList: prevAttributeValueList, 
					appliedFilterList: prevAppliedFilterList
				} 
			} = prevState;
			const newAttributeValueList = prevAttributeValueList
				.map(listItem => ({ ...listItem, isSelected: isSelected }));
			const newAppliedFilterList = updateAppliedFilterList(prevAppliedFilterList, {
				dataSet: prevDataSet,
				attribute: prevAttribute,
				attributeValueList: newAttributeValueList,
				attributeValue: '' // categorical attr => ''
			});
			const [ 
				newLinkTypeList,
				newLinkTypeToColor
			] = updateLinkTypeList(
				prevLinkPaneList, 
				prevAppliedColoringList, 
				newAppliedFilterList, 
				prevLinkTypeToColor, 
				countryIDToData
			);
			const newSourcePaneList = initSourcePaneList(newLinkTypeList, nodeList);
			const newTargetPaneList = initTargetPaneList(newLinkTypeList, nodeList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkTypeList);
			const newLinkList = updateLinkList(
				newLinkTypeList, 
				newSourcePaneList, 
				newTargetPaneList, 
				newTimelineSliderState,
				prevAppliedColoringList
			);
			
			return { ...prevState,
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { 
					linkList: newLinkList,
					linkTypeList: newLinkTypeList,
					linkTypeToColor: newLinkTypeToColor
				},
				filterPane: { 
					...prevState.filterPane,
					attributeValueList: newAttributeValueList,
					appliedFilterList: newAppliedFilterList
				} 
			};
		}
		case 'CHANGE_FILTER_PANE_RANGE': {
			const { value: newAttributeValue } = action;
			const {
				nodeList,
				countryIDToData
			} = dataState;
			const {
				linkPane: { list: prevLinkPaneList },
				visualizationPane: { linkTypeToColor: prevLinkTypeToColor },
				colorPane: { appliedColoringList: prevAppliedColoringList },
				filterPane: {
					dataSet: prevDataSet, 
					attribute: prevAttribute, 
					attributeValueList: prevAttributeValueList, 
					appliedFilterList: prevAppliedFilterList
				} 
			} = prevState;
			const newAppliedFilterList = updateAppliedFilterList(prevAppliedFilterList, { 
				dataSet: prevDataSet, 
				attribute: prevAttribute, 
				attributeValueList: prevAttributeValueList, 
				attributeValue: newAttributeValue 
			});
			const [ 
				newLinkTypeList,
				newLinkTypeToColor
			] = updateLinkTypeList(
				prevLinkPaneList, 
				prevAppliedColoringList, 
				newAppliedFilterList, 
				prevLinkTypeToColor, 
				countryIDToData
			);
			const newSourcePaneList = initSourcePaneList(newLinkTypeList, nodeList);
			const newTargetPaneList = initTargetPaneList(newLinkTypeList, nodeList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkTypeList);
			const newLinkList = updateLinkList(
				newLinkTypeList, 
				newSourcePaneList, 
				newTargetPaneList, 
				newTimelineSliderState,
				prevAppliedColoringList
			);

			return { ...prevState,
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { 
					linkList: newLinkList,
					linkTypeList: newLinkTypeList,
					linkTypeToColor: newLinkTypeToColor
				},
				filterPane: { 
					...prevState.filterPane,
					attributeValue: newAttributeValue,
					appliedFilterList: newAppliedFilterList
				} 
			};
		}
		case 'REMOVE_FILTER_PANE_FILTER': {
			const { listItem: selectedFilter } = action;
			const {
				nodeList,
				countryIDToData
			} = dataState;
			const { 
				linkPane: { list: prevLinkPaneList },
				visualizationPane: { linkTypeToColor: prevLinkTypeToColor },
				colorPane: { appliedColoringList: prevAppliedColoringList },
				filterPane: { 
					dataSet: prevDataSet,
					attribute: prevAttribute,
					appliedFilterList: prevAppliedFilterList 
				} 
			} = prevState;
			const newAppliedFilterList = prevAppliedFilterList.filter(listItem => listItem !== selectedFilter);
			const newAttributeValueList = generateFilterPaneAttributeValueList(prevDataSet, prevAttribute, newAppliedFilterList, countryIDToData);
			const newAttributeValue = generateFilterPaneAttributeValue(prevDataSet, prevAttribute, newAttributeValueList, newAppliedFilterList);
			const [ 
				newLinkTypeList,
				newLinkTypeToColor
			] = updateLinkTypeList(
				prevLinkPaneList, 
				prevAppliedColoringList, 
				newAppliedFilterList, 
				prevLinkTypeToColor, 
				countryIDToData
			);
			const newSourcePaneList = initSourcePaneList(newLinkTypeList, nodeList);
			const newTargetPaneList = initTargetPaneList(newLinkTypeList, nodeList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkTypeList);
			const newLinkList = updateLinkList(
				newLinkTypeList, 
				newSourcePaneList, 
				newTargetPaneList, 
				newTimelineSliderState,
				prevAppliedColoringList
			);

			return { ...prevState, 
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { 
					linkList: newLinkList,
					linkTypeList: newLinkTypeList,
					linkTypeToColor: newLinkTypeToColor
				},
				filterPane: { 
					...prevState.filterPane,
					appliedFilterList: newAppliedFilterList,
					attributeValueList: newAttributeValueList,
					attributeValue: newAttributeValue
				} 
			};
		}

		// reference

		case 'OPEN_REFERENCE': {
			return { ...prevState, 
				reference: {  isOpen: true },
				hover: { object: null, data: null }
			};
		}
		case 'CLOSE_REFERENCE': {			
			return { ...prevState, reference: {  isOpen: false } };
		}

		// default

		default: {
			throw new Error(`Unhandled action type: ${ action.type }`);
		}
	}
};

export const useInterfaceState = dataState => {
	const memoizedReducer = useCallback((prevState, action) => 
		reducer(prevState, dataState, action), [ dataState ]);
	const [ interfaceState, dispatch ] = useReducer(memoizedReducer, initialState);

	useEffect(() => {
		if (dataState.isLoading) 
			return;
		
		dispatch({ type: 'INIT_INTERFACE' });
	}, [ dataState ]);

	return [ interfaceState, dispatch ];
};
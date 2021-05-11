import { useEffect, useReducer, useCallback } from 'react';
import { 
	initLinkPaneList,
	initSourcePaneList,
	initTargetPaneList,
	toggleItemList,
	selectItemList,
	updateSourcePaneList,
	updateTargetPaneList,
	updateLinkPaneListColor,
	addNewLinkDataObjects
} from './updateDataSelectionPanes';
import { 
	updateTimelineSliderState,
	generateTimelineSliderMin,
	generateTimelineSliderMax
} from './updateTimelineSlider';
import { 
	updateVisualizationPaneList 
} from './updateVisualizationPane';
import { 
	updateDetailPaneState, 
	checkIsDirected,
	checkIsWeighted,
	checkIsNetworkMetric,
	generateSubOption1List,
	generateSubOption2List,
	checkIsOverflown
} from './updateDetailPane';
import { timelineSliderOptions } from '../config';

const initialState = {
	linkPane: { list: [] },
	sourcePane: { list: [] },
	targetPane: { list: [] },
	visualizationPane: { list: [] },
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
	searchWindow: { isOpen: false },
	linkDisaggregator: { isOpen: false },
	hover: { object: null, data: null },
	focus: { object: null, data: null },
	isLoading: true
};

const reducer = (prevState, dataState, action) => {
	switch (action.type) {
		case 'INIT_INTERFACE': {
			const { linkDataList, nodeList, timeSeriesDataList } = dataState;
			const { detailPane: prevDetailPaneState } = prevState;
			const newLinkPaneList = initLinkPaneList(linkDataList);
			const newSourcePaneList = initSourcePaneList(newLinkPaneList, nodeList);
			const newTargetPaneList = initTargetPaneList(newLinkPaneList, nodeList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkPaneList);
			const newVisualizationPaneList = updateVisualizationPaneList(newLinkPaneList, newSourcePaneList, newTargetPaneList, newTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState,
				linkPane: { list: newLinkPaneList },
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { list: newVisualizationPaneList },
				detailPane: newDetailPaneState,
				isLoading: false
			};
		}

		// data selection pane

		case 'SELECT_LINK_PANE_ITEM': {
			const { linkKey } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				detailPane: prevDetailPaneState
			} = prevState;
			const newLinkPaneList = toggleItemList(prevLinkPaneList, linkKey);
			const newSourcePaneList = updateSourcePaneList(newLinkPaneList, prevSourcePaneList);
			const newTargetPaneList = updateTargetPaneList(newLinkPaneList, prevTargetPaneList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkPaneList);
			const newVisualizationPaneList = updateVisualizationPaneList(newLinkPaneList, newSourcePaneList, newTargetPaneList, newTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState,
				linkPane: { list: newLinkPaneList },
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { list: newVisualizationPaneList },
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_LINK_PANE_ITEMS': {
			const { isSelected } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				detailPane: prevDetailPaneState
			} = prevState;
			const newLinkPaneList = selectItemList(prevLinkPaneList, isSelected);
			const newSourcePaneList = updateSourcePaneList(newLinkPaneList, prevSourcePaneList);
			const newTargetPaneList = updateTargetPaneList(newLinkPaneList, prevTargetPaneList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkPaneList);
			const newVisualizationPaneList = updateVisualizationPaneList(newLinkPaneList, newSourcePaneList, newTargetPaneList, newTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState,
				linkPane: { list: newLinkPaneList },
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { list: newVisualizationPaneList },
				detailPane: newDetailPaneState
			};
		}
		case 'REMOVE_LINK_PANE_ITEM': {
			const { linkKey } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				detailPane: prevDetailPaneState
			} = prevState;
			const newLinkPaneList = prevLinkPaneList.filter(({ key }) => key !== linkKey);
			const newSourcePaneList = updateSourcePaneList(newLinkPaneList, prevSourcePaneList);
			const newTargetPaneList = updateTargetPaneList(newLinkPaneList, prevTargetPaneList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkPaneList);
			const newVisualizationPaneList = updateVisualizationPaneList(newLinkPaneList, newSourcePaneList, newTargetPaneList, newTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState,
				linkPane: { list: newLinkPaneList },
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { list: newVisualizationPaneList },
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_SOURCE_PANE_ITEM': {
			const { sourceKey } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState
			} = prevState;
			const newSourcePaneList = toggleItemList(prevSourcePaneList, sourceKey);
			const newVisualizationPaneList = updateVisualizationPaneList(prevLinkPaneList, newSourcePaneList, prevTargetPaneList, prevTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState, 
				sourcePane: { list: newSourcePaneList },
				visualizationPane: { list: newVisualizationPaneList },
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_SOURCE_PANE_ITEMS': {
			const { isSelected } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState
			} = prevState;
			const newSourcePaneList = selectItemList(prevSourcePaneList, isSelected);
			const newVisualizationPaneList = updateVisualizationPaneList(prevLinkPaneList, newSourcePaneList, prevTargetPaneList, prevTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState, 
				sourcePane: { list: newSourcePaneList },
				visualizationPane: { list: newVisualizationPaneList },
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_TARGET_PANE_ITEM': {
			const { targetKey } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState
			} = prevState;
			const newTargetPaneList = toggleItemList(prevTargetPaneList, targetKey);
			const newVisualizationPaneList = updateVisualizationPaneList(prevLinkPaneList, prevSourcePaneList, newTargetPaneList, prevTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState, 
				targetPane: { list: newTargetPaneList },
				visualizationPane: { list: newVisualizationPaneList },
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_TARGET_PANE_ITEMS': {
			const { isSelected } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState
			} = prevState;
			const newTargetPaneList = selectItemList(prevTargetPaneList, isSelected);
			const newVisualizationPaneList = updateVisualizationPaneList(prevLinkPaneList, prevSourcePaneList, newTargetPaneList, prevTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState, 
				targetPane: { list: newTargetPaneList },
				visualizationPane: { list: newVisualizationPaneList },
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
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState
			} = prevState;
			const newTimelineSliderState = { ...prevTimelineSliderState, value };
			const newVisualizationPaneList = updateVisualizationPaneList(prevLinkPaneList, prevSourcePaneList, prevTargetPaneList, newTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState, 
				timelineSlider: newTimelineSliderState,
				visualizationPane: { list: newVisualizationPaneList },
				detailPane: newDetailPaneState
			};
		}
		case 'SELECT_YEAR_ATTRIBUTE': {
			const { yearAttribute } = action;
			const { timeSeriesDataList } = dataState;
			const { 
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState,
				detailPane: prevDetailPaneState
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
				min: generateTimelineSliderMin(prevLinkPaneList, yearAttribute),
				max: generateTimelineSliderMax(prevLinkPaneList, yearAttribute),
				value: yearAttribute.type === 'point' ? new Date().getFullYear() : [
					generateTimelineSliderMin(prevLinkPaneList, yearAttribute),
					generateTimelineSliderMax(prevLinkPaneList, yearAttribute)
				]
			};
			const newVisualizationPaneList = updateVisualizationPaneList(prevLinkPaneList, prevSourcePaneList, prevTargetPaneList, newTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState, 
				timelineSlider: newTimelineSliderState,
				visualizationPane: { list: newVisualizationPaneList },
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
				top, left,
				sourceID, targetID, linkType,
				linkRowList, tooltipAttrList, eventName
			} = action;
			
			return { ...prevState, hover: { 
				object: 'LINK', 
				data: {
					top, left,
					sourceID, targetID, linkType,
					linkRowList, tooltipAttrList, eventName
				}
			} };
		}
		case 'MOUSE_LEAVE_VIS_PANE_LINK': {
			return { ...prevState, hover: { object: null, data: null } };
		}
		case 'CLICK_VIS_PANE_LINK': {
			const {
				sourceID, targetID, 
				linkRowList, dataTableAttrList, eventName
			} = action;

			return { ...prevState, 
				focus: { object: 'LINK', data: {
					sourceID, targetID, 
					linkRowList, dataTableAttrList, eventName
				} },
				hover: { object: null, data: null } // when click on link, remove highlight and tooltip
			};
		}
		case 'CLOSE_POP_UP_WINDOW': {
			return { ...prevState, focus: { object: null, data: null } };
		}
		case 'MOUSE_ENTER_CONTROL_BUTTON': {
			const { buttonEl, text } = action;
			const buttonBBox = buttonEl.getBoundingClientRect();
			const left = buttonBBox.left - 8 + buttonBBox.width;
			const top = buttonBBox.top - 8 + buttonBBox.height + 8;

			return { ...prevState, hover: { 
				object: 'CONTROL_BUTTON', 
				data: { left, top, text }
			} };
		}
		case 'MOUSE_LEAVE_CONTROL_BUTTON': {
			return { ...prevState, hover: { object: null, data: null } };
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
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				timelineSlider: prevTimelineSliderState
			} = prevState;
			const newLinkPaneList = updateLinkPaneListColor(prevLinkPaneList, linkKey, newColor);
			const newVisualizationPaneList = updateVisualizationPaneList(newLinkPaneList, prevSourcePaneList, prevTargetPaneList, prevTimelineSliderState);

			return { ...prevState,
				linkPane: { list: newLinkPaneList },
				visualizationPane: { list: newVisualizationPaneList },
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

		// detail pane

		case 'TOGGLE_DETAIL_PANE': {
			const { timeSeriesDataList } = dataState;
			const { 
				visualizationPane: { list: prevVisualizationPaneList },
				detailPane: { isOpen: prevIsOpen }
			} = prevState;
			const newDetailPaneState = updateDetailPaneState(
				timeSeriesDataList,
				prevVisualizationPaneList,
				{ ...prevState.detailPane, isOpen: !prevIsOpen }
			);

			return { ...prevState, 
				detailPane: newDetailPaneState,
				hover: { object: null, data: null } // remove tooltip when open
			};
		}
		case 'MOUSE_ENTER_DETAIL_PANE_BUTTON': {
			const { buttonEl } = action;
			const buttonBBox = buttonEl.getBoundingClientRect();
			const right = 0;
			const top = buttonBBox.top - 8 + buttonBBox.height + 8;
			const text = 'Show details of current network';

			return { ...prevState, hover: { 
				object: 'DETAIL_PANE_BUTTON', 
				data: { right, top, text }
			} };
		}
		case 'MOUSE_LEAVE_DETAIL_PANE_BUTTON': {
			return { ...prevState, hover: { object: null, data: null } };
		}
		case 'SELECT_DETAIL_PANE_MAIN_OPTION': {
			const { option: newMainOption } = action;
			const { timeSeriesDataList } = dataState;
			const { visualizationPane: { list: prevVisualizationPaneList } } = prevState;
			const isDirected = checkIsDirected(prevVisualizationPaneList);
			const isWeighted = checkIsWeighted(prevVisualizationPaneList);
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
		case 'MOUSE_ENTER_SEARCH_WINDOW_BUTTON': {
			const { buttonEl } = action;
			const buttonBBox = buttonEl.getBoundingClientRect();
			const right = buttonEl.style.right;
			const top = buttonBBox.top - 8 + buttonBBox.height + 8;
			const text = 'Open search window';

			return { ...prevState, hover: { 
				object: 'SEARCH_WINDOW_BUTTON', 
				data: { right, top, text }
			} };
		}
		case 'MOUSE_LEAVE_SEARCH_WINDOW_BUTTON': {
			return { ...prevState, hover: { object: null, data: null } };
		}

		// link disaggregator

		case 'OPEN_LINK_DISAGGREGATOR': {
			return { ...prevState, 
				linkDisaggregator: {  isOpen: true },
				hover: { object: null, data: null }
			};
		}
		case 'CLOSE_LINK_DISAGGREGATOR': {			
			return { ...prevState, linkDisaggregator: {  isOpen: false } };
		}
		case 'CONFIRM_LINK_DISAGGREGATION': {
			const { linkKey, optionList } = action;
			const { countryIDToData } = dataState;
			const { linkPane: { list: prevLinkPaneList } } = prevState;
			const newLinkPaneList = addNewLinkDataObjects(
				prevLinkPaneList, linkKey, optionList, countryIDToData
			);

			return { 
				...prevState,
				linkPane: { list: newLinkPaneList },
				linkDisaggregator: { isOpen: false }
			};
		}
		case 'CLEAR_DISAGGREGATED_LINKS': {
			const { timeSeriesDataList } = dataState;
			const { 
				linkPane: { list: prevLinkPaneList },
				sourcePane: { list: prevSourcePaneList },
				targetPane: { list: prevTargetPaneList },
				detailPane: prevDetailPaneState
			} = prevState;
			const newLinkPaneList = prevLinkPaneList.filter(({ isSubItem, canDelete }) => !(isSubItem && canDelete));
			const newSourcePaneList = updateSourcePaneList(newLinkPaneList, prevSourcePaneList);
			const newTargetPaneList = updateTargetPaneList(newLinkPaneList, prevTargetPaneList);
			const newTimelineSliderState = updateTimelineSliderState(newLinkPaneList);
			const newVisualizationPaneList = updateVisualizationPaneList(newLinkPaneList, newSourcePaneList, newTargetPaneList, newTimelineSliderState);
			const newDetailPaneState = updateDetailPaneState(timeSeriesDataList, newVisualizationPaneList, prevDetailPaneState);

			return { ...prevState,
				linkPane: { list: newLinkPaneList },
				sourcePane: { list: newSourcePaneList },
				targetPane: { list: newTargetPaneList },
				timelineSlider: newTimelineSliderState,
				visualizationPane: { list: newVisualizationPaneList },
				detailPane: newDetailPaneState
			};
		}

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
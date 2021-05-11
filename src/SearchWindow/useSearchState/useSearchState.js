import $ from 'jquery';
import { useReducer, useEffect, useCallback } from 'react';
import { 
	searchCountryListByQuery,
	getPrevSelectionIndex,
	getCurrSelectionIndex,
	getNextSelectionIndex,
	getSelectedCountryName
} from './updateSearchWindowHeader';
import { 
	findMostSimilarCountry,
	generateTimeSeriesSearchResultList,
	generateLinkSearchResultList,
	filterTimeSeriesSearchResult,
	selectFilterAttrName,
	selectFilterAttrValue
} from './updateSearchWindowContent';

const initialState = {
	source: { query: '', list: [], listTop: null, listLeft: null },
	target: { query: '', list: [], listTop: null, listLeft: null },
	content: null, // inferredSourceName, inferredTargetName, timeSeriesSearchResultList, linkSearchResultList
	isLoading: false
};

const reducer = (prevState, dataState, action) => {
	switch (action.type) {
		case 'INPUT_SOURCE_QUERY': {
			const { inputEl } = action;
			const { nodeList } = dataState;
			const inputBBox = inputEl.getBoundingClientRect();
			const countryNameList = nodeList.map(row => row.name);

			return { ...prevState, source: {
				query: inputEl.value,
				listLeft: inputBBox.left,
				listTop: inputBBox.top + inputBBox.height + 20,
				list: searchCountryListByQuery(countryNameList, inputEl.value)
			}, target: { ...prevState.target, list: [] } }; // remove target list
		}
		case 'INPUT_TARGET_QUERY': {
			const { inputEl } = action;
			const { nodeList } = dataState;
			const inputBBox = inputEl.getBoundingClientRect();
			const countryNameList = nodeList.map(row => row.name);
			
			return { ...prevState, target: {
				query: inputEl.value,
				listLeft: inputBBox.left,
				listTop: inputBBox.top + inputBBox.height + 20,
				list: searchCountryListByQuery(countryNameList, inputEl.value)
			}, source: { ...prevState.source, list: [] } }; // remove source list
		}
		case 'REMOVE_COUNTRY_LIST': {
			return { ...prevState, 
				source: { ...prevState.source , list: [] },
				target: { ...prevState.target , list: [] }
			};
		}
		case 'CLICK_COUNTRY_NAME': {
			const { sourceOrTarget, countryName } = action;

			return { ...prevState, [ sourceOrTarget ]: {
				query: countryName, list: [], listTop: null, listLeft: null
			} };
		}
		case 'MOUSE_ENTER_COUNTRY_NAME': {
			const { sourceOrTarget, countryName } = action;

			return { ...prevState, [ sourceOrTarget ]: { ...prevState[sourceOrTarget],
				list: prevState[sourceOrTarget].list.map(countryObject => 
					countryObject.countryName !== countryName ? 
						{ ...countryObject, selected: false } : 
						{ ...countryObject, selected: true })
			} };
		}
		case 'MOUSE_LEAVE_COUNTRY_NAME': {
			const { sourceOrTarget, countryName } = action;

			return { ...prevState, [ sourceOrTarget ]: { ...prevState[sourceOrTarget],
				list: prevState[sourceOrTarget].list.map(countryObject => 
					countryObject.countryName !== countryName ? countryObject : 
						{ ...countryObject, selected: false })
			} };
		}
		case 'START_SEARCHING': {
			return { ...prevState, 
				source: { ...prevState.source , list: [] },
				target: { ...prevState.target , list: [] },
				isLoading: true 
			}; // clear list
		}
		case 'FINISH_SEARCHING': {
			const { 
				inferredSourceName,
				inferredTargetName,
				timeSeriesSearchResultList,
				linkSearchResultList
			} = action;

			return { ...prevState,
				content: {
					inferredSourceName,
					inferredTargetName,
					timeSeriesSearchResultList,
					linkSearchResultList
				},
				isLoading: false
			};
		}
		case 'PRESS_ARROW_UP': {
			const sourceListIsShown = prevState.source.list.length > 0;
			const sourceOrTarget = sourceListIsShown ? 'source' : 'target';
			const currSelectionIndex = getCurrSelectionIndex(prevState[sourceOrTarget].list);
			const prevSelectionIndex = getPrevSelectionIndex(currSelectionIndex);

			return { ...prevState, [ sourceOrTarget ]: { ...prevState[sourceOrTarget],
				list: prevState[sourceOrTarget].list.map((countryObject, index) => 
					index !== prevSelectionIndex ? 
					{ ...countryObject, selected: false } :
					{ ...countryObject, selected: true })
			} };
		}
		case 'PRESS_ARROW_DOWN': {
			const { el } = action;
			const { nodeList } = dataState;
			const sourceInputIsFocused = $(el).closest('.source.input-box').length > 0;
			const targetInputIsFocused = $(el).closest('.target.input-box').length > 0;
			const sourceListIsShown = prevState.source.list.length > 0;
			const targetListIsShown = prevState.target.list.length > 0;

			// either one is shown
			if (sourceListIsShown || targetListIsShown) {
				const sourceOrTarget = sourceListIsShown ? 'source' : 'target';
				const currSelectionIndex = getCurrSelectionIndex(prevState[sourceOrTarget].list);
				const nextSelectionIndex = getNextSelectionIndex(currSelectionIndex);

				return { ...prevState, [ sourceOrTarget ]: { ...prevState[sourceOrTarget],
					list: prevState[sourceOrTarget].list.map((countryObject, index) => 
						index !== nextSelectionIndex ? 
						{ ...countryObject, selected: false } :
						{ ...countryObject, selected: true })
				} };
			}

			// none is shown but focus on source input
			if (!sourceListIsShown && !targetListIsShown && sourceInputIsFocused) {
				const sourceInputEl = $(el).closest('input')[0];
				const inputBBox = sourceInputEl.getBoundingClientRect();
				const countryNameList = nodeList.map(row => row.name);
				
				return { ...prevState, source: {
					query: sourceInputEl.value,
					listLeft: inputBBox.left,
					listTop: inputBBox.top + inputBBox.height + 20,
					list: searchCountryListByQuery(countryNameList, sourceInputEl.value)
				} };
			}

			// none is shown but focus on target input
			if (!sourceListIsShown && !targetListIsShown && targetInputIsFocused) {
				const targetInputEl = $(el).closest('input')[0];
				const inputBBox = targetInputEl.getBoundingClientRect();
				const countryNameList = nodeList.map(row => row.name);

				return { ...prevState, target: {
					query: targetInputEl.value,
					listLeft: inputBBox.left,
					listTop: inputBBox.top + inputBBox.height + 20,
					list: searchCountryListByQuery(countryNameList, targetInputEl.value)
				} };
			}

			return prevState;
		}
		case 'PRESS_ENTER': {
			const sourceListIsShown = prevState.source.list.length > 0;
			const targetListIsShown = prevState.target.list.length > 0;

			// try to enter selection to input box if list is open
			if (sourceListIsShown || targetListIsShown) {
				const sourceOrTarget = sourceListIsShown ? 'source' : 'target';
				const selectedCountryName = getSelectedCountryName(prevState[sourceOrTarget].list);

				if (selectedCountryName !== null)
					return { ...prevState, [ sourceOrTarget ]: {
						list: [], listTop: null, listLeft: null,
						query: selectedCountryName === null 
							 ? prevState[sourceOrTarget].query 
							 : selectedCountryName
					} };
			}

			// start searching and clear list
			return { ...prevState, 
				source: { ...prevState.source, list: [] },
				target: { ...prevState.target, list: [] },
				isLoading: true 
			};
		}
		case 'FILTER_TIME_SERIES_SEARCH_RESULT': {
			const { searchResultKey, filterStartYear, filterEndYear } = action;
			const { content: { timeSeriesSearchResultList: prevTimeSeriesSearchResultList } } = prevState;
			const newTimeSeriesSearchResultList = filterTimeSeriesSearchResult(
				prevTimeSeriesSearchResultList,
				searchResultKey,
				filterStartYear,
				filterEndYear
			);

			return { ...prevState,
				content: { ...prevState.content, 
					timeSeriesSearchResultList: newTimeSeriesSearchResultList
				}
			};
		}
		case 'SELECT_FILTER_ATTRIBUTE_NAME': {
			const { searchResultKey, filterAttrName } = action;
			const { content: { linkSearchResultList: prevLinkSearchResultList } } = prevState;
			const { countryIDToData } = dataState;
			const newLinkSearchResultList = selectFilterAttrName(
				prevLinkSearchResultList,
				searchResultKey,
				filterAttrName,
				countryIDToData
			);

			return { ...prevState,
				content: { ...prevState.content, 
					linkSearchResultList: newLinkSearchResultList
				}
			};
		}
		case 'SELECT_FILTER_ATTRIBUTE_VALUE': {
			const { searchResultKey, filterAttrName, filterAttrValue } = action;
			const { content: { linkSearchResultList: prevLinkSearchResultList } } = prevState;
			const { countryIDToData } = dataState;
			const newLinkSearchResultList = selectFilterAttrValue(
				prevLinkSearchResultList,
				searchResultKey,
				filterAttrName,
				filterAttrValue,
				countryIDToData
			);

			return { ...prevState,
				content: { ...prevState.content, 
					linkSearchResultList: newLinkSearchResultList
				}
			};
		}
		default: {
			throw new Error(`Unhandled action type: ${ action.type }`);
		}
	}
};

export const useSearchState = (interfaceState, dataState) => {
	const memoizedReducer = useCallback((prevState, action) => 
		reducer(prevState, dataState, action), [ dataState ]);
	const [ searchState, searchDispatch ] = useReducer(memoizedReducer, initialState);

	const { 
		searchWindowIsOpen 
	} = interfaceState;
	const { 
		nodeList,
		linkDataList, 
		countryIDToData, 
		timeSeriesDataList 
	} = dataState;
	const { 
		isLoading: searchWindowIsLoading,
		source: { query: sourceQuery },
		target: { query: targetQuery }
	} = searchState;

	useEffect(() => {
		// when not click on certain targets, dispatch blur event
		const handleClickSearchWindow = event => {
			const targetItemList = [
				'#search-window .close-button',
				'#search-window .input-box',
				'#search-window .country-list',
				'#search-window .search-button'
			];
			let clickedOnTargets = false;

			for (let target of targetItemList)
				if ($(event.target).closest(target).length > 0) {
					clickedOnTargets = true; break;
				}
			if (!clickedOnTargets)
				searchDispatch({ type: 'REMOVE_COUNTRY_LIST' });
		};

		// handle key down
		const handleKeyDown = event => {
			if (event.key === 'ArrowUp') searchDispatch({ type: 'PRESS_ARROW_UP' });
			if (event.key === 'ArrowDown') searchDispatch({ type: 'PRESS_ARROW_DOWN', el: event.target });
			if (event.key === 'Enter') {
				document.activeElement.blur();
				searchDispatch({ type: 'PRESS_ENTER' });
			}
		};

		// to be safe, remove all before install
		if (searchWindowIsOpen) {
			$('#search-window').off('click').on('click', handleClickSearchWindow);
			$(document).off('keydown').on('keydown', handleKeyDown);
		}

		// remove all when close search window
		return () => {
			if (searchWindowIsOpen) {
				$('#search-window').off('click');
				$(document).off('keydown');
			}
		};
	}, [ searchWindowIsOpen ]);

	useEffect(() => {
		if (!searchWindowIsLoading)
			return;

		const { 
			ID: sourceID,
			countryName: inferredSourceName
		} = findMostSimilarCountry(nodeList, sourceQuery);
		const {
			ID: targetID,
			countryName: inferredTargetName
		} = findMostSimilarCountry(nodeList, targetQuery);
		const timeSeriesSearchResultList = generateTimeSeriesSearchResultList(
			sourceID, targetID,
			countryIDToData, // generate description
			timeSeriesDataList // generate chart
		);
		const linkSearchResultList = generateLinkSearchResultList(
			sourceID, targetID,
			countryIDToData,
			linkDataList
		);

		setTimeout(() => { // hack to allow loading
			searchDispatch({ 
				type: 'FINISH_SEARCHING',
				inferredSourceName,
				inferredTargetName,
				timeSeriesSearchResultList,
				linkSearchResultList
			});
		}, 100);
	}, [
		searchWindowIsLoading,
		sourceQuery, 
		targetQuery,
		nodeList,
		linkDataList,
		countryIDToData,
		timeSeriesDataList
	]);

	return [ searchState, searchDispatch ];
};
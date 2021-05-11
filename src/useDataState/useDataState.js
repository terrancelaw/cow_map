import { useEffect, useReducer } from 'react';
import { loadMapData } from './loadMapData';
import { loadLinkData } from './loadLinkData';
import { loadNodeData } from './loadNodeData';
import { loadTimeSeriesData } from './loadTimeSeriesData';

const checkIfIsLoading = ({
	landData,
	interiorData,
	linkDataList,
	nodeList,
	countryIDToData,
	timeSeriesDataList
}) => 
	landData === null ||
	interiorData === null ||
	linkDataList === null ||
	nodeList === null ||
	countryIDToData === null ||
	timeSeriesDataList === null;

const initialState = {
	landData: null,
	interiorData: null,
	linkDataList: null,
	nodeList: null,
	countryIDToData: null,
	timeSeriesDataList: null,
	isLoading: true
};

const reducer = (prevState, action) => {
	switch (action.type) {
		case "LOAD_DATA":
			return { 
				...prevState, 
				...action.data,
				isLoading: checkIfIsLoading({ 
					...prevState, 
					...action.data 
				})
			};
		default: 
			throw new Error(`Unhandled action type: ${ action.type }`);
	}
};

export const useDataState = () => {
	const [ dataState, dispatch ] = useReducer(reducer, initialState);

	useEffect(() => {
		loadMapData(dispatch);
		loadLinkData(dispatch);
		loadNodeData(dispatch);
		loadTimeSeriesData(dispatch);
	}, []);

	return [ dataState, dispatch ];
};
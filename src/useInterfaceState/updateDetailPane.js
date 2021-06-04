export const checkIsDirected = linkList => {
	for (let { isDirected } of linkList)
		if (!isDirected) return false;

	return true;
};

export const checkIsWeighted = linkList => {
	for (let { isWeighted } of linkList)
		if (!isWeighted) return false;

	return true;
};

export const checkIsNetworkMetric = option => [ 
	'Degree', 
	'In Degree', 
	'Out Degree', 
	'Closeness', 
	'Betweenness', 
	'Eigenvector', 
	'PageRank' 
].indexOf(option) !== -1;

const generateMainOptionList = (timeSeriesDataList, isDirected, isWeighted) => {
	const mainOptionList = [];

	for (let { metadata: { displayName } } of timeSeriesDataList)
		mainOptionList.push(displayName);

	if (!isDirected) 
		return [ ...mainOptionList, 
			'Degree',
			'Closeness',
			'Betweenness',
			'Eigenvector',
		];
	if (isDirected && !isWeighted)
		return [ ...mainOptionList,
			'Degree',
			'In Degree',
			'Out Degree',
			'Closeness',
			'Betweenness',
			'Eigenvector',
			'PageRank'
		];
	if (isDirected && isWeighted)
		return [ ...mainOptionList,
			'Degree',
			'In Degree',
			'Out Degree',
			'Closeness',
			'Betweenness',
			'Eigenvector'
		]; // remove page rank
};

export const generateSubOption1List = (timeSeriesDataList, mainOption, isDirected) => {
	const isNetworkMetric = checkIsNetworkMetric(mainOption);
	const isTimeSeries = !isNetworkMetric;

	if (isTimeSeries)
		return timeSeriesDataList.filter(({ metadata: { displayName } }) => 
			displayName === mainOption)[0].metadata.yearList;

	switch (mainOption) {
		case 'Closeness': 
		case 'Betweenness': {
			return isDirected ? [ 'directed', 'undirected' ] : [ 'undirected' ];
		}
		// only available for directed
		case 'In Degree':
		case 'Out Degree':
		case 'PageRank': {
			return [ 'directed' ];
		}
		// only available for undirected
		case 'Degree':
		case 'Eigenvector': {
			return [ 'undirected' ];
		}
		default: {
			throw new Error(`Unhandled option: ${ mainOption }`);
		}
	}
};

export const generateSubOption2List = (timeSeriesDataList, mainOption, isWeighted) => {
	const isNetworkMetric = checkIsNetworkMetric(mainOption);
	const isTimeSeries = !isNetworkMetric;

	if (isTimeSeries)
		return timeSeriesDataList.filter(({ metadata: { displayName } }) => 
			displayName === mainOption)[0].metadata.yearList;

	switch (mainOption) {
		case 'Closeness': 
		case 'Betweenness': 
		case 'Eigenvector': {
			return isWeighted ? [ 'weighted', 'unweighted' ] : [ 'unweighted' ];
		}
		// only available for unweighted
		case 'Degree':
		case 'In Degree':
		case 'Out Degree':
		case 'PageRank': {
			return [ 'unweighted' ];
		}
		default: {
			throw new Error(`Unhandled option: ${ mainOption }`);
		}
	}
};

const generateMainOption = (optionList, prevOption) => 
	optionList.indexOf(prevOption) === -1 ? optionList[0] : prevOption;

const generateSubOption1 = (optionList, prevOption) => 
	optionList.indexOf(prevOption) === -1 ? optionList[0] : prevOption;

const generateSubOption2 = (mainOption, optionList, prevOption) => {
	const isNetworkMetric = checkIsNetworkMetric(mainOption);
	const foundPrevOptionInList = optionList.indexOf(prevOption) !== -1;

	if (!isNetworkMetric && foundPrevOptionInList) return prevOption;
	if (!isNetworkMetric && !foundPrevOptionInList) return optionList[optionList.length - 1];
	if (isNetworkMetric && foundPrevOptionInList) return prevOption;
	if (isNetworkMetric && !foundPrevOptionInList) return optionList[0];
};

// called when linkList changes
// not called when changing main option
export const updateDetailPaneState = (
	linkList,
	timeSeriesDataList,
	prevDetailPaneState
) => {
	const { 
		isOpen: detailPaneIsOpen,
		mainOption: prevMainOption,
		subOption1: prevSubOption1,
		subOption2: prevSubOption2,
	} = prevDetailPaneState;

	// when closed no need to compute
	if (!detailPaneIsOpen)
		return prevDetailPaneState;

	// compute state when opened
	if (detailPaneIsOpen) {
		const isDirected = checkIsDirected(linkList);
		const isWeighted = checkIsWeighted(linkList);
		const newMainOptionList = generateMainOptionList(timeSeriesDataList, isDirected, isWeighted);
		const newMainOption = generateMainOption(newMainOptionList, prevMainOption);
		const newSubOption1List = generateSubOption1List(timeSeriesDataList, newMainOption, isDirected);
		const newSubOption1 = generateSubOption1(newSubOption1List, prevSubOption1);
		const newSubOption2List = generateSubOption2List(timeSeriesDataList, newMainOption, isWeighted);
		const newSubOption2 = generateSubOption2(newMainOption, newSubOption2List, prevSubOption2);

		return {
			isOpen: detailPaneIsOpen,
			mainOption: newMainOption,
			mainOptionList: newMainOptionList,
			subOption1: newSubOption1,
			subOption1List: newSubOption1List,
			subOption2: newSubOption2,
			subOption2List: newSubOption2List
		};
	}
};

export const checkIsOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) => 
	scrollHeight > clientHeight || scrollWidth > clientWidth;
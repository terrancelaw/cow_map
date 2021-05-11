import { scaleLinear, line, curveBasis, extent } from 'd3';
import { bilateralLineChart, nonBilateralLineChart } from '../SearchWindowContent/LineChart';
import { computeWordDistance } from './updateSearchWindowHeader';

// helpers

const setYScaleDomain = (yScale, timeSeriesList) => {
	const [ min, max ] = extent(timeSeriesList, d => d.value);

	yScale.domain([ min, max ]);
};

export const findMostSimilarCountry = (countryList, query) => {
	if (query === '')
		return { ID: null, countryName: null };

	const lowerCaseQuery = query.toLowerCase().replace(/\s+/g, '');
	const sortedCountryList = []; // { ID, countryName, wordDistance }

	for (let { name: countryName, ID } of countryList) {
		const lowerCaseCountryName = countryName.toLowerCase().replace(/\s+/g, '');
		const wordDistance = computeWordDistance(lowerCaseCountryName, lowerCaseQuery);
		sortedCountryList.push({ ID, countryName, wordDistance });
	}

	return sortedCountryList
		.sort((a, b) => a.wordDistance - b.wordDistance)[0];
};

const generateTableRowList = (
	filteredLinkRowList,
	dataTableAttrList,
	countryIDToData
) => {
	const tableRowList = [];

	for (let linkRowObject of filteredLinkRowList) {
		let rowString = '';

		for (let { attributeName, isID } of dataTableAttrList) {
			let attributeValue = linkRowObject[attributeName];

			if (attributeValue === '')
				attributeValue = 'null';
			else if (isID)
				attributeValue = countryIDToData[attributeValue].displayName;

			rowString += `<div class="cell">${ attributeValue }</div>`;
		}

		rowString = `<div class="row">${ rowString }</div>`;
		tableRowList.push(rowString);
	}

	return tableRowList;
};

/* generateTimeSeriesSearchResultList */

const filterIDToTimeSeriesList = (
	querySourceID, queryTargetID, 
	IDToTimeSeriesList,
	isBilateral
) => {
	const filteredIDToTimeSeriesList = {};

	if (isBilateral)
		for (let sourceTargetID in IDToTimeSeriesList) {
			const [ currSourceID, currTargetID ] = sourceTargetID.split('-');
			const sourceIsMatched = querySourceID === null || querySourceID === currSourceID;
			const targetIsMatched = queryTargetID === null || queryTargetID === currTargetID;

			if (sourceIsMatched && targetIsMatched)
				filteredIDToTimeSeriesList[sourceTargetID] = IDToTimeSeriesList[sourceTargetID]
					.filter(({ value }) => value !== null && value !== 0); // filter zero to avoid inf
		}

	else if (!isBilateral) {
		if (querySourceID !== null && querySourceID in IDToTimeSeriesList)
			filteredIDToTimeSeriesList[querySourceID] = IDToTimeSeriesList[querySourceID]
				.filter(({ value }) => value !== null && value !== 0); // filter zero to avoid inf

		if (queryTargetID !== null && queryTargetID in IDToTimeSeriesList)
			filteredIDToTimeSeriesList[queryTargetID] = IDToTimeSeriesList[queryTargetID]
				.filter(({ value }) => value !== null && value !== 0); // filter zero to avoid inf
	}

	return filteredIDToTimeSeriesList;
};

export const generateTimeSeriesSearchResultList = (
	sourceID, targetID, 
	countryIDToData,
	timeSeriesDataList
) => {
	if (sourceID === null && targetID === null)
		return [];

	const timeSeriesSearchResultList = []; 
	/*  
		sectionHeaderText, 
		isBilateral, 
		lineChartList,
		filterYearList,
		filterStartYear, 
		filterEndYear
	*/

	for (let timeSeriesDataObject of timeSeriesDataList) {
		const lineChartList = [];
		const IDToTimeSeriesList = timeSeriesDataObject.data;
		const { isBilateral, yearList, displayName, metricName } = timeSeriesDataObject.metadata;
		const { width, height, margin } = isBilateral ? bilateralLineChart : nonBilateralLineChart;
		const filteredIDToTimeSeriesList = filterIDToTimeSeriesList(
			sourceID, 
			targetID, 
			IDToTimeSeriesList,
			isBilateral
		);
		const xScale = scaleLinear()
			.domain([ yearList[0], yearList[yearList.length - 1] ])
			.range([ 0, width - margin.left - margin.right ]);
		const yScale = scaleLinear()
			.range([ height - margin.top - margin.bottom, 0 ]);
		const pathGenerator = line()
			.curve(curveBasis)
	    	.x(d => xScale(d.year))
	    	.y(d => yScale(d.value));

	    // create lineChartList
	    for (let ID in filteredIDToTimeSeriesList) {
	    	if (filteredIDToTimeSeriesList[ID].length === 0) continue; // not include empty time series
	    	setYScaleDomain(yScale, filteredIDToTimeSeriesList[ID]); // set for each loop

	    	const timeSeriesList = filteredIDToTimeSeriesList[ID];
	    	const startValue = timeSeriesList[0].value;
    		const endValue = timeSeriesList[timeSeriesList.length - 1].value;
    		const percentChange = (endValue - startValue) / Math.abs(startValue);

    		const pathData = pathGenerator(timeSeriesList);
			const startYear = timeSeriesList[0].year;
			const endYear = timeSeriesList[timeSeriesList.length - 1].year;
			const startX = xScale(startYear), endX = xScale(endYear);
			const startY = yScale(startValue), endY = yScale(endValue);

			if (isBilateral) {
				const [ sourceID, targetID ] = ID.split('-');
				const sourceName = countryIDToData[sourceID].displayName;
    			const targetName = countryIDToData[targetID].displayName;
    			const titleText = `${ sourceName } → ${ targetName }`;

    			lineChartList.push({
					key: ID,
					titleText,
					startYear, endYear,
					startX, endX,
					startY, endY,
					pathData, percentChange,
					timeSeriesList // for filtering
				});
			}
			else if (!isBilateral) {
				const nodeID = ID;
				const countryName = countryIDToData[nodeID].displayName;

				lineChartList.push({
					key: ID,
					countryName, metricName,
					startValue, endValue,
					startYear, endYear,
					startX, endX,
					startY, endY,
					pathData, percentChange,
					timeSeriesList // for filtering
				});
			}
	    }

	    // push only if there are charts to show
	    if (lineChartList.length > 0)
	    	timeSeriesSearchResultList.push({
	    		key: displayName,
	    		sectionHeaderText: displayName,
	    		isBilateral: isBilateral,
	    		filterYearList: yearList,
	    		filterStartYear: yearList[0],
	    		filterEndYear: yearList[yearList.length - 1],
	    		lineChartList: lineChartList
	    			.sort((a, b) => b.percentChange - a.percentChange)
	    	});
	}

	return timeSeriesSearchResultList;
};

/* generateLinkSearchResultList */

const filterRawLinkRowList = (
	querySourceID, queryTargetID,
	rawLinkRowList, isDirected
) => {
	const filteredLinkRowList = [];

	for (let linkRowObject of rawLinkRowList) {
		if (isDirected) {
			const currSourceID = linkRowObject.node1;
			const currTargetID = linkRowObject.node2;
			const sourceMatched = querySourceID === null || querySourceID === currSourceID;
			const targetMatched = queryTargetID === null || queryTargetID === currTargetID;

			if (sourceMatched && targetMatched)
				filteredLinkRowList.push(linkRowObject);
		}

		else if (!isDirected) {
			const currNode1ID = linkRowObject.node1;
			const currNode2ID = linkRowObject.node2;

			const hasSourceQuery = querySourceID !== null;
			const hasTargetQuery = queryTargetID !== null;
			const sourceMatchedNode1 = querySourceID === currNode1ID;
			const sourceMatchedNode2 = querySourceID === currNode2ID;
			const targetMatchedNode1 = queryTargetID === currNode1ID;
			const targetMatchedNode2 = queryTargetID === currNode2ID;

			const selectionCriteria1 = hasSourceQuery && !hasTargetQuery && (sourceMatchedNode1 || sourceMatchedNode2);
			const selectionCriteria2 = !hasSourceQuery && hasTargetQuery && (targetMatchedNode1 || targetMatchedNode2);
			const selectionCriteria3 = hasSourceQuery && hasTargetQuery && (sourceMatchedNode1 && targetMatchedNode2);
			const selectionCriteria4 = hasSourceQuery && hasTargetQuery && (targetMatchedNode1 && sourceMatchedNode2);

			if (selectionCriteria1 || selectionCriteria2 || selectionCriteria3 || selectionCriteria4)
				filteredLinkRowList.push(linkRowObject);
		}
	}

	return filteredLinkRowList;
};

export const generateLinkSearchResultList = (
	sourceID, targetID,
	countryIDToData,
	linkDataList
) => {
	if (sourceID === null && targetID === null)
		return [];

	const linkSearchResultList = []; 
	/*
		tableName,
		tableHeaderText,
		tableRowList,
		attributeList,
		linkRowList,
		filterAttrNameList,
		filterAttrValueList,
		filterAttrName,
		filterAttrValue
	*/

	for (let linkDataObject of linkDataList) {
		const rawLinkRowList = linkDataObject.data;
		const { 
			linkType, 
			displayName, 
			isDirected,
			dataTable
		} = linkDataObject.metadata;
		const filteredLinkRowList = filterRawLinkRowList(
			sourceID, 
			targetID, 
			rawLinkRowList, 
			isDirected
		);

		// push only if have rows in table
		if (filteredLinkRowList.length > 0) {
			const tableName = `${ linkType }-table`;
			const tableHeaderText = `${ displayName } (${ filteredLinkRowList.length } ${ filteredLinkRowList.length === 1 ? 'row' : 'rows' })`;
			const attributeList = dataTable.attributeList.map(attribute => attribute.displayName);
			const filterAttrNameList = [ { key: 'none', attributeName: null, displayName: 'None', isID: false } ];
			const tableRowList = generateTableRowList(filteredLinkRowList, dataTable.attributeList, countryIDToData);

			for (let { attributeName, displayName, isID } of dataTable.attributeList)
				filterAttrNameList.push({ key: attributeName, attributeName, displayName, isID });

			linkSearchResultList.push({ 
				key: tableName,
				linkRowList: filteredLinkRowList,
				displayName: displayName, // for filtering
				dataTableAttrList: dataTable.attributeList, // for filtering
				filterAttrNameList: filterAttrNameList,
				filterAttrValueList: [],
				filterAttrName: filterAttrNameList[0],
				filterAttrValue: '', 
				tableName,
				tableHeaderText,
				attributeList,
				tableRowList
			});
		}
	}

	return linkSearchResultList;
};

/* filterTimeSeriesSearchResult */

export const filterTimeSeriesSearchResult = (
	prevTimeSeriesSearchResultList,
	searchResultKey,
	filterStartYear,
	filterEndYear
) => {
	const newTimeSeriesSearchResultList = [ ...prevTimeSeriesSearchResultList ];

	for (let timeSeriesSearchResultObject of newTimeSeriesSearchResultList)
		if (timeSeriesSearchResultObject.key === searchResultKey) {
			const prevLineChartList = timeSeriesSearchResultObject.lineChartList;
			const isBilateral = timeSeriesSearchResultObject.isBilateral;

			const { width, height, margin } = isBilateral ? bilateralLineChart : nonBilateralLineChart;
			const newLineChartList = [];

			const xScale = scaleLinear()
				.domain([ filterStartYear, filterEndYear ].sort((a, b) => a - b))
				.range([ 0, width - margin.left - margin.right ]);
			const yScale = scaleLinear()
				.range([ height - margin.top - margin.bottom, 0 ]);
			const pathGenerator = line()
				.curve(curveBasis)
		    	.x(d => xScale(d.year))
		    	.y(d => yScale(d.value));

			for (let lineChartObject of prevLineChartList) {
				const filteredTimeSeriesList = lineChartObject.timeSeriesList
					.filter(({ year }) => 
						(year >= filterStartYear && year <= filterEndYear) ||
						(year >= filterEndYear && year <= filterStartYear));

				if (filteredTimeSeriesList.length === 0) continue; // not include empty time series
				setYScaleDomain(yScale, filteredTimeSeriesList); // set for each loop
				
				lineChartObject.startValue = filteredTimeSeriesList[0].value;
				lineChartObject.endValue = filteredTimeSeriesList[filteredTimeSeriesList.length - 1].value;
				lineChartObject.startYear = filteredTimeSeriesList[0].year;
				lineChartObject.endYear = filteredTimeSeriesList[filteredTimeSeriesList.length - 1].year;
				lineChartObject.startX = xScale(lineChartObject.startYear);
				lineChartObject.endX = xScale(lineChartObject.endYear);
				lineChartObject.startY = yScale(lineChartObject.startValue);
				lineChartObject.endY = yScale(lineChartObject.endValue);
				lineChartObject.pathData = pathGenerator(filteredTimeSeriesList);
				lineChartObject.percentChange = (lineChartObject.endValue - lineChartObject.startValue) / Math.abs(lineChartObject.startValue);
				newLineChartList.push(lineChartObject);
			}

			timeSeriesSearchResultObject.lineChartList = newLineChartList
				.sort((a, b) => b.percentChange - a.percentChange);
			timeSeriesSearchResultObject.filterStartYear = filterStartYear;
			timeSeriesSearchResultObject.filterEndYear = filterEndYear;
		}

	return newTimeSeriesSearchResultList;
};

/* filterLinkSearchResult */

const generateFilterAttrValueList = (linkRowList, { attributeName, isID }, countryIDToData) => {
	const attributeValueSet = new Set();
	const filterAttrValueList = [];

	for (let linkRowObject of linkRowList)
		attributeValueSet.add(linkRowObject[attributeName]);

	for (let attributeValue of attributeValueSet) {
		let displayName = attributeValue;

		if (isID) displayName = countryIDToData[attributeValue].displayName;
		if (attributeValue === '') displayName = 'null';

		filterAttrValueList.push({ 
			key: attributeValue, attributeValue, displayName 
		});
	}

	return filterAttrValueList;
};

export const selectFilterAttrName = (
	prevLinkSearchResultList,
	searchResultKey,
	filterAttrName,
	countryIDToData
) => {
	const newLinkSearchResultList = [ ...prevLinkSearchResultList ];

	for (let linkSearchResultObject of newLinkSearchResultList)
		if (linkSearchResultObject.key === searchResultKey) {

			// selected same option
			if (linkSearchResultObject.filterAttrName.key === filterAttrName.key) break;

			// selected none
			if (filterAttrName.attributeName === null) {
				const displayName = linkSearchResultObject.displayName;
				const dataTableAttrList = linkSearchResultObject.dataTableAttrList;
				const linkRowList = linkSearchResultObject.linkRowList;

				linkSearchResultObject.filterAttrValueList = [];
				linkSearchResultObject.filterAttrName = filterAttrName;
				linkSearchResultObject.filterAttrValue = '';
				linkSearchResultObject.tableHeaderText = `${ displayName } (${ linkRowList.length } ${ linkRowList.length === 1 ? 'row' : 'rows' })`;
				linkSearchResultObject.tableRowList = generateTableRowList(linkRowList, dataTableAttrList, countryIDToData);
			}

			// selected different option
			else if (filterAttrName.attributeName !== null) {
				const displayName = linkSearchResultObject.displayName;
				const dataTableAttrList = linkSearchResultObject.dataTableAttrList;
				const linkRowList = linkSearchResultObject.linkRowList;

				const filterAttrValueList = generateFilterAttrValueList(linkRowList, filterAttrName, countryIDToData);
				const filterAttrValue = filterAttrValueList[0];

				const filteredLinkRowList = linkRowList.filter(linkRowObject => 
					linkRowObject[filterAttrName.attributeName] === filterAttrValue.attributeValue);
				const tableHeaderText = `${ displayName } (${ filteredLinkRowList.length } ${ filteredLinkRowList.length === 1 ? 'row' : 'rows' })`;
				const tableRowList = generateTableRowList(filteredLinkRowList, dataTableAttrList, countryIDToData);

				linkSearchResultObject.filterAttrValueList = filterAttrValueList;
				linkSearchResultObject.filterAttrName = filterAttrName;
				linkSearchResultObject.filterAttrValue = filterAttrValue;
				linkSearchResultObject.tableHeaderText = tableHeaderText;
				linkSearchResultObject.tableRowList = tableRowList;
			}
		}

	return newLinkSearchResultList;
};

export const selectFilterAttrValue = (
	prevLinkSearchResultList,
	searchResultKey,
	filterAttrName,
	filterAttrValue,
	countryIDToData
) => {
	const newLinkSearchResultList = [ ...prevLinkSearchResultList ];

	for (let linkSearchResultObject of newLinkSearchResultList)
		if (linkSearchResultObject.key === searchResultKey) {

			// selected same option
			if (linkSearchResultObject.filterAttrValue.key === filterAttrValue.key) break;

			// selected different option
			const displayName = linkSearchResultObject.displayName;
			const dataTableAttrList = linkSearchResultObject.dataTableAttrList;
			const linkRowList = linkSearchResultObject.linkRowList;

			const filteredLinkRowList = linkRowList.filter(linkRowObject => 
				linkRowObject[filterAttrName.attributeName] === filterAttrValue.attributeValue);
			const tableHeaderText = `${ displayName } (${ filteredLinkRowList.length } ${ filteredLinkRowList.length === 1 ? 'row' : 'rows' })`;
			const tableRowList = generateTableRowList(filteredLinkRowList, dataTableAttrList, countryIDToData);

			linkSearchResultObject.filterAttrValue = filterAttrValue;
			linkSearchResultObject.tableHeaderText = tableHeaderText;
			linkSearchResultObject.tableRowList = tableRowList;
		}

	return newLinkSearchResultList;
};
import cytoscape from 'cytoscape';
import networkjs from 'networkjs';
import { scaleLinear, line, curveBasis, extent, format } from 'd3';
import { checkIsNetworkMetric } from '../../useInterfaceState/updateDetailPane';
import { width, height, margin } from './SparkLine';

// helpers

const findMaxSetSize = nodeIDToSet => {
	let maxSetSize = 0;

	for (let nodeID in nodeIDToSet)
		if (nodeIDToSet[nodeID].size > maxSetSize)
			maxSetSize = nodeIDToSet[nodeID].size;

	return maxSetSize;
};

const findMaxMetricValue = (graph, metricFunction) => {
	let maxMetricValue = 0;

	graph.nodes().forEach(node => {
		const metricValue = metricFunction(node);

		if (metricValue > maxMetricValue)
			maxMetricValue = metricValue;
	});

	return maxMetricValue;
};

const generateNodeIDSet = linkList => {
	const nodeIDSet = new Set();

	for (let { sourceID, targetID } of linkList) {
		nodeIDSet.add(sourceID);
		nodeIDSet.add(targetID);
	}

	return nodeIDSet;
};

const generateLinkIDSet = (linkList, isDirected) => {
	const linkIDSet = new Set();

	if (isDirected)
		for (let { sourceID, targetID } of linkList)
			linkIDSet.add(`${ sourceID }-${ targetID }`);

	else if (!isDirected)
		for (let { sourceID, targetID } of linkList) {
			const newSourceID = sourceID < targetID ? sourceID : targetID; // smaller one
			const newTargetID = sourceID < targetID ? targetID : sourceID; // larger one
			linkIDSet.add(`${ newSourceID }-${ newTargetID }`);
		}

	return linkIDSet;
};

const generateLinkIDToWeight = (linkList, isDirected, isWeightDistance=false) => {
	const linkIDToStatistics = {};
	const linkIDToWeight = {};

	if (isDirected)
		for (let { sourceID, targetID, linkRowList } of linkList) {
			const linkID = `${ sourceID }-${ targetID }`;

			if (!(linkID in linkIDToStatistics))
				linkIDToStatistics[linkID] = { weightSum: 0, weightCount: 0 };

			// assume weighted graph (there is weight attribute for each row)
			for (let { weight } of linkRowList)
				if (weight !== '') {
					linkIDToStatistics[linkID].weightSum += +weight;
					linkIDToStatistics[linkID].weightCount++;
				}
		}

	else if (!isDirected)
		for (let { sourceID, targetID, linkRowList } of linkList) {
			const newSourceID = sourceID < targetID ? sourceID : targetID; // smaller one
			const newTargetID = sourceID < targetID ? targetID : sourceID; // larger one
			const linkID = `${ newSourceID }-${ newTargetID }`;

			if (!(linkID in linkIDToStatistics))
				linkIDToStatistics[linkID] = { weightSum: 0, weightCount: 0 };

			// assume weighted graph (there is weight attribute for each row)
			for (let { weight } of linkRowList)
				if (weight !== '') {
					linkIDToStatistics[linkID].weightSum += +weight;
					linkIDToStatistics[linkID].weightCount++;
				}
		}

	if (isWeightDistance)
		for (let linkID in linkIDToStatistics)
			linkIDToWeight[linkID] = linkIDToStatistics[linkID].weightCount === 0 ? null :
				1 / (linkIDToStatistics[linkID].weightSum / linkIDToStatistics[linkID].weightCount);

	else if (!isWeightDistance)
		for (let linkID in linkIDToStatistics)
			linkIDToWeight[linkID] = linkIDToStatistics[linkID].weightCount === 0 ? null :
				linkIDToStatistics[linkID].weightSum / linkIDToStatistics[linkID].weightCount;

	return linkIDToWeight;
};

const generateCytoscapeGraph = (linkList, isDirected, isWeighted, isWeightDistance=false) => {
	const data = [];
	const graph = cytoscape();

	if (!isDirected && !isWeighted) {
		const nodeIDSet = generateNodeIDSet(linkList);
		const linkIDSet = generateLinkIDSet(linkList, false);

		for (let nodeID of nodeIDSet)
			data.push({ data: { id: nodeID } });
		for (let linkID of linkIDSet) {
			const [ sourceID, targetID ] = linkID.split('-');
			data.push({ data: { source: sourceID, target: targetID } });
		}
	}
	else if (!isDirected && isWeighted) {
		const nodeIDSet = generateNodeIDSet(linkList);
		const linkIDSet = generateLinkIDSet(linkList, false);
		const linkIDToWeight = generateLinkIDToWeight(linkList, false, isWeightDistance);

		for (let nodeID of nodeIDSet)
			data.push({ data: { id: nodeID } });
		for (let linkID of linkIDSet) {
			const [ source, target ] = linkID.split('-');
			const weight = linkIDToWeight[linkID];

			if (weight !== null)
				data.push({ data: { source, target, weight } });
		}
	}
	else if (isDirected && !isWeighted) {
		const nodeIDSet = generateNodeIDSet(linkList);
		const linkIDSet = generateLinkIDSet(linkList, true);

		for (let nodeID of nodeIDSet)
			data.push({ data: { id: nodeID } });
		for (let linkID of linkIDSet) {
			const [ sourceID, targetID ] = linkID.split('-');
			data.push({ data: { source: sourceID, target: targetID } });
		}
	}
	else if (isDirected && isWeighted) {
		const nodeIDSet = generateNodeIDSet(linkList);
		const linkIDSet = generateLinkIDSet(linkList, true);
		const linkIDToWeight = generateLinkIDToWeight(linkList, true, isWeightDistance);

		for (let nodeID of nodeIDSet)
			data.push({ data: { id: nodeID } });
		for (let linkID of linkIDSet) {
			const [ source, target ] = linkID.split('-');
			const weight = linkIDToWeight[linkID];

			if (weight !== null)
				data.push({ data: { source, target, weight } });
		}
	}

	graph.add(data);

	return graph;
};

const generateNetworkJSGraph = (linkList, isWeighted, isWeightDistance=false) => { // must be undirected
	const linkListForGraph = [];
	const graph = new networkjs.datastructures.Graph();

	if (isWeighted) {
		const linkIDSet = generateLinkIDSet(linkList, false);
		const linkIDToWeight = generateLinkIDToWeight(linkList, false, isWeightDistance);

		for (let linkID of linkIDSet) {
			const [ sourceID, targetID ] = linkID.split('-');
			const weight = linkIDToWeight[linkID];

			if (weight !== null)
				linkListForGraph.push([ sourceID, targetID, weight ]);
		}

		graph.add_weighted_edges_from(linkListForGraph);
	}
	else if (!isWeighted) {
		const linkIDSet = generateLinkIDSet(linkList, false);

		for (let linkID of linkIDSet) {
			const [ sourceID, targetID ] = linkID.split('-');
			linkListForGraph.push([ sourceID, targetID ]);
		}

		graph.add_edges_from(linkListForGraph);
	}

	return graph;
};

// generateTimeSeriesEntryList

const generateSourceTargetSet = linkList => {
	const sourceTargetIDSet = new Set();

	for (let { sourceID, targetID, isDirected } of linkList) {
		if (isDirected)
			sourceTargetIDSet.add(sourceID + '-' + targetID);
		else if (!isDirected) {
			sourceTargetIDSet.add(sourceID + '-' + targetID);
			sourceTargetIDSet.add(targetID + '-' + sourceID);
		}
	}

	return sourceTargetIDSet;
};

const filterIDToTimeSeriesList = (
	IDSet,
	IDToTimeSeriesList,
	startYear, endYear
) => {
	const filteredIDToTimeSeriesList = {};

	for (let ID of IDSet) {
		const timeSeriesList = (ID in IDToTimeSeriesList) ? IDToTimeSeriesList[ID] : [];
			
		filteredIDToTimeSeriesList[ID] = timeSeriesList
			.filter(({ year, value }) => 
				year >= startYear && year <= endYear && 
				value !== null && value !== 0) // filter zero to avoid inf
			.sort((a, b) => a.year - b.year);
	}

	return filteredIDToTimeSeriesList;
};

const setYScaleDomain = (yScale, timeSeriesList) => {
	const [ min, max ] = extent(timeSeriesList, d => d.value);

	yScale.domain([ min, max ]);
};

const generateTimeSeriesEntryList = (
	countryIDToData,
	timeSeriesDataList,
	linkList,
	mainOption,
	subOption1,
	subOption2
) => {
	const entryList = [];
	const { data: IDToTimeSeriesList, metadata: { isBilateral } } = 
		timeSeriesDataList.filter(({ metadata: { displayName } }) => displayName === mainOption)[0];
	const IDSet = isBilateral ? generateSourceTargetSet(linkList) : generateNodeIDSet(linkList);
	const startYear = +subOption1 < +subOption2 ? +subOption1 : +subOption2;
	const endYear = +subOption1 < +subOption2 ? +subOption2 : +subOption1;
	const filteredIDToTimeSeriesList = filterIDToTimeSeriesList(
		IDSet,
		IDToTimeSeriesList,
		startYear, endYear
	);
	const xScale = scaleLinear()
		.domain([ startYear, endYear ])
		.range([ 0, width - margin.left - margin.right ]);
	const yScale = scaleLinear()
		.range([ height - margin.top - margin.bottom, 0 ]);
	const pathGenerator = line()
		.curve(curveBasis)
    	.x(d => xScale(d.year))
    	.y(d => yScale(d.value));
    const percentFormatter = format('.0%');

    for (let ID in filteredIDToTimeSeriesList) {
    	if (filteredIDToTimeSeriesList[ID].length === 0) continue; // not include empty time series
    	setYScaleDomain(yScale, filteredIDToTimeSeriesList[ID]); // set for each loop

    	const timeSeriesList = filteredIDToTimeSeriesList[ID];
    	const startValue = timeSeriesList[0].value;
    	const endValue = timeSeriesList[timeSeriesList.length - 1].value;
    	const percentChange = (endValue - startValue) / Math.abs(startValue);
    	const contentText = percentChange > 0 
						  ? `+${ percentFormatter(percentChange) }` 
						  : percentFormatter(percentChange);

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

    		entryList.push({
				key: ID,
				itemData: { sourceID, targetID }, // for hovering
				titleText, contentText,
				startYear, endYear,
				startX, endX,
				startY, endY,
				pathData, percentChange // percentChange for sorting
			});
		}
		else if (!isBilateral) {
			const nodeID = ID;
			const titleText = countryIDToData[nodeID].displayName;

			entryList.push({
				key: ID,
				itemData: { nodeID }, // for hovering
				titleText, contentText,
				startYear, endYear,
				startX, endX,
				startY, endY,
				pathData, percentChange // percentChange for sorting
			});
		}
    }

	return entryList
		.sort((a, b) => b.percentChange - a.percentChange);
};

// generateDegreeEntryList (undirected + unweighted)

const generateNodeIDToConnectedNodeIDSet = linkList => {
	const nodeIDToConectedNodeIDSet = {};

	for (let { sourceID, targetID } of linkList) {
		if (!(sourceID in nodeIDToConectedNodeIDSet))
			nodeIDToConectedNodeIDSet[sourceID] = new Set();
		if (!(targetID in nodeIDToConectedNodeIDSet))
			nodeIDToConectedNodeIDSet[targetID] = new Set();

		nodeIDToConectedNodeIDSet[sourceID].add(targetID);
		nodeIDToConectedNodeIDSet[targetID].add(sourceID);
	}

	return nodeIDToConectedNodeIDSet;
};

const generateDegreeEntryList = (linkList, countryIDToData) => {
	const entryList = [];
	const nodeIDToConectedNodeIDSet = generateNodeIDToConnectedNodeIDSet(linkList);
	const maxDegree = findMaxSetSize(nodeIDToConectedNodeIDSet);
	const widthScale = scaleLinear()
		.domain([ 0, maxDegree ])
		.range([ 0, 100 ]); // 0% to 100%

	for (let nodeID in nodeIDToConectedNodeIDSet) {
		const nodeName = countryIDToData[nodeID].displayName;
		const degree = nodeIDToConectedNodeIDSet[nodeID].size;

		entryList.push({
			key: nodeID,
			itemData: { nodeID }, // for hovering
			titleText: nodeName,
			contentText: degree,
			width: widthScale(degree)
		});
	}

	return entryList
		.sort((a, b) => b.width - a.width);
};

// generateInDegreeEntryList (directed + unweighted)

const generateNodeIDToSourceIDSet = linkList => {
	const nodeIDToSourceIDSet = {};

	for (let { sourceID, targetID } of linkList) {
		if (!(targetID in nodeIDToSourceIDSet))
			nodeIDToSourceIDSet[targetID] = new Set();

		nodeIDToSourceIDSet[targetID].add(sourceID);
	}

	return nodeIDToSourceIDSet;
};

const generateInDegreeEntryList = (linkList, countryIDToData) => {
	const entryList = [];
	const nodeIDToSourceIDSet = generateNodeIDToSourceIDSet(linkList);
	const maxInDegree = findMaxSetSize(nodeIDToSourceIDSet);
	const widthScale = scaleLinear()
		.domain([ 0, maxInDegree ])
		.range([ 0, 100 ]); // 0% to 100%

	for (let nodeID in nodeIDToSourceIDSet) {
		const nodeName = countryIDToData[nodeID].displayName;
		const inDegree = nodeIDToSourceIDSet[nodeID].size;

		entryList.push({
			key: nodeID,
			itemData: { nodeID }, // for hovering
			titleText: nodeName,
			contentText: inDegree,
			width: widthScale(inDegree)
		});
	}

	return entryList
		.sort((a, b) => b.width - a.width);
};

// generateOutDegreeEntryList (directed + unweighted)

const generateNodeIDToTargetIDSet = linkList => {
	const nodeIDToTargetIDSet = {};

	for (let { sourceID, targetID } of linkList) {
		if (!(sourceID in nodeIDToTargetIDSet))
			nodeIDToTargetIDSet[sourceID] = new Set();

		nodeIDToTargetIDSet[sourceID].add(targetID);
	}

	return nodeIDToTargetIDSet;
};

const generateOutDegreeEntryList = (linkList, countryIDToData) => {
	const entryList = [];
	const nodeIDToTargetIDSet = generateNodeIDToTargetIDSet(linkList);
	const maxOutDegree = findMaxSetSize(nodeIDToTargetIDSet);
	const widthScale = scaleLinear()
		.domain([ 0, maxOutDegree ])
		.range([ 0, 100 ]); // 0% to 100%

	for (let nodeID in nodeIDToTargetIDSet) {
		const nodeName = countryIDToData[nodeID].displayName;
		const outDegree = nodeIDToTargetIDSet[nodeID].size;

		entryList.push({
			key: nodeID,
			itemData: { nodeID }, // for hovering
			titleText: nodeName,
			contentText: outDegree,
			width: widthScale(outDegree)
		});
	}

	return entryList
		.sort((a, b) => b.width - a.width);
};

// generateClosenessEntryList

const generateClosenessEntryList = (linkList, countryIDToData, isDirected, isWeighted) => {
	const entryList = [];
	const graph = generateCytoscapeGraph(linkList, isDirected, isWeighted, true);
	const option = !isWeighted ? { directed: isDirected } : { directed: isDirected, weight: e => e.data('weight') };
	const closenessFunction = graph.$().ccn(option);
	const maxCloseness = findMaxMetricValue(graph, closenessFunction.closeness);
	const widthScale = scaleLinear()
		.domain([ 0, maxCloseness ])
		.range([ 0, 100 ]); // 0% to 100%

	graph.nodes().forEach(node => {
		const nodeID = node.data().id;
		const nodeName = countryIDToData[nodeID].displayName;
		const closeness = closenessFunction.closeness(node);
		const contextText = Math.round((closeness + Number.EPSILON) * 100000) / 100000;

		entryList.push({
			key: nodeID,
			itemData: { nodeID }, // for hovering
			titleText: nodeName,
			contentText: contextText,
			width: widthScale(closeness)
		});
	});

	return entryList
		.sort((a, b) => b.width - a.width);
};

// generateBetweennessEntryList

const generateBetweennessEntryList = (linkList, countryIDToData, isDirected, isWeighted) => {
	const entryList = [];
	const graph = generateCytoscapeGraph(linkList, isDirected, isWeighted, true);
	const option = !isWeighted ? { directed: isDirected } : { directed: isDirected, weight: e => e.data('weight') };
	const betweennessFunction = graph.$().bc(option);
	const maxBetweenness = findMaxMetricValue(graph, betweennessFunction.betweennessNormalized);
	const widthScale = scaleLinear()
		.domain([ 0, maxBetweenness ])
		.range([ 0, 100 ]); // 0% to 100%

	graph.nodes().forEach(node => {
		const nodeID = node.data().id;
		const nodeName = countryIDToData[nodeID].displayName;
		const betweenness = betweennessFunction.betweennessNormalized(node);
		const contextText = Math.round((betweenness + Number.EPSILON) * 100000) / 100000;

		entryList.push({
			key: nodeID,
			itemData: { nodeID }, // for hovering
			titleText: nodeName,
			contentText: contextText,
			width: widthScale(betweenness)
		});
	});

	return entryList
		.sort((a, b) => b.width - a.width);
};

// generateEigenvectorEntryList (undirected)

const findMaxEigenvector = nodeIDToEigenvector => {
	let maxEigenvector = 0;

	for (let nodeID in nodeIDToEigenvector) {
		const eigenvector = nodeIDToEigenvector[nodeID];

		if (eigenvector > maxEigenvector)
			maxEigenvector = eigenvector;
	}

	return maxEigenvector;
};

const generateEigenvectorEntryList = (linkList, countryIDToData, isWeighted) => {
	const entryList = [];
	const graph = generateNetworkJSGraph(linkList, isWeighted);
	const nodeIDToEigenvector = networkjs.algorithms.centrality.eigenvector_centrality(graph);
	const maxEigenvector = findMaxEigenvector(nodeIDToEigenvector);
	const widthScale = scaleLinear()
		.domain([ 0, maxEigenvector ])
		.range([ 0, 100 ]); // 0% to 100%

	for (let nodeID in nodeIDToEigenvector) {
		const nodeName = countryIDToData[nodeID].displayName;
		const eigenvector = nodeIDToEigenvector[nodeID];
		const contextText = Math.round((eigenvector + Number.EPSILON) * 100000) / 100000;

		entryList.push({
			key: nodeID,
			itemData: { nodeID }, // for hovering
			titleText: nodeName,
			contentText: contextText,
			width: widthScale(eigenvector)
		});
	}

	return entryList
		.sort((a, b) => b.width - a.width);
};

// generatePageRankEntryList (directed + unweighted)

const generatePageRankEntryList = (linkList, countryIDToData) => {
	const entryList = [];
	const graph = generateCytoscapeGraph(linkList, true, false);
	const pageRankFunction = graph.$().pageRank();
	const maxPageRank = findMaxMetricValue(graph, pageRankFunction.rank);
	const widthScale = scaleLinear()
		.domain([ 0, maxPageRank ])
		.range([ 0, 100 ]); // 0% to 100%

	graph.nodes().forEach(node => {
		const nodeID = node.data().id;
		const nodeName = countryIDToData[nodeID].displayName;
		const pageRank = pageRankFunction.rank(node);
		const contextText = Math.round((pageRank + Number.EPSILON) * 100000) / 100000;

		entryList.push({
			key: nodeID,
			itemData: { nodeID }, // for hovering
			titleText: nodeName,
			contentText: contextText,
			width: widthScale(pageRank)
		});
	});

	return entryList
		.sort((a, b) => b.width - a.width);
};

// generateEntryList

export const generateEntryList = (
	countryIDToData,
	timeSeriesDataList,
	linkList,
	mainOption,
	subOption1,
	subOption2
) => {
	const isSelectedNetworkMetric = checkIsNetworkMetric(mainOption);
	const isSelectedTimeSeries = !isSelectedNetworkMetric;
	const isDirected = subOption1 === 'directed';
	const isWeighted = subOption2 === 'weighted';

	if (isSelectedTimeSeries)
		return generateTimeSeriesEntryList(countryIDToData, timeSeriesDataList, linkList, mainOption, subOption1, subOption2);
	if (mainOption === 'Degree')
		return generateDegreeEntryList(linkList, countryIDToData);
	if (mainOption === 'In Degree')
		return generateInDegreeEntryList(linkList, countryIDToData);
	if (mainOption === 'Out Degree')
		return generateOutDegreeEntryList(linkList, countryIDToData);
	if (mainOption === 'Closeness')
		return generateClosenessEntryList(linkList, countryIDToData, isDirected, isWeighted);
	if (mainOption === 'Betweenness')
		return generateBetweennessEntryList(linkList, countryIDToData, isDirected, isWeighted);
	if (mainOption === 'Eigenvector')
		return generateEigenvectorEntryList(linkList, countryIDToData, isWeighted);
	if (mainOption === 'PageRank')
		return generatePageRankEntryList(linkList, countryIDToData);

	return [];
};

export const generateKEntryList = (entryList, k) => {
	const topEntryList = entryList.length <= k * 2 ? entryList
					   : entryList.filter((entryObject, index) => index >= 0 && index < k);
	const bottomEntryList = entryList.length <= k * 2 ? []
						  : entryList.filter((entryObject, index) => index >= entryList.length - k && index <= entryList.length - 1);

	return [ topEntryList, bottomEntryList ];
};
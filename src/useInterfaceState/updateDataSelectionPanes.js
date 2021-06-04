// helpers

const getShownSourceIDSet = linkTypeList => { // linkTypeList is filtered
	const shownSourceIDSet = new Set();

	for (let { isDirected, linkRowList } of linkTypeList) {
		if (isDirected)
			for (let { node1 } of linkRowList)
				shownSourceIDSet.add(node1);

		else if (!isDirected)
			for (let { node1, node2 } of linkRowList) {
				shownSourceIDSet.add(node1);
				shownSourceIDSet.add(node2);
			}
	}

	return shownSourceIDSet;
}

const getShownTargetIDSet = linkTypeList => { // linkTypeList is filtered
	const shownTargetIDSet = new Set();

	for (let { isDirected, linkRowList } of linkTypeList) {
		if (isDirected)
			for (let { node2 } of linkRowList)
				shownTargetIDSet.add(node2);

		else if (!isDirected)
			for (let { node1, node2 } of linkRowList) {
				shownTargetIDSet.add(node1);
				shownTargetIDSet.add(node2);
			}
	}

	return shownTargetIDSet;
};

// initLinkPaneList

const extractYearRange = (linkRowList, yearAttributeName) => {
	let min = Infinity, max = -Infinity;

	for (let linkRowObject of linkRowList)
		if (linkRowObject[yearAttributeName] !== '') {
			min = Math.min(min, +linkRowObject[yearAttributeName]);
			max = Math.max(max, +linkRowObject[yearAttributeName]);
		}

	min = min === Infinity ? null : min;
	max = max === -Infinity ? null : max;

	return [ min, max ];
};

const generateYearAttribute = (linkRowList, linkMetadata, yearAttributeType) => {
	if (linkMetadata[yearAttributeType] === null)
		return null;

	const attributeName = linkMetadata[yearAttributeType];
	const [ min, max ] = extractYearRange(linkRowList, attributeName);
	
	return { attributeName, min, max };
};

const findAverage = (linkRowList, attributeName) => {
	let sum = 0, count = 0;

	for (let linkRowObject of linkRowList) {
		const attributeValue = linkRowObject[attributeName];
		const attributeValueIsMissing = attributeValue === '';

		if (!attributeValueIsMissing) {
			sum += +attributeValue;
			count++;
		}
	}

	return count === 0 ? null : sum / count;
};

const processColorAttributeList = (linkRowList, linkMetadata) => {
	const { isDirected, linkType, colorPane } = linkMetadata;
	const linkIDToLinkRowList = {};

	// generate linkIDToLinkRowList
	for (let linkRowObject of linkRowList) {
		const { node1, node2 } = linkRowObject;
		const sourceID = isDirected ? node1 : (node1 < node2 ? node1 : node2);
		const targetID = isDirected ? node2 : (node1 < node2 ? node2 : node1);
		const linkID = `${ sourceID }-${ targetID }-${ linkType }`;

		if (!(linkID in linkIDToLinkRowList))
			linkIDToLinkRowList[linkID] = [];

		linkIDToLinkRowList[linkID].push(linkRowObject);
	}

	// for each dataset, there are may links
	// for each link, there is an average
	// find averageMin and averageMax
	for (let attribute of colorPane.attributeList) {
		const { isCategorical, attributeName } = attribute;
		let averageMin = Infinity, averageMax = -Infinity;

		if (!isCategorical) {
			for (let linkID in linkIDToLinkRowList) {
				const linkRowListForCurrLink = linkIDToLinkRowList[linkID];
				const average = findAverage(linkRowListForCurrLink, attributeName);

				if (average !== null) {
					averageMin = Math.min(averageMin, average);
					averageMax = Math.max(averageMax, average);
				}
			}

			attribute.averageMin = averageMin;
			attribute.averageMax = averageMax;
		}
	}

	return colorPane;
};

export const initLinkPaneList = linkDataList => {
	const linkPaneList = [];

	for (let { data: linkRowList, metadata: linkMetadata } of linkDataList) {
		const {
			linkType,
			isDirected,
			isWeighted,
			tooltip,
			dataTable,
			filterPane,
			defaultColorAttrName,
			eventName
		} = linkMetadata;

		const key = linkType;
		const isShown = true;
		const isSelected = false;
		const isSegment = false;
		const displayName = linkMetadata.displayName;

		const startYear = generateYearAttribute(linkRowList, linkMetadata, 'startYear');
		const signYear = generateYearAttribute(linkRowList, linkMetadata, 'signYear');
		const EIFYear = generateYearAttribute(linkRowList, linkMetadata, 'EIFYear');
		const endYear = generateYearAttribute(linkRowList, linkMetadata, 'endYear');
		const colorPane = processColorAttributeList(linkRowList, linkMetadata);

		linkPaneList.push({
			EIFYear,
			colorPane,
			dataTable,
			defaultColorAttrName,
			displayName,
			endYear,
			filterPane,
			isDirected,
			isSegment,
			isSelected,
			isShown,
			isWeighted,
			key,
			linkRowList,
			linkType,
			signYear,
			startYear,
			tooltip,
			eventName
		});
	}

	linkPaneList[0].isSelected = true; // select first

	return linkPaneList;
};

// initSourcePaneList, initTargetPaneList

const initNodePaneList = (linkTypeList, nodeList, sourceOrTarget) => {
	const nodePaneList = [];
	const shownNodeSet = sourceOrTarget === 'source' ?
		getShownSourceIDSet(linkTypeList) :
		getShownTargetIDSet(linkTypeList);

	for (let countryRowObject of nodeList) {
		const countryID = countryRowObject.ID;
		const countryName = countryRowObject.name;

		const key = countryID;
		const isShown = shownNodeSet.has(countryID);
		const isSelected = isShown; // select all shown items by default
		const displayName = countryName;
		const data = countryRowObject;

		nodePaneList.push({
			key,
			isShown,
			isSelected,
			displayName,
			data
		});
	}

	return nodePaneList
		.sort((a, b) => {
			if (a.displayName < b.displayName) return -1;
			if (a.displayName > b.displayName) return 1;
			return 0;
		});
};

export const initSourcePaneList = (linkTypeList, nodeList) => // linkTypeList is filtered
	initNodePaneList(linkTypeList, nodeList, 'source');

export const initTargetPaneList = (linkTypeList, nodeList) => // linkTypeList is filtered
	initNodePaneList(linkTypeList, nodeList, 'target');

// toggleItemList, selectItemList

export const toggleItemList = (prevItemList, itemKey) => 
	prevItemList.map(itemObject => ({ ...itemObject,
		isSelected: itemObject.key === itemKey 
				? !itemObject.isSelected 
				: itemObject.isSelected
	}));

export const selectItemList = (prevItemList, isSelected) =>
	prevItemList.map(itemObject => ({ ...itemObject, isSelected }));

// updateSourcePaneList, updateTargetPaneList

const updateNodePaneList = (linkTypeList, prevNodePaneList, sourceOrTarget) => {
	const newNodePaneList = [];
	const shownNodeSet = sourceOrTarget === 'source' ?
		getShownSourceIDSet(linkTypeList) :
		getShownTargetIDSet(linkTypeList);

	for (let nodeObject of prevNodePaneList) {
		const countryID = nodeObject.data.ID;
		const isPrevShown = nodeObject.isShown;
		const isCurrShown = shownNodeSet.has(countryID);
		let isCurrSelected = null;

		if (!isPrevShown && isCurrShown) isCurrSelected = true;
		else if (!isPrevShown && !isCurrShown) isCurrSelected = false;
		else if (isPrevShown && !isCurrShown) isCurrSelected = false;
		else if (isPrevShown && isCurrShown) isCurrSelected = true;

		nodeObject.isShown = isCurrShown;
		nodeObject.isSelected = isCurrSelected;
		newNodePaneList.push(nodeObject);
	}

	return newNodePaneList;
};

export const updateSourcePaneList = (linkTypeList, prevNodePaneList) => 
	updateNodePaneList(linkTypeList, prevNodePaneList, 'source');

export const updateTargetPaneList = (linkTypeList, prevNodePaneList) => 
	updateNodePaneList(linkTypeList, prevNodePaneList, 'target');
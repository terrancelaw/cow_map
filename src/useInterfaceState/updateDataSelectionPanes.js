import { schemeTableau10 } from 'd3';

// helpers

const getShownSourceIDSet = linkPaneList => {
	const shownSourceIDSet = new Set();

	for (let { isSelected, isDirected, linkRowList } of linkPaneList) {
		if (isSelected && isDirected)
			for (let { node1 } of linkRowList)
				shownSourceIDSet.add(node1);

		else if (isSelected && !isDirected)
			for (let { node1, node2 } of linkRowList) {
				shownSourceIDSet.add(node1);
				shownSourceIDSet.add(node2);
			}
	}

	return shownSourceIDSet;
};

const getShownTargetIDSet = linkPaneList => {
	const shownTargetIDSet = new Set();

	for (let { isSelected, isDirected, linkRowList } of linkPaneList) {
		if (isSelected && isDirected)
			for (let { node2 } of linkRowList)
				shownTargetIDSet.add(node2);

		else if (isSelected && !isDirected)
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

const generateColor = index => {
	return schemeTableau10[index % schemeTableau10.length];
};

const generateOutlierCount = (linkRowList, linkMetadata) => {
	const countList = [];
	const linkIsDirected = linkMetadata.isDirected;
	const sourceTargetIDToCount = {};
	let indexFor90thPencentile = null;

	// find countList
	for (let { node1, node2 } of linkRowList) {
		const sourceID = linkIsDirected ? node1 : (node1 < node2 ? node1 : node2);
		const targetID = linkIsDirected ? node2 : (node1 < node2 ? node2 : node1);
		const sourceTargetID = `${ sourceID }-${ targetID }`;

		if (!(sourceTargetID in sourceTargetIDToCount))
			sourceTargetIDToCount[sourceTargetID] = 0;

		sourceTargetIDToCount[sourceTargetID]++;
	}

	for (let sourceTargetID in sourceTargetIDToCount)
		countList.push(sourceTargetIDToCount[sourceTargetID]);

	// find 90th percentile as outlier
	countList.sort((a, b) => a - b);
	indexFor90thPencentile = parseInt(countList.length * 0.9);
	return countList[indexFor90thPencentile];
};

const initParentLinkDataObject = ({ data: linkRowList, metadata: linkMetadata }, index) => {
	const {
		linkType,
		isDirected,
		isWeighted,
		tooltip,
		dataTable,
		linkDisaggregator,
		eventName
	} = linkMetadata;

	const key = linkType;
	const isShown = true;
	const isSelected = index === 0; // select first
	const isSubItem = false;
	const canDelete = false;
	const displayName = linkMetadata.displayName;

	const startYear = generateYearAttribute(linkRowList, linkMetadata, 'startYear');
	const signYear = generateYearAttribute(linkRowList, linkMetadata, 'signYear');
	const EIFYear = generateYearAttribute(linkRowList, linkMetadata, 'EIFYear');
	const endYear = generateYearAttribute(linkRowList, linkMetadata, 'endYear');
	const outlierCount = generateOutlierCount(linkRowList, linkMetadata);
	const color = generateColor(index);

	return {
		key, isShown, isSelected, isSubItem, canDelete, displayName,
		startYear, signYear, EIFYear, endYear, outlierCount, color, linkRowList,
		linkType, isDirected, isWeighted, tooltip, dataTable, linkDisaggregator, eventName
	};
};

const initChildLinkDataList = (parentLinkDataObject, subItemList, startIndex) => {
	const {
		EIFYear,
		dataTable,
		endYear,
		isDirected,
		isWeighted,
		outlierCount,
		signYear,
		startYear,
		tooltip,
		eventName
	} = parentLinkDataObject;

	const generateDisplayName = attrValueList => {
		let displayName = '';

		for (let { attrDisplayName, valueDisplayName } of attrValueList)
			displayName += `${ attrDisplayName }=${ valueDisplayName }, `;

		return displayName.slice(0, -2);
	};
	const checkIfSatisfyAttrValuePairList = (linkRowObject, attrValueList) => {
		for (let { attributeList, attributeValue: requiredAttrValue } of attrValueList) {
			let satisfyAttrValuePair = false;

			for (let attributeName of attributeList) // satisfy any one
				if (linkRowObject[attributeName] === requiredAttrValue) {
					satisfyAttrValuePair = true; break;
				}

			if (!satisfyAttrValuePair) return false;
		}

		return true;
	};

	const childLinkDataList = [];

	for (let i = 0; i < subItemList.length; i++) {
		const attrValueList = subItemList[i];
		const parentKey = parentLinkDataObject.key;
		const displayName = generateDisplayName(attrValueList);
		const segmentKey = displayName.replace(/[^0-9a-z]/gi, '').toLowerCase();

		const canDelete = false;
		const color = generateColor(startIndex + i);
		const isSelected = false;
		const isShown = true;
		const isSubItem = true;
		const key = `${ parentKey }_${ segmentKey }`; // cannot use '-'
		const linkType = key;
		const linkRowList = parentLinkDataObject.linkRowList
			.filter(linkRowObject => checkIfSatisfyAttrValuePairList(linkRowObject, attrValueList));
		
		childLinkDataList.push({
			EIFYear,
			canDelete,
			color,
			dataTable,
			displayName,
			endYear,
			isDirected,
			isSelected,
			isShown,
			isSubItem,
			isWeighted,
			key,
			linkRowList,
			linkType,
			outlierCount,
			signYear,
			startYear,
			tooltip,
			parentLinkDataObject, // for changing legend label
			eventName
		});
	}

	return childLinkDataList;
};

export const initLinkPaneList = linkDataList => {
	const linkPaneList = [];
	let index = 0;

	for (let linkDataObject of linkDataList) {
		const parentLinkDataObject = initParentLinkDataObject(linkDataObject, index++);
		const childLinkDataList = initChildLinkDataList(
			parentLinkDataObject, linkDataObject.metadata.subItemList, index
		);

		linkPaneList.push(parentLinkDataObject);

		for (let childLinkDataObject of childLinkDataList) {
			linkPaneList.push(childLinkDataObject);
			index++;
		}
	}

	return linkPaneList;
};

// initSourcePaneList, initTargetPaneList

const initNodePaneList = (linkPaneList, nodeList, sourceOrTarget) => {
	const nodePaneList = [];
	const shownNodeSet = sourceOrTarget === 'source' ?
		getShownSourceIDSet(linkPaneList) :
		getShownTargetIDSet(linkPaneList);

	for (let countryRowObject of nodeList) {
		const countryID = countryRowObject.ID;
		const countryName = countryRowObject.name;

		const key = countryID;
		const isShown = shownNodeSet.has(countryID);
		const isSelected = isShown; // select all shown items by default
		const isSubItem = false;
		const canDelete = false;
		const displayName = countryName;
		const data = countryRowObject;

		nodePaneList.push({
			key,
			isShown,
			isSelected,
			isSubItem,
			canDelete,
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

export const initSourcePaneList = (linkPaneList, nodeList) => 
	initNodePaneList(linkPaneList, nodeList, 'source');

export const initTargetPaneList = (linkPaneList, nodeList) => 
	initNodePaneList(linkPaneList, nodeList, 'target');

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

const updateNodePaneList = (newLinkPaneList, prevNodePaneList, sourceOrTarget) => {
	const newNodePaneList = [];
	const shownNodeSet = sourceOrTarget === 'source' ?
		getShownSourceIDSet(newLinkPaneList) :
		getShownTargetIDSet(newLinkPaneList);

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

export const updateSourcePaneList = (newLinkPaneList, prevNodePaneList) => 
	updateNodePaneList(newLinkPaneList, prevNodePaneList, 'source');

export const updateTargetPaneList = (newLinkPaneList, prevNodePaneList) => 
	updateNodePaneList(newLinkPaneList, prevNodePaneList, 'target');

// updateLinkPaneListColor

export const updateLinkPaneListColor = (prevLinkPaneList, linkKey, newColor) => 
	prevLinkPaneList.map(linkDataObject => ({ ...linkDataObject,
		color: linkDataObject.key !== linkKey ? linkDataObject.color : newColor
	}));

// addNewLinkDataObjects

const generateSegementNameList = (linkRowObject, optionList, countryIDToData) => {
	let segmentNameList = []; // a queue

	// bfs to populate queue
	for (let i = 0; i < optionList.length; i++) {
		const currOption = optionList[i];
		const newSegmentNameSet = new Set();

		if (segmentNameList.length === 0) // init
			for (let { attributeName, isID } of currOption.attributeList) {
				const attributeValue = !isID ? 
					(linkRowObject[attributeName] === '' ? 'null' : linkRowObject[attributeName]) :
					(countryIDToData[linkRowObject[attributeName]].displayName);
				const newSegmentName = `${ currOption.displayName }=${ attributeValue }, `;

				newSegmentNameSet.add(newSegmentName);
			}
			
		else while (segmentNameList.length > 0) {
			const currSegmentName = segmentNameList.shift();

			for (let { attributeName, isID } of currOption.attributeList) {
				const attributeValue = !isID ? 
					(linkRowObject[attributeName] === '' ? 'null' : linkRowObject[attributeName]) :
					(countryIDToData[linkRowObject[attributeName]].displayName);
				const newSegmentName = currSegmentName + `${ currOption.displayName }=${ attributeValue }, `;

				newSegmentNameSet.add(newSegmentName); // use set because attr can have same value
			}
		}

		segmentNameList = [ ...newSegmentNameSet ];
	}

	// remove , 
	for (let i = 0; i < segmentNameList.length; i++)
		segmentNameList[i] = segmentNameList[i].slice(0, -2);

	return segmentNameList;
};

const generateSegmentNameToLinkRowList = (linkRowList, optionList, countryIDToData) => {
	const segmentNameToLinkRowList = {};

	for (let linkRowObject of linkRowList) {
		let segmentNameList = generateSegementNameList(linkRowObject, optionList, countryIDToData);

		for (let segmentName of segmentNameList) {
			if (!(segmentName in segmentNameToLinkRowList))
				segmentNameToLinkRowList[segmentName] = [];

			segmentNameToLinkRowList[segmentName].push(linkRowObject);
		}		
	}

	return segmentNameToLinkRowList;
};

const generateSegmentNameToColor = (currColorList, segmentNameToLinkRowList) => {
	const newColorList = [];
	const segmentNameList = Object.keys(segmentNameToLinkRowList);
	const segmentNameToColor = {};

	// add color not in curr list
	for (let color of schemeTableau10)
		if (newColorList.length < segmentNameList.length)
			if (currColorList.indexOf(color) === -1) // not found
				newColorList.push(color);

	// random assignment if too many colors needed
	while (newColorList.length < segmentNameList.length) {
		const randomIndex = Math.floor(Math.random() * schemeTableau10.length);
		newColorList.push(schemeTableau10[randomIndex]);
	}

	// generate segmentNameToColor
	for (let i = 0; i < segmentNameList.length; i++)
		segmentNameToColor[segmentNameList[i]] = newColorList[i];

	return segmentNameToColor;
};

const generateNewChildLinkDataList = (
	parentLinkDataObject,
	segmentNameToLinkRowList,
	segmentNameToColor
) => {
	const {
		EIFYear,
		dataTable,
		endYear,
		isDirected,
		isWeighted,
		outlierCount,
		signYear,
		startYear,
		tooltip,
		eventName
	} = parentLinkDataObject;
	const newChildLinkDataList = [];

	for (let segmentName in segmentNameToLinkRowList) {
		const parentKey = parentLinkDataObject.key;
		const segmentKey = segmentName.replace(/[^0-9a-z]/gi, '').toLowerCase();

		const canDelete = true;
		const color = segmentNameToColor[segmentName];
		const displayName = segmentName;
		const isSelected = false;
		const isShown = true;
		const isSubItem = true;
		const key = `${ parentKey }_${ segmentKey }`; // cannot use '-'
		const linkRowList = segmentNameToLinkRowList[segmentName];
		const linkType = key;

		newChildLinkDataList.push({
			EIFYear,
			canDelete,
			color,
			dataTable,
			displayName,
			endYear,
			isDirected,
			isSelected,
			isShown,
			isSubItem,
			isWeighted,
			key,
			linkRowList,
			linkType,
			outlierCount,
			signYear,
			startYear,
			tooltip,
			parentLinkDataObject, // for changing legend label
			eventName
		});
	}

	return newChildLinkDataList;
};

const generateParentKeyToChildLinkDataList = (oldChildLinkDataList, newChildLinkDataList) => {
	const parentKeyToChilLinkDataList = {};

	// assume unique
	for (let linkDataObject of oldChildLinkDataList) {
		const parentKey = linkDataObject.parentLinkDataObject.key;

		if (!(parentKey in parentKeyToChilLinkDataList))
			parentKeyToChilLinkDataList[parentKey] = [];

		parentKeyToChilLinkDataList[parentKey].push(linkDataObject);
	}

	// remove duplicates
	for (let linkDataObject of newChildLinkDataList) {
		const parentKey = linkDataObject.parentLinkDataObject.key;
		const childKey = linkDataObject.key;
		let isDuplicate = false;

		if (!(parentKey in parentKeyToChilLinkDataList))
			parentKeyToChilLinkDataList[parentKey] = [];

		isDuplicate = parentKeyToChilLinkDataList[parentKey].filter(({ key }) => key === childKey).length > 0;
		if (!isDuplicate) parentKeyToChilLinkDataList[parentKey].push(linkDataObject);
	}

	// sorting by display name
	for (let parentKey in parentKeyToChilLinkDataList)
		parentKeyToChilLinkDataList[parentKey].sort((a, b) => {
			if (a.displayName < b.displayName) return -1;
			if (a.displayName > b.displayName) return 1;
			return 0;
		});

	return parentKeyToChilLinkDataList;
};

export const addNewLinkDataObjects = (
	prevLinkPaneList, linkKey, optionList, countryIDToData
) => {
	if (optionList.length === 0)
		return prevLinkPaneList;

	const parentLinkDataObject = prevLinkPaneList.filter(({ key }) => key === linkKey)[0];
	const parentLinkRowList = parentLinkDataObject.linkRowList;
	const currColorList = prevLinkPaneList.map(({ color }) => color);

	const segmentNameToLinkRowList = generateSegmentNameToLinkRowList(parentLinkRowList, optionList, countryIDToData);
	const segmentNameToColor = generateSegmentNameToColor(currColorList, segmentNameToLinkRowList);
	const newChildLinkDataList = generateNewChildLinkDataList(parentLinkDataObject, segmentNameToLinkRowList, segmentNameToColor);
	const oldChildLinkDataList = prevLinkPaneList.filter(({ isSubItem }) => isSubItem);
	const parentListDataList = prevLinkPaneList.filter(({ isSubItem }) => !isSubItem);
	const parentKeyToChilLinkDataList = generateParentKeyToChildLinkDataList(oldChildLinkDataList, newChildLinkDataList);
	const newLinkPaneList = [];

	for (let parentLinkDataObject of parentListDataList) {
		const parentKey = parentLinkDataObject.key;

		if (parentKey in parentKeyToChilLinkDataList) {
			const childLinkDataList = parentKeyToChilLinkDataList[parentKey];

			newLinkPaneList.push(parentLinkDataObject);

			for (let childLinkDataObject of childLinkDataList)
				newLinkPaneList.push(childLinkDataObject);
		}
		else newLinkPaneList.push(parentLinkDataObject);
	}

	return newLinkPaneList;
};
import { schemeTableau10, scaleLinear } from 'd3';

// filterLinkPaneList

const filterLinkPaneList = (linkPaneList, appliedFilterList) => {
	const filteredLinkPaneList = [];

	// perform shallow copy to avoid modifying linkPaneList (only include selected)
	for (let linkDataObject of linkPaneList)
		if (linkDataObject.isSelected)
			filteredLinkPaneList.push({ ...linkDataObject })

	// apply filters
	for (let filter of appliedFilterList) {
		const filterAttributeName = filter.attribute.attributeName;
		const filterAttributeIsCategorical = filter.attribute.isCategorical;
		const matchedLinkDataList = filteredLinkPaneList.filter(({ key }) => key === filter.dataSet.key); // at most one match
		const filteredLinkRowList = [];

		if (matchedLinkDataList.length > 0) {
			const matchedLinkDataObject = matchedLinkDataList[0]; // at most one match

			// filter for numerical attribute
			if (!filterAttributeIsCategorical) {
				const lowerBound = Math.min(...filter.attributeValue);
				const upperBound = Math.max(...filter.attributeValue);

				for (let linkRowObject of matchedLinkDataObject.linkRowList) {
					const attributeValue = linkRowObject[filterAttributeName];
					const attributeValueIsMissing = attributeValue === '';

					if (!attributeValueIsMissing && 
						+attributeValue >= lowerBound &&
						+attributeValue <= upperBound)
						filteredLinkRowList.push(linkRowObject);
				}
			}

			// filter for categorical attribute
			else if (filterAttributeIsCategorical) {
				const selectedCategoryList = filter.attributeValueList
					.filter(({ isSelected }) => isSelected)
					.map(({ category }) => category);
				const selectedCategorySet = new Set(selectedCategoryList);

				for (let linkRowObject of matchedLinkDataObject.linkRowList) {
					const attributeValue = linkRowObject[filterAttributeName];
					const attributeValueIsMissing = attributeValue === '';

					if (!attributeValueIsMissing && 
						selectedCategorySet.has(attributeValue))
						filteredLinkRowList.push(linkRowObject);
				}
			}

			// save
			matchedLinkDataObject.linkRowList = filteredLinkRowList;
		}
	}

	return filteredLinkPaneList;
};

// segmentLinkPaneList

const generateCategorySet = (linkRowList, attributeName) => {
	const categorySet = new Set(); // forget about missing for now

	for (let linkRowObject of linkRowList)
		categorySet.add(linkRowObject[attributeName]);

	return categorySet;
};

const generateCategoryToLinkRowList = (linkRowList, attributeName, categorySet) => {
	const categoryToLinkRowList = {};

	for (let category of categorySet)
		categoryToLinkRowList[category] = [];

	for (let linkRowObject of linkRowList) {
		const category = linkRowObject[attributeName];
		categoryToLinkRowList[category].push(linkRowObject);
	}

	return categoryToLinkRowList;
};

const generateChildLinkDataList = (
	parentLinkDataObject, 
	segmentAttribute, 
	countryIDToData
) => {
	const generateDisplayName = category => {
		if (category === '') return `${ segmentAttribute.displayName }=null`;
		if (!segmentAttribute.isID) return `${ segmentAttribute.displayName }=${ category }`;
		return `${ segmentAttribute.displayName }=${ countryIDToData[category].displayName }`;
	};

	const categorySet = generateCategorySet(parentLinkDataObject.linkRowList, segmentAttribute.attributeName);
	const categoryToLinkRowList = generateCategoryToLinkRowList(parentLinkDataObject.linkRowList, segmentAttribute.attributeName, categorySet);
	const {
		colorPane,
		EIFYear,
		dataTable,
		endYear,
		filterPane,
		isDirected,
		isWeighted,
		signYear,
		startYear,
		tooltip,
		eventName
	} = parentLinkDataObject;
	const childLinkDataList = [];

	for (let category of categorySet) {
		const parentKey = parentLinkDataObject.key;
		const displayName = generateDisplayName(category);
		const segmentKey = displayName.replace(/[^0-9a-z]/gi, '').toLowerCase();

		const linkRowList = categoryToLinkRowList[category];
		const isSelected = true, isShown = true, isSegment = true;
		const key = `${ parentKey }_${ segmentKey }`; // cannot use '-'
		const linkType = key;

		childLinkDataList.push({
			EIFYear,
			colorPane,
			dataTable,
			displayName,
			endYear,
			filterPane,
			isDirected,
			isSelected,
			isSegment,
			isShown,
			isWeighted,
			key,
			linkRowList,
			linkType,
			signYear,
			startYear,
			tooltip,
			eventName,
			parentLinkDataObject // for changing legend label
		});
	}

	return childLinkDataList;
};

const segmentLinkPaneList = (
	filteredLinkPaneList,
	appliedColoringList,
	countryIDToData
) => {
	const segmentedLinkPaneList = [];

	if (appliedColoringList.length === 0)
		return filteredLinkPaneList;

	for (let parentLinkDataObject of filteredLinkPaneList) {
		const matchedColoringList = appliedColoringList
			.filter(listItem => listItem.attribute.isCategorical) // no segmentation for numerical attr
			.filter(listItem => listItem.dataSet.key === parentLinkDataObject.key);
		const needToSegment = matchedColoringList.length > 0;

		if (needToSegment) { // don't push parentLinkDataObject
			const matchedColoring = matchedColoringList[0]; // at most one match
			const childLinkDataList = generateChildLinkDataList(
				parentLinkDataObject, 
				matchedColoring.attribute, 
				countryIDToData
			);

			for (let childLinkDataObject of childLinkDataList)
				segmentedLinkPaneList.push(childLinkDataObject);
		}
		else if (!needToSegment)
			segmentedLinkPaneList.push(parentLinkDataObject);
	}

	return segmentedLinkPaneList;
};

// colorLinkPaneList

const colorLinkPaneList = (segmentedLinkPaneList, prevLinkTypeToColor) => {
	const newLinkTypeToColor = {};
	const currColorList = [];

	// color existing linkDataObject 
	segmentedLinkPaneList
		.filter(linkDataObject => linkDataObject.linkType in prevLinkTypeToColor)
		.forEach(linkDataObject => {
			const linkType = linkDataObject.linkType;
			const color = prevLinkTypeToColor[linkType];

			currColorList.push(color);
			linkDataObject.color = color;
		});

	// color new linkDataObject
	segmentedLinkPaneList
		.filter(linkDataObject => !(linkDataObject.linkType in prevLinkTypeToColor))
		.forEach(linkDataObject => {
			let foundColor = false;

			// try to get unused color (remember to save)
			for (let color of schemeTableau10)
				if (currColorList.indexOf(color) === -1) {
					currColorList.push(color);
					linkDataObject.color = color;
					foundColor = true; break;
				}

			// assign random color (remember to save)
			if (!foundColor) {
				const randomIndex = Math.floor(Math.random() * schemeTableau10.length);
				const color = schemeTableau10[randomIndex];

				currColorList.push(color);
				linkDataObject.color = color;
			}
		});

	// remove color for old linkDataObject
	for (let { linkType, color } of segmentedLinkPaneList)
		newLinkTypeToColor[linkType] = color;

	return [ segmentedLinkPaneList, newLinkTypeToColor ];
};

// updateLinkTypeList

export const updateLinkTypeList = (
	linkPaneList,
	appliedColoringList,
	appliedFilterList,
	prevLinkTypeToColor,
	countryIDToData
) => {
	const filteredLinkPaneList = filterLinkPaneList(
		linkPaneList, 
		appliedFilterList
	);
	const segmentedLinkPaneList = segmentLinkPaneList(
		filteredLinkPaneList, 
		appliedColoringList,
		countryIDToData
	);
	const [ 
		coloredLinkPaneList,
		newLinkTypeToColor 
	] = colorLinkPaneList(
		segmentedLinkPaneList,
		prevLinkTypeToColor
	);

	return [ coloredLinkPaneList, newLinkTypeToColor ];
};

export const updateLinkTypeListColor = (
	prevLinkTypeList,
	prevLinkTypeToColor,
	linkKey,
	newColor
) => {
	const linkType = linkKey; // they should be the same
	const newLinkTypeList = prevLinkTypeList.map(linkDataObject => ({ ...linkDataObject,
		color: linkDataObject.key !== linkKey ? linkDataObject.color : newColor
	}));

	prevLinkTypeToColor[linkType] = newColor;

	return [ newLinkTypeList, prevLinkTypeToColor ]; // no need to change reference for prevLinkTypeToColor
};

// updateLinkList

const filterLinkByTime = (
	linkRowObject, 
	linkDataObject, 
	timelineSliderState
) => {
	const timelineSliderType = timelineSliderState.yearAttribute.type;

	switch (timelineSliderType) {
		case 'no-filter': {
			return true;
		}
		case 'point': {
			const timelineValue = timelineSliderState.value;
			const { startYearAttrType, endYearAttrType } = timelineSliderState.yearAttribute;
			const startYearAttr = linkDataObject[startYearAttrType];
			const endYearAttr = linkDataObject[endYearAttrType];
			let startYearValue = null, endYearValue = null;

			if (startYearAttr !== null && linkRowObject[startYearAttr.attributeName] !== '')
				startYearValue = +linkRowObject[startYearAttr.attributeName];
			if (endYearAttr !== null && linkRowObject[endYearAttr.attributeName] !== '')
				endYearValue = +linkRowObject[endYearAttr.attributeName];

			if (startYearValue === null) return false;
			else if (endYearValue === null) return timelineValue >= startYearValue; // has start but not end
			else return timelineValue >= startYearValue && timelineValue <= endYearValue; // has both
		}
		case 'range': {
			const timelineRange = timelineSliderState.value;
			const { filterYearAttrType } = timelineSliderState.yearAttribute;
			const filterYearAttr = linkDataObject[filterYearAttrType];
			let yearValue = null;

			if (filterYearAttr !== null && linkRowObject[filterYearAttr.attributeName] !== '')
				yearValue = +linkRowObject[filterYearAttr.attributeName];

			if (yearValue === null) return false;
			return yearValue >= timelineRange[0] && yearValue <= timelineRange[1];
		}
		default: {
			throw new Error(`Unhandled case: ${ timelineSliderType }`);
		}
	}
};

const getSelectedNodeSet = nodePaneList => {
	const filteredIDList = nodePaneList
		.filter(nodeObject => nodeObject.isSelected)
		.map(nodeObject => nodeObject.data.ID);

	return new Set(filteredIDList);
};

const generateLinkTypeToMetadata = linkTypeList => {
	const linkTypeToMetadata = {};

	linkTypeList.forEach(linkDataObject => {
		const linkType = linkDataObject.linkType;

		linkTypeToMetadata[linkType] = linkDataObject;
	});

	return linkTypeToMetadata;
};

const generateLinkIDToLinkRowList = (
	linkTypeList, 
	sourcePaneList, 
	targetPaneList, 
	timelineSliderState
) => {
	const linkIDToLinkRowList = {};
	const selectedSourceIDSet = getSelectedNodeSet(sourcePaneList);
	const selectedTargetIDSet = getSelectedNodeSet(targetPaneList);

	for (let linkDataObject of linkTypeList) {
		const {
			linkRowList,
			isDirected,
			linkType
		} = linkDataObject;

		for (let linkRowObject of linkRowList) {
			if (isDirected) {
				const sourceID = linkRowObject.node1;
				const targetID = linkRowObject.node2;
				const sourceSelected = selectedSourceIDSet.has(sourceID);
				const targetSelected = selectedTargetIDSet.has(targetID);
				const satisfiesTimelineSliderCriteria = filterLinkByTime(
					linkRowObject, linkDataObject, timelineSliderState
				);

				if (sourceSelected && targetSelected && satisfiesTimelineSliderCriteria) {
					const linkID = `${ sourceID }-${ targetID }-${ linkType }`;

					if (!(linkID in linkIDToLinkRowList))
						linkIDToLinkRowList[linkID] = [];

					linkIDToLinkRowList[linkID].push(linkRowObject);
				}
			}
			else if (!isDirected) {
				const sourceID = linkRowObject.node1 < linkRowObject.node2 ? linkRowObject.node1 : linkRowObject.node2;
				const targetID = linkRowObject.node1 < linkRowObject.node2 ? linkRowObject.node2 : linkRowObject.node1;
				const selectionCriteria1 = selectedSourceIDSet.has(linkRowObject.node1) && selectedTargetIDSet.has(linkRowObject.node2);
				const selectionCriteria2 = selectedSourceIDSet.has(linkRowObject.node2) && selectedTargetIDSet.has(linkRowObject.node1);
				const satisfiesTimelineSliderCriteria = filterLinkByTime(
					linkRowObject, linkDataObject, timelineSliderState
				);

				if ((selectionCriteria1 || selectionCriteria2) && satisfiesTimelineSliderCriteria) {
					const linkID = `${ sourceID }-${ targetID }-${ linkType }`;

					if (!(linkID in linkIDToLinkRowList))
						linkIDToLinkRowList[linkID] = [];

					linkIDToLinkRowList[linkID].push(linkRowObject);
				}
			}
		}
	}

	return linkIDToLinkRowList;
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

export const changeLinkOpacity = (prevLinkList, appliedColoringList) => {
	const linkTypeToLinkList = {};
	const opacityScale = scaleLinear().range([ 0.1, 1 ]);
	const numericalAttrColoringList = appliedColoringList
		.filter(listItem => !listItem.attribute.isCategorical);

	if (numericalAttrColoringList.length === 0)
		return prevLinkList;

	// generate linkTypeToLinkList
	for (let linkObject of prevLinkList) {
		const linkType = linkObject.linkType;

		if (!(linkType in linkTypeToLinkList))
			linkTypeToLinkList[linkType] = [];

		linkTypeToLinkList[linkType].push(linkObject);
	}

	// change opacity
	for (let linkType in linkTypeToLinkList) {
		const linkListForCurrLinkType = linkTypeToLinkList[linkType];
		const matchedColoringList = numericalAttrColoringList
			.filter(listItem => listItem.dataSet.key === linkType); // linkType is key

		if (matchedColoringList.length > 0) {
			const matchedColoring = matchedColoringList[0]; // at most one match
			const { averageMin, averageMax, attributeName } = matchedColoring.attribute;

			opacityScale.domain([ averageMin, averageMax ]);

			for (let linkObject of linkListForCurrLinkType) {
				const linkRowListForCurrLink = linkObject.linkRowList;
				const average = findAverage(linkRowListForCurrLink, attributeName);
				const opacity = average === null ? 0.05 : opacityScale(average);
				
				linkObject.linkOpacity = opacity;
				linkObject.thinLineOpacity = opacity;
			}
		}
	}

	return prevLinkList;
};

export const updateLinkList = (
	linkTypeList,
	sourcePaneList, 
	targetPaneList, 
	timelineSliderState,
	appliedColoringList
) => {
	const linkList = [];
	const linkTypeToMetadata = generateLinkTypeToMetadata(linkTypeList);
	const linkIDToLinkRowList = generateLinkIDToLinkRowList(
		linkTypeList, 
		sourcePaneList, 
		targetPaneList, 
		timelineSliderState
	);

	for (let linkID in linkIDToLinkRowList) {
		const [ 
			sourceID, 
			targetID, 
			linkType 
		] = linkID.split('-');
		const { 
			isDirected, 
			isWeighted, 
			color, 
			tooltip,
			dataTable,
			eventName
		} = linkTypeToMetadata[linkType];
		const linkRowList = linkIDToLinkRowList[linkID];
		const linkOpacity = 1;
		const thinLineOpacity = 0.5;

		linkList.push({
			sourceID, 
			targetID, 
			linkType, 
			color,
			isDirected, 
			isWeighted,
			linkRowList,
			tooltip,
			dataTable,
			linkOpacity,
			thinLineOpacity,
			eventName
		});
	}

	return changeLinkOpacity(linkList, appliedColoringList);
};
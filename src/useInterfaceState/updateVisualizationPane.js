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

const generateLinkTypeToMetadata = linkPaneList => {
	const linkTypeToMetadata = {};

	linkPaneList.forEach(linkDataObject => {
		const linkType = linkDataObject.linkType;

		linkTypeToMetadata[linkType] = linkDataObject;
	});

	return linkTypeToMetadata;
};

const generateLinkIDToLinkRowList = (
	linkPaneList, 
	sourcePaneList, 
	targetPaneList, 
	timelineSliderState
) => {
	const linkIDToLinkRowList = {};
	const selectedSourceIDSet = getSelectedNodeSet(sourcePaneList);
	const selectedTargetIDSet = getSelectedNodeSet(targetPaneList);

	for (let linkDataObject of linkPaneList) {
		const {
			linkRowList,
			isSelected,
			isDirected,
			linkType
		} = linkDataObject;

		if (isSelected)
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

export const updateVisualizationPaneList = (
	linkPaneList, 
	sourcePaneList, 
	targetPaneList, 
	timelineSliderState
) => {
	const visualizationPaneList = [];
	const linkTypeToMetadata = generateLinkTypeToMetadata(linkPaneList);
	const linkIDToLinkRowList = generateLinkIDToLinkRowList(
		linkPaneList, 
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
			outlierCount,
			tooltip,
			dataTable,
			eventName
		} = linkTypeToMetadata[linkType];
		const linkRowList = linkIDToLinkRowList[linkID];
		const linkRowCount = linkRowList.length;
		const isOutlier = linkRowCount > outlierCount;

		visualizationPaneList.push({ 
			sourceID, 
			targetID, 
			linkType, 
			color,
			isDirected, 
			isWeighted,
			isOutlier,
			linkRowList,
			tooltip,
			dataTable,
			eventName
		});
	}

	return visualizationPaneList;
};
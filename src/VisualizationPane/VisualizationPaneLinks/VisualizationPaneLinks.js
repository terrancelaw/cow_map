import { directedLink, undirectedLink } from './pathGenerator';
import { VisualizationPaneLink } from './VisualizationPaneLink';

// helpers

export const checkIfIsHighlighted = (linkObject, hoverState) => {
	const { sourceID, targetID, linkType, isDirected } = linkObject;
	let isHighlighted = true;

	if (hoverState.object === 'NODE' ||
		hoverState.object === 'DETAIL_PANE_NODE')
		isHighlighted = sourceID === hoverState.data.nodeID || 
						targetID === hoverState.data.nodeID;
	else if (hoverState.object === 'LINK')
		isHighlighted = sourceID === hoverState.data.sourceID && 
						targetID === hoverState.data.targetID && 
						linkType === hoverState.data.linkType;
	else if (hoverState.object === 'DETAIL_PANE_LINK' && isDirected) 
		isHighlighted = sourceID === hoverState.data.sourceID && 
						targetID === hoverState.data.targetID;
	else if (hoverState.object === 'DETAIL_PANE_LINK' && !isDirected)
		isHighlighted = (sourceID === hoverState.data.sourceID && targetID === hoverState.data.targetID) ||
						(sourceID === hoverState.data.targetID && targetID === hoverState.data.sourceID);

	return isHighlighted;
};

const generatePathData = (linkObject, countryIDToData, projection) => {
	const { sourceID, targetID, isDirected, index } = linkObject;
	const sourcePoint = projection([ 
		countryIDToData[sourceID].longitude, 
		countryIDToData[sourceID].latitude 
	]);
	const targetPoint = projection([ 
		countryIDToData[targetID].longitude, 
		countryIDToData[targetID].latitude 
	]);

	return isDirected ? 
		directedLink.generatePathData(sourcePoint, targetPoint, index) : 
		undirectedLink.generatePathData(sourcePoint, targetPoint, index);
};

const generateMarkerEnd = linkObject => {
	const { isDirected, isOutlier, linkType } = linkObject;

	if (isDirected) {
		if (isOutlier) return 'url(#arrow-end-outlier)';
		if (!isOutlier) return 'url(#arrow-end-' + linkType + ')';
	}

	return null;
};

const addSourceTargetIndex = visualizationPaneList => {
	const sourceTargetIDToLinkRowList = {
		sameSourceAndTarget: [],
		directed: [],
		undirected: []
	};

	// generate sourceTargetIDToLinkRowList
	for (let linkObject of visualizationPaneList) {	
		const { sourceID, targetID, isDirected } = linkObject;
		const sourceTargetID = `${ sourceID }-${ targetID }`;

		if (sourceID === targetID) {
			if (!(sourceTargetID in sourceTargetIDToLinkRowList.sameSourceAndTarget))
				sourceTargetIDToLinkRowList.sameSourceAndTarget[sourceTargetID] = [];
			sourceTargetIDToLinkRowList.sameSourceAndTarget[sourceTargetID].push(linkObject);
		}
		else if (!isDirected) {
			if (!(sourceTargetID in sourceTargetIDToLinkRowList.undirected))
				sourceTargetIDToLinkRowList.undirected[sourceTargetID] = [];
			sourceTargetIDToLinkRowList.undirected[sourceTargetID].push(linkObject);
		}
		else if (isDirected) {
			if (!(sourceTargetID in sourceTargetIDToLinkRowList.directed))
				sourceTargetIDToLinkRowList.directed[sourceTargetID] = [];
			sourceTargetIDToLinkRowList.directed[sourceTargetID].push(linkObject);
		}
	}

	// add index
	for (let key in sourceTargetIDToLinkRowList)
		for (let sourceTargetID in sourceTargetIDToLinkRowList[key]) {
			const linkRowList = sourceTargetIDToLinkRowList[key][sourceTargetID];

			for (let i = 0; i < linkRowList.length; i++)
				linkRowList[i].index = i;

			if (linkRowList.length === 1 && key === 'undirected')
				linkRowList[0].index = -1;
		}
};

// main functions

const genereteLinkList = (
	visualizationPaneList,
	countryIDToData,
	projection,
	hoverState
) => {
	addSourceTargetIndex(visualizationPaneList);

	// add other data
	for (let linkObject of visualizationPaneList) {
		const { sourceID, targetID, linkType } = linkObject;

		linkObject.key = `${ sourceID }-${ targetID }-${ linkType }`;
		linkObject.isHighlighted = checkIfIsHighlighted(linkObject, hoverState);
		linkObject.pathData = generatePathData(linkObject, countryIDToData, projection);
		linkObject.markerEnd = generateMarkerEnd(linkObject);
	}

	return visualizationPaneList;
};

export const VisualizationPaneLinks = ({
	visualizationPaneList,
	countryIDToData,
	projectionState,
	hoverState,
	dispatch
}) => {
	const { projection } = projectionState;
	const linkList = genereteLinkList(
		visualizationPaneList, // convert to linkList
		countryIDToData,
		projection,
		hoverState		
	);

	return (
		<g className="links">
			{ linkList.map(linkObject => 
				<VisualizationPaneLink
					key={ linkObject.key }
					sourceID={ linkObject.sourceID }
					targetID={ linkObject.targetID }
					linkType={ linkObject.linkType } // for highlighting
					color={ linkObject.color }
					isHighlighted={ linkObject.isHighlighted }
					isOutlier={ linkObject.isOutlier }
					markerEnd={ linkObject.markerEnd }
					pathData={ linkObject.pathData }
					linkRowList={ linkObject.linkRowList }
					tooltipAttrList={ linkObject.tooltip.attributeList }
					dataTableAttrList={ linkObject.dataTable.attributeList }
					eventName={ linkObject.eventName }
					dispatch={ dispatch }
				/>) }
		</g>
	);
};
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

const generateMarkerEnd = ({ isDirected, linkType }) => 
	isDirected ? 'url(#arrow-end-' + linkType + ')' : null;


const addSourceTargetIndex = linkList => {
	const sourceTargetIDToLinkRowList = {
		sameSourceAndTarget: [],
		directed: [],
		undirected: []
	};

	// generate sourceTargetIDToLinkRowList
	for (let linkObject of linkList) {	
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

const updateLinkList = (
	linkList,
	countryIDToData,
	projection,
	hoverState
) => {
	addSourceTargetIndex(linkList);

	for (let linkObject of linkList) {
		const { sourceID, targetID, linkType } = linkObject;
		linkObject.key = `${ sourceID }-${ targetID }-${ linkType }`;
		linkObject.pathData = generatePathData(linkObject, countryIDToData, projection);
		linkObject.markerEnd = generateMarkerEnd(linkObject);
		linkObject.isHighlighted =  checkIfIsHighlighted(linkObject, hoverState);
	}

	return linkList;
};

export const VisualizationPaneLinks = ({
	linkList,
	countryIDToData,
	projectionState,
	hoverState,
	dispatch
}) => {
	const { projection } = projectionState;
	const hoveredNodesOrLinks = 
		hoverState.object === 'NODE' ||
		hoverState.object === 'LINK' ||
		hoverState.object === 'DETAIL_PANE_NODE' ||
		hoverState.object === 'DETAIL_PANE_LINK';
	const updatedLinkList = updateLinkList(
		linkList, // convert to linkList
		countryIDToData,
		projection,
		hoverState		
	);

	return (
		<g className="links">
			{ updatedLinkList.map(linkObject => 
				<VisualizationPaneLink
					key={ linkObject.key }
					sourceID={ linkObject.sourceID }
					targetID={ linkObject.targetID }
					linkType={ linkObject.linkType } // for highlighting
					color={ linkObject.color }
					linkOpacity={ linkObject.linkOpacity }
					thinLineOpacity={ linkObject.thinLineOpacity }
					isHighlighted={ linkObject.isHighlighted }
					hoveredNodesOrLinks={ hoveredNodesOrLinks } 
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
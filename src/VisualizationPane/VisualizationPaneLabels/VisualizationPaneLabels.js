import { VisualizationPaneLabel } from './VisualizationPaneLabel';
import { checkIfIsHighlighted } from '../VisualizationPaneLinks/VisualizationPaneLinks';

const generateMetadata = (visualizationPaneList, hoverState) => {
	const nodeIDSet = new Set();
	const highlightedNodeIDSet = new Set();

	for (let linkObject of visualizationPaneList) {
		const { sourceID, targetID } = linkObject;
		const isHighlighted = checkIfIsHighlighted(linkObject, hoverState);

		nodeIDSet.add(sourceID);
		nodeIDSet.add(targetID);

		if (isHighlighted) {
			highlightedNodeIDSet.add(sourceID);
			highlightedNodeIDSet.add(targetID);
		}
	}

	return [ nodeIDSet, highlightedNodeIDSet ];
};

const generateNodeList = (
	nodeIDSet, 
	highlightedNodeIDSet, 
	projection, 
	countryIDToData
) => {
	const nodeList = [];

	for (let nodeID of nodeIDSet) {
		const displayName = countryIDToData[nodeID].displayName;
		const isHighlighted = highlightedNodeIDSet.has(nodeID);
		const [ x, y ] = projection([
			countryIDToData[nodeID].longitude,
			countryIDToData[nodeID].latitude
		]);

		nodeList.push({
			key: nodeID,
			ID: nodeID,
			x: x, y: y,
			displayName: displayName,
			isHighlighted: isHighlighted
		});
	}

	return nodeList;
};

export const VisualizationPaneLabels = ({ 
	visualizationPaneList,
	countryIDToData,
	projectionState,
	hoverState,
	dispatch
}) => {
	const { projection } = projectionState;
	const [ nodeIDSet, highlightedNodeIDSet ] = generateMetadata(visualizationPaneList, hoverState);
	const nodeList = generateNodeList(nodeIDSet, highlightedNodeIDSet, projection, countryIDToData);

	return (
		<g className="labels">
			{ nodeList.map(nodeObject => 
				<VisualizationPaneLabel
					key={ nodeObject.key }
					ID={ nodeObject.ID }
					x={ nodeObject.x }
					y={ nodeObject.y } 
					displayName={ nodeObject.displayName }
					isHighlighted={ nodeObject.isHighlighted }
					dispatch={ dispatch }
				/>) }
		</g>
	);
};
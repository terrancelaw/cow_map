import { memo } from 'react';
import './VisualizationPaneMap.css';

export const VisualizationPaneMap = memo(({ 
	landData, 
	interiorData, 
	projectionState 
}) => {
	const { path } = projectionState;

	return (
		<g className="map">
			{ landData.features.map(feature => 
				<path key="land" className="land" d={ path(feature) }></path>) }
			<path className="interiors" d={ path(interiorData) } />
		</g>
	);
});
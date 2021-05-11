import { memo } from 'react';
import './VisualizationPaneDefs.css';

export const VisualizationPaneDefs = memo(({ linkPaneList }) => {
	return (
		<defs>
			{ linkPaneList
				.filter(({ isDirected }) => isDirected)
				.map(({ linkType, color }) => 
					<marker 
						key={ linkType } 
						id={ `arrow-end-${ linkType }` } 
						refX="5" 
						refY="3.5" 
						markerWidth="10" 
						markerHeight="10" 
						markerUnits="userSpaceOnUse" 
						orient="auto"
					>
						<path d="M 0 0 7 3.5 0 7" style={{ fill: color }} />
					</marker>) }
			<marker 
				id="arrow-end-outlier"
				refX="5" 
				refY="3.5" 
				markerWidth="10" 
				markerHeight="10" 
				markerUnits="userSpaceOnUse" 
				orient="auto"
			>
				<path d="M 0 0 7 3.5 0 7" />
			</marker>
		</defs>
	);
});
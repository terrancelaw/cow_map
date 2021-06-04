import { memo } from 'react';

export const VisualizationPaneDefs = memo(({ linkTypeList }) => {
	return (
		<defs>
			{ linkTypeList
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
		</defs>
	);
});
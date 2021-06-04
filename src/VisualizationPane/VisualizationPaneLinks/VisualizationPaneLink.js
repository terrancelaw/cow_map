import { memo } from 'react'; // reduce re-rendering on hover
import './VisualizationPaneLink.css';

export const VisualizationPaneLink = memo(({
	sourceID, 
	targetID, 
	linkType,
	color,
	linkOpacity,
	thinLineOpacity,
	isHighlighted,
	hoveredNodesOrLinks,
	markerEnd,
	pathData,
	linkRowList,
	tooltipAttrList,
	dataTableAttrList,
	eventName,
	dispatch
}) => {
	const handleMouseMove = event => 
		dispatch({ 
			type: 'MOUSE_MOVE_VIS_PANE_LINK',
			top: event.clientY, 
			left: event.clientX,
			sourceID, 
			targetID, 
			linkType,
			linkRowList, 
			tooltipAttrList,
			eventName
		});
	const handleMouseLeave = () => 
		dispatch({ type: 'MOUSE_LEAVE_VIS_PANE_LINK' });
	const handleClick = () => 
		dispatch({ 
			type: 'CLICK_VIS_PANE_LINK',
			sourceID, 
			targetID, 
			linkRowList, 
			dataTableAttrList,
			eventName
		});

	return (
		<g 
			className="link"
			onMouseMove={ handleMouseMove } 
			onMouseLeave={ handleMouseLeave }
			onClick={ handleClick }
			style={{ 
				opacity: hoveredNodesOrLinks && !isHighlighted ? 0.05 : linkOpacity 
			}}
		>
			<path 
				className="thick-line" 
				d={ pathData } 
				style={{ 
					stroke: color, 
					opacity: 0.1 
				}}
			/>
			<path 
				className="thin-line" 
				d={ pathData } 
				markerEnd={ markerEnd } 
				style={{ 
					stroke: color, 
					opacity: thinLineOpacity 
				}}
			/>
		</g>
	);
});
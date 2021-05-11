import { memo } from 'react'; // reduce re-rendering on hover
import './VisualizationPaneLink.css';

export const VisualizationPaneLink = memo(({
	sourceID, 
	targetID, 
	linkType,
	color,
	isHighlighted,
	isOutlier,
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
			sourceID, targetID, linkType,
			linkRowList, tooltipAttrList, eventName
		});
	const handleMouseLeave = () => 
		dispatch({ type: 'MOUSE_LEAVE_VIS_PANE_LINK' });
	const handleClick = () => 
		dispatch({ 
			type: 'CLICK_VIS_PANE_LINK',
			sourceID, targetID, 
			linkRowList, dataTableAttrList, eventName
		});

	return (
		<g 
			className="link"
			onMouseMove={ handleMouseMove } 
			onMouseLeave={ handleMouseLeave }
			onClick={ handleClick }
			style={ isHighlighted ? 
				{ opacity: 1 } : 
				{ opacity: 0.05 }
			}
		>
			<path
				className="thick-line"
				d={ pathData }
				style={ isOutlier ? 
					{ stroke: color, opacity: 0.6 } : 
					{ stroke: color, opacity: 0.1 } 
				}
			>
			</path>
			<path 
				className="thin-line" 
				d={ pathData }
				markerEnd={ markerEnd }
				style={ isOutlier ? null :
					{ stroke: color, opacity: 0.5 } 
				}
			></path>
		</g>
	);
});
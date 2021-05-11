import { memo } from 'react';
import './VisualizationPaneLabel.css';

export const VisualizationPaneLabel = memo(({ 
	ID, x, y, 
	displayName,
	isHighlighted,
	dispatch 
}) => {
	const handleMouseEnter = () => 
		dispatch({ type: "MOUSE_ENTER_VIS_PANE_LABEL", nodeID: ID });
	const handleMouseLeave = () => 
		dispatch({ type: "MOUSE_LEAVE_VIS_PANE_LABEL"  });

	return (
		<g 
			className="label" 
			onMouseEnter={ handleMouseEnter } 
			onMouseLeave={ handleMouseLeave }
			style={{ opacity: isHighlighted ? 1 : 0.1 }}
		>
			<text className="background" x={ x } y={ y }>{ displayName }</text>
			<text className="text" x={ x } y={ y }>{ displayName }</text>
		</g>
	);
});
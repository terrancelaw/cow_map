import $ from 'jquery';
import { memo } from 'react';
import './VisualizationPaneLegend.css';

export const VisualizationPaneLegend = memo(({ linkTypeList, dispatch }) => {
	const handleClickColor = (e, linkKey, currColor) => 
		dispatch({ 
			type: 'OPEN_COLOR_PICKER',
			linkKey: linkKey, 
			currColor: currColor,
			colorEl: $(e.target).closest('.legend-item').find('span.color')[0]
		});

	return (
		<div className="visualization-pane-legend">
			{ linkTypeList.map(({ key, color, displayName, isSegment, parentLinkDataObject  }) =>
				<div
					key={ key }
					className="legend-item"
					onClick={ e => { handleClickColor(e, key, color) } }
				>
					<span className="color" style={{ background: color, color: color }} />
					<span className="label">
						{ !isSegment ? displayName : `${ parentLinkDataObject.displayName } (${ displayName })` }
					</span>
				</div>) }
		</div>
	);
});
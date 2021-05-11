import $ from 'jquery';
import { memo } from 'react';
import './VisualizationPaneLegend.css';

export const VisualizationPaneLegend = memo(({ linkPaneList, dispatch }) => {
	const selectedLinkPaneList = linkPaneList.filter(({ isSelected }) => isSelected);
	const hasSelectedLinks = selectedLinkPaneList.length > 0;

	const handleClickColor = (e, linkKey, currColor) => 
		dispatch({ 
			type: 'OPEN_COLOR_PICKER',
			linkKey: linkKey, 
			currColor: currColor,
			colorEl: $(e.target).closest('.legend-item').find('span.color')[0]
		});

	return (
		<div className="visualization-pane-legend">

			{ selectedLinkPaneList.map(({ 
				key, color, displayName, isSubItem, parentLinkDataObject 
			}) => 
				<div 
					key={ key } 
					className="color legend-item"
					onClick={ e => { handleClickColor(e, key, color) } }
				>
					<span 
						className="color"
						style={{ background: color, color: color }}
					/>
					<span className="label">
						{ !isSubItem ? displayName :
							`${ parentLinkDataObject.displayName } (${ displayName })` }
					</span>
				</div>) }

			{ hasSelectedLinks ? <>
				<div className="seperator"></div>

				<div className="legend-item">
					<span className="link-type non-outlier">
						<span className="thick-link"></span>
						<span className="thin-link"></span>
					</span>
					<span className="label">
						Count ≤ 90th percentile
					</span>
				</div>

				<div className="legend-item">
					<span className="link-type outlier">
						<span className="thick-link"></span>
						<span className="thin-link"></span>
					</span>
					<span className="label">
						Count > 90th percentile
					</span>
				</div>
			</> : null }

		</div>
	);
});
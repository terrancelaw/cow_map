import { useRef, memo } from 'react'; // memo to avoid re-rendering on data selection pane tooltip
import { useProjection } from './useVisualizationPane/useProjection';
import { VisualizationPaneLegend } from './VisualizationPaneLegend/VisualizationPaneLegend';
import { VisualizationPaneControls } from './VisualizationPaneControls/VisualizationPaneControls';
import { VisualizationPaneDefs } from './VisualizationPaneDefs/VisualizationPaneDefs';
import { VisualizationPaneMap } from './VisualizationPaneMap/VisualizationPaneMap';
import { VisualizationPaneLinks } from './VisualizationPaneLinks/VisualizationPaneLinks';
import { VisualizationPaneLabels } from './VisualizationPaneLabels/VisualizationPaneLabels';
import { TimelineSlider } from './TimelineSlider/TimelineSlider';
import { Loader } from '../widgets/Loader/Loader';
import './VisualizationPane.css';

export const VisualizationPane = memo(({
	landData, 
	interiorData,
	countryIDToData,
	linkPaneList,
	visualizationPaneList,
	timelineSliderState,
	hoverState,
	detailPaneIsOpen,
	dispatch
}) => {
	const SVGRef = useRef(null);
	const projectionState = useProjection(SVGRef, landData);

	return (
		<div 
			id="visualization-pane" 
			className={ 
				detailPaneIsOpen 
				? "collapsed loader-installed" 
				: "expanded loader-installed" 
			}
		>
			<VisualizationPaneLegend 
				linkPaneList={ linkPaneList }
				dispatch={ dispatch }
			/>
			<VisualizationPaneControls 
				SVGRef={ SVGRef }
				landData={ landData }
				projectionState={ projectionState }
				dispatch={ dispatch }
			/>
			<svg ref={ SVGRef }>
				{ projectionState.isLoading ? null : <> { /* render upon finish loading */ }
					<VisualizationPaneDefs 
						linkPaneList={ linkPaneList }
					/>
					<VisualizationPaneMap 
						landData={ landData }
						interiorData={ interiorData }
						projectionState={ projectionState } 
					/>
					<VisualizationPaneLinks 
						visualizationPaneList={ visualizationPaneList }
						countryIDToData={ countryIDToData }
						projectionState={ projectionState }
						hoverState={ hoverState }
						dispatch={ dispatch }
					/>
					<VisualizationPaneLabels
						visualizationPaneList={ visualizationPaneList }
						countryIDToData={ countryIDToData }
						projectionState={ projectionState }
						hoverState={ hoverState }
						dispatch={ dispatch }
					/>
				</> }
			</svg>
			<TimelineSlider 
				timelineSliderState={ timelineSliderState }
				dispatch={ dispatch }
			/>
			<Loader 
				isLoading={ projectionState.isLoading } 
			/>
		</div>
	);
}, (prevProps, nextProps) =>
	prevProps.landData === nextProps.landData &&
	prevProps.interiorData === nextProps.interiorData &&
	prevProps.countryIDToData === nextProps.countryIDToData &&
	prevProps.linkPaneList === nextProps.linkPaneList &&
	prevProps.visualizationPaneList === nextProps.visualizationPaneList &&
	prevProps.timelineSliderState === nextProps.timelineSliderState &&
	prevProps.detailPaneIsOpen === nextProps.detailPaneIsOpen && 
	prevProps.dispatch === nextProps.dispatch && !(
		// visualization pane looks different for these hover events
		prevProps.hoverState.object === 'LINK' ||
   		nextProps.hoverState.object === 'LINK' ||
   		prevProps.hoverState.object === 'NODE' ||
   		nextProps.hoverState.object === 'NODE' ||
   		prevProps.hoverState.object === 'DETAIL_PANE_NODE' ||
   		nextProps.hoverState.object === 'DETAIL_PANE_NODE' ||
   		prevProps.hoverState.object === 'DETAIL_PANE_LINK' ||
   		nextProps.hoverState.object === 'DETAIL_PANE_LINK'
	)
);
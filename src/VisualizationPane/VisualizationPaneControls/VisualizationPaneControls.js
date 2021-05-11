import $ from 'jquery';
import { memo } from 'react';
import { select, geoNaturalEarth1, zoomIdentity } from 'd3';
import { BiZoomIn, BiZoomOut, BiCurrentLocation } from "react-icons/bi";
import { margin } from '../useVisualizationPane/useProjection';
import './VisualizationPaneControls.css';

export const VisualizationPaneControls = memo(({ 
	SVGRef, 
	landData, 
	projectionState,
	dispatch
}) => {
	const handleMouseEnterButton = event => dispatch({ 
		type: 'MOUSE_ENTER_CONTROL_BUTTON',
		buttonEl: $(event.target).closest('.button')[0],
		text: $(event.target).closest('.button').attr('tooltip-text')
	});
	const handleMouseLeaveButton = () => 
		dispatch({ type: 'MOUSE_LEAVE_CONTROL_BUTTON' });

	const handleClickZoomInBtn = () => {
		const { zoomHandler } = projectionState;
		const SVGEl = SVGRef.current;
		const SVG = select(SVGEl)
			.transition()
			.duration(400);

		zoomHandler.scaleBy(SVG, 2);
	};
	const handleClickZoomOutBtn = () => {
		const { zoomHandler } = projectionState;
		const SVGEl = SVGRef.current;
		const SVG = select(SVGEl)
			.transition()
			.duration(400);

		zoomHandler.scaleBy(SVG, 1 / 2);
	};
	const handleClickResetBtn = () => {
		const { zoomHandler } = projectionState;
		const SVGEl = SVGRef.current;
		const SVG = select(SVGEl)
			.transition()
			.duration(400);

		const { width, height } = SVGEl.getBoundingClientRect();
		const projection = geoNaturalEarth1()
			.fitExtent([ 
				[ margin.left, margin.top ], 
				[ width - margin.right, height - margin.bottom ] 
			], landData);
		const initialScale = projection.scale();
		const initialTranslate = projection.translate();

		 // reset translate because screen size may have changed
		 zoomHandler.scaleExtent([ 
			initialScale * 0.8, 
			initialScale * 10 
		]);
		SVG.call(
			zoomHandler.transform, 
			zoomIdentity
				.translate(...initialTranslate)
				.scale(initialScale)
		);
	};

	return (
		<div className="controls">
			<div 
				className="zoomin-btn button"
				tooltip-text="Zoom in"
				onClick={ handleClickZoomInBtn }
				onMouseEnter={ handleMouseEnterButton }
				onMouseLeave={ handleMouseLeaveButton }
			><BiZoomIn /></div>
			<div 
				className="zoomout-btn button"
				tooltip-text="Zoom out"
				onClick={ handleClickZoomOutBtn }
				onMouseEnter={ handleMouseEnterButton }
				onMouseLeave={ handleMouseLeaveButton }
			><BiZoomOut /></div>
			<div 
				className="reset-btn button"
				tooltip-text="Reset zoom and pan"
				onClick={ handleClickResetBtn }
				onMouseEnter={ handleMouseEnterButton }
				onMouseLeave={ handleMouseLeaveButton }
			><BiCurrentLocation /></div>
		</div>
	);
}, (prevProps, nextProps) => {
	const { 
		SVGRef: prevSVGRef,
		landData: prevLandData,
		projectionState: { zoomHandler: prevZoomHandler } 
	} = prevProps;
	const { 
		SVGRef: nextSVGRef,
		landData: nextLandData,
		projectionState: { zoomHandler: nextZoomHandler	} 
	} = nextProps;

	return prevSVGRef === nextSVGRef &&
		   prevLandData === nextLandData &&
		   prevZoomHandler === nextZoomHandler;
});
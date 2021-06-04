import $ from 'jquery';
import { memo } from 'react';
import { select, geoNaturalEarth1, zoomIdentity } from 'd3';
import { 
	BiZoomIn, 
	BiZoomOut, 
	BiCurrentLocation, 
	BiSearch, 
	BiDetail,
	BiColorFill,
	BiFilterAlt,
	BiInfoCircle
} from "react-icons/bi";
import { IoCloseCircle } from "react-icons/io5";
import { margin } from '../useVisualizationPane/useProjection';
import './VisualizationPaneControls.css';

export const VisualizationPaneControls = memo(({
	SVGRef, 
	landData, 
	projectionState,
	detailPaneIsOpen,
	colorPaneIsOpen,
	filterPaneIsOpen,
	dispatch
}) => {
	const handleMouseEnterButton = event => dispatch({ 
		type: 'MOUSE_ENTER_CONTROL_BUTTON',
		buttonEl: $(event.target).closest('.button')[0],
		text: $(event.target).closest('.button').attr('tooltip-text'),
		isDark: $(event.target).closest('.button').hasClass('dark')
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
	const handleClickSearchWindowBtn = () => 
		dispatch({ type: 'OPEN_SEARCH_WINDOW' });
	const handleClickDetailPaneBtn = () =>
		dispatch({ type: 'TOGGLE_DETAIL_PANE' });
	const handleClickColorPaneBtn = () =>
		dispatch({ type: 'TOGGLE_COLOR_PANE' });
	const handleClickFilterPaneBtn = () => 
		dispatch({ type: 'TOGGLE_FILTER_PANE' });
	const handleClickReferenceButton = () => 
		dispatch({ type: 'OPEN_REFERENCE' });

	return (
		<div className="controls">
			<div
				className="zoom-in-btn button"
				tooltip-text="Zoom in"
				onMouseEnter={ handleMouseEnterButton }
				onMouseLeave={ handleMouseLeaveButton }
				onClick={ handleClickZoomInBtn }
			><BiZoomIn /></div>
			<div
				className="zoom-out-btn button"
				tooltip-text="Zoom out"
				onMouseEnter={ handleMouseEnterButton }
				onMouseLeave={ handleMouseLeaveButton }
				onClick={ handleClickZoomOutBtn }
			><BiZoomOut /></div>
			<div 
				className="reset-btn button"
				tooltip-text="Reset zoom and pan"
				onMouseEnter={ handleMouseEnterButton }
				onMouseLeave={ handleMouseLeaveButton }
				onClick={ handleClickResetBtn }
			><BiCurrentLocation /></div>
			<div 
				className="search-window-btn button"
				tooltip-text="Open search window"
				onMouseEnter={ handleMouseEnterButton }
				onMouseLeave={ handleMouseLeaveButton }
				onClick={ handleClickSearchWindowBtn }
			><BiSearch /></div>
			{ !detailPaneIsOpen ? 
				<div 
					className="detail-pane-btn button"
					tooltip-text="Show details of current network"
					onMouseEnter={ handleMouseEnterButton }
					onMouseLeave={ handleMouseLeaveButton }
					onClick={ handleClickDetailPaneBtn }
				><BiDetail /></div> :
				<div 
					className="detail-pane-btn button dark"
					tooltip-text="Close right pane"
					onMouseEnter={ handleMouseEnterButton }
					onMouseLeave={ handleMouseLeaveButton }
					onClick={ handleClickDetailPaneBtn }
				><IoCloseCircle /></div>
			}
			{ !colorPaneIsOpen ?
				<div
					className="color-pane-btn button"
					tooltip-text="Color links"
					onMouseEnter={ handleMouseEnterButton }
					onMouseLeave={ handleMouseLeaveButton }
					onClick={ handleClickColorPaneBtn }
				><BiColorFill /></div> :
				<div
					className="color-pane-btn button dark"
					tooltip-text="Close right pane"
					onMouseEnter={ handleMouseEnterButton }
					onMouseLeave={ handleMouseLeaveButton }
					onClick={ handleClickColorPaneBtn }
				><IoCloseCircle /></div> }
			{ !filterPaneIsOpen ?
				<div
					className="filter-pane-btn button"
					tooltip-text="Filter links"
					onMouseEnter={ handleMouseEnterButton }
					onMouseLeave={ handleMouseLeaveButton }
					onClick={ handleClickFilterPaneBtn }
				><BiFilterAlt /></div> :
				<div
					className="filter-pane-btn button dark"
					tooltip-text="Close right pane"
					onMouseEnter={ handleMouseEnterButton }
					onMouseLeave={ handleMouseLeaveButton }
					onClick={ handleClickFilterPaneBtn }
				><IoCloseCircle /></div> }
			<div
				className="reference button"
				tooltip-text="References"
				onMouseEnter={ handleMouseEnterButton }
				onMouseLeave={ handleMouseLeaveButton }
				onClick={ handleClickReferenceButton }
			><BiInfoCircle /></div>
		</div>
	);
}, (prevProps, nextProps) => {
	const { 
		SVGRef: prevSVGRef,
		landData: prevLandData,
		projectionState: { zoomHandler: prevZoomHandler },
		detailPaneIsOpen: prevDetailPaneIsOpen,
		colorPaneIsOpen: prevColorPaneIsOpen,
		filterPaneIsOpen: prevFilterPaneIsOpen
	} = prevProps;
	const { 
		SVGRef: nextSVGRef,
		landData: nextLandData,
		projectionState: { zoomHandler: nextZoomHandler	},
		detailPaneIsOpen: nextDetailPaneIsOpen,
		colorPaneIsOpen: nextColorPaneIsOpen,
		filterPaneIsOpen: nextFilterPaneIsOpen
	} = nextProps;

	return prevSVGRef === nextSVGRef &&
		   prevLandData === nextLandData &&
		   prevZoomHandler === nextZoomHandler &&
		   prevDetailPaneIsOpen === nextDetailPaneIsOpen &&
		   prevColorPaneIsOpen === nextColorPaneIsOpen &&
		   prevFilterPaneIsOpen === nextFilterPaneIsOpen;
});
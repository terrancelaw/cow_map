import { useState, useEffect } from 'react';
import { 
	zoom, 
	select,
	zoomIdentity,
	geoNaturalEarth1,
	geoPath
} from 'd3';

export const margin = {
	top: 30, 
	left: -51, 
	bottom: 60, // more space for the timeline slider
	right: 10
};

export const useProjection = (SVGRef, landData) => {
	const [ projectionState, setProjection ] = useState({
		projection: null,
		path: null,
		zoomHandler: null,
		isLoading: true
	});

	useEffect(() => {
		if (SVGRef.current === null ||
			landData === null)
			return;

		const SVGEl = SVGRef.current;
		const { width, height } = SVGEl.getBoundingClientRect();
		const projection = geoNaturalEarth1()
			.fitExtent([ 
				[ margin.left, margin.top ], 
				[ width - margin.right, height - margin.bottom ] 
			], landData);
		const path = geoPath(projection);
		const initialScale = projection.scale();
		const initialTranslate = projection.translate();
		const zoomHandler = zoom()
			.scaleExtent([ 
				initialScale * 0.8, 
				initialScale * 10 
			]);

		zoomHandler.on('zoom', e => {
			const newScale = e.transform.k;
			const newTranslate = [ e.transform.x, e.transform.y ];

			setProjection(prevProjectionState => {
				if (!prevProjectionState.projection)
					return {
						projection,
						path,
						zoomHandler,
						isLoading: false
					};
				if (prevProjectionState.projection) {
					prevProjectionState.projection
						.translate(newTranslate)
						.scale(newScale);

					return { ...prevProjectionState }; // re-render on zoom
				}
			});
		});
		select(SVGEl)
			.call(zoomHandler)
			.call(
				zoomHandler.transform, 
				zoomIdentity
					.translate(...initialTranslate)
					.scale(initialScale)
			);
		return () => { 
			select(SVGEl).on('.zoom', null) 
		};
	}, [ SVGRef, landData ]);

	return projectionState;
};
import { useRef, useEffect, useState } from 'react';

export const useTooltip = hoverState => {
	const tooltipRef = useRef();
	const [ { tooltipTop, tooltipLeft }, setTooltipTopLeft ] = useState({ 
		tooltipTop: null, 
		tooltipLeft: null
	});
	const tooltipEl = tooltipRef.current;
	const { top, left } = hoverState.object === 'LINK' ? hoverState.data : { top: null, left: null }; // flip only for vis pane tooltip

	useEffect(() => {
		if (!tooltipEl) 
			return;

		const { width: tooltipWidth, height: tooltipHeight } = tooltipEl.getBoundingClientRect();
		const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
		const tooltipTop = (top + 8 + tooltipHeight > windowHeight) ? top - tooltipHeight - 8 - 8 : top;
		const tooltipLeft = (left + 8 + tooltipWidth > windowWidth) ? left - tooltipWidth - 8 - 8: left;
		
		setTooltipTopLeft({ tooltipTop, tooltipLeft });
	}, [ tooltipEl, top, left ]);

	return [ tooltipRef, tooltipTop, tooltipLeft ];
};
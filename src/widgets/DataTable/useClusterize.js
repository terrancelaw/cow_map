import $ from 'jquery'; 
import 'jquery-ui/ui/widgets/resizable';
import { useState, useEffect } from 'react';
import Clusterize from 'clusterize.js';

const widthConstraintRules = {};

const generateWidthConstraintCSS = () => {
	let widthConstraintCSS = '';

	for (let tableName in widthConstraintRules)
		for (let columnIndex in widthConstraintRules[tableName])
			widthConstraintCSS += `.${ tableName }.data-table .row > .cell:nth-child(${ columnIndex }) { 
				width: ${ widthConstraintRules[tableName][columnIndex] }px;
			}`;

	return widthConstraintCSS;
};

export const useClusterize = (tableName, tableRowList) => {
	const [ clusterizeObject, initClusterizeObject ] = useState(null);

	useEffect(() => {
		const handleStartResize = (event, ui) => {
			if (!(tableName in widthConstraintRules))
				widthConstraintRules[tableName] = {};

			ui.element.find('.ui-resizable-handle')
				.css('background', 'DodgerBlue');
		};
		const handleEndResize = (event, ui) => {
			const columnIndex = ui.element.index() + 1;
			const newWidthAfterResizing = ui.size.width;
			let widthConstraintCSS = '';

			widthConstraintRules[tableName][columnIndex] = newWidthAfterResizing;
			widthConstraintCSS = generateWidthConstraintCSS();
			$('#table-resize-style').html(widthConstraintCSS);

			ui.element.find('.ui-resizable-handle')
				.css('background', '');
		};

		// init table on mount
		initClusterizeObject(new Clusterize({
			scrollId: `${ tableName }-scroll-area`,
	  		contentId: `${ tableName }-content-area`
		}));
		$(`.${ tableName }.data-table > .header > .row > .cell`).resizable({
			handles: 'e',
			start: handleStartResize,
			stop: handleEndResize
		});

		// remove css on unmount
		return () => { 
			let widthConstraintCSS = '';
			delete widthConstraintRules[tableName];
			widthConstraintCSS = generateWidthConstraintCSS();
			$('#table-resize-style').html(widthConstraintCSS);
		}
	}, [ tableName ]);

	useEffect(() => {
		if (clusterizeObject === null)
			return;

		clusterizeObject.update(tableRowList);
	}, [ clusterizeObject, tableRowList ]);
};
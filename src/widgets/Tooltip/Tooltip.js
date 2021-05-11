import { memo } from 'react';
import { useTooltip } from './useTooltip';
import { LinkDescription } from '../LinkDescription/LinkDescription';
import './Tooltip.css';

const generateAttributeValuePairList = (linkRowObject, tooltipAttrList, countryIDToData) => {
	const attributeValuePairList = [];

	for (let { attributeName, displayName, isID } of tooltipAttrList) {
		let attributeValue = linkRowObject[attributeName];

		if (attributeValue === '')
			attributeValue = 'null';
		else if (isID)
			attributeValue = countryIDToData[attributeValue].displayName;

		attributeValuePairList.push({
			attributeName: displayName,
			attributeValue: attributeValue
		});
	}

	return attributeValuePairList;
};

export const Tooltip = memo(({
	hoverState,
	timelineSliderState,
	countryIDToData
}) => {
	const [ tooltipRef, tooltipTop, tooltipLeft ] = useTooltip(hoverState);

	// tooltip for data selection pane item
	if (hoverState.object === 'DATA_SELECTION_PANE_ITEM') {
		const { top, left, text } = hoverState.data;

		return (
			<div 
				className="data-selection-pane tooltip"
				style={{ top: top, left: left }}
			>{ text }</div>
		);
	}

	// tooltip for link
	if (hoverState.object === 'LINK') {
		const { 
			sourceID, targetID,
			linkRowList, tooltipAttrList, eventName
		} = hoverState.data;
		const linkRowCount = linkRowList.length;

		if (linkRowCount > 1) {
			const sourceName = countryIDToData[sourceID].displayName;
			const targetName = countryIDToData[targetID].displayName;

			return (
				<div 
					ref={ tooltipRef }
					className="visualization-pane tooltip multiple"
					style={{ 
						top: tooltipTop, 
						left: tooltipLeft, 
						opacity: tooltipLeft !== null ? null : 0 
					}}
				><LinkDescription 
					linkRowCount={ linkRowCount }
					sourceName={ sourceName }
					targetName={ targetName }
					timelineSliderState={ timelineSliderState }
					eventName={ eventName }
				/>(Click to see details)</div>
			);
		}

		if (linkRowCount === 1) {
			const attributeValuePairList = generateAttributeValuePairList(
				linkRowList[0], tooltipAttrList, countryIDToData
			);

			return (
				<div 
					ref={ tooltipRef }
					className="visualization-pane tooltip single"
					style={{ 
						top: tooltipTop, 
						left: tooltipLeft, 
						opacity: tooltipLeft !== null ? null : 0 
					}}
				>{ attributeValuePairList.map(attributeObject => [ 
					<div 
						key={ `${ attributeObject.attributeName }-name` } 
						className="attribute-name"
					>{ `${ attributeObject.attributeName }:` }</div>,
					<div 
						key={ `${ attributeObject.attributeName }-value` } 
						className="attribute-value"
					>{ attributeObject.attributeValue }</div>
				]) }</div>
			);
		}
	}

	// tooltip for detail pane button
	if (hoverState.object === 'DETAIL_PANE_BUTTON') {
		const { top, right, text } = hoverState.data;

		return (
			<div 
				className="detail-pane tooltip light"
				style={{ top: top, right: right }}
			>{ text }</div>
		);
	}

	// tooltip for detail pane item
	if ((hoverState.object === 'DETAIL_PANE_NODE' && hoverState.data.showTooltip) ||
		(hoverState.object === 'DETAIL_PANE_LINK' && hoverState.data.showTooltip)) {
		const { top, right, text } = hoverState.data;

		return (
			<div 
				className="detail-pane tooltip dark"
				style={{ top: top, right: right }}
			>{ text }</div>
		);
	}

	// tooltip for search pane button
	if (hoverState.object === 'SEARCH_WINDOW_BUTTON') {
		const { top, right, text } = hoverState.data;

		return (
			<div 
				className="search-window tooltip"
				style={{ top: top, right: right }}
			>{ text }</div>
		);
	}

	// tooltip for control buttons
	if (hoverState.object === 'CONTROL_BUTTON') {
		const { top, left, text } = hoverState.data;

		return (
			<div 
				className="control tooltip"
				style={{ top: top, left: left }}
			>{ text }</div>
		);
	}

	return null;
}, (prevProps, nextProps) => 
	prevProps.hoverState === nextProps.hoverState);
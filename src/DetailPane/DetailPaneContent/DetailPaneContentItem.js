import $ from 'jquery';
import './DetailPaneContentItem.css';

export const DetailPaneContentItem = ({
	titleText,
	contentText,
	className,
	itemData,
	visualization,
	dispatch
}) => {
	const handleMouseLeave = () => dispatch({ type: 'MOUSE_LEAVE_DETAIL_PANE_ITEM' });
	const handleMouseEnter = event => dispatch({ 
		type: 'MOUSE_ENTER_DETAIL_PANE_ITEM',
		itemEl: $(event.target).closest('.item')[0],
		titleEl: $(event.target).closest('.item').find('.title')[0],
		titleText, itemData
	});

	return (
		<div 
			className={ `${ className } item` }
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
		>
			<div className="title">{ titleText }</div>
			<div className="content">
				<span className="text">{ contentText }</span>
				{ visualization }
			</div>
		</div>
	);
};
import './DataSelectionPaneItem.css';

export const DataSelectionPaneItem = ({
	isSelected,
	displayName,
	handleSelect,
	handleMouseEnter,
	handleMouseLeave
}) => 
	<label 
		className="item"
		onMouseEnter={ handleMouseEnter } 
		onMouseLeave={ handleMouseLeave }
	>
		<input type="checkbox" checked={ isSelected } onChange={ handleSelect } />
		<span className="checkmark" />
		<span className="text">{ displayName }</span>
	</label>
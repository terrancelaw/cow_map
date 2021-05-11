import { CgClose } from "react-icons/cg";
import './DataSelectionPaneItem.css';

export const DataSelectionPaneItem = ({
	isSelected,
	isSubItem,
	canDelete,
	displayName,
	handleSelect,
	handleMouseEnter,
	handleMouseLeave,
	handleRemove
}) => {
	let className = 'item';

	if (isSubItem) className = `sub ${ className }`;
	if (canDelete) className = `deletable ${ className }`;

	return (
		<div className={ className }>

			<label 
				onMouseEnter={ handleMouseEnter } 
				onMouseLeave={ handleMouseLeave }
			>
				<input 
					type="checkbox" 
					checked={ isSelected } 
					onChange={ handleSelect }
				/>
				<span className="checkmark"></span>
				<span className="text">{ displayName }</span>
			</label>

			{ !canDelete ? null :
				<div 
					className="remove-button"
					onClick={ handleRemove }
				><CgClose /></div> }

		</div>
	);
};
import { FaRegSquare, FaRegCheckSquare } from "react-icons/fa";
import './FilterPaneCategoryList.css';

export const FilterPaneCategoryList = ({
	categoryList,
	dispatch
}) => {
	const handleSelectItem = itemKey =>
		dispatch({ type: 'SELECT_FILTER_PANE_CATEGORY', itemKey });
	const handleClickSelectNone = () =>
		dispatch({ type: 'SELECT_FILTER_PANE_CATEGORIES', isSelected: false });
	const handleClickSelectAll = () =>
		dispatch({ type: 'SELECT_FILTER_PANE_CATEGORIES', isSelected: true });

	return (
		<div className="category-list">
			<div className="content">
				{ categoryList.map(({ key, displayName, isSelected }) => 
					<label className="item" key={ key }>
						<input 
							type="checkbox" 
							checked={ isSelected } 
							onChange={ () => { handleSelectItem(key) } }
						/>
						<span className="checkmark"></span>
						<span className="text">{ displayName }</span>
					</label>) }
			</div>
			<div className="footer">
				<span className="select-none button" onClick={ handleClickSelectNone }>
					<FaRegSquare/><span className="text">Select None</span>
				</span>
				<span className="select-all button" onClick={ handleClickSelectAll }>
					<FaRegCheckSquare/><span className="text">Select All</span>
				</span>
			</div>
		</div>
	);
}
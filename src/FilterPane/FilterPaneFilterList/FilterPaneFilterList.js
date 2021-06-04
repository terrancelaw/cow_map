import { IoCloseOutline } from 'react-icons/io5';
import './FilterPaneFilterList.css';

export const FilterPaneFilterList = ({ appliedFilterList, dispatch }) => {
	const handleClickRemoveButton = listItem =>
		dispatch({ type: 'REMOVE_FILTER_PANE_FILTER', listItem });

	if (appliedFilterList.length === 0)
		return null;

	return (
		<div className="applied-filters">

			<div className="label">APPLIED FILTERS</div>

			<div className="list">
				{ appliedFilterList.map(listItem => 
					<div key={ `${ listItem.dataSet.key }-${ listItem.attribute.key }` } className="list-item">

						<span 
							className="remove-button"
							onClick={ () => { handleClickRemoveButton(listItem) } }
						><IoCloseOutline /></span>

						<span className="description">{ 
							`Filtered ${ listItem.dataSet.displayName } by ${ listItem.attribute.displayName }` 
						}</span>

					</div>) }
			</div>

		</div>
	);
};
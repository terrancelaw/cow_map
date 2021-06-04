import { IoCloseOutline } from 'react-icons/io5';
import './ColorPaneList.css';

export const ColorPaneList = ({ appliedColoringList, dispatch }) => {
	const handleClickRemoveButton = listItem =>
		dispatch({ type: 'REMOVE_COLOR_PANE_LIST_ITEM', listItem });

	if (appliedColoringList.length === 0)
		return null;

	return (
		<div className="applied-coloring">

			<div className="label">APPLIED COLORING</div>

			<div className="list">
				{ appliedColoringList.map(listItem => 
					<div key={ `${ listItem.dataSet.key }-${ listItem.attribute.key }` } className="list-item">

						<span 
							className="remove-button"
							onClick={ () => { handleClickRemoveButton(listItem) } }
						><IoCloseOutline /></span>

						<span className="description">{ 
							`Colored ${ listItem.dataSet.displayName } by ${ listItem.attribute.displayName }` 
						}</span>

					</div>) }
			</div>
			
		</div>
	);
};
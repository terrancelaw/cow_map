import { DataSelectionPaneItem } from './DataSelectionPaneItem';
import { FaRegSquare, FaRegCheckSquare } from "react-icons/fa";
import './DataSelectionPane.css';

export const DataSelectionPane = ({
	id, 
	headerText, 
	headerIcon, 
	itemList,
	handleSelectItem,
	handleClickSelectNone,
	handleClickSelectAll,
	handleMouseEnterItem,
	handleMouseLeaveItem
}) =>
	<div className="data-selection-pane" id={ id }>
		<div className="header">
			{ headerIcon }<span className="text">{ headerText }</span>
		</div>
		<div className="content">
			{ itemList
				.filter(itemObject => itemObject.isShown)
				.map(itemObject => 
					<DataSelectionPaneItem
						key={ itemObject.key }
						isSelected={ itemObject.isSelected }
						displayName={ itemObject.displayName }
						handleSelect={ () => { handleSelectItem(itemObject.key) } }
						handleMouseEnter={ handleMouseEnterItem }
						handleMouseLeave={ handleMouseLeaveItem }
					/>) }
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
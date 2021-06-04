import $ from 'jquery';
import { memo } from 'react'; // avoid re-rendering on tooltip and time slider changes
import { DataSelectionPane } from './DataSelectionPane';
import { BiNetworkChart } from 'react-icons/bi';
import { CgSoftwareUpload, CgSoftwareDownload } from "react-icons/cg";

const checkIsOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) => 
	scrollHeight > clientHeight || scrollWidth > clientWidth;

export const DataSelectionPanes = memo(({
	linkPaneList,
	sourcePaneList,
	targetPaneList,
	dispatch
}) => {
	const handleSelectLink = linkKey => 
		dispatch({ type: 'SELECT_LINK_PANE_ITEM', linkKey });
	const handleSelectLinks = isSelected => 
		dispatch({ type: 'SELECT_LINK_PANE_ITEMS', isSelected });
	const handleSelectSource = sourceKey => 
		dispatch({ type: 'SELECT_SOURCE_PANE_ITEM', sourceKey });
	const handleSelectSources = isSelected => 
		dispatch({ type: 'SELECT_SOURCE_PANE_ITEMS', isSelected });
	const handleSelectTarget = targetKey => 
		dispatch({ type: 'SELECT_TARGET_PANE_ITEM', targetKey });
	const handleSelectTargets = isSelected => 
		dispatch({ type: 'SELECT_TARGET_PANE_ITEMS', isSelected });
	const handleMouseEnterItem = event => {
		const textEl = $(event.target).closest('.item').find('.text')[0];
		const isTextTooLong = checkIsOverflown(textEl);

		if (isTextTooLong)
			dispatch({ type: 'MOUSE_ENTER_DATA_SELECTION_PANE_ITEM', textEl });
	};
	const handleMouseLeaveItem = () => 
		dispatch({ type: 'MOUSE_LEAVE_DATA_SELECTION_PANE_ITEM' });

	return (
		<>
			<DataSelectionPane
				id="link-pane" 
				headerIcon={ <BiNetworkChart /> }
				headerText="Links" 
				itemList={ linkPaneList }
				handleSelectItem={ handleSelectLink }
				handleClickSelectNone={ () => { handleSelectLinks(false) } }
				handleClickSelectAll={ () => { handleSelectLinks(true) } }
				handleMouseEnterItem={ handleMouseEnterItem }
				handleMouseLeaveItem={ handleMouseLeaveItem }
			/>
			<DataSelectionPane 
				id="source-pane"
				headerIcon={ <CgSoftwareUpload /> }
				headerText="Sources" 
				itemList={ sourcePaneList }
				handleSelectItem={ handleSelectSource }
				handleClickSelectNone={ () => { handleSelectSources(false) } }
				handleClickSelectAll={ () => { handleSelectSources(true) } }
				handleMouseEnterItem={ handleMouseEnterItem }
				handleMouseLeaveItem={ handleMouseLeaveItem }
			/>
			<DataSelectionPane 
				id="target-pane" 
				headerIcon={ <CgSoftwareDownload /> }
				headerText="Targets" 
				itemList={ targetPaneList }
				handleSelectItem={ handleSelectTarget }
				handleClickSelectNone={ () => { handleSelectTargets(false) } }
				handleClickSelectAll={ () => { handleSelectTargets(true) } }
				handleMouseEnterItem={ handleMouseEnterItem }
				handleMouseLeaveItem={ handleMouseLeaveItem }
			/>
		</>
	);
});
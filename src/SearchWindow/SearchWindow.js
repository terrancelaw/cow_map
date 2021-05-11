import $ from 'jquery';
import { memo } from 'react';
import { BiSearch } from "react-icons/bi";
import { Loader } from '../widgets/Loader/Loader';
import { SearchWindowHeader } from './SearchWindowHeader/SearchWindowHeader';
import { SearchWindowContent } from './SearchWindowContent/SearchWindowContent';
import { useSearchState } from './useSearchState/useSearchState';
import './SearchWindow.css';

export const SearchWindow = memo(({
	dataState,
	detailPaneIsOpen,
	searchWindowIsOpen,
	interfaceDispatch
}) => {
	const [ {
		source: sourceState,
		target: targetState,
		content: contentState,
		isLoading: searchWindowIsLoading
	}, searchDispatch ] = useSearchState({ searchWindowIsOpen }, dataState);

	const handleClickOpenButton = () => 
		interfaceDispatch({ type: 'OPEN_SEARCH_WINDOW' });
	const handleMouseEnterOpenButton = event => 
		interfaceDispatch({ 
			type: 'MOUSE_ENTER_SEARCH_WINDOW_BUTTON',
			buttonEl: $(event.target).closest('.button')[0]
		});
	const handleMouseLeaveOpenButton = () => 
		interfaceDispatch({ type: 'MOUSE_LEAVE_SEARCH_WINDOW_BUTTON' });
	
	if (!searchWindowIsOpen)
		return (
			<div 
				className="search-window button"
				onClick={ handleClickOpenButton }
				onMouseEnter={ handleMouseEnterOpenButton }
				onMouseLeave={ handleMouseLeaveOpenButton }
				style={{ right: !detailPaneIsOpen ? 40 : 290 }}
			><BiSearch /></div>
		);

	return (
		<div id="search-window" className="loader-installed">
			<SearchWindowHeader 
				sourceState={ sourceState }
				targetState={ targetState }
				searchDispatch={ searchDispatch }
				interfaceDispatch={ interfaceDispatch }
			/>
			<SearchWindowContent
				contentState={ contentState }
				searchDispatch={ searchDispatch }
			/>
			{ searchWindowIsLoading && <Loader /> }
		</div>
	);
});
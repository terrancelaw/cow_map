import { memo } from 'react';
import { Loader } from '../widgets/Loader/Loader';
import { SearchWindowHeader } from './SearchWindowHeader/SearchWindowHeader';
import { SearchWindowContent } from './SearchWindowContent/SearchWindowContent';
import { useSearchState } from './useSearchState/useSearchState';
import './SearchWindow.css';

export const SearchWindow = memo(({
	dataState,
	searchWindowIsOpen,
	interfaceDispatch
}) => {
	const [ {
		source: sourceState,
		target: targetState,
		content: contentState,
		isLoading: searchWindowIsLoading
	}, searchDispatch ] = useSearchState({ searchWindowIsOpen }, dataState);

	if (!searchWindowIsOpen)
		return null;
	
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
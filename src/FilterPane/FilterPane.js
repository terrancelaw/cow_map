import { memo } from 'react'; // avoid re-rendering on tooltip 
import { DarkDropDown } from '../widgets/DarkDropDown/DarkDropDown';
import { FilterPaneAttributeValue } from './FilterPaneAttributeValue/FilterPaneAttributeValue';
import { FilterPaneFilterList } from './FilterPaneFilterList/FilterPaneFilterList';
import './FilterPane.css';

export const FilterPane = memo(({
	filterPaneState,
	dispatch
}) => {
	const {
		isOpen,
		dataSetList,
		dataSet,
		attributeList,
		attribute,
		attributeValueList,
		attributeValue,
		appliedFilterList
	} = filterPaneState;

	const handleSelectDataSet = event =>
		dispatch({ 
			type: 'SELECT_FILTER_PANE_DATASET',
			option: event.target.value
		});
	const handleSelectAttribute = event =>
		dispatch({ 
			type: 'SELECT_FILTER_PANE_ATTRIBUTE',
			option: event.target.value
		});

	if (!isOpen)
		return null;

	return (
		<div id="filter-pane">
			<DarkDropDown
				list={ dataSetList }
				option={ dataSet }
				className='data-set-drop-down'
				labelText='DATASET'
				handleSelect={ handleSelectDataSet }
			/>
			<DarkDropDown
				list={ attributeList }
				option={ attribute }
				className='attribute-drop-down'
				labelText='FILTER BY'
				handleSelect={ handleSelectAttribute }
			/>
			<FilterPaneAttributeValue
				attribute={ attribute }
				attributeValueList={ attributeValueList }
				attributeValue={ attributeValue }
				dispatch={ dispatch }
			/>
			<FilterPaneFilterList
				appliedFilterList={ appliedFilterList }
				dispatch={ dispatch }
			/>
		</div>
	);
});
import { memo } from 'react'; // avoid re-rendering on tooltip 
import { DarkDropDown } from '../widgets/DarkDropDown/DarkDropDown';
import { ColorPaneList } from './ColorPaneList';
import './ColorPane.css';

export const ColorPane = memo(({
	colorPaneState,
	dispatch
}) => {
	const {
		isOpen,
		dataSetList,
		dataSet,
		attributeList,
		attribute,
		appliedColoringList
	} = colorPaneState;

	const handleSelectDataSet = event =>
		dispatch({ 
			type: 'SELECT_COLOR_PANE_DATASET',
			option: event.target.value
		});
	const handleSelectAttribute = event =>
		dispatch({ 
			type: 'SELECT_COLOR_PANE_ATTRIBUTE',
			option: event.target.value
		});

	if (!isOpen)
		return null;

	return (
		<div id="color-pane">
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
				labelText='COLOR BY'
				handleSelect={ handleSelectAttribute }
			/>
			<ColorPaneList
				appliedColoringList={ appliedColoringList }
				dispatch={ dispatch }
			/>
		</div>
	);
});
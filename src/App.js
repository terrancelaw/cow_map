import { useDataState } from './useDataState/useDataState';
import { useInterfaceState } from './useInterfaceState/useInterfaceState';
import { DataSelectionPanes } from './DataSelectionPanes/DataSelectionPanes';
import { VisualizationPane } from './VisualizationPane/VisualizationPane';
import { DetailPane } from './DetailPane/DetailPane';
import { ColorPane } from './ColorPane/ColorPane';
import { FilterPane } from './FilterPane/FilterPane';
import { SearchWindow } from './SearchWindow/SearchWindow';
import { Loader } from './widgets/Loader/Loader';
import { Tooltip } from './widgets/Tooltip/Tooltip';
import { PopUpWindow } from './widgets/PopUpWindow/PopUpWindow';
import { ColorPicker } from './widgets/ColorPicker/ColorPicker';
import { Reference } from './Reference/Reference';
import './App.css';

export const App = () => {
	const [ dataState ] = useDataState();
	const {
		landData,
		interiorData,
		countryIDToData,
		timeSeriesDataList,
		isLoading: dataIsLoading
	} = dataState;

	const [ interfaceState, dispatch ] = useInterfaceState(dataState);
	const {
		linkPane: { list: linkPaneList },
		sourcePane: { list: sourcePaneList },
		targetPane: { list: targetPaneList },
		visualizationPane: { linkTypeList, linkList },
		colorPicker: colorPickerState,
		timelineSlider: timelineSliderState,
		detailPane: detailPaneState,
		colorPane: colorPaneState,
		filterPane: filterPaneState,
		searchWindow: { isOpen: searchWindowIsOpen },
		reference: { isOpen: referenceIsOpen },
		hover: hoverState,
		focus: focusState,
		isLoading: interfaceIsLoading
	} = interfaceState;

	if (dataIsLoading || interfaceIsLoading)
		return <Loader />;

	return (
		<>
			<div id="left-column">
				<DataSelectionPanes
					linkPaneList={ linkPaneList }
					sourcePaneList={ sourcePaneList }
					targetPaneList={ targetPaneList }
					dispatch={ dispatch }
				/>
			</div>
			<div id="right-column">
				<VisualizationPane
					landData={ landData }
					interiorData={ interiorData }
					countryIDToData={ countryIDToData }
					linkList={ linkList }
					linkTypeList={ linkTypeList }
					timelineSliderState={ timelineSliderState }
					hoverState={ hoverState }
					detailPaneIsOpen={ detailPaneState.isOpen }
					colorPaneState={ colorPaneState }
					filterPaneState={ filterPaneState }
					dispatch={ dispatch }
				/>
				<DetailPane
					countryIDToData={ countryIDToData }
					timeSeriesDataList={ timeSeriesDataList }
					linkList={ linkList }
					detailPaneState={ detailPaneState }
					dispatch={ dispatch }
				/>
				<ColorPane
					colorPaneState={ colorPaneState }
					dispatch={ dispatch }
				/>
				<FilterPane 
					filterPaneState={ filterPaneState }
					dispatch={ dispatch }
				/>
			</div>
			<Tooltip
				hoverState={ hoverState }
				timelineSliderState={ timelineSliderState }
				countryIDToData={ countryIDToData }
			/>
			<PopUpWindow
				focusState={ focusState }
				timelineSliderState={ timelineSliderState }
				countryIDToData={ countryIDToData }
				dispatch={ dispatch }
			/>
			<SearchWindow
				dataState={ dataState }
				searchWindowIsOpen={ searchWindowIsOpen }
				interfaceDispatch={ dispatch }
			/>
			<ColorPicker
				colorPickerState={ colorPickerState }
				dispatch={ dispatch }
			/>
			<Reference 
				referenceIsOpen={ referenceIsOpen }
				dispatch={ dispatch }
			/>
		</>
    );
};
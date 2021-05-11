import { useDataState } from './useDataState/useDataState';
import { useInterfaceState } from './useInterfaceState/useInterfaceState';
import { DataSelectionPanes } from './DataSelectionPanes/DataSelectionPanes';
import { VisualizationPane } from './VisualizationPane/VisualizationPane';
import { DetailPane } from './DetailPane/DetailPane';
import { SearchWindow } from './SearchWindow/SearchWindow';
import { Loader } from './widgets/Loader/Loader';
import { Tooltip } from './widgets/Tooltip/Tooltip';
import { PopUpWindow } from './widgets/PopUpWindow/PopUpWindow';
import { ColorPicker } from './widgets/ColorPicker/ColorPicker';
import { LinkDisaggregator } from './LinkDisaggregator/LinkDisaggregator';
import { Reference } from './Reference/Reference';
import './App.css';

export const App = () => {
	const [ dataState ] = useDataState();
	const {
		landData,
		interiorData,
		linkDataList,
		countryIDToData,
		timeSeriesDataList,
		isLoading: dataIsLoading
	} = dataState;

	const [ 
		interfaceState, 
		dispatch 
	] = useInterfaceState(dataState);
	const {
		linkPane: { list: linkPaneList },
		sourcePane: { list: sourcePaneList },
		targetPane: { list: targetPaneList },
		visualizationPane: { list: visualizationPaneList },
		colorPicker: colorPickerState,
		timelineSlider: timelineSliderState,
		detailPane: detailPaneState,
		searchWindow: { isOpen: searchWindowIsOpen },
		linkDisaggregator: { isOpen: linkDisaggregatorIsOpen },
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
					linkPaneList={ linkPaneList }
					visualizationPaneList={ visualizationPaneList }
					timelineSliderState={ timelineSliderState }
					hoverState={ hoverState }
					detailPaneIsOpen={ detailPaneState.isOpen }
					dispatch={ dispatch }
				/>
				<DetailPane
					countryIDToData={ countryIDToData }
					timeSeriesDataList={ timeSeriesDataList }
					visualizationPaneList={ visualizationPaneList }
					detailPaneState={ detailPaneState }
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
				detailPaneIsOpen={ detailPaneState.isOpen }
				searchWindowIsOpen={ searchWindowIsOpen }
				interfaceDispatch={ dispatch }
			/>
			<ColorPicker
				colorPickerState={ colorPickerState }
				dispatch={ dispatch }
			/>
			<LinkDisaggregator
				linkDataList={ linkDataList }
				linkDisaggregatorIsOpen={ linkDisaggregatorIsOpen }
				interfaceDispatch={ dispatch }
			/>
			<Reference 
				referenceIsOpen={ referenceIsOpen }
				detailPaneIsOpen={ detailPaneState.isOpen }
				dispatch={ dispatch }
			/>
		</>
    );
};
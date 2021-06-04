import { memo } from 'react'; // avoid re-rendering on tooltip 
import { DetailPaneHeader } from './DetailPaneHeader/DetailPaneHeader';
import { DetailPaneContent } from './DetailPaneContent/DetailPaneContent';
import './DetailPane.css';

export const DetailPane = memo(({
	countryIDToData,
	timeSeriesDataList,
	linkList,
	detailPaneState,
	dispatch
}) => {
	const {
		isOpen,
		mainOption,
		mainOptionList,
		subOption1,
		subOption1List,
		subOption2,
		subOption2List
	} = detailPaneState;

	if (!isOpen)
		return null;

	return (
		<div id="detail-pane">
			<DetailPaneHeader
				mainOption={ mainOption }
				mainOptionList={ mainOptionList }
				subOption1={ subOption1 }
				subOption1List={ subOption1List }
				subOption2={ subOption2 }
				subOption2List={ subOption2List }
				dispatch={ dispatch }
			/>
			<DetailPaneContent 
				countryIDToData={ countryIDToData }
				timeSeriesDataList={ timeSeriesDataList }
				linkList={ linkList }
				mainOption={ mainOption }
				subOption1={ subOption1 }
				subOption2={ subOption2 }
				dispatch={ dispatch }
			/>
		</div>
	);
});
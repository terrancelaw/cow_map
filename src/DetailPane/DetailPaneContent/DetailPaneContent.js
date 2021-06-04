import { memo } from 'react';
import { checkIsNetworkMetric } from '../../useInterfaceState/updateDetailPane';
import { generateEntryList, generateKEntryList } from './generateEntryList';
import { DetailPaneContentItem } from './DetailPaneContentItem';
import { SparkLine } from './SparkLine';
import { Bar } from './Bar';
import { BiDetail } from "react-icons/bi";
import './DetailPaneContent.css';

export const DetailPaneContent = memo(({
	countryIDToData,
	timeSeriesDataList,
	linkList,
	mainOption,
	subOption1,
	subOption2,
	dispatch
}) => {
	const isSelectedNetworkMetric = checkIsNetworkMetric(mainOption);
	const isSelectedTimeSeries = !isSelectedNetworkMetric;
	const entryList = generateEntryList(		
		countryIDToData,
		timeSeriesDataList,
		linkList,
		mainOption,
		subOption1,
		subOption2
	);
	const [ 
		topEntryList, 
		bottomEntryList 
	] = generateKEntryList(entryList, isSelectedTimeSeries ? 5 : 10);

	const handleClickDetailButton = () => dispatch({
		type: 'CLICK_DETAIL_PANE_DETAIL_BUTTON',
		mainOption, subOption1, subOption2, entryList
	});

	let timeSeriesClassName = null;

	if (isSelectedTimeSeries) {
		const timeSeriesDataObject = timeSeriesDataList
			.filter(({ metadata: { displayName } }) => displayName === mainOption)[0];
		const isBilateral = timeSeriesDataObject.metadata.isBilateral;

		timeSeriesClassName = isBilateral ? 'bilateral' : 'non-bilateral';
	}

	if (entryList.length === 0)
		return null;

	return (
		<div className={ !timeSeriesClassName ? 'content' : `content ${ timeSeriesClassName }` }>
			{ topEntryList.map(entryObject => 
				<DetailPaneContentItem 
					key={ entryObject.key }
					titleText={ entryObject.titleText }
					contentText={ entryObject.contentText }
					className={ isSelectedTimeSeries ? 'spark-line' : 'bar' }
					itemData={ entryObject.itemData }
					dispatch={ dispatch }
					visualization={ isSelectedTimeSeries ? 
						<SparkLine
							startYear={ entryObject.startYear }
							endYear={ entryObject.endYear }
							startX={ entryObject.startX }
							endX={ entryObject.endX }
							startY={ entryObject.startY }
							endY={ entryObject.endY }
							pathData={ entryObject.pathData }
						/> : 
						<Bar width={ entryObject.width } /> }
				/>) }

			{ bottomEntryList.length > 0 ? <div className="seperator">⋮</div> : null }

			{ bottomEntryList.map(entryObject => 
				<DetailPaneContentItem 
					key={ entryObject.key }
					titleText={ entryObject.titleText }
					contentText={ entryObject.contentText }
					className={ isSelectedTimeSeries ? 'spark-line' : 'bar' }
					itemData={ entryObject.itemData }
					dispatch={ dispatch }
					visualization={ isSelectedTimeSeries ? 
						<SparkLine
							startYear={ entryObject.startYear }
							endYear={ entryObject.endYear }
							startX={ entryObject.startX }
							endX={ entryObject.endX }
							startY={ entryObject.startY }
							endY={ entryObject.endY }
							pathData={ entryObject.pathData }
						/> : 
						<Bar width={ entryObject.width } /> }
				/>) }

			<div 
				className="see-full-list-button" 
				onClick={ handleClickDetailButton }
			><BiDetail />Click to see full list</div>
		</div>
	);
});
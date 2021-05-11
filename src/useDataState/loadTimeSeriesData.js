import { csv } from 'd3';
import { config } from '../config';

const parseData = row => ({
	...row,
	year: row.year !== '' ? +row.year : null,
	value: row.value !== '' ? +row.value : null
});

const createPromiseList = config => {
	const promiseList = [];

	for (let timeSeriesConfig of config.timeSeries) {
		const url = `${ process.env.PUBLIC_URL }/data/timeSeries/${ timeSeriesConfig.fileName }`;
		const promise = csv(url, parseData);

		promiseList.push(promise);
	}

	return promiseList;
};

const generateMetadata = (timeSeriesList, oldMetadata) => {
	const yearSet = new Set();

	for (let { year } of timeSeriesList)
		if (year !== null) 
			yearSet.add(year);

	return { ...oldMetadata, 
		yearList: [ ...yearSet ].sort((a, b) => a - b)
	};
};

const generateIDToTimeSeriesList = (timeSeriesList, metadata) => {
	const IDToTimeSeriesList = {};
	const isBilateral = metadata.isBilateral;

	if (isBilateral)
		for (let row of timeSeriesList) {
			const sourceID = row.node1;
			const targetID = row.node2;
			const sourceTargetID = sourceID + '-' + targetID;

			if (!(sourceTargetID in IDToTimeSeriesList))
				IDToTimeSeriesList[sourceTargetID] = [];

			IDToTimeSeriesList[sourceTargetID].push(row);
		}

	else if (!isBilateral)
		for (let row of timeSeriesList) {
			const nodeID = row.ID;

			if (!(nodeID in IDToTimeSeriesList))
				IDToTimeSeriesList[nodeID] = [];

			IDToTimeSeriesList[nodeID].push(row);
		}

	return IDToTimeSeriesList;
};

export const loadTimeSeriesData = dispatch => {
	const timeSeriesDataList = [];
	const promiseList = createPromiseList(config);

	Promise.all(promiseList).then(dataList => {
		for (let i = 0; i < dataList.length; i++) {
			const timeSeriesList = dataList[i];
			const metadata = generateMetadata(timeSeriesList, config.timeSeries[i]);
			const data = generateIDToTimeSeriesList(timeSeriesList, metadata);

			timeSeriesDataList.push({ data, metadata });
		}

		dispatch({
			type: "LOAD_DATA",
			data: { timeSeriesDataList }
		});
	});
};
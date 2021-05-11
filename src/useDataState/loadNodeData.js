import { csv } from 'd3';

const url = `${ process.env.PUBLIC_URL }/data/nodes/countries.csv`;

const getCountryIDToData = nodeList => {
	const countryIDToData = {};

	for (let countryRow of nodeList)
		countryIDToData[countryRow.ID] = countryRow;

	return countryIDToData;
};

const parseData = row => ({
	...row,
	latitude: row.latitude !== '' ? +row.latitude : null,
	longitude: row.longitude !== '' ? +row.longitude : null
});

export const loadNodeData = dispatch => {
	csv(url, parseData).then(d => {
		dispatch({
			type: "LOAD_DATA",
			data: {
				nodeList: d,
				countryIDToData: getCountryIDToData(d)
			}
		});
	});
};
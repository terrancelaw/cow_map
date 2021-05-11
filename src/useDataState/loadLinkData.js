import { csv } from 'd3';
import { config } from '../config';

// helpers

const createPromiseList = config => {
	const promiseList = [];

	for (let linkConfig of config.links) {
		const url = `${ process.env.PUBLIC_URL }/data/links/${ linkConfig.fileName }`;
		const promise = csv(url);

		promiseList.push(promise);
	}

	return promiseList;
};

// main functions

export const loadLinkData = dispatch => {
	const linkDataList = [];
	const promiseList = createPromiseList(config);

	Promise.all(promiseList).then(dataList => {
		for (let i = 0; i < dataList.length; i++)
			linkDataList.push({ 
				data: dataList[i],
				metadata: config.links[i]
			});

		dispatch({
			type: "LOAD_DATA",
			data: { linkDataList }
		});
	});
};
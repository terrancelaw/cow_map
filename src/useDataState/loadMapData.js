import { feature, mesh } from 'topojson-client';
import { json } from 'd3';

const url = `${ process.env.PUBLIC_URL }/data/map/countries-110m.json`;

const removeAntarctica = ({ countries, land }) => {
	const oldLandGeometriesArcs = land.geometries[0].arcs;
	const newLandGeometriesArcs = [];

	for (let arcArrList of oldLandGeometriesArcs) {
		const newArcArrList = [];

		for (let indexList of arcArrList) {
			const newIndexList = [];

			for (let index of indexList)
				if (index < 562 || index > 569)
					newIndexList.push(index);
			if (newIndexList.length > 0)
				newArcArrList.push(newIndexList);
		}
		if (newArcArrList.length > 0)
			newLandGeometriesArcs.push(newArcArrList);
	}

	countries.geometries = countries.geometries.filter(d => d.id !== '010');
	land.geometries[0].arcs = newLandGeometriesArcs;
	return { countries, land };
};

export const loadMapData = dispatch => {
	json(url).then(countryData => {
		const { countries, land } = removeAntarctica(countryData.objects);

		dispatch({
			type: "LOAD_DATA",
			data: {
				landData: feature(countryData, land),
				interiorData: mesh(countryData, countries, (a, b) => a !== b)
			}
		});
	});
};
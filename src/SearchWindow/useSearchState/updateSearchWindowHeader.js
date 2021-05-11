import levenshtein from 'js-levenshtein';

const COUNTRY_LIST_LENGTH = 5;

export const computeWordDistance = (countryName, query) => {
	const queryIsStart = countryName.indexOf(query) === 0;
	let wordDistance = null;

	if (countryName.length > query.length) {
		if (queryIsStart)
			wordDistance = levenshtein(countryName, query) / countryName.length - 1;
		else if (!queryIsStart)
			wordDistance = levenshtein(countryName, query) / countryName.length;
	}
	else if (countryName.length <= query.length) {
		if (queryIsStart)
			wordDistance = levenshtein(countryName, query) / query.length - 1;
		else if (!queryIsStart)
			wordDistance = levenshtein(countryName, query) / query.length;
	}

	return wordDistance;
};

export const searchCountryListByQuery = (countryNameList, query) => {
	if (query === '')
		return [];

	const lowerCaseQuery = query.toLowerCase().replace(/\s+/g, '');
	const similarCountryList = []; // { countryName, wordDistance }

	for (let countryName of countryNameList) {
		const lowerCaseCountryName = countryName.toLowerCase().replace(/\s+/g, '');

		similarCountryList.push({
			countryName: countryName,
			wordDistance: computeWordDistance(lowerCaseCountryName, lowerCaseQuery),
			selected: false
		});
	}

	return similarCountryList
		.sort((a, b) => a.wordDistance - b.wordDistance)
		.filter((d, i) => i < COUNTRY_LIST_LENGTH);
};

export const getCurrSelectionIndex = countryList => {
	for (let i = 0; i < countryList.length; i++)
		if (countryList[i].selected)
			return i;

	return null;
};

export const getPrevSelectionIndex = currSelectionIndex => {
	if (currSelectionIndex === null)
		return COUNTRY_LIST_LENGTH - 1;
	if (currSelectionIndex === 0)
		return COUNTRY_LIST_LENGTH - 1;

	return currSelectionIndex - 1;
};

export const getNextSelectionIndex = currSelectionIndex => {
	if (currSelectionIndex === null)
		return 0;
	if (currSelectionIndex === COUNTRY_LIST_LENGTH - 1)
		return 0;

	return currSelectionIndex + 1;
}

export const getSelectedCountryName = countryList => {
	for (let { countryName, selected } of countryList)
		if (selected) return countryName;

	return null;
};
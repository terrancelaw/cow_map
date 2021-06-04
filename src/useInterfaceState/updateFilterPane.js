// initFilterPaneState

export const initFilterPaneState = linkPaneList => {
	const newDataSetList = linkPaneList.filter(({ isSubItem }) => !isSubItem);
	const newDataSet = newDataSetList[0];
	const newAttributeList = [ 
		{ key: 'NONE', displayName: 'SELECT AN ATTRIBUTE' }, 
		...newDataSet.filterPane.attributeList 
	];
	const newAttribute = newAttributeList[0]; // none by default

	return {
		isOpen: false,
		dataSetList: newDataSetList,
		dataSet: newDataSet,
		attributeList: newAttributeList,
		attribute: newAttribute,
		attributeValueList: [],
		attributeValue: '',
		appliedFilterList: []
	}
};

// generateFilterPaneAttributeValueList
// called when selecting attribute or removing filter

export const generateFilterPaneAttributeValueList = (
	dataSet, 
	attribute, 
	appliedFilterList,
	countryIDToData
) => {
	const matchedFilterList = appliedFilterList.filter(listItem => 
		listItem.dataSet.key === dataSet.key && 
		listItem.attribute.key === attribute.key);
	const { linkRowList } = dataSet;
	const { attributeName, isCategorical, isID } = attribute;

	// only have one filter for each dataSet / attribute pair
	if (matchedFilterList.length > 0)
		return matchedFilterList[0].attributeValueList;

	if (isCategorical) {
		const categorySet = new Set();
		const categoryList = [];

		for (let linkRowObject of linkRowList)
			if (linkRowObject[attributeName] !== '')
				categorySet.add(linkRowObject[attributeName]);

		for (let category of categorySet)
			categoryList.push({ 
				key: category,
				category: category,
				displayName: isID ? countryIDToData[category].displayName : category,
				isSelected: true
			});

		return categoryList.sort((a, b) => {
			if (a.displayName < b.displayName) return -1;
			if (a.displayName > b.displayName) return 1;
			return 0;
		});
	}

	if (!isCategorical) {
		let min = Infinity, max = -Infinity;

		for (let linkRowObject of linkRowList)
			if (linkRowObject[attributeName] !== '') {
				min = Math.min(min, +linkRowObject[attributeName]);
				max = Math.max(max, +linkRowObject[attributeName]);
			}

		return [ min, max ];
	}
};

// generateFilterPaneAttributeValue
// called when selecting attribute or removing filter

export const generateFilterPaneAttributeValue = (
	dataSet, 
	attribute, 
	attributeValueList,
	appliedFilterList,
) => {
	const matchedFilterList = appliedFilterList.filter(listItem => 
		listItem.dataSet.key === dataSet.key && 
		listItem.attribute.key === attribute.key);
	const { isCategorical } = attribute;

	// only have one filter for each dataSet / attribute pair
	if (matchedFilterList.length > 0) 
		return matchedFilterList[0].attributeValue; 

	if (isCategorical) return '';
	if (!isCategorical) return attributeValueList;
};

// updateAppliedFilterList (call when select item or change slider)

export const updateAppliedFilterList = (prevAppliedFilterList, newItem) => {
	const filteredAppliedFilterList = prevAppliedFilterList
		.filter(listItem => 
			!(listItem.dataSet.key === newItem.dataSet.key && 
			listItem.attribute.key === newItem.attribute.key));

	// only add if something is being filtered
	let needToAddNewFilter = false;

	if (newItem.attribute.isCategorical) {
		for (let { isSelected } of newItem.attributeValueList)
			if (!isSelected) { needToAddNewFilter = true; break; }
	}
	else if (!newItem.attribute.isCategorical)
		needToAddNewFilter = newItem.attributeValueList[0] !== newItem.attributeValue[0]
						  || newItem.attributeValueList[1] !== newItem.attributeValue[1];

	return needToAddNewFilter 
		 ? [ ...filteredAppliedFilterList, newItem ] 
		 : filteredAppliedFilterList;
};
// generateColorPaneAttribute 
// called when selecting data set or removing coloringItem

export const generateColorPaneAttribute = (
	dataSet, 
	attributeList, 
	appliedColoringList
) => {
	const dataSetIndex = appliedColoringList
		.map(listItem => listItem.dataSet.key)
		.indexOf(dataSet.key);

	// no coloring for this data set => return none
	if (dataSetIndex === -1)
		return attributeList[0];

	// has coloring => return the corresponding attr
	const attributeIndex = attributeList
		.map(({ key }) => key)
		.indexOf(appliedColoringList[dataSetIndex].attribute.key);

	return attributeList[attributeIndex];
};

// initColorPaneState

export const initColorPaneState = linkPaneList => {
	const newDataSetList = linkPaneList;
	const newDataSet = newDataSetList[0];
	const newAttributeList = [ 
		{ key: 'NONE', displayName: 'NONE' }, 
		...newDataSet.colorPane.attributeList 
	];
	const newAppliedColoringList = [];

	for (let linkDataObject of linkPaneList)
		if (linkDataObject.defaultColorAttrName !== null) {
			const dataSet = linkDataObject;
			const attribute = linkDataObject.colorPane.attributeList
				.filter(({ attributeName }) => attributeName === linkDataObject.defaultColorAttrName)[0];

			newAppliedColoringList.push({ dataSet, attribute });
		}

	return {
		isOpen: false,
		dataSetList: newDataSetList,
		dataSet: newDataSet,
		attributeList: newAttributeList,
		attribute: generateColorPaneAttribute(
			newDataSet,
			newAttributeList,
			newAppliedColoringList
		),
		appliedColoringList: newAppliedColoringList
	};
};

// updateAppliedColoringList (called when selecting attribute)

export const updateAppliedColoringList = (prevAppliedColoringList, newItem) => {
	// no coloring for this data set => remove from list
	if (newItem.attribute.key === 'NONE')
		return prevAppliedColoringList
			.filter(listItem => listItem.dataSet.key !== newItem.dataSet.key);

	// has coloring => add to list
	const filteredAppliedColoringList = prevAppliedColoringList
		.filter(listItem => listItem.dataSet.key !== newItem.dataSet.key);

	return [ ...filteredAppliedColoringList, newItem ];
};
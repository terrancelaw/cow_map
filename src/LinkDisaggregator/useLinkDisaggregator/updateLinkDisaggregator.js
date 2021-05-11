export const initHeaderList = linkDataList => {
	const headerList = [];

	for (let { metadata: { displayName, linkType, linkDisaggregator } } of linkDataList)
		headerList.push({ 
			displayName, 
			linkType,
			linkDisaggregator
		});

	return headerList;
};

export const updateContentList = option => {
	const contentList = [];
	const optionList = option.linkDisaggregator.optionList;

	for (let option of optionList)
		contentList.push({ ...option, // include displayName
			key: option.displayName, // assume unique
			isSelected: false
		});

	return contentList;
};

export const toggleContentList = (prevContentList, itemKey) =>
	prevContentList.map(itemObject => ({ ...itemObject, 
		isSelected: itemObject.key === itemKey 
				  ? !itemObject.isSelected 
				  : itemObject.isSelected
	}));
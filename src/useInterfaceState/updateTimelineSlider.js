import { timelineSliderOptions } from '../config';

export const generateTimelineSliderMin = (linkPaneList, selectedYearAttr) => {
	const dependentAttrList = selectedYearAttr.rangeDependencyList;
	const currentYear = new Date().getFullYear();
	let min = Infinity;

	linkPaneList
		.filter(({ isSelected }) => isSelected)
		.forEach(linkDataObject => {
			for (let dependentAttrName of dependentAttrList)
				if (linkDataObject[dependentAttrName] !== null) // has the attr
					if (linkDataObject[dependentAttrName].min !== null) // has a min val
						min = Math.min(min, linkDataObject[dependentAttrName].min);
		});

	if (min === Infinity)
		return currentYear - 10;
	if (min > currentYear - 10)
		return currentYear - 10

	return min;
};

export const generateTimelineSliderMax = (linkPaneList, selectedYearAttr) => {
	const dependentAttrList = selectedYearAttr.rangeDependencyList;
	const currentYear = new Date().getFullYear();
	let max = -Infinity;

	linkPaneList
		.filter(({ isSelected }) => isSelected)
		.forEach(linkDataObject => {
			for (let dependentAttrName of dependentAttrList)
				if (linkDataObject[dependentAttrName] !== null) // has the attr
					if (linkDataObject[dependentAttrName].max !== null) // has a max val
						max = Math.max(max, linkDataObject[dependentAttrName].max);
		});

	if (max === -Infinity)
		return currentYear + 10;
	if (max < currentYear + 10)
		return currentYear + 10;

	return max;
};

const generateYearAttributeList = linkPaneList => {
	const yearAttributeList = [ timelineSliderOptions['no-filter'] ];
	const selectedLinkDataObjectList = linkPaneList
		.filter(({ isSelected }) => isSelected);

	for (let key in timelineSliderOptions)
		if (key !== 'no-filter') {
			const currTimelineSliderOption = timelineSliderOptions[key];
			const requiredAttrList = currTimelineSliderOption.requirementList;
			let hasAllRequiredAttr = true;

			for (let requiredAttrName of requiredAttrList) {
				let hasCurrRequiredAttr = false;

				for (let linkDataObject of selectedLinkDataObjectList)
					if (linkDataObject[requiredAttrName] !== null) {
						hasCurrRequiredAttr = true; 
						break;
					}

				if (!hasCurrRequiredAttr) {
					hasAllRequiredAttr = false; 
					break;
				}
			}

			if (hasAllRequiredAttr)
				yearAttributeList.push(currTimelineSliderOption);
		}

	return yearAttributeList;
};

// called when select link
export const updateTimelineSliderState = linkPaneList => {
	const defaultYearAttribute = timelineSliderOptions['no-filter'];
	const yearAttributeList = generateYearAttributeList(linkPaneList);
	const currentYear = new Date().getFullYear();

	return {
		yearAttribute: defaultYearAttribute, 
		yearAttributeList: yearAttributeList,
		min: currentYear - 10, 
		max: currentYear + 10, 
		value: currentYear
	};
};
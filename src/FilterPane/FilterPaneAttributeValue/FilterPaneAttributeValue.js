import { FilterPaneCategoryList } from './FilterPaneCategoryList';
import { FilterPaneRangeFilter } from './FilterPaneRangeFilter';

export const FilterPaneAttributeValue = ({
	attribute,
	attributeValueList,
	attributeValue,
	dispatch
}) => {
	const { isCategorical } = attribute;

	if (attribute.key === 'NONE')
		return null;

	if (isCategorical)
		return (
			<FilterPaneCategoryList 
				categoryList={ attributeValueList } 
				dispatch={ dispatch }
			/> 
		); // { key, displayName, isSelected }

	if (!isCategorical) 
		return (
			<FilterPaneRangeFilter 
				min={ attributeValueList[0] } 
				max={ attributeValueList[1] } 
				value={ attributeValue } 
				dispatch={ dispatch }
			/>
		);
}
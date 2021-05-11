import { memo } from 'react';
import { TimeSeriesSection } from './TimeSeriesSection';
import { DataTableSection } from './DataTableSection';
import './SearchWindowContent.css';

const generateSearchResultDescription = ({
	inferredSourceName,
	inferredTargetName,
	timeSeriesSearchResultList,
	linkSearchResultList
}) => {
	const hasSearchQueries = inferredSourceName !== null || inferredTargetName !== null;
	const hasSearchResults = timeSeriesSearchResultList.length > 0 || linkSearchResultList.length > 0;

	if (!hasSearchQueries) {
		return 'PLEASE ENTER SEARCH QUERIES';
	}
	if (hasSearchQueries && !hasSearchResults) {
		if (inferredSourceName !== null && inferredTargetName !== null)
			return `CANNOT FIND SEARCH RESULTS FOR SOURCE: ${ inferredSourceName.toUpperCase() } 
					AND TARGET: ${ inferredTargetName.toUpperCase() }`;
		if (inferredSourceName === null && inferredTargetName !== null)
			return `CANNOT FIND SEARCH RESULTS FOR TARGET: ${ inferredTargetName.toUpperCase() }`;
		if (inferredSourceName !== null && inferredTargetName === null)
			return `CANNOT FIND SEARCH RESULTS FOR SOURCE: ${ inferredSourceName.toUpperCase() }`;
	}
	if (hasSearchQueries && hasSearchResults) {
		if (inferredSourceName !== null && inferredTargetName !== null)
			return `SEARCH RESULTS FOR SOURCE: ${ inferredSourceName.toUpperCase() } 
					AND TARGET: ${ inferredTargetName.toUpperCase() }`;
		if (inferredSourceName === null && inferredTargetName !== null)
			return `SEARCH RESULTS FOR TARGET: ${ inferredTargetName.toUpperCase() }`;
		if (inferredSourceName !== null && inferredTargetName === null)
			return `SEARCH RESULTS FOR SOURCE: ${ inferredSourceName.toUpperCase() }`;
	}
};

export const SearchWindowContent = memo(({ 
	contentState,
	searchDispatch
}) => {
	if (contentState === null)
		return null;

	else if (contentState !== null) {
		const { timeSeriesSearchResultList, linkSearchResultList } = contentState;

		const handleChangeYear = (key, startYear, endYear) => 
			searchDispatch({
				type: 'FILTER_TIME_SERIES_SEARCH_RESULT',
				searchResultKey: key,
				filterStartYear: startYear,
				filterEndYear: endYear
			});
		const handleChangeAttrName = (key, filterAttrName) => 
			searchDispatch({
				type: 'SELECT_FILTER_ATTRIBUTE_NAME',
				searchResultKey: key,
				filterAttrName: filterAttrName
			});
		const handleChangeAttrValue = (key, filterAttrName, filterAttrValue) => 
			searchDispatch({
				type: 'SELECT_FILTER_ATTRIBUTE_VALUE',
				searchResultKey: key,
				filterAttrName: filterAttrName,
				filterAttrValue: filterAttrValue
			});

		return (
			<div className="content">

				<div className="result-description">
					{ generateSearchResultDescription(contentState) }
				</div>

				{ timeSeriesSearchResultList.map(({
					key,
					sectionHeaderText,
					isBilateral,
					lineChartList,
					filterYearList,
					filterStartYear,
					filterEndYear
				}) => 
					<TimeSeriesSection 
						key={ key }
						sectionHeaderText={ sectionHeaderText }
						isBilateral={ isBilateral }
						lineChartList={ lineChartList }
						filterYearList={ filterYearList }
						filterStartYear={ filterStartYear }
						filterEndYear={ filterEndYear }
						handleChangeStartYear={ e => { handleChangeYear(key, e.target.value, filterEndYear) } }
						handleChangeEndYear={ e => { handleChangeYear(key, filterStartYear, e.target.value) } }
					/>) }

				{ linkSearchResultList.map(({
					key,
					tableName,
					tableHeaderText,
					attributeList,
					tableRowList,
					filterAttrNameList,
					filterAttrValueList,
					filterAttrName,
					filterAttrValue
				}) => 
					<DataTableSection 
						key={ key }
						tableName={ tableName }
						tableHeaderText={ tableHeaderText }
						attributeList={ attributeList }
						tableRowList={ tableRowList }
						filterAttrNameList={ filterAttrNameList }
						filterAttrValueList={ filterAttrValueList }
						filterAttrName={ filterAttrName }
						filterAttrValue={ filterAttrValue }
						handleChangeAttrName={ e => { handleChangeAttrName(key, e.target.value) } }
						handleChangeAttrValue={ e => { handleChangeAttrValue(key, filterAttrName, e.target.value) } }
					/>) }

			</div>
		);
	}
});
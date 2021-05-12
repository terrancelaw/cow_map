export const timelineSliderOptions = {
	'is-signed': { // is curr value between signing and end
		displayName: 'Between Signing and End?',
		type: 'point',
		startYearAttrType: 'signYear',
		endYearAttrType: 'endYear',
		requirementList: [ 'signYear' ],
		rangeDependencyList: [ 'signYear' ],
		key: 'is-signed'
	},
	'is-start': { // is curr value between start and end
		displayName: 'Between Start and End?',
		type: 'point',
		startYearAttrType: 'startYear',
		endYearAttrType: 'endYear',
		requirementList: [ 'startYear' ],
		rangeDependencyList: [ 'startYear' ],
		key: 'is-start'
	},
	'is-in-force': { // is curr value between EIF and end
		displayName: 'Between EIF and End?',
		type: 'point',
		startYearAttrType: 'EIFYear',
		endYearAttrType: 'endYear',
		requirementList: [ 'EIFYear' ],
		rangeDependencyList: [ 'EIFYear' ],
		key: 'is-in-force'
	},
	'include-sign': { // does curr range include sign year
		displayName: 'Include Sign Year?',
		type: 'range',
		filterYearAttrType: 'signYear',
		requirementList: [ 'signYear' ],
		rangeDependencyList: [ 'signYear' ],
		key: 'include-sign'
	},
	'include-start': { // does curr range include start year
		displayName: 'Include Start Year?',
		type: 'range',
		filterYearAttrType: 'startYear',
		requirementList: [ 'startYear' ],
		rangeDependencyList: [ 'startYear' ],
		key: 'include-start'
	},
	'include-in-force': { // does curr range include start
		displayName: 'Include EIF Year?',
		type: 'range',
		filterYearAttrType: 'EIFYear',
		requirementList: [ 'EIFYear' ],
		rangeDependencyList: [ 'EIFYear' ],
		key: 'include-in-force'
	},
	'no-filter': {
		displayName: 'No Filtering',
		type: 'no-filter',
		key: 'no-filter'
	}
};

export const config = {
	links: [
		{
			linkType: 'wars', // 'should not use - for linkType'
			fileName: 'wars.csv',
			isDirected: true, 
			isWeighted: false,
			displayName: 'Dyadic Interstate War',
			startYear: 'startYear',
			signYear: null,
			EIFYear: null,
			endYear: 'endYear',
			// make sure segment key same as that gen by linkDisaggregator
			// { attrDisplayName, valueDisplayName, attributeList, attributeValue }
			subItemList: [],
			tooltip: { attributeList: [
				{ attributeName: 'node1', displayName: 'initiator', isID: true },
				{ attributeName: 'node2', displayName: 'target', isID: true },
				{ attributeName: 'startYear', displayName: 'start year', isID: false },
				{ attributeName: 'endYear', displayName: 'end year', isID: false },
				{ attributeName: 'warName', displayName: 'war name', isID: false },
				{ attributeName: 'outcome', displayName: 'outcome', isID: false },
				{ attributeName: 'node1Deaths', displayName: 'initiator deaths', isID: false },
				{ attributeName: 'node2Deaths', displayName: 'target deaths', isID: false }
			] },
			dataTable: { attributeList: [
				{ attributeName: 'node1', displayName: 'initiator', isID: true },
				{ attributeName: 'node2', displayName: 'target', isID: true },
				{ attributeName: 'startYear', displayName: 'start year', isID: false },
				{ attributeName: 'endYear', displayName: 'end year', isID: false },
				{ attributeName: 'warName', displayName: 'war name', isID: false },
				{ attributeName: 'outcome', displayName: 'outcome', isID: false },
				{ attributeName: 'node1Deaths', displayName: 'initiator deaths', isID: false },
				{ attributeName: 'node2Deaths', displayName: 'target deaths', isID: false }
			] },
			linkDisaggregator: { optionList: [
				{ displayName: 'initiator', attributeList: [ { attributeName: 'node1', isID: true } ] },
				{ displayName: 'target', attributeList: [ { attributeName: 'node2', isID: true } ] },
				{ displayName: 'war name', attributeList: [ { attributeName: 'warName', isID: false } ] }
			] },
			eventName: 'war'
		}, {
			linkType: 'defense_agreements', // 'should not use - for linkType'
			fileName: 'defense_agreements.csv',
			isDirected: false,
			isWeighted: false,
			displayName: 'Defense Cooperation Agreements',
			startYear: null,
			signYear: 'signYear',
			EIFYear: 'EIFYear',
			endYear: 'endYearEstimated',
			subItemList: [], // make sure segment key same as that gen by linkDisaggregator
			tooltip: { attributeList: [
				{ attributeName: 'node1', displayName: 'country 1', isID: true },
				{ attributeName: 'node2', displayName: 'country 2', isID: true },
				{ attributeName: 'signYear', displayName: 'sign year', isID: false },
				{ attributeName: 'EIFYear', displayName: 'entry into force Year', isID: false },
				{ attributeName: 'endYearEstimated', displayName: 'end year', isID: false },
				{ attributeName: 'type', displayName: 'type', isID: false },
				{ attributeName: 'category', displayName: 'category', isID: false }
			] },
			dataTable: { attributeList: [
				{ attributeName: 'node1', displayName: 'country 1', isID: true },
				{ attributeName: 'node2', displayName: 'country 2', isID: true },
				{ attributeName: 'signYear', displayName: 'sign year', isID: false },
				{ attributeName: 'EIFYear', displayName: 'entry into force Year', isID: false },
				{ attributeName: 'endYearEstimated', displayName: 'end year', isID: false },
				{ attributeName: 'type', displayName: 'type', isID: false },
				{ attributeName: 'category', displayName: 'category', isID: false }
			] },
			linkDisaggregator: { optionList: [
				{ displayName: 'country', attributeList: [ 
					{ attributeName: 'node1', isID: true }, 
					{ attributeName: 'node2', isID: true } ] 
				},
				{ displayName: 'type', attributeList: [ { attributeName: 'type', isID: false } ] },
				{ displayName: 'category', attributeList: [ { attributeName: 'category', isID: false } ] }
			] },
			eventName: 'agreement'
		}
	],
	timeSeries: [
		{
			fileName: 'trade_volume.csv',
			displayName: 'Trade Volume',
			isBilateral: true,
			metricName: 'trade volume'
		}, {
			fileName: 'military_expenditures.csv',
			displayName: 'Military Expenditures (in thousands USD)',
			isBilateral: false,
			metricName: 'military expenditure'
		}, {
			fileName: 'military_personnel.csv',
			displayName: 'Military Personnel (thousands)',
			isBilateral: false,
			metricName: 'military personnel'
		}, {
			fileName: 'total_population.csv',
			displayName: 'Total Population',
			isBilateral: false,
			metricName: 'population'
		}
	]
};
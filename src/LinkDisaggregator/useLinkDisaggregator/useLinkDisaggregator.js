import { useReducer, useEffect } from 'react';
import { 
	initHeaderList,
	updateContentList,
	toggleContentList
} from './updateLinkDisaggregator';

const generateInitialState = ({ linkDataList }) => {
	const headerList = initHeaderList(linkDataList);
	const contentList = updateContentList(headerList[0]);

	return {
		header: { list: headerList, option: headerList[0] },
		content: { list: contentList }
	};
};

const reducer = (prevState, action) => {
	switch (action.type) {
		case 'SELECT_DATASET': {
			const { option: newOption } = action;
			const newContentList = updateContentList(newOption);

			return { ...prevState, 
				header: { ...prevState.header, option: newOption },
				content: { list: newContentList }
			};
		}
		case 'SELECT_CONTENT_OPTION': {
			const { itemKey } = action;
			const { content: { list: prevContentList } } = prevState;
			const newContentList = toggleContentList(prevContentList, itemKey);

			return { ...prevState, content: { list: newContentList } };
		}
		case 'REMOVE_CONTENT_SELECTION': {
			const { content: { list: prevContentList } } = prevState;
			const newContentList = prevContentList.map(option => ({ ...option, isSelected: false }));

			return { ...prevState, content: { list: newContentList } };
		}
		default: {
			throw new Error(`Unhandled action type: ${ action.type }`);
		}
	}
};

export const useLinkDisaggregator = (interfaceState, dataState) => {
	const [ linkDisaggregatorState, linkDisaggregatorDispatch ] = useReducer(reducer, generateInitialState(dataState));
	const { linkDisaggregatorIsOpen } = interfaceState;

	useEffect(() => {
		// remove all choices when close
		return () => {
			if (linkDisaggregatorIsOpen) 
				linkDisaggregatorDispatch({ type: 'REMOVE_CONTENT_SELECTION' })
		};
	}, [ linkDisaggregatorIsOpen ])

	return [ linkDisaggregatorState, linkDisaggregatorDispatch ];
};
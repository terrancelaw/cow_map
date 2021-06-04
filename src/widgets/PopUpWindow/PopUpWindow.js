import { memo, Fragment } from 'react';
import { FaTimes } from "react-icons/fa";
import { SparkLine } from '../../DetailPane/DetailPaneContent/SparkLine';
import { Bar } from '../../DetailPane/DetailPaneContent/Bar';
import { LinkDescription } from '../LinkDescription/LinkDescription';
import { DataTable } from '../DataTable/DataTable';
import './PopUpWindow.css';

const generateTableRowList = (linkRowList, dataTableAttrList, countryIDToData) => {
	const tableRowList = [];

	for (let linkRowObject of linkRowList) {
		let rowString = '';

		for (let { attributeName, isID } of dataTableAttrList) {
			let attributeValue = linkRowObject[attributeName];

			if (attributeValue === '')
				attributeValue = 'null';
			else if (isID)
				attributeValue = countryIDToData[attributeValue].displayName;

			rowString += `<div class="cell">${ attributeValue }</div>`;
		}

		rowString = `<div class="row">${ rowString }</div>`;
		tableRowList.push(rowString);
	}

	return tableRowList;
};

export const PopUpWindow = memo(({
	focusState,
	timelineSliderState,
	countryIDToData,
	dispatch
}) => {
	const handleClickCloseButton = () => 
		dispatch({ type: 'CLOSE_POP_UP_WINDOW' });

	// pop up for link
	if (focusState.object === 'LINK') {
		const { 
			sourceID, 
			targetID,
			linkRowList, 
			dataTableAttrList,
			eventName
		} = focusState.data;
		const attributeList = dataTableAttrList.map(attribure => attribure.displayName);
		const tableRowList = generateTableRowList(
			linkRowList, dataTableAttrList, countryIDToData
		);
		const linkRowCount = linkRowList.length;
		const sourceName = countryIDToData[sourceID].displayName;
		const targetName = countryIDToData[targetID].displayName;

		return (
			<div id="pop-up-window" className="link">
				<div 
					className="background"
					onClick={ handleClickCloseButton }
				/>
				<div className="window">
					<div 
						className="close button" 
						onClick={ handleClickCloseButton }
					><FaTimes /></div>
					<div className="header">
						<LinkDescription
							linkRowCount={ linkRowCount }
							sourceName={ sourceName }
							targetName={ targetName }
							timelineSliderState={ timelineSliderState }
							eventName={ eventName }
						/>:
					</div>
					<div className="content">
						<DataTable
							tableName="pop-up-window-table"
							attributeList={ attributeList }
							tableRowList={ tableRowList }
						/>
					</div>
				</div>
			</div>
		);
	}

	// pop up for spark line list
	if (focusState.object === 'SPARK_LINE_LIST') {
		const { headerText, entryList } = focusState.data;

		return (
			<div id="pop-up-window" className="spark-line-list">
				<div 
					className="background"
					onClick={ handleClickCloseButton }
				/>
				<div className="window">
					<div 
						className="close button" 
						onClick={ handleClickCloseButton }
					><FaTimes /></div>
					<div className="header">{ headerText }</div>
					<div className="content">
						<div className="grid">
							{ entryList.map(entryObject => 
								<Fragment key={ entryObject.key }>
									<div className="title">{ entryObject.titleText }</div>
									<div className="chart">
										<SparkLine 
											startYear={ entryObject.startYear }
											endYear={ entryObject.endYear }
											startX={ entryObject.startX }
											endX={ entryObject.endX }
											startY={ entryObject.startY }
											endY={ entryObject.endY }
											pathData={ entryObject.pathData }
										/>
									</div>
									<div className="metric">{ entryObject.contentText }</div>
								</Fragment>) }
						</div>
						<div className="dummy-for-padding"></div>
					</div>
				</div>
			</div>
		);
	}

	// pop up for bar list
	if (focusState.object === 'BAR_LIST') {
		const { headerText, entryList } = focusState.data;

		return (
			<div id="pop-up-window" className="bar-list">
				<div 
					className="background"
					onClick={ handleClickCloseButton }
				/>
				<div className="window">
					<div 
						className="close button" 
						onClick={ handleClickCloseButton }
					><FaTimes /></div>
					<div className="header">{ headerText }</div>
					<div className="content">
						<div className="grid">
							{ entryList.map(entryObject => 
								<Fragment key={ entryObject.key }>
									<div className="title">{ entryObject.titleText }</div>
									<div className="content">
										<Bar width={ entryObject.width * 1.5 } percent={ false } />
										<div className="text">{ entryObject.contentText }</div>
									</div>
								</Fragment>) }
						</div>
						<div className="dummy-for-padding"></div>
					</div>
				</div>
			</div>
		);
	}

	return null;
});
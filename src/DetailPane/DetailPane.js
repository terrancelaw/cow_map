import $ from 'jquery';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { memo } from 'react'; // avoid re-rendering on tooltip 
import { DetailPaneHeader } from './DetailPaneHeader/DetailPaneHeader';
import { DetailPaneContent } from './DetailPaneContent/DetailPaneContent';
import './DetailPane.css';

export const DetailPane = memo(({
	countryIDToData,
	timeSeriesDataList,
	visualizationPaneList,
	detailPaneState,
	dispatch
}) => {
	const {
		isOpen,
		mainOption,
		mainOptionList,
		subOption1,
		subOption1List,
		subOption2,
		subOption2List
	} = detailPaneState;

	const handleClickButton = () => 
		dispatch({ type: 'TOGGLE_DETAIL_PANE' });
	const handleMouseLeaveButton = () => 
		dispatch({ type: 'MOUSE_LEAVE_DETAIL_PANE_BUTTON' });
	const handleMouseEnterButton = event => 
		dispatch({ 
			type: 'MOUSE_ENTER_DETAIL_PANE_BUTTON', 
			buttonEl: $(event.target).closest('.button')[0]
		});

	if (isOpen)
		return (
			<div id="detail-pane" className="expanded">
				<div className="expand-and-collapse button" onClick={ handleClickButton }>
					<FaAngleDoubleRight />
				</div>
				<DetailPaneHeader
					mainOption={ mainOption }
					mainOptionList={ mainOptionList }
					subOption1={ subOption1 }
					subOption1List={ subOption1List }
					subOption2={ subOption2 }
					subOption2List={ subOption2List }
					dispatch={ dispatch }
				/>
				<DetailPaneContent 
					countryIDToData={ countryIDToData }
					timeSeriesDataList={ timeSeriesDataList }
					visualizationPaneList={ visualizationPaneList }
					mainOption={ mainOption }
					subOption1={ subOption1 }
					subOption2={ subOption2 }
					dispatch={ dispatch }
				/>
			</div>
		);

	if (!isOpen)
		return (
			<div id="detail-pane" className="collapsed">
				<div 
					className="expand-and-collapse button" 
					onClick={ handleClickButton }
					onMouseEnter={ handleMouseEnterButton }
					onMouseLeave={ handleMouseLeaveButton }
				><FaAngleDoubleLeft /></div>
			</div>
		);
});
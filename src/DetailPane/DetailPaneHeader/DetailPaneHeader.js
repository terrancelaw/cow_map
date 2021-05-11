import { memo } from 'react';
import { DetailPaneHeaderMainOption } from './DetailPaneHeaderMainOption';
import { DetailPaneHeaderSubOptions } from './DetailPaneHeaderSubOptions';
import './DetailPaneHeader.css';

export const DetailPaneHeader = memo(({
	mainOption, 
	mainOptionList,
	subOption1, 
	subOption1List,
	subOption2, 
	subOption2List,
	dispatch
}) => {
	return (
		<div className="header">
			<DetailPaneHeaderMainOption 
				mainOption={ mainOption }
				mainOptionList={ mainOptionList }
				dispatch={ dispatch }
			/>
			<DetailPaneHeaderSubOptions 
				mainOption={ mainOption }
				subOption1={ subOption1 }
				subOption1List={ subOption1List }
				subOption2={ subOption2 }
				subOption2List={ subOption2List }
				dispatch={ dispatch }
			/>
		</div>
	);
});
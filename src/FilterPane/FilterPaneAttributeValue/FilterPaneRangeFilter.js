import { withStyles } from '@material-ui/core/styles';
import { Slider } from '@material-ui/core';
import { FilterPaneRangeFilterValueLabel } from './FilterPaneRangeFilterValueLabel';
import './FilterPaneRangeFilter.css';

const MySlider = withStyles({
	root: {
		position: 'absolute',
		top: '50%',
    	left: '50%',
    	width: 'calc(100% - 60px)',
    	transform: 'translate(-50%, -50%)',
    	display: 'flex',
		alignItems: 'center'
	},
	rail: {
		height: 2,
		opacity: 1,
		backgroundColor: 'gray'
	},
	track: {
		height: 6,
		backgroundColor: '#d3d3d3'
	},
	mark: {
		width: 2,
		height: 2,
		color: 'gray',
		transform: 'translateX(-50%)',
		borderRadius: '50%'
	},
	markLabel: {
		top: 20,
		color: 'gray',
		fontWeight: 300,
		fontSize: 13,
		fontFamily: 'Quicksand'
	},
	thumb: {
		width: 16,
    	height: 16,
		marginTop: 0,
		marginLeft: 0,
		border: '3px solid #1b1e23',
		transform: 'translateX(-50%)',
		background: '#d3d3d3',
		'&:hover': { boxShadow: 'none' },
		'&.MuiSlider-active': { boxShadow: 'none' },
		'&.Mui-focusVisible': { boxShadow: 'none' },
	}
})(Slider);

export const FilterPaneRangeFilter = ({
	min,
	max,
	value,
	dispatch
}) => {
	const handleChangeSlider = (event, value) => 
		dispatch({ type: 'CHANGE_FILTER_PANE_RANGE', value });

	return (
		<div className="range-filter">
			<MySlider
				min={ min }
				max={ max }
				value={ value }
				step={ 1 } // assumed integers
				valueLabelDisplay="on"
				ValueLabelComponent={ FilterPaneRangeFilterValueLabel }
				onChange={ handleChangeSlider }
				marks={[
					{ value: min, label: min }, 
					{ value: max, label: max }
				]}
			/>
		</div>
	);
};
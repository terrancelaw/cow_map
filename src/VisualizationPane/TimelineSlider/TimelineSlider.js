import { memo } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Slider, Input, Select, MenuItem } from '@material-ui/core';
import { TimelineSliderValueLabel } from './TimelineSliderValueLabel';
import './TimelineSlider.css';

const MySlider = withStyles({
	root: {
		top: '50%',
    	left: '50%',
		width: 'calc(100% - 80px)',
		display: 'flex',
		alignItems: 'center',
		position: 'absolute',
    	transform: 'translate(-50%, -50%)',
    	pointerEvents: 'auto'
	},
	rail: {
		height: 4,
		opacity: 1,
		backgroundColor: '#ebebeb'
	},
	track: {
		height: 4,
		backgroundColor: 'lightgray'
	},
	mark: {
		width: 4,
		height: 4,
		color: '#ebebeb',
		transform: 'translateX(-50%)',
		borderRadius: '50%'
	},
	markLabel: {
		color: 'gray',
		opacity: 0.7,
		fontWeight: 300,
		fontFamily: 'Quicksand'
	},
	thumb: {
		marginTop: 0,
		marginLeft: 0,
		transform: 'translateX(-50%)',
		boxShadow: '0 0 6px 1px #b8b8b8',
		background: 'white',
		'&:hover': { boxShadow: '0 0 6px 3px #b8b8b8' },
		'&.MuiSlider-active': { boxShadow: '0 0 6px 3px #b8b8b8' },
		'&.Mui-focusVisible': { boxShadow: '0 0 6px 3px #b8b8b8' },
		'&.Mui-disabled': {
			width: 12,
    		height: 12,
    		marginTop: 0,
    		marginLeft: 0
		}
	}
})(Slider);

const MyInput = withStyles({
	root: {
		position: 'absolute',
    	top: '50%',
    	left: '50%',
    	transform: 'translate(-50%,calc(-50% + 22px))',
		pointerEvents: 'auto',
		fontFamily: 'Quicksand',
		fontSize: '0.875rem',
		fontWeight: 300,
    	color: 'gray',
    	opacity: 0.7,
    	transition: 'color 0.3s',
    	'&:hover': { color: 'black' }
	}
})(Input);

const MySelect = withStyles({
	root: { 
		'&:focus': { backgroundColor: 'transparent' },
		'&.MuiSelect-select': { paddingRight: 0 }
	},
	icon: {
		color: 'currentColor',
		position: 'static',
		fontSize: '1rem'
	}
})(Select);

const MyMenuItem = withStyles({ 
	root: { 
		fontFamily: 'Quicksand',
		fontWeight: 300,
		fontSize: 13
	}
})(MenuItem);

const useStyles = makeStyles({
	paper: {
		borderRadius: 2,
		boxShadow: '0px 0px 6px 2px rgba(211,211,211,1)',
	}
});

export const TimelineSlider = memo(({ timelineSliderState, dispatch }) => {
	const classes = useStyles();

	const handleChangeSlider = (event, value) => 
		dispatch({ 
			type: 'CHANGE_TIMELINE_SLIDER', 
			value: value 
		});
	const handleSelectYearAttribute = event => 
		dispatch({ 
			type: 'SELECT_YEAR_ATTRIBUTE',
			yearAttribute: event.target.value
		});

	return (
		<div className="timeline-slider-container">
			<MySlider 
				min={ timelineSliderState.min }
				max={ timelineSliderState.max } 
				value={ timelineSliderState.value }
				step={ 1 } valueLabelDisplay="on"
				onChange={ handleChangeSlider }
				ValueLabelComponent={ TimelineSliderValueLabel }
				track={ timelineSliderState.yearAttribute.type === 'range' ? 'normal' : false }
				disabled={ timelineSliderState.yearAttribute.type === 'no-filter' }
				marks={[
					{ value: timelineSliderState.min, label: timelineSliderState.min }, 
					{ value: timelineSliderState.max, label: timelineSliderState.max }
				]}
			/>
			<MySelect 
				value={ timelineSliderState.yearAttribute }
				onChange={ handleSelectYearAttribute }
				input={ <MyInput disableUnderline={ true } /> }
				MenuProps={{ classes: { paper: classes.paper } }}
			>
				{ timelineSliderState.yearAttributeList.map(yearAttribute =>
					<MyMenuItem key={ yearAttribute.key } value={ yearAttribute }>
						{ yearAttribute.displayName }
					</MyMenuItem>) }
			</MySelect>
		</div>
	);
});
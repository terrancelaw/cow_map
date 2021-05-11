import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Input, Select, MenuItem } from '@material-ui/core';

const MyInput = withStyles({ 
	root: { 
		width: '100%',
		color: '#d3d3d3',
    	fontFamily: 'Quicksand',
    	fontSize: 20,
    	"&:not(.Mui-disabled):hover::before": {
    		borderBottom: '2px solid rgba(211, 211, 211, 0.6)'
	    }
	},
	underline: {
		'&:before': { borderBottom: '1px solid rgba(211, 211, 211, 0.6)' },
		'&:after': { borderBottom: '2px solid rgba(168, 168, 168, 1)' }
	}
})(Input);

const MySelect = withStyles({ 
	icon: {
		color: '#d3d3d3'
	}
})(Select);

const MyMenuItem = withStyles({ 
	root: { 
		fontFamily: 'Quicksand',
		fontWeight: 300,
		fontSize: 13,
		'&.Mui-selected': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
		'&.Mui-selected:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
		'&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
	}
})(MenuItem);

const useStyles = makeStyles({
	paper: {
		borderRadius: 2,
		boxShadow: '0px 0px 6px 2px rgba(211,211,211,1)',
		color: '#d3d3d3',
		background: '#2d3138',
		'&::-webkit-scrollbar': {
			width: 10,
    		height: 10,
    		borderRadius: 2,
    		background: '#2d3138'
		},
		'&::-webkit-scrollbar-track': {
			borderRadius: 2,
    		background: '#2d3138'
		},
		'&::-webkit-scrollbar-thumb': {
			borderRadius: 2,
    		background: 'rgb(0, 0, 0)'
		}
	}
});

export const DetailPaneHeaderMainOption = ({
	mainOption, 
	mainOptionList,
	dispatch
}) => {
	const classes = useStyles();

	const handleSelectMainOption = event => 
		dispatch({
			type: 'SELECT_DETAIL_PANE_MAIN_OPTION',
			option: event.target.value
		});

	return (
		<MySelect
			value={ mainOption }
			onChange={ handleSelectMainOption }
			input={ <MyInput /> }
			MenuProps={{ classes: { paper: classes.paper } }}
		>
			{ mainOptionList.map(option => 
				<MyMenuItem key={ option } value={ option }>{ option }</MyMenuItem>) }
		</MySelect>
	);
};
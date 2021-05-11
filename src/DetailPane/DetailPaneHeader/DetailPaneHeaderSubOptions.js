import { checkIsNetworkMetric } from '../../useInterfaceState/updateDetailPane';
import { Input, Select, MenuItem } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import './DetailPaneHeaderSubOptions.css';

const MyInput = withStyles({
	root: {
		fontFamily: 'Quicksand',
		fontWeight: 600,
	    fontSize: 12,
	    color: '#d3d3d3',
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
	root: { 
		padding: 0,
		'&.MuiSelect-select': { paddingRight: 0 }
	},
	icon: {
		display: 'none'
	}
})(Select);

const MyMenuItem = withStyles({ 
	root: { 
		fontFamily: 'Quicksand',
		fontWeight: 300,
		fontSize: 12,
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

export const DetailPaneHeaderSubOptions = ({
	mainOption,
	subOption1, 
	subOption1List,
	subOption2, 
	subOption2List,
	dispatch
}) => {
	const classes = useStyles();
	const isSelectedNetworkMetric = checkIsNetworkMetric(mainOption);

	const handleSelectSubOption = (event, key) => 
		dispatch({
			type: 'SELECT_DETAIL_PANE_SUB_OPTION',
			key, option: event.target.value
		});

	if (isSelectedNetworkMetric)
		return (
			<div className="sub-options">
				(Modelling network as <MySelect
					value={ subOption1 }
					onChange={ event => handleSelectSubOption(event, 'subOption1') }
					input={ <MyInput /> }
					MenuProps={{ classes: { paper: classes.paper } }}
				>
					{ subOption1List.map(option =>
						<MyMenuItem key={ option } value={ option }>{ option }</MyMenuItem>) }
				</MySelect> and <MySelect
					value={ subOption2 }
					onChange={ event => handleSelectSubOption(event, 'subOption2') }
					input={ <MyInput /> }
					MenuProps={{ classes: { paper: classes.paper } }}
				>
					{ subOption2List.map(option =>
						<MyMenuItem key={ option } value={ option }>{ option }</MyMenuItem>) }
				</MySelect> graph)
			</div>
		);

	if (!isSelectedNetworkMetric)
		return (
			<div className="sub-options">
				(Between <MySelect
					value={ subOption1 }
					onChange={ event => handleSelectSubOption(event, 'subOption1') }
					input={ <MyInput /> }
					MenuProps={{ classes: { paper: classes.paper } }}
				>
					{ subOption1List.map(option =>
						<MyMenuItem key={ option } value={ option }>{ option }</MyMenuItem>) }
				</MySelect> and <MySelect
					value={ subOption2 }
					onChange={ event => handleSelectSubOption(event, 'subOption2') }
					input={ <MyInput /> }
					MenuProps={{ classes: { paper: classes.paper } }}
				>
					{ subOption2List.map(option =>
						<MyMenuItem key={ option } value={ option }>{ option }</MyMenuItem>) }
				</MySelect>)
			</div>
		);
};
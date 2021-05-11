import { Input, Select, MenuItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import './LinkDisaggregatorHeader.css';

const MyInput = withStyles({ 
	root: { 
    	fontFamily: 'Quicksand',
    	fontSize: 15,
    	fontWeight: 300,
    	color: '#3d3d3d',
    	width: '100%',
    	'&:not(.Mui-disabled):hover::before': {
    		borderBottom: '2px solid rgba(211, 211, 211, 0.6)'
	    }
	},
	underline: {
		'&:before': { borderBottom: '1px solid rgba(211, 211, 211, 0.6)' },
		'&:after': { borderBottom: '2px solid rgba(211, 211, 211, 0.6)' }
	}
})(Input);

const MySelect = withStyles({ 
	root: { '&:focus': { backgroundColor: 'transparent' } },
	icon: { color: 'rgba(211, 211, 211)' }
})(Select);

const MyMenuItem = withStyles({ 
	root: { 
		fontFamily: 'Quicksand',
		fontWeight: 300,
		fontSize: 13
	}
})(MenuItem);

export const LinkDisaggregatorHeader = ({
	headerList,
	headerOption,
	linkDisaggregatorDispatch
}) => {
	const handleSelectOption = event => 
		linkDisaggregatorDispatch({ 
			type: "SELECT_DATASET",
			option: event.target.value
		});

	return (
		<div className="header">
        <div className="label">DATASET</div>
        <MySelect
        	value={ headerOption }
        	onChange={ handleSelectOption }
        	input={ <MyInput /> }
        >
          { headerList.map(option => 
          	<MyMenuItem key={ option.linkType } value={ option }>
          		{ option.displayName }
          	</MyMenuItem>) }
        </MySelect>
      </div>
	);
};
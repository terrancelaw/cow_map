import { DataTable } from '../../widgets/DataTable/DataTable';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Input, Select, MenuItem } from '@material-ui/core';
import './DataTableSection.css';

const MyInput = withStyles({
	root: {
		fontFamily: 'Quicksand',
		fontWeight: 300,
		fontSize: 14,
		"&:not(.Mui-disabled):hover::before": {
    		borderBottom: '1px dashed rgba(0, 0, 0, 1)'
	    }
	},
	underline: {
		'&:before': { borderBottom: '1px dashed rgba(0, 0, 0, 0.42)' },
		'&:after': { borderBottom: '1px dashed rgba(0, 0, 0, 0.42)' }
	}
})(Input);

const MySelect = withStyles({
	root: { 
		padding: 0,
		'&.MuiSelect-select': { paddingRight: 0 },
		'&:focus': { backgroundColor: 'transparent' }
	},
	icon: {
		display: 'none'
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
		borderRadius: 2
	}
});

export const DataTableSection = ({
	tableName,
	tableHeaderText,
	attributeList,
	tableRowList,
	filterAttrNameList,
	filterAttrValueList,
	filterAttrName,
	filterAttrValue,
	handleChangeAttrName,
	handleChangeAttrValue
}) => {
	const classes = useStyles();

	return (
		<div className="data-table-section section">
			<div className="header">{ tableHeaderText }</div>
			<div className="content">
				<DataTable
					tableName={ tableName }
					attributeList={ attributeList }
					tableRowList={ tableRowList }
				/>
			</div>

			{ filterAttrValueList.length === 0 ? 
				<div className="footer">
					FILTER: <MySelect
						value={ filterAttrName }
						onChange={ handleChangeAttrName }
						input={ <MyInput /> }
						MenuProps={{ classes: { paper: classes.paper } }}
					>
						{ filterAttrNameList.map(option => 
							<MyMenuItem key={ option.key } value={ option }>
								{ option.displayName }
							</MyMenuItem>) }
					</MySelect>
				</div> : 
				<div className="footer">
					FILTER: <MySelect
						value={ filterAttrName }
						onChange={ handleChangeAttrName }
						input={ <MyInput /> }
						MenuProps={{ classes: { paper: classes.paper } }}
					>
						{ filterAttrNameList.map(option => 
							<MyMenuItem key={ option.key } value={ option }>
								{ option.displayName }
							</MyMenuItem>) }
					</MySelect> equals <MySelect
						value={ filterAttrValue }
						onChange={ handleChangeAttrValue }
						input={ <MyInput /> }
						MenuProps={{ classes: { paper: classes.paper } }}
					>
						{ filterAttrValueList.map(option => 
							<MyMenuItem key={ option.key } value={ option }>
								{ option.displayName }
							</MyMenuItem>) }
					</MySelect>
				</div> }

		</div>
	);
};
import { LineChart } from './LineChart';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Input, Select, MenuItem } from '@material-ui/core';
import './TimeSeriesSection.css';

const MyInput = withStyles({
	root: {
		fontFamily: 'Quicksand',
		fontWeight: 300,
		fontSize: 15,
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

export const TimeSeriesSection = ({ 
	sectionHeaderText, 
	isBilateral, 
	lineChartList,
	filterYearList,
	filterStartYear,
	filterEndYear,
	handleChangeStartYear,
	handleChangeEndYear
}) => {
	const classes = useStyles();

	if (isBilateral)
		return (
			<div className="time-series-section section bilateral">
				<div className="header">{ sectionHeaderText }</div>
				<div className="content">
					<div className="grid">
						{ lineChartList.map(lineChartObject => 
							<LineChart 
								key={ lineChartObject.key }
								isBilateral={ isBilateral }
								data={ lineChartObject }
							/>) }
					</div>
					<div className="dummy-for-padding"></div>
				</div>
				<div className="footer">
					FILTER: Between <MySelect 
						value={ filterStartYear }
						onChange={ handleChangeStartYear }
						input={ <MyInput /> }
						MenuProps={{ classes: { paper: classes.paper } }}
					>
						{ filterYearList.map(year => 
							<MyMenuItem key={ year } value={ year }>{ year }</MyMenuItem>) }
					</MySelect> and <MySelect 
						value={ filterEndYear }
						onChange={ handleChangeEndYear }
						input={ <MyInput /> }
						MenuProps={{ classes: { paper: classes.paper } }}
					>
						{ filterYearList.map(year => 
							<MyMenuItem key={ year } value={ year }>{ year }</MyMenuItem>) }
					</MySelect>
				</div>
			</div>
		);

	if (!isBilateral)
		return (
			<div className="time-series-section section non-bilateral">
				<div className="header">{ sectionHeaderText }</div>
				<div className="content">
					{ lineChartList.map(lineChartObject => 
						<LineChart 
							key={ lineChartObject.key }
							isBilateral={ isBilateral }
							data={ lineChartObject }
						/>) }
				</div>
				<div className="footer">
					FILTER: Between <MySelect 
						value={ filterStartYear }
						onChange={ handleChangeStartYear }
						input={ <MyInput /> }
						MenuProps={{ classes: { paper: classes.paper } }}
					>
						{ filterYearList.map(year => 
							<MyMenuItem key={ year } value={ year }>{ year }</MyMenuItem>) }
					</MySelect> and <MySelect 
						value={ filterEndYear }
						onChange={ handleChangeEndYear }
						input={ <MyInput /> }
						MenuProps={{ classes: { paper: classes.paper } }}
					>
						{ filterYearList.map(year => 
							<MyMenuItem key={ year } value={ year }>{ year }</MyMenuItem>) }
					</MySelect>
				</div>
			</div>
		);
};
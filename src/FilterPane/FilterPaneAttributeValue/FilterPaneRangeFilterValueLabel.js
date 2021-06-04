export const FilterPaneRangeFilterValueLabel = ({ children, value, className }) => {
	const labelClassName = className;
	const labelStyle = {
		fontSize: 15,
		fontWeight: 300,
		fontFamily: 'Quicksand',
		marginBottom: 40,
		color: '#d3d3d3'
	};

	return (
		<span { ...children.props }>
			<span className={ labelClassName } style={ labelStyle } >{ value }</span>
		</span>
	);
};
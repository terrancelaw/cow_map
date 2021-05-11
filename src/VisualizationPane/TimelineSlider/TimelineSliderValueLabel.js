export const TimelineSliderValueLabel = ({ 
	children, 
	value, 
	className, 
	disabled 
}) => {
	const labelClassName = className;
	const labelStyle = {  
		fontSize: 16,
		fontWeight: 300,
		fontFamily: 'Quicksand',
		marginBottom: 50,
		color: disabled ? null : '#3d3d3d'
	};

	return (
		<span { ...children.props }>
			<span className={ labelClassName } style={ labelStyle } >{ value }</span>
		</span>
	);
};
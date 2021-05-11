import { memo } from 'react';
import { schemeTableau10 } from 'd3';
import './ColorPicker.css';

export const ColorPicker = memo(({ colorPickerState, dispatch }) => {
	const { 
		isOpen, 
		linkKey, 
		currColor,
		colorTop, 
		colorLeft, 
		colorWidth, 
		colorHeight 
	} = colorPickerState;

	const handleClickBackground = () =>
		dispatch({ type: 'CLOSE_COLOR_PICKER' });
	const handleClickColor = (linkKey, newColor) => 
		dispatch({ type: 'SELECT_COLOR', linkKey, newColor });

	if (!isOpen)
		return null;

	return (
		<div className="color-picker">
			<div 
				className="background" 
				onClick={ handleClickBackground }
			/>
			<div 
				className="curr-color"
				style={{ 
					top: colorTop,
					left: colorLeft,
					width: colorWidth,
					height: colorHeight,
					color: currColor,
					background: currColor
				}}
			/>
			<div 
				className="window"
				style={{ 
					top: colorTop + colorHeight + 8,
					left: colorLeft + colorWidth + 8
				}}
			>
				{ schemeTableau10.map(color => 
					<div 
						key={ color }
						className="color"
						style={{ background: color, color: color }}
						onClick={ () => { handleClickColor(linkKey, color) } }
					/>) }
			</div>
		</div>
	);
});
import './SparkLine.css';

export const width = 120;

export const height = 30;

export const margin = {
	top: 10,
	left: 25,
	bottom: 10,
	right: 25
};

export const SparkLine = ({
	startYear, endYear,
	startX, endX,
	startY, endY,
	pathData
}) => {
	return (
		<svg>
			<g style={{ transform: `translate(${ margin.left }px, ${ margin.top }px)` }}>
				<path d={ pathData }></path>
				<text className="start year" x={ startX } y={ startY } dx="-3">{ startYear }</text>
				<text className="end year" x={ endX } y={ endY } dx="3">{ endYear }</text>
			</g>
		</svg>
	)
};
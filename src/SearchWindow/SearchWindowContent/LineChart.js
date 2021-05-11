import { format } from 'd3';
import './LineChart.css';

export const bilateralLineChart = {
	width: 180,
	height: 60,
	margin: {
		top: 10,
		left: 30,
		bottom: 10,
		right: 30
	}
};

export const nonBilateralLineChart = {
	width: 370,
	height: 70,
	margin: {
		top: 10,
		left: 40,
		bottom: 10,
		right: 40
	}
};

export const LineChart = ({ isBilateral, data }) => {
	const percentFormatter = format('.0%');

	if (isBilateral) {
		const { margin } = bilateralLineChart;
		const { 
			titleText, 
			startYear, endYear, 
			startX, endX, 
			startY, endY, 
			pathData, percentChange 
		} = data;
		const formattedPercentChange = percentChange > 0 
									 ? `+${ percentFormatter(percentChange) }`
									 : percentFormatter(percentChange);

		return (
			<div className="line-chart">
				<div className="title">{ titleText }</div>
				<div className="percent-change">{ formattedPercentChange }</div>
				<svg>
					<g style={{ transform: `translate(${ margin.left }px, ${ margin.top }px)` }}>
						<path d={ pathData }></path>
						<text className="start year" x={ startX } y={ startY } dx="-3">{ startYear }</text>
						<text className="end year" x={ endX } y={ endY } dx="3">{ endYear }</text>
					</g>
				</svg>
			</div>
		);
	}

	if (!isBilateral) {
		const { margin } = nonBilateralLineChart;
		const { 
			countryName, metricName, 
			startValue, endValue, 
			startYear, endYear, 
			startX, endX, 
			startY, endY, 
			pathData, percentChange 
		} = data;
		const verb = percentChange >= 0 ? 'increased' : 'decreased';
		const roundedStartValue = Math.round((startValue + Number.EPSILON) * 1000) / 1000;
		const roundedEndValue = Math.round((endValue + Number.EPSILON) * 1000) / 1000;
		const formattedPercentChange = percentChange > 0 
									 ? `+${ percentFormatter(percentChange) }`
									 : percentFormatter(percentChange);

		return (
			<div className="line-chart">
				<div className="description">
					The { metricName } of <span>{ countryName }</span> { verb } from <span>{ roundedStartValue }
					</span> in <span>{ startYear }</span> to <span>{ roundedEndValue }</span> in <span>{ endYear }
					</span> (<span>{ formattedPercentChange }</span>).
				</div>
				<svg>
					<g style={{ transform: `translate(${ margin.left }px, ${ margin.top }px)` }}>
						<path d={ pathData }></path>
						<text className="start year" x={ startX } y={ startY } dx="-5">{ startYear }</text>
						<text className="end year" x={ endX } y={ endY } dx="5">{ endYear }</text>
					</g>
				</svg>
			</div>
		);
	}
};
import './Bar.css';

export const Bar = ({ width, percent = true }) => {
	if (percent)
		return <div className="bar" style={{ width: `${ width }%` }}></div>;
	else if (!percent)
		return <div className="bar" style={{ width: width }}></div>
};
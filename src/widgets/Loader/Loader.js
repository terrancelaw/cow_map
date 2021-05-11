import './Loader.css';

export const Loader = ({ isLoading = true }) => {
	return ( isLoading ? 
		<div className="loader">
			<div className="background"></div>
			<div className="loader-container">
				<div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
			</div>
		</div> : null
	);
};
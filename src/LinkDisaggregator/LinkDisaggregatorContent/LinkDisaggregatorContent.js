import './LinkDisaggregatorContent.css';

export const LinkDisaggregatorContent = ({
	contentList,
	linkDisaggregatorDispatch
}) => {
	const handleSelectItem = itemKey => 
		linkDisaggregatorDispatch({ type: 'SELECT_CONTENT_OPTION', itemKey });

	return (
		<div className="content">
			<div className="label">DISAGGREGATE BY:</div>
			<div className="list">
				{ contentList.map(({ key, isSelected, displayName }) => 
					<label 
						className="item"
						key={ key }
					>
						<input 
							type="checkbox" 
							checked={ isSelected } 
							onChange={ () => { handleSelectItem(key) } }
						/>
						<span className="checkmark"></span>
						<span className="text">{ displayName }</span>
					</label>) }
			</div>
		</div>
	);
};
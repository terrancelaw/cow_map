import { memo } from 'react';
import { FaTimes } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import './SearchWindowHeader.css';

export const SearchWindowHeader = memo(({
	sourceState,
	targetState,
	searchDispatch,
	interfaceDispatch
}) => {
	const { 
		query: sourceQuery,
		list: sourceList,
		listTop: sourceListTop,
		listLeft: sourceListLeft
	} = sourceState;
	const { 
		query: targetQuery,
		list: targetList,
		listTop: targetListTop,
		listLeft: targetListLeft
	} = targetState;

	const handleClickCloseButton = () => interfaceDispatch({ type: 'CLOSE_SEARCH_WINDOW' });
	const handleChangeSourceInput = event => searchDispatch({ type: 'INPUT_SOURCE_QUERY', inputEl: event.target });
	const handleChangeTargetInput = event => searchDispatch({ type: 'INPUT_TARGET_QUERY', inputEl: event.target });
	const handleClickSearchButton = () => searchDispatch({ type: 'START_SEARCHING' });
	const handleClickCountryName = (sourceOrTarget, countryName) => 
		searchDispatch({
			type: 'CLICK_COUNTRY_NAME',
			sourceOrTarget: sourceOrTarget,
			countryName: countryName
		});
	const handleMouseEnterCountryName = (sourceOrTarget, countryName) => 
		searchDispatch({
			type: 'MOUSE_ENTER_COUNTRY_NAME',
			sourceOrTarget: sourceOrTarget,
			countryName: countryName
		});
	const handleMounseLeaveCountryName = (sourceOrTarget, countryName) => 
		searchDispatch({
			type: 'MOUSE_LEAVE_COUNTRY_NAME',
			sourceOrTarget: sourceOrTarget,
			countryName: countryName
		});

	return (
		<div className="header">
			
			<div className="search-bar">
				<label className="source input-box">
					<div className="label">SOURCE</div>
					<input 
						type="text" 
						autoComplete="off" 
						spellCheck="false"
						value={ sourceQuery }
						onChange={ handleChangeSourceInput }
						onFocus={ handleChangeSourceInput }
					/>
				</label>
				<label className="target input-box">
					<div className="label">TARGET</div>
					<input 
						type="text" 
						autoComplete="off" 
						spellCheck="false"
						value={ targetQuery }
						onChange={ handleChangeTargetInput }
						onFocus={ handleChangeTargetInput }
					/>
				</label>
				<div 
					className="search-button" 
					onClick={ handleClickSearchButton }
				><BiSearch /></div>
			</div>

			<FaTimes 
				className="close-button"
				onClick={ handleClickCloseButton }
			/>

			{ sourceList.length === 0 ? null :
				<div 
					className="source country-list" 
					style={{ top: sourceListTop, left: sourceListLeft }}
				>{ sourceList.map(({ countryName, selected }) => 
					<div 
						key={ countryName }
						className={ selected ? "source country-name selected" : "source country-name" }
						onClick={ () => { handleClickCountryName('source', countryName) } }
						onMouseEnter={ () => { handleMouseEnterCountryName('source', countryName) } }
						onMouseLeave={ () => { handleMounseLeaveCountryName('source', countryName) } }
					>{ countryName }</div>) }
				</div> }

			{ targetList.length === 0 ? null :
				<div 
					className="target country-list" 
					style={{ top: targetListTop, left: targetListLeft }}
				>{ targetList.map(({ countryName, selected }) => 
					<div 
						key={ countryName }
						className={ selected ? "target country-name selected" : "target country-name" }
						onClick={ () => { handleClickCountryName('target', countryName) } }
						onMouseEnter={ () => { handleMouseEnterCountryName('target', countryName) } }
						onMouseLeave={ () => { handleMounseLeaveCountryName('target', countryName) } }
					>{ countryName }</div>) }
				</div> }

		</div>
	);
});
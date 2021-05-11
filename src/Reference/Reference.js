import $ from 'jquery';
import { memo } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { FaTimes } from "react-icons/fa";
import './Reference.css';

export const Reference = memo(({ 
	referenceIsOpen, 
	detailPaneIsOpen,
	dispatch
}) => {
	const handleClickOpenButton = () => 
		dispatch({ type: 'OPEN_REFERENCE' });
	const handleClickCloseButton = () => 
		dispatch({ type: 'CLOSE_REFERENCE' });
	const handleMouseEnterOpenButton = event => 
		dispatch({ 
			type: 'MOUSE_ENTER_CONTROL_BUTTON',
			buttonEl: $(event.target).closest('.button')[0],
			text: 'References'
		});
	const handleMouseLeaveOpenButton = () => 
		dispatch({ type: 'MOUSE_LEAVE_CONTROL_BUTTON' });

	if (!referenceIsOpen)
		return (
			<div 
				className="reference button"
				onClick={ handleClickOpenButton }
				onMouseEnter={ handleMouseEnterOpenButton }
				onMouseLeave={ handleMouseLeaveOpenButton }
				style={{ right: !detailPaneIsOpen ? 232 : 482 }}
			><IoInformationCircleOutline /></div>
		);

	return (
		<div id="reference">
			<div 
				className="background"
				onClick={ handleClickCloseButton }
			/>
			<div className="window">
				<div 
					className="close button" 
					onClick={ handleClickCloseButton }
				><FaTimes /></div>
				<div className="header">REFERENCES</div>
				<div className="content">
					<div className="item">1. Barbieri, Katherine and Omar M. G. Omar Keshk. 2016. Correlates of War Project Trade Data Set Codebook, Version 4.0. Online: http://correlatesofwar.org.</div>
					<div className="item">2. Barbieri, Katherine, Omar M. G. Keshk, and Brian Pollins. 2009. “TRADING DATA: Evaluating our Assumptions and Coding Rules.” Conflict Management and Peace Science. 26(5): 471-491.</div>
					<div className="item">3. Kinne, Brandon J. 2020. “The Defense Cooperation Agreement Dataset (DCAD).” Journal of Conflict Resolution 64(4): 729-755.</div>
					<div className="item">4. Sarkees, Meredith Reid and Frank Wayman (2010). Resort to War: 1816 - 2007. Washington DC: CQ Press.</div>
					<div className="item">5. Singer, J. David, Stuart Bremer, and John Stuckey. (1972). "Capability Distribution, Uncertainty, and Major Power War, 1820-1965." in Bruce Russett (ed) Peace, War, and Numbers, Beverly Hills: Sage, 19-48.</div>
					<div className="item">6. Zeev Maoz, Paul L. Johnson, Jasper Kaplan, Fiona Ogunkoya, and Aaron Shreve 2019. The Dyadic Militarized Interstate Disputes (MIDs) Dataset Version 3.0: Logic, Characteristics, and Comparisons to Alternative Datasets, Journal of Conflict Resolution (forthcoming).</div>
				</div>
			</div>
		</div>
	);
});
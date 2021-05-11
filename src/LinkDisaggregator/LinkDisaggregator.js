import $ from 'jquery';
import { memo } from 'react';
import { CgComponents } from 'react-icons/cg';
import { BiTrash } from 'react-icons/bi';
import { IoCloseOutline } from 'react-icons/io5';
import { LinkDisaggregatorHeader } from './LinkDisaggregatorHeader/LinkDisaggregatorHeader';
import { LinkDisaggregatorContent } from './LinkDisaggregatorContent/LinkDisaggregatorContent';
import { useLinkDisaggregator } from './useLinkDisaggregator/useLinkDisaggregator';
import './LinkDisaggregator.css';

export const LinkDisaggregator = memo(({
	linkDataList,
	linkDisaggregatorIsOpen,
	interfaceDispatch 
}) => {
	const [ {
		header: { list: headerList, option: headerOption },
		content: { list: contentList }
	}, linkDisaggregatorDispatch ] = useLinkDisaggregator(
		{ linkDisaggregatorIsOpen },
		{ linkDataList }
	);

	const handleMouseEnterButton = event => 
		interfaceDispatch({
			type: 'MOUSE_ENTER_CONTROL_BUTTON',
			buttonEl: $(event.target).closest('.button')[0],
			text: $(event.target).closest('.button').attr('tooltip-text')
		});
	const handleMouseLeaveButton = () => 
		interfaceDispatch({ type: 'MOUSE_LEAVE_CONTROL_BUTTON' });
	const handleClickOpenButton = () =>
		interfaceDispatch({ type: 'OPEN_LINK_DISAGGREGATOR' });
	const handleClickClearButton = () =>
		interfaceDispatch({ type: 'CLEAR_DISAGGREGATED_LINKS' });
	const handleCloseLinkDisaggregator = () =>
		interfaceDispatch({ type: 'CLOSE_LINK_DISAGGREGATOR' })
	const handleClickConfirmButton = () => 		
		interfaceDispatch({
			type: 'CONFIRM_LINK_DISAGGREGATION',
			linkKey: headerOption.linkType, // linkType is used as key
			optionList: contentList
				.filter(({ isSelected }) => isSelected)
		});

	if (!linkDisaggregatorIsOpen)
		return (
			<>
				<div 
					className="link-disaggregator open button"
					onMouseEnter={ handleMouseEnterButton }
					onMouseLeave={ handleMouseLeaveButton }
					onClick={ handleClickOpenButton }
					tooltip-text="Disaggregate link"
				><CgComponents /></div>
				<div 
					className="link-disaggregator clear button"
					onMouseEnter={ handleMouseEnterButton }
					onMouseLeave={ handleMouseLeaveButton }
					onClick={ handleClickClearButton }
					tooltip-text="Clear disaggregated links"
				><BiTrash /></div>
			</>
		);

	return (
		<div id="link-disaggregator">
			<div 
				className="background"
				onClick={ handleCloseLinkDisaggregator }
			/>
			<div 
				className="button"
				onClick={ handleCloseLinkDisaggregator }
			><IoCloseOutline /></div>
			<div className="window">
				<LinkDisaggregatorHeader 
					headerList={ headerList } 
					headerOption={ headerOption } 
					linkDisaggregatorDispatch={ linkDisaggregatorDispatch }
				/>
				<LinkDisaggregatorContent 
					contentList={ contentList }
					linkDisaggregatorDispatch={ linkDisaggregatorDispatch }
				/>
				<div 
					className="confirm-button"
					onClick={ handleClickConfirmButton }
				>OK</div>
			</div>
		</div>
	);
});
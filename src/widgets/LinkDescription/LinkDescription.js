import { plural } from 'pluralize';

export const LinkDescription = ({
	linkRowCount, 
	sourceName, 
	targetName, 
	timelineSliderState,
	eventName
}) => {
	const { yearAttribute, value } = timelineSliderState;

	if (yearAttribute.key === 'no-filter') // no timeline filter -> not show year
		return (<>
			<span>{ linkRowCount }</span>{ linkRowCount === 1 ? eventName : plural(eventName) } between
			<span>{ sourceName }</span>and<span>{ targetName }</span>
		</>);
	if (yearAttribute.key === 'is-start')
		return (<>
			<span>{ linkRowCount }</span>{ linkRowCount === 1 ? eventName : plural(eventName) } between
			<span>{ sourceName }</span>and<span>{ targetName }</span> 
			that { linkRowCount === 1 ? 'has' : 'have' } been started but not ended in
			<span>{ value }</span>
		</>);
	if (yearAttribute.key === 'is-signed')
		return (<>
			<span>{ linkRowCount }</span>{ linkRowCount === 1 ? eventName : plural(eventName) } between
			<span>{ sourceName }</span>and<span>{ targetName }</span> 
			that { linkRowCount === 1 ? 'has' : 'have' } been signed but not ended in
			<span>{ value }</span>
		</>);
	if (yearAttribute.key === 'is-in-force')
		return (<>
			<span>{ linkRowCount }</span>{ linkRowCount === 1 ? eventName : plural(eventName) } between
			<span>{ sourceName }</span>and<span>{ targetName }</span> 
			that { linkRowCount === 1 ? 'is' : 'are' } still in force in
			<span>{ value }</span>
		</>);
	if (yearAttribute.key === 'include-start')
		return (<>
			<span>{ linkRowCount }</span>{ linkRowCount === 1 ? eventName : plural(eventName) } between
			<span>{ sourceName }</span>and<span>{ targetName }</span>started between
			<span>{ value[0] }</span>and<span>{ value[1] }</span>
		</>);
	if (yearAttribute.key === 'include-sign')
		return (<>
			<span>{ linkRowCount }</span>{ linkRowCount === 1 ? eventName : plural(eventName) } between
			<span>{ sourceName }</span>and<span>{ targetName }</span>signed between
			<span>{ value[0] }</span>and<span>{ value[1] }</span>
		</>);
	if (yearAttribute.key === 'include-in-force')
		return (<>
			<span>{ linkRowCount }</span>{ linkRowCount === 1 ? eventName : plural(eventName) } between
			<span>{ sourceName }</span>and<span>{ targetName }</span>entered into force between
			<span>{ value[0] }</span>and<span>{ value[1] }</span>
		</>);
	
	return null;
};
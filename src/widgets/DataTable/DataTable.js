import $ from 'jquery'; 
import { useClusterize } from './useClusterize';
import './DataTable.css';

export const DataTable = ({
	tableName,
	attributeList,
	tableRowList
}) => {
	const handleScroll = event => {
		const tableScrollLeft = $(event.target).scrollLeft();
		$(`.${ tableName }.data-table .header .row`).scrollLeft(tableScrollLeft);
	};

	useClusterize(tableName, tableRowList);

	return (
		<div className={ `${ tableName } data-table` }>
			<div className="header">
				<div className="row">
					{ attributeList.map(attributeName => 
						<div key={ attributeName } className="cell">
							<div className="label">{ attributeName }</div>
						</div>) }
				</div>
			</div>
			<div 
				className="content" 
				id={ `${ tableName }-scroll-area` }
				onScroll={ handleScroll }
			>
				<div id={ `${ tableName }-content-area` } className="content-wrapper"></div>
			</div>
		</div>
	);
};
import { CollapsibleCard } from '../index';
import { getStatusColour } from '@/utils/functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesLeft, faAnglesRight, faSearch, faCircle, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import { useState, useEffect } from 'react';
import type { SyntheticEvent } from 'react';
import type { UserHistory } from '@/types';

type SortOrder = 'asc' | 'desc';
type sortType = 'accessedAt' | 'statusCode'

export default function HistoryListCard() {
	const [history, setHistory] = useState<Array<UserHistory>>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
	const [sortType, setSortType] = useState<sortType>('accessedAt');

	useEffect(() => {
		fetchHistory(page);
	}, [page]);

	async function deleteEndpoint(id: number) {
		await fetch('/api/session/admin/history', {
			method: 'DELETE',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				id,
			}),
		});
	}

	async function updateDOM(e: SyntheticEvent) {
		const { value } = (e.target as HTMLInputElement);
		const query = value.length > 0 ? `/search?name=${value}` : '';
		try {
			const res = await fetch(`/api/session/admin/history${query}`, {
				method: 'get',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
			});
			const data = await res.json();

			setHistory(data.history);
			setPage(0);
		} catch (err) {
			console.log(err);
		}
	}


	async function fetchHistory(p: number, order?: SortOrder, type?: sortType) {
		if (order == undefined) order = sortOrder;
		if (type == undefined) type = sortType;

		try {
			const res = await fetch(`/api/session/admin/history?orderDir=${order}&page=${p}&orderType=${type}`, {
				method: 'get',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
			});
			const data = await res.json();
			setHistory(data.history);
			setTotal(data.total);
			setPage(p);
		} catch (err) {
			console.log(err);
		}
	}

	function updateSortOrder(type: sortType) {
		if (type != sortType) {
			// Type has changed so set type to selected and direction to desc
			setSortType(type);
			setSortOrder('desc');
			fetchHistory(page, 'desc', type);
		} else {
			// Type hasn't changed so just change direction
			const sort = (sortOrder == 'asc') ? 'desc' : 'asc';
			setSortType(type);
			setSortOrder(sort);
			fetchHistory(page, sort, type);
		}
	}

	return (
		<CollapsibleCard id={'Total_API_Usage'} header={	<h5 className="m-0 fw-bold text-primary">Total API usage ({total}):</h5>}>
			<>
				<div className="input-group mb-3">
					<input type="text" className="form-control" placeholder="Endpoint" aria-label="Endpoint" aria-describedby="basic-addon2" onChange={updateDOM}/>
					<span className="input-group-text" id="basic-addon2">
						<FontAwesomeIcon icon={faSearch} />
					</span>
				</div>
				{history.map(hi => <Tooltip key={hi.id} id={`${hi.id}`} place="top" content={`${hi.statusCode}`} variant="dark" />)}
				<table className="table">
					<thead>
						<tr>
							<th scope="col">UserID</th>
							<th scope="col">Endpoint</th>
							<th scope="col" onClick={() => updateSortOrder('accessedAt')}>Accessed at
								<div className="float-end">
									{sortType == 'accessedAt' && (
										sortOrder == 'asc' ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />
									)}
								</div>
							</th>
							<th scope="col" onClick={() => updateSortOrder('statusCode')}>Status
								<div className="float-end">
									{sortType == 'statusCode' && (
										sortOrder == 'asc' ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />
									)}
								</div>
							</th>
							<th scope="col">Delete</th>
						</tr>
					</thead>
					<tbody>
						{history.map(hi => (
							<tr key={hi.id}>
								<th scope="row">{hi.userId}</th>
								<td>{hi.endpointName}</td>
								<td>{new Date(hi.createdAt).toDateString()} {new Date(hi.createdAt).toLocaleTimeString('en-US')}</td>
								<td style={{ textAlign: 'center' }} data-tooltip-id={`${hi.id}`}>
									<FontAwesomeIcon icon={faCircle} style={{ color: getStatusColour(hi.statusCode) }}/>
								</td>
								<td>
									<input className="form-check-input" type="checkbox" id="flexCheckChecked" onClick={() => deleteEndpoint(hi.id)} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<nav aria-label="Page navigation example">
					<p style={{ display: 'inline' }}>Showing results {(page < 1 ? 0 : page) * 50} - {(page * 50) + (history.length < 50 ? history.length : 50)} of {total}</p>
					<ul className="pagination justify-content-center">
						<li className="page-item">
							<button className="page-link" onClick={() => setPage(page == 0 ? page : page - 1)}>
								<FontAwesomeIcon icon={faAnglesLeft} />
							</button>
						</li>
						<li className="page-item">
							<p className="page-link">{page}</p>
						</li>
						<li className="page-item">
							<button className="page-link" onClick={() => setPage(history.length >= 50 ? page + 1 : page)}>
								<FontAwesomeIcon icon={faAnglesRight} />
							</button>
						</li>
					</ul>
				</nav>
			</>
		</CollapsibleCard>
	);
}

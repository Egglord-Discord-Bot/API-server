import { Modal, CollapsibleCard } from '../index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesLeft, faAnglesRight, faPenToSquare, faSearch, faBan, faDollarSign, faUserCheck, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import type { User } from '@/types/next-auth';
import type { SyntheticEvent } from 'react';

interface Props {
  total: number
}
type SortOrder = 'asc' | 'desc';
type sortType = 'joinedAt' | 'requests'

export default function UserCard({ total }: Props) {
	const [page, setPage] = useState(0);
	const [users, setUsers] = useState<Array<User>>([]);
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
	const [sortType, setSortType] = useState<sortType>('joinedAt');

	useEffect(() => {
		fetchUsers(page);
	}, [page]);

	async function fetchUsers(p: number, order?: SortOrder, type?: sortType) {
		if (order == undefined) order = sortOrder;
		if (type == undefined) type = sortType;
		try {
			const res = await fetch(`/api/session/admin/users?orderDir=${order}&page=${p}&orderType=${type}`, {
				method: 'get',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
			});
			const data = await res.json();
			setUsers(data.users);
			setPage(p);
		} catch (err) {
			console.log(err);
		}
	}

	async function updateSortOrder(type: sortType) {
		if (type != sortType) {
			// Type has changed so set type to selected and direction to desc
			setSortType(type);
			setSortOrder('desc');
			fetchUsers(page, 'desc', type);
		} else {
			// Type hasn't changed so just change direction
			const sort = (sortOrder == 'asc') ? 'desc' : 'asc';
			setSortType(type);
			setSortOrder(sort);
			fetchUsers(page, sort, type);
		}
	}

	async function searchByName(e: SyntheticEvent) {
		const { value } = (e.target as HTMLInputElement);
		const query = value.length > 0 ? `/search?name=${value}` : '';

		const res = await fetch(`/api/session/admin/users${query}`, {
			method: 'get',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		});
		const data = await res.json();
		setUsers(data.users);
		setPage(0);
		setSortOrder('desc');
	}

	return (
		<CollapsibleCard id="UserList" header={<h6 className="m-0 font-weight-bold text-primary">Users</h6>}>
			<div className="table-responsive">
				<div className="form-inline mr-auto my-2 my-md-0 mw-100 col-lg-6">
					<div className="input-group mb-3">
						<input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Recipient's username" aria-describedby="basic-addon2" onChange={(e) => searchByName(e)}/>
						<button className="btn btn-outline-primary" type="button">
							<FontAwesomeIcon icon={faSearch} />
						</button>
					</div>
				</div>
				<table className="table" style={{ paddingTop: '10px' }}>
					<thead>
						<tr>
							<th scope="col" className="d-none d-lg-table-cell">ID</th>
							<th scope="col">Name</th>
							<th scope="col" onClick={() => updateSortOrder('joinedAt')}>Joined
								<div className="float-end">
									{sortType == 'joinedAt' && (
										sortOrder == 'asc' ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />
									)}
								</div>
							</th>
							<th scope="col" onClick={() => updateSortOrder('requests')}>Total Request
								<div className="float-end">
									{sortType == 'requests' && (
										sortOrder == 'asc' ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />
									)}
								</div>
							</th>
							<th scope="col">Attributes</th>
							<th scope="col">Edit</th>
						</tr>
					</thead>
					<tbody>
						{users?.map((u, index) => (
							<tr key={u.id}>
								<th scope="row" className="d-none d-lg-table-cell">{u.id}</th>
								<th>{u.username}{u.discriminator == '0' ? '' : `#${u.discriminator}`}</th>
								<th>{new Date(u.createdAt).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</th>
								<th>{u._count?.history}</th>
								<th>
									<Tooltip place="top" content={'Admin'} id={`${index}_isAdminTooltip`} />
									{u.isAdmin && (
										<FontAwesomeIcon icon={faUserCheck} style={{ color: '#198754' }} data-tooltip-id={`${index}_isAdminTooltip`}/>
									)}
                &nbsp;
									<Tooltip place="top" content={'Premium'} id={`${index}_isPremiumTooltip`} />
									{u.isPremium && (
										<FontAwesomeIcon icon={faDollarSign} style={{ color: '#ffc107' }} data-tooltip-id={`${index}_isPremiumTooltip`} />
									)}
                &nbsp;
									<Tooltip place="top" content={'Blocked'} id={`${index}_isBlockedTooltip`} />
									{u.isBlocked && (
										<FontAwesomeIcon icon={faBan} style={{ color: '#dc3545' }} data-tooltip-id={`${index}_isBlockedTooltip`} />
									)}
								</th>
								<th>
									<Modal user={u} id={`${u.id}_modal`}/>
									<Tooltip place="top" content={'Edit user'} id={`${index}_openModal`} />
									<button className="btn" data-bs-toggle="modal" data-bs-target={`#${u.id}_modal`} data-tooltip-id={`${index}_openModal`}>
										<FontAwesomeIcon icon={faPenToSquare} />
									</button>
								</th>
							</tr>
						))}
					</tbody>
				</table>
				<nav aria-label="Page navigation example">
					<p style={{ display: 'inline' }}>Showing results {(page < 1 ? 0 : page) * 50} - {(page * 50) + (users.length < 50 ? users.length : 50)} of {total}</p>
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
							<button className="page-link" onClick={() => setPage(users.length >= 50 ? page + 1 : page)}>
								<FontAwesomeIcon icon={faAnglesRight} />
							</button>
						</li>
					</ul>
				</nav>
			</div>
		</CollapsibleCard>
	);
}

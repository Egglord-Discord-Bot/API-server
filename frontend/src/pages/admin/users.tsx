import { Header, Sidebar, AdminNavbar, Error, InfoPill } from '@/components';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Pie, Line } from 'react-chartjs-2';
import { faAnglesLeft, faAnglesRight, faUsers, faBan, faDollarSign, faUserCheck, faSearch, faDownload, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,	CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';

import type { User } from '@/types/next-auth';
import type { GetServerSidePropsContext } from 'next';
import type { SyntheticEvent } from 'react';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type countEnum = { [key: string]: number }
interface Props {
	users: Array<User>
	error?: string
	total: number
	admin: number
	premium: number
	block: number
	months: countEnum
}
type userUpdateEnum = 'block' | 'premium' | 'admin'
type SortOrder = 'asc' | 'desc';

export default function AdminUsers({ users: userList, error: oldError, total, admin, premium, block, months }: Props) {
	const { data: session, status } = useSession();
	const [users, setUsers] = useState<Array<User>>(userList);
	const [error, setError] = useState<string|undefined>(oldError);
	const [page, setPage] = useState(0);
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
	if (status == 'loading') return null;

	async function fetchUsers(p: number) {
		try {
			const res = await fetch(`/api/session/admin/users?order=${sortOrder}&page=${p}`, {
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
			setError((err as ErrorEvent).message);
		}
	}

	async function updateSortOrder() {
		try {
			const sort = (sortOrder == 'asc') ? 'desc' : 'asc';
			const res = await fetch(`/api/session/admin/users?order=${sort}`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
			});
			const data = await res.json();
			setUsers(data.users);
			setPage(0);
			setSortOrder(sort);
		} catch (err) {
			setError((err as ErrorEvent).message);
		}
	}

	async function updateUser(type: userUpdateEnum, userId: string) {
		// Get the type and what value it should be
		const el = document.getElementById(`${userId}_${type}`) as HTMLInputElement | null;
		if (el) {
			const value = el.checked;
			// Fetch endpoint data
			await fetch('/api/session/admin/users', {
				method: 'PATCH',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: userId,
					isAdmin: (type == 'admin' ? value : undefined),
					isBlocked: (type == 'block' ? value : undefined),
					isPremium: (type == 'premium' ? value : undefined),
				}),
			});

			// Update DOM
			el.checked = !!value;
			const text = document.getElementById(`${userId}_${type}_text`);
			if (text) text.innerHTML = value ? 'Yes' : 'No';
		}
	}

	async function searchByName(e: SyntheticEvent) {
		const text = (e.target as HTMLInputElement).value;

		if (text.length == 0) {
			const res = await fetch('/api/session/admin/users', {
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
		} else {
			try {
				const res = await fetch(`/api/session/admin/users/search?name=${text}`, {
					method: 'GET',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
				});
				const data = await res.json();
				setUsers(data.users);
				setPage(0);
				setSortOrder('desc');
			} catch (err) {
				setError((err as ErrorEvent).message);
			}
		}
	}

	// Create data for pie chart
	const graphData = {
		labels: ['Normal', 'blocked', 'Admin', 'Premium'],
		datasets: [
			{
				label: 'Accessed',
				data: [(total - admin - premium - block), block, admin, premium],
				backgroundColor: [
					'rgb(255, 159, 64)',
					'rgb(255, 205, 86)',
					'rgb(0, 163, 51)',
					'rgb(54, 162, 235)',
					'rgb(153, 102, 255)',
					'rgb(201, 203, 207)',
					'rgb(0,0,255)',
				],
				borderWidth: 1,
			},
		],
	};

	const usage = [];
	const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const d = new Date();
	d.setDate(1);
	const currentData = Object.entries(months);
	for (let i = 0; i <= 11; i++) {
		usage.push([monthName[d.getMonth()], currentData.find(f => f[0] == monthName[d.getMonth()])?.[1] ]);
		d.setMonth(d.getMonth() - 1);
	}

	const userJoinData = {
		labels: usage.map(u => u[0]).reverse(),
		datasets: [
			{
				label: 'New accounts',
				data: usage.map(u => u[1]).reverse(),
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},
		],
	};

	return (
		<>
			<Header />
			<div className="wrapper">
				<Sidebar activeTab='users'/>
				<div id="content-wrapper" className="d-flex flex-column">
					<div id="content">
						<AdminNavbar user={session?.user as User}/>
						<div className="container-fluid" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 64px)' }}>
							{error && (
								<Error text={error} />
							)}
							&nbsp;
							<div className="d-sm-flex align-items-center justify-content-between mb-4">
								<h1 className="h3 mb-0 text-gray-800">User Dashboard</h1>
								<a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
									<FontAwesomeIcon icon={faDownload} /> Generate Report
								</a>
							</div>
							<div className="row">
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'Total Users'} text={`${total}`} icon={faUsers} />
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'Blocked users'} text={`${block}`} icon={faBan} />
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'Premium users'} text={`${premium}`} icon={faDollarSign} />
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'Admin users'} text={`${admin}`} icon={faUserCheck} />
								</div>
							</div>
							<div className="row">
								<div className="col-xl-8 col-lg-7">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h4 className="m-0 font-weight-bold text-primary">User Growth</h4>
											<a type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseExample">
												<FontAwesomeIcon icon={faEllipsis} />
											</a>
										</div>
										<div className="card-body collapse show" id="collapseOne">
											<Line data={userJoinData} />
										</div>
									</div>
								</div>
								<div className="col-xl-4 col-lg-5">
									<div className="card shadow">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h4 className="m-0 font-weight-bold text-primary">User Make-up</h4>
											<a type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseExample">
												<FontAwesomeIcon icon={faEllipsis} />
											</a>
										</div>
										<div className="card-body collapse show" id="collapseOne">
											<Pie data={graphData} />
										</div>
									</div>
								</div>
							</div>
							&nbsp;
							<div className="card shadow mb-4">
								<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
									<h6 className="m-0 font-weight-bold text-primary">Users</h6>
								</div>
								<div className="card-body table-responsive">
									<div className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100">
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
												<th scope="col">ID</th>
												<th>Name</th>
												<th onClick={() => updateSortOrder()}>Joined</th>
												<th>Blocked</th>
												<th>Premium</th>
												<th>Admin</th>
											</tr>
										</thead>
										<tbody>
											{users.map(u => (
												<tr key={u.id}>
													<th scope="row">{u.id}</th>
													<th>{u.username}#{u.discriminator}</th>
													<th>{new Date(u.createdAt).toLocaleString('en-US')}</th>
													<td>
														<input className="form-check-input" type="checkbox" onChange={() => updateUser('block', u.id)} id={`${u.id}_block`} defaultChecked={u.isBlocked} />
														<span id={`${u.id}_block_text`}>{u.isBlocked ? 'Yes' : 'No'}</span>
													</td>
													<td>
														<input className="form-check-input" type="checkbox" onChange={() => updateUser('premium', u.id)} id={`${u.id}_premium`} defaultChecked={u.isPremium} />
														<span id={`${u.id}_premium_text`}>{u.isPremium ? 'Yes' : 'No'}</span>
													</td>
													<td>
														<input className="form-check-input" type="checkbox" onChange={() => updateUser('admin', u.id)} id={`${u.id}_admin`} defaultChecked={u.isAdmin} />
														<span id={`${u.id}_admin_text`}>{u.isAdmin ? 'Yes' : 'No'}</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
									<nav aria-label="Page navigation example">
										<p style={{ display: 'inline' }}>Showing results {(page < 1 ? 0 : page) * 50} - {(page * 50) + (users.length < 50 ? users.length : 50)} of {total}</p>
										<ul className="pagination justify-content-center">
											<li className="page-item">
												<a className="page-link" onClick={() => fetchUsers(page == 0 ? page : page - 1)} href="#">
													<FontAwesomeIcon icon={faAnglesLeft} />
												</a>
											</li>
											<li className="page-item">
												<p className="page-link">{page}</p>
											</li>
											<li className="page-item">
												<a className="page-link" onClick={() => fetchUsers(users.length >= 50 ? page + 1 : page)} href="#">
													<FontAwesomeIcon icon={faAnglesRight} />
												</a>
											</li>
										</ul>
									</nav>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

// Fetch basic API usage
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const obj = {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		};

		const [res1, res2] = await Promise.all([fetch(`${process.env.BACKEND_URL}api/session/admin/users/json`, obj),
			fetch(`${process.env.BACKEND_URL}api/session/admin/users/history`, obj)]);


		const { users, total, admin, premium, block } = await res1.json();
		const { months } = await res2.json();
		return { props: { users, total, admin, premium, block, months } };
	} catch (err) {
		return { props: { users: [], total: 0, admin: 0, premium: 0, block: 0, months: [], error: 'API server currently unavailable' } };
	}
}

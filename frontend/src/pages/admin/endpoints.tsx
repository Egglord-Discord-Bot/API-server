import Header from '../../components/header';
import Sidebar from '../../components/navbar/sidebar';
import AdminNavbar from '../../components/navbar/admin';
import Error from '../../components/error';
import { useSession } from 'next-auth/react';
import type { User } from '../../types/next-auth';
import type { Endpoint, UserHistory } from '../../types/types';
import type { GetServerSidePropsContext } from 'next';
import type { SyntheticEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesLeft, faAnglesRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

interface Props {
  endpointData: Array<Endpoint>
  history: Array<UserHistory>
  total: number
  error?: string
}

export default function AdminEndpoints({ endpointData, history: h, error, total }: Props) {
	const { data: session, status } = useSession();
	const [history, setHistory] = useState<Array<UserHistory>>(h);
	const [page, setPage] = useState(0);
	if (status == 'loading') return null;

	function updateDOM(e: SyntheticEvent) {
		const el = e.target as HTMLInputElement;
		if (el) {
			setHistory(history.filter(i => i.endpoint.startsWith(el.value)));
		}
	}

	async function fetchHistory(p: number) {
		try {
			const res = await fetch(`/api/session/stats/history?page=${p}`, {
				method: 'get',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
			});

			const data = await res.json();
			setHistory(data.history);
			setPage(p);
		} catch (err) {
			return { props: { users: [], error: 'API server currently unavailable' } };
		}
	}

	async function updateEndpoint(e: SyntheticEvent) {
		const target = e.target as HTMLInputElement;

		// Fetch endpoint data
		await fetch('/api/admin/endpoint', {
			method: 'PATCH',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: target.id.split('_')[0],
				isBlocked: target.checked,
			}),
		});

		// Update screen
		target.checked = !!target.checked;
		const el = document.getElementById(target.id.split('_')[0]);
		if (el) el.innerHTML = target.checked ? 'Yes' : 'No';
	}

	async function deleteEndpoint(id: number) {
		await fetch('/api/admin/history', {
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

	return (
		<>
			<Header />
			<div className="wrapper">
				<Sidebar activeTab='endpoint'/>
				<div id="content-wrapper" className="d-flex flex-column">
					<div id="content">
						<AdminNavbar user={session?.user as User}/>
						<div className="container-fluid">
							{error && (
								<Error text={error} />
							)}
							<div className="d-sm-flex align-items-center justify-content-between mb-4">
								<h1 className="h3 mb-0 text-gray-800">Endpoint Dashboard</h1>
								<a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
									<i className="fas fa-download fa-sm text-white-50"></i> Generate Report
								</a>
							</div>
							<div className="row">
								<div className="col-xl-6 col-lg-12">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h5 className="m-0 fw-bold text-primary">Total endpoints ({endpointData.length}):</h5>
										</div>
										<div className="card-body">
											<table className="table">
												<thead>
													<tr>
														<th scope="col">Name</th>
														<th scope="col">Cooldown</th>
														<th scope="col">maxRequests</th>
														<th scope="col">maxRequestper</th>
														<th scope="col">Blocked?</th>
													</tr>
												</thead>
												<tbody>
													{endpointData.map(e => (
														<tr key={e.name}>
															<th scope="row" className="text-truncate">{e.name}</th>
															<td>
																<div className="form-outline" style={{ width: '100%' }}>
																	<input min="500" max="60000" step={500} defaultValue={e.cooldown} type="number" id="typeNumber" className="form-control" />
																</div>
															</td>
															<td>
																<div className="form-outline" style={{ width: '100%' }}>
																	<input min="1" max="60" step={1} defaultValue={e.maxRequests} type="number" id="typeNumber" className="form-control" />
																</div>
															</td>
															<td>
																<div className="form-outline" style={{ width: '100%' }}>
																	<input min="30000" max="180000" step={500} defaultValue={e.maxRequestper} type="number" id="typeNumber" className="form-control" />
																</div>
															</td>
															<td>
																<div className="form-check">
																	<input className="form-check-input" type="checkbox" onClick={updateEndpoint} defaultChecked={e.isBlocked} id={`${e.name}_input`} />
																	<label className="form-check-label" htmlFor="flexCheckDefault" id={e.name}>
																		{e.isBlocked ? 'Yes' : 'No'}
																	</label>
																</div>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
								<div className="col-xl-6 col-lg-6">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h5 className="m-0 fw-bold text-primary">Total API usage ({total}):</h5>
										</div>
										<div className="card-body">
											<div className="input-group mb-3">
												<input type="text" className="form-control" placeholder="Endpoint" aria-label="Endpoint" aria-describedby="basic-addon2" onChange={updateDOM}/>
												<span className="input-group-text" id="basic-addon2">
													<FontAwesomeIcon icon={faSearch} />
												</span>
											</div>
											<table className="table">
												<thead>
													<tr>
														<th scope="col">UserID</th>
														<th scope="col">Endpoint</th>
														<th scope="col">Accessed at</th>
														<th scope="col">Delete</th>
													</tr>
												</thead>
												<tbody >
													{history.map(hi => (
														<tr key={hi.id}>
															<th scope="row">{hi.userId}</th>
															<td>{hi.endpoint}</td>
															<td>{new Date(hi.createdAt).toDateString()} {new Date(hi.createdAt).toLocaleTimeString('en-US')}</td>
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
    												<a className="page-link" onClick={() => fetchHistory(page == 0 ? page : page - 1)} href="#">
    													<FontAwesomeIcon icon={faAnglesLeft} />
    												</a>
    											</li>
    											<li className="page-item">
    												<p className="page-link">{page}</p>
    											</li>
    											<li className="page-item">
    												<a className="page-link" onClick={() => fetchHistory(endpointData.length >= 50 ? page + 1 : page)} href="#">
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
				</div>
			</div>
		</>
	);
}


// Fetch endpoints
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const obj = {
  			method: 'get',
  			headers: {
  				'cookie': ctx.req.headers.cookie as string,
  			},
		};

		const [res1, res2] = await Promise.all([fetch(`${process.env.BACKEND_URL}api/session/admin/endpoints/json`, obj), fetch(`${process.env.BACKEND_URL}api/session/stats/history`, obj)]);
		const { endpoints: endpointData } = await res1.json();
		const { history, total } = await res2.json();

		return { props: { endpointData, history, total } };
	} catch (err) {
		return { props: { endpointData: [], history: [], error: 'API server currently unavailable' } };
	}
}

import Header from '../../components/header';
import Sidebar from '../../components/navbar/sidebar';
import AdminNavbar from '../../components/navbar/admin';
import Error from '../../components/error';
import { useSession } from 'next-auth/react';
import type { User } from '../../types/next-auth';
import type { Endpoint, UserHistory } from '../../types/types';
import type { GetServerSidePropsContext } from 'next';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';

interface Props {
  endpointData: Array<Endpoint>
  history: Array<UserHistory>
  error?: string
}

export default function AdminEndpoints({ endpointData, history, error }: Props) {
	const { data: session, status } = useSession();
	const [his, setHis] = useState<Array<UserHistory>>(history);

	if (status == 'loading') return null;

	function updateDOM(e: SyntheticEvent) {
		const el = e.target as HTMLInputElement;
		if (el) {
			setHis(history.filter(i => i.endpoint.startsWith(el.value)));
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

	async function deleteEndpoint(id: string) {
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
			<div id="wrapper">
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
											<h6 className="m-0 font-weight-bold text-primary">Total endpoints ({endpointData.length}):</h6>
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
											<h6 className="m-0 font-weight-bold text-primary">Total API usage ({history.length}):</h6>
										</div>
										<div className="card-body">
											<div className="input-group mb-3">
												<input type="text" className="form-control" placeholder="Endpoint" aria-label="Endpoint" aria-describedby="basic-addon2" onChange={updateDOM}/>
												<span className="input-group-text" id="basic-addon2"><i className="fas fa-search fa-sm"></i></span>
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
													{his.map(h => (
														<tr key={h.id}>
															<th scope="row">{h.userId}</th>
															<td>{h.endpoint}</td>
															<td>{new Date(h.createdAt).toDateString()} {new Date(h.createdAt).toLocaleTimeString('en-US')}</td>
															<td>
																<input className="form-check-input" type="checkbox" id="flexCheckChecked" onClick={() => deleteEndpoint(h.id)} />
															</td>
														</tr>
													))}
												</tbody>
											</table>
											<nav aria-label="Page navigation example">
												<p style={{ display: 'inline' }}>Showing results {his.length < 10 ? his.length : 10} of {his.length}</p>
												{/* NONE FUNCTION CURRENTLY */}
												<ul className="pagination justify-content-center">
													<li className="page-item">
														<a className="page-link" href="#">1</a>
													</li>
													<li className="page-item">
														<a className="page-link" href="#">2</a>
													</li>
													<li className="page-item">
														<a className="page-link" href="#">3</a>
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
		// Fetch endpoint data
		const res = await fetch(`${process.env.BACKEND_URL}api/stats/endpoints`, {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		});
		const { endpoints: endpointData } = await res.json();

		// Fetch total history
		const res1 = await fetch(`${process.env.BACKEND_URL}api/stats/history`, {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		});
		const { history } = await res1.json();

		return { props: { endpointData, history } };
	} catch (err) {
		return { props: { endpointData: [], history: [], error: 'API server currently unavailable' } };
	}
}

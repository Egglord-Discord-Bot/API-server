import Header from '../../components/header';
import Sidebar from '../../components/navbar/sidebar';
import AdminNavbar from '../../components/navbar/admin';
import { useSession } from 'next-auth/react';
import type { User } from '../../types/next-auth';
import type { Endpoint, UserHistory } from '../../types/types';
import type { GetServerSidePropsContext } from 'next';
import type { SyntheticEvent } from 'react';

interface Props {
  endpointData: Array<Endpoint>
  history: Array<UserHistory>
}

export default function AdminEndpoints({ endpointData, history }: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading') return null;

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

	return (
		<>
			<Header />
			<div id="wrapper">
				<Sidebar activeTab='endpoint'/>
				<div id="content-wrapper" className="d-flex flex-column">
					<div id="content">
						<AdminNavbar user={session?.user as User}/>
						<div className="container-fluid">
							<div className="d-sm-flex align-items-center justify-content-between mb-4">
								<h1 className="h3 mb-0 text-gray-800">Endpoint Dashboard</h1>
								<a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
									<i className="fas fa-download fa-sm text-white-50"></i> Generate Report
								</a>
							</div>
							<div className="row">
								<div className="col-xl-6 col-lg-6">
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
															<td>{e.cooldown}</td>
															<td>{e.maxRequests}</td>
															<td>{e.maxRequestper}</td>
															<td>
																<input className="form-check-input" type="checkbox" onClick={updateEndpoint} defaultChecked={e.isBlocked} id={`${e.name}_input`}/>
																<span id={e.name}>{e.isBlocked ? 'Yes' : 'No'}</span>
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
													{history.map(h => (
														<tr key={h.id}>
															<th scope="row">{h.userId}</th>
															<td>{h.endpoint}</td>
															<td>{new Date(h.createdAt).toDateString()} {new Date(h.createdAt).toLocaleTimeString('en-US')}</td>
															<td>
																<input className="form-check-input" type="checkbox" id="flexCheckChecked" />
															</td>
														</tr>
													))}
												</tbody>
											</table>
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
}

import { Error, InfoPill, CollapsibleCard, HistoryListCard } from '@/components';
import AdminLayout from '@/layouts/Admin';
import { useSession } from 'next-auth/react';
import { sendRequest } from '@/utils/functions';

import type { Endpoint, UserHistory } from '@/types';
import type { GetServerSidePropsContext } from 'next';
import type { SyntheticEvent } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faDownload, faCalendar, faCalendarDays, faCalendarWeek, faClock } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import 'react-tooltip/dist/react-tooltip.css';

interface Props {
  endpointData: Array<Endpoint>
  history: Array<UserHistory>
  total: number
  error?: string
  last30daysCount: number
  last24hours: number
}

export default function AdminEndpoints({ endpointData, error, last30daysCount, last24hours }: Props) {
	const { data: session, status } = useSession();
	const [endpoints, setEndpoints] = useState<Array<Endpoint>>(endpointData);
	if (status == 'loading' || session == null) return null;

	async function searchEndpoint(e: SyntheticEvent) {
		const el = e.target as HTMLInputElement;

		let searchedEndpoints = [];
		if (el.value.length > 0) {
			searchedEndpoints = await sendRequest(`session/admin/history/search?name=/api/${el.value}`);
		} else {
			searchedEndpoints = await sendRequest('session/admin/endpoints/json');
		}
		console.log(searchedEndpoints);
		setEndpoints(searchedEndpoints.endpoints);
	}

	async function updateEndpoint(e: SyntheticEvent, name: string) {
		const target = e.target as HTMLInputElement;
		const options = { name: name } as Endpoint;

		// Get option selected
		switch(target.id) {
			case 'cooldown':
				options.cooldown = Number(target.value);
				break;
			case 'maxRequests':
				options.maxRequests = Number(target.value);
				break;
			case 'maxRequestper':
				options.maxRequestper = Number(target.value);
				break;
			case 'isBlocked':
				options.isBlocked = Boolean(target.checked);
				break;
			case 'premiumOnly':
				options.premiumOnly = Boolean(target.checked);
				break;
			default:
				break;
		}

		// Send request to Database
		await fetch('/api/session/admin/endpoints', {
			method: 'PATCH',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(options),
		});

		// Update premiumOnly checkbox
		if (typeof options.premiumOnly == 'boolean') {
  		target.checked = !!target.checked;
  		const el = document.getElementById(`${name}_premiumOnly`);
  		if (el) el.innerHTML = target.checked ? 'Yes' : 'No';
		}

		// Update isBlocked checkbox
		if (typeof options.isBlocked == 'boolean') {
			target.checked = !!target.checked;
			const el = document.getElementById(`${name}_isBlocked`);
			if (el) el.innerHTML = target.checked ? 'Yes' : 'No';
		}
	}


	return (
		<AdminLayout user={session.user}>
			<div className="container-fluid" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 64px)' }}>
				{error && (
					<Error text={error} />
				)}
        &nbsp;
				<div className="d-sm-flex align-items-center justify-content-between mb-4">
					<h1 className="h3 mb-0 text-gray-800">Endpoint Dashboard</h1>
					<a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
						<FontAwesomeIcon icon={faDownload} /> Generate Report
					</a>
				</div>
				<div className="row">
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Last year'} text={'sadjfbfd'} icon={faCalendar}/>
					</div>
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Last 30 days'} text={`${last30daysCount}`} icon={faCalendarWeek}/>
					</div>
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Last 7 days'} text={'8'} icon={faCalendarDays}/>
					</div>
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Last 24 hours'} text={`${last24hours}`} icon={faClock} />
					</div>
				</div>
				<div className="row">
					<div className="col-xl-6 col-lg-12">
						<CollapsibleCard id={'Total_endpoints'} header={<h5 className="m-0 fw-bold text-primary">Total endpoints ({endpointData.length}):</h5>}>
							<div className="table-responsive">
								<div className="input-group mb-3">
									<input type="text" className="form-control" placeholder="Endpoint" aria-label="Endpoint" aria-describedby="basic-addon2" onChange={(e) => searchEndpoint(e)}/>
									<span className="input-group-text" id="basic-addon2">
										<FontAwesomeIcon icon={faSearch} />
									</span>
								</div>
								<table className="table">
									<thead>
										<tr>
											<th scope="col">Name</th>
											<th scope="col">Cooldown</th>
											<th scope="col">maxRequests</th>
											<th scope="col">maxRequestper</th>
											<th scope="col">Blocked?</th>
											<th scope="col">Premium?</th>
										</tr>
									</thead>
									<tbody>
										{endpoints.map(endpoint => (
											<tr key={endpoint.name}>
												<th scope="row" className="text-truncate">{endpoint.name}</th>
												<td>
													<div className="form-outline">
														<input min="500" max="60000" step={500} defaultValue={endpoint.cooldown} type="number" id="cooldown" className="form-control" onChange={(e) => updateEndpoint(e, endpoint.name)} />
													</div>
												</td>
												<td>
													<div className="form-outline">
														<input min="1" max="60" step={1} defaultValue={endpoint.maxRequests} type="number" id="maxRequests" className="form-control" onChange={(e) => updateEndpoint(e, endpoint.name)} />
													</div>
												</td>
												<td>
													<div className="form-outline">
														<input min="30000" max="180000" step={500} defaultValue={endpoint.maxRequestper} type="number" id="maxRequestper" className="form-control" onChange={(e) => updateEndpoint(e, endpoint.name)} />
													</div>
												</td>
												<td>
													<div className="form-check">
														<input className="form-check-input" type="checkbox" onClick={(e) => updateEndpoint(e, endpoint.name)} defaultChecked={endpoint.isBlocked} id="isBlocked" />
														<label className="form-check-label" htmlFor="flexCheckDefault" id={`${endpoint.name}_isBlocked`}>
															{endpoint.isBlocked ? 'Yes' : 'No'}
														</label>
													</div>
												</td>
												<td>
													<div className="form-check">
														<input className="form-check-input" type="checkbox" onClick={(e) => updateEndpoint(e, endpoint.name)} defaultChecked={endpoint.premiumOnly} id="premiumOnly" />
														<label className="form-check-label" htmlFor="flexCheckDefault" id={`${endpoint.name}_premiumOnly`}>
															{endpoint.premiumOnly ? 'Yes' : 'No'}
														</label>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CollapsibleCard>
					</div>
					<div className="col-xl-6 col-lg-12">
						<HistoryListCard />
					</div>
				</div>
			</div>
		</AdminLayout>
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

		const [res1, res3, res4] = await Promise.all([fetch(`${process.env.BACKEND_URL}api/session/admin/endpoints/json`, obj),
			fetch(`${process.env.BACKEND_URL}api/session/admin/history/growth?time=month`, obj),
			fetch(`${process.env.BACKEND_URL}api/session/admin/history/growth?time=day`, obj)]);

		const [{ endpoints: endpointData }, { count }, { count: last24hours }] = await Promise.all([res1.json(), res3.json(), res4.json()]);

		return { props: { endpointData: (endpointData as Array<Endpoint>).filter(e => !e.name.startsWith('/api/session/admin')), last30daysCount: count, last24hours } };
	} catch (err) {
		return { props: { endpointData: [], history: [], total: 0, error: 'API server currently unavailable' } };
	}
}

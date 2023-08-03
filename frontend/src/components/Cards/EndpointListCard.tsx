import { CollapsibleCard } from '../index';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import type { SyntheticEvent } from 'react';
import type { Endpoint } from '@/types';

export default function EndpointListCard() {
	const [endpoints, setEndpoints] = useState<Array<Endpoint>>([]);
	useEffect(() => {
		fetchEndpoints();
	}, []);

	async function fetchEndpoints() {
		try {
			const { data } = await axios.get('/api/session/admin/endpoints/json');
			// Filter out session
			const endpointList = (data.endpoints as Array<Endpoint>).filter(e => !e.name.startsWith('/api/session'));
			setEndpoints(endpointList);
		} catch (err) {
			console.log(err);
			setEndpoints([]);
		}
	}

	async function searchEndpoint(e: SyntheticEvent) {
		const el = e.target as HTMLInputElement;

		// Fetch endpoints
		let { data: { endpoints: endpointList } } = await axios.get('/api/session/admin/endpoints/json');
		endpointList = endpointList.filter((endpoint: Endpoint) => !endpoint.name.startsWith('/api/session'));

		// Filter based on input
		if (el.value.length > 0) endpointList = endpointList.filter((endpoint: Endpoint) => endpoint.name.startsWith(`/api/${el.value}`));
		setEndpoints(endpointList);
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
		<CollapsibleCard id={'Total_endpoints'} header={<h5 className="m-0 fw-bold text-primary">Total endpoints ({endpoints.length}):</h5>}>
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
	);
}
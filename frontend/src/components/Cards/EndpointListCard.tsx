import { CollapsibleCard } from '../index';
import AdminEndpointModal from '../Modals/AdminEndpointModal';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
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
			const { data } = await axios.get('/api/session/admin/endpoints/json?includeHistory=true');
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
		let { data: { endpoints: endpointList } } = await axios.get('/api/session/admin/endpoints/json?includeHistory=true');
		endpointList = endpointList.filter((endpoint: Endpoint) => !endpoint.name.startsWith('/api/session'));

		// Filter based on input
		if (el.value.length > 0) endpointList = endpointList.filter((endpoint: Endpoint) => endpoint.name.startsWith(`/api/${el.value}`));
		setEndpoints(endpointList);
	}

	async function updateEndpoint(e: SyntheticEvent, name: string) {
		const target = e.target as HTMLInputElement;
		const options = { name: name } as Endpoint;
		options.isBlocked = Boolean(target.checked);

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
							<th scope="col">Total Requests</th>
							<th scope="col">Blocked?</th>
							<th scope="col">Edit</th>
						</tr>
					</thead>
					<tbody>
						{endpoints.map((endpoint, index) => (
							<tr key={endpoint.name}>
								<th scope="row" className="text-truncate">{endpoint.name}</th>
								<th>{endpoint._count?.history}</th>
								<th>
									<div className="form-check">
										<input className="form-check-input" type="checkbox" onClick={(e) => updateEndpoint(e, endpoint.name)} defaultChecked={endpoint.isBlocked} id="isBlocked" />
										<label className="form-check-label" htmlFor="flexCheckDefault" id={`${endpoint.name}_isBlocked`}>
											{endpoint.isBlocked ? 'Yes' : 'No'}
										</label>
									</div>
								</th>
								<th>
									<AdminEndpointModal endpoint={endpoint} id={`${index}_Endpointmodal`}/>
									<Tooltip place="top" content={'Edit'} id={`${index}_openEndpointModal`} />
									<button className="btn" data-bs-toggle="modal" data-bs-target={`#${index}_Endpointmodal`} data-tooltip-id={`${index}_openEndpointModal`}>
										<FontAwesomeIcon icon={faPenToSquare} />
									</button>
								</th>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</CollapsibleCard>
	);
}

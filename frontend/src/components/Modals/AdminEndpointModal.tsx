import type { Endpoint } from '@/types';
import type { FormEvent } from 'react';
import { useRef } from 'react';
import axios from 'axios';
interface Props {
  endpoint: Endpoint
  id: string
}

export default function AdminEndpointModal({ endpoint, id }: Props) {
	const closeBtn = useRef<HTMLButtonElement | null>(null);

	async function submitEvent(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const cooldown = (document.getElementById('cooldownInputForm') as HTMLInputElement).value;
		const maxRequests = (document.getElementById('maxRequestInputForm') as HTMLInputElement).value;
		const maxRequestper = (document.getElementById('maxRequestPerInputForm') as HTMLInputElement).value;
		const isBlocked = (document.getElementById('isBlockedInputForm') as HTMLInputElement).checked;
		const premiumOnly = (document.getElementById('premiumOnlyInputForm') as HTMLInputElement).checked;

		try {
			await axios.patch('/api/session/admin/endpoints/update', {
  			name: endpoint.name,
  			cooldown, maxRequests, maxRequestper, isBlocked, premiumOnly,
  		});
		} catch(err) {
			if (axios.isAxiosError(err)) {
				console.log(err.code == 'ERR_BAD_RESPONSE' ? err.message : err.response?.data);
			} else {
				console.log(err);
			}
		}
		closeBtn.current?.click();
	}

	return (
		<div className="modal fade" id={id} tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header">
						<h1 className="modal-title fs-5" id="exampleModalLabel">Edit Endpoint: {endpoint.name}</h1>
						<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<form onSubmit={(e) => submitEvent(e)}>
						<div className="modal-body row">
							<div className="col-lg-6">
								<div className="mb-3">
									<label htmlFor="cooldownInputForm" className="form-label">Cooldown:</label>
									<input type="number" className="form-control" id="cooldownInputForm" step={500} min={0} defaultValue={endpoint.cooldown}/>
								</div>
								<div className="mb-3">
									<label htmlFor="maxRequestInputForm" className="form-label">Max request:</label>
									<input type="number" className="form-control" id="maxRequestInputForm" step={1} min={1} defaultValue={endpoint.maxRequests}/>
								</div>
								<div className="mb-3">
									<label htmlFor="maxRequestPerInputForm" className="form-label">Max request per:</label>
									<input type="number" className="form-control" id="maxRequestPerInputForm" step={500} min={500} defaultValue={endpoint.maxRequestper}/>
								</div>
							</div>
							<div className="col-lg-6">
								<div className="form-check">
									<input className="form-check-input" type="checkbox" defaultChecked={endpoint.isBlocked} id="isBlockedInputForm" />
									<label className="form-check-label" htmlFor="isBlockedInputForm">
                    Is blocked
									</label>
								</div>
								<div className="form-check">
									<input className="form-check-input" type="checkbox" defaultChecked={endpoint.premiumOnly} id="premiumOnlyInputForm" />
									<label className="form-check-label" htmlFor="premiumOnlyInputForm">
                    Premium only
									</label>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal" ref={closeBtn}>Close</button>
							<button type="submit" className="btn btn-primary">Save changes</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

import type { User } from '@/types/next-auth';
import type { FormEvent } from 'react';
interface Props {
  user: User
  id: string
}

export default function AdminEndpointModal({ user, id }: Props) {

	async function submitEvent(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const isBlocked = (document.getElementById(`${user.id}_isBlocked`) as HTMLSelectElement).value;
		const isAdmin = (document.getElementById(`${user.id}_isAdmin`) as HTMLInputElement).value;
		const isPremium = (document.getElementById(`${user.id}_isPremium`) as HTMLInputElement).value;
		const res = await fetch('/api/session/admin/users/update', {
			method: 'PATCH',
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
			body: JSON.stringify({
				userId: user.id,
				isBlocked,
				isAdmin,
				isPremium,
			}),
		});
		console.log(await res.json());
	}


	async function resetToken() {
		try {
			const res = await fetch(`/api/session/admin/users/regenerate?userId=${user.id}`, {
				method: 'PATCH',
			});
			const data = await res.json();
			console.log(data);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div className="modal fade" id={id} tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header">
						<h1 className="modal-title fs-5" id="exampleModalLabel">Edit user: {user.username} ({user.id})</h1>
						<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<form onSubmit={(e) => submitEvent(e)}>
						<div className="modal-body row">
							<div className="col-lg-6">
								<h5 className="fw-bold">Attributes</h5>
							</div>
							<div className="col-lg-6">
								<h5 className="fw-bold">Reset token?</h5>
								<button className="btn btn-success" onClick={() => resetToken()}>Confirm</button>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="submit" className="btn btn-primary">Save changes</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

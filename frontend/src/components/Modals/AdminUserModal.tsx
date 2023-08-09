import Modal from './Modal';
import axios from 'axios';
import Image from 'next/image';
import type { User } from '@/types/next-auth';
import type { ChangeEvent } from 'react';
interface Props {
  user: User
  id: string
}

export default function AdminUserModal({ user, id }: Props) {

	async function onChange(e: ChangeEvent<HTMLSelectElement>) {
		await axios.patch('/api/session/admin/users/update', {
			userId: user.id,
			role: e.target.value,
		});
	};

	async function refreshData() {
		try {
			const { data } = await axios.get(`/api/socials/discord?userId=${user.id}`);
			if (data.error) return null;

			await axios.patch('/api/session/admin/users/update', {
				userId: user.id,
				username: data.data.username,
				avatar: data.data.avatar,
			});
		} catch (err) {
			console.log(err);
		}
	}

	async function resetToken() {
		try {
			const { data } = await axios.patch(`/api/session/admin/users/regenerate?userId=${user.id}`);
			console.log(data);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<Modal id={id} header={`User: ${user.username} (${user.id})`} >
			<div className="modal-body row">
				<div className="col-lg-6">
					<div className="mb-3 row">
						<label htmlFor="IDFormInput" className="col-sm-3 col-form-label">ID: </label>
						<div className="col-sm-9">
							<input type="text" readOnly className="form-control" id="IDFormInput" value={user.id} />
						</div>
					</div>
					<div className="mb-3 row">
						<label htmlFor="usernameFormInput" className="col-sm-3 col-form-label">Username: </label>
						<div className="col-sm-9">
							<input type="text" readOnly className="form-control" id="usernameFormInput" value={user.username} />
						</div>
					</div>
					<div className="mb-3 row">
						<label htmlFor="emailFormInput" className="col-sm-3 col-form-label">Email: </label>
						<div className="col-sm-9">
							<input type="text" readOnly className="form-control" id="emailFormInput" value={user.email} />
						</div>
					</div>
					<div className="mb-3 row">
						<label htmlFor="localeFormInput" className="col-sm-3 col-form-label">Locale: </label>
						<div className="col-sm-9">
							<input type="text" readOnly className="form-control" id="localeFormInput" value={user.locale} />
						</div>
					</div>
					<div className="mb-3 row">
						<label htmlFor="joinedFormInput" className="col-sm-3 col-form-label">Joined: </label>
						<div className="col-sm-9">
							<input type="text" readOnly className="form-control" id="joinedFormInput" value={user.createdAt.toString()} />
						</div>
					</div>
					<div className="mb-3 row">
						<label htmlFor="historyFormInput" className="col-sm-3 col-form-label">History: </label>
						<div className="col-sm-9">
							<input type="text" readOnly className="form-control" id="historyFormInput" value={user._count?.history} />
						</div>
					</div>
					<button className="btn btn-success float-end" onClick={() => refreshData()}>Refresh</button>
				</div>
				<div className="col-lg-6">
					<div className="d-flex justify-content-center">
						<Image className="rounded-circle" src={user.avatar} width={128} height={128} alt={'User\'s avatar'}/>
					</div>
					<h5 className="fw-bold">Role</h5>
					<div className="input-group mb-3">
						<label className="input-group-text" htmlFor={`${user.id}_isBlocked`}>Role:</label>
						<select className="form-select" id={`${user.id}_role`} defaultValue={`${user.role}`} onChange={(e) => onChange(e)}>
							<option value="USER">User</option>
							<option value="BLOCK">Block</option>
							<option value="ADMIN">Admin</option>
							<option value="PREMIUM">Premium</option>
						</select>
					</div>
					<h5 className="fw-bold">Reset token?</h5>
					<button className="btn btn-success float-end" onClick={() => resetToken()}>Confirm</button>
				</div>
			</div>
		</Modal>
	);
}

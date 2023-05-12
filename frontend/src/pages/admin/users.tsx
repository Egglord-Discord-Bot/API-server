import Header from '../../components/header';
import Sidebar from '../../components/navbar/sidebar';
import AdminNavbar from '../../components/navbar/admin';
import Error from '../../components/error';
import { useSession } from 'next-auth/react';
import type { User } from '../../types/next-auth';
import type { GetServerSidePropsContext } from 'next';

interface Props {
	users: Array<User>
	error?: string
}
type userUpdateEnum = 'block' | 'premium' | 'admin'


export default function AdminUsers({ users, error }: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading') return null;

	async function updateUser(type: userUpdateEnum, userId: string) {
		// Get the type and what value it should be
		const el = document.getElementById(`${userId}_${type}`) as HTMLInputElement | null;
		if (el) {
			const value = el.checked;
			// Fetch endpoint data
			await fetch('/api/admin/user', {
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

	return (
		<>
			<Header />
			<div id="wrapper">
				<Sidebar activeTab='users'/>
				<div id="content-wrapper" className="d-flex flex-column">
					<div id="content">
						<AdminNavbar user={session?.user as User}/>
						<div className="container-fluid">
							{error && (
								<Error text={error} />
							)}
							<div className="d-sm-flex align-items-center justify-content-between mb-4">
								<h1 className="h3 mb-0 text-gray-800">Users Dashboard</h1>
								<a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
									<i className="fas fa-download fa-sm text-white-50"></i> Generate Report
								</a>
							</div>
							<div className="row">
								<div className="col-xl-3 col-md-6 mb-4">
									<div className="card border-left-primary shadow h-100 py-2">
										<div className="card-body">
											<div className="row no-gutters align-items-center">
												<div className="col mr-2">
													<div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
														Total Users</div>
													<div className="h5 mb-0 font-weight-bold text-gray-800">{users.length}</div>
												</div>
												<div className="col-auto">
													<i className="fas fa-users fa-2x text-gray-300"></i>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<div className="card border-left-danger shadow h-100 py-2">
										<div className="card-body">
											<div className="row no-gutters align-items-center">
												<div className="col mr-2">
													<div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
														Blocked users</div>
													<div className="h5 mb-0 font-weight-bold text-gray-800">{users.filter(u => u.isBlocked).length}</div>
												</div>
												<div className="col-auto">
													<i className="fas fa-ban fa-2x text-gray-300"></i>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<div className="card border-left-success shadow h-100 py-2">
										<div className="card-body">
											<div className="row no-gutters align-items-center">
												<div className="col mr-2">
													<div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                            Premium users</div>
													<div className="h5 mb-0 font-weight-bold text-gray-800">{users.filter(u => u.isPremium).length}</div>
												</div>
												<div className="col-auto">
													<i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<div className="card border-left-warning shadow h-100 py-2">
										<div className="card-body">
											<div className="row no-gutters align-items-center">
												<div className="col mr-2">
													<div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
														Admin users</div>
													<div className="h5 mb-0 font-weight-bold text-gray-800">{users.filter(u => u.isAdmin).length}</div>
												</div>
												<div className="col-auto">
													<i className="fas fa-user-check fa-2x text-gray-300"></i>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="card shadow mb-4">
								<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
									<h6 className="m-0 font-weight-bold text-primary">Users</h6>
								</div>
								<div className="card-body">
									<form	className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100">
										<div className="input-group">
											<input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2" />
											<div className="input-group-append">
												<button className="btn btn-primary" type="button">
													<i className="fas fa-search fa-sm"></i>
												</button>
											</div>
										</div>
									</form>
									<table className="table" style={{ paddingTop: '10px' }}>
										<thead>
											<tr>
												<th scope="col">ID</th>
												<th scope="col">Name</th>
												<th scope="col">Blocked</th>
												<th scope="col">Premium</th>
												<th scope="col">Admin</th>
											</tr>
										</thead>
										<tbody>
											{users.map(u => (
												<tr key={u.id}>
													<th scope="row">{u.id}</th>
													<th>{u.username}#{u.discriminator}</th>
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
		const res = await fetch(`${process.env.BACKEND_URL}api/stats/users`, {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		});

		const data = await res.json();
		return { props: { users: data.users } };
	} catch (err) {
		return { props: { users: [], error: 'API server currently unavailable' } };
	}
}

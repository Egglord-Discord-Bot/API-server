import Header from '../../components/header';
import Sidebar from '../../components/navbar/sidebar';
import AdminNavbar from '../../components/navbar/admin';
import { useSession } from 'next-auth/react';
import type { User } from '../../types/next-auth';
import type { GetServerSidePropsContext } from 'next';

interface Props {
	users: Array<User>
}

export default function AdminUsers({ users }: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading') return null;

	function updateUser(type: string, id: string) {
		console.log(type, id);
		alert('coming soon');
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
													<i className="fas fa-calendar fa-2x text-gray-300"></i>
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
														Blocked users</div>
													<div className="h5 mb-0 font-weight-bold text-gray-800">{users.filter(u => u.isBlocked).length}</div>
												</div>
												<div className="col-auto">
													<i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
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
													<i className="fas fa-comments fa-2x text-gray-300"></i>
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
									<table className="table">
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
													<th>{u.discriminator}</th>
													<td>
														<input className="form-check-input" type="checkbox" onChange={() => updateUser('block', u.id)} id={`${u.id}_block`} checked={u.isBlocked} />{u.isBlocked ? 'Yes' : 'No'}
													</td>
													<td>
														<input className="form-check-input" type="checkbox" onChange={() => updateUser('premium', u.id)} id={`${u.id}_premium`} checked={u.isPremium} />{u.isPremium ? 'Yes' : 'No'}
													</td>
													<td>
														<input className="form-check-input" type="checkbox" onChange={() => updateUser('admin', u.id)} id={`${u.id}_admin`} checked={u.isAdmin} />{u.isAdmin ? 'Yes' : 'No'}
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
	const res = await fetch(`${process.env.BACKEND_URL}api/stats/users`, {
		method: 'get',
		headers: {
			'cookie': ctx.req.headers.cookie as string,
		},
	});

	const data = await res.json();
	return { props: { users: data.users } };
}

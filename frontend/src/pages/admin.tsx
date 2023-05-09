import Header from '../components/header';
import Sidebar from '../components/navbar/sidebar';
import AdminNavbar from '../components/navbar/admin';
import { nFormatter } from '../utils/functions';
import { Pie } from 'react-chartjs-2';
import { useSession } from 'next-auth/react';
import type { User } from '../types/next-auth';
import type { GetServerSidePropsContext } from 'next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

type history = {
	id: number,
  userId: string,
  endpoint: string,
  createdAt: Date
}
type countEnum = { [key: string]: number }
interface Props {
	totalAPIUsage: number
	userCount: number
	totalHistory: Array<history>
}

export default function Admin(data: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading') return null;

	// Create the data object for "Most accessed endpoints"
	const counts = {} as countEnum;
	data.totalHistory.forEach((x) => counts[x.endpoint] = (counts[x.endpoint] || 0) + 1);
	const mostAccessEndp = {
		labels: Object.keys(counts).slice(0, 10).map(i => i.split('/').at(-1)),
		datasets: [
			{
				label: 'Accessed:',
				data: Object.values(counts).slice(0, 10),
				backgroundColor: [
					'rgb(255, 159, 64)',
					'rgb(255, 205, 86)',
					'rgb(0, 163, 51)',
					'rgb(54, 162, 235)',
					'rgb(153, 102, 255)',
					'rgb(201, 203, 207)',
					'rgb(0,0,255)',
				],
				borderWidth: 1,
			},
		],
	};

	return (
		<>
			<Header />
			<div id="wrapper">
				<Sidebar activeTab='dashboard'/>
				<div id="content-wrapper" className="d-flex flex-column">
					<div id="content">
						<AdminNavbar user={session?.user as User}/>
						<div className="container-fluid">
							<div className="d-sm-flex align-items-center justify-content-between mb-4">
								<h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
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
														Total Request</div>
													<div className="h5 mb-0 font-weight-bold text-gray-800">{nFormatter(data.totalAPIUsage, 2)}</div>
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
														Total users</div>
													<div className="h5 mb-0 font-weight-bold text-gray-800">{nFormatter(data.userCount, 2)}</div>
												</div>
												<div className="col-auto">
													<i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<div className="card border-left-info shadow h-100 py-2">
										<div className="card-body">
											<div className="row no-gutters align-items-center">
												<div className="col mr-2">
													<div className="text-xs font-weight-bold text-info text-uppercase mb-1">Tasks
													</div>
													<div className="row align-items-center">
														<div className="col-auto">
															<div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">50%</div>
														</div>
														<div className="col">
															<div className="progress progress-sm">
																<div className="progress-bar bg-info" role="progressbar" style={{ width: '50%' }} aria-valuenow={50} aria-valuemin={0}	aria-valuemax={100}></div>
															</div>
														</div>
													</div>
												</div>
												<div className="col-auto">
													<i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
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
														Pending Requests</div>
													<div className="h5 mb-0 font-weight-bold text-gray-800">18</div>
												</div>
												<div className="col-auto">
													<i className="fas fa-comments fa-2x text-gray-300"></i>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-xl-8 col-lg-7">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h6 className="m-0 font-weight-bold text-primary">Total API usage</h6>
											<div className="dropdown no-arrow">
												<a className="dropdown-toggle" href="#" role="button" id="dropdownMenuLink"	data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
													<i className="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
												</a>
												<div className="dropdown-menu dropdown-menu-right shadow animated--fade-in"	aria-labelledby="dropdownMenuLink">
													<div className="dropdown-header">Dropdown Header:</div>
													<a className="dropdown-item" href="#">Action</a>
													<a className="dropdown-item" href="#">Another action</a>
													<div className="dropdown-divider"></div>
													<a className="dropdown-item" href="#">Something else here</a>
												</div>
											</div>
										</div>
										<div className="card-body">
											<div className="chart-area">
												<canvas id="myAreaChart"></canvas>
											</div>
										</div>
									</div>
									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">API responses code</h6>
										</div>
										<div className="card-body">
											<h4 className="small font-weight-bold">200 <span className="float-right">100%</span></h4>
											<div className="progress mb-4">
												<div className="progress-bar bg-success" role="progressbar" style={{ width: '100%' }}	aria-valuenow={100} aria-valuemin={0} aria-valuemax={data.totalAPIUsage}>1000</div>
											</div>
											<h4 className="small font-weight-bold">429 <span
												className="float-right">20%</span></h4>
											<div className="progress mb-4">
												<div className="progress-bar bg-danger" role="progressbar" style={{ width: '20%' }}	aria-valuenow={20} aria-valuemin={0} aria-valuemax={data.totalAPIUsage}>852</div>
											</div>
											<h4 className="small font-weight-bold">404 <span className="float-right">40%</span></h4>
											<div className="progress mb-4">
												<div className="progress-bar bg-warning" role="progressbar"style={{ width: '40%' }}	aria-valuenow={40} aria-valuemin={0} aria-valuemax={data.totalAPIUsage}>100</div>
											</div>
											<h4 className="small font-weight-bold">401 <span className="float-right">60%</span></h4>
											<div className="progress mb-4">
												<div className="progress-bar" role="progressbar" style={{ width: '60%' }}	aria-valuenow={60} aria-valuemin={0} aria-valuemax={data.totalAPIUsage}>20</div>
											</div>
											<h4 className="small font-weight-bold">403 <span className="float-right">80%</span></h4>
											<div className="progress mb-4">
												<div className="progress-bar bg-info" role="progressbar" style={{ width: '80%' }}	aria-valuenow={80} aria-valuemin={0} aria-valuemax={data.totalAPIUsage}>5</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-4 col-lg-5">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h6 className="m-0 font-weight-bold text-primary">Most accessed endpoints</h6>
											<div className="dropdown no-arrow">
												<a className="dropdown-toggle" href="#" role="button" id="dropdownMenuLink"	data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
													<i className="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
												</a>
												<div className="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
													<div className="dropdown-header">Dropdown Header:</div>
													<a className="dropdown-item" href="#">Action</a>
													<a className="dropdown-item" href="#">Another action</a>
													<div className="dropdown-divider"></div>
													<a className="dropdown-item" href="#">Something else here</a>
												</div>
											</div>
										</div>
										<div className="card-body">
											<Pie data={mostAccessEndp} />
											<div className="mt-4 text-center small">
												{mostAccessEndp.labels.map(_ => (
													<span className="mr-2" key={_}>
														<i className="fas fa-circle" style={{ color: `${mostAccessEndp.datasets[0].backgroundColor[mostAccessEndp.labels.indexOf(_)]}` }}></i> {_}
													</span>
												))}
											</div>
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

// Fetch admin API usage
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const res1 = await fetch(`${process.env.BACKEND_URL}api/stats/history`, {
		method: 'get',
		headers: {
			'cookie': ctx.req.headers.cookie as string,
		},
	});
	const { history } = await res1.json();

	const res2 = await fetch(`${process.env.BACKEND_URL}api/stats/users`, {
		method: 'get',
		headers: {
			'cookie': ctx.req.headers.cookie as string,
		},
	});
	const { users } = await res2.json();

	return { props: { totalAPIUsage: history.length, userCount: users.length, totalHistory: history } };
}

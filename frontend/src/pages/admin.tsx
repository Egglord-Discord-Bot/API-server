import Header from '../components/header';
import Sidebar from '../components/navbar/sidebar';
import AdminNavbar from '../components/navbar/admin';
import Error from '../components/error';
import { nFormatter } from '../utils/functions';
import { Pie, Line } from 'react-chartjs-2';
import { useSession } from 'next-auth/react';
import type { User } from '../types/next-auth';
import type { GetServerSidePropsContext } from 'next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,	CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type history = {
	id: number,
  userId: string,
  endpoint: string,
  createdAt: Date
	responseCode: number
	responseTime: number
}

type countEnum = { [key: string]: number }
interface Props {
	responseCode: countEnum
	userCount: number
	totalHistory: Array<history>
	count: number
	error?: string
}

export default function Admin(data: Props) {
	const { data: session, status } = useSession();
	const labels: countEnum = { 'January': 0, 'February': 0, 'March': 0, 'April': 0, 'May': 0, 'June': 0, 'July': 0, 'August': 0, 'September': 0, 'October': 0, 'November': 0, 'Decemeber': 0 };
	data.totalHistory.forEach((x) => {
		const y = Object.keys(labels).at(new Date(x.createdAt).getMonth());
		if (y !== undefined) labels[y] += 1;
	});
	const historyAccessed = {
		labels: Object.keys(labels),
		datasets: [
			{
				label: 'Accessed',
				data: Object.values(labels),
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},
		],
	};

	// Create the data object for "Most accessed endpoints"
	const counts: countEnum = {};
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
							{data.error && (
								<Error text={data.error} />
							)}
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
													<div className="h5 mb-0 font-weight-bold text-gray-800">{nFormatter(data.count, 2)}</div>
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
											<Line data={historyAccessed} />
										</div>
									</div>
									<div className="card shadow mb-4">
										<div className="card-header py-3">
											<h6 className="m-0 font-weight-bold text-primary">API responses code</h6>
										</div>
										<div className="card-body">
											{Object.keys(data.responseCode).map(e => (
												<>
													<h4 className="small font-weight-bold">{e} <span className="float-right">{Math.round((data.responseCode[e] / data.count) * 100)}%</span></h4>
													<div className="progress mb-4">
														<div className="progress-bar bg-success" role="progressbar" style={{ width: `${(data.responseCode[e] / data.count) * 100}%` }}	aria-valuenow={data.responseCode[e]} aria-valuemin={0} aria-valuemax={data.count}>{data.responseCode[e]}</div>
													</div>
												</>
											))}
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
	try {
		const obj = {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		};
		const [res, res1, res2] = await Promise.all([fetch(`${process.env.BACKEND_URL}api/stats/history/responseCode`, obj),
			fetch(`${process.env.BACKEND_URL}api/stats/history`, obj),
			fetch(`${process.env.BACKEND_URL}api/stats/users`, obj),
		]);

		const { history: h } = await res.json();
		const { history, total } = await res1.json();
		const { users } = await res2.json();

		return { props: { count: total, responseCode: h, userCount: users.length, totalHistory: history } };
	} catch (err) {
		return { props: { count: 0, responseCode: { '0': 0 }, userCount: 0, totalHistory: [], error: 'API server currently unavailable' } };
	}
}

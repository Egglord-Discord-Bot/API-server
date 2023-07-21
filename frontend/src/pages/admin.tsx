import Header from '../components/header';
import { Sidebar, Admin as AdminNavbar } from '../components/navbar';
import Error from '../components/error';
import InfoPill from '../components/dashboard/infoPill';
import { nFormatter, formatBytes } from '../utils/functions';
import { Pie, Line } from 'react-chartjs-2';
import { useSession } from 'next-auth/react';
import type { User } from '../types/next-auth';
import type { GetServerSidePropsContext } from 'next';
import Script from 'next/script';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSignal, faUsers, faClock, faMemory, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, Tooltip as t, Legend,	CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
ChartJS.register(ArcElement, t, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

type countEnum = { [key: string]: number }
interface Props {
	responseCode: countEnum
	monthUsage: countEnum
	mostAccessedEndpoints: countEnum
	userCount: number
	count: number
	uptime: number
	memoryUsage: number
	error?: string
}

export default function Admin(data: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading') return null;

	const usage = [];
	const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const d = new Date();
	d.setDate(1);
	const currentData = Object.entries(data.monthUsage);
	for (let i = 0; i <= 11; i++) {
		usage.push([monthName[d.getMonth()], currentData.find(f => f[0] == monthName[d.getMonth()])?.[1] ]);
		d.setMonth(d.getMonth() - 1);
	}

	const historyAccessed = {
		labels: usage.map(u => u[0]).reverse(),
		datasets: [
			{
				label: 'Accessed',
				data: usage.map(u => u[1]).reverse(),
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},
		],
	};

	const top20Endpoints = Object.entries(data.mostAccessedEndpoints).sort((a, b) => b[1] - a[1]).slice(0, 20);
	const mostAccessEndp = {
		labels: top20Endpoints.map(u => u[0]),
		datasets: [
			{
				label: 'Accessed',
				data: top20Endpoints.map(u => u[1]),
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
			<div className="wrapper">
				<Sidebar activeTab='dashboard'/>
				<div id="content-wrapper" className="d-flex flex-column">
					<div id="content">
						<AdminNavbar user={session?.user as User}/>
						<div className="container-fluid" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 64px)' }}>
							{data.error && (
								<Error text={data.error} />
							)}
							&nbsp;
							<div className="d-sm-flex align-items-center justify-content-between mb-4">
								<h1 className="h3 mb-0 text-gray-800">Admin Dashboard</h1>
								<a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
									<FontAwesomeIcon icon={faDownload} /> Generate Report
								</a>
							</div>
							<div className="row">
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'Total Requests'} text={nFormatter(data.count, 2)} icon={faSignal}/>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'Total users'} text={nFormatter(data.userCount, 2)} icon={faUsers}/>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'Uptime'} text={new Date(data.uptime * 1000).toISOString().slice(11, 19)} icon={faClock}/>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'Memory Usage'} text={formatBytes(data.memoryUsage)} icon={faMemory}/>
								</div>
							</div>
							<div className="row">
								<div className="col-xl-8 col-lg-7">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h5 className="m-0 fw-bold text-primary">Total API usage (Year)</h5>
											<div className="dropdown no-arrow">
												<a className="dropdown-toggle" href="#" role="button" id="dropdownMenuLink"	data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
													<FontAwesomeIcon icon={faEllipsis} />
												</a>
												<div className="dropdown-menu dropdown-menu-end shadow animated--fade-in"	aria-labelledby="dropdownMenuLink">
													<a className="dropdown-item" href="#">Month</a>
													<a className="dropdown-item" href="#">Day</a>
													<div className="dropdown-divider"></div>
													<a className="dropdown-item" href="#" role="button" data-bs-toggle="collapse" data-bs-target="#collapseHistoryAcc">Collapse</a>
												</div>
											</div>
										</div>
										<div className="card-body">
											<div id="collapseHistoryAcc" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
												<div className="accordion-body">
													<Line data={historyAccessed} />
												</div>
										 </div>
										</div>
									</div>
									<div className="card shadow mb-4">
										<div className="card-header py-3" style={{ height: '100%' }}>
											<h5 className="m-0 fw-bold text-primary">API Responses Code</h5>
										</div>
										<div className="card-body">
											{Object.entries(data.responseCode).sort(([, a], [, b]) => a - b).reverse().map(e => (
												<>
													<h4 className="small font-weight-bold">{e[0]} <span className="float-end">{Math.round((e[1] / data.count) * 100)}%</span></h4>
													<div className="progress mb-4" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title={`${e[1]}`}>
														<div className="progress-bar bg-success" role="progressbar" style={{ width: `${(e[1] / data.count) * 100}%` }}	aria-valuenow={e[1]} aria-valuemin={0} aria-valuemax={data.count}>{e[1]}</div>
													</div>
												</>
											))}
										</div>
									</div>
								</div>
								<div className="col-xl-4 col-lg-5">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h5 className="m-0 fw-bold text-primary">Top 20 Accessed Endpoints</h5>
											<div className="dropdown no-arrow">
												<a className="dropdown-toggle" href="#" role="button" id="dropdownMenuLink"	data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
													<FontAwesomeIcon icon={faEllipsis} />
												</a>
												<div className="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
													<a className="dropdown-item" href="#">Action</a>
													<a className="dropdown-item" href="#">Another action</a>
													<div className="dropdown-divider"></div>
													<a className="dropdown-item" href="#" role="button" data-bs-toggle="collapse" data-bs-target="#collapseMostAccessEnd">Collapse</a>
												</div>
											</div>
										</div>
										<div className="card-body">
											<div id="collapseMostAccessEnd" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
												<div className="accordion-body">
													<Pie data={mostAccessEndp} />
												</div>
										 </div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Script id="show-banner">
				{'const tooltipTriggerList = document.querySelectorAll(\'[data-bs-toggle=\"tooltip\"]\'); [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))'}
			</Script>
		</>
	);
}

// Fetch admin API usage
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		// Fetch data from API
		const obj = {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		};
		const [res1, res2, res3] = await Promise.all([fetch(`${process.env.BACKEND_URL}api/session/admin/json`, obj),
			fetch(`${process.env.BACKEND_URL}api/session/admin/system`, obj),
			fetch(`${process.env.BACKEND_URL}api/session/admin/history?time=year`, obj),
		]);
		const { historyCount, userCount, responseCodes, mostAccessedEndpoints } = await res1.json();
		const { uptime, current: { memory: { USAGE } } } = await res2.json();
		const { months } = await res3.json();

		return { props: { count: historyCount, responseCode: responseCodes, mostAccessedEndpoints, userCount, uptime, memoryUsage: USAGE, monthUsage: months } };
	} catch (err) {
		console.log(err);
		return { props: { count: 0, responseCode: { '0': 0 }, userCount: 0, error: 'API server currently unavailable' } };
	}
}

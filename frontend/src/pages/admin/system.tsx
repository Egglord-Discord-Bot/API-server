import Header from '../../components/header';
import Sidebar from '../../components/navbar/sidebar';
import AdminNavbar from '../../components/navbar/admin';
import Error from '../../components/error';
import InfoPill from '../../components/dashboard/infoPill';
import InfoPillProgress from '../../components/dashboard/infoPill-progress';
import { useSession } from 'next-auth/react';
import type { User } from '../../types/next-auth';
import { useState, useEffect } from 'react';
import type { GetServerSidePropsContext } from 'next';
import { formatBytes } from '../../utils/functions';
import { Line } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faMicrochip, faServer, faNetworkWired, faHardDrive } from '@fortawesome/free-solid-svg-icons';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,	CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
TimeAgo.addDefaultLocale(en);

type historyData = {
	memoryUsage: number
	cpuUsage: number
	createdAt: Date
}

interface Props {
	history: Array<historyData>
	current: {
		memory: {
			USAGE: number
			MAX: number
		}
		disk: {
			free: number
			total: number
		}
		cpu: number
	}
	error: string
}

export default function AdminSystem({ history: h, current: c, error }: Props) {
	const { data: session, status } = useSession();
	const [history, setHistory] = useState<Array<historyData>>(h);
	const [current, setCurrent] = useState(c);

	// Refresh the page with new data every 10 seconds
	useEffect(() => {
		const timer = setInterval(async () => {
			try {
				const res = await fetch('/api/session/admin/system', {
					method: 'get',
					headers: {
						'cookie': '',
					},
				});
				const data: Props = await res.json();
				setHistory(data.history);
				setCurrent(data.current);
			} catch (err) {
				console.log(err);

			}
		}, 10_000);

		return () => clearInterval(timer);
	}, []);
	if (status == 'loading') return null;

	// Set CPU history data
	const cpuHistory = {
		labels: history.map(i => i.createdAt).reverse(),
		datasets: [
			{
				label: 'CPU Usage',
				data: history.map(i => i.cpuUsage).reverse(),
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},
		],
	};

	// Set memory history data
	const memoryHistory = {
		labels: history.map(i => i.createdAt).reverse(),
		datasets: [
			{
				label: 'RAM usage',
				data: history.map(i => i.memoryUsage).reverse(),
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},
		],
	};

	return (
		<>
			<Header />
			<div className="wrapper">
				<Sidebar activeTab='system'/>
				<div id="content-wrapper" className="d-flex flex-column">
					<div id="content">
						<AdminNavbar user={session?.user as User}/>
						<div className="container-fluid" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 64px)', minHeight: 'calc(100vh - 64px)' }}>
							{error && (
								<Error text={error} />
							)}
							&nbsp;
							<div className="d-sm-flex align-items-center justify-content-between mb-4">
								<h1 className="h3 mb-0 text-gray-800">System Dashboard</h1>
								<a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
									<FontAwesomeIcon icon={faDownload} /> Generate Report
								</a>
							</div>
							<div className="row">
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'CPU Usage'} text={`${current.cpu}%`} icon={faMicrochip}/>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPillProgress title={'RAM usage'} text={`${formatBytes(current.memory.USAGE)}/${formatBytes(current.memory.MAX)}`} icon={faServer} max={current.memory.MAX} current={history[0]?.memoryUsage}/>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'Network'} text={formatBytes(0)} icon={faNetworkWired}/>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPillProgress title={'Disk Usage'} text={`${formatBytes(current.disk.total - current.disk.free)}/${formatBytes(current.disk.total)}`} icon={faHardDrive} max={current.disk.total} current={current.disk.total - current.disk.free}/>
								</div>
							</div>
							<div className="row" style={{ height: '100%' }}>
								<div className="col-lg-6">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h5 className="mb-0 mr-3 fw-bold text-gray-800">Total CPU usage</h5>
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
											<Line data={cpuHistory} options={{
												scales: {
													y: {
														ticks: {
															callback: function(label) {
																return `${label}%`;
															},
														},
														beginAtZero: true,
													},
													x: {
														ticks: {
															callback: function(value) {
																const date = memoryHistory.labels[value as number];
																return new TimeAgo('en-US').format(new Date().getTime() - (new Date().getTime() - new Date(date).getTime()));
															},
														},
													},
												},
											}} />
										</div>
									</div>
								</div>
								<div className="col-lg-6">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h5 className="mb-0 mr-3 fw-bold text-gray-800">Total memory usage</h5>
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
											<Line data={memoryHistory} options={{
												scales: {
													y: {
														ticks: {
															callback: function(label) {
																return formatBytes(label as number);
															},
														},
													},
													x: {
														ticks: {
															callback: function(value) {
																const date = memoryHistory.labels[value as number];
																return new TimeAgo('en-US').format(new Date().getTime() - (new Date().getTime() - new Date(date).getTime()));
															},
														},
													},
												},
											}} />
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

// Fetch basic API usage
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const res = await fetch(`${process.env.BACKEND_URL}api/session/admin/system`, {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		});

		const data = await res.json();
		return { props: data };
	} catch (err) {
		return { props: { history: [], current: {
			memory: {
				USAGE: 0,
				MAX: 0,
			},
			disk: {
				free: 0,
				total: 0,
			},
			cpu: 0,
		}, error: 'API server currently unavailable' } };
	}
}

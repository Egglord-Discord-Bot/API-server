import Header from '../../components/header';
import Sidebar from '../../components/navbar/sidebar';
import AdminNavbar from '../../components/navbar/admin';
import Error from '../../components/error';
import InfoPill from '../../components/dashboard/infoPill';
import { useSession } from 'next-auth/react';
import type { User } from '../../types/next-auth';
import { useState, useEffect } from 'react';
import type { GetServerSidePropsContext } from 'next';
import { formatBytes } from '../../utils/functions';
import { Line } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCalendar, faDollarSign, faComments } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,	CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
				label: 'Accessed',
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
				label: 'Accessed',
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
						<div className="container-fluid">
							{error && (
								<Error text={error} />
							)}
							<div className="d-sm-flex align-items-center justify-content-between mb-4">
								<h1 className="h3 mb-0 text-gray-800">System Dashboard</h1>
								<a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
									<FontAwesomeIcon icon={faDownload} /> Generate Report
								</a>
							</div>
							<div className="row">
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'CPU Usage'} text={`${current.cpu}%`} icon={faCalendar}/>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<div className="card border-left-success shadow h-100 py-2">
										<div className="card-body">
											<div className="row no-gutters align-items-center">
												<div className="col mr-2">
													<div className="text-xs font-weight-bold text-success text-uppercase mb-1">
													RAM usage
													</div>
													<div className="row align-items-center">
														<div className="col-auto">
															<div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">{formatBytes(current.memory.USAGE)}</div>
														</div>
														<div className="col">
															<div className="progress progress-sm">
																<div className="progress-bar bg-info" role="progressbar" style={{ width: `${Number(history[0]?.memoryUsage / current.memory.MAX).toFixed(2)}%` }} aria-valuenow={Math.round(history[0]?.memoryUsage / current.memory.MAX)} aria-valuemin={0}	aria-valuemax={current.memory.MAX}>
																	{((history[0]?.memoryUsage ?? 0) / current.memory.MAX).toFixed(2)}%
																</div>
															</div>
														</div>
													</div>
												</div>
												<div className="col-auto">
													<FontAwesomeIcon icon={faDollarSign} />
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<InfoPill title={'Network'} text={formatBytes(0)} icon={faCalendar}/>
								</div>
								<div className="col-xl-3 col-md-6 mb-4">
									<div className="card border-left-warning shadow h-100 py-2">
										<div className="card-body">
											<div className="row no-gutters align-items-center">
												<div className="col mr-2">
													<p className="text-xs font-weight-bold text-warning text-uppercase mb-1">
														Disk Usage
													</p>
													<div className="row align-items-center">
														<div className="col-auto">
															<div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">{formatBytes(current.disk.total - current.disk.free)}</div>
														</div>
														<div className="col">
															<div className="progress progress-sm">
																<div className="progress-bar bg-info" role="progressbar" style={{ width: `${(((current.disk.total - current.disk.free) / current.disk.total) * 100).toFixed(2)}%` }} aria-valuenow={Math.round(current.disk.total - current.disk.free)} aria-valuemin={0}	aria-valuemax={current.disk.total}>
																	{(((current.disk.total - current.disk.free) / current.disk.total) * 100).toFixed(2)}%
																</div>
															</div>
														</div>
													</div>
												</div>
												<div className="col-auto">
													<FontAwesomeIcon icon={faComments} />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="row" style={{ height: '100%' }}>
								<div className="col-lg-6">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h6 className="m-0 font-weight-bold text-primary">Total CPU usage</h6>
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
											<Line data={cpuHistory}/>
										</div>
									</div>
								</div>
								<div className="col-lg-6">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h6 className="m-0 font-weight-bold text-primary">Total memory usage</h6>
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
											<Line data={memoryHistory} />
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

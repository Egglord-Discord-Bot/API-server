import { InfoPill, CollapsibleCard, PieChart, LineGraph } from '../components';
import AdminLayout from '../layouts/Admin';

import { nFormatter, formatBytes } from '../utils/functions';
import type { ChartData, CoreChartOptions } from 'chart.js';
import { useSession } from 'next-auth/react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSignal, faUsers, faClock, faMemory } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import type { User } from '../types/next-auth';
import type { GetServerSidePropsContext, Endpoint, ResponseCode } from '../types';

type countEnum = { [key: string]: number }
interface Props {
	responseCode: Array<ResponseCode>
	monthUsage: countEnum
	mostAccessedEndpoints: Array<Endpoint>
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
	} as ChartData<'line'>;

	const top20Endpoints = data.mostAccessedEndpoints.filter(e => e._count?.history ?? 0 > 0).sort((a, b) =>(a._count?.history ?? 0) - (b._count?.history ?? 0));
	const mostAccessEndp = {
		labels: top20Endpoints.map(u => u.name),
		datasets: [
			{
				label: 'Accessed',
				data: top20Endpoints.map(u => u._count?.history),
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
	} as ChartData<'pie'>;

	async function download() {
		try {
			const str = JSON.stringify(data);
			const bytes = new TextEncoder().encode(str);
			const blob = new Blob([bytes], {
				type: 'application/json;charset=utf-8',
			});
			// Create blob link to download
			const url = window.URL.createObjectURL(new Blob([blob]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', 'admin.json');

			// Add to page, click and then remove from page
			document.body.appendChild(link);
			link.click();
			link.parentNode?.removeChild(link);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<AdminLayout user={session?.user as User}>
			<div className="container-fluid" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 64px)' }}>
				&nbsp;
				<div className="d-sm-flex align-items-center justify-content-between mb-4">
					<h1 className="h3 mb-0 text-gray-800">Admin Dashboard</h1>
					<button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm" onClick={() => download()}>
						<FontAwesomeIcon icon={faDownload} /> Generate Report
					</button>
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
					<div className="col-xl-8 col-lg-12" style={{ paddingBottom: '12px' }}>
						<CollapsibleCard id={'Total_API_usage'} header={<h5 className="m-0 fw-bold text-primary">Total API usage (Year)</h5>}>
							<LineGraph data={historyAccessed} options={{ responsive: true, maintainAspectRatio: false, aspectRatio:2 } as CoreChartOptions<'line'>} style={{ height: '400px' }}/>
						</CollapsibleCard>
					</div>
					<div className="col-xl-4 col-lg-12" style={{ paddingBottom: '12px' }}>
						<CollapsibleCard id={'Top_20_Accessed'} header={<h5 className="m-0 fw-bold text-primary">Top 20 Accessed Endpoints</h5>}>
							<PieChart data={mostAccessEndp} options={{ responsive: true } as CoreChartOptions<'pie'>} style={{ maxHeight: '400px' }}/>
						</CollapsibleCard>
					</div>
				</div>
				<div className="card shadow mb-4">
					<div className="card-header py-3" style={{ height: '100%' }}>
						<h5 className="m-0 fw-bold text-primary">API Responses Code</h5>
					</div>
					<div className="card-body">
						{data.responseCode.sort((a, b) => a._count.history - b._count.history).reverse().map(e => (
							<>
								<Tooltip place="top" content={`${e._count.history}`} id={`endpoint_${e.code}`}/>
								<h4 className="small font-weight-bold">{e.code} <span className="float-end">{Math.round((e._count.history / data.count) * 100)}%</span></h4>
								<div className="progress mb-4" data-tooltip-id={`endpoint_${e.code}`}>
									<div className="progress-bar bg-success" role="progressbar" style={{ width: `${(e._count.history / data.count) * 100}%` }}	aria-valuenow={e._count.history} aria-valuemin={0} aria-valuemax={data.count}>{e._count.history}</div>
								</div>
							</>
						))}
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}

// Fetch admin API usage
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const headers = {
		headers: {
			cookie: ctx.req.headers.cookie,
		},
	};

	try {
		// Fetch data from API
		const { data: { historyCount, userCount, responseCodes, mostAccessedEndpoints } } = await axios.get(`${process.env.BACKEND_URL}api/session/admin/json`, headers);
		const { data: { uptime, current: { memory: { USAGE } } } } = await axios.get(`${process.env.BACKEND_URL}api/session/admin/system`, headers);
		const { data: { months } } = await axios.get(`${process.env.BACKEND_URL}api/session/admin/history/growth?frame=monthly`, headers);

		return { props: { count: historyCount, responseCode: responseCodes, mostAccessedEndpoints, userCount, uptime, memoryUsage: USAGE, monthUsage: months } };
	} catch (err) {
		console.log(err);
		return { props: { count: 0, responseCode: { '0': 0 }, mostAccessedEndpoints: [], userCount: 0, uptime: 0, memoryUsage: 0, monthUsage: [], error: 'API server currently unavailable' } };
	}
}

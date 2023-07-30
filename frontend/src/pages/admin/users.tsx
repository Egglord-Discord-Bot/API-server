import { Error, InfoPill, UserListCard, CollapsibleCard } from '@/components';
import AdminLayout from '@/layouts/Admin';

import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Pie, Line } from 'react-chartjs-2';
import { faUsers, faBan, faDollarSign, faUserCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,	CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';

import type { GetServerSidePropsContext } from 'next';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type countEnum = { [key: string]: number }
interface Props {
	error?: string
	total: number
	admin: number
	premium: number
	block: number
	months: countEnum
}

export default function AdminUsers({ error, total, admin, premium, block, months }: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading' || session == null) return null;

	// Create data for pie chart
	const graphData = {
		labels: ['Normal', 'blocked', 'Admin', 'Premium'],
		datasets: [
			{
				label: 'Accessed',
				data: [(total - admin - premium - block), block, admin, premium],
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

	const usage = [];
	const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const d = new Date();
	d.setDate(1);
	const currentData = Object.entries(months);
	for (let i = 0; i <= 11; i++) {
		usage.push([monthName[d.getMonth()], currentData.find(f => f[0] == monthName[d.getMonth()])?.[1] ]);
		d.setMonth(d.getMonth() - 1);
	}

	const userJoinData = {
		labels: usage.map(u => u[0]).reverse(),
		datasets: [
			{
				label: 'New accounts',
				data: usage.map(u => u[1]).reverse(),
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},
		],
	};

	// Allow admin to download user JSON file
	async function download() {
		try {
			const res = await fetch('/api/session/admin/users/download', {
				method: 'get',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
			});
			const data = await res.json();
			const obj = Object.assign(data, { total, admin, premium, block, userGrowthChart: months });
			const str = JSON.stringify(obj);
			const bytes = new TextEncoder().encode(str);
			const blob = new Blob([bytes], {
				type: 'application/json;charset=utf-8',
			});
			// Create blob link to download
			const url = window.URL.createObjectURL(new Blob([blob]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', 'users.json');

			// Add to page, click and then remove from page
			document.body.appendChild(link);
			link.click();
			link.parentNode?.removeChild(link);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<AdminLayout user={session.user}>
			<div className="container-fluid" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 64px)' }}>
				{error && (
					<Error text={error} />
				)}
				&nbsp;
				<div className="d-sm-flex align-items-center justify-content-between mb-4">
					<h1 className="h3 mb-0 text-gray-800">User Dashboard</h1>
					<button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm" onClick={() => download()}>
						<FontAwesomeIcon icon={faDownload} /> Generate Report
					</button>
				</div>
				<div className="row">
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Total Users'} text={`${total}`} icon={faUsers} />
					</div>
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Blocked users'} text={`${block}`} icon={faBan} />
					</div>
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Premium users'} text={`${premium}`} icon={faDollarSign} />
					</div>
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Admin users'} text={`${admin}`} icon={faUserCheck} />
					</div>
				</div>
				<div className="row">
					<div className="col-xl-8 col-lg-7" style={{ paddingBottom: '12px' }}>
						<CollapsibleCard id={'user_growth'} header={<h4 className="m-0 font-weight-bold text-primary">User Growth</h4>}>
							<Line data={userJoinData} options={{ responsive: true, maintainAspectRatio: false, aspectRatio:2 }} style={{ height: '400px' }}/>
						</CollapsibleCard>
					</div>
					<div className="col-xl-4 col-lg-5" style={{ paddingBottom: '12px' }}>
						<CollapsibleCard id={'User_Make-up'} header={<h4 className="m-0 font-weight-bold text-primary">User Make-up</h4>}>
							<Pie data={graphData} style={{ maxHeight: '400px' }} />
						</CollapsibleCard>
					</div>
				</div>
				<UserListCard total={total}/>
			</div>
		</AdminLayout>
	);
}

// Fetch basic API usage
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const obj = {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		};

		const [res1, res2] = await Promise.all([fetch(`${process.env.BACKEND_URL}api/session/admin/users/stats`, obj),
			fetch(`${process.env.BACKEND_URL}api/session/admin/users/growth?frame=monthly`, obj)]);

		const { total, admin, premium, block } = await res1.json();
		const { months } = await res2.json();
		return { props: { total, admin, premium, block, months } };
	} catch (err) {
		return { props: { total: 0, admin: 0, premium: 0, block: 0, months: [], error: 'API server currently unavailable' } };
	}
}

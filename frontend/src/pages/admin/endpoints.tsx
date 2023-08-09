import { ErrorAlert, InfoPill, HistoryListCard, EndpointListCard } from '@/components';
import AdminLayout from '@/layouts/Admin';
import { useSession } from 'next-auth/react';
import axios from 'axios';

import type { GetServerSidePropsContext } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCalendar, faCalendarDays, faCalendarWeek, faClock } from '@fortawesome/free-solid-svg-icons';
import 'react-tooltip/dist/react-tooltip.css';

interface Props {
  total: number
  error?: string
  lastYear: number
  lastMonth: number
  last7Days: number
  last24Hours: number
}

export default function AdminEndpoints({ error, lastYear, lastMonth, last7Days, last24Hours }: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading' || session == null) return null;

	function downloadReport() {
		console.log('downloading');
	}

	return (
		<AdminLayout user={session.user}>
			<div className="container-fluid" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 64px)' }}>
				{error && (
					<ErrorAlert text={error} />
				)}
        &nbsp;
				<div className="d-sm-flex align-items-center justify-content-between mb-4">
					<h1 className="h3 mb-0 text-gray-800">Endpoint Dashboard</h1>
					<button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm" onClick={() => downloadReport()}>
						<FontAwesomeIcon icon={faDownload} /> Generate Report
					</button>
				</div>
				<div className="row">
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Last year'} text={`${lastYear}`} icon={faCalendar}/>
					</div>
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Last 30 days'} text={`${lastMonth}`} icon={faCalendarWeek}/>
					</div>
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Last 7 days'} text={`${last7Days}`} icon={faCalendarDays}/>
					</div>
					<div className="col-xl-3 col-md-6 mb-4">
						<InfoPill title={'Last 24 hours'} text={`${last24Hours}`} icon={faClock} />
					</div>
				</div>
				<div className="row">
					<div className="col-xl-6 col-lg-12" style={{ paddingBottom: '12px' }}>
						<EndpointListCard />
					</div>
					<div className="col-xl-6 col-lg-12" style={{ paddingBottom: '12px' }}>
						<HistoryListCard />
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}


// Fetch endpoints
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const headers = {
		headers: {
			cookie: ctx.req.headers.cookie,
		},
	};

	try {
		// Fetch API endpoints
		const [{ data: { years } }, { data: { months } }, { data: { days } }, { data: { hours } }] = await Promise.all([
			axios.get(`${process.env.BACKEND_URL}api/session/admin/history/growth?frame=yearly`, headers),
			axios.get(`${process.env.BACKEND_URL}api/session/admin/history/growth?frame=monthly`, headers),
			axios.get(`${process.env.BACKEND_URL}api/session/admin/history/growth?frame=daily`, headers),
			axios.get(`${process.env.BACKEND_URL}api/session/admin/history/growth?frame=hourly`, headers),
		]);

		// Calculate values
		const lastYearCount = years[new Date().getFullYear()];
		const lastMonthCount = Object.entries(months)[new Date().getMonth()][1];
		// TODO: Update this so gets first 7 days instead of all 14 days
		const last7DaysCount = (Object.values(days) as Array<number>).reduce((a, b) => a + b, 0);
		const last24HoursCount = (Object.values(hours) as Array<number>).reduce((a, b) => a + b, 0);

		return { props: { lastYear: lastYearCount, lastMonth: lastMonthCount, last7Days: last7DaysCount, last24Hours: last24HoursCount } };
	} catch (err) {
		console.log(err);
		return { props: { endpointData: [], lastYear: 0, lastMonth:0, last7Days:0, last24Hours:0, error: 'API server currently unavailable' } };
	}
}

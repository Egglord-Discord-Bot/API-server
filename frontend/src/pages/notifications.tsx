import MainLayout from '@/layouts/Main';
import { Notifications } from '@/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next/types';

interface Props {
	notifications: Notifications[]
}

export default function Home({ notifications }: Props) {
	const { data: session, status } = useSession();

	if (status == 'loading') return null;
	return (
		<MainLayout user={session?.user}>
			<div className="container-fluid" style={{ padding:'1%', minHeight: '84vh' }}>
				<div className="d-sm-flex align-items-center justify-content-between mb-4">
					<h1 className="h3 mb-0 text-gray-800">Notifications</h1>
				</div>
				<div className="accordion" id="accordionPanelsStayOpenExample">
					{notifications.map((notifs, index) => (
						<div className="accordion-item" style={{ minWidth:'100%' }} key={notifs.id}>
							<h2 className="accordion-header" id={`panelsStayOpen-heading${index}`}>
								<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#panelsStayOpen-collapse${index}`} aria-expanded="true" aria-controls={`panelsStayOpen-collapse${index}`}>
									{index}. {notifs.header} ({new Date(notifs.createdAt).toLocaleDateString()})
								</button>
							</h2>
							<div id={`panelsStayOpen-collapse${index}`} className="accordion-collapse collapse show" aria-labelledby={`panelsStayOpen-heading${index}`}>
								<div className="accordion-body">
									{notifs.content}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</MainLayout>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const headers = {
		headers: {
			cookie: ctx.req.headers.cookie,
		},
	};

	try {
		// Fetch data from API
		const { data: { notifications } } = await axios.get(`${process.env.BACKEND_URL}api/session/notifications`, headers);
		return { props: { notifications } };
	} catch (err) {
		console.log(err);
		return { props: { notifications: [] } };
	}
}
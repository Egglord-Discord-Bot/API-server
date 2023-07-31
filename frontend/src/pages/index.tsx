import MainLayout from '@/layouts/Main';
import axios from 'axios';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
interface Props {
	userCount: number
  endpointCount: number
  historyCount: number
}

export default function Home() {
	const { data: session, status } = useSession();
	const [{ userCount, endpointCount, historyCount }, setData] = useState<Props>({ userCount: 0, endpointCount: 0, historyCount: 0 });

	useEffect(() => {
		(async () => {
			const { data } = await axios.get('/api/session/stats');
			setData(data);
		})();
	}, []);

	if (status == 'loading') return null;
	return (
		<MainLayout user={session?.user}>
			<>
				<section id="hero" className="d-flex align-items-center">
					<div className="container" data-aos="zoom-out" data-aos-delay="100">
						<h1>Welcome to <span>Egglord API.</span></h1>
						<h2>Only the best free API.</h2>
						<div className="d-flex">
							<Link href="/generate" className="btn-get-started" style={{ textDecoration: 'none' }}>Get Started</Link>
              &nbsp;
							<Link href="/docs" className="btn-get-started" style={{ textDecoration: 'none' }}>Docs</Link>
						</div>
					</div>
				</section>
				<main id="main">
					<section id="counts" className="counts">
						<div className="container" data-aos="fade-up">
							<div className="row">
								<div className="col-lg-2 col-md-6">
								</div>
								<div className="col-lg-3 col-md-6">
									<div className="count-box">
										<i className="bi bi-emoji-smile"></i>
										<span data-purecounter-start="0" data-purecounter-end={userCount} data-purecounter-duration="1" className="purecounter">{userCount}</span>
										<p>API Users</p>
									</div>
								</div>
								<div className="col-lg-3 col-md-6 mt-5 mt-lg-0">
									<div className="count-box">
										<i className="bi bi-hdd"></i>
										<span data-purecounter-start="0" data-purecounter-end={endpointCount} data-purecounter-duration="1" className="purecounter">{endpointCount}</span>
										<p>Total API endpoints</p>
									</div>
								</div>
								<div className="col-lg-3 col-md-6 mt-5 mt-lg-0">
									<div className="count-box">
										<i className="bi bi-hdd"></i>
										<span data-purecounter-start="0" data-purecounter-end={historyCount} data-purecounter-duration="1" className="purecounter">{historyCount}</span>
										<p>API requests recieved</p>
									</div>
								</div>
								<div className="col-lg-2 col-md-6">
								</div>
							</div>
						</div>
					</section>
				</main>
			</>
		</MainLayout>
	);
}

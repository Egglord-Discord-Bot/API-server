import Link from 'next/link';
import Header from '../components/header';
import { Footer, Navbar } from '../components/navbar';
import type { GetServerSidePropsContext } from 'next';
import { useSession } from 'next-auth/react';

// API basic stats
interface Props {
	userCount: number
  endpointCount: number
  totalAPIUsage: number
}


export default function Home({ userCount, endpointCount, totalAPIUsage }: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading') return null;

	return (
		<>
			<Header />
			<Navbar user={session?.user} />
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
									<span data-purecounter-start="0" data-purecounter-end={totalAPIUsage} data-purecounter-duration="1" className="purecounter">{totalAPIUsage}</span>
									<p>API requests recieved</p>
								</div>
							</div>
							<div className="col-lg-2 col-md-6">
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}

// Fetch basic API usage
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const res = await fetch(`${process.env.BACKEND_URL}api/session/stats`, {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		});
		const data = await res.json();
		return { props: { userCount: data.userCount, endpointCount: data.endpointCount, totalAPIUsage: data.historyCount } };
	} catch (err) {
		return { props: { userCount: 0, endpointCount: 0, totalAPIUsage: 0 } };
	}
}

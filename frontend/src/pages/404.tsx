import MainLayout from '../layouts/Main';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function FourZeroFour() {
	const { data: session, status } = useSession();
	if (status == 'loading') return null;

	return (
		<MainLayout user={session?.user}>
			<div className="page-wrap d-flex flex-row align-items-center" style={{ backgroundColor:'#f1f6fe', height: '84vh' }}>
				<div className="container">
					<div className="row justify-content-center align-middle">
						<div className="col-md-12 text-center">
							<span className="display-1 d-block">404</span>
							<div className="mb-4 lead">The page you are looking for was not found.</div>
							<Link href="/" className="btn btn-link">Back to Home</Link>
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}

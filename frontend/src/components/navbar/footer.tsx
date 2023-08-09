import Link from 'next/link';

export default function Footer() {
	return (
		<div className="container">
			<footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
				<p className="mb-0 text-muted">©{new Date().getFullYear()} Egglord</p>
				<ul className="nav justify-content-end">
					<li className="nav-item">
						<Link href="/docs" className="nav-link px-2 text-muted">Features</Link>
					</li>
					<li className="nav-item">
						<Link href="/pricing" className="nav-link px-2 text-muted">Pricing</Link>
					</li>
					<li className="nav-item">
						<Link href="/privacy-policy" className="nav-link px-2 text-muted">Privacy Policy</Link>
					</li>
					<li className="nav-item">
						<Link href="/terms-and-service" className="nav-link px-2 text-muted">Terms & Service</Link>
					</li>
				</ul>
			</footer>
		</div>
	);
}

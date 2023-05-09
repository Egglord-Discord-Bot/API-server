import Link from 'next/link';

interface Props {
	activeTab: 'dashboard' | 'users' | 'endpoint'
}

export default function Sidebar({ activeTab }: Props) {
	return (
		<ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
			<Link className="sidebar-brand d-flex align-items-center justify-content-center" href="/">
				<div className="sidebar-brand-icon rotate-n-15">
					<i className="fas fa-laugh-wink"></i>
				</div>
				<div className="sidebar-brand-text mx-3">API server</div>
			</Link>
			<hr className="sidebar-divider my-0" />
			<li className={`nav-item ${activeTab == 'dashboard' ? 'active' : ''}`}>
				<Link className="nav-link" href="/admin">
					<i className="fas fa-fw fa-tachometer-alt"></i>
					<span>Dashboard</span>
				</Link>
			</li>
			<hr className="sidebar-divider" />
			<div className="sidebar-heading">
				Interface
			</div>
			<li className={`nav-item ${activeTab == 'users' ? 'active' : ''}`}>
				<Link className="nav-link" href="/admin/users">
					<i className="fas fa-fw fa-chart-area"></i>
					<span>Users</span>
				</Link>
			</li>
			<li className={`nav-item ${activeTab == 'endpoint' ? 'active' : ''}`}>
				<Link className="nav-link" href="/admin/endpoints">
					<i className="fas fa-fw fa-chart-area"></i>
					<span>Endpoints</span>
				</Link>
			</li>
			<li className="nav-item">
				<a className="nav-link collapsed" href="#" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
					<i className="fas fa-fw fa-cog"></i>
					<span>Coming soon</span>
				</a>
				<div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionSidebar">
					<div className="bg-white py-2 collapse-inner rounded">
						<h6 className="collapse-header">COMING SOON:</h6>
						<Link className="collapse-item" href="/">1</Link>
						<Link className="collapse-item" href="/">2</Link>
					</div>
				</div>
			</li>
			<hr className="sidebar-divider" />
		</ul>
	);
}

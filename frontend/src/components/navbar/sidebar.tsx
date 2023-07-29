import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaughWink, faTachometerAlt, faChartArea, faUsers, faCog, faFileLines } from '@fortawesome/free-solid-svg-icons';

interface Props {
	activeTab: 'dashboard' | 'users' | 'endpoint' | 'system' | 'logs'
}

export default function Sidebar({ activeTab }: Props) {
	return (
		<ul className="navbar-nav bg-primary sidebar sidebar-dark accordion" id="accordionSidebar" style={{ color: 'white', minHeight: '100vh' }}>
			<Link className="sidebar-brand d-flex align-items-center justify-content-center" href="/" style={{ color: 'white' }}>
				<div className="sidebar-brand-icon rotate-n-15">
					<FontAwesomeIcon icon={faLaughWink} />
				</div>
				<div className="sidebar-brand-text mx-3">API server</div>
			</Link>
			<hr className="sidebar-divider my-0" />
			<li className={`nav-item ${activeTab == 'dashboard' ? 'active' : ''}`}>
				<Link className="nav-link" href="/admin">
					<FontAwesomeIcon icon={faTachometerAlt} />
					<span> Dashboard</span>
				</Link>
			</li>
			<hr className="sidebar-divider" />
			<li className={`nav-item ${activeTab == 'users' ? 'active' : ''}`}>
				<Link className="nav-link" href="/admin/users">
					<FontAwesomeIcon icon={faUsers} />
					<span> Users</span>
				</Link>
			</li>
			<li className={`nav-item ${activeTab == 'endpoint' ? 'active' : ''}`}>
				<Link className="nav-link" href="/admin/endpoints">
					<FontAwesomeIcon icon={faChartArea} />
					<span> Endpoints</span>
				</Link>
			</li>
			<li className={`nav-item ${activeTab == 'system' ? 'active' : ''}`}>
				<Link className="nav-link" href="/admin/system">
					<FontAwesomeIcon icon={faChartArea} />
					<span> System</span>
				</Link>
			</li>
			<li className={`nav-item ${activeTab == 'logs' ? 'active' : ''}`}>
				<Link className="nav-link" href="/admin/logs">
					<FontAwesomeIcon icon={faFileLines} />
					<span> Logs</span>
				</Link>
			</li>
			<li className="nav-item">
				<a className="nav-link collapsed" href="#" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
					<FontAwesomeIcon icon={faCog} />
					<span> Extra</span>
				</a>
				<div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionSidebar">
					<div className="bg-white py-2 collapse-inner rounded">
						<h6 className="collapse-header">COMING SOON:</h6>
						<Link className="collapse-item" href="/">Stripe</Link>
						<Link className="collapse-item" href="/admin/cloudflare">Cloudflare</Link>
					</div>
				</div>
			</li>
			<hr className="sidebar-divider" />
		</ul>
	);
}

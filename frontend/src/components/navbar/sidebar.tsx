import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaughWink, faTachometerAlt, faChartArea, faUsers, faCog, faFileLines } from '@fortawesome/free-solid-svg-icons';

interface Props {
	activeTab: 'dashboard' | 'users' | 'endpoint' | 'system' | 'logs' | 'settings'
	showSidebar: boolean
}

export default function Sidebar({ activeTab, showSidebar }: Props) {
	return (
		<ul className="navbar-nav bg-primary sidebar sidebar-dark accordion" id="accordionSidebar" style={{ color: 'white', minHeight: '100vh', display: showSidebar ? 'block' : 'none' }}>
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
			<li className={`nav-item ${activeTab == 'settings' ? 'active' : ''}`}>
				<Link className="nav-link" href="/admin/settings">
					<FontAwesomeIcon icon={faCog} />
					<span> Settings</span>
				</Link>
			</li>
			<hr className="sidebar-divider" />
		</ul>
	);
}

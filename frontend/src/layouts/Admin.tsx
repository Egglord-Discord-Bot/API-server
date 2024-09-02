import { Header, Sidebar, AdminNavbar } from '../components';
import { useState, type ReactElement } from 'react';
import type { User } from '../types/next-auth';

interface Props {
  children: ReactElement
  user: User
}

export default function AdminLayout({ children, user }: Props) {
	const [showSidebar, setShowSidebar] = useState(true);

	return (
		<>
			<Header />
			<div className="wrapper">
				<Sidebar activeTab='dashboard' showSidebar={showSidebar} />
				<div id="content-wrapper" className="d-flex flex-column">
					<div id="content">
						<AdminNavbar user={user} setShowSidebar={setShowSidebar} showSidebar={showSidebar} />
						{children}
					</div>
				</div>
			</div>
		</>
	);
}

import { Header, Sidebar, AdminNavbar } from '../components';
import type { ReactElement } from 'react';
import type { User } from '../types/next-auth';

interface Props {
  children: ReactElement
  user: User
}

export default function AdminLayout({ children, user }: Props) {
	return (
		<>
			<Header />
			<div className="wrapper">
				<Sidebar activeTab='dashboard'/>
				<div id="content-wrapper" className="d-flex flex-column">
					<div id="content">
						<AdminNavbar user={user}/>
						{children}
					</div>
				</div>
			</div>
		</>
	);
}

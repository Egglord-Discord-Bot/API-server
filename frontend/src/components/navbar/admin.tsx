import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import type { User } from '../../types/next-auth';

interface Props {
	user: User
}

export default function Admin({ user }: Props) {
	return (
		<nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
			<button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
				<i className="fa fa-bars"></i>
			</button>
			<form	className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
				<div className="input-group">
					<input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2" />
					<div className="input-group-append">
						<button className="btn btn-primary" type="button">
							<i className="fas fa-search fa-sm"></i>
						</button>
					</div>
				</div>
			</form>
			<ul className="navbar-nav ml-auto">
				<li className="nav-item dropdown no-arrow d-sm-none">
					<a className="nav-link dropdown-toggle" href="#" id="searchDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						<i className="fas fa-search fa-fw"></i>
					</a>
					<div className="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in" aria-labelledby="searchDropdown">
						<form className="form-inline mr-auto w-100 navbar-search">
							<div className="input-group">
								<input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search"	aria-describedby="basic-addon2" />
								<div className="input-group-append">
									<button className="btn btn-primary" type="button">
										<i className="fas fa-search fa-sm"></i>
									</button>
								</div>
							</div>
						</form>
					</div>
				</li>
				<li className="nav-item dropdown no-arrow mx-1">
					<a className="nav-link dropdown-toggle" href="#" id="alertsDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						<i className="fas fa-bell fa-fw"></i>
						<span className="badge badge-danger badge-counter">3+</span>
					</a>
					<div className="dropdown-list dropdown-menu dropdown-menu-end shadow animated--grow-in"
						aria-labelledby="alertsDropdown">
						<h6 className="dropdown-header">
              Alerts Center
						</h6>
						<a className="dropdown-item d-flex align-items-center" href="#">
							<div className="mr-3">
								<div className="icon-circle bg-primary">
									<i className="fas fa-file-alt text-white"></i>
								</div>
							</div>
							<div>
								<div className="small text-gray-500">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(new Date())}</div>
								<span className="font-weight-bold">FEATURE COMING SOON</span>
							</div>
						</a>
						<a className="dropdown-item text-center small text-gray-500" href="#">Show All Alerts</a>
					</div>
				</li>
				<div className="topbar-divider d-none d-sm-block"></div>
				<li className="nav-item dropdown no-arrow">
					<a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						<span className="mr-2 d-none d-lg-inline text-gray-600 small">{user.username}#{user.discriminator}</span>
						<Image className="img-profile rounded-circle" src={user.avatar} alt="..." width={64} height={64}/>
					</a>
					<div className="dropdown-menu dropdown-menu-end shadow animated--grow-in" aria-labelledby="userDropdown">
						<Link className="dropdown-item" href="/settings">
							<i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
              Settings
						</Link>
						<div className="dropdown-divider"></div>
						<a className="dropdown-item" onClick={() => signOut()} href="/">
							<i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
              Logout
						</a>
					</div>
				</li>
			</ul>
		</nav>
	);
}

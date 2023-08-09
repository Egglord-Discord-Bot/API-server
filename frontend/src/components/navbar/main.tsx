import Link from 'next/link';
import Image from 'next/image';
import { signIn, signOut } from 'next-auth/react';
import type { User } from '@/types/next-auth';

interface Props {
	user: User | undefined
}

export default function Main({ user }: Props) {
	return (
		<nav className="navbar navbar-expand-lg" style={{ boxShadow: '0px 2px 5px 0px rgba(0,0,0,0.75)', backgroundColor: 'white', zIndex: 100 }}>
			<div className="container">
				<Link className="navbar-brand" href="/">Home</Link>
				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarSupportedContent">
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						<li className="nav-item">
							<Link className="nav-link active" aria-current="page" href="/docs">Docs</Link>
						</li>
						<li className="nav-item">
							<a className="nav-link active" href="https://discord.gg/8g6zUQu">Discord</a>
						</li>
						<li className="nav-item">
							<Link className="nav-link active" href="/generate">Generate</Link>
						</li>
					</ul>
					<ul className="navbar-nav d-flex">
						{user == undefined ?
							<li className="navbar-nav">
								<a className="nav-item text-dark nav-link" href="#" onClick={() => signIn('discord')}>Login</a>
							</li>
							:
							<li className="nav-item dropdown">
								<a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
									<Image src={user.avatar} width={25} height={25} className="rounded-circle" alt="User avatar" /> {user.username}
								</a>
								<div className="dropdown-menu dropdown-menu-end">
									<Link className="dropdown-item text-dark" href="/settings">Settings</Link>
									{user.role == 'ADMIN' && (
										<Link className="dropdown-item text-dark" href="/admin">Admin</Link>
									)}
									<div className="dropdown-divider"></div>
									<Link className="dropdown-item" href="#" onClick={() => signOut()} id="logout">Logout</Link>
								</div>
							</li>
						}
					</ul>
				</div>
			</div>
		</nav>
	);
}

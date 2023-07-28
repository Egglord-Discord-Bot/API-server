import { Header, Footer, Navbar } from '../components';
import type { ReactElement } from 'react';
import type { User } from '../types/next-auth';

interface Props {
  children: ReactElement
  user: User | undefined
}

export default function Main({ children, user }: Props) {
	return (
		<>
			<Header />
			<Navbar user={user} />
		    {children}
			<Footer />
		</>
	);
}

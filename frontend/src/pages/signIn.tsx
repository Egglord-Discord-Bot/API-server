import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Signin() {
	const router = useRouter();
	const { status } = useSession();

	useEffect(() => {
		if (status === 'unauthenticated') {
			void signIn('discord');
		} else if (status === 'authenticated') {
			void router.push('/');
		}
	}, [router, status]);

	return <div></div>;
}

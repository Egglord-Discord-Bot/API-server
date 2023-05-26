import '@/styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import '@/styles/bootstrap.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
	useEffect(() => {
		require('bootstrap/dist/js/bootstrap.bundle.min.js');
	}, []);

	return (
		<SessionProvider session={session}>
			<Component {...pageProps} />
		</SessionProvider>
	);
}

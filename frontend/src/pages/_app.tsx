import '@/styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { useEffect } from 'react';
import { config } from '@fortawesome/fontawesome-svg-core';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
config.autoAddCss = false;

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
	useEffect(() => {
		window.bootstrap = require('bootstrap/dist/js/bootstrap.bundle.min.js');
	}, []);

	return (
		<SessionProvider session={session}>
			<Component {...pageProps} />
		</SessionProvider>
	);
}

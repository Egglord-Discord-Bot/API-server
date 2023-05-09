import Head from 'next/head';
import Script from 'next/script';

export default function Header() {
	return (
		<>
			<Head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="API server" />
				<meta property="og:description" content="This API is a service that provides anyone the ease of creating memes or fetching information on the internet." />
				<meta property="og:image" content="/favicon.ico" />
				<title>API</title>
			</Head>
			<Script src="https://kit.fontawesome.com/fa3685e359.js" crossOrigin="anonymous"></Script>
		</>
	);
}

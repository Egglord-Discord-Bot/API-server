import Head from 'next/head';

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
		</>
	);
}

import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>LMS</title>
				<meta property='og:title' content='LMS' />
				<meta property='og:description' content='View the upcoming assignments and get notified of future ones!' />
				<meta property='og:author' content='Cyril' />
				<meta property='theme-color' content='#https://coolors.co/5865f2' />
				<meta name='theme-color' content='#https://coolors.co/5865f2' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />
				<meta name='description' content='View the upcoming assignments and get notified of future ones!' />
			</Head>
			<Component {...pageProps} />
		</>
	);
}

export default MyApp;

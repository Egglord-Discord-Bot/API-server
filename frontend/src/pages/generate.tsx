import { ParamBuilder, ErrorAlert } from '@/components';
import MainLayout from '@/layouts/Main';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import axios from 'axios';

import type { EndpointExtra, EndpointParam, GetServerSidePropsContext } from '../types';
import type { ChangeEvent, FormEvent } from 'react';
interface Props {
  endpoints: Array<EndpointExtra>
  error?: string
}

export default function Generate({ endpoints, error }: Props) {
	const { data: session, status } = useSession();
	const [selected, setSelected] = useState<EndpointExtra>(endpoints[0]);
	const [response, setResponse] = useState<object | string>();
	const [respTime, setRespTime] = useState<number>(0);
	const [loading, setLoading] = useState(false);
	if (status == 'loading') return null;

	function updateParams(e: ChangeEvent) {
		e.preventDefault();
		const el = e.target as HTMLSelectElement;
		const endpoint = endpoints.find(p => p.name == el.value) as EndpointExtra;
		setSelected(endpoint);
		setResponse('');
		setRespTime(0);
	}

	async function sendRequest(e: FormEvent) {
		setResponse('');
		e.preventDefault();

		// Get the users input, convert to URL query params
		const z = document.querySelectorAll('*[name^="param"]');
		const params = selected.data?.parameters?.map(l => `${l.name}=${(z.item(selected.data?.parameters?.indexOf(l) ?? -1) as HTMLInputElement).value}`).join('&');

		// Make the actual request if it's data, if it's an image just display the url as image src
		setLoading(true);
		if (selected.name.startsWith('/api/image') || selected.name == '/api/misc/qrcode') {
			setResponse(`${selected.name}?${params}`);
		} else {
			const time = new Date();
			// Send request
			try {
				const { data } = await axios.get(`${selected.name}?${params}`);
  			setResponse(data);
			} catch (err) {
				if (axios.isAxiosError(err)) {
					setResponse(err.response?.data);
				} else {
					setResponse({ error: 'An error has occured' });
				}
			}
			setRespTime(new Date().getTime() - time.getTime());
		}
		setLoading(false);
	}

	return (
		<MainLayout user={session?.user}>
			<div className="container" style={{ minHeight: '84vh' }}>
        &nbsp;
				{error && (
					<ErrorAlert text={error} />
				)}
				<div className="row">
					<div className="col-lg-6">
						<h1>Input</h1>
						<form onSubmit={(e) => sendRequest(e)}>
							<div className="row mb-3">
								<label htmlFor="endpointSelection" className="col-sm-2 col-form-label">Endpoint:</label>
								<div className="col-sm-10">
									<select className="form-select" id="endpointSelection" aria-label="Select endpoint to use" onChange={(e) => updateParams(e)}>
										{endpoints.map(e => (
											<option value={e.name} key={e.name}>{e.name}</option>
										))}
									</select>
									<div id="passwordHelpBlock" className="form-text">
										{selected?.data?.description}
									</div>
								</div>
							</div>
							<div id="params">
								<hr />
								<h4>Parameters</h4>
								<ParamBuilder EndpointParam={selected?.data?.parameters as EndpointParam[]}/>
							</div>
							<button type="submit" className="btn btn-primary">Send</button>
						</form>
					</div>
					<Script src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js"></Script>
					<div className="col-lg-6">
						<h1>Response</h1>
						{selected?.name.startsWith('/api/image') || selected?.name == '/api/misc/qrcode' ?
							<Image src={response as string} alt={selected.name} width={300} height={300} /> :
							<pre className={`prettyprint ${loading ? 'skeleton' : ''}`} style={{ minHeight: '300px', maxHeight: '74vh', overflowY: 'scroll' }}>{JSON.stringify(response, null, 4)}</pre >
						}
						{respTime > 0 && (
							<p className="float-end">Response time: {respTime}ms</p>
						)}
					</div>
				</div>
			</div>
		</MainLayout>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const { data: { endpoints } } = await axios.get(`${process.env.BACKEND_URL}api/session/admin/endpoints/json`, {
			headers: {
				cookie: ctx.req.headers.cookie as string,
			},
		});
		return { props: { endpoints: endpoints.filter((e: EndpointExtra) => e.data != null) } };
	} catch (err) {
		console.log(err);
		return { props: { endpoints: [], error: 'API server is currently unavailable' } };
	}
}

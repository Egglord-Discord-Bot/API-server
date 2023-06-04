import Header from '../components/header';
import Footer from '../components/navbar/footer';
import Navbar from '../components/navbar/main';
import ParamBuilder from '../components/paramBuilder';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import type { EndpointExtra, EndpointParam } from '../types';
import type { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import type { ChangeEvent, FormEvent } from 'react';
interface Props {
  endpoints: Array<EndpointExtra>
}

export default function Home({ endpoints }: Props) {
	const { data: session, status } = useSession();
	const [selected, setSelected] = useState<EndpointExtra>(endpoints[0]);
	const [response, setResponse] = useState<any>();
	if (status == 'loading') return null;

	function updateParams(e: ChangeEvent) {
		e.preventDefault();
		const el = e.target as HTMLSelectElement;
		const endpoint = endpoints.find(p => p.name == el.value) as EndpointExtra;
		setSelected(endpoint);
		setResponse('');
	}

	async function sendRequest(e: FormEvent) {
		e.preventDefault();

		// Get the users input, convert to URL query params
		const z = document.querySelectorAll('*[name^="param"]');
		const params = selected.data?.parameters.map(l => `${l.name}=${(z.item(selected.data?.parameters?.indexOf(l) ?? -1) as HTMLInputElement).value}`).join('&');

		// Make the actual request if it's data, if it's an image just display the url as image src
		if (selected.name.startsWith('/api/image')) {
			setResponse(`${selected.name}?${params}`);
		} else {
			// Send request
			const res = await fetch(`${selected.name}?${params}`, {
				method: 'get',
			});
			setResponse(await res.json());
		}
	}

	return (
		<>
			<Header />
			<Navbar user={session?.user} />
			<div className="container">
				<div className="row">
					<div className="col-lg-6">
						<h1>Input</h1>
						<form onSubmit={(e) => sendRequest(e)}>
							<div className="row mb-3">
								<label htmlFor="inputEmail3" className="col-sm-2 col-form-label">Endpoint:</label>
								<div className="col-sm-10">
									<select className="form-select" aria-label="Default select example" onChange={(e) => updateParams(e)}>
										{endpoints.map(e => (
											<option value={e.name} key={e.name}>{e.name}</option>
										))}
									</select>
								</div>
							</div>
							<div id="params">
								<hr />
								<h4>Parameters</h4>
								<ParamBuilder EndpointParam={selected.data?.parameters as EndpointParam[]}/>
							</div>
							<button type="submit" className="btn btn-primary">Send</button>
						</form>
					</div>
					<div className="col-lg-6">
						<h1>Response</h1>
						{selected.name.startsWith('/api/image') ?
							<Image src={response} width={512} height={512} alt={selected.name}/> :
							<code dangerouslySetInnerHTML={{ __html: JSON.stringify(response, null, 4) }}></code>
						}
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const res = await fetch(`${process.env.BACKEND_URL}api/session/admin/endpoints/json`, {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		});
		const { endpoints: endpointData } = await res.json();
		return { props: { endpoints: endpointData.filter((e: EndpointExtra) => e.data != null) } };
	} catch (err) {
		console.log(err);
		return { props: { endpoints: [] } };
	}
}

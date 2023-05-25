import Header from '../components/header';
import Navbar from '../components/navbar/main';
import Error from '../components/error';
import type { GetServerSidePropsContext } from 'next';
import { useSession } from 'next-auth/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons';
ChartJS.register(ArcElement, Tooltip, Legend);

type history = {
	id: number,
  userId: string,
  endpoint: string,
  createdAt: Date
}
type countEnum = { [key: string]: number }
interface Props {
	history: Array<history>
	total: number
	error?: string
	data: countEnum
	cookie: string
}

export default function Settings({ history: hList, error, total = 0, data, cookie }: Props) {
	const { data: session, status } = useSession();

	// Fot toggle visibility of token + update token when regenerated
	const [canSee, setCanSee] = useState(false);
	const [token, setToken] = useState('');
	useEffect(() => {
		setToken(session?.user.token as string);
	}, [status, session?.user.token]);

	// For paginator
	const [page, setPage] = useState(0);
	const [history, setHistory] = useState<Array<history>>(hList);
	if (status == 'loading') return null;


	// Put their token in their clipboard
	function copyUserToken(e: MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		// Get the text field
		const copyText = document.getElementById('myInput') as HTMLInputElement;

		// Select the text field
		copyText.select();
		// For mobile support
		copyText.setSelectionRange(0, 99999);

		// Copy the text inside the text field
		console.log(navigator);
		navigator.clipboard.writeText(copyText.value);

		// Alert the copied text
		alert('Token has been copied');
	}

	// Toggle the inpout field
	function toggleTokenVisibility(e: MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		const x = document.getElementById('myInput') as HTMLInputElement;
		setCanSee(!canSee);
		x.type = (x.type == 'password') ? 'text' : 'password';
	}

	async function fetchHistory(p: number) {
		try {
			const res = await fetch(`/api/session/history?page=${p}`, {
				method: 'get',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
			});
			setHistory((await res.json()).history);
			setPage(p);
		} catch (err) {
			console.log(err);
		}
	}

	async function resetToken(e: MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		try {
			const res = await fetch('/api/session/regenerate', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'cookie': cookie,
				},
			});
			setToken((await res.json()).token);
		} catch (err) {
			console.log(err);
		}
	}

	// Create data for pie chart
	const graphData = {
		labels: Object.keys(data),
		datasets: [
			{
				label: 'Accessed',
				data: Object.values(data),
				backgroundColor: [
					'rgb(255, 159, 64)',
					'rgb(255, 205, 86)',
					'rgb(0, 163, 51)',
					'rgb(54, 162, 235)',
					'rgb(153, 102, 255)',
					'rgb(201, 203, 207)',
					'rgb(0,0,255)',
				],
				borderWidth: 1,
			},
		],
	};

	return (
		<>
			<Header />
			<Navbar user={session?.user}/>
			<div className="container-fluid" style={{ padding:'1%' }}>
				{error && (
					<Error text={error} />
				)}
				<div className="row">
					<form className="form-inline">
						<h5>Your token:</h5>
						<div className="input-group mb-3">
							<input type="text" id="myInput" className="form-control" value={token} aria-label="Recipient's username" aria-describedby="basic-addon2" />
							<button className="input-group-text" id="basic-addon2" onClick={(e) => toggleTokenVisibility(e)}><FontAwesomeIcon icon={canSee ? faEyeSlash : faEye} /></button>
						</div>
						<button className="btn btn-primary mb-2" onClick={(e) => copyUserToken(e)}>Copy text</button>
						&nbsp;
						<button className="btn btn-primary mb-2" onClick={(e) => resetToken(e)}>Reset Token</button>
					</form>
					<div className="col-xl-6 col-lg-12">
						<div className="card shadow mb-4">
							<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
								<h4 className="m-0 font-weight-bold text-primary">Access per an Endpoint</h4>
							</div>
							<div className="card-body">
								<Pie data={graphData} />
							</div>
						</div>
					</div>
					<div className="col-xl-6 col-lg-12">
						<div className="card shadow mb-4">
							<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
								<h4 className="m-0 font-weight-bold text-primary">Total Endpoint Usage ({total}):</h4>
							</div>
							<div className="card-body">
								<table className="table" style={{ maxHeight:'400px' }}>
									<thead>
										<tr>
											<th scope="col">#</th>
											<th scope="col">Endpoint:</th>
											<th scope="col">Accessed on:</th>
										</tr>
									</thead>
									<tbody>
										{history.map(_ => (
											<tr key={_.id}>
												<td scope="row">{(page * 50) + history.indexOf(_) + 1}</td>
												<td>{_.endpoint}</td>
												<td>{new Date(_.createdAt).toLocaleString('en-GB', { timeZone: 'UTC' })}</td>
											</tr>
										))}
									</tbody>
								</table>
								<nav aria-label="Page navigation example">
									<p style={{ display: 'inline' }}>Showing results {(page < 1 ? 0 : page) * 50} - {(page * 50) + (history.length < 50 ? history.length : 50)} of {total}</p>
									<ul className="pagination justify-content-center">
										<li className="page-item">
											<button className="page-link" onClick={() => fetchHistory(page == 0 ? page : page - 1)}>
												<FontAwesomeIcon icon={faAnglesLeft} />
											</button>
										</li>
										<li className="page-item">
											<p className="page-link">{page + 1}</p>
										</li>
										<li className="page-item">
											<button className="page-link" onClick={() => fetchHistory(history.length >= 50 ? page + 1 : page)}>
												<FontAwesomeIcon icon={faAnglesRight} />
											</button>
										</li>
									</ul>
								</nav>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

// Fetch basic API usage
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const obj = {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		};
		// Fetch data from API
		const [res1, res2] = await Promise.all([fetch(`${process.env.BACKEND_URL}api/session/history`, obj), fetch(`${process.env.BACKEND_URL}api/session/history/graph`, obj)]);
		const [{ history, total }, { data }] = await Promise.all([res1.json(), res2.json()]);

		return { props: { history, total, data, cookie: ctx.req.headers.cookie as string } };
	} catch (err) {
		return { props: { history: [], error: 'API server currently unavailable' } };
	}

}

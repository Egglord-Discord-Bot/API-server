import { Header, Navbar, Footer, PieChart, CollapsibleCard } from '@/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faAnglesLeft, faAnglesRight, faCircle } from '@fortawesome/free-solid-svg-icons';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getStatusColour } from '@/utils/functions';
import axios from 'axios';
import type { UserHistory } from '@/types';
import type { MouseEvent } from 'react';
import type { ChartData } from 'chart.js';
import { Tooltip as ReactToolTip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function Settings() {
	const { data: session, status } = useSession();

	// Fot toggle visibility of token + update token when regenerated
	const [canSee, setCanSee] = useState(true);
	const [token, setToken] = useState('');
	const [page, setPage] = useState(0);
	const [total, setTotal] = useState(0);
	const [history, setHistory] = useState<Array<UserHistory>>([]);
	const [graph, setGraph] = useState({});

	useEffect(() => {
		// set token
		setToken(session?.user.token as string);

		// Fetch user's history
		(async () => {
			const { data } = await axios.get('/api/session/history');
			setHistory(data.history);
			setTotal(data.total);
		})();

		// Fetch users graph
		(async () => {
			const { data } = await axios.get('/api/session/history/graph');
			setGraph(data.data);
		})();

	}, [status, session?.user.token]);
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
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(copyText.value);
		} else {
			// Use the 'out of viewport hidden text area' trick
			const textArea = document.createElement('textarea');
			textArea.value = copyText.value;

			// Move textarea out of the viewport so it's not visible
			textArea.style.position = 'absolute';
			textArea.style.left = '-999999px';

			document.body.prepend(textArea);
			textArea.select();

			try {
				document.execCommand('copy');
			} catch (error) {
				console.error(error);
			} finally {
				textArea.remove();
			}
		}

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
			const { data } = await axios.get(`/api/session/history?page=${p}`);
			setHistory(data.history);
			setPage(p);
		} catch (err) {
			console.log(err);
		}
	}

	async function resetToken(e: MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		try {
			const { data } = await axios.post('/api/session/regenerate');
			setToken(data.token);
		} catch (err) {
			console.log(err);
		}
	}

	// Create data for pie chart
	const graphData = {
		labels: Object.keys(graph),
		datasets: [
			{
				label: 'Accessed',
				data: Object.values(graph),
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
	} as ChartData<'pie'>;

	return (
		<>
			<Header />
			<Navbar user={session?.user}/>
			<div className="container-fluid" style={{ padding:'1%', minHeight: '84vh' }}>
				<div className="row">
					<form className="form-inline">
						<h5>Your token:</h5>
						<div className="input-group mb-3">
							<input type="password" id="myInput" className="form-control" defaultValue={token} aria-label="Recipient's username" aria-describedby="basic-addon2" />
							<button className="input-group-text" id="basic-addon2" onClick={(e) => toggleTokenVisibility(e)}><FontAwesomeIcon icon={canSee ? faEyeSlash : faEye} /></button>
						</div>
						<button className="btn btn-primary mb-2" onClick={(e) => copyUserToken(e)}>Copy text</button>
						&nbsp;
						<button className="btn btn-primary mb-2" type="button" data-bs-toggle="modal" data-bs-target="#resetPopup">Reset Token</button>
						<div className="modal fade" id="resetPopup" tabIndex={-1} aria-labelledby="staticBackdropLabel" aria-hidden="true">
							<div className="modal-dialog modal-dialog-centered">
								<div className="modal-content">
									<div className="modal-header">
										<h1 className="modal-title fs-5" id="staticBackdropLabel">Token reset</h1>
										<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div className="modal-body">
										Are you sure you want to reset your token?
									</div>
									<div className="modal-footer">
										<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button type="button" className="btn btn-primary" onClick={(e) => resetToken(e)}>Understood</button>
									</div>
								</div>
							</div>
						</div>
					</form>
					<div className="col-xl-6 col-lg-12" style={{ paddingBottom: '15px' }}>
						<CollapsibleCard id={'API_usage'} header={<h5 className="m-0 fw-bold text-primary">Endpoint Usage</h5>}>
							<PieChart data={graphData} />
						</CollapsibleCard>
					</div>
					<div className="col-xl-6 col-lg-12">
						<CollapsibleCard id={'Total_API_usage'} header={<h5 className="m-0 fw-bold text-primary">Total Endpoint Usage ({total}):</h5>}>
							<>
								{history.map(hi => <ReactToolTip key={hi.id} id={`${hi.id}`} place="top" content={`${hi.statusCode}`} variant="dark" />)}
								<table className="table">
									<thead>
										<tr>
											<th scope="col">#</th>
											<th scope="col">Endpoint:</th>
											<th scope="col">Accessed on:</th>
											<th scope="col" style={{ textAlign: 'center' }}>Status</th>
										</tr>
									</thead>
									<tbody>
										{history.map((_, index) => (
											<tr key={_.id}>
												<td scope="row">{(page * 50) + index + 1}</td>
												<td>{_.endpointName}</td>
												<td>{new Date(_.createdAt).toLocaleString('en-GB', { timeZone: 'UTC' })}</td>
												<td style={{ textAlign: 'center' }} data-tooltip-id={`${_.id}`}>
													<FontAwesomeIcon icon={faCircle} style={{ color: getStatusColour(_.statusCode) }}/>
												</td>
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
							</>
						</CollapsibleCard>
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
}

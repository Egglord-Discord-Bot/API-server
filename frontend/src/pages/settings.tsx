import Header from '../components/header';
import Navbar from '../components/navbar/main';
import Error from '../components/error';
import type { GetServerSidePropsContext } from 'next';
import { useSession } from 'next-auth/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
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
	error?: string
}

export default function Settings({ history, error }: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading') return null;

	// Put their token in their clipboard
	function copyUserToken() {
		// Get the text field
		const copyText = document.getElementById('myInput') as HTMLInputElement;

		// Select the text field
		copyText.select();
		// For mobile support
		copyText.setSelectionRange(0, 99999);

		// Copy the text inside the text field
		navigator.clipboard.writeText(copyText.value);

		// Alert the copied text
		alert('Token has been copied');
	}

	// Toggle the inpout field
	function ToggleTokenVisibility() {
		const x = document.getElementById('myInput') as HTMLInputElement;
		x.type = (x.type == 'password') ? 'text' : 'password';
	}

	const counts = {} as countEnum;
	history.forEach((x) => counts[x.endpoint] = (counts[x.endpoint] || 0) + 1);

	// Create data for pie chart
	const data = {
		labels: Object.keys(counts),
		datasets: [
			{
				label: 'Accessed:',
				data: Object.values(counts),
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
				<form className="form-inline">
					<h5>Your token:</h5>
					<div className="form-group mb-2">
						<input className="form-control mb-2 mr-sm-2" type="password" value={'<%= user.token%>'} id="myInput" readOnly />
					</div>
					<input type="checkbox" onClick={() => ToggleTokenVisibility()} />Show Token
					<button className="btn btn-primary mb-2" onClick={() => copyUserToken()}>Copy text</button>
				</form>
				<div className="row">
					<div className="col-lg-6">
						<Pie data={data} />
					</div>
					<div className="col-lg-6">
						<h5>Your endpoint history:</h5>
						<table className="table">
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Endpoint:</th>
									<th scope="col">Accessed at:</th>
								</tr>
							</thead>
							<tbody>
								{history.map(_ => (
									<tr key={_.id}>
										<td>{history.indexOf(_) + 1}</td>
										<td>{_.endpoint}</td>
										<td>{new Date(_.createdAt).toLocaleString('en-GB', { timeZone: 'UTC' })}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	);
}

// Fetch basic API usage
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const resp = await fetch(`${process.env.BACKEND_URL}api/session/history`, {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		});

		const history = await resp.json();
		return { props: { history } };
	} catch (err) {
		return { props: { history: [], error: 'API server currently unavailable' } };
	}

}

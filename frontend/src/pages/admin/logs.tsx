import Header from '../../components/header';
import Sidebar from '../../components/navbar/sidebar';
import AdminNavbar from '../../components/navbar/admin';
import Error from '../../components/error';
import { useSession } from 'next-auth/react';
import type { User } from '../../types/next-auth';
import type { GetServerSidePropsContext } from 'next';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';

interface Props {
  error: string
  logFiles: Array<string>
}

export default function AdminEndpoints({ error, logFiles }: Props) {
	const { data: session, status } = useSession();
	const [logContent, setLogContent] = useState<Array<string>>(['']);
	const [activeLog, setActiveLog] = useState<string>('');
	if (status == 'loading') return null;

	// Format log files so latest is top
	const logFileNames = logFiles.sort((a, b) => {
		const extractNameA = a.match(/[0-9]{4}.[0-9]{2}.[0-9]{2}/g)?.[0];
		const extractNameB = b.match(/[0-9]{4}.[0-9]{2}.[0-9]{2}/g)?.[0];
		return new Date(extractNameB ?? '').getTime() - new Date(extractNameA ?? '').getTime();
	});

	// Update the log file content, so admin can check content of logs
	async function updateLogFileContent(e: SyntheticEvent) {
		const el = e.target as HTMLButtonElement;
		const fileName = el.innerHTML;

		try {
			const res = await fetch(`/api/session/admin/logs/file?name=${fileName}`, {
				method: 'get',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
			});
			const { file } = await res.json();
			setLogContent(file.reverse());
		} catch (err) {
			console.log(err);
			setLogContent(['']);
		}
		setActiveLog(fileName);
	}

	// Update log file content type (INFO, DEBUG etc)
	async function updateViewContentType(e: SyntheticEvent) {
		const el = e.target as HTMLSelectElement;

		// Fetch logs
		const res = await fetch(`/api/session/admin/logs/file?name=${activeLog}`, {
			method: 'get',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		});

		// Get text from file and format it
		const { file } = await res.json() as { file: Array<string> };
		if (el.value == 'ALL') return setLogContent(file.reverse());
		setLogContent(file.reverse().filter(line => line.substring(13).startsWith(el.value)));
	}

	return (
		<>
			<Header />
			<div className="wrapper">
				<Sidebar activeTab='endpoint'/>
				<div id="content-wrapper" className="d-flex flex-column">
					<div id="content">
						<AdminNavbar user={session?.user as User}/>
						<div className="container-fluid" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 64px)', minHeight: 'calc(100vh - 64px)' }}>
							{error && (
								<Error text={error} />
							)}
							<div className="d-sm-flex align-items-center justify-content-between mb-4">
								<h1 className="h3 mb-0 text-gray-800">Logs Dashboard</h1>
							</div>
							<div className="row">
								<div className="col-lg-4" >
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h5 className="m-0 fw-bold text-primary">Log files</h5>
										</div>
										<div className="card-body table-responsive" style={{ overflowY: 'scroll', maxHeight: '75vh', minHeight: '75vh' }}>
  											<table className="table">
  												<tbody>
  													{logFileNames.map(name => (
  														<tr key={logFileNames.indexOf(name)}>
  															<th>
  																<button className={`btn ${activeLog == name ? 'active' : ''}` } onClick={(e) => updateLogFileContent(e)}>{name}</button>
  															</th>
  														</tr>
  													))}
  												</tbody>
  											</table>
  										</div>
									</div>
								</div>
								<div className="col-lg-8">
									<div className="card shadow mb-4">
										<div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
											<h4 className="m-0 font-weight-bold text-primary">Log content</h4>
											<div className="input-group mb-3" style={{ maxWidth: '30%', minWidth: '30%', padding: 0 }}>
												<label className="input-group-text" htmlFor="inputGroupSelect01">Log type</label>
												<select className="form-select" id="inputGroupSelect01" aria-label="Default select example" onChange={(e) => updateViewContentType(e)}>
													<option selected value="ALL">All</option>
													<option value="DEBUG">Debug</option>
													<option value="INFO">Info</option>
													<option value="WARN">Warn</option>
													<option value="ERROR">Error</option>
													<option value="FATAL">Fatal</option>
												</select>
											</div>
										</div>
										<div className="card-body" style={{ overflowY: 'scroll', maxHeight: '75vh', minHeight: '75vh' }}>
											{logContent.map(line => (
												<div key={logContent.indexOf(line)}>{line}</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

// Fetch endpoints
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	try {
		const res = await fetch(`${process.env.BACKEND_URL}api/session/admin/logs`, {
			method: 'get',
			headers: {
				'cookie': ctx.req.headers.cookie as string,
			},
		});

		const { files } = await res.json();
		return { props: { logFiles: files } };
	} catch (err) {
		return { props: { logFiles: [], error: 'API server currently unavailable' } };
	}
}

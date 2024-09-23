import { CollapsibleCard } from '@/components';
import AdminLayout from '@/layouts/Admin';
import { formatBytes } from '@/utils/functions';
import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next/types';
import { useState } from 'react';

interface Props {
	backups: Backup[]
}

type Backup = {
	name: string
	size: number
	creationDate: Date
}

export default function AdminEndpoints({ backups:initialBackups }: Props) {
	const { data: session, status } = useSession({ required: true });
	const [backups, setBackups] = useState(initialBackups);

	async function createDatabaseBackup() {
		try {
			await axios.post('/api/session/admin/database/backups');
			const { data } = await axios.get('/api/session/admin/database/backups');
			setBackups(data.backups);
		} catch (err) {
			console.log(err);
		}
	}

	async function deleteBackup(name: string) {
		try {
			await axios.delete(`/api/session/admin/database/backups/${name}`);
			const { data } = await axios.get('/api/session/admin/database/backups');
			setBackups(data.backups);
		} catch (err) {
			console.log(err);
		}
	}

	async function downloadBackup(name: string) {
		// TODO
		console.log(name);
	}

	if (status == 'loading' || session == null) return null;
	return (
		<AdminLayout user={session.user}>
			<div className="container-fluid" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 64px)', minHeight: 'calc(100vh - 64px)' }}>
        &nbsp;
				<div className="d-sm-flex align-items-center justify-content-between mb-4">
					<h1 className="h3 mb-0 text-gray-800">Settings Dashboard</h1>
					<a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
						<FontAwesomeIcon icon={faDownload} /> Generate Report
					</a>
				</div>
				<div className='row'>
					<div className='col-lg-6'>
						<CollapsibleCard id="MDB_1" header={<h4 className="m-0 font-weight-bold text-primary">Manage Database Backups</h4>}>
							<>
								{
									backups.map(backup => (
										<div key={backup.name} className='d-sm-flex align-items-center justify-content-between mb-4'>
											<p>{backup.name} {formatBytes(backup.size)} ({new Date(backup.creationDate).toDateString()})</p>
											<div>
												<a className='btn btn-outline-secondary' style={{ marginRight: '10px' }} onClick={() => deleteBackup(backup.name)}><FontAwesomeIcon icon={faTrash} /></a>
												<a className='btn btn-outline-secondary' onClick={() => downloadBackup(backup.name)}><FontAwesomeIcon icon={faDownload} /></a>
											</div>
										</div>
									))
								}
								<button className='btn btn-primary' onClick={createDatabaseBackup}>Backup database</button>
							</>
						</CollapsibleCard>
					</div>
					<div className='col-lg-6'>
						<CollapsibleCard id="Config_1" header={<h4 className="m-0 font-weight-bold text-primary">Configuration</h4>}>
							<>
								<div className="mb-3">
									<label htmlFor="exampleInputEmail1" className="form-label">Log file history:</label>
									<input type="number" defaultValue={30} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
									<div id="emailHelp" className="form-text">How many days of logs should be stored.</div>
								</div>
								Add some about proxies here
							</>
						</CollapsibleCard>
					</div>
				</div>
				&nbsp;
			</div>
		</AdminLayout>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const { data } = await axios.get(`${process.env.BACKEND_URL}api/session/admin/database/backups`, {
		method: 'get',
		headers: {
			'cookie': ctx.req.headers.cookie as string,
		},
	});

	return { props: { backups: data.backups } };
}
import { Router } from 'express';
import type Client from '../../../helpers/Client';
import { isAdmin } from '../../../middleware/middleware';
import { Utils } from '../../../utils';
import { exec } from 'child_process';
import fs from 'fs';
const router = Router();

export function run(client: Client) {

	router.patch('/endpoint', isAdmin, async (req, res) => {
		const { name, isBlocked } = req.body;

		try {
			await client.EndpointManager.update({ name, isBlocked });
			res.json({ success: `Successfully updated endpoint: ${name}` });
		} catch (err) {
			client.Logger.error(err);
			res.json({ error: 'Error updating' });
		}
	});

	// JSON response for accessing /admin dashboard page
	router.get('/json', isAdmin, async (_req, res) => {
		try {
			const [hisTotal, userTotal, responseCodes, mostAccessedEndpoints] = await Promise.all([client.UserHistoryManager.fetchCount(),
				client.UserManager.fetchCount(),
				client.ResponseCodeManager.fetchResponseCodeCounts(),
				client.EndpointManager.fetchMostAccessEndpoints(),
			]);

			res.json({ historyCount: hisTotal, userCount: userTotal, responseCodes, mostAccessedEndpoints });
		} catch (err) {
			client.Logger.error(err);
			res.json;
		}
	});

	router.get('/system', isAdmin, async (_req, res) => {
		try {
			const [systemHis, cpu, disk] = await Promise.all([client.SystemHistoryManager.fetchSystemHistoryData(), client.SystemHistoryManager.calculateCPUUsage(), client.SystemHistoryManager.calculateDiskUsage()]);
			const memory = client.SystemHistoryManager.calculateMemoryUsage();

			res.json({
				current: { memory, cpu, disk },
				history: systemHis,
				uptime: process.uptime(),
			});
		} catch (err) {
			client.Logger.error(err);
			res.json({ error: 'An error occured when fetching data' });
		}
	});

	router.get('/backup', isAdmin, async (_req, res) => {
		const mysqlArgs = Utils.parseMySQLConnectionString(process.env.DATABASE_URL as string);
		const backupFolder = `${process.cwd()}/backups`;

		// Check if folder exists
		if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder);

		exec(`mysqldump -u ${mysqlArgs.username} -p${mysqlArgs.password} -n ${mysqlArgs.database} > "${backupFolder}/${new Date().getTime()}.dump.sql"`, (err) => {
			if (err) return res.json({ error: 'An error occured when backing up MySQL data.' });
			res.json({ Success: 'Successfully backed up database.' });
		});
	});

	return router;
}

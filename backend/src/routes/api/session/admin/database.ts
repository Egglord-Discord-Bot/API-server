import { Router } from 'express';
import fs from 'node:fs/promises';
import { isAdmin } from '../../../../middleware';
import { Error, Utils } from '../../../../utils';
import { exec } from 'child_process';
import { Client } from '../../../../helpers';
const router = Router();

export function run(client: Client) {

	router.post('/backups', isAdmin, async (_req, res) => {
		const mysqlArgs = Utils.parseMySQLConnectionString(process.env.DATABASE_URL as string);
		const backupFolder = `${process.cwd()}/backups`;

		try {
			await fs.access(backupFolder);

			exec(`mysqldump -u ${mysqlArgs.username} -p${mysqlArgs.password} -n ${mysqlArgs.database} > "${backupFolder}/${new Date().getTime()}.dump.sql"`, (err) => {
				if (err) return res.json({ error: 'An error occured when backing up MySQL data.' });
				res.json({ Success: 'Successfully backed up database.' });
			});
		} catch (err) {
			client.Logger.error(err);
			Error.GenericError(res, 'Failed to create backup of database.');
		}
	});

	router.get('/backups', isAdmin, async (_req, res) => {
		const folder = `${process.cwd()}/backups`;

		try {
			await fs.access(folder);

			// Get backups
			const files = await fs.readdir(folder);
			const backups = [];

			for (const file of files) {
				const stats = await fs.stat(`${folder}/${file}`);
				if (stats.isFile()) {
					backups.push({
						name: file,
						size: stats.size,
						creationDate: stats.birthtime,
					});
				}
			}

			res.json({ backups });
		} catch (err) {
			client.Logger.error(err);
			res.json({ backups: [] });
		}
	});

	router.delete('/backups/:name', isAdmin, async (req, res) => {
		const folder = `${process.cwd()}/backups`;
		// TODO: VALIDATE FOLDER & FILE NAME

		try {
			await fs.access(folder);
			await fs.rm(`${folder}/${req.params.name}`);
			res.json({ success: `Successfully deleted backup: ${req.params.name}` });
		} catch (err) {
			client.Logger.error(err);
			Error.GenericError(res, 'Failed to delete database backup.');
		}
	});

	return router;
}
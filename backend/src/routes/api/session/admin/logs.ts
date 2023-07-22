import { Router } from 'express';
import { isAdmin } from '../../../../middleware/middleware';
import { Error } from '../../../../utils';
import fs from 'node:fs';
import path from 'path';
const router = Router();

export function run() {

	router.get('/', isAdmin, (_req, res) => {
		const files = fs.readdirSync(`${process.cwd()}/src/utils/logs`);

		res.json({ files });
	});

	router.get('/file', isAdmin, (req, res) => {
		const name = req.query.name as string;
		if (!name) return Error.MissingQuery(res, 'name');

		try {
			const file = fs.readFileSync(`${process.cwd()}/src/utils/logs/${path.basename(name)}`);
			res.json({ file: file.toString().split(/\r?\n/) });
		} catch (err: any) {
			Error.GenericError(res, err.message);
		}
	});
	return router;
}

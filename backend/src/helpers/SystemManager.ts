import os from 'os';
import si from 'systeminformation';
import util from 'node:util';
import { exec } from 'node:child_process';
import SystemHistory from '../database/systemHistory';
const cmd = util.promisify(exec);

export default class SystemManager extends SystemHistory {
	used_bytes: number;
	bandwidth: number;
	constructor() {
		super();
		this.used_bytes = 0,
		this.bandwidth = 0;

		this.init();
	}

	/**
		* Create an endpoint data
		* @returns The new endpoint data
	*/
	async calculateNetworkUsage() {
		// Set initial used network bytes count
		if (this.used_bytes <= 0) this.used_bytes = (await si.networkStats()).reduce((prev, current) => prev + current.rx_bytes, 0);

		// Calculate used bandwidth
		const used_bytes_latest = (await si.networkStats()).reduce((prev, current) => prev + current.rx_bytes, 0);
		this.bandwidth += used_bytes_latest - this.used_bytes;
		this.used_bytes = used_bytes_latest;
		return this.bandwidth;
	}

	/**
		* Get the current memory usage and the system max memory
		* @returns The current memory usage and max memory
	*/
	calculateMemoryUsage() {
		return {
			USAGE: Number(process.memoryUsage().heapUsed.toFixed(2)),
			MAX: Number(os.totalmem().toFixed(2)),
		};
	}

	/**
		* Get the current CPU load
		* @returns The CPU load
	*/
	async calculateCPUUsage() {
		return Math.round(await si.currentLoad().then(l => l.currentLoad));
	}

	/**
		* Calculate the current disk usage and system max
		* @returns The current disk usage and system max
	*/
	async calculateDiskUsage() {
		const platform = process.platform;
		if (platform == 'win32') {
			const { stdout } = await cmd('wmic logicaldisk get size,freespace,caption');
			const parsed = stdout.trim().split('\n').slice(1).map(line => line.trim().split(/\s+(?=[\d/])/));
			const filtered = parsed.filter(d => process.cwd().toUpperCase().startsWith(d[0].toUpperCase()));
			return {
				free: Number(filtered[0][1]),
				total: Number(filtered[0][2]),
			};
		} else if (platform == 'linux') {
			const { stdout } = await cmd('df -Pk --');
			const parsed = stdout.trim().split('\n').slice(1).map(line => line.trim().split(/\s+(?=[\d/])/));
			const filtered = parsed.filter(() => true);
			// Multiply by 1024 cuz linux
			return {
				free: Number(filtered[0][3]) * 1024,
				total: Number(filtered[0][1]) * 1024,
			};
		}
	}

	/**
		* Save the memory and CPU usage to database
	*/
	async saveSystemHistory() {
		const mem = this.calculateMemoryUsage();
		const cpu = await this.calculateCPUUsage();

		await this.create({ memoryUsage: `${mem.USAGE}`, cpuUsage: cpu });
	}

	init() {
		setInterval(async () => {
			// Save the new data
			await this.saveSystemHistory();
		}, 60_000);

		// Check every 5 hours
		setInterval(async () => {
			await this.delete();
			// Delete if older than 7 days
		}, 5 * 3600000);
	}
}

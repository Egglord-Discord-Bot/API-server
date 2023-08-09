export function nFormatter(num: number, digits: number) {
	const lookup = [
		{ value: 1, symbol: '' },
		{ value: 1e3, symbol: 'k' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e9, symbol: 'G' },
		{ value: 1e12, symbol: 'T' },
		{ value: 1e15, symbol: 'P' },
		{ value: 1e18, symbol: 'E' },
	];
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	const item = lookup.slice().reverse().find((i) => num >= i.value);
	return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}

export function formatBytes(bytes: number, decimals = 2) {
	if (bytes <= 0) return '0 Bytes';

	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));

	return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getStatusColour(code: number) {
	switch (code) {
		case 200:
		case 304:
			return 'green';
		case 401:
		case 404:
		case 412:
		case 429:
			return 'orange';
		case 500:
			return 'red';
	}
}

export function convertMiliseconds(miliseconds: number) {
	const	total_seconds = Math.floor(miliseconds);
	const	total_minutes = Math.floor(total_seconds / 60);
	const	total_hours = Math.floor(total_minutes / 60);
	const	days = Math.floor(total_hours / 24);

	const	seconds = total_seconds % 60;
	const	minutes = total_minutes % 60;
	const	hours = total_hours % 24;

	let formatText = '';
	if (days > 0) formatText = formatText.concat(`${days} days `);
	if (hours > 0) formatText = formatText.concat(`${hours} hours `);
	if (minutes > 0) formatText = formatText.concat(`${minutes} minutes `);
	if (days <= 1 && hours <= 1) formatText = formatText.concat(`${seconds} seconds`);

	return formatText;
};

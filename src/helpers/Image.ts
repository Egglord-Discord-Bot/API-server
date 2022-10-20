import Canvas from '@napi-rs/canvas';
import fs from 'node:fs';

export default class Image {
	static async affect(image: Buffer | string) {
		const img = await Canvas.loadImage(image);
		const mainImg = this._getImage('affect');
		const bg = await Canvas.loadImage(mainImg);

		const canvas = Canvas.createCanvas(bg.width, bg.height);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(bg, 0, 0);
		ctx.drawImage(img, 180, 383, 200, 157);

		return canvas.encode('png');
	}

	static _getImage(image: string) {
		return fs.readFileSync(`${process.cwd()}/src/assets/images/${image}.png`);
	}
}
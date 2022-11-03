import Canvas from '@napi-rs/canvas';
import fs from 'node:fs';

type imageParam = Buffer | string

export default class Image {
	static async affect(image: imageParam) {
		const img = await Canvas.loadImage(image);
		const bg = await Canvas.loadImage(Image._getImage('affect'));

		const canvas = Canvas.createCanvas(bg.width, bg.height);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(bg, 0, 0);
		ctx.drawImage(img, 180, 383, 200, 157);

		const result = await canvas.encode('png');
		this.generateImage(result, 'affect');
		return result;
	}

	static async beautiful(image: imageParam) {
		const img = await Canvas.loadImage(image);
		const base = await Canvas.loadImage(Image._getImage('BEAUTIFUL'));

		const canvas = Canvas.createCanvas(376, 400);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(img, 258, 28, 84, 95);
		ctx.drawImage(img, 258, 229, 84, 95);

		const result = await canvas.encode('png');
		this.generateImage(result, 'beautiful');
		return result;
	}

	static async bed(image1: imageParam, image2: imageParam) {

		const avatar = await Canvas.loadImage(image1);
		const avatar1 = await Canvas.loadImage(image2);
		const background = await Canvas.loadImage(Image._getImage('BED'));

		const canvas = Canvas.createCanvas(background.width, background.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		ctx.drawImage(avatar, 25, 100, 100, 100);
		ctx.drawImage(avatar, 25, 300, 100, 100);
		ctx.drawImage(avatar, 53, 450, 70, 70);
		ctx.drawImage(avatar1, 53, 575, 100, 100);

		const result = await canvas.encode('png');
		this.generateImage(result, 'beautiful');
		return result;
	}

	// Get the background image
	static _getImage(image: string) {
		return fs.readFileSync(`${process.cwd()}/assets/${image}.png`);
	}

	// Generate the image to show in the examples folder
	static generateImage(data: Buffer, name: string) {
		if (!fs.existsSync(`${process.cwd()}/src/public/images/${name}.png`)) {
			fs.writeFileSync(`${process.cwd()}/src/public/images/${name}.png`, data);
		}
	}
}

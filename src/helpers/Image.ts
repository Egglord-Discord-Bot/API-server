import Canvas, { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import { GifEncoder } from '@skyra/gifenc';
import type { SKRSContext2D } from '@napi-rs/canvas';
import type { imageParam, getLines } from '../utils/types';

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
		const base = await Canvas.loadImage(Image._getImage('beautiful'));

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
		const background = await Canvas.loadImage(Image._getImage('bed'));

		const canvas = Canvas.createCanvas(background.width, background.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		ctx.drawImage(avatar, 25, 100, 100, 100);
		ctx.drawImage(avatar, 25, 300, 100, 100);
		ctx.drawImage(avatar, 53, 450, 70, 70);
		ctx.drawImage(avatar1, 53, 575, 100, 100);

		const result = await canvas.encode('png');
		this.generateImage(result, 'bed');
		return result;
	}

	static async blur(image: imageParam) {
		const img = await Canvas.loadImage(image);
		const canvas = Canvas.createCanvas(img.width, img.height);
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img, 0, 0, canvas.width / 4, canvas.height / 4);
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(canvas, 0, 0, canvas.width / 4, canvas.height / 4, 0, 0, canvas.width + 5, canvas.height + 5);

		const result = await canvas.encode('png');
		this.generateImage(result, 'blur');
		return result;
	}

	static async changemymind(text: string) {
		const base = await Canvas.loadImage(Image._getImage('changemymind'));
		const canvas = Canvas.createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
		const x = text.length;
		let fontSize = 60;
		if (x <= 15) {
			ctx.translate(310, 365);
		} else if (x <= 30) {
			fontSize = 50;
			ctx.translate(315, 365);
		} else if (x <= 70) {
			fontSize = 40;
			ctx.translate(315, 365);
		} else if (x <= 85) {
			fontSize = 32;
			ctx.translate(315, 365);
		} else if (x < 100) {
			fontSize = 26;
			ctx.translate(315, 365);
		} else if (x < 120) {
			fontSize = 21;
			ctx.translate(315, 365);
		} else if (x < 180) {
			fontSize = 0.0032 * (x * x) - 0.878 * x + 80.545;
			ctx.translate(315, 365);
		} else if (x < 700) {
			fontSize = 0.0000168 * (x * x) - 0.0319 * x + 23.62;
			ctx.translate(310, 338);
		} else {
			fontSize = 7;
			ctx.translate(310, 335);
		}
		ctx.font = `${fontSize}px ROBOTO_REGULAR,NOTO_COLOR_EMOJI`;
		ctx.rotate(-0.39575);

		const lines = Image.getLines({ text, ctx, maxWidth: 345 });
		let i = 0;
		while (i < lines.length) {
			ctx.fillText(lines[i], 10, i * fontSize + 15);
			i++;
		}

		const result = await canvas.encode('png');
		this.generateImage(result, 'changemymind');
		return result;
	}

	static async circle(image: imageParam) {
		const img = await Canvas.loadImage(image);
		const canvas = Canvas.createCanvas(img.width, img.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		Image._circle(ctx, canvas.width, canvas.height);

		const result = await canvas.encode('png');
		this.generateImage(result, 'circle');
		return result;
	}

	static async clyde(text: string) {
		const background = await Canvas.loadImage(Image._getImage('clyde'));
		const canvas = Canvas.createCanvas(background.width, background.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		// Draw text to image
		GlobalFonts.registerFromPath(`${process.cwd()}/src/assets/fonts/Georgia.ttf`, 'Georgia');
		ctx.fillStyle = 'white';
		ctx.font = '15px Georgia';
		ctx.fillText(text.substring(0, 66), 75, 50);

		const result = await canvas.encode('png');
		this.generateImage(result, 'clyde');
		return result;
	}

	static async distracted(image1: imageParam, image2: imageParam, image3 = '') {
		const background = await Canvas.loadImage(Image._getImage('distracted'));
		const avatar1 = await Canvas.loadImage(await Image.circle(image1));
		const avatar2 = await Canvas.loadImage(await Image.circle(image2));
		const avatar3 = image3 ? await Canvas.loadImage(await Image.circle(image3)) : null;

		const canvas = Canvas.createCanvas(background.width, background.height);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(avatar1, 180, 90, 150, 150);
		ctx.drawImage(avatar2, 480, 35, 130, 130);
		if (avatar3) ctx.drawImage(avatar3, 730, 110, 130, 130);

		const result = await canvas.encode('png');
		this.generateImage(result, 'distracted');
		return result;
	}

	static async facepalm(image: imageParam) {
		const layer = await Canvas.loadImage(Image._getImage('facepalm'));
		const canvas = Canvas.createCanvas(632, 357);
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, 632, 357);
		const avatar = await Canvas.loadImage(image);
		ctx.drawImage(avatar, 199, 112, 235, 235);
		ctx.drawImage(layer, 0, 0, 632, 357);

		const result = await canvas.encode('png');
		this.generateImage(result, 'facepalm');
		return result;
	}

	static async invert(image: imageParam) {
		const img = await Canvas.loadImage(image);
		const canvas = Canvas.createCanvas(img.width, img.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);

		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < imgData.data.length; i += 4) {
			imgData.data[i] = 255 - imgData.data[i];
			imgData.data[i + 1] = 255 - imgData.data[i + 1];
			imgData.data[i + 2] = 255 - imgData.data[i + 2];
			imgData.data[i + 3] = 255;
		}

		ctx.putImageData(imgData, 0, 0);

		const result = await canvas.encode('png');
		this.generateImage(result, 'invert');
		return result;
	}

	static async jokeOverHead(image: imageParam) {
		const layer = await Canvas.loadImage(Image._getImage('jokeoverhead'));
		const img = await Canvas.loadImage(image);
		const canvas = Canvas.createCanvas(425, 404);
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, 425, 404);
		ctx.drawImage(img, 125, 130, 140, 135);
		ctx.drawImage(layer, 0, 0, 425, 404);

		const result = await canvas.encode('png');
		this.generateImage(result, 'joke-over-head');
		return result;
	}

	static async kiss(image1: imageParam, image2: imageParam) {
		const canvas = Canvas.createCanvas(768, 574);
		const ctx = canvas.getContext('2d');
		const background = await Canvas.loadImage(Image._getImage('kiss'));
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
		const avatar = await Canvas.loadImage(image1);
		const avatar1 = await Canvas.loadImage(image2);
		ctx.drawImage(avatar1, 370, 25, 200, 200);
		ctx.drawImage(avatar, 150, 25, 200, 200);

		const result = await canvas.encode('png');
		this.generateImage(result, 'kiss');
		return result;
	}

	static async ohno(message: string) {
		const bg = await Canvas.loadImage(Image._getImage('ohno'));
		const canvas = Canvas.createCanvas(1000, 1000);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

		ctx.font = 'bold 50px ROBOTO_REGULAR,NOTO_COLOR_EMOJI';
		ctx.fillStyle = '#000000';

		ctx.fillText(message.length <= 20 ? message : message.substring(0, 20).trim() + '...', 540, 195);

		const result = await canvas.encode('png');
		this.generateImage(result, 'ohno');
		return result;
	}

	static async rip(image: imageParam) {
		const img = await Canvas.loadImage(image);
		const bg = await Canvas.loadImage(Image._getImage('RIP'));
		const canvas = Canvas.createCanvas(244, 253);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(img, 63, 110, 90, 90);

		const result = await canvas.encode('png');
		this.generateImage(result, 'rip');
		return result;
	}

	static async slap(image1: imageParam, image2: imageParam) {
		const canvas = Canvas.createCanvas(1000, 500);
		const ctx = canvas.getContext('2d');
		const background = await Canvas.loadImage(Image._getImage('batslap'));
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
		const avatar = await Canvas.loadImage(image1);
		const avatar1 = await Canvas.loadImage(image2);
		ctx.drawImage(avatar1, 580, 260, 200, 200);
		ctx.drawImage(avatar, 350, 70, 220, 220);

		const result = await canvas.encode('png');
		this.generateImage(result, 'slap');
		return result;
	}

	static async spank(image1: imageParam, image2: imageParam) {
		const canvas = Canvas.createCanvas(500, 500);
		const ctx = canvas.getContext('2d');
		const background = await Canvas.loadImage(Image._getImage('spank'));
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
		const avatar = await Canvas.loadImage(image1);
		const avatar1 = await Canvas.loadImage(image2);
		ctx.drawImage(avatar1, 350, 220, 120, 120);
		ctx.drawImage(avatar, 225, 5, 140, 140);

		const result = await canvas.encode('png');
		this.generateImage(result, 'spank');
		return result;
	}

	static async trigger(image: imageParam) {
		const base = await Canvas.loadImage(Image._getImage('triggered'));
		const img = await Canvas.loadImage(image);
		const GIF = new GifEncoder(256, 310);
		const stream = GIF.createReadStream();
		GIF.start();
		GIF.setRepeat(0);
		GIF.setDelay(15);
		const canvas = Canvas.createCanvas(256, 310);
		const ctx = canvas.getContext('2d');
		const BR = 30;
		const LR = 20;
		let i = 0;
		while (i < 9) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(
				img,
				Math.floor(Math.random() * BR) - BR,
				Math.floor(Math.random() * BR) - BR,
				256 + BR,
				310 - 54 + BR,
			);
			ctx.drawImage(
				base,
				Math.floor(Math.random() * LR) - LR,
				310 - 54 + Math.floor(Math.random() * LR) - LR,
				256 + LR,
				54 + LR,
			);
			GIF.addFrame(ctx as any);
			i++;
		}
		GIF.finish();

		const result: Buffer = await new Promise((resolve, reject) => {
			const data: any[] = [];

			stream.on('data', c => data.push(c));
			stream.on('end', () => resolve(Buffer.concat(data)));
			stream.on('error', reject);
		});

		this.generateImage(result, 'trigger');
		return result;
	}

	static getLines({ text, ctx, maxWidth }: getLines) {
		if (!text) return [];
		if (!ctx) throw new Error('Canvas context was not provided!');
		if (!maxWidth) throw new Error('No max-width provided!');
		const lines = [];

		while (text.length) {
			let i;
			for (i = text.length; ctx.measureText(text.substring(0, i)).width > maxWidth; i -= 1);
			const result = text.substring(0, i);
			let j;
			if (i !== text.length) for (j = 0; result.indexOf(' ', j) !== -1; j = result.indexOf(' ', j) + 1);
			lines.push(result.substring(0, j || result.length));
			text = text.substring(lines[lines.length - 1].length, text.length);
		}

		return lines;
	}

	static async square(colour: string) {
		const canvas = createCanvas(200, 200),
			context = canvas.getContext('2d');
		context.fillStyle = colour;
		context.fillRect(0, 0, 200, 200);
		const result = await canvas.encode('png');
		return result;
	}


	// Get the background image
	static _getImage(image: string) {
		return fs.readFileSync(`${process.cwd()}/src/assets/images/${image}.png`);
	}

	static _circle(ctx: SKRSContext2D, w: number, h: number) {
		ctx.globalCompositeOperation = 'destination-in';
		ctx.beginPath();
		ctx.arc(w / 2, h / 2, h / 2, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
		return ctx;
	}

	// Generate the image to show in the examples folder
	static generateImage(data: Buffer, name: string) {
		const filetype = name == 'trigger' ? '.gif' : '.png';
		if (!fs.existsSync(`${process.cwd()}/src/public/images/${name}${filetype}`)) {
			fs.writeFileSync(`${process.cwd()}/src/public/images/${name}${filetype}`, data);
		}
	}
}

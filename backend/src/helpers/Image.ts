import Canvas, { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import { GifEncoder } from '@skyra/gifenc';
import type { imageParam, getLines } from '../types';
GlobalFonts.registerFromPath(`${process.cwd()}/src/assets/fonts/Georgia.ttf`, 'Georgia');

export default class Image {
	/**
	 * Create a 3000 year meme image
	 * @param {imageParam} image The URL or Buffer of the image
	*/
	static async threeThousandYears(image: imageParam) {
		const [img, bg] = await Promise.all([Canvas.loadImage(image), Canvas.loadImage(Image._getImage('3000years'))]);

		const canvas = Canvas.createCanvas(bg.width, bg.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0);
		ctx.drawImage(img, 461, 127, 200, 200);

		return canvas.encode('png');
	}

	/**
	 * Create a 'Doesnt affect my baby' meme image
	 * @param {imageParam} image The URL or Buffer of the image
	*/
	static async affect(image: imageParam) {
		const [img, bg] = await Promise.all([Canvas.loadImage(image), Canvas.loadImage(Image._getImage('affect'))]);

		const canvas = Canvas.createCanvas(bg.width, bg.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0);
		ctx.drawImage(img, 180, 383, 200, 157);

		return canvas.encode('png');
	}

	/**
	 * Create an approved meme image
	 * @param {imageParam} image The URL or Buffer of the image
	*/
	static async approved(image: imageParam) {
		const [img, bg] = await Promise.all([ Canvas.loadImage(image), Canvas.loadImage(Image._getImage('approved'))]);

		const canvas = Canvas.createCanvas(bg.width, bg.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0, 280, 280);
		ctx.drawImage(bg, 0, 0);

		return canvas.encode('png');
	}

	/**
	 * Create a 'this is beautiful' meme image
	 * @param {imageParam} image The URL or Buffer of the image
	*/
	static async beautiful(image: imageParam) {
		const [img, bg] = await Promise.all([Canvas.loadImage(image), Canvas.loadImage(Image._getImage('beautiful'))]);

		const canvas = Canvas.createCanvas(376, 400);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(img, 258, 28, 84, 95);
		ctx.drawImage(img, 258, 229, 84, 95);

		return canvas.encode('png');
	}

	/**
		* Create a 'Hideous under bed' meme image
		* @param {imageParam} image1 The URL or Buffer of the image
	 	* @param {imageParam} image2 The URL or Buffer of the image
	*/
	static async bed(image1: imageParam, image2: imageParam) {
		const [img1, img2, bg] = await Promise.all([Canvas.loadImage(await Image.circle(image1)), Canvas.loadImage(await Image.circle(image2)), Canvas.loadImage(Image._getImage('bed'))]);

		const canvas = Canvas.createCanvas(bg.width, bg.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(img1, 25, 100, 100, 100);
		ctx.drawImage(img1, 25, 300, 100, 100);
		ctx.drawImage(img1, 53, 450, 70, 70);
		ctx.drawImage(img2, 53, 575, 100, 100);

		return canvas.encode('png');
	}

	/**
		* Make an image blurry
		* @param {imageParam} image The URL or Buffer of the image
	*/
	static async blur(image: imageParam) {
		const img = await Canvas.loadImage(image);
		const canvas = Canvas.createCanvas(img.width, img.height);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(img, 0, 0, canvas.width / 4, canvas.height / 4);
		ctx.filter = 'blur(5px)';
		ctx.drawImage(canvas, 0, 0, canvas.width / 4, canvas.height / 4, 0, 0, canvas.width + 5, canvas.height + 5);

		return canvas.encode('png');
	}

	/**
		* Create a 'change my mind' meme image
		* @param {string} text The text to put on the sign
	*/
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
		ctx.font = `${fontSize}px Georgia`;
		ctx.rotate(-0.39575);

		const lines = Image.getLines({ text, ctx, maxWidth: 345 });
		let i = 0;
		while (i < lines.length) {
			ctx.fillText(lines[i], 10, i * fontSize + 15);
			i++;
		}

		return canvas.encode('png');
	}

	/**
		* Turn the image into a circle
		* @param {imageParam} image The URL or Buffer of the image
	*/
	static async circle(image: imageParam) {
		const img = await Canvas.loadImage(image);
		const canvas = Canvas.createCanvas(img.width, img.height);
		const ctx = canvas.getContext('2d');

		const radius = canvas.width / 2;
		ctx.beginPath();
		ctx.arc(radius, radius, radius, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

		return canvas.encode('png');
	}

	/**
		* Create a discord clyde message meme image
		* @param {imageParam} text The text for the bot to say
	*/
	static async clyde(text: string) {
		const background = await Canvas.loadImage(Image._getImage('clyde'));
		const canvas = Canvas.createCanvas(background.width, background.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		// Draw text to image
		ctx.fillStyle = 'white';
		ctx.font = '15px Georgia';
		ctx.fillText(text.substring(0, 66), 75, 50);

		return canvas.encode('png');
	}

	/**
		* Create a deepfried meme image
		* @param {imageParam} image The URL or Buffer of the image
	*/
	static async deepfry(image: imageParam) {
		const img = await Canvas.loadImage(image);
		const canvas = Canvas.createCanvas(img.width, img.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);

		// Apply image manipulations
		ctx.globalAlpha = 0.5;
		ctx.globalCompositeOperation = 'difference';
		ctx.imageSmoothingEnabled = false;

		// Get the image data
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;

		// Apply pixelation
		const pixelSize = 2;
		for (let y = 0; y < canvas.height; y += pixelSize) {
			for (let x = 0; x < canvas.width; x += pixelSize) {
				const baseIndex = (y * canvas.width + x) * 4;
				const r = data[baseIndex];
				const g = data[baseIndex + 1];
				const b = data[baseIndex + 2];

				// Set the pixel color for the pixelation effect
				for (let py = y; py < y + pixelSize; py++) {
					for (let px = x; px < x + pixelSize; px++) {
						const pixelIndex = (py * canvas.width + px) * 4;
						data[pixelIndex] = r;
						data[pixelIndex + 1] = g;
						data[pixelIndex + 2] = b;
					}
				}
			}
		}

		// Apply posterization
		const levels = 10;
		const step = 255 / (levels - 1);
		for (let i = 0; i < data.length; i += 4) {
			const r = Math.round(data[i] / step) * step;
			const g = Math.round(data[i + 1] / step) * step;
			const b = Math.round(data[i + 2] / step) * step;

			data[i] = r;
			data[i + 1] = g;
			data[i + 2] = b;
		}
		ctx.putImageData(imageData, 0, 0);
		return canvas.encode('png');
	}

	/**
		* Create a distracted meme image
		* @param {imageParam} image1 The URL or Buffer of the image
		* @param {imageParam} image2 The URL or Buffer of the image
		* @param {?imageParam} image3 The URL or Buffer of the image
	*/
	static async distracted(image1: imageParam, image2: imageParam, image3?: imageParam) {
		const [img1, img2, bg] = await Promise.all([Canvas.loadImage(await Image.circle(image1)), Canvas.loadImage(await Image.circle(image2)), Canvas.loadImage(Image._getImage('distracted'))]);
		const img3 = image3 ? await Canvas.loadImage(await Image.circle(image3)) : null;

		const canvas = Canvas.createCanvas(bg.width, bg.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(img1, 180, 90, 150, 150);
		ctx.drawImage(img2, 480, 35, 130, 130);
		if (img3) ctx.drawImage(img3, 730, 110, 130, 130);

		return canvas.encode('png');
	}

	/**
		* Create a face palm meme image
		* @param {imageParam} image The URL or Buffer of the image
	*/
	static async facepalm(image: imageParam) {
		const layer = await Canvas.loadImage(Image._getImage('facepalm'));
		const canvas = Canvas.createCanvas(632, 357);
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, 632, 357);
		const avatar = await Canvas.loadImage(image);
		ctx.drawImage(avatar, 199, 112, 235, 235);
		ctx.drawImage(layer, 0, 0, 632, 357);

		return canvas.encode('png');
	}

	/**
		* Turn an image into a greyscale version
		* @param {imageParam} image The URL or Buffer of the image
	*/
	static async greyscale(image: imageParam) {
		const img = await Canvas.loadImage(image);
		const canvas = Canvas.createCanvas(img.width, img.height);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const pixels = imgData.data;
		for (let i = 0; i < pixels.length; i += 4) {
			const lightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
			pixels[i] = lightness;
			pixels[i + 1] = lightness;
			pixels[i + 2] = lightness;
		}
		ctx.putImageData(imgData, 0, 0);

		return canvas.encode('png');
	}

	/**
		* Turn the image into an inverted version
		* @param {imageParam} image The URL or Buffer of the image
	*/
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

		return canvas.encode('png');
	}

	/**
		* Create a 'joke over head' meme image
		* @param {imageParam} image The URL or Buffer of the image
	*/
	static async jokeOverHead(image: imageParam) {
		const [img, bg] = await Promise.all([Canvas.loadImage(image), Canvas.loadImage(Image._getImage('jokeoverhead'))]);
		const canvas = Canvas.createCanvas(425, 404);
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, 425, 404);
		ctx.drawImage(img, 125, 130, 140, 135);
		ctx.drawImage(bg, 0, 0, 425, 404);

		return canvas.encode('png');
	}

	/**
		* Create a kissing meme image
		* @param {imageParam} image1 The URL or Buffer of the image
		* @param {imageParam} image2 The URL or Buffer of the image
	*/
	static async kiss(image1: imageParam, image2: imageParam) {
		const [img1, img2, bg] = await Promise.all([Canvas.loadImage(await Image.circle(image1)),
			Canvas.loadImage(await Image.circle(image2)), Canvas.loadImage(Image._getImage('kiss'))]);

		const canvas = Canvas.createCanvas(768, 574);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(img1, 150, 25, 200, 200);
		ctx.drawImage(img2, 370, 25, 200, 200);

		return canvas.encode('png');
	}

	/**
		* Create a 'oh no' meme image
		* @param {string} text The URL or Buffer of the image
	*/
	static async ohno(text: string) {
		const bg = await Canvas.loadImage(Image._getImage('ohno'));
		const canvas = Canvas.createCanvas(1000, 1000);
		const ctx = canvas.getContext('2d');

		// TODO: Update text to follow existing style
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'black';
		ctx.font = '15px Georgia';
		ctx.fillText(text.substring(0, 66), 540, 195);
		return canvas.encode('png');
	}

	/**
		* Create a 'RIP' meme image
		* @param {imageParam} image The URL or Buffer of the image
	*/
	static async rip(image: imageParam) {
		const [img, bg] = await Promise.all([Canvas.loadImage(image), Canvas.loadImage(Image._getImage('RIP'))]);

		const canvas = Canvas.createCanvas(244, 253);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(img, 63, 110, 90, 90);

		return canvas.encode('png');
	}

	/**
		* Create a 'bat slap' meme image
		* @param {imageParam} image1 The URL or Buffer of the image
		* @param {imageParam} image2 The URL or Buffer of the image
	*/
	static async slap(image1: imageParam, image2: imageParam) {
		const [img1, img2, bg] = await Promise.all([Canvas.loadImage(await Image.circle(image1)), Canvas.loadImage(await Image.circle(image2)),
			Canvas.loadImage(Image._getImage('batslap'))]);

		const canvas = Canvas.createCanvas(1000, 500);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(img2, 580, 260, 200, 200);
		ctx.drawImage(img1, 335, 50, 220, 220);

		return canvas.encode('png');
	}

	/**
		* Create a 'spank' meme image
		* @param {imageParam} image1 The URL or Buffer of the image
		* @param {imageParam} image2 The URL or Buffer of the image
	*/
	static async spank(image1: imageParam, image2: imageParam) {
		const [img1, img2, bg] = await Promise.all([Canvas.loadImage(await Image.circle(image1)), Canvas.loadImage(await Image.circle(image2)),
			Canvas.loadImage(Image._getImage('spank'))]);

		const canvas = Canvas.createCanvas(500, 500);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(img2, 350, 220, 120, 120);
		ctx.drawImage(img1, 225, 5, 140, 140);

		return canvas.encode('png');
	}

	/**
		* Create a coloured square
		* @param {string} colour The colour for filling the square with
	*/
	static async square(colour: string) {
		const canvas = createCanvas(200, 200),
			context = canvas.getContext('2d');
		context.fillStyle = colour;
		context.fillRect(0, 0, 200, 200);

		return canvas.encode('png');
	}

	/**
		* Create a 'triggered' meme GIF
		* @param {imageParam} image The URL or Buffer of the image
	*/
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

		return result;
	}

	/**
		* Create a 'wanted' meme image
		* @param {imageParam} image The URL or Buffer of the image
	*/
	static async wanted(image: imageParam) {
		const avatar = await Canvas.loadImage(image);

		const canvas = Canvas.createCanvas(500, 500);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(avatar, 350, 220, 120, 120);

		return canvas.encode('png');
	}

	/**
		* Create a 'wasted' meme image
		* @param {imageParam} image The URL or Buffer of the image
	*/
	static async wasted(image: imageParam) {
		const img = await Canvas.loadImage(await Image.greyscale(image));
		const canvas = Canvas.createCanvas(500, 500);
		const ctx = canvas.getContext('2d');

		// Add WASTED text to image
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		const bg = await Canvas.loadImage(Image._getImage('wasted'));
		ctx.drawImage(bg, canvas.width / 2 - 188, canvas.height / 2 - 50, 375, 250);

		return canvas.encode('png');
	}

	/**
		* Create a 'who would win' meme image
		* @param {imageParam} image1 The URL or Buffer of the image
		* @param {imageParam} image2 The URL or Buffer of the image
	*/
	static async whowouldwin(image1: imageParam, image2: imageParam) {
		const [img1, img2, bg] = await Promise.all([Canvas.loadImage(image1), Canvas.loadImage(image2), Canvas.loadImage(Image._getImage('whowouldwin'))]);

		const canvas = Canvas.createCanvas(500, 500);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(img1, 10, 104, 225, 225);
		ctx.drawImage(img2, 270, 104, 225, 225);

		return canvas.encode('png');
	}

	/**
		* Create a 'who would win' meme image
		* @param {getLines} obj The Object
		* @param {string} obj.text The text to add on the canvas
		* @param {SKRSContext2D} obj.ctx The canvas
		* @param {number} obj.maxWidth The max width text can be
	*/
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

	/**
		* Get the required image to create the meme
		* @param {string} imageName The name of the image for creating meme template
	*/
	private static _getImage(imageName: string) {
		return fs.readFileSync(`${process.cwd()}/src/assets/images/${imageName}.png`);
	}
}

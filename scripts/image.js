//global layer management (data funnelling n processing)
class ImageManager {
	x = 128;
	y = 128;
	xOld = 0;
	yOld = 0;
	data = [];
	layer = undefined;

	layers = [
		new LayerSolid(1, "plain"),
		new LayerXorFractal(0.75, "plain"),
		new LayerNoise(0.1, "plain"),
		new LayerBorder(1, "plain")
	];
	
	printImage() {
		//regenerate data array if size will change
		if(this.x * this.y != this.xOld * this.yOld) {
			this.data = new Array(this.x * this.y * 4);
			for(let i = 0; i < img.data.length; i++) {
				img.data[i] = 255;
			}
			this.xOld = this.x;
			this.yOld = this.y;
		}
		
		for(let i = 0; i < this.layers.length; i++) {
			const layer = this.layers[i];
			//this.layer.options = this.layer.defaults;
			layer.generate(layer.options);
		}

		let canvasImg = t.ctx.createImageData(this.x, this.y);

		for(let i = 0; i < this.x * this.y * 4; i++) {
			canvasImg.data[i] = this.data[i];
		}

		t.ctx.putImageData(canvasImg, 0, 0);
	}

	plotPixel(color, x, y, alpha, blend) {
		//color is an array of 4 bytes
		//[red, blue, green, alpha]
		const pos = x + y * this.x;
		
		this.data[pos * 4] = this.combinePixel(color[0], this.data[pos * 4], blend, alpha) * 255;
		this.data[pos * 4 + 1] = this.combinePixel(color[1], this.data[pos * 4 + 1], blend, alpha) * 255;
		this.data[pos * 4 + 2] = this.combinePixel(color[2], this.data[pos * 4 + 2], blend, alpha) * 255;
		this.data[pos * 4 + 3] = color[3];
	}
	
	parseRGB(hex) {
		const r = (hex & 0xFF0000) >> 16;
		const g = (hex & 0x00FF00) >> 8;
		const b = hex & 0x0000FF;
		return [r, g, b, 255];
	}
	
	RGB2Hex(arr) {
		//[255, 255, 255, 255] to #ffffffff
		return "#" + arr[0].toString(16) + arr[1].toString(16) + arr[2].toString(16);
	}
	
	parseHex(hex) {
		//convert #RRGGBB to 0xRRGGBB
		return img.parseRGB(Number("0x" + hex.slice(1)));
	}
	
	combinePixel(l, b, blend, strength) {
		//values are normalized (0 through 1)!!!
		l /= 255;
		b /= 255;

		switch(blend) {
			case "add":
				return (l * strength) + b;
			case "multiply":
			  return ((l * strength) + 1 - strength) * b;
			case "plain":
				//lerp
				return b + strength * (l - b);
			case "screen":
				return 1 - (1 - l * (strength)) * (1 - b);
			case "overlay":
				if(l < 0.5) {
					return this.combinePixel(l * 255, b * 255, "multiply", strength);
				} else {
					return this.combinePixel(l * 255, b * 255, "screen", strength);
				}
		}
	}
}

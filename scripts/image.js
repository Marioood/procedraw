//global layer management (data funnelling n processing)
class ImageManager {
	x = 64;
	y = 64;
	data = [];
	layer = undefined;
	bg = [128, 128, 128, 255];
	layers = [];
	layerClasses = {
		xorFractal: LayerXorFractal,
		solid: LayerSolid,
		noise: LayerNoise,
		border: LayerBorder,
		liney: LayerLiney,
		wandering: LayerWandering,
		checkers: LayerCheckers,
		blobs: LayerBlobs
	};
	
	printImage() {
		let startTime = Date.now();
		//write the background color
		for(let i = 0; i < this.x * this.y; i++) {
			img.data[i * 4] = this.bg[0];
			img.data[i * 4 + 1] = this.bg[1];
			img.data[i * 4 + 2] = this.bg[2];
			img.data[i * 4 + 3] = this.bg[3];
		}
		//layer the layers
		for(let i = 0; i < this.layers.length; i++) {
			if(this.layers[i].od.shown) {
				this.layer = this.layers[i];
				//this.layer.options = this.layer.defaults;
				this.layer.generate(this.layer.options);
			}
		}
		//canvas stuff
		let canvasImg = t.ctx.createImageData(this.x, this.y);
		//write to canvas data
		for(let i = 0; i < this.x * this.y * 4; i++) {
			canvasImg.data[i] = this.data[i];
		}
		//insert new image data
		t.ctx.putImageData(canvasImg, 0, 0);
		let renderTime = Date.now() - startTime;
		
		document.getElementById("render-time").textContent = "render time: " + renderTime + "ms";
	}
	
	updateSize() {
		//if the width or height is too big then i predict that everything will expode
		if(this.x > 256) {
			this.x = 256;
			console.log("hey, quit doing that!");
		}
		if(this.y > 256) {
			this.y = 256;
			console.log("hey, quit doing that!");
		}
		this.data = new Array(this.x * this.y * 4);
	}

	plotPixel(color, x, y) {
		//drop the pixel if its out of bounds
		if(x < 0 || x >= this.x || y < 0 || y >= this.y) return;
		//get alpha n blend from global memory... its less to type
		const alpha = this.layer.od.alpha * (color[3] / 255);
		const blend = this.layer.od.blend;
		const tint = this.layer.od.tint;
		//color is an array of 4 bytes
		//[red, blue, green, alpha]
		const pos = x + y * this.x;
		//todo: actually have alpha CHANNEL affect (effect? idk) the color, not just the layer's alpha
		this.data[pos * 4] = this.combinePixel((color[0] / 255) * (tint[0] / 255), this.data[pos * 4], blend, alpha) * 255;
		this.data[pos * 4 + 1] = this.combinePixel((color[1] / 255) * (tint[1] / 255), this.data[pos * 4 + 1], blend, alpha) * 255;
		this.data[pos * 4 + 2] = this.combinePixel((color[2] / 255) * (tint[2] / 255), this.data[pos * 4 + 2], blend, alpha) * 255;
		//add the alphas together
		this.data[pos * 4 + 3] = (color[3] * alpha) + this.data[pos * 4 + 3];
	}
	
	combinePixel(l, b, blend, strength) {
		//values are normalized (0 through 1)
		//l /= 255;
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
				return 1 - (1 - l * strength) * (1 - b);
			case "overlay":
				//fuck you wikipedia
				if(l < 0.5) {
					return (2 * (l * strength) + 1 - strength) * b;
				} else {
					return 1 - (1 - l * strength) * ((strength + 1) * (1 - b));
				}
		}
	}
	
	parseRGB(hex) {
		const r = (hex & 0xFF0000) >> 16;
		const g = (hex & 0x00FF00) >> 8;
		const b = hex & 0x0000FF;
		return [r, g, b, 255];
	}
	
	RGB2Hex(arr) {
		//[255, 255, 255, 255] to #ffffff (no alpha - do dat later)
		let r = arr[0].toString(16);
		let g = arr[1].toString(16);
		let b = arr[2].toString(16);
		//padding so all colors are the same length (black was encoded as #000 instead of #000000!!)
		if(r.length < 2) r = "0" + r;
		if(g.length < 2) g = "0" + g;
		if(b.length < 2) b = "0" + b;
		return "#" + r + g + b;
	}
	
	parseHex(hex) {
		//convert #RRGGBB to 0xRRGGBB
		return img.parseRGB(Number("0x" + hex.slice(1)));
	}
}

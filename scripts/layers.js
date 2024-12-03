//layer classes (data processing)
/*
default layer options are stored in a layer class as "options" object
new options are passed into generate() as "o" (short for options)
*/
class Layer {
	constructor(alpha, blend) {
		this.od.blend = blend;
		this.od.alpha = alpha;
	}
	//layer options
	options = {};
	//setting types (for the editor input types)
	//basically what the options are displayed as (color or number? decimal or integer?)
	types = {};
	//short for "options default" cause do was taken apparent
	od = {
		//the translucency of the layer (0 is transparent, 1 is opaque)
		alpha: 0,
		//blend mode
		blend: "plain"
	};
	
	typesDefault = {
		alpha: {
			type: "number",
			decimal: true,
			min: 0,
			max: 1
		},
		blend: {
			type: "dropdown",
			items: [
				"add",
				"multiply",
				"plain",
				"screen",
				"overlay"
			]
		}
	};
	
	generate(o) {
		//o is short for "options"
		//maybe remove? options will always be taken from this object.... so its kinda redundant
		//these aint static and are created AS the layers, so im not sure why i did it like that
	}
}

class LayerXorFractal extends Layer {
	options = {
		scaleX: 4,
		scaleY: 4,
		normalized: false
	};
	
	types = {
		scaleX: {
			type: "number",
			decimal: true
		},
		scaleY: {
			type: "number",
			decimal: true
		},
		normalized: {
			type: "boolean"
		}
	};
	
	generate(o) {
		let scaleX, scaleY;
		if(o.normalized) {
			scaleX = 256 / img.x;
			scaleY = 256 / img.y;
		} else {
			scaleX = o.scaleX;
			scaleY = o.scaleY;
		}
		
		for(let y = 0; y < img.y; y++) {
			for(let x = 0; x < img.x; x++) {
				let col = (x * scaleX) ^ (y * scaleY);
				img.plotPixel([col, col, col, 255], x, y, this.od.alpha, this.od.blend);
			}
		}
	}
}

class LayerSolid extends Layer {
	options = {
		color: [127, 127, 127, 255]
	};
	
	types = {
		color: {
			type: "color"
		}
	};
	
	generate(o) {
		for(let y = 0; y < img.y; y++) {
			for(let x = 0; x < img.x; x++) {
				img.plotPixel(o.color, x, y, this.od.alpha, this.od.blend);
			}
		}
	}
}

class LayerNoise extends Layer {
	generate(o) {
		for(let y = 0; y < img.y; y++) {
			for(let x = 0; x < img.x; x++) {
				let col = Math.random() * 255;
				img.plotPixel([col, col, col, 255], x, y, this.od.alpha, this.od.blend);
			}
		}
	}
}

class LayerBorder extends Layer {
	options = {
		colorTop: [255, 255, 255, 255],
		colorBottom: [0, 0, 0, 255],
		colorLeft: [191, 191, 191, 255],
		colorRight: [63, 63, 63, 255],
		x0: 0,
		y0: 0,
		x1: 63,
		y1: 63
	};
	
	types = {
		colorTop: {
			type: "color"
		},
		colorBottom: {
			type: "color"
		},
		colorLeft: {
			type: "color"
		},
		colorRight: {
			type: "color"
		},
		x0: {
			type: "number",
			min: 0
		},
		y0: {
			type: "number",
			min: 0
		},
		x1: {
			type: "number",
			min: 0
		},
		y1: {
			type: "number",
			min: 0
		}
	};

	generate(o) {
		let x0, y0, x1, y1;
		
		if(o.x0 < o.x1) {
			x0 = o.x0;
			x1 = o.x1;
		} else {
			x0 = o.x1;
			x1 = o.x0;
		}
		
		if(o.y0 < o.y1) {
			y0 = o.y0;
			y1 = o.y1;
		} else {
			y0 = o.y1;
			y1 = o.y0;
		}
		
		for(let x = x0 + 1; x <= x1 - 1; x++) {
			img.plotPixel(o.colorTop, x, y0, this.od.alpha, this.od.blend);
			img.plotPixel(o.colorBottom, x, y1, this.od.alpha, this.od.blend);
		}
		for(let y = y0; y <= y1; y++) {
			img.plotPixel(o.colorLeft, x0, y, this.od.alpha, this.od.blend);
			img.plotPixel(o.colorRight, x1, y, this.od.alpha, this.od.blend);
		}
	}
}

/*class Liney{
	constructor(breaks = 0.5, depth = 2, brightness = 1, go2x = X) {
		this.depth = depth;
		this.breaks = breaks;
		this.brightness = brightness;
		this.xDir = go2x;
	}
	
	getCol() {
		return Math.round((Math.random() * this.brightness) * this.depth) / this.depth;
	}
	
	generate() {
		let lines = new Array(IMG_SIZE);
		let maxL, maxI;

		if(this.xDir) {
			maxL = WIDTH;
			maxI = HEIGHT;
		} else {
			maxL = HEIGHT;
			maxI = WIDTH;
		}
		for(let i = 0; i < maxI; i++) {
			let col = this.getCol();
			for(let l = 0; l < maxL; l++) {
				if(Math.random() < this.breaks) {
					col = this.getCol();
				}
				if(this.xDir) {
					lines[l + (i * WIDTH)] = col;
				} else {
					lines[i + (l * WIDTH)] = col;
				}
			}
		}
		for(let i = 0; i < IMG_SIZE; i++) {
			let col = 0;
			col = lerp(0, 255, lines[i]);
			
			layerData[i * 4] = col;
			layerData[i * 4 + 1] = col;
			layerData[i * 4 + 2] = col;
			layerData[i * 4 + 3] = 255;
		}
	}
}

class Wandering{
	constructor(color, maxLines = 4, go2X = X, spread = 0.5, variance = 2, bias = 0.5) {
		this.color = color;
		if(go2X) {
			maxLines *= DIF_X;
		} else {
			maxLines *= DIF_Y;
		}
		this.maxLines = maxLines;
		this.spread = spread;
		this.variance = variance;
		this.go2X = go2X;
		this.bias = bias;
	}
	
	generate() {
		let lines = new Array(IMG_SIZE);
		let maxN;

		if(this.go2X) {
			maxN = WIDTH;
		} else {
			maxN = HEIGHT;
		}
		
		for(let i = 0; i < this.maxLines; i++) {
			let pos = Math.round(i * (maxN / this.maxLines) + (Math.random() - 0.5) * this.variance + this.maxLines / 2);
			for(let n = 0; n < maxN; n++) {
				if(this.go2X) {
					lines[n + pos * WIDTH] = 1;
				} else {
		 		 	lines[pos + n * WIDTH] = 1;
				}
				if(Math.random() < this.spread) {
					if(Math.random() < this.bias) {
						pos++;
					} else {
						pos--;
					}
					//pos += Math.round((Math.random() - 0.5) * 3);
					pos %= maxN;
				}
			}
		}
		let col = hex2arr(this.color);
		
		for(let i = 0; i < IMG_SIZE; i++) {
			let r = 0;
			let g = 0;
			let b = 0;
			let a = 0;
			if(lines[i] == 1) {
				r = col[0];
				g = col[1];
				b = col[2];
				a = 255;
			}
			
			layerData[i * 4] = r;
			layerData[i * 4 + 1] = g;
			layerData[i * 4 + 2] = b;
			layerData[i * 4 + 3] = a;
		}
	}
}*/
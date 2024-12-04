//layer classes (data processing)
/*
default layer options are stored in a layer class as "options" object
new options are passed into generate() as "o" (short for options)
*/
class Layer {
	//class name - dont change this when naming layers is added, just call that one "displayName"
	name;
	//layer options
	options = {};
	//setting types (for the editor input types)
	//basically what the options are displayed as (color or number? decimal or integer?)
	types = {};
	//short for "options default" cause do was taken apparent
	od = {
		//the translucency of the layer (0 is transparent, 1 is opaque)
		alpha: 1,
		//blend mode
		blend: "plain"
	};
	
	typesDefault = {
		alpha: {
			type: "number",
			step: 0.05,
			min: 0,
			max: 1
		},
		blend: {
			type: "dropdown",
			items: [
				"plain",
				"add",
				"multiply",
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
	name = "xorFractal";
	
	options = {
		scaleX: 1,
		scaleY: 1,
		normalized: true
	};
	
	types = {
		scaleX: {
			type: "number",
			step: 0.1
		},
		scaleY: {
			type: "number",
			step: 0.1
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
	name = "solid";
	
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
	name = "noise";
	
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
	name = "border";
	
	options = {
		colorTop: [255, 255, 255, 255],
		colorBottom: [0, 0, 0, 255],
		colorLeft: [191, 191, 191, 255],
		colorRight: [63, 63, 63, 255],
		x0: 0,
		y0: 0,
		x1: 63,
		y1: 63,
		thickness: 1
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
			type: "number"
		},
		y0: {
			type: "number"
		},
		x1: {
			type: "number"
		},
		y1: {
			type: "number"
		},
		thickness: {
			type: "number",
			min: 1
		}
	};
	
	generate(o) {
		let x0, y0, x1, y1;
		//dont make the borders inside-out -- they dont work that way
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
		//just draw the border multiple times to do a thicker one
		for(let i = 0; i < o.thickness; i++) {
			for(let x = x0 + 1; x < x1; x++) {
				img.plotPixel(o.colorTop, x, y0, this.od.alpha, this.od.blend);
				img.plotPixel(o.colorBottom, x, y1, this.od.alpha, this.od.blend);
			}
			for(let y = y0 + 1; y < y1; y++) {
				img.plotPixel(o.colorLeft, x0, y, this.od.alpha, this.od.blend);
				img.plotPixel(o.colorRight, x1, y, this.od.alpha, this.od.blend);
			}
			//corners
			img.plotPixel(this.blend(o.colorLeft, o.colorTop), x0, y0, this.od.alpha, this.od.blend);
			img.plotPixel(this.blend(o.colorRight, o.colorTop), x1, y0, this.od.alpha, this.od.blend);
			img.plotPixel(this.blend(o.colorLeft, o.colorBottom), x0, y1, this.od.alpha, this.od.blend);
			img.plotPixel(this.blend(o.colorRight, o.colorBottom), x1, y1, this.od.alpha, this.od.blend);
			x0++;
			y0++;
			x1--;
			y1--;
		}
	}
	
	blend(col0, col1) {
		const r = (col0[0] + col1[0]) / 2;
		const g = (col0[1] + col1[1]) / 2;
		const b = (col0[2] + col1[2]) / 2;
		const a = (col0[3] + col1[3]) / 2;
		return [r, g, b, a];
	}
}

class LayerLiney extends Layer {
	name = "liney";
	
	options = {
		breaks: 0.5,
		depth: 2,
		brightness: 1,
		go2x: true
	}
	
	types = {
		breaks: {
			type: "number",
			step: 0.05,
			max: 1,
			min: 0
		},
		depth: {
			type: "number",
			max: 255,
			min: 1
		},
		brightness: {
			type: "number",
			step: 0.05,
			max: 1,
			min: 0
		},
		go2x: {
			type: "boolean"
		}
	}
	
	generate(o) {
		let maxL, maxI;

		if(o.go2x) {
			maxL = img.x;
			maxI = img.y;
		} else {
			maxL = img.y;
			maxI = img.x;
		}
		
		for(let i = 0; i < maxI; i++) {
			let col = 0.5;
			for(let l = 0; l < maxL; l++) {
				if(Math.random() < o.breaks || l == 0) {
					col = Math.round((Math.random() * o.brightness) * o.depth) / o.depth * 255;
				}
				let x, y;
				if(o.go2x) {
					x = l;
					y = i;
				} else {
					x = i;
					y = l;
				}
				
				img.plotPixel([col, col, col, 255], x, y, this.od.alpha, this.od.blend);
			}
		}
	}
}

class LayerWandering extends Layer{
	name = "wandering";
	
	options = {
		color: [255, 255, 255, 255],
		maxLines: 4,
		go2X: true,
		spread: 0.5,
		variance: 2,
		bias: 0.5
	}
	
	types = {
		color: {
			type: "color"
		},
		maxLines: {
			type: "number",
			min: 1
		},
		go2X: {
			type: "boolean"
		},
		spread: {
			type: "number",
			step: 0.05,
			max: 1,
			min: 0
		},
		variance: {
			type: "number",
			min: 0
		},
		bias: {
			type: "number",
			step: 0.05,
			max: 1,
			min: 0
		}
	}
	
	generate(o) {
		//variance is kinda funky
		//lines are supposed to wrap around, they do not
		let maxN, inverseMaxN;

		if(o.go2X) {
			maxN = img.x;
			inverseMaxN = img.y;
		} else {
			maxN = img.y;
			inverseMaxN = img.x;
		}
		
		for(let i = 0; i < o.maxLines; i++) {
			let pos = Math.round((i + 0.5) * (inverseMaxN / o.maxLines) + (Math.random() - 0.5) * o.variance);
			for(let n = 0; n < maxN; n++) {
				let x, y;
				
				if(o.go2X) {
					x = n;
					y = pos;
				} else {
					x = pos;
					y = n;
				}
				
				img.plotPixel(o.color, x, y, this.od.alpha, this.od.blend);
				
				if(Math.random() < o.spread) {
					if(Math.random() < o.bias) {
						pos++;
					} else {
						pos--;
					}
					pos %= inverseMaxN;
				}
			}
		}
	}
}
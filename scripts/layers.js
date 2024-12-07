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
		blend: "plain",
		//multiply the image by a color
		tint: [255, 255, 255, 255],
		shown: true
		//maybe add "disolve"? like the coverage option from the noise filter
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
		},
		tint: {
			type: "color",
			external: true,
			brotherId: "dyn-icon-tint-"
		},
		shown: {
			type: "boolean",
			external: true,
			brotherId: "dyn-layer-eye-"
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
				img.plotPixel([col, col, col, 255], x, y);
			}
		}
	}
}

class LayerSolid extends Layer {
	name = "solid";
	
	generate(o) {
		for(let y = 0; y < img.y; y++) {
			for(let x = 0; x < img.x; x++) {
				img.plotPixel([255, 255, 255, 255], x, y);
			}
		}
	}
}

class LayerNoise extends Layer {
	name = "noise";
	
	options = {
		coverage: 1
	};
	
	types = {
		coverage: {
			type: "number",
			min: 0,
			max: 1,
			step: 0.05
		}
	};
	
	generate(o) {
		for(let y = 0; y < img.y; y++) {
			for(let x = 0; x < img.x; x++) {
				if(o.coverage > Math.random()) {
					let col = Math.random() * 255;
					img.plotPixel([col, col, col, 255], x, y);
				}
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
			type: "number",
			min: -256,
			max: 512,
			unsafe: true
		},
		y0: {
			type: "number",
			min: -256,
			max: 512,
			unsafe: true
		},
		x1: {
			type: "number",
			min: -256,
			max: 512,
			unsafe: true
		},
		y1: {
			type: "number",
			min: -256,
			max: 512,
			unsafe: true
		},
		thickness: {
			type: "number",
			min: 1,
			max: 256,
			unsafe: true
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
				img.plotPixel(o.colorTop, x, y0);
				img.plotPixel(o.colorBottom, x, y1);
			}
			for(let y = y0 + 1; y < y1; y++) {
				img.plotPixel(o.colorLeft, x0, y);
				img.plotPixel(o.colorRight, x1, y);
			}
			//corners
			img.plotPixel(this.blend(o.colorLeft, o.colorTop), x0, y0);
			img.plotPixel(this.blend(o.colorRight, o.colorTop), x1, y0);
			img.plotPixel(this.blend(o.colorLeft, o.colorBottom), x0, y1);
			img.plotPixel(this.blend(o.colorRight, o.colorBottom), x1, y1);
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
				
				img.plotPixel([col, col, col, 255], x, y);
			}
		}
	}
}

class LayerWandering extends Layer{
	name = "wandering";
	
	options = {
		spacing: 8,
		go2X: true,
		spread: 0.5,
		variance: 2,
		bias: 0.5,
		thickness: 1
	}
	
	types = {
		spacing: {
			type: "number",
			min: 1,
			max: 256,
			unsafe: true
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
		},
		thickness: {
			type: "number",
			min: 1,
			max: 16,
			unsafe: true
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
		const maxLines = inverseMaxN / o.spacing;
		
		for(let i = 0; i < maxLines; i++) {
			let pos = Math.round((i + 0.5) * o.spacing + (Math.random() - 0.5) * o.variance);
			for(let n = 0; n < maxN; n++) {
				let x, y;
				
				if(o.go2X) {
					x = n;
					y = pos;
				} else {
					x = pos;
					y = n;
				}
				if(o.thickness == 1) {
					img.plotPixel([255, 255, 255, 255], x, y);
				} else {
					for(let s = 0; s < o.thickness; s++) {
						if(o.go2X) {
							img.plotPixel([255, 255, 255, 255], x, y + s);
						} else {
							img.plotPixel([255, 255, 255, 255], x + s, y);
						}
					}
				}
				
				if(Math.random() < o.spread) {
					if(Math.random() < o.bias) {
						pos++;
					} else {
						pos--;
					}
					pos %= inverseMaxN;
					//wrap if negative
					if(pos < 0) {
						pos += inverseMaxN;
					}
				}
			}
		}
	}
}
	
class LayerCheckers extends Layer {
	name = "checkers";
	
	options = {
		evenColor: [255, 255, 255, 255],
		oddColor: [0, 0, 0, 255],
		scaleX: 1,
		scaleY: 1
	};
	
	types = {
		evenColor: {
			type: "color"
		},
		oddColor: {
			type: "color"
		},
		scaleX: {
			type: "number"
		},
		scaleY: {
			type: "number"
		}
	};
	
	generate(o) {
		for(let y = 0; y < img.y; y++) {
			for(let x = 0; x < img.x; x++) {
				let col = (Math.floor(x / o.scaleX) + Math.floor(y / o.scaleY)) % 2 == 0 ? o.evenColor : o.oddColor;
				img.plotPixel(col, x, y);
			}
		}
	}
}
	
/*class LayerPerlin extends Layer {
	name = "perlin";
	
	lerp(a, b, t) {
		return a + t * (b - a);
	}
	//[Math.random(), Math.random()];
	perlin(x, y) {
		
	}

	generate(o) {
		//fuck you wikipedia
		//fuck you ken perlin
		for(let y = 0; y < img.y; y++) {
			for(let x = 0; x < img.x; x++) {
				
			}
		}
	}
}*/

class LayerBlobs extends Layer {
	name = "blobs";
	
	options = {
		spacing: 8,
		minDiameter: 8,
		maxDiameter: 8,
		fade: false
	};
	
	types = {
		spacing: {
			type: "number",
			min: 2,
			max: 256,
			unsafe: true
		},
		minDiameter: {
			type: "number",
			min: 1,
			max: 32,
			unsafe: true
		},
		maxDiameter: {
			type: "number",
			min: 1,
			max: 32,
			unsafe: true
		},
		fade: {
			type: "boolean"
		}
	};
	
	generate(o) {
		const blobCount = (img.x / o.spacing) * (img.y / o.spacing);
		
		for(let i = 0; i < blobCount; i++) {
			//random diameter
			let d = Math.random() * (o.maxDiameter - o.minDiameter) + o.minDiameter;
			//add 0.5 so the blobs arent 1 pixel smaller than they suppsoed to be
			let r = d / 2 + 0.5;
			let xStart = Math.floor(Math.random() * img.x);
			let yStart = Math.floor(Math.random() * img.y);
			
			for(let yi = -r; yi < r; yi++) {
				for(let xi = -r; xi < r; xi++) {
					//subtract 0.5 to make the blobs rounder
					const dist = Math.sqrt(xi * xi + yi * yi);
					if(dist < r - 0.5) {
						//wrap pixels around the edge (maybe make this a default option? or default in plotPixel??)
						let x = Math.floor(xi + xStart) % img.x;
						let y = Math.floor(yi + yStart) % img.y;
						if(x < 0) x += img.x;
						if(y < 0) y += img.y;
						if(o.fade) {
							img.plotPixel([255, 255, 255, ((r - dist) / r) * 255], x, y);
						} else {
							img.plotPixel([255, 255, 255, 255], x, y);
						}
					}
				}
			}
		}
	}
}
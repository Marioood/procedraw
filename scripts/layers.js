"use strict";
//layer classes (data processing)
/*
default layer options are stored in a layer class as "options" object
new options are passed into generate() as "o" (short for options)
*/
class Layer {
	//class name
	name;
	//user defined name
	displayName;
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
		blend: BLEND_PLAIN,
		//multiply the image by a color
		tint: [1, 1, 1, 1],
		//depth: 255,
		shown: true
		//maybe add "disolve"? like the coverage option from the noise filter
	};
	
	//filters = [new FilterInvert()];
	
	typesDefault = {
		alpha: {
			type: "number",
			step: 0.01,
			min: 0,
			max: 1
		},
		blend: {
			type: "keyvalues",
			keys: [
				"plain",
				"add",
				"multiply",
				"screen",
				"overlay"
			],
			values: [
				BLEND_PLAIN,
				BLEND_ADD,
				BLEND_MULTIPLY,
				BLEND_SCREEN,
				BLEND_OVERLAY
			]
		},
		tint: {
			type: "color",
			external: true,
			brotherId: "dyn-icon-tint-"
		},
		shown: {
			type: "boolean",
			hidden: true
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
			scaleX = 256 / img.w;
			scaleY = 256 / img.h;
		} else {
			scaleX = o.scaleX;
			scaleY = o.scaleY;
		}
		
		for(let y = 0; y < img.h; y++) {
			for(let x = 0; x < img.w; x++) {
				let col = ((x * scaleX) ^ (y * scaleY)) / 255;
				img.plotPixel([col, col, col, 1], x, y);
			}
		}
	}
}

class LayerSolid extends Layer {
	name = "solid";
	
	generate(o) {
		for(let y = 0; y < img.h; y++) {
			for(let x = 0; x < img.w; x++) {
				img.plotPixel([1, 1, 1, 1], x, y);
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
		for(let y = 0; y < img.h; y++) {
			for(let x = 0; x < img.w; x++) {
				if(o.coverage > Math.random()) {
					let col = Math.random();
					img.plotPixel([col, col, col, 1], x, y);
				}
			}
		}
	}
}

class LayerBorder extends Layer {
	name = "border";
	
	options = {
		colorTop: [1, 1, 1, 1],
		colorBottom: [0, 0, 0, 1],
		colorLeft: [0.75, 0.75, 0.75, 1],
		colorRight: [0.25, 0.25, 0.25, 1],
		x0: 0,
		y0: 0,
		x1: 63,
		y1: 63,
		thickness: 1,
		tileX: false,
		tileY: false,
		paddingX: 1,
		paddingY: 1,
		shiftX: 0,
		shiftY: 0
		//alphaFalloff: 0
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
		},
		tileX: {
			type: "boolean",
			unsafe: true
		},
		tileY: {
			type: "boolean",
			unsafe: true
		},
		paddingX: {
			type: "number"
		},
		paddingY: {
			type: "number"
		},
		shiftX: {
			type: "number"
		},
		shiftY: {
			type: "number"
		}/*,
		alphaFalloff: {
			type: "number",
			step: 0.01,
			min: 0,
			max: 1
		}*/
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
		const width = x1 - x0 + o.paddingX;
		const height = y1 - y0 + o.paddingY;
		let xCopies = 1;
		let yCopies = 1;
		let x0Old = x0;
		let x1Old = x1;
		let y0Old = y0;
		let y1Old = y1;
		//if the pin coords are equal then the browser explodes (infinite loop)
		if(o.tileX && x0 != x1) xCopies = Math.ceil(img.w / width);
		if(o.tileY && y0 != y1) yCopies = Math.ceil(img.h / height);
		//let oldAlpha = this.od.alpha;
		
		for(let yT = 0; yT < yCopies; yT++) {
			for(let xT = 0; xT < xCopies; xT++) {
				x0 = x0Old;
				x1 = x1Old;
				y0 = y0Old;
				y1 = y1Old;
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
					//this.od.alpha -= o.alphaFalloff;
				}
				//jank but ehhhh it works
				if(o.tileX) {
					x0Old += width;
					x1Old += width;
					y0Old += o.shiftY;
					y1Old += o.shiftY;
				}
				//disgusting hack to get alpha falloff to work (without having to fiddle with a bunch of arrays)
				//this.od.alpha = oldAlpha;
			}
			if(o.tileY) {
				y0Old -= o.shiftY * height;
				y1Old -= o.shiftY * height;
				y0Old += height;
				y1Old += height;
				x0Old += o.shiftX;
				x1Old += o.shiftX;
				if(o.tileX) {
					//shift back x pins
					x0Old -= width * xCopies;
					x1Old -= width * xCopies;
				}
			}
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
		depth: 3,
		brightness: 1,
		dir: true,
		lowColor: [0, 0, 0, 1],
		highColor: [1, 1, 1, 1]
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
			max: 2,
			min: 0
		},
		dir: {
			type: "boolean",
			direction: true
		},
		lowColor: {
			type: "color"
		},
		highColor: {
			type: "color"
		}
	}
	
	generate(o) {
		let maxL, maxI;

		if(o.dir) {
			maxL = img.w;
			maxI = img.h;
		} else {
			maxL = img.h;
			maxI = img.w;
		}
		
		for(let i = 0; i < maxI; i++) {
			let col = 0.5;
			for(let l = 0; l < maxL; l++) {
				if(Math.random() < o.breaks || l == 0) {
					col = Math.round((Math.random() * o.brightness) * o.depth) / o.depth;
				}
				let x, y;
				if(o.dir) {
					x = l;
					y = i;
				} else {
					x = i;
					y = l;
				}
				
				img.plotPixel(img.blend(o.lowColor, o.highColor, col), x, y);
				//img.plotPixel([col, col, col, 1], x, y);
			}
		}
	}
}

class LayerWandering extends Layer{
	name = "wandering";
	
	options = {
		spacing: 8,
		dir: true,
		spread: 0.5,
		variance: 8,
		bias: 0.5,
		thickness: 1,
		wrapFix: true
	}
	
	types = {
		spacing: {
			type: "number",
			min: 1,
			max: 256,
			unsafe: true
		},
		dir: {
			type: "boolean",
			direction: true
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
			max: 128,
			unsafe: true
		},
		wrapFix: {
			type: "boolean"
		}
	}
	
	generate(o) {
		let maxN, inverseMaxN;

		if(o.dir) {
			maxN = img.w;
			inverseMaxN = img.h;
		} else {
			maxN = img.h;
			inverseMaxN = img.w;
		}
		const spacing = Math.sqrt(o.spacing);
		const maxLines = inverseMaxN / spacing;
		
		for(let i = 0; i < maxLines; i++) {
			let pos = Math.round((i + 0.5) * spacing + (Math.random() - 0.5) * o.variance);
			const start = pos;
			const wrapBiasPivot = maxN * (Math.random() * 3 + 1);
			for(let n = 0; n < maxN; n++) {
				let x, y;
				
				if(o.dir) {
					x = n;
					y = pos;
				} else {
					x = pos;
					y = n;
				}
				if(o.thickness == 1) {
					img.plotPixel([1, 1, 1, 1], x, y);
				} else {
					for(let s = 0; s < o.thickness; s++) {
						if(o.dir) {
							img.plotPixel([1, 1, 1, 1], x, y + s);
						} else {
							img.plotPixel([1, 1, 1, 1], x + s, y);
						}
					}
				}
				
				if(Math.random() < o.spread) {
					//attempt to fix wrapping on the line direction (ex: if xDir is x then y would loop properly, but x wouldnt)
					if(o.wrapFix) {
						let wrapBias = Math.max(n / wrapBiasPivot, 0);
						//if the line strays too far from it's start, begin to bias towards the start (make the texture seamless)
						if(wrapBias > Math.random()) {
							//compute difference
							if(start > pos) {
								pos++;
							} else {
								pos--;
							}
						} else {
							if(Math.random() < o.bias) {
								pos++;
							} else {
								pos--;
							}
						}
					} else {
						//ehhh copy and paste i dont care
						if(Math.random() < o.bias) {
							pos++;
						} else {
							pos--;
						}
					}
				}
			}
		}
	}
}
	
class LayerCheckers extends Layer {
	name = "checkers";
	
	options = {
		evenColor: [1, 1, 1, 1],
		oddColor: [0, 0, 0, 1],
		scaleX: 1,
		scaleY: 1,
		shiftX: 0,
		shiftY: 0
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
		},
		shiftX: {
			type: "number"
		},
		shiftY: {
			type: "number"
		}
	};
	
	generate(o) {
		for(let y = 0; y < img.h; y++) {
			for(let x = 0; x < img.w; x++) {
				let col = (Math.floor((x - o.shiftX * (Math.floor(y / o.scaleY) % 2)) / o.scaleX) + Math.floor((y - o.shiftY * (Math.floor(x / o.scaleX) % 2)) / o.scaleY)) % 2 == 0 ? o.evenColor : o.oddColor;
				img.plotPixel(col, x, y);
			}
		}
	}
}

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
			min: 1,
			max: 256,
			unsafe: true
		},
		minDiameter: {
			type: "number",
			min: 1,
			max: 128,
			unsafe: true
		},
		maxDiameter: {
			type: "number",
			min: 1,
			max: 128,
			unsafe: true
		},
		fade: {
			type: "boolean"
		}
	};
	
	generate(o) {
		//const spacing = Math.sqrt(o.spacing);
		//const blobCount = (img.w / spacing) * (img.h / spacing);
		const blobCount = (img.w / o.spacing) * (img.h / o.spacing);
		
		for(let i = 0; i < blobCount; i++) {
			//random diameter
			let d = Math.random() * (o.maxDiameter - o.minDiameter) + o.minDiameter;
			//add 0.5 so the blobs arent 1 pixel smaller than they suppsoed to be
			let r = d / 2 + 0.5;
			let xStart = Math.floor(Math.random() * img.w);
			let yStart = Math.floor(Math.random() * img.h);
			
			for(let yi = -r; yi < r; yi++) {
				for(let xi = -r; xi < r; xi++) {
					//subtract 0.5 to make the blobs rounder
					const dist = Math.sqrt(xi * xi + yi * yi);
					if(dist < r - 0.5) {
						//wrap pixels around the edge (maybe make this a default option? or default in plotPixel??)
						/*let x = Math.floor(xi + xStart) % img.w;
						let y = Math.floor(yi + yStart) % img.h;
						if(x < 0) x += img.w;
						if(y < 0) y += img.h;*/
						let x = Math.floor(xi + xStart);
						let y = Math.floor(yi + yStart);
						if(o.fade) {
							img.plotPixel([1, 1, 1, (r - dist) / r], x, y);
						} else {
							img.plotPixel([1, 1, 1, 1], x, y);
						}
					}
				}
			}
		}
	}
}
	
class LayerWorley extends Layer {
	name = "worley";
	
	options = {
		xSpacing: 16,
		ySpacing: 16,
		closeColor: [0, 0, 0, 1],
		farColor: [1, 1, 1, 1],
		squareDistance: false,
		voronoi: false
	};
	
	types = {
		xSpacing: {
			type: "number",
			min: 1,
			max: 256,
			unsafe: true
		},
		ySpacing: {
			type: "number",
			min: 1,
			max: 256,
			unsafe: true
		},
		closeColor: {
			type: "color"
		},
		farColor: {
			type: "color"
		},
		squareDistance: {
			type: "boolean"
		},
		voronoi: {
			type: "boolean"
		}
	};
	
	generate(o) {
		//let xSpacing = 16;//img.w / xGrid;
		//let ySpacing = 16;//img.h / yGrid;
		let xGrid = Math.ceil(img.w / o.xSpacing);
		let yGrid = Math.ceil(img.h / o.ySpacing);
		let points = new Array(xGrid * yGrid);
		let colors;
		
		for(let y = 0; y < yGrid; y++) {
			for(let x = 0; x < xGrid; x++) {
				//points[x + y * xGrid] = [x * o.xSpacing + Math.floor(Math.random() * o.xSpacing), y * o.ySpacing + Math.floor(Math.random() * o.ySpacing)];
				points[x + y * xGrid] = [Math.random() * o.xSpacing, Math.random() * o.ySpacing];
			}
		}
		if(o.voronoi) {
			colors = new Array(xGrid * yGrid);
			for(let y = 0; y < yGrid; y++) {
				for(let x = 0; x < xGrid; x++) {
					colors[x + y * xGrid] = img.blend(o.closeColor, o.farColor, Math.random());
				}
			}
		}
		for(let y = 0; y < img.h; y++) {
			for(let x = 0; x < img.w; x++) {
				//absurd number so that the distance gets overwritten
				let closestDist = 999999999999999;
				//iterate through 9 cells to compute the shortest distance
				let printCol;
				
				for(let yi = -1; yi <= 1; yi++) {
					for(let xi = -1; xi <= 1; xi++) {
						const xCell = Math.floor(x / o.xSpacing) + xi;
						const yCell = Math.floor(y / o.ySpacing) + yi;
						let xIdx = xCell % xGrid;
						let yIdx = yCell % yGrid;
						if(xIdx < 0) xIdx += xGrid;
						if(yIdx < 0) yIdx += yGrid;
						const pointIdx = xIdx + yIdx * xGrid;
						const xSqr = (x - (points[pointIdx][0] + xCell * o.xSpacing));
						const ySqr = (y - (points[pointIdx][1] + yCell * o.ySpacing));
						let xScale = 1;
						let yScale = 1;
						//stretch out blobs if x spacing and y spacing arent equal (prevents some of the weird grid artifacts)
						if(o.xSpacing < o.ySpacing) {
							xScale = o.ySpacing / o.xSpacing;
						} else {
							yScale = o.xSpacing / o.ySpacing;
						}
						const dist = (xSqr * xSqr) * xScale + (ySqr * ySqr) * yScale;
						if(dist < closestDist) {
							closestDist = dist;
							if(o.voronoi) printCol = colors[pointIdx];
						}
					}
				}
				
				if(o.voronoi) {
					img.plotPixel(printCol, x, y);
				} else {
					//do the sqrt for only one of the distances
					//let dist = Math.sqrt(closestDist) * (255 / ((o.xSpacing + o.ySpacing) / 2));
					let dist = Math.sqrt(closestDist) / ((o.xSpacing + o.ySpacing) / 2);
					if(o.squareDistance) {
						dist *= dist;
					}
					
					img.plotPixel(img.blend(o.closeColor, o.farColor, dist), x, y);
				}
			}
		}
	}
}
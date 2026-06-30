//original gangster version of this
//put here for archival purposes

function createImage() {
	setup(0x202530)
	pushLayer(new Wandering(0xff8010, 1, 0.2, 0.5, 2, 0.2));
  let bak = cloneLayer();
  pushFilter(new Blur(2));
  for(let i = 0; i < 8; i++) {
    popFilter();
    popLayer(ADD, 8);
    filter.diameter++;
  }
  layer.go2X = false;
  popLayer(MULT, 1);
  //bendy lines? variance y AND x??

}
const WIDTH = 64;
const HEIGHT = 64;
const IMG_SIZE = WIDTH * HEIGHT;
const ARR_SIZE = IMG_SIZE * 8;
const PRINT_SCALE = 4;
const BASE = 16;
const DIF_X = WIDTH / BASE;
const DIF_Y = HEIGHT / BASE;
let layer;
let combined = new Array(ARR_SIZE);
let layerData = new Array(ARR_SIZE);
let filter;
let precomputed = false;
const ADD = 0;
const MULT = 1;
const PLAIN = 2;
const SCREEN = 3;
const OVER = 4;

function setup(bg) {
	bg = hex2arr(bg);
  for(let i = 0; i < IMG_SIZE; i++) {
    combined[i * 4] = bg[0];
    combined[i * 4 + 1] = bg[1];
    combined[i * 4 + 2] = bg[2];
    combined[i * 4 + 3] = 255;
  }
}

function pushLayer(newLayer) {
  layer = newLayer;
}

function pushFilter(newFilter) {
  filter = newFilter;
}

function popLayer(blend, strength, regenerate = !precomputed) {
	if(regenerate) {
	  layer.generate();
  }
  for(let i = 0; i < ARR_SIZE; i += 4) {
    //alpha is always additive!!
    let amount = strength * (layerData[i + 3]) / 255;
    combined[i] = combinePixel(layerData[i], combined[i], blend, amount) * 255; //r 
    combined[i + 1] = combinePixel(layerData[i + 1], combined[i + 1], blend, amount) * 255; //g
    combined[i + 2] = combinePixel(layerData[i + 2], combined[i + 2], blend, amount) * 255; //b
    combined[i * 4 + 3] = layerData[i * 4 + 3] + combined[i * 4 + 3]; // a
  }
  precomputed = false;
}

function popFilter(regenerate = false) {
	if(regenerate) {
  	layer.generate();
  }
	filter.generate();
  precomputed = true;
}

function cloneLayer() {
	layer.generate();
  precomputed = true;
  return [...layerData];
}

function combinePixel(l, b, blend, strength) {
	//values are normalized (0 through 1)!!!
	l /= 255;
  b /= 255;
  
  switch(blend) {
    case ADD:
      return (l * strength) + b;
    case MULT:
      return ((l * strength) + 1 - strength) * b;
    case PLAIN:
    	return lerp(b, l, strength);
    case SCREEN:
    	return 1 - (1 - l * (strength)) * (1 - b);
    case OVER:
    	if(l < 0.5) {
      	return combinePixel(l * 255, b * 255, MULT, strength);
      } else {
      	return combinePixel(l * 255, b * 255, SCREEN, strength);
      }
  }
}

function printImage() {
  let c = document.getElementById("canvas");
  c.width = WIDTH;
  c.height = HEIGHT;
  c.style.width = WIDTH * PRINT_SCALE + "px";
  c.style.height = HEIGHT * PRINT_SCALE + "px";
  let ctx = c.getContext("2d");
  let img = ctx.createImageData(WIDTH, HEIGHT);

  for(let i = 0; i < ARR_SIZE; i++) {
    img.data[i] = combined[i];
  }

  ctx.putImageData(img, 0, 0);
}

function hex2dec(hex, channel) {
	switch(channel) {
  	case 0: //r
    	return hex >> 16;
  	case 1: //g
    	return hex >> 8 & 255;
  	case 2: //b
    	return hex & 255;
  }
}

function hex2arr(hex) {
	return [hex2dec(hex, 0), hex2dec(hex, 1), hex2dec(hex, 2)];
}

function lerp(base, layerCol, strength) {
	return base + strength  * (layerCol - base);
}

function mix(one, two) {
	return lerp(one, two, 0.5);
}

class XorFractal{
	constructor(normalized = true, scale = BASE) {
  	this.normalized = normalized;
    this.scale = scale;
  }
  generate() {
    for(let i = 0; i < IMG_SIZE; i++) {
    	let x = i % WIDTH;
      let y = Math.floor(i / WIDTH);
      let col;
      if(this.normalized) {
      	col = (x * (this.scale * (this.scale / WIDTH))) ^ (y * (this.scale * (this.scale / HEIGHT)));
      } else {
      	col = (x * this.scale) ^ (y * this.scale);
      }
      layerData[i * 4] = col;
      layerData[i * 4 + 1] = col;
      layerData[i * 4 + 2] = col;
      layerData[i * 4 + 3] = 255;
    }
  }
}

class Noise{
	constructor(color = 0xffffff, coverage = 1) {
  	this.color = hex2arr(color);
    this.coverage = coverage;
  }
  generate() {
    for(let i = 0; i < IMG_SIZE; i++) {
      let col = Math.random();
      let a = 255;
      if(Math.random() > this.coverage) {
      	a = 0;
      }
      layerData[i * 4] = col * this.color[0];
      layerData[i * 4 + 1] = col * this.color[1];
      layerData[i * 4 + 2] = col * this.color[2];
      layerData[i * 4 + 3] = a;
    }
  }
}

class Border{
	constructor(x = 0, y = 0, xs = BASE - 1, ys = BASE - 1, periodX = WIDTH, periodY = HEIGHT, periodOffX = 0, periodOffY = 0) {
   //15x15 not 16x16...
    this.offX = x;
  	this.offY = y;
  	this.offX2 = xs;
    this.offY2 = ys;
    /*this.top = 0xff0000;
    this.bottom = 0x00ffff;
    this.left = 0x00ff00;
    this.right = 0xff00ff;*/
    this.left = 0xd0d0d0;
    this.right = 0x505050;
    this.bottom = 0;
    this.top = 0xffffff;
    this.pX = periodX;
    this.pY = periodY;
    this.pOffX = periodOffX;
    this.pOffY = periodOffY;
    
    if(this.offX > this.offX2) {
    	let temp = this.offX;
      this.offX = this.offX2;
      this.offX2 = temp;
     	temp = this.left;
      this.left = this.right;
      this.right = temp;
    }
    
    if(this.offY > this.offY2) {
    	let temp = this.offY;
      this.offY = this.offY2;
      this.offY2 = temp;
     	temp = this.top;
      this.top = this.bottom;
      this.bottom = temp;
    }
  }
  generate() {
    let topArr = hex2arr(this.top);
    let bottomArr = hex2arr(this.bottom);
    let leftArr = hex2arr(this.left);
    let rightArr = hex2arr(this.right);
    
    for(let i = 0; i < IMG_SIZE; i++) {
    	let x = i % WIDTH;
      let y = Math.floor(i / WIDTH);
      x += this.pOffX;
      y += this.pOffY;
      x %= this.pX;
      y %= this.pY;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let show = false;
      if(this.offX == x && this.offY < y && this.offY2 > y) {
      	r = leftArr[0];
      	g = leftArr[1];
      	b = leftArr[2];
        show = true;
      }
      
      if(this.offY == y && this.offX < x && this.offX2 > x) {
      	r = topArr[0];
      	g = topArr[1];
      	b = topArr[2];
        show = true;
      }
      
      if(this.offX2 == x && this.offY < y && this.offY2 > y) {
      	r = rightArr[0];
      	g = rightArr[1];
      	b = rightArr[2];
        show = true;
      }
      
      if(this.offY2 == y && this.offX < x && this.offX2 > x) {
      	r = bottomArr[0];
      	g = bottomArr[1];
      	b = bottomArr[2];
        show = true;
      }
      
      if(x == this.offX && y == this.offY) {
      	r = mix(topArr[0], leftArr[0]);
      	g = mix(topArr[1], leftArr[1]);
      	b = mix(topArr[2], leftArr[2]);
        show = true;
      }
      
      if(x == this.offX2 && y == this.offY2) {
      	r = mix(topArr[0], rightArr[0]);
      	g = mix(topArr[1], rightArr[1]);
      	b = mix(topArr[2], rightArr[2]);
        show = true;
      }
      
      if(x == this.offX && y == this.offY2) {
      	r = mix(bottomArr[0], leftArr[0]);
      	g = mix(bottomArr[1], leftArr[1]);
      	b = mix(bottomArr[2], leftArr[2]);
        show = true;
      }
      
      if(x == this.offX2 && y == this.offY2) {
      	r = mix(bottomArr[0], rightArr[0]);
      	g = mix(bottomArr[1], rightArr[1]);
      	b = mix(bottomArr[2], rightArr[2]);
        show = true;
      }
      
      if(show) {
      	a = 255;
      }
      
      layerData[i * 4] = r;
      layerData[i * 4 + 1] = g;
      layerData[i * 4 + 2] = b;
      layerData[i * 4 + 3] = a;
    }
  }
  all(col) {
  	this.left = col;
  	this.right = col;
  	this.top = col;
  	this.bottom = col;
  }
}

class Flat{
	constructor(color, x = 0, y = 0, xs = WIDTH, ys = HEIGHT, pX = WIDTH, pY = HEIGHT, pOffX = 0, pOffY = 0) {
    this.offY = x;
  	this.offX = y;
  	this.sizeX = xs;
    this.sizeY = ys;
    this.color = hex2arr(color);
    this.pX = pX;
    this.pY = pY;
    this.pOffX = pOffX;
    this.pOffY = pOffY;
  }
  generate() {
    for(let i = 0; i < IMG_SIZE; i++) {
    	let x = ((i % WIDTH) + this.pOffX) % this.pX;
      let y = (Math.floor(i / WIDTH) + this.pOffY) % this.pY;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      
      if(this.offX <= x && this.sizeX >= x && this.offY <= y && this.sizeY >= y) {
      	r = this.color[0];
      	g = this.color[1];
      	b = this.color[2];
      	a = 255; //SET TO ACTUAL COLOR!!!
      }
      
      layerData[i * 4] = r;
      layerData[i * 4 + 1] = g;
      layerData[i * 4 + 2] = b;
      layerData[i * 4 + 3] = a;
    }
  }
}
const X = true;
const Y = false;

class Liney{
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
}

class Blur{
	constructor(diameter = 2) {
 		this.diameter = diameter;
  }
  
  generate() {
  	if(this.radius < 1) return;
    
  	let layerRef = [...layerData]; //create copy not reference
  	let radius = Math.floor(this.diameter / 2);
    let error = this.diameter % 2;
    
  	for(let i = 0; i < IMG_SIZE; i++) {
    	let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let offX = i % WIDTH + radius;
      let offY = Math.floor(i / WIDTH) + radius;
      for(let y = -radius + offY; y < radius + offY + error; y++) {
      	for(let x = -radius + offX; x < radius + offX + error; x++) {
          let idx = ((x % WIDTH) + (y % HEIGHT) * WIDTH) * 4;
          /*let sqX = x - offX;
          let sqY = y - offY;
          let dist = Math.sqrt(sqX * sqX + sqY * sqY) / (radius - (radius / 4));*/
          r += layerRef[idx];
          g += layerRef[idx + 1];
          b += layerRef[idx + 2];
          a += layerRef[idx + 3];
        }
      }
      let avg = this.diameter * this.diameter;
      r /= avg;
      g /= avg;
      b /= avg;
      a /= avg;
      layerData[i * 4] = r;
      layerData[i * 4 + 1] = g;
      layerData[i * 4 + 2] = b;
      layerData[i * 4 + 3] = a;
    }
  }
}

class Invert {
	constructor(invertAlpha = false) {
  	this.invertAlpha = invertAlpha;
  }
  
  generate() {
  	for(let i = 0; i < IMG_SIZE; i++) {
      if(this.invertAlpha) {
      	layerData[i * 4 + 3] = 255 - layerData[i * 4 + 3];
      } else {
        layerData[i * 4] = 255 - layerData[i * 4];
        layerData[i * 4 + 1] = 255 - layerData[i * 4 + 1];
        layerData[i * 4 + 2] = 255 - layerData[i * 4 + 2];
      }
    }
  }
}

/*class Channel {
	
}*/

createImage();
printImage();

HTML
<!DOCTYPE html>
<html>
  <body>
    <canvas id="canvas" height="16" width="16"></canvas>
  </body>
</html>

CSS
canvas {
  height: 192px;
  width: 192px;
  image-rendering: pixelated;
}

SNIPPETS
proto
//prepared - layer that computes the full size
//plot - layer that works on single pixels
//filter - modify full layer / base
//intercept - modify single pixel of layer / base

//pushLayer(new Bevel(posX, posY, sizeX, sizeY, thickness))
//popLayer(ADD, 0.5, REPEAT);

//pushLayer(new Border(x, y, xSize, ySize));
//layer.thickness = 1;
//layer.all(#ffffff);
//layer.left = #ffff00;
//popLayer(ADD, 0.8);
bricks
  setup(0x858070); //0x2090b0
  pushLayer(new Noise(0xff4000, 0.25));
  popLayer(MULT, 0.1)
  pushLayer(new Wandering(0));
  popLayer(OVER, 0.2);
  layer.color = 0xffffff;
  popLayer(OVER, 0.15);
  pushLayer(new Liney(0.25, 4));
  popLayer(MULT, 0.2);
  pushLayer(new Noise(0xffff80, 0.5));
  popLayer(ADD, 0.05);
  //brick layers
  pushLayer(new Flat(0x858070));
  popLayer(PLAIN, 0.25);
  let brick = 16;
  let brick2 = brick / 2;
  pushLayer(new Border(0, 0, brick - 1, brick2 - 1, brick, brick));
  popLayer(PLAIN, 0.4);
  layer.pOffY = brick2;
  layer.pOffX = brick2;
  popLayer(PLAIN, 0.4);
  pushLayer(new Border(brick - 2, brick2 - 2, 1, 1, brick, brick));
  popLayer(PLAIN, 0.25);
  layer.pOffY = brick2;
  layer.pOffX = brick2;
  popLayer(PLAIN, 0.25);
  pushLayer(new Flat(0xffffff, 0, 0, 0, 0, brick, brick));
  popLayer(PLAIN, 0.7);
  layer.pOffY = brick2;
  layer.pOffX = brick2;
  popLayer(PLAIN, 0.7);
planks

	setup(0x202530)
	pushLayer(new Wandering(0xff8010, 1, 0.2, 0.5, 2, 0.2));
  let bak = cloneLayer();
  pushFilter(new Invert(true));
  popFilter();
  popLayer(PLAIN, 1);
  layerData = bak;
  popLayer(PLAIN, 1, false);
  //layer.go2X = false;
  //popLayer(PLAIN, 1);
  //bendy lines? variance y AND x??


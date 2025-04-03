//global layer management (data funnelling n processing)
const BLEND_ADD = 0;
const BLEND_MULTIPLY = 1;
const BLEND_PLAIN = 2;
const BLEND_SCREEN = 3;
const BLEND_OVERLAY = 4;

class ImageManager {
  x = 64;
  y = 64;
  data = [];
  layer = undefined;
  bg = [0.5, 0.5, 0.5, 1];
  layers = [];
  layerClasses = {
    xorFractal: LayerXorFractal,
    solid: LayerSolid,
    noise: LayerNoise,
    border: LayerBorder,
    liney: LayerLiney,
    wandering: LayerWandering,
    checkers: LayerCheckers,
    blobs: LayerBlobs,
    worley: LayerWorley
  };
	blendNames = {
		add: BLEND_ADD,
		multiply: BLEND_MULTIPLY,
		plain: BLEND_PLAIN,
		screen: BLEND_SCREEN,
		overlay: BLEND_OVERLAY
	};
  name = "our beauty";
  
  printImage() {
    let startTime = Date.now();
    //write the background color
    for(let i = 0; i < this.x * this.y; i++) {
      this.data[i * 4] = this.bg[0];
      this.data[i * 4 + 1] = this.bg[1];
      this.data[i * 4 + 2] = this.bg[2];
      this.data[i * 4 + 3] = this.bg[3];
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
        //convert from 0 - 1 to 0 - 255
        canvasImg.data[i] = this.data[i] * 255;
      }
      //insert new image data
      t.ctx.putImageData(canvasImg, 0, 0);
      let renderTime = Date.now() - startTime;
      
      document.getElementById("render-time").textContent = "render time: " + renderTime + "ms";
  }
  
  updateSize() {
    //if the width or height is too big then i predict that everything will expode
    if(this.x > 512) {
      this.x = 512;
      console.log("hey, quit doing that!");
    }
    if(this.y > 512) {
      this.y = 512;
      console.log("hey, quit doing that!");
    }
    this.data = new Array(this.x * this.y * 4);
  }

  plotPixel(color, x, y) {
    //color is an array of 4 bytes
    //[red, blue, green, alpha]
		
    //wrap around image
    x %= img.x;
    y %= img.y;
    //wrap if negative
    if(x < 0) x += img.x;
    if(y < 0) y += img.y;
    //get alpha n blend from global memory... its less to type
    //getting stuff from global memory loses ~1 ms on a 256x256 image
    const alpha = this.layer.od.alpha * color[3];
    const blend = this.layer.od.blend;
    const tint = this.layer.od.tint;
    const pos = x + y * this.x;
    //todo: actually have alpha CHANNEL affect (effect? idk) the color, not just the layer's alpha
    this.data[pos * 4] = this.combinePixel(color[0] * tint[0], this.data[pos * 4], blend, alpha);
    this.data[pos * 4 + 1] = this.combinePixel(color[1] * tint[1], this.data[pos * 4 + 1], blend, alpha);
    this.data[pos * 4 + 2] = this.combinePixel(color[2] * tint[2], this.data[pos * 4 + 2], blend, alpha);
    //add the alphas together
    this.data[pos * 4 + 3] = (color[3] * alpha) + this.data[pos * 4 + 3];
      
  }
  
  combinePixel(l, b, blend, strength) {
    //values are normalized (0 through 1)
		//TODO: use constants instead of strings and test performance
    switch(blend) {
      case BLEND_ADD:
        return (l * strength) + b;
      case BLEND_MULTIPLY:
        return ((l * strength) + 1 - strength) * b;
      case BLEND_PLAIN:
        //lerp
        return b + strength * (l - b);
      case BLEND_SCREEN:
        return 1 - (1 - l * strength) * (1 - b);
      case BLEND_OVERLAY:
        //fuck you wikipedia
        if(l < 0.5) {
          return (2 * (l * strength) + 1 - strength) * b;
        } else {
          return 1 - (1 - l * strength) * ((strength + 1) * (1 - b));
        }
    }
		/*switch(blend) {
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
		}*/
  }
  
  parseRGB(hex) {
    const r = ((hex & 0xFF000000) >> 24) & 0xFF; //signed 2 unsigned
    const g = (hex & 0x00FF0000) >> 16;
    const b = (hex & 0x0000FF00) >> 8;
    const a = hex & 0x000000FF;
    return [r / 255, g / 255, b / 255, a / 255];
  }
  
  RGB2Hex(arr) {
    //[1, 1, 1, 1] to #ffffff
    let r = Math.floor(arr[0] * 255).toString(16);
    let g = Math.floor(arr[1] * 255).toString(16);
    let b = Math.floor(arr[2] * 255).toString(16);
    //padding so all colors are the same length (black was encoded as #000 instead of #000000!!)
    if(r.length < 2) r = "0" + r;
    if(g.length < 2) g = "0" + g;
    if(b.length < 2) b = "0" + b;
    return "#" + r + g + b;
  }
  
  RGBA2Hex(arr) {
    //[1, 1, 1, 1] to #ffffffff
    let r = Math.floor(arr[0] * 255).toString(16);
    let g = Math.floor(arr[1] * 255).toString(16);
    let b = Math.floor(arr[2] * 255).toString(16);
    let a = Math.floor(arr[3] * 255).toString(16);
    //padding so all colors are the same length (black was encoded as #000 instead of #000000!!)
    if(r.length < 2) r = "0" + r;
    if(g.length < 2) g = "0" + g;
    if(b.length < 2) b = "0" + b;
    if(a.length < 2) a = "0" + a;
    return "#" + r + g + b + a;
  }
  
  parseHex(hex) {
    //convert #RRGGBB to 0xRRGGBB and then [R, G, B] from 0...1
    //rgba or rgb depending on length
    if(hex.length <= 7) {
      //hack for versions that didnt support alpha input
      return img.parseRGB(Number("0x" + hex.slice(1) + "ff"));
    } else {
      return img.parseRGB(Number("0x" + hex.slice(1)));
    }
  }
  
  blend(col0, col1, percent) {
    //could be a "map" filter?
    const a = col0[3] + percent * (col1[3] - col0[3]);
    //do this so the transition between opaque and transparent colors doesnt look weird and muddy
    //if the second color's alpha is larger than the first colors then the colors will look all messed up. its better to leave it muddy for now until i figure out how to fix it
    if(col0[3] < col1[3]) {
      percent /= a;
    }
    /*
    if(percent < 0 || a < 0 || aBlend < 0) {
      console.log(a);
      console.log(aBlend);
      console.log(percent);
      console.log("---");
    }*/
    const r = col0[0] + percent * (col1[0] - col0[0]);
    const g = col0[1] + percent * (col1[1] - col0[1]);
    const b = col0[2] + percent * (col1[2] - col0[2]);
    return [r, g, b, a];
  }
}

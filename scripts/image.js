"use strict";
//global layer management (data funnelling n processing)

//NEVER change these values!
//they are used in save files, so changing them WILL break save files!!!
const BLEND_ADD = 0;
const BLEND_MULTIPLY = 1;
const BLEND_PLAIN = 2;
const BLEND_SCREEN = 3;
const BLEND_OVERLAY = 4;
const BLEND_SUBTRACT = 5;
const BLEND_CHANNEL_DISSOLVE = 6;
const BLEND_DISSOLVE = 7;
const BLEND_SHIFT_OVERLAY = 8;
const BLEND_OVERBLOWN_TEST = 9;
const BLEND_BAYER = 10;
const BLEND_HALFTONE = 11;

//https://en.wikipedia.org/wiki/Ordered_dithering
//be happy that i manually aligned the tables... it looks pretty
const BLEND_TABLE_BAYER = [
  0,      0.5,    0.125,  0.625,
  0.75,   0.25,   0.875,  0.375,
  0.1875, 0.6875, 0.0625, 0.5625,
  0.9375, 0.4375, 0.8125, 0.3125
];

const BLEND_TABLE_HALFTONE = [
  0.9375, 0.875, 0.75,  0.625,  0.625,  0.75,  0.875, 0.9375,
  0.875,  0.75,  0.625, 0.5,    0.5,    0.625, 0.75,  0.875,
  0.75,   0.625, 0.5,   0.25,   0.25,   0.5,   0.625, 0.75,
  0.625,  0.5,   0.25,  0,      0.0625, 0.25,  0.5,   0.625,
  0.625,  0.5,   0.25,  0.0625, 0.0625, 0.25,  0.5,   0.625,
  0.75,   0.625, 0.5,   0.25,   0.25,   0.5,   0.625, 0.75,
  0.875,  0.75,  0.625, 0.5,    0.5,    0.625, 0.75,  0.875,
  0.9375, 0.875, 0.75,  0.625,  0.625,  0.75,  0.875, 0.9375
];
        
const MIX_PLAIN = 0;
const MIX_HALF = 1;
const MIX_RANDOM = 2;
const MIX_BAYER = 3;
const MIX_HALFTONE = 4;
const MIX_DAFT_X = 5;
const MIX_DAFT_Y = 6;
const MIX_HALF_DITHER = 7;

const INTERP_NEAREST = 0;
const INTERP_BILINEAR = 1;
const INTERP_BILINEAR_COS = 2;

const KEY_FREED = -1;
const KEY_CANVAS = -2;

class ImageManager {
  //height and width
  w = 64;
  h = 64;
  //max height and width
  wMax = 512;
  hMax = 512;
  //the canvas pixel data
  data = [];
  //the current layer being printed
  layer = null;
  //the background color (grey)
  bg = [0.5, 0.5, 0.5, 1];
  layers = [];
  //woot woot! memory management in javascript!!!
  //list of indices in the layers array. used for filter layers, so that their base layers don't change
  layerKeys = [];
  //indexes in layerKeys that are not being used
  layerKeysFreed = [];
  
  //layerKey -> layerIndex
  //layers[layerIndex] -> LayerSomeExampleLayer
  
  //image title
  name = "our beauty";
  //image author
  author = "you!";
  
  layerClasses = {
    //regular layers
    xorFractal: LayerXorFractal,
    solid: LayerSolid,
    noise: LayerNoise,
    border: LayerBorder,
    liney: LayerLiney,
    wandering: LayerWandering,
    checkers: LayerCheckers,
    blobs: LayerBlobs,
    worley: LayerWorley,
    gradient: LayerGradient,
    valueNoise: LayerValueNoise,
    waveTable: LayerWaveTable,
    //filters
    tweak: FilterTweak,
    tile: FilterTile,
    invert: FilterInvert,
    scale: FilterScale,
    sine: FilterSine,
    merge: FilterMerge,
    repeat: FilterRepeat,
    mask: FilterMask,
    emboss: FilterEmboss,
    contrast: FilterContrast,
    blur: FilterBlur,
    HSV: FilterHSV,
    sharpen: FilterSharpen,
    offset: FilterOffset,
    vectorize: FilterVectorize,
    sunlight: FilterSunlight,
    shear: FilterShear
  };
  
  printImage(forceRender = false) {
    //dont render
    if(!t.renderOnUpdate && !forceRender) return;
    
    let startTime = Date.now();
    //write the background color
    for(let i = 0; i < this.w * this.h; i++) {
      this.data[i * 4] = this.bg[0];
      this.data[i * 4 + 1] = this.bg[1];
      this.data[i * 4 + 2] = this.bg[2];
      this.data[i * 4 + 3] = this.bg[3];
    }
    //layer the layers
    for(let i = 0; i < this.layers.length; i++) {
      if(this.layers[i].od.shown || this.layers[i].linkCount > 0) {
        this.layer = this.layers[i];
        if(this.layer.linkCount > 0) {
          this.layer.data = new Array(img.w * img.h);
          for(let i = 0; i < img.w * img.h * 4; i++) {
            this.layer.data[i] = 0;
          }
        }
        
        this.layer.generate(this.layer.options);
      }
    }
    //canvas stuff
    let canvasImg = t.ctx.createImageData(this.w, this.h);
    //write to canvas data
    for(let i = 0; i < this.w * this.h * 4; i++) {
      //convert from 0 - 1 to 0 - 255
      canvasImg.data[i] = this.data[i] * 255;
    }
    //insert new image data
    t.ctx.putImageData(canvasImg, 0, 0);
    if(t.tileView) {
      t.ctx.putImageData(canvasImg, this.w, 0);
      t.ctx.putImageData(canvasImg, this.w * 2, 0);
      
      t.ctx.putImageData(canvasImg, 0, this.h);
      t.ctx.putImageData(canvasImg, this.w, this.h);
      t.ctx.putImageData(canvasImg, this.w * 2, this.h);
      
      t.ctx.putImageData(canvasImg, 0, this.h * 2);
      t.ctx.putImageData(canvasImg, this.w, this.h * 2);
      t.ctx.putImageData(canvasImg, this.w * 2, this.h * 2);
    }
    let renderTime = Date.now() - startTime;
    
    document.getElementById("render-time").textContent = "render time: " + renderTime + "ms";
  }
  
  updateSize() {
    //if the width or height is too big then i predict that everything will expode
    if(this.w > 512) {
      this.w = 512;
      console.log("hey, quit doing that!");
    }
    if(this.h > 512) {
      this.h = 512;
      console.log("hey, quit doing that!");
    }
    this.data = new Array(this.w * this.h * 4);
  }

  plotPixel(color, x, y) {
    //each channel goes from 0...1
    //[red, blue, green, alpha]

    //wrap around image
    x = mod(x + UnitLength.getLength(this.layer.od.x, this.w, true), this.w);
    y = mod(y + UnitLength.getLength(this.layer.od.y, this.h, true), this.h);
    //get alpha n blend from global memory... its less to type
    const blend = this.layer.od.blend;
    const tint = this.layer.od.tint;
    const pos = x + y * this.w;
    //this is for when the data layer gets written to but we still don't want the layer displayed (filters)
    const alpha = this.layer.od.shown ? this.layer.od.alpha * color[3] : 0;
    //color offsets
    const rOffs = pos * 4;
    const gOffs = pos * 4 + 1;
    const bOffs = pos * 4 + 2;
    const aOffs = pos * 4 + 3;
    //layer color
    const rl = color[0] * tint[0];
    const gl = color[1] * tint[1];
    const bl = color[2] * tint[2];
    //base color
    const rb = this.data[rOffs];
    const gb = this.data[gOffs];
    const bb = this.data[bOffs];
    //moved from combinePixel(), gained ~10 ms on a 512x512 image by doing this -- nice!!
    switch(blend) {
      case BLEND_ADD:
        this.data[rOffs] = rl * alpha + rb;
        this.data[gOffs] = gl * alpha + gb;
        this.data[bOffs] = bl * alpha + bb;
        break;
      case BLEND_MULTIPLY:
        this.data[rOffs] = (rl * alpha + 1 - alpha) * rb;
        this.data[gOffs] = (gl * alpha + 1 - alpha) * gb;
        this.data[bOffs] = (bl * alpha + 1 - alpha) * bb;
        break;
      case BLEND_PLAIN:
        //lerp
        //TODO: something something similar to img.blend()
        this.data[rOffs] = rb + alpha * (rl - rb);
        this.data[gOffs] = gb + alpha * (gl - gb);
        this.data[bOffs] = bb + alpha * (bl - bb);
        break;
      case BLEND_SCREEN:
        this.data[rOffs] = 1 - (1 - rl * alpha) * (1 - rb);
        this.data[gOffs] = 1 - (1 - gl * alpha) * (1 - gb);
        this.data[bOffs] = 1 - (1 - bl * alpha) * (1 - bb);
        break;
      case BLEND_OVERLAY:
        if(rl < 0.5) {
          this.data[rOffs] = (2 * (rl * alpha) + 1 - alpha) * rb;
        } else {
          this.data[rOffs] = 1 - (1 - (rl - 0.5) * 2 * alpha) * (1 - rb);
        }
        if(gl < 0.5) {
          this.data[gOffs] = (2 * (gl * alpha) + 1 - alpha) * gb;
        } else {
          this.data[gOffs] = 1 - (1 - (gl - 0.5) * 2 * alpha) * (1 - gb);
        }
        if(bl < 0.5) {
          this.data[bOffs] = (2 * (bl * alpha) + 1 - alpha) * bb;
        } else {
          this.data[bOffs] = 1 - (1 - (bl - 0.5) * 2 * alpha) * (1 - bb);
        }
        break;
      case BLEND_SUBTRACT:
          this.data[rOffs] = rb - (rl * alpha);
          this.data[gOffs] = gb - (gl * alpha);
          this.data[bOffs] = bb - (bl * alpha);
        break;
      case BLEND_CHANNEL_DISSOLVE:
          if(alpha > Math.random()) this.data[rOffs] = rl;
          if(alpha > Math.random()) this.data[gOffs] = gl;
          if(alpha > Math.random()) this.data[bOffs] = bl;
        break;
      case BLEND_DISSOLVE:
        if(alpha > Math.random()) {
          this.data[rOffs] = rl;
          this.data[gOffs] = gl;
          this.data[bOffs] = bl;
        }
        break;
      case BLEND_SHIFT_OVERLAY:
        if(rl < 0.5) {
          this.data[rOffs] = rb - (0.5 - rl) * 2 * alpha;
        } else {
          this.data[rOffs] = (rl - 0.5) * 2 * alpha + rb;
        }
        if(gl < 0.5) {
          this.data[gOffs] = gb - (0.5 - gl) * 2 * alpha;
        } else {
          this.data[gOffs] = (gl - 0.5) * 2 * alpha + gb;
        }
        if(bl < 0.5) {
          this.data[bOffs] = bb - (0.5 - bl) * 2 * alpha;
        } else {
          this.data[bOffs] = (bl - 0.5) * 2 * alpha + bb;
        }
        break;
      case BLEND_OVERBLOWN_TEST:
        //the layer color is displayed as magenta if it's is overblown
        const isOverblown = rl > 1 || gl > 1 || bl > 1;
        //the color is displayed as green if it's underblown
        const isUnderblown = rl < 0 || gl < 0 || bl < 0;
        //the color is displayed as yellow if it's NaN
        const isNaN = rl != rl || gl != gl || bl != bl;
        
        if(isOverblown) {
          this.data[rOffs] = 1;
        } else if(isUnderblown) {
          this.data[rOffs] = 0;
        } else if(isNaN) {
          this.data[rOffs] = 1;
        } else {
          this.data[rOffs] = rb + alpha * (rl - rb);
        }
        if(isOverblown) {
          this.data[gOffs] = 0;
        } else if(isUnderblown) {
          this.data[gOffs] = 1;
        } else if(isNaN) {
          this.data[gOffs] = 1;
        } else {
          this.data[gOffs] = gb + alpha * (gl - gb);
        }
        if(isOverblown) {
          this.data[bOffs] = 1;
        } else if(isUnderblown) {
          this.data[bOffs] = 0;
        } else if(isNaN) {
          this.data[bOffs] = 0;
        } else {
          this.data[bOffs] = bb + alpha * (bl - bb);
        }
        break;
      case BLEND_BAYER:
        if(alpha > BLEND_TABLE_BAYER[x % 4 + y % 4 * 4]) {
          this.data[rOffs] = rl;
          this.data[gOffs] = gl;
          this.data[bOffs] = bl;
        }
        break;
      case BLEND_HALFTONE:
        if(alpha > BLEND_TABLE_HALFTONE[x % 8 + y % 8 * 8]) {
          this.data[rOffs] = rl;
          this.data[gOffs] = gl;
          this.data[bOffs] = bl;
        }
        break;
      default:
        console.error(`unknown blend mode ${blend}`);
    }
    //add the alphas together
    //alpha >1 doesnt matter on a canvas, but DOES matter for filters modifying the whole image
    this.data[aOffs] = Math.min(this.data[aOffs] + alpha, 1);
    //set rendered layer data (for filters)
    if(this.layer.linkCount > 0) {
      this.layer.data[rOffs] = rl;
      this.layer.data[gOffs] = gl;
      this.layer.data[bOffs] = bl;
      //set the layer data to the COLOR's alpha instead of the color * layer alpha
      //allows for a layer being filtered to be hidden while a filter is using it, which is done very often
      
      //add alpha together for more accurate layer data (albeit still inaccurate)
      this.layer.data[aOffs] = Math.min(this.layer.data[aOffs] + color[3], 1);
    }
  }
  
  getPixelFromData(x, y, baseData, interpMode) {
    switch(interpMode) {
      case INTERP_NEAREST:
        const idx = Math.floor(x) + Math.floor(y) * this.w;
        const r = baseData[idx * 4];
        const g = baseData[idx * 4 + 1];
        const b = baseData[idx * 4 + 2];
        const a = baseData[idx * 4 + 3];
        
        return [r, g, b, a];
      case INTERP_BILINEAR: {
        const xFloor = Math.floor(x);
        const yFloor = Math.floor(y);
        const xCeil = mod(Math.ceil(x), this.w);
        const yCeil = mod(Math.ceil(y), this.h);
        //corners are ordered like this:
        //0, 1
        //2, 3
        const idx0 = xFloor + yFloor * this.w;
        const r0 = baseData[idx0 * 4];
        const g0 = baseData[idx0 * 4 + 1];
        const b0 = baseData[idx0 * 4 + 2];
        const a0 = baseData[idx0 * 4 + 3];
        
        const idx1 = xCeil + yFloor * this.w;
        const r1 = baseData[idx1 * 4];
        const g1 = baseData[idx1 * 4 + 1];
        const b1 = baseData[idx1 * 4 + 2];
        const a1 = baseData[idx1 * 4 + 3];
        
        const idx2 = xFloor + yCeil * this.w;
        const r2 = baseData[idx2 * 4];
        const g2 = baseData[idx2 * 4 + 1];
        const b2 = baseData[idx2 * 4 + 2];
        const a2 = baseData[idx2 * 4 + 3];
        
        const idx3 = xCeil + yCeil * this.w;
        const r3 = baseData[idx3 * 4];
        const g3 = baseData[idx3 * 4 + 1];
        const b3 = baseData[idx3 * 4 + 2];
        const a3 = baseData[idx3 * 4 + 3];
        
        const xBias = x - xFloor;
        const yBias = y - yFloor;
        //THANK YOU wikipedia user Cmglee for making an amazing diagram that helped me FINALLY implement bilinear interpolation
        //TODO (?): this could be optimized a little (inline the functions), but it's pretty fast as it is
        const col0 = colorMix([r0, g0, b0, a0], [r1, g1, g1, a1], xBias);
        const col2 = colorMix([r2, g2, g2, a2], [r3, g3, b3, a3], xBias);
        
        return colorMix(col0, col2, yBias);
      }
      case INTERP_BILINEAR_COS: {
        const xFloor = Math.floor(x);
        const yFloor = Math.floor(y);
        const xCeil = mod(Math.ceil(x), this.w);
        const yCeil = mod(Math.ceil(y), this.h);
        const idx0 = xFloor + yFloor * this.w;
        const r0 = baseData[idx0 * 4];
        const g0 = baseData[idx0 * 4 + 1];
        const b0 = baseData[idx0 * 4 + 2];
        const a0 = baseData[idx0 * 4 + 3];
        const idx1 = xCeil + yFloor * this.w;
        const r1 = baseData[idx1 * 4];
        const g1 = baseData[idx1 * 4 + 1];
        const b1 = baseData[idx1 * 4 + 2];
        const a1 = baseData[idx1 * 4 + 3];
        const idx2 = xFloor + yCeil * this.w;
        const r2 = baseData[idx2 * 4];
        const g2 = baseData[idx2 * 4 + 1];
        const b2 = baseData[idx2 * 4 + 2];
        const a2 = baseData[idx2 * 4 + 3];
        const idx3 = xCeil + yCeil * this.w;
        const r3 = baseData[idx3 * 4];
        const g3 = baseData[idx3 * 4 + 1];
        const b3 = baseData[idx3 * 4 + 2];
        const a3 = baseData[idx3 * 4 + 3];
        //only change from bilinear
        const xBias = easeCos(x - xFloor);
        const yBias = easeCos(y - yFloor);
        const col0 = colorMix([r0, g0, b0, a0], [r1, g1, g1, a1], xBias);
        const col2 = colorMix([r2, g2, g2, a2], [r3, g3, b3, a3], xBias);
        
        return colorMix(col0, col2, yBias);
      }
      default:
        console.log("unknown interp mode: " + interpMode);
    }
  }
  
  godLayer() {
    const choice = x => x[Math.floor(Math.random() * x.length)];
    /** @type {Layer} */
    let layer = new (choice(Object.values(img.layerClasses)));
    //hack to prevent filter layers from generating if there are no other layers (the program crashes out if that happens)
    if(layer.isFilter && this.layers.length == 0) layer = new LayerXorFractal();
    const jsIsDumb = this; //can't use 'this' in the 'layer' case because it's undefined.................
    function randomize(opts, desc) {
      for(const key in opts) {
        const d = desc[key];
        switch (d.type) {
          case 'number': {
            const min = d.min === void 0 ? 0 : d.min;
            const max = d.max === void 0 ? 100 : d.max;
            const step = d.step === void 0 ? 1 : d.step;
            opts[key] = Math.random() * (max - min) + min;
            opts[key] /= step;
            opts[key] = Math.floor(opts[key]) * step;
            opts[key] *= 1e10;
            opts[key] = Math.floor(opts[key]);
            opts[key] /= 1e10;
            break;
          } 
          case 'boolean':
            opts[key] = Math.random() > 0.5;
            break;
          case 'color':
            opts[key] = Array(4).fill(1).map(m => Math.random() * m);
            break;
          case 'dropdown':
            opts[key] = choice(d.items);
            break;
          case 'keyvalues':
            opts[key] = choice(d.values);
            break;
          case 'layer':
            let layerKey = KEY_FREED;
            if(layer.isFilter) {
              let layerIdx = KEY_FREED;
              //once a valid layer key is found
              for(let safety = 0; layerIdx == KEY_FREED; safety++) {
                layerKey = Math.floor(Math.random() * jsIsDumb.layerKeys.length)
                layerIdx = jsIsDumb.layerKeys[layerKey];
                if(safety > 4) {
                  console.error("failed to create layer; could not find a valid layer key");
                  layerIdx = KEY_CANVAS;
                }
              }
              jsIsDumb.layers[layerIdx].linkCount++;
            }
            opts[key] = layerKey;
            break;
          case 'direction':
            opts[key] = Math.floor(Math.random() * 360);
            break;
          case 'length': {
            const unit = (Math.random() > 0.5) ? UNIT_PIXELS : UNIT_PERCENTAGE;
            let min, max;
            
            if(unit == UNIT_PIXELS) {
              const shortest = Math.max(img.w, img.h);
              min = d.scaledMin * shortest;
              max = d.scaledMax * shortest;
            } else {
              min = d.scaledMin * 100;
              max = d.scaledMax * 100;
            }
            if(d.absoluteMin != undefined) {
              min = d.absoluteMin;
            }
            let len = Math.random() * (max - min) + min;
            len = Math.floor(len / d.step) * d.step; //round
            
            opts[key] = new UnitLength(len, unit);
            break;
          }
          default:
            console.error(`Unsupported option type ${d.type}`);
        }
      }
    }
    randomize(layer.od, layer.typesDefault);
    randomize(layer.options, layer.types);
    layer.od.shown = true;
    
    return layer;
  }
  
  insertLayer(insertIdx, layer) {
    //copy keys so that index searching doesn't break
    let keysCopy = new Array(this.layerKeys.length);
    for(let i = 0; i < keysCopy.length; i++) keysCopy[i] = this.layerKeys[i];
    //rearrange layer keys
    for(let i = insertIdx; i < this.layers.length; i++) {
      const keyIdx = this.layerKeys.indexOf(i);
      keysCopy[keyIdx]++;
    }
    //copy the modified keys back
    for(let i = 0; i < keysCopy.length; i++) this.layerKeys[i] = keysCopy[i];
    //add the new layer key
    if(this.layerKeysFreed.length > 0) {
      this.layerKeys[this.layerKeysFreed.pop()] = insertIdx;
    } else {
      this.layerKeys.push(insertIdx);
    }
    //add layer
    this.layers.splice(insertIdx, 0, layer);
  }
  
  layerDataFromKey(key) {
    if(key == KEY_CANVAS) {
      //returning the data itself isntead of a copy creates these weird streaking patterns (from data overwriting itself)
      return deepArrayCopy(this.data);
    } else {
      return this.layers[this.layerKeys[key]].data;
    }
  }
}
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

const MIX_PLAIN = 0;
const MIX_HALF = 1;
const MIX_RANDOM = 2;
const MIX_BAYER = 3;
const MIX_HALFTONE = 4;
const MIX_DAFT_X = 5;
const MIX_DAFT_Y = 6;
const MIX_HALF_DITHER = 7;

const KEY_FREED = -1;
const KEY_CANVAS = -2;

class ImageManager {
  w = 64;
  h = 64;
  data = [];
  layer = null;
  bg = [0.5, 0.5, 0.5, 1];
  layers = [];
  //woot woot! memory management in javascript!!!
  //list of indices in the layers array. used for filter layers, so that their base layers don't change
  layerKeys = [];
  //indexes in layerKeys that are not being used
  layerKeysFreed = [];
  
  //layerKey -> layerIndex
  //layers[layerIndex] -> LayerSomeExampleLayer
  
  author = "you!";
  name = "our beauty";
  
  layerClasses = {
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
    tweak: FilterTweak,
    tile: FilterTile,
    invert: FilterInvert,
    scale: FilterScale,
    sine: FilterSine,
    merge: FilterMerge,
    repeat: FilterRepeat
  };
  
  printImage() {
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
      if(this.layers[i].od.shown) {
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
    x = mod(x + this.layer.od.x, this.w);
    y = mod(y + this.layer.od.y, this.h);
    //get alpha n blend from global memory... its less to type
    const blend = this.layer.od.blend;
    const tint = this.layer.od.tint;
    const pos = x + y * this.w;
    
    const alpha = this.layer.od.alpha * color[3];
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
        this.data[rOffs] = (rl * alpha) + rb;
        this.data[gOffs] = (gl * alpha) + gb;
        this.data[bOffs] = (bl * alpha) + bb;
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
  
  blend(col0, col1, percent) {
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
          } break;
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
              let layerIdx = -1;
              //once a valid layer key is found
              for(let safety = 0; layerIdx == KEY_FREED; safety++) {
                layerKey = Math.floor(Math.random() * jsIsDumb.layerKeys.length)
                layerIdx = jsIsDumb.layerKeys[layerKey];
                if(safety > 64) {
                  console.error("failed to create layer; could not find a valid layer key");
                  layerIdx = KEY_CANVAS;
                }
              }
              jsIsDumb.layers[layerIdx].linkCount++;
            }
            opts[key] = layerKey;
          break;
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
"use strict";
//global layer management (data funnelling n processing)
//NEVER change these values!
const BLEND_ADD = 0;
const BLEND_MULTIPLY = 1;
const BLEND_PLAIN = 2;
const BLEND_SCREEN = 3;
const BLEND_OVERLAY = 4;
const BLEND_SUBTRACT = 5;

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
    wandering2: LayerWandering2,
    translate: FilterTranslate,
    tile: FilterTile,
    invert: FilterInvert
  };
  name = "our beauty";
  
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
    x = mod(x, this.w);
    y = mod(y, this.h);
    //get alpha n blend from global memory... its less to type
    //getting stuff from global memory loses ~1 ms on a 256x256 image
    const alpha = this.layer.od.alpha * color[3];
    const blend = this.layer.od.blend;
    const tint = this.layer.od.tint;
    const pos = x + y * this.w;
    //todo: actually have alpha CHANNEL affect (effect? idk) the color, not just the layer's alpha
    this.data[pos * 4] = this.combinePixel(color[0] * tint[0], this.data[pos * 4], blend, alpha);
    this.data[pos * 4 + 1] = this.combinePixel(color[1] * tint[1], this.data[pos * 4 + 1], blend, alpha);
    this.data[pos * 4 + 2] = this.combinePixel(color[2] * tint[2], this.data[pos * 4 + 2], blend, alpha);
    //add the alphas together
    this.data[pos * 4 + 3] = (color[3] * alpha) + this.data[pos * 4 + 3];
    //set rendered layer data (for filters)
    if(this.layer.linkCount > 0) {
      this.layer.data[pos * 4] = color[0] * tint[0];
      this.layer.data[pos * 4 + 1] = color[1] * tint[1];
      this.layer.data[pos * 4 + 2] = color[2] * tint[2];
      this.layer.data[pos * 4 + 3] = color[3];
    }
  }
  
  combinePixel(l, b, blend, strength) {
    //values are normalized (0 through 1)
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
        //TODO: this is wonky with alpha
        if(l < 0.5) {
          return (2 * (l * strength) + 1 - strength) * b;
        } else {
          return 1 - (1 - l * strength) * ((strength + 1) * (1 - b));
        }
      case BLEND_SUBTRACT:
        return b - (l * strength);
      default:
        console.error(`unknown blend mode ${blend}`);
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
    const layer = new (choice(Object.values(img.layerClasses)));
    //TODO: dont add filters if there's no layers
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
            let layerIdx = -1;
            if(layer.isFilter) {
              //once a valid layer key is found
              for(let safety = 0; layerIdx == -1; safety++) {
                layerIdx = jsIsDumb.layerKeys[Math.floor(Math.random() * jsIsDumb.layerKeys.length)];
                if(safety > 64) {
                  console.error("failed to create layer; could not find a valid layer key");
                  layerIdx = -1;
                }
              }
            }
            opts[key] = layerIdx;
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
}
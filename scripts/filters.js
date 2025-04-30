class Filter extends Layer {
  isFilter = true;
  
  typesDefault = {
    alpha: {
      type: "number",
      step: 0.01,
      min: 0,
      max: 1
    },
    blend: LIMITS_BLEND,
    tint: {
      type: "color",
      external: true,
      brotherId: "dyn-icon-tint-"
    },
    shown: {
      type: "boolean",
      hidden: true
    },
    x: {
      type: "number",
      step: 1,
      min: -128,
      max: 128
    },
    y: {
      type: "number",
      step: 1,
      min: -128,
      max: 128
    },
    base: {
      type: "layer",
      hidden: false,
      external: true,
      brotherId: "dyn-icon-"
    }
  };
}

class FilterTweak extends Filter {
  name = "tweak";
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const a = data[idx * 4 + 3];
        img.plotPixel([r, g, b, a], x, y);
      }
    }
  }
}

class FilterTile extends Filter {
  name = "tile";
  
  options = {
    width: 16,
    height: 16,
    xOffs: 0,
    yOffs: 0,
    xShift: 0,
    yShift: 0
  };
  
  types = {
    width: {
      type: "number",
      step: 1,
      min: 1,
      max: 256
    },
    height: {
      type: "number",
      step: 1,
      min: 1,
      max: 256
    },
    xOffs: {
      type: "number",
      step: 1,
      min: -128,
      max: 128
    },
    yOffs: {
      type: "number",
      step: 1,
      min: -128,
      max: 128
    },
    xShift: {
      type: "number",
      step: 1,
      min: -128,
      max: 128
    },
    yShift: {
      type: "number",
      step: 1,
      min: -128,
      max: 128
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const xi = mod((x - o.xOffs), o.width) + o.xOffs;
        const yi = mod((y - o.yOffs), o.height) + o.yOffs;
        const idx = xi % img.w + yi % img.h * img.w;
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const a = data[idx * 4 + 3];
        const xShift = o.xShift * Math.floor(y / o.height);
        const yShift = o.yShift * Math.floor(x / o.width);
        img.plotPixel([r, g, b, a], x - o.xOffs + xShift, y - o.yOffs + yShift);
      }
    }
  }
}

class FilterInvert extends Filter {
  name = "invert";
  
  options = {
    redWeight: 1,
    greenWeight: 1,
    blueWeight: 1,
    alphaWeight: 0
  };
  
  types = {
    redWeight: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    greenWeight: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    blueWeight: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    alphaWeight: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);;
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        const r = Math.abs(o.redWeight - data[idx * 4]);
        const g = Math.abs(o.greenWeight - data[idx * 4 + 1]);
        const b = Math.abs(o.blueWeight - data[idx * 4 + 2]);
        const a = Math.abs(o.alphaWeight - data[idx * 4 + 3]);
        img.plotPixel([r, g, b, a], x, y);
      }
    }
  }
}

class FilterScale extends Filter {
  name = "scale";
  
  options = {
    width: 64,
    height: 64
  };
  //width and height kind of stink as an abstraction, because changing the resolution of the image will change the scale of this, which can be undesirable
  //ex: filter width and height are 64x64 and the image is 64x64 (no difference)
  //ex: filter width and height are 64x64 and the image is 256x256 (filter is smaller than image)
  //ex: filter width and height are 64x64 and the image is 16x16 (filter is larger than image)
  types = {
    width: {
      type: "number",
      step: 1
    },
    height: {
      type: "number",
      step: 1
    }
  };
  /*
  AB
  BA
  
  AABB
  AABB
  BBAA
  BBAA
  */
  
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    const xScale = o.width / img.w;
    const yScale = o.height / img.h;
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        //TODO: edge mode (void, clamp, wrap, mirror), x and y, origin (?), interpolation types, proper negative scales
        const idx = Math.floor(x / xScale) % img.w + Math.floor(y / yScale) % img.h * img.w;
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const a = data[idx * 4 + 3];
        img.plotPixel([r, g, b, a], x, y);
        
        /*const idx1 = Math.floor(x / o.xScale) + Math.floor(y / o.yScale) * img.w;
        const idx2 = Math.ceil(x / o.xScale) + Math.floor(y / o.yScale) * img.w;
        const idx3 = Math.floor(x / o.xScale) + Math.ceil(y / o.yScale) * img.w;
        const idx4 = Math.ceil(x / o.xScale) + Math.ceil(y / o.yScale) * img.w;
        const r = data[idx1 * 4];
        const g = data[idx1 * 4 + 1];
        const b = data[idx1 * 4 + 2];
        const xFac = x / o.xScale - Math.floor(x / o.xScale);
        const yFac = y / o.yScale - Math.floor(y / o.yScale);
        const ax1 = data[idx1 * 4 + 3] + xFac * (data[idx2 * 4 + 3] - data[idx1 * 4 + 3]);
        const ay1 = data[idx1 * 4 + 3] + yFac * (data[idx3 * 4 + 3] - data[idx1 * 4 + 3]);
        
        const ax2 = data[idx3 * 4 + 3] + xFac * (data[idx4 * 4 + 3] - data[idx3 * 4 + 3]);
        const ay2 = data[idx2 * 4 + 3] + yFac * (data[idx4 * 4 + 3] - data[idx2 * 4 + 3]);
        img.plotPixel([r, g, b, (ax1 + ay1 + ax2 + ay2) / 4], x, y);*/
        //https://en.wikipedia.org/wiki/Bilinear_interpolation#Computation
        //wikipedians love writing the most fucking over complicated fucking math equations for the simplest shit
        
        //FUCK YOU WIKIPEDIA IM NOT DONATING TO YOUR SHITTY PLACE FUCK YOOU FUCK YOU
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
        //https://www.youtube.com/watch?v=4K8IEzXnMYk
  /*      const x1 = Math.floor(x / o.xScale);
        const y1 = Math.floor(y / o.yScale);
        const x2 = Math.ceil(x / o.xScale);
        const y2 = Math.ceil(y / o.yScale);
        // 1 2
        // 3 4
        const idx1 = x1 + y1 * img.w;
        const idx2 = x2 + y1 * img.w;
        const idx3 = x1 + y2 * img.w;
        const idx4 = x2 + y2 * img.w;
        
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const a = data[idx * 4 + 3];
        img.plotPixel([r, g, b, a], x, y);*/
      }
    }
  }
}
class FilterSine extends Filter {
  name = "sine";
  
  options = {
    turns: 1
  };
  
  types = {
    turns: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 16
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        const r = Math.sin(data[idx * 4] * Math.PI * o.turns) / 2 + 0.5;
        const g = Math.sin(data[idx * 4 + 1] * Math.PI * o.turns) / 2 + 0.5;
        const b = Math.sin(data[idx * 4 + 2] * Math.PI * o.turns) / 2 + 0.5;
        const a = data[idx * 4 + 3];
        img.plotPixel([r, g, b, a], x, y);
      }
    }
  }
}
class FilterMerge extends Filter {
  name = "merge";
  
  options = {
    topBase: KEY_CANVAS,
    topAlpha: 1,
    //bottomAlpha: 1, can't figure out bottom alpha, ill deal with it later!!
    mergeBlend: BLEND_PLAIN
  };
  
  types = {
    topBase: {
      type: "layer"
    },
    topAlpha: {
      type: "number",
      step: 0.01,
      min: 0,
      max: 1
    },
    mergeBlend: LIMITS_BLEND
  };
  
  generate(o) {
    const bottomData = img.layerDataFromKey(this.od.base);
    const topData = img.layerDataFromKey(o.topBase);
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        // COPIED FROM IMAGE.JS //
        
        //color offsets
        const rOffs = idx * 4;
        const gOffs = idx * 4 + 1;
        const bOffs = idx * 4 + 2;
        const aOffs = idx * 4 + 3;
        //layer color
        const rl = topData[rOffs];
        const gl = topData[gOffs];
        const bl = topData[bOffs];
        const alpha = topData[aOffs] * o.topAlpha;
        //base color
        const rb = bottomData[rOffs];
        const gb = bottomData[gOffs];
        const bb = bottomData[bOffs];
        //color that will be printed
        let r, g, b;
        
        switch(o.mergeBlend) {
          case BLEND_ADD:
            r = (rl * alpha) + rb;
            g = (gl * alpha) + gb;
            b = (bl * alpha) + bb;
            break;
          case BLEND_MULTIPLY:
            r = (rl * alpha + 1 - alpha) * rb;
            g = (gl * alpha + 1 - alpha) * gb;
            b = (bl * alpha + 1 - alpha) * bb;
            break;
          case BLEND_PLAIN:
            //lerp
            //TODO: something something similar to img.blend()
            r = rb + alpha * (rl - rb);
            g = gb + alpha * (gl - gb);
            b = bb + alpha * (bl - bb);
            break;
          case BLEND_SCREEN:
            r = 1 - (1 - rl * alpha) * (1 - rb);
            g = 1 - (1 - gl * alpha) * (1 - gb);
            b = 1 - (1 - bl * alpha) * (1 - bb);
            break;
          case BLEND_OVERLAY:
            if(rl < 0.5) {
              r = (2 * (rl * alpha) + 1 - alpha) * rb;
            } else {
              r = 1 - (1 - (rl - 0.5) * 2 * alpha) * (1 - rb);
            }
            if(gl < 0.5) {
              g = (2 * (gl * alpha) + 1 - alpha) * gb;
            } else {
              g = 1 - (1 - (gl - 0.5) * 2 * alpha) * (1 - gb);
            }
            if(bl < 0.5) {
              b = (2 * (bl * alpha) + 1 - alpha) * bb;
            } else {
              b = 1 - (1 - (bl - 0.5) * 2 * alpha) * (1 - bb);
            }
            break;
          case BLEND_SUBTRACT:
              r = rb - (rl * alpha);
              g = gb - (gl * alpha);
              b = bb - (bl * alpha);
            break;
          case BLEND_CHANNEL_DISSOLVE:
              if(alpha > Math.random()) r = rl;
              if(alpha > Math.random()) g = gl;
              if(alpha > Math.random()) b = bl;
            break;
          case BLEND_DISSOLVE:
            if(alpha > Math.random()) {
              r = rl;
              g = gl;
              b = bl;
            }
            break;
          case BLEND_SHIFT_OVERLAY:
            if(rl < 0.5) {
              r = rb - (0.5 - rl) * 2 * alpha;
            } else {
              r = (rl - 0.5) * 2 * alpha + rb;
            }
            if(gl < 0.5) {
              g = gb - (0.5 - gl) * 2 * alpha;
            } else {
              g = (gl - 0.5) * 2 * alpha + gb;
            }
            if(bl < 0.5) {
              b = bb - (0.5 - bl) * 2 * alpha;
            } else {
              b = (bl - 0.5) * 2 * alpha + bb;
            }
            break;
          default:
            console.error(`unknown blend mode ${blend}`);
        }
        
        const a = Math.min(topData[aOffs] + bottomData[aOffs], 1);
        img.plotPixel([r, g, b, a], x, y);
      }
    }
  }
}
class FilterRepeat extends Filter {
  name = "repeat";
  
  options = {
    copies: 4,
    xOffs: 1,
    yOffs: 0,
    fadeMode: O_FADE_NEAR_CENTER
  };
  
  types = {
    copies: {
      type: "number",
      step: 1,
      min: 1,
      max: 64,
      unsafe: true
    },
    xOffs: {
      type: "number",
      step: 0.05,
      min: -32,
      max: 32
    },
    yOffs: {
      type: "number",
      step: 0.05,
      min: -32,
      max: 32
    },
    fadeMode: {
      type: "keyvalues",
      keys: [
        "no fade",
        "fade near start",
        "fade near end"
      ],
      values: [
        O_FADE_NONE,
        O_FADE_NEAR_CENTER,
        O_FADE_NEAR_EDGE
      ]
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    let xOffs = 0;
    let yOffs = 0;
    let alphaMult = (o.fadeMode == O_FADE_NEAR_CENTER) ? 0 : 1;
    
    for(let c = 0; c < o.copies; c++) {
      if(o.fadeMode == O_FADE_NEAR_CENTER) {
        alphaMult += 1 / o.copies;
      }
      
      for(let y = 0; y < img.h; y++) {
        for(let x = 0; x < img.w; x++) {
          const idx = x + y * img.w;
          const a = data[idx * 4 + 3];
          if(a == 0) continue; //don't bother plotting the pixel if it is nothing (saves A LOT of rendering time)
          const r = data[idx * 4];
          const g = data[idx * 4 + 1];
          const b = data[idx * 4 + 2];
          img.plotPixel([r, g, b, a * alphaMult], Math.round(x + xOffs), Math.round(y + yOffs));
        }
      }
      xOffs += o.xOffs;
      yOffs += o.yOffs;
      
      if(o.fadeMode == O_FADE_NEAR_EDGE) {
        alphaMult += -1 / o.copies;
      }
    }
  }
}
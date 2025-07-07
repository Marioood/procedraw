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
      type: "length",
      subtype: "width",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
    },
    y: {
      type: "length",
      subtype: "height",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
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
  
  static description = "A filter that duplicates a base layer.";
  
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
  
  static description = "A filter that repeats a rectangular chunk of a base layer over the entire canvas.";
  
  options = {
    width: new UnitLength(16, UNIT_PIXELS),
    height: new UnitLength(16, UNIT_PIXELS),
    xOffs: new UnitLength(0, UNIT_PIXELS),
    yOffs: new UnitLength(0, UNIT_PIXELS),
    xShift: new UnitLength(0, UNIT_PIXELS),
    yShift: new UnitLength(0, UNIT_PIXELS)
  };
  
  types = {
    width: {
      type: "length",
      subtype: "width",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1
    },
    height: {
      type: "length",
      subtype: "height",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1
    },
    xOffs: {
      type: "length",
      subtype: "width",
      absoluteMin: -1,
      scaledMax: 1,
      step: 1
    },
    yOffs: {
      type: "length",
      subtype: "height",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
    },
    xShift: {
      type: "length",
      subtype: "width",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
    },
    yShift: {
      type: "length",
      subtype: "height",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    const width = UnitLength.getLength(o.width, img.w, true);
    const height = UnitLength.getLength(o.height, img.h, true);
    const xOffs = UnitLength.getLength(o.xOffs, img.w, true);
    const yOffs = UnitLength.getLength(o.yOffs, img.h, true);
    const xShift = UnitLength.getLength(o.xShift, img.w, true);
    const yShift = UnitLength.getLength(o.yShift, img.h, true);
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        
        const xi = mod((x - xOffs), width) + xOffs;
        const yi = mod((y - yOffs), height) + yOffs;
        const idx = mod(xi, img.w) + mod(yi, img.h) * img.w;
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const a = data[idx * 4 + 3];
        img.plotPixel([r, g, b, a], x - xOffs + xShift * Math.floor(y / height), y - yOffs + yShift * Math.floor(x / width));
      }
    }
  }
}

class FilterInvert extends Filter {
  name = "invert";
  
  static description = "A filter that inverts a base layer.";
  
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
  //see what this layer could do with lengths input
  name = "scale";
  
  static description = "A filter that scales a base layer.";
  
  options = {
    xScale: 2,
    yScale: 2,
    edgeMode: O_WRAP, //wet option
    interpMode: INTERP_NEAREST
  };
  
  types = {
    xScale: {
      type: "number",
      step: 0.05,
      max: 16
    },
    yScale: {
      type: "number",
      step: 0.05,
      max: 16
    },
    edgeMode: {
      type: "keyvalues",
      keys: [
        "wrap",
        "clamp",
        "void",
        "reflect"
      ],
      values: [
        O_WRAP,
        O_CLAMP,
        O_VOID,
        O_REFLECT
      ]
    },
    interpMode: LIMITS_INTERP
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    const xScale = o.xScale;
    const yScale = o.yScale;
    //negative scales slightly shift the picture, so undo that
    const xOffs = (xScale < 0) ? -1 : 0;
    const yOffs = (yScale < 0) ? -1 : 0;
    
    //TODO: x and y, origin (?), interpolation types, proper negative scales
    //option to recursively scale down? could be neat
    switch(o.edgeMode) {
      case O_WRAP:
        for(let y = 0; y < img.h; y++) {
          for(let x = 0; x < img.w; x++) {
            const xIdx = mod(x / xScale, img.w);
            const yIdx = mod(y / yScale, img.h);
            /*const idx = xIdx + yIdx;
            const r = data[idx * 4];
            const g = data[idx * 4 + 1];
            const b = data[idx * 4 + 2];
            const a = data[idx * 4 + 3];*/
            img.plotPixel(img.getPixelFromData(xIdx, yIdx, data, o.interpMode), x, y);
          }
        }
        break;
      case O_CLAMP:
        for(let y = 0; y < img.h; y++) {
          for(let x = 0; x < img.w; x++) {
            const xIdx = Math.max(Math.min(Math.floor(x / xScale), img.w - 1), 0);
            const yIdx = Math.max(Math.min(Math.floor(y / yScale), img.h - 1), 0);
            img.plotPixel(img.getPixelFromData(xIdx, yIdx, data, o.interpMode), x, y);
          }
        }
        break;
      case O_VOID:
        for(let y = 0; y < Math.min(img.h * yScale, img.h); y++) {
          for(let x = 0; x < Math.min(img.w * xScale, img.w); x++) {
            const xIdx = Math.floor(x / xScale);
            const yIdx = Math.floor(y / yScale);
            img.plotPixel(img.getPixelFromData(xIdx, yIdx, data, o.interpMode), x, y);
          }
        }
        break;
      case O_REFLECT:
      
        for(let y = 0; y < img.h; y++) {
          for(let x = 0; x < img.w; x++) {
            let xNorm = x / xScale / img.w;
            let yNorm = y / yScale / img.h;
            
            if(mod(Math.floor(xNorm), 2) == 1) {
              xNorm = 1 - mod(xNorm, 1);
            } else {
              xNorm = mod(xNorm, 1);
            }
            if(mod(Math.floor(yNorm), 2) == 1) {
              yNorm = 1 - mod(yNorm, 1);
            } else {
              yNorm = mod(yNorm, 1);
            }
            const xIdx = Math.ceil(xNorm * (img.w - 1));
            const yIdx = Math.ceil(yNorm * (img.h - 1));
            img.plotPixel(img.getPixelFromData(xIdx, yIdx, data, o.interpMode), x, y);
          }
        }
        break;
    }
  }
}
class FilterSine extends Filter {
  name = "sine";
  
  static description = "A filter that puts a base layer's pixels through a sine wave function.";
  
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
  
  static description = "A filter that renders a top layer onto a base layer.";
  
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
          case BLEND_OVERBLOWN_TEST:
            //the layer color is displayed as magenta if it's is overblown
            const isOverblown = rl > 1 || gl > 1 || bl > 1;
            //the color is displayed as green if it's underblown
            const isUnderblown = rl < 0 || gl < 0 || bl < 0;
            //the color is displayed as yellow if it's NaN
            const isNaN = rl != rl || gl != gl || bl != bl;
            
            if(isOverblown) {
              r = 1;
            } else if(isUnderblown) {
              r = 0;
            } else if(isNaN) {
              r = 1;
            } else {
              r = rb + alpha * (rl - rb);
            }
            if(isOverblown) {
              g = 0;
            } else if(isUnderblown) {
              g = 1;
            } else if(isNaN) {
              g = 1;
            } else {
              g = gb + alpha * (gl - gb);
            }
            if(isOverblown) {
              b = 1;
            } else if(isUnderblown) {
              b = 0;
            } else if(isNaN) {
              b = 0;
            } else {
              b = bb + alpha * (bl - bb);
            }
            break;
          case BLEND_BAYER:
            if(alpha > BLEND_TABLE_BAYER[x % 4 + y % 4 * 4]) {
              r = rl;
              g = gl;
              b = bl;
            }
            break;
          case BLEND_HALFTONE:
            if(alpha > BLEND_TABLE_HALFTONE[x % 8 + y % 8 * 8]) {
              r = rl;
              g = gl;
              b = bl;
            }
            break;
          default:
            console.error(`unknown blend mode ${o.mergeBlend}`);
        }
        
        const a = Math.min(topData[aOffs] + bottomData[aOffs], 1);
        img.plotPixel([r, g, b, a], x, y);
      }
    }
  }
}
class FilterRepeat extends Filter {
  name = "repeat";
  
  static description = "A filter that duplicates and offsets a base layer.";
  
  options = {
    copies: 4,
    xOffs: 1,
    yOffs: 0,
    fadeMode: O_FADE_NEAR_END
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
        O_FADE_NEAR_START,
        O_FADE_NEAR_END
      ]
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    let xOffs = 0;
    let yOffs = 0;
    let alphaMult = (o.fadeMode == O_FADE_NEAR_START) ? 0 : 1;
    
    for(let c = 0; c < o.copies; c++) {
      if(o.fadeMode == O_FADE_NEAR_START) {
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
      
      if(o.fadeMode == O_FADE_NEAR_END) {
        alphaMult += -1 / o.copies;
      }
    }
  }
}

class FilterMask extends Filter {
  name = "mask";
  
  static description = "A filter that takes in a layer to compare and renders parts of a base layer depending on the comparison layer's brightness of pixels.";
  
  options = {
    maskBase: KEY_CANVAS,
    maskValue: 0.5,
    useRed: true,
    useGreen: true,
    useBlue: true,
    useAlpha: false,
    mode: O_GREATER_THAN,
    precision: 0,
    mergeAlpha: false
  };
  
  types = {
    maskBase: {
      type: "layer"
    },
    maskValue: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    useRed: {
      type: "boolean"
    },
    useGreen: {
      type: "boolean"
    },
    useBlue: {
      type: "boolean"
    },
    useAlpha: {
      type: "boolean"
    },
    mode: {
      type: "keyvalues",
      keys: [
        "layer color > value",
        "layer color < value",
        "layer color = value",
        "layer color NOT = value",
        "layer color >= value",
        "layer color <= value"
      ],
      values: [
        O_GREATER_THAN,
        O_LESS_THAN,
        O_EQUAL_TO,
        O_NOT_EQUAL_TO,
        O_GREATER_THAN_OR_EQUAL_TO,
        O_LESS_THAN_OR_EQUAL_TO
      ]
    },
    precision: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    mergeAlpha: {
      type: "boolean"
    }
  };
  
  generate(o) {
    const baseData = img.layerDataFromKey(this.od.base);
    const compareData = img.layerDataFromKey(o.maskBase);
    let compareValue = 0;
    //the values being compared will be between 0 and the number of channels being compared
    if(o.useRed) compareValue += o.maskValue;
    if(o.useGreen) compareValue += o.maskValue;
    if(o.useBlue) compareValue += o.maskValue;
    if(o.useAlpha) compareValue += o.maskValue;
    
    const channelCount = compareValue / o.maskValue;
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        //base color
        const rb = baseData[idx * 4];
        const gb = baseData[idx * 4 + 1];
        const bb = baseData[idx * 4 + 2];
        const ab = baseData[idx * 4 + 3] * (o.mergeAlpha ? compareData[idx * 4 + 3] : 1);
        
        let compareColor = 0;
        if(o.useRed) compareColor += compareData[idx * 4];
        if(o.useGreen) compareColor += compareData[idx * 4 + 1];
        if(o.useBlue) compareColor += compareData[idx * 4 + 2];
        if(o.useAlpha) compareColor += compareData[idx * 4 + 3];
        //0 is the highest precision, 1 is 0 or 1
        if(o.precision != 0) compareColor = Math.round(compareColor / (o.precision * channelCount)) * o.precision * channelCount;
          
        switch(o.mode) {
          case O_GREATER_THAN:                
            if(compareColor > compareValue) {
              img.plotPixel([rb, gb, bb, ab], x, y);
            }
            break;
          case O_LESS_THAN:                
            if(compareColor < compareValue) {
              img.plotPixel([rb, gb, bb, ab], x, y);
            }
            break;
          case O_EQUAL_TO:                
            if(compareColor == compareValue) {
              img.plotPixel([rb, gb, bb, ab], x, y);
            }
            break;
          case O_NOT_EQUAL_TO:                
            if(compareColor != compareValue) {
              img.plotPixel([rb, gb, bb, ab], x, y);
            }
            break;
          case O_GREATER_THAN_OR_EQUAL_TO:                
            if(compareColor >= compareValue) {
              img.plotPixel([rb, gb, bb, ab], x, y);
            }
            break;
          case O_LESS_THAN_OR_EQUAL_TO:                
            if(compareColor <= compareValue) {
              img.plotPixel([rb, gb, bb, ab], x, y);
            }
            break;
        }
      }
    }
  }
}

class FilterEmboss extends Filter {
  name = "emboss";
  
  static description = "A filter that lightens/darkens the edges of a base layer. Works well when the blend mode is set to overlay.";
  
  options = {
    dir: 45,
    strength: 1,
    thickness: 1,
    onlyUseAlpha: false
  };
  
  types = {
    dir: {
      type: "direction"
    },
    strength: {
      type: "number",
      step: 0.5,
      min: 0,
      max: 16
    },
    thickness: {
      type: "number",
      step: 1,
      min: 1,
      max: 16
    },
    onlyUseAlpha: {
      type: "boolean"
    }
  };
  //like repeated emboss
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        //doesnt work well, do fancy trig stuff for the positions
        //also like... mix the layers together decimal-ey
        const xOffs = Math.round(Math.sin(DEG2RAD * o.dir) * o.thickness);
        const yOffs = Math.round(Math.cos(DEG2RAD * o.dir) * o.thickness);
        const idx2 = mod(x - xOffs, img.w) + mod(y - yOffs, img.h) * img.w;
        //make alpha affect output but not in a direct alpha way. do like rl * alpha or something
        const al = data[idx2 * 4 + 3];
        const rl = data[idx2 * 4] * al;
        const gl = data[idx2 * 4 + 1] * al;
        const bl = data[idx2 * 4 + 2] * al;
        
        const ab = data[idx * 4 + 3];
        const rb = data[idx * 4] * ab;
        const gb = data[idx * 4 + 1] * ab;
        const bb = data[idx * 4 + 2] * ab;
        
        if(o.onlyUseAlpha) {
          const a = ((ab + 0.5 * (1 - al - ab)) - 0.5) * o.strength + 0.5;
          img.plotPixel([clamp(a, 0, 1), clamp(a, 0, 1), clamp(a, 0, 1), 1], x, y);
        } else {
          const r = ((rb + 0.5 * (1 - rl - rb)) - 0.5) * o.strength + 0.5;
          const g = ((gb + 0.5 * (1 - gl - gb)) - 0.5) * o.strength + 0.5;
          const b = ((bb + 0.5 * (1 - bl - bb)) - 0.5) * o.strength + 0.5;
          img.plotPixel([clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), 1], x, y);
        }
      }
    }
  }
}

class FilterContrast extends Filter {
  name = "contrast";
  
  static description = "A filter that exaggerates the light and dark parts of a base layer.";
  
  options = {
    strength: 2,
    brightness: 0,
    normalize: false
  };
  
  types = {
    strength: {
      type: "number",
      step: 0.5,
      min: 0,
      max: 100
    },
    brightness: {
      type: "number",
      step: 0.01,
      min: -1,
      max: 1
    },
    normalize: {
      type: "boolean"
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    if(o.normalize) {
      //makes the brightness of the filter between 1 and 0
      //idk kinda hard to explain
      //absurd numbers so that they get overridden
      let min = 99999999999999;
      let max = -99999999999999;
      //find min and max
      for(let y = 0; y < img.h; y++) {
        for(let x = 0; x < img.w; x++) {
          const idx = x + y * img.w;
          const r = data[idx * 4];
          const g = data[idx * 4 + 1];
          const b = data[idx * 4 + 2];
          const brightness = (r + g + b) / 3;
         
          if(brightness > max) max = brightness;
          if(brightness < min) min = brightness;
        }
      }
      
      for(let y = 0; y < img.h; y++) {
        for(let x = 0; x < img.w; x++) {
          const idx = x + y * img.w;
          const r = (data[idx * 4] - min) / (max - min);
          const g = (data[idx * 4 + 1] - min) / (max - min);
          const b = (data[idx * 4 + 2] - min) / (max - min);
          const a = data[idx * 4 + 3];
          img.plotPixel([r, g, b, a], x, y);
        }
      }
    } else {
      for(let y = 0; y < img.h; y++) {
        for(let x = 0; x < img.w; x++) {
          const idx = x + y * img.w;
          const r = clamp((clamp(data[idx * 4] + o.brightness, 0, 1) - 0.5) * o.strength + 0.5, 0, 1);
          const g = clamp((clamp(data[idx * 4 + 1] + o.brightness, 0, 1) - 0.5) * o.strength + 0.5, 0, 1);
          const b = clamp((clamp(data[idx * 4 + 2] + o.brightness, 0, 1) - 0.5) * o.strength + 0.5, 0, 1);
          const a = data[idx * 4 + 3];
          img.plotPixel([r, g, b, a], x, y);
        }
      }
      
    }
  }
}

class FilterBlur extends Filter {
  name = "blur";
  
  static description = "A filter that blurs a base layer.";
  
  options = {
    blurRadius: new UnitLength(1, UNIT_PIXELS),
    blurMode: O_BLUR_BOX
  };
  
  types = {
    blurRadius: {
      type: "length",
      subtype: "longest",
      absoluteMin: 1,
      scaledMax: 0.25,
      step: 1,
      unsafe: true
    },
    blurMode: {
      type: "keyvalues",
      keys: [
        "box",
        "bokeh"
      ],
      values: [
        O_BLUR_BOX,
        O_BLUR_BOKEH
      ]
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    const blurRadius = UnitLength.getLength(o.blurRadius, Math.min(img.w, img.h), true);
    const blurDiameter = blurRadius * 2 + 1;
    let weightTable = new Array(blurDiameter * blurDiameter);
    let totalWeight = 0;
    //pre compute the weights for the blur (fast)
    switch(o.blurMode) {
      case O_BLUR_BOX:
        for(let yi = -blurRadius; yi <= blurRadius; yi++) {
          for(let xi = -blurRadius; xi <= blurRadius; xi++) {
            const idx = xi + blurRadius + (yi + blurRadius) * blurDiameter;
            const weight = 1;
            weightTable[idx] = weight;
            totalWeight += weight;
          }
        }
        break;
      case O_BLUR_BOKEH:
        for(let yi = -blurRadius; yi <= blurRadius; yi++) {
          for(let xi = -blurRadius; xi <= blurRadius; xi++) {
            const idx = xi + blurRadius + (yi + blurRadius) * blurDiameter;
            //the weight will go below 0 in the corners unless clamped
            //add 1 to the radius so that a blurRadius of 1 will blur the layer
            const weight = Math.max(1 - Math.sqrt(xi * xi + yi * yi) / (blurRadius + 1), 0);
            
            weightTable[idx] = weight;
            totalWeight += weight;
          }
        }
        break;
    }
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        //average
        for(let yi = -blurRadius; yi <= blurRadius; yi++) {
          for(let xi = -blurRadius; xi <= blurRadius; xi++) {
            const imageIdx = mod(x + xi, img.w) + mod(y + yi, img.h) * img.w;
            const weightIdx = xi + blurRadius + (yi + blurRadius) * blurDiameter;
            const weight = weightTable[weightIdx];
            
            r += data[imageIdx * 4] * weight;
            g += data[imageIdx * 4 + 1] * weight;
            b += data[imageIdx * 4 + 2] * weight;
            a += data[imageIdx * 4 + 3] * weight;
          }
        }
        r /= totalWeight;
        g /= totalWeight;
        b /= totalWeight;
        a /= totalWeight;
        img.plotPixel([r, g, b, a], x, y);
      }
    }
  }
}

class FilterHSV extends Filter {
  name = "HSV";
  
  static description = "A filter that modifies the hue, saturation, and value of a base layer.";
  
  options = {
    hue: 180,
    satty: 1,
    value: 1
  };
  
  types = {
    hue: {
      type: "direction"
    },
    satty: {
      type: "number",
      max: 1,
      min: 0,
      step: 0.05
    },
    value: {
      type: "number",
      max: 1,
      min: 0,
      step: 0.05
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const a = data[idx * 4 + 3];
        
        let hsv = RGB2HSV([r, g, b]);
        hsv[0] = mod(hsv[0] + o.hue, 360);
        hsv[1] = clamp(hsv[1] * o.satty, 0, 100);
        hsv[2] = clamp(hsv[2] * o.value, 0, 100);
        let rgb = HSV2RGB(hsv);
        
        img.plotPixel([rgb[0], rgb[1], rgb[2], a], x, y);
      }
    }
  }
}

class FilterSharpen extends Filter {
  name = "sharpen";
  
  static description = "A filter that enhances the edges of a base layer.";
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        let sharpness = 0;
        
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const brightness = (r + g + b) / 3;
        
        for(let yi = -1; yi <= 1; yi++) {
          for(let xi = -1; xi <= 1; xi++) {
            const kernalIdx = mod(x + xi, img.w) + mod(y + yi, img.h) * img.w;
            if(yi == 0 && xi == 0) continue; //skip center
            const rk = data[kernalIdx * 4];
            const gk = data[kernalIdx * 4 + 1];
            const bk = data[kernalIdx * 4 + 2];
            const kernalBrightness = (rk + gk + bk) / 3;
            sharpness += brightness - kernalBrightness;
          }
        }
        //normalize
        sharpness /= 8;
        sharpness += 0.5;
        
        img.plotPixel([sharpness, sharpness, sharpness, 1], x, y);
      }
    }
  }
}

class FilterOffset extends Filter {
  name = "offset";
  
  static description = "A filter that offsets a base layer based on another layer's pixels. It can be useful to use the vectorize filter with this.\n\nThe red channels controls x movement (0 is fully left, 127 is the center, 255 is fully right). The green channels controls y movement (0 is fully down, 127 is the center, 255 is fully up).";
  
  options = {
    offsetLayer: KEY_CANVAS,
    magnitude: new UnitLength(4, UNIT_PIXELS)
  };
  
  types = {
    offsetLayer: {
      type: "layer"
    },
    magnitude: {
      type: "length",
      subtype: "longest",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
    }
  };
  
  generate(o) {
    const baseData = img.layerDataFromKey(this.od.base);
    const offsetData = img.layerDataFromKey(o.offsetLayer);
    
    const magnitude = UnitLength.getLength(o.magnitude, Math.min(img.w, img.h));
    /*for(let y = 0; y < img.h; y++) {
      let xOffs = Math.sin(y / img.h * Math.PI) * 4;
      for(let x = 0; x < img.w; x++) {
        let yOffs = Math.sin(x / img.w * Math.PI * 4) * 2;
        const idx = mod(x + Math.floor(xOffs), img.w) + mod(y + Math.floor(yOffs), img.h) * img.w;
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const a = data[idx * 4 + 3];
        img.plotPixel([r, g, b, a], x, y);
      }
    }*/
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const staticIdx = x + y * img.w;
        
        const ro = offsetData[staticIdx * 4];
        const go = offsetData[staticIdx * 4 + 1];
        const bo = offsetData[staticIdx * 4 + 2];
        const ao = offsetData[staticIdx * 4 + 3];
        //between -1...1
        const xOffs = (ro * 2 - 1) * ao;
        const yOffs = (go * 2 - 1) * ao;
        
        const offsetIdx = mod(x + Math.floor(xOffs * magnitude), img.w) + mod(y + Math.floor(yOffs * magnitude), img.h) * img.w;
        
        const rb = baseData[offsetIdx * 4];
        const gb = baseData[offsetIdx * 4 + 1];
        const bb = baseData[offsetIdx * 4 + 2];
        const ab = baseData[offsetIdx * 4 + 3];
        img.plotPixel([rb, gb, bb, ab], x, y);
      }
    }
  }
}

class FilterVectorize extends Filter {
  name = "vectorize";
  
  static description = "A filter that generates a normal map of a base layer.";
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    //   +y
    //-x +- +x
    //   -y
    
    //TODO: strength
    //TODO: invert channels blahhhh
    //TODO: which channels are which axis
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const brightness = (r + g + b) / 3;
        
        let yMag = 0;
        let xMag = 0;
        
        for(let yi = -1; yi <= 1; yi++) {
          for(let xi = -1; xi <= 1; xi++) {
            const kernalIdx = mod(x + xi, img.w) + mod(y + yi, img.h) * img.w;
            if(yi == 0 && xi == 0) continue; //skip center
            const rk = data[kernalIdx * 4];
            const gk = data[kernalIdx * 4 + 1];
            const bk = data[kernalIdx * 4 + 2];
            const kernalBrightness = (rk + gk + bk) / 3;
            
            if(xi > 0) {
              xMag += brightness - kernalBrightness;
            } else if(xi < 0) {
              xMag -= brightness - kernalBrightness;
            }
            
            if(yi > 0) {
              yMag += brightness - kernalBrightness;
            } else if(yi < 0) {
              yMag -= brightness - kernalBrightness;
            }
          }
        }
        //normalize
        xMag /= 6;
        xMag += 0.5;
        yMag /= 6;
        yMag += 0.5;
        
        img.plotPixel([xMag, yMag, 0, 1], x, y);
      }
    }
  }
}

class FilterSunlight extends Filter {
  name = "sunlight";
  
  static description = "A filter that simulates sunlight from a single direction over a base layer. Works well with the vectorize filter.";
  
  options = {
    dir: 225,
    lightColor: [1, 1, 1, 1],
    ambientColor: [0, 0, 0, 1]
    //TODO: combine?
    //TODO: strength
  };
  
  types = {
    dir: {
      type: "direction"
    },
    lightColor: {
      type: "color"
    },
    ambientColor: {
      type: "color"
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    //this is which way the light is pointing
    //compared to the emboss layer, whose dir controls which way the light is coming from
    //basically, the dir here and the dir in the emboss layer should be opposite for the same-ish lighting result
    const dir = (90 - o.dir + 180) * DEG2RAD;
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const a = data[idx * 4 + 3];
        const xVec = r * 2 - 1;
        const yVec = g * 2 - 1;
        //TDOD: this dir conversion stuff should be done earlier to save on time
        const brightness = (xVec * Math.cos(dir) + yVec * Math.sin(dir)) / 2 + 0.5;
        
        img.plotPixel(colorMix(o.lightColor, o.ambientColor, brightness), x, y);
      }
    }
  }
}

class FilterShear extends Filter {
  name = "shear";
  
  static description = "A filter that shears a base layer.";
  
  options = {
    xMagnitude: new UnitLength(0.5, UNIT_PIXELS),
    yMagnitude: new UnitLength(0, UNIT_PIXELS),
    interpMode: INTERP_NEAREST
  };
  
  types = {
    xMagnitude: {
      type: "length",
      subtype: "width",
      scaledMin: -0.25,
      scaledMax: 0.25,
      step: 0.05
    },
    yMagnitude: {
      type: "length",
      subtype: "height",
      scaledMin: -0.25,
      scaledMax: 0.25,
      step: 0.05
    },
    interpMode: LIMITS_INTERP
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    
    const xMagnitude = UnitLength.getLength(o.xMagnitude, img.w);
    const yMagnitude = UnitLength.getLength(o.yMagnitude, img.h);
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const xIdx = mod(x + y * xMagnitude, img.w);
        const yIdx = mod(y + x * yMagnitude, img.h);
        
        img.plotPixel(img.getPixelFromData(xIdx, yIdx, data, o.interpMode), x, y);
      }
    }
  }
}


/*class FilterLightbulb extends Filter {
  name = "lightbulb";
  
  static description = "A filter that simulates light from a single source over a base layer. Works well with the vectorize filter.";
  
  options = {
    xLight: new UnitLength(50, UNIT_PERCENTAGE),
    yLight: new UnitLength(50, UNIT_PERCENTAGE),
    radius: new UnitLength(16, UNIT_PIXELS)
    //TODO: combine?
    //TODO: light color
    //TODO: ambient color
    //TODO: sunlight or point light
    //TODO: strength
    //TODO: zLight (height from surface)
    //TODO: direction seems more sunlight-ish, while the radius stuff seems more point light-ish
  };
  
  types = {
    xLight: {
      type: "length",
      subtype: "position"
    },
    yLight: {
      type: "length",
      subtype: "position"
    },
    radius: {
      type: "length",
      subtype: "dimension"
    }
  };
  
  generate(o) {
    const data = img.layerDataFromKey(this.od.base);
    const xLight = UnitLength.getLength(o.xLight, img.w);
    const yLight = UnitLength.getLength(o.yLight, img.h);
    const radius = UnitLength.getLength(o.radius, Math.min(img.w, img.h));
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const idx = x + y * img.w;
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const xVecBase = r * 2 - 1;
        const yVecBase = g * 2 - 1;
        
        const xVecLight = xLight - x; //adjacent
        const yVecLight = yLight - y; //opposite
        //const hypotenuse = Math.sqrt(adjacent * adjacent + opposite * opposite);
        //const dotProduct = xVecLight * xVecBase + yVecLight * xVecBase;
        //const lightDist = 1 - hypotenuse / radius;
        
        //direction from the current pixel to the light
        //also this could be optimized with trig stuff (calculate sine with previous stuffs)
        const dirBase = Math.atan(yVecBase / xVecBase);
        const dirLight = Math.atan(yVecLight / xVecLight);
        
        const brightness = Math.cos(dirBase + dirLight) + Math.sin(dirBase + dirLight) / 2 + 0.5;
        img.plotPixel([brightness, brightness, brightness, 1], x, y);
      }
    }
  }
}*/
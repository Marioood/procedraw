//
// All Procedraw material is licensed under MIT
// Author: Marioood
// Purpose: layer classes (data processing)
//

"use strict";
/*
default layer options are stored in a layer class as "options" object
new options are passed into generate() as "o" (short for options)
*/

class Layer {
  //class name
  name;
  //the hover hint for this layer. basically just a description of what it looks like.
  static description;
  //user defined name
  displayName;
  //rendered pixel data, used by filter layers
  data;
  //this should be self explanatory
  isFilter = false;
  //how many filters are being applied to this layer
  linkCount = 0;
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
    blend: O_BLEND_PLAIN,
    //multiply the image by a color
    tint: [1, 1, 1, 1],
    shown: true,
    //position offsets
    x: new UnitLength(0, UNIT_PIXELS),
    y: new UnitLength(0, UNIT_PIXELS),
    //layer key used by filters (hidden for non-filters)
    base: KEY_CANVAS
  };
  
  typesDefault = {
    alpha: {
      type: "number",
      step: 0.01,
      min: 0,
      max: 1
    },
    blend: LIMITS_BLEND,
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
    tint: {
      type: "color",
      external: true,
      brotherId: "dyn-icon-tint-"
    },
    shown: {
      type: "boolean",
      hidden: true
    },
    base: {
      type: "layer",
      hidden: true
    }
  };
  
  generate(img, o) {
    //img is where the height and width are stored
    //o is short for "options"
    //TODO: create layer wrappers
    //maybe remove? options will always be taken from this object.... so its kinda redundant
    //these aint static and are created AS the layers, so im not sure why i did it like that
  }
  
  tintIcon(icon) {
    //used for multi color layers (border, worley, etc.) icon's
    //this COULD work, but then i'd have to deal with adding svgs into the document as <svg> tags instead of images, which would introduce far too much voodoo (see: https://stackoverflow.com/questions/70401341/load-svg-from-file-using-javascript)
  }
}

class LayerXorFractal extends Layer {
  name = "xorFractal";
  
  static description = "A bitwise XOR fractal. Can also be changed to an AND or OR fractal.";
  
  options = {
    width: new UnitLength(100, UNIT_PERCENTAGE),
    height: new UnitLength(100, UNIT_PERCENTAGE),
    operation: O_BITWISE_XOR
  };
  
  types = {
    width: {
      type: "length",
      subtype: "width",
      scaledMin: 0,
      scaledMax: 1,
      step: 1
    },
    height: {
      type: "length",
      subtype: "height",
      scaledMin: 0,
      scaledMax: 1,
      step: 1
    },
    operation: {
      type: "keyvalues",
      keys: [
        "xor",
        "and",
        "or"
      ],
      values: [
        O_BITWISE_XOR,
        O_BITWISE_AND,
        O_BITWISE_OR
      ]
    }
  };
  
  generate(img, o) {
    const xScale = 256 / UnitLength.getLength(o.width, img.w);
    const yScale = 256 / UnitLength.getLength(o.height, img.h);
    //TODO: fractals are too dark around their edges (not normalized)
    switch(o.operation) {
      case O_BITWISE_XOR:
        for(let y = 0; y < img.h; y++) {
          for(let x = 0; x < img.w; x++) {
            let col = ((x * xScale) ^ (y * yScale)) / 255;
            img.plotPixel([col, col, col, 1], x, y);
          }
        }
        break;
      case O_BITWISE_AND:
        for(let y = 0; y < img.h; y++) {
          for(let x = 0; x < img.w; x++) {
            let col = ((x * xScale) & (y * yScale)) / 255;
            img.plotPixel([col, col, col, 1], x, y);
          }
        }
        break;
      case O_BITWISE_OR:
        for(let y = 0; y < img.h; y++) {
          for(let x = 0; x < img.w; x++) {
            let col = ((x * xScale) | (y * yScale)) / 255;
            img.plotPixel([col, col, col, 1], x, y);
          }
        }
        break;
    }
  }
}

class LayerSolid extends Layer {
  name = "solid";
  
  static description = "A layer of solid color.";
  
  options = {
    width: new UnitLength(100, UNIT_PERCENTAGE),
    height: new UnitLength(100, UNIT_PERCENTAGE)
  };
  
  types = {
    width: {
      type: "length",
      subtype: "width",
      scaledMin: 0,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    height: {
      type: "length",
      subtype: "height",
      scaledMin: 0,
      scaledMax: 1,
      step: 1,
      unsafe: true
    }
  };
  
  generate(img, o) {
    let width = UnitLength.getLength(o.width, img.w);
    let height = UnitLength.getLength(o.height, img.h);
    
    for(let y = 0; y < height; y++) {
      for(let x = 0; x < width; x++) {
        img.plotPixel([1, 1, 1, 1], x, y);
      }
    }
  }
}

class LayerNoise extends Layer {
  name = "noise";
  
  static description = "A layer of TV static.";
  
  options = {
    coverage: 1,
    correlated: true,
    lowColor: [0, 0, 0, 1],
    highColor: [1, 1, 1, 1]
  };
  
  types = {
    coverage: {
      type: "number",
      min: 0,
      max: 1,
      step: 0.05
    },
    correlated: {
      type: "boolean"
    },
    lowColor: {
      type: "color"
    },
    highColor: {
      type: "color"
    }
  };
  
  generate(img, o) {
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        if(o.coverage > Math.random()) {
          if(o.correlated) {
            const weight = Math.random();
            const col = colorMix(o.lowColor, o.highColor, weight);
            img.plotPixel(col, x, y);
          } else {
            const r = colorMix(o.lowColor, o.highColor, Math.random())[0];
            const g = colorMix(o.lowColor, o.highColor, Math.random())[1];
            const b = colorMix(o.lowColor, o.highColor, Math.random())[2];
            const a = colorMix(o.lowColor, o.highColor, Math.random())[3];
            img.plotPixel([r, g, b, a], x, y);
          }
        }
      }
    }
  }
}

class LayerBorder extends Layer {
  name = "border";
  
  static description = "An outline of a rectangle with different colored sides.";
  
  options = {
    width: new UnitLength(100, UNIT_PERCENTAGE),
    height: new UnitLength(100, UNIT_PERCENTAGE),
    thickness: new UnitLength(1, UNIT_PIXELS),
    colorTop: [1, 1, 1, 1],
    colorLeft: [0.75, 0.75, 0.75, 1],
    colorBottom: [0, 0, 0, 1],
    colorRight: [0.25, 0.25, 0.25, 1],
    fadeMode: O_FADE_NONE
  };
  
  types = {
    width: {
      type: "length",
      subtype: "width",
      scaledMin: 0,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    height: {
      type: "length",
      subtype: "height",
      scaledMin: 0,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    thickness: {
      type: "length",
      subtype: "width",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    colorTop: {
      type: "color"
    },
    colorLeft: {
      type: "color"
    },
    colorBottom: {
      type: "color"
    },
    colorRight: {
      type: "color"
    },
    fadeMode: {
      type: "keyvalues",
      keys: [
        "no fade",
        "fade near center",
        "fade near edge"
      ],
      values: [
        O_FADE_NONE,
        O_FADE_NEAR_START,
        O_FADE_NEAR_END
      ]
    }
  };
  
  generate(img, o) {
    function blend(c1, c2, alp) {
      return colorMix([c1[0], c1[1], c1[2], c1[3] * alp], [c2[0], c2[1], c2[2], c2[3] * alp], 0.5);
    }
    function fade(c, alp) {
      return [c[0], c[1], c[2], c[3] * alp];
    }
    const thickness = UnitLength.getLength(o.thickness, Math.min(img.w, img.h), true);
    
    const alphaStep = 1 / thickness;
    let alpha = 1;
    
    if(o.fadeMode == O_FADE_NEAR_END) {
      alpha = 0;
    }
    const width = UnitLength.getLength(o.width, img.w, true);
    const height = UnitLength.getLength(o.height, img.h, true);
    
    for(let t = 1; t < thickness + 1; t++) {
      if(o.fadeMode == O_FADE_NEAR_END) {
        alpha += alphaStep;
      }
      //left and right edges
      for(let y = t; y < height - t; y++) {
        img.plotPixel(fade(o.colorLeft, alpha), t - 1, y);
        img.plotPixel(fade(o.colorRight, alpha), width - t, y);
      }
      //top and bottom edges
      for(let x = t; x < width - t; x++) {
        img.plotPixel(fade(o.colorTop, alpha), x, t - 1);
        img.plotPixel(fade(o.colorBottom, alpha), x, height - t);
      }
      //corners
      img.plotPixel(blend(o.colorTop, o.colorLeft, alpha), t - 1, t - 1);
      img.plotPixel(blend(o.colorTop, o.colorRight, alpha), width - t, t - 1);
      img.plotPixel(blend(o.colorBottom, o.colorLeft, alpha), t - 1, height - t);
      img.plotPixel(blend(o.colorBottom, o.colorRight, alpha), width - t, height - t);
      
      if(o.fadeMode == O_FADE_NEAR_START) {
        alpha -= alphaStep;
      }
    }
  }
  
  /*tintIcon(icon) {
    const top = icon.getElementsByClassName("ico-top")[0];
    const bottom = icon.getElementsByClassName("ico-bottom")[0];
    const right = icon.getElementsByClassName("ico-right")[0];
    const left = icon.getElementsByClassName("ico-left")[0];
    
    top.fill = RGB2Hex(this.options.colorTop);
    bottom.fill = RGB2Hex(this.options.colorBottom);
    right.fill = RGB2Hex(this.options.colorRight);
    left.fill = RGB2Hex(this.options.colorLeft);
  }*/
}

class LayerLiney extends Layer {
  name = "liney";
  
  static description = "A layer of stretched out TV static.";
  
  options = {
    breaks: 0.5,
    depth: 255,
    bias: 1,
    dir: true,
    coverage: 1,
    highColor: [1, 1, 1, 1],
    lowColor: [0, 0, 0, 1]
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
    bias: {
      type: "number",
      step: 0.05,
      max: 2,
      min: 0
    },
    dir: {
      type: "boolean",
      direction: true
    },
    coverage: {
      type: "number",
      step: 0.05,
      max: 1,
      min: 0
    },
    highColor: {
      type: "color"
    },
    lowColor: {
      type: "color"
    }
  }
  
  generate(img, o) {
    let maxL, maxI;

    if(o.dir) {
      maxL = img.w;
      maxI = img.h;
    } else {
      maxL = img.h;
      maxI = img.w;
    }
    let isDrawn = Math.random() > o.coverage;
    
    for(let i = 0; i < maxI; i++) {
      let col = 0.5;
      //fix tiling by shifting each strip of lines by a random amount
      let randOffs = Math.floor(Math.random() * maxL);
      
      for(let l = 0; l < maxL; l++) {
        if(Math.random() < o.breaks || l == 0) {
          col = Math.round((Math.random() * o.bias) * o.depth) / o.depth;
          isDrawn = Math.random() < o.coverage;
        }
        let x, y;
        if(o.dir) {
          x = l + randOffs;
          y = i;
        } else {
          x = i;
          y = l + randOffs;
        }
        if(isDrawn) img.plotPixel(colorMix(o.lowColor, o.highColor, col), x, y);
      }
    }
  }
}

class LayerWandering extends Layer {
  name = "wandering";
  
  static description = "A layer of randomly positioned lines.";
  
  options = {
    dir: 90,
    dirOffs: 0,
    dirOffsStep: 1,
    spacing: new UnitLength(8, UNIT_PIXELS),
    randomness: 1,
    minLength: new UnitLength(8, UNIT_PIXELS),
    maxLength: new UnitLength(8, UNIT_PIXELS),
    minWidth: new UnitLength(1, UNIT_PIXELS),
    maxWidth: new UnitLength(1, UNIT_PIXELS),
    spread: 0,
    minAlpha: 1,
    constantLength: false,
    fadeMode: O_FADE_NONE
  };
  
  types = {
    dir: {
      type: "direction"
    },
    dirOffs: {
      type: "number",
      step: 1,
      min: 0,
      max: 360
    },
    dirOffsStep: {
      type: "number",
      step: 1,
      min: 1,
      max: 360
    },
    randomness: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    spacing: {
      type: "length",
      subtype: "longest",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    minLength: {
      type: "length",
      subtype: "longest",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    maxLength: {
      type: "length",
      subtype: "longest",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    minWidth: {
      type: "length",
      subtype: "longest",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    maxWidth: {
      type: "length",
      subtype: "longest",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    spread: {
      type: "number",
      step: 0.05,
      max: 1,
      min: 0
    },
    minAlpha: {
      type: "number",
      min: 0,
      max: 1,
      step: 0.05
    },
    constantLength: {
      type: "boolean"
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
  
  generate(img, o) {
    const refLength = Math.min(img.w, img.h);
    const spacing = UnitLength.getLength(o.spacing, refLength);
    const minLength = UnitLength.getLength(o.minLength, refLength, true);
    const maxLength = UnitLength.getLength(o.maxLength, refLength, true);
    const minWidth = UnitLength.getLength(o.minWidth, refLength, true);
    const maxWidth = UnitLength.getLength(o.maxWidth, refLength, true);
    
    for(let ly = 0; ly < img.h / spacing; ly++) {
      for(let lx = 0; lx < img.w / spacing; lx++) {
        const dirOffs = Math.round((Math.random() * o.dirOffs - o.dirOffs / 2) / o.dirOffsStep) * o.dirOffsStep;
        const dir = o.dir + dirOffs;
        //multiply by sqrt of 2 to prevent weird skipping between angles
        //make the changes negative so that the lines point the right direction (relative to it's gui input)
        let xChange = -Math.sin(dir * DEG2RAD) * Math.sqrt(2);
        let yChange = -Math.cos(dir * DEG2RAD) * Math.sqrt(2);
        let xFlip = 1;
        let yFlip = 1;
        if(xChange < 0) {
          xFlip = -1;
        }
        if(yChange < 0) {
          yFlip = -1;
        }
        let xOffs = Math.floor(lx * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * o.randomness - 1);
        let yOffs = Math.floor(ly * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * o.randomness - 1);
        //round so that lines are properly variated
        const len = Math.round(Math.random() * (maxLength - minLength) + minLength);
        let progress = 0;
        //round so that lines are properly variated
        const thickness = Math.round(Math.random() * (maxWidth - minWidth) + minWidth);
        
        let alpha = (o.fadeMode == O_FADE_NEAR_START) ? 0 : 1;
        const alphaMult = Math.random() * (1 - o. minAlpha) + o.minAlpha;
        //draw a line
        if(Math.abs(xChange) < Math.abs(yChange)) {
          for(let i = 0; i < len; i++) {
            progress += xChange;
            const randOffs = (Math.random() - 0.5) * o.spread * 2;
            //prevent weird looking breaks in the lines
            if(randOffs + xChange < 1 && randOffs + xChange > -1) progress += randOffs;
            
            if(o.fadeMode == O_FADE_NEAR_START) {
              alpha += 1 / len;
            }
            
            for(let t = 0; t < thickness; t++) {
              img.plotPixel([1, 1, 1, alpha * alphaMult], Math.round(progress) + xOffs + t, i * yFlip + yOffs);
            }
            
            if(o.fadeMode == O_FADE_NEAR_END) {
              alpha -= 1 / len;
            }
          }
        } else {
          for(let i = 0; i < len; i++) {
            progress += yChange;
            const randOffs = (Math.random() - 0.5) * o.spread * 2;
            //prevent weird looking breaks in the lines
            if(randOffs + yChange < 1 && randOffs + yChange > -1) progress += randOffs;
            
            if(o.fadeMode == O_FADE_NEAR_START) {
              alpha += 1 / len;
            }
            
            for(let t = 0; t < thickness; t++) {
              img.plotPixel([1, 1, 1, alpha * alphaMult], i * xFlip + xOffs, Math.round(progress) + yOffs + t);
            }
            
            if(o.fadeMode == O_FADE_NEAR_END) {
              alpha -= 1 / len;
            }
          }
        }
      }
    }
  }
}
  
class LayerCheckers extends Layer {
  name = "checkers";
  
  static description = "A layer that resembles a checkerboard.";
  
  options = {
    evenColor: [1, 1, 1, 1],
    oddColor: [0, 0, 0, 1],
    xScale: new UnitLength(8, UNIT_PIXELS),
    yScale: new UnitLength(8, UNIT_PIXELS),
    xShift: new UnitLength(0, UNIT_PIXELS),
    yShift: new UnitLength(0, UNIT_PIXELS)
  };
  
  types = {
    evenColor: {
      type: "color"
    },
    oddColor: {
      type: "color"
    },
    xScale: {
      type: "length",
      subtype: "width",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
    },
    yScale: {
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
  
  generate(img, o) {
    const xScale = UnitLength.getLength(o.xScale, img.w);
    const yScale = UnitLength.getLength(o.yScale, img.h);
    const xShift = UnitLength.getLength(o.xShift, img.w);
    const yShift = UnitLength.getLength(o.yShift, img.h);
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        let col = (Math.floor((x - xShift * (Math.floor(y / yScale) % 2)) / xScale) + Math.floor((y - yShift * (Math.floor(x / xScale) % 2)) / yScale)) % 2 == 0 ? o.evenColor : o.oddColor;
        img.plotPixel(col, x, y);
      }
    }
  }
}

class LayerBlobs extends Layer {
  name = "blobs";
  static description = "A layer of randomly positioned circles.";
  
  options = {
    spacing: new UnitLength(8, UNIT_PIXELS),
    randomness: 1,
    minDiameter: new UnitLength(8, UNIT_PIXELS),
    maxDiameter: new UnitLength(8, UNIT_PIXELS),
    minAlpha: 1,
    hardness: 1,
    antiAlias: false,
    fadeNearEdge: true,
    easeMode: O_EASE_LINEAR,
    metricMode: O_METRIC_EUCLIDEAN
  };
  
  types = {
    spacing: {
      type: "length",
      subtype: "longest",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    randomness: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    minDiameter: {
      type: "length",
      subtype: "longest",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    maxDiameter: {
      type: "length",
      subtype: "longest",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    minAlpha: {
      type: "number",
      min: 0,
      max: 1,
      step: 0.05
    },
    antiAlias: {
      type: "boolean"
    },
    easeMode: {
      type: "keyvalues",
      keys: [
        "linear",
        "sharp square",
        "soft square",
        "cosine"
      ],
      values: [
        O_EASE_LINEAR,
        O_EASE_SQUARE,
        O_EASE_INVERSE_SQUARE,
        O_EASE_COSINE
      ]
    },
    metricMode: {
      type: "keyvalues",
      keys: [
        "euclidean (circles)",
        "taxicab (diamonds)",
        "chebyshev (squares)",
        "inverse euclidean (astroids)",
        "taxicab - euclidean (square oil)" //not a "real" metric, it just looks kinda cool
      ],
      values: [
        O_METRIC_EUCLIDEAN,
        O_METRIC_TAXICAB,
        O_METRIC_CHEBYSHEV,
        O_METRIC_INVERSE_EUCLIDEAN,
        O_METRIC_SQUARE_OIL
      ]
    },
    hardness: {
      type: "number",
      min: 0,
      max: 1,
      step: 0.05
    },
    fadeNearEdge: {
      type: "boolean"
    }
  };
  
  generate(img, o) {
    const spacing = UnitLength.getLength(o.spacing, Math.min(img.w, img.h));
    const minDiameter = UnitLength.getLength(o.minDiameter, Math.min(img.w, img.h));
    const maxDiameter = UnitLength.getLength(o.maxDiameter, Math.min(img.w, img.h));
    
    const xGrid = img.w / spacing; 
    const yGrid = img.h / spacing; 
    
    for(let ybi = 0; ybi < yGrid; ybi++) {
      for(let xbi = 0; xbi < xGrid; xbi++) {
        //random diameter
        let d = Math.random() * (maxDiameter - minDiameter) + minDiameter;
        //add 0.5 so the blobs arent 1 pixel smaller than they suppsoed to be
        let r = d / 2 + 0.5;
        let xStart = xbi * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * o.randomness - 1;
        let yStart = ybi * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * o.randomness - 1;
        
        const alpha = Math.max(Math.random(), o.minAlpha);
        
        if(o.antiAlias) {
          for(let yi = -r; yi < r; yi++) {
            for(let xi = -r; xi < r; xi++) {
              let dist;
              
              switch(o.metricMode) {
                case O_METRIC_EUCLIDEAN:
                  dist = Math.sqrt(xi * xi + yi * yi);
                  break;
                case O_METRIC_TAXICAB:
                  dist = Math.abs(xi) + Math.abs(yi);
                  break;
                case O_METRIC_CHEBYSHEV:
                  dist = Math.max(Math.abs(xi), Math.abs(yi));
                  break;
                case O_METRIC_INVERSE_EUCLIDEAN:
                  const taxicabDist = Math.abs(xi) + Math.abs(yi);
                  const diff = Math.sqrt(xi * xi + yi * yi) - taxicabDist;
                  dist = Math.abs(diff - taxicabDist);
                  break;
                case O_METRIC_SQUARE_OIL:
                  //looks cool
                  dist = Math.abs(Math.abs(xi) + Math.abs(yi) - Math.sqrt(xi * xi + yi * yi)) * 2 - 2;
                  break;
              }
              
              if(dist < r) {
                let x = Math.round(xi + xStart);
                let y = Math.round(yi + yStart);
                let hardnessDist;
                
                if(o.fadeNearEdge) {
                  switch(o.easeMode) {
                    case O_EASE_LINEAR:
                      hardnessDist = (r - dist) / r;
                      break;
                    case O_EASE_SQUARE:
                      hardnessDist = (r - dist) / r;
                      hardnessDist *= hardnessDist;
                      break;
                    case O_EASE_INVERSE_SQUARE:
                      hardnessDist = dist / r;
                      hardnessDist = 1 - (hardnessDist * hardnessDist);
                      break;
                    case O_EASE_COSINE:
                      hardnessDist = easeCos((r - dist) / r);
                      break;
                    default:
                      throw new ProcedrawError("unknown ease mode " + o.easeMode);
                  }
                  img.plotPixel([1, 1, 1, clamp((r - dist) * o.hardness, hardnessDist, 1) * alpha], x, y);
                } else {
                  switch(o.easeMode) {
                    case O_EASE_LINEAR:
                      hardnessDist = dist / r;
                      break;
                    case O_EASE_SQUARE:
                      hardnessDist = dist / r;
                      hardnessDist *= hardnessDist;
                      break;
                    case O_EASE_INVERSE_SQUARE:
                      hardnessDist = (r - dist) / r;
                      hardnessDist = 1 - (hardnessDist * hardnessDist);
                      break;
                    case O_EASE_COSINE:
                      hardnessDist = easeCos(dist / r);
                      break;
                    default:
                      throw new ProcedrawError("unknown ease mode " + o.easeMode);
                  }
                  img.plotPixel([1, 1, 1, clamp(r - dist, (dist / r) / r, 1) * Math.min(hardnessDist + o.hardness, 1) * alpha], x, y);
                }
              }
            }
          }
        } else {
          for(let yi = -r; yi < r; yi++) {
            for(let xi = -r; xi < r; xi++) {
              let dist;
              
              switch(o.metricMode) {
                case O_METRIC_EUCLIDEAN:
                  dist = Math.sqrt(xi * xi + yi * yi);
                  break;
                case O_METRIC_TAXICAB:
                  dist = Math.abs(xi) + Math.abs(yi);
                  break;
                case O_METRIC_CHEBYSHEV:
                  dist = Math.max(Math.abs(xi), Math.abs(yi));
                  break;
                case O_METRIC_INVERSE_EUCLIDEAN:
                  const taxicabDist = Math.abs(xi) + Math.abs(yi);
                  const diff = Math.sqrt(xi * xi + yi * yi) - taxicabDist;
                  dist = Math.abs(diff - taxicabDist);
                  break;
                case O_METRIC_SQUARE_OIL:
                  //looks cool
                  dist = Math.abs(Math.abs(xi) + Math.abs(yi) - Math.sqrt(xi * xi + yi * yi)) * 2 - 2;
                  break;
              }
              //subtract 0.5 to make the blobs rounder
              if(dist < r - 0.5) {
                let x = Math.round(xi + xStart);
                let y = Math.round(yi + yStart);
                let hardnessDist;
                if(o.fadeNearEdge) {
                  switch(o.easeMode) {
                    case O_EASE_LINEAR:
                      hardnessDist = (r - dist) / r;
                      break;
                    case O_EASE_SQUARE:
                      hardnessDist = (r - dist) / r;
                      hardnessDist *= hardnessDist;
                      break;
                    case O_EASE_INVERSE_SQUARE:
                      hardnessDist = dist / r;
                      hardnessDist = 1 - (hardnessDist * hardnessDist);
                      break;
                    default:
                      throw new ProcedrawError("unknown ease mode " + o.easeMode);
                  }
                  img.plotPixel([1, 1, 1, Math.min(hardnessDist + o.hardness, 1) * alpha], x, y);
                } else {
                  switch(o.easeMode) {
                    case O_EASE_LINEAR:
                      hardnessDist = dist / r;
                      break;
                    case O_EASE_SQUARE:
                      hardnessDist = dist / r;
                      hardnessDist *= hardnessDist;
                      break;
                    case O_EASE_INVERSE_SQUARE:
                      hardnessDist = (r - dist) / r;
                      hardnessDist = 1 - (hardnessDist * hardnessDist);
                      break;
                    default:
                      throw new ProcedrawError("unknown ease mode " + o.easeMode);
                  }
                  img.plotPixel([1, 1, 1, Math.min(hardnessDist + o.hardness, 1) * alpha], x, y);
                }
              }
            }
          }
        }
      }
    }
  }
}
  
class LayerWorley extends Layer {
  name = "worley";
  //ease mode
  //overwrite mode for voronoi (like errrr...... multiple octaves but big chunks)
  //https://iquilezles.org/articles/voronoilines/
  //vector mode
  static description = "A layer of Worley noise.";
  
  options = {
    octaves: 1,
    xSpacing: new UnitLength(16, UNIT_PIXELS),
    ySpacing: new UnitLength(16, UNIT_PIXELS),
    randomness: 1,
    closeColor: [0, 0, 0, 1],
    farColor: [1, 1, 1, 1],
    voronoiBias: 0,
    minRadiusMult: 1,
    squareDistance: false,
    metricMode: O_METRIC_EUCLIDEAN,
    normalized: false
  };
  
  types = {
    xSpacing: {
      type: "length",
      subtype: "width",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    ySpacing: {
      type: "length",
      subtype: "height",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    randomness: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    closeColor: {
      type: "color"
    },
    farColor: {
      type: "color"
    },
    minRadiusMult: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    squareDistance: {
      type: "boolean"
    },
    metricMode: {
      type: "keyvalues",
      keys: [
        "euclidean (circles)",
        "taxicab (diamonds)",
        "chebyshev (squares)",
        "inverse euclidean (astroids)",
        "taxicab - euclidean (square oil)" //not a "real" metric, it just looks kinda cool
      ],
      values: [
        O_METRIC_EUCLIDEAN,
        O_METRIC_TAXICAB,
        O_METRIC_CHEBYSHEV,
        O_METRIC_INVERSE_EUCLIDEAN,
        O_METRIC_SQUARE_OIL
      ]
    },
    octaves: {
      type: "number",
      step: 1,
      min: 1,
      max: 8,
      unsafe: true
    },
    voronoi: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    voronoiBias: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    normalized: {
      type: "boolean"
    }
  };
  
  generate(img, o) {
    let output = new Array(img.w * img.h); //for multiple octaves

    let xSpacing = UnitLength.getLength(o.xSpacing, img.w);
    let ySpacing = UnitLength.getLength(o.ySpacing, img.h);
    
    let xScale = 1;
    let yScale = 1;
    //stretch out blobs if x spacing and y spacing arent equal (prevents some of the weird grid artifacts)
    //this can be done before the octaves because it is a ratio
    if(xSpacing < ySpacing) {
      xScale = ySpacing / xSpacing;
    } else {
      yScale = xSpacing / ySpacing;
    }
    
    let normalDivisor;
    //all of these were worked out mathematically
    switch(o.metricMode) {
      case O_METRIC_EUCLIDEAN:
        normalDivisor = Math.sqrt(2);
        break;
      case O_METRIC_TAXICAB:
        normalDivisor = 2;
        break;
      case O_METRIC_CHEBYSHEV:
        normalDivisor = 1;
        break;
      case O_METRIC_INVERSE_EUCLIDEAN:
        normalDivisor = Math.sqrt(2) - 1;
        break;
      case O_METRIC_SQUARE_OIL:
        normalDivisor = 1;
        break;
    }
    
    let alpha = 1;
    
    for(let oi = 0; oi < o.octaves; oi++) {
      let xGrid = Math.ceil(img.w / xSpacing);
      let yGrid = Math.ceil(img.h / ySpacing);
      let points = new Array(xGrid * yGrid);
      let colors = new Array(xGrid * yGrid);
      let coverageChances = new Array(xGrid * yGrid);
      let distMults;
    
      for(let y = 0; y < yGrid; y++) {
        for(let x = 0; x < xGrid; x++) {
          const xPoint = xSpacing / 2 + (Math.random() - 0.5) * xSpacing * o.randomness;
          const yPoint = ySpacing / 2 + (Math.random() - 0.5) * ySpacing * o.randomness;
          points[x + y * xGrid] = [xPoint, yPoint];
          colors[x + y * xGrid] = Math.random();
        }
      }
      if(o.minRadiusMult != 1) {
        distMults = new Array(xGrid * yGrid);
        for(let y = 0; y < yGrid; y++) {
          for(let x = 0; x < xGrid; x++) {
            distMults[x + y * xGrid] = Math.random() * (1 - o.minRadiusMult) + o.minRadiusMult;
          }
        }
      }
      for(let y = 0; y < img.h; y++) {
        for(let x = 0; x < img.w; x++) {
          //absurd number so that the distance gets overwritten
          let closestDist = 9999999999999999999999;
          //let secondClosestDist = 9999999999999999999999;
          let closestPoint;
          //iterate through 9 cells to compute the shortest distance
          for(let yi = -1; yi <= 1; yi++) {
            for(let xi = -1; xi <= 1; xi++) {
              const xCell = Math.floor(x / xSpacing) + xi;
              const yCell = Math.floor(y / ySpacing) + yi;
              const pointIdx = mod(xCell, xGrid) + mod(yCell, yGrid) * xGrid;
              const xSqr = (x - (points[pointIdx][0] + xCell * xSpacing));
              const ySqr = (y - (points[pointIdx][1] + yCell * ySpacing));
              let dist;
              
              switch(o.metricMode) {
                case O_METRIC_EUCLIDEAN:
                  dist = (xSqr * xSqr) * xScale + (ySqr * ySqr) * yScale;
                  break;
                case O_METRIC_TAXICAB:
                  dist = Math.abs(xSqr * xScale) + Math.abs(ySqr * yScale);
                  break;
                case O_METRIC_CHEBYSHEV:
                  dist = Math.max(Math.abs(xSqr) * xScale, Math.abs(ySqr) * yScale);
                  break;
                case O_METRIC_INVERSE_EUCLIDEAN:
                  //FUCK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                  //https://github.com/blender/blender/blob/main/intern/cycles/kernel/svm/voronoi.h
                  
                  //failed attempt to approximate minkowski distance. all of the formulas i could find online involved iteration which is... cringe
                  //also, the wikipedia article for minkowski distance SUX!!!
                  const taxicabDist = Math.abs(xSqr * xScale) + Math.abs(ySqr * yScale);
                  const diff = Math.sqrt((xSqr * xSqr) * xScale + (ySqr * ySqr) * yScale) - taxicabDist;
                  dist = Math.abs(diff - taxicabDist);
                  //dist = Math.abs(xSqr) ** (2/3) + Math.abs(ySqr) ** (2/3);
                  break;
                case O_METRIC_SQUARE_OIL:
                  //looks cool
                  dist = Math.abs(Math.abs(xSqr * xScale) + Math.abs(ySqr * yScale) - Math.sqrt((xSqr * xSqr) * xScale + (ySqr * ySqr) * yScale)) * 2;
                  break;
              }
              if(o.minRadiusMult != 1) dist *= distMults[pointIdx];
              //console.log(dist);
              if(dist < closestDist) {
                //doesn't work! the second distance is fucked
                //secondClosestDist = closestDist;
                closestDist = dist;
                closestPoint = pointIdx;
              }
            }
          }
          let dist;
          const maxSpacing = Math.max(xSpacing, ySpacing);
          //closestDist = secondClosestDist// - closestDist;
          
          //do the sqrt for only one of the distances
          if(o.metricMode == O_METRIC_EUCLIDEAN) {
            if(o.squareDistance) {
              dist = closestDist / (maxSpacing * maxSpacing);
              if(o.normalized) dist /= normalDivisor;
            } else {
              dist = Math.sqrt(closestDist) / maxSpacing;
              if(o.normalized) dist /= normalDivisor;
            }
          } else {
            dist = closestDist / maxSpacing;
            if(o.normalized) dist /= normalDivisor;
            if(o.squareDistance) dist *= dist;
          }
          dist = lerp(dist, colors[closestPoint], o.voronoiBias);
          
          if(oi == 0) {
            //first octave
            output[x + y * img.w] = dist;
          } else {
            //other octaves
            output[x + y * img.w] = output[x + y * img.w] + alpha * (dist - output[x + y * img.w]);
          }
        }
      }
      //scale down each octave
      xSpacing /= 2;
      ySpacing /= 2;
      alpha /= 2;
    }
    //finally print the layer
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        //img.plotPixel(img.blend(o.closeColor, o.farColor, output[x + y * img.w]), x, y)
        img.plotPixel(colorMix(o.closeColor, o.farColor, output[x + y * img.w]), x, y)
      }
    }
     /* interesting
    if(dist < closestDist) {
      secondClosestDist = closestDist;
      closestDist = dist / 2;
    }
    */
  }
}

class LayerGradient extends Layer {
  name = "gradient";
  
  static description = "A layer with a gradual transition between two colors.";
  
  options = {
    dir: 45,
    col1: [1, 1, 1, 1],
    col2: [0, 0, 0, 1],
    xBounds: new UnitLength(100, UNIT_PERCENTAGE),
    yBounds: new UnitLength(100, UNIT_PERCENTAGE),
    mix: O_MIX_PLAIN,
    easeMode: O_EASE_LINEAR,
    edgeMode: O_WRAP
  };
  
  types = {
    dir: {
      type: "direction"
    },
    col1: {
      type: "color"
    },
    col2: {
      type: "color"
    },
    xBounds: {
      type: "length",
      subtype: "width",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1
    },
    yBounds: {
      type: "length",
      subtype: "height",
      absoluteMin: 1,
      scaledMax: 1,
      step: 1
    },
    mix: LIMITS_MIX,
    easeMode: {
      type: "keyvalues",
      keys: [
        "linear",
        "square",
        "inverse square"
      ],
      values: [
        O_EASE_LINEAR,
        O_EASE_SQUARE,
        O_EASE_INVERSE_SQUARE
      ]
    },
    edgeMode: {
      type: "keyvalues",
      keys: [
        "wrap",
        "clamp",
        "void",
        "reflect",
        "none"
      ],
      values: [
        O_WRAP,
        O_CLAMP,
        O_VOID,
        O_REFLECT,
        -1
      ]
    }
  };
  
  generate(img, o) {
    let xChange;
    let yChange;
    let xStart;
    let yStart;
    //NOTE TO SELF--drawing graphs for functions can help with creating them!
    //figured this one out by myself B)
    
    //0   : south : xc = 0, yc = 1, xs = 0, ys = 0
    //90  : east  : xc = 1, yc = 0, xs = 0, ys = 0
    //180 : north : xc = 0, yc = -1, xs = 0, ys = 1
    //270 : west  : xc = -1, yc = 0, xs = 1, ys = 0
    //45  : south-east : xc = 0.5, yc = 0.5, xs = 0, ys = 0
    //225 :north-west  : xc = -0.5, yc = -0.5, xs = 0.5, ys = 0.5
    
    /***** gradient control graphs *****\
      
    x  1 |       *
    C    |    *     *
    h  0 | *           *           *
    a    |                *     *
    n -1 |                   *
    g    +-|-----|-----|-----|-----|-
    e     0     90    180   270   360
                  direction
                  
    y  1 | *                       *
    C    |    *                 *
    h  0 |       *           *
    a    |          *     *
    n -1 |             *
    g    +-|-----|-----|-----|-----|-
    e     0     90    180   270   360
                  direction
                  
    x  1 |                   *        
    S 0.5|                *     *
    r  0 | *  *  *  *  *           *
    a    +-|-----|-----|-----|-----|-
    r     0     90    180   270   360
    t             direction

    y  1 |             *        
    S 0.5|          *     *
    r  0 | *  *  *           *  *  *
    a    +-|-----|-----|-----|-----|-
    r     0     90    180   270   360
    t             direction

    */
    //compute what those graphs show!
    if(o.dir < 90) {
      xChange = o.dir / 90;
    } else if(o.dir < 270) {
      xChange = 2 - (o.dir / 90);
    } else {
      xChange = o.dir / 90 - 4;
    }
    const coDir = mod(o.dir + 90, 360);
    if(coDir < 90) {
      yChange = coDir / 90;
    } else if(coDir < 270) {
      yChange = 2 - (coDir / 90);
    } else if(coDir < 360) {
      yChange = coDir / 90 - 4;
    }
    //starting points
    if(o.dir < 180) {
      xStart = 0;
    } else if(o.dir < 270) {
      xStart = o.dir / 90 - 2;
    } else {
      xStart = 4 - o.dir / 90;
    }
    if(coDir < 180) {
      yStart = 0;
    } else if(coDir < 270) {
      yStart = coDir / 90 - 2;
    } else {
      yStart = 4 - coDir / 90;
    }
    const xBounds = UnitLength.getLength(o.xBounds, img.w);
    const yBounds = UnitLength.getLength(o.yBounds, img.h);
    xStart *= xBounds;
    yStart *= yBounds;
    
    //the reason the xi and yi increment instructions are placed so weirdly is so the edges and corners dont look all funky
    
    let yi = yStart;
    for(let y = 0; y < img.h; y++) {
      let xi = xStart;
      if(yStart > 0) yi += yChange;
      
      for(let x = 0; x < img.w; x++) {
        if(xStart > 0) xi += xChange;
        const i = x + y * img.w;
        //add 1 to the bounds so that the corners and edges don't look weird
        let bias = xi / xBounds + yi / yBounds;
        
        switch(o.edgeMode) {
          case O_WRAP:
            bias = mod(bias, 1);
            break;
          case O_CLAMP:
            bias = clamp(bias, 0, 1);
            break;
          case O_VOID:
            break;
          case O_REFLECT:
            if(mod(Math.floor(bias), 2) == 1) {
              bias = 1 - mod(bias, 1);
            } else {
              bias = mod(bias, 1);
            }
            break;
        }
        
        switch(o.easeMode) {
          case O_EASE_LINEAR:
            break;
          case O_EASE_SQUARE:
            bias *= bias;
            break;
          case O_EASE_INVERSE_SQUARE:
            bias = 1 - (1 - bias) * (1 - bias);
            break;
        }
        
        let col;
        switch(o.mix) {
          case O_MIX_PLAIN:
            col = colorMix(o.col1, o.col2, bias);
            break;
          case O_MIX_HALF:
            col = (bias < 0.5) ? o.col1 : o.col2;
            break;
          case O_MIX_RANDOM:
            col = (bias < Math.random()) ? o.col1 : o.col2;
            break;
          case O_MIX_BAYER:
            col = (bias < BLEND_TABLE_BAYER[x % 4 + y % 4 * 4]) ? o.col1 : o.col2;
            break;
          case O_MIX_HALFTONE:
            col = (bias < BLEND_TABLE_HALFTONE[x % 8 + y % 8 * 8]) ? o.col1 : o.col2;
            break;
          case O_MIX_DAFT_X:
            col = (bias < y % 2 / 3 + 0.333) ? o.col1 : o.col2;
            break;
          case O_MIX_DAFT_Y:
            col = (bias < x % 2 / 3 + 0.333) ? o.col1 : o.col2;
            break;
          case O_MIX_HALF_DITHER:
            col = (bias < (x + y) % 2 / 3 + 0.333) ? o.col1 : o.col2;
            break;
          default:
            throw new ProcedrawError(`unknown mix mode ${o.mix}`);
        }
        //const col = mix(col1, col2, Math.floor(bias * 4) / 4);
        if(o.edgeMode == O_VOID) {
          if(bias <= 1 && bias >= 0) {
            img.plotPixel(col, x, y);
          }
        } else {
          img.plotPixel(col, x, y);
        }
        
        if(xStart == 0) xi += xChange;
      }
      if(yStart == 0) yi += yChange;
    }
  }
}

class LayerValueNoise extends Layer {
  name = "valueNoise";
  
  static description = "A layer of value noise.";
  
  options = {
    octaves: 4,
    xSpacing: new UnitLength(16, UNIT_PIXELS),
    ySpacing: new UnitLength(16, UNIT_PIXELS),
    lowColor: [0, 0, 0, 1],
    highColor: [1, 1, 1, 1],
    interpMode: O_INTERP_BILINEAR_COS,
    octavesShrink: true,
    lockXSpacing: false,
    lockYSpacing: false
  };
  
  types = {
    octaves: {
      type: "number",
      step: 1,
      max: 8,
      min: 1,
      unsafe: true
    },
    xSpacing: {
      type: "length",
      subtype: "height",
      step: 1,
      absoluteMin: 1,
      scaledMax: 1,
      unsafe: true
    },
    ySpacing: {
      type: "length",
      subtype: "height",
      step: 1,
      absoluteMin: 1,
      scaledMax: 1,
      unsafe: true
    },
    lowColor: {
      type: "color"
    },
    highColor: {
      type: "color"
    },
    interpMode: LIMITS_INTERP,
    octavesShrink: {
      type: "boolean"
    },
    lockXSpacing: {
      type: "boolean"
    },
    lockYSpacing: {
      type: "boolean"
    }
  };
  
  generate(img, o) {
    let fractalNoise = new Array(img.w * img.h);
    
    let xSpacing = UnitLength.getLength(o.xSpacing, img.w, true);
    let ySpacing = UnitLength.getLength(o.ySpacing, img.h, true);
    //how much noise is applied for each octave. goes down as octaves increase
    let alpha = 1;
    //the first octave is already done above, so skip it
    for(let octave = 0; octave < o.octaves; octave++) {
      
      let tempNoise = new Array(Math.ceil(img.w / xSpacing) * Math.ceil(img.h / ySpacing));
      //let tempNoise = new Array(img.w * img.h);
      
      for(let i = 0; i < tempNoise.length; i++) tempNoise[i] = Math.random();
      
      for(let y = 0; y < img.h; y++) {
        for(let x = 0; x < img.w; x++) {
          const imgIdx = x + y * img.w;
          const dataWidth = Math.floor(img.w / xSpacing);
          const dataHeight = Math.floor(img.h / ySpacing);
          const xScaled = x / xSpacing;
          const yScaled = y / ySpacing;
          let curValue;
          
             
          switch(o.interpMode) {
            case O_INTERP_NEAREST:
              let scaledIdx = Math.floor(xScaled) + Math.floor(yScaled) * dataWidth;
              curValue = tempNoise[scaledIdx];
              break;
            case O_INTERP_BILINEAR: {
              const xFloor = Math.floor(xScaled);
              const yFloor = Math.floor(yScaled);
              const xCeil = mod(Math.ceil(xScaled), dataWidth);
              const yCeil = mod(Math.ceil(yScaled), dataHeight);
              //corners are ordered like this:
              //0, 1
              //2, 3
              const v0 = tempNoise[xFloor + yFloor * dataWidth];
              const v1 = tempNoise[xCeil + yFloor * dataWidth];
              const v2 = tempNoise[xFloor + yCeil * dataWidth];
              const v3 = tempNoise[xCeil + yCeil * dataWidth];
              
              const xBias = xScaled - xFloor;
              const yBias = yScaled - yFloor;
              //THANK YOU wikipedia user Cmglee for making an amazing diagram that helped me FINALLY implement bilinear interpolation
              const col0 = lerp(v0, v1, xBias);
              const col2 = lerp(v2, v3, xBias);
              
              curValue = lerp(col0, col2, yBias);
              break;
            }
            case O_INTERP_BILINEAR_COS: {
              const xFloor = Math.floor(xScaled);
              const yFloor = Math.floor(yScaled);
              const xCeil = mod(Math.ceil(xScaled), dataWidth);
              const yCeil = mod(Math.ceil(yScaled), dataHeight);
              //corners are ordered like this:
              //0, 1
              //2, 3
              const v0 = tempNoise[xFloor + yFloor * dataWidth];
              const v1 = tempNoise[xCeil + yFloor * dataWidth];
              const v2 = tempNoise[xFloor + yCeil * dataWidth];
              const v3 = tempNoise[xCeil + yCeil * dataWidth];
              
              const xBias = easeCos(xScaled - xFloor);
              const yBias = easeCos(yScaled - yFloor);
              //THANK YOU wikipedia user Cmglee for making an amazing diagram that helped me FINALLY implement bilinear interpolation
              const col0 = lerp(v0, v1, xBias);
              const col2 = lerp(v2, v3, xBias);
              
              curValue = lerp(col0, col2, yBias);
              break;
            }
            default:
              throw new ProcedrawError("unknown interp mode: " + o.interpMode);
          }
          
          //trying to average the noise together doesnt work on the first octave because there is no pre-existing noise
          if(octave == 0) {
            fractalNoise[imgIdx] = curValue
          } else {
          //average noise together (same math as 'plain' blend moe)
            fractalNoise[imgIdx] = fractalNoise[imgIdx] + alpha * (curValue - fractalNoise[imgIdx]);
          }
        }
      }
      if(o.octavesShrink) {
        if(!o.lockXSpacing) xSpacing /= 2;
        if(!o.lockYSpacing) ySpacing /= 2;
      } else {
        if(!o.lockXSpacing) {
          xSpacing *= 2;
          xSpacing = Math.min(xSpacing, img.w);
        }
        if(!o.lockYSpacing) {
          ySpacing *= 2;
          ySpacing = Math.min(ySpacing, img.h);
        }
      }
      alpha /= 2;
    }
    //print
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        let bias = fractalNoise[x + y * img.w];
        let col = colorMix(o.lowColor, o.highColor, bias);
        img.plotPixel(col, x, y);
      }
    }
  }
}

class LayerWaveTable extends Layer {
  name = "waveTable";
  //TODO: like ehhhhhhhh options like noise layer
  static description = "A layer of sine waves.";
  
  options = {
    xPeriod: new UnitLength(8, UNIT_PIXELS),
    yPeriod: new UnitLength(8, UNIT_PIXELS),
    xAmplitude: 0.5,
    yAmplitude: 0.5,
    lowColor: [0, 0, 0, 1],
    highColor: [1, 1, 1, 1]
  };
  
  types = {
    xPeriod: {
      type: "length",
      subtype: "width",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
    },
    yPeriod: {
      type: "length",
      subtype: "height",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
    },
    xAmplitude: {
      type: "number",
      step: 0.05,
      max: 1,
      min: 0
    },
    yAmplitude: {
      type: "number",
      step: 0.05,
      max: 1,
      min: 0
    },
    lowColor: {
      type: "color"
    },
    highColor: {
      type: "color"
    }
  };
  
  generate(img, o) {
    let xPeriod = UnitLength.getLength(o.xPeriod, img.w);
    let yPeriod = UnitLength.getLength(o.yPeriod, img.h);
    
    if(xPeriod == 0) xPeriod = 1;
    if(yPeriod == 0) yPeriod = 1;
    
    for(let y = 0; y < img.h; y++) {
      let yWave = Math.sin(y * Math.PI / yPeriod);
      for(let x = 0; x < img.w; x++) {
        let xWave = Math.sin(x * Math.PI / xPeriod);
        const bias = (xWave + 1) / 2 * o.xAmplitude + (yWave + 1) / 2 * o.yAmplitude;
        img.plotPixel(colorMix(o.lowColor, o.highColor, bias), x, y);
      }
    }
  }
}
//TODO: TABS
//TODO: title case
class LayerBitmapText extends Layer {
  name = "bitmapText";
  
  static description = "A layer of text using a bitmap (pixel art) font.\n\nThe font (named 'ClASCII') currently supports all ASCII characters (minus control characters and tab) and 4 unicode block characters (\u2588\u2593\u2592\u2591).";
  
  options = {
    text: "An idiot admires complexity, a genius admires simplicity.",
    wrap: true,
    glyphWidth: new UnitLength(8, UNIT_PIXELS),
    glyphHeight: new UnitLength(8, UNIT_PIXELS),
    maxWidth: new UnitLength(100, UNIT_PERCENTAGE),
    //maxHeight
    //overflowMode
    //kerning
    //lineHeight
    caseMode: O_CASE_NONE,
    oracleMode: O_ORACLE_NONE,
    oracleLength: 8
  };
  
  types = {
    text: {
      type: "string",
      unsafe: true
    },
    wrap: {
      type: "boolean"
    },
    glyphWidth: {
      type: "length",
      subtype: "width",
      scaledMin: 0,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    glyphHeight: {
      type: "length",
      subtype: "height",
      scaledMin: 0,
      scaledMax: 1,
      step: 1,
      unsafe: true
    },
    maxWidth: {
      type: "length",
      subtype: "width",
      scaledMin: 0,
      scaledMax: 1,
      step: 1
    },
    caseMode: {
      type: "keyvalues",
      keys: [
        "None",
        "FORCE UPPERCASE",
        "force lowercase",
        "FoRCe spoNGeCaSE",
        "fORCE INVERTED",
        "f0rc3 l33tspeak"
      ],
      values: [
        O_CASE_NONE,
        O_CASE_UPPER,
        O_CASE_LOWER,
        O_CASE_SPONGE,
        O_CASE_INVERTED,
        O_CASE_LEET
      ]
    },
    oracleMode: {
      type: "keyvalues",
      keys: [
        "none",
        "God",
        "monkey",
        "letters",
        "numbers",
        "maze"
      ],
      values: [
        O_ORACLE_NONE,
        O_ORACLE_GOD,
        O_ORACLE_MONKEY,
        O_ORACLE_LETTERS,
        O_ORACLE_NUMBERS,
        O_ORACLE_MAZE
      ]
    },
    oracleLength: {
      type: "number",
      min: 1,
      max: 1024,
      step: 1,
      unsafe: true
    }
  };
  
  generate(img, o) {
    let text = o.text;
    
    switch(o.oracleMode) {
      case O_ORACLE_NONE:
        break;
      case O_ORACLE_GOD:
        text += godText(o.oracleLength);
        break;
      case O_ORACLE_MONKEY:
        text += monkeyText(o.oracleLength);
        break;
      case O_ORACLE_MAZE:
        for(let i = 0; i < o.oracleLength; i++) {
          text += (Math.random() > 0.5) ? '/' : '\\';
        }
        break;
      case O_ORACLE_NUMBERS:
        for(let i = 0; i < o.oracleLength; i++) {
          text += Math.floor(Math.random() * 10);
        }
        break;
      case O_ORACLE_LETTERS:
        for(let i = 0; i < o.oracleLength; i++) {
          let code = 0;
          //randomly select between lower and upper case
          if(Math.random() > 0.5) {
            code = 'a'.codePointAt(0);
          } else {
            code = 'A'.codePointAt(0);
          }
          //ascii magic
          text += String.fromCodePoint(code + Math.floor(Math.random() * 26));
        }
        break;
      default:
        throw new ProcedrawError(`Unknown oracleMode ${o.oracleMode}.`);
    }
    let newText = "";
    
    switch(o.caseMode) {
      case O_CASE_NONE:
        break;
      case O_CASE_UPPER:
        text = text.toUpperCase();
        break;
      case O_CASE_LOWER:
        text = text.toLowerCase();
        break;
      case O_CASE_INVERTED:
        for(let i = 0; i < text.length; i++) {
          let char = text[i];
          //this would be A LOT simpler to do in C... just saying
          //also, this does not work for unicode. lul!
          let charCode = char[0].charCodeAt(0);
          //ascii is nice, because the characters between a and z are all of the lowercase ones
          let isLower = charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0);
          //ascii is nice, because the characters between A and Z are all of the uppercase ones
          let isUpper = charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0);
          
          if(isLower == isUpper) {
            //not a letter
            newText += char;
          } else if(isLower) {
            newText += char.toUpperCase();
          } else if(isUpper) {
            newText += char.toLowerCase();
          }
        }
        text = newText
        break;
      case O_CASE_LEET:
        for(let i = 0; i < text.length; i++) {
          let char = text[i];
         
          switch(char.toLowerCase()) {
            case 'a':
              if(char == 'a') {
                newText += '@';
              } else {
                newText += '4';
              }
              break;
            case 'b':
              newText += '8';
              break;
            case 'e':
              newText += '3';
              break;
            case 'g':
              newText += '6';
              break;
            case 'l':
              newText += '1';
              break;
            case 's':
              newText += '5';
              break;
            case 't':
              newText += '7';
              break;
            case 'o':
              newText += '0';
              break;
            case 'p':
              newText += '9';
              break;
            case 'u':
              if(char == 'u') {
                newText += 'v';
              } else {
                newText += 'V';
              }
              break;
            case 'z':
              newText += '2';
              break;
            default:
              newText += char;
          }
        }
        text = newText;
        break;
      case O_CASE_SPONGE:
        for(let i = 0; i < text.length; i++) {
          let char = text[i];
         
          if(Math.random() > 0.5) {
            newText += char.toUpperCase();
          } else {
            newText += char.toLowerCase();
          }
        }
        text = newText;
        break;
      default:
        throw new ProcedrawError(`Unknown caseMode ${o.oracleMode}.`);
    }
    
    let glyphWidth = UnitLength.getLength(o.glyphWidth, img.w);
    let glyphHeight = UnitLength.getLength(o.glyphHeight, img.w);
    let maxWidth = UnitLength.getLength(o.maxWidth, img.w);
    let xText = 0;
    let yText = 0;
    
    for(let i = 0; i < text.length; i++) {
      let char = text[i];
      
      if(char == ' ') {
        xText += glyphWidth;
      } else if(char == '\n') {
        xText = 0;
        yText += glyphHeight;
      } else /*char is not a space or newline*/ {
        let glyphData = GLYPHS_CLASCII[char]; //is this safe? who knows!
        
        if(glyphData == undefined) {
          //character is not in the font
          glyphData = GLYPHS_CLASCII.unknown;
        } else if(typeof(glyphData) == "string") {
          //support for character aliasing
          //this is used when two characters look identical (e.g. uppercase beta and uppercase b)
          glyphData = GLYPHS_CLASCII[glyphData];
        }
        for(let yi = 0; yi < glyphHeight; yi++) {
          for(let xi = 0; xi < glyphWidth; xi++) {
            if(glyphData[Math.floor(yi / glyphHeight * 8)][Math.floor(xi / glyphWidth * 8)] != ' ') {
              img.plotPixel([1, 1, 1, 1], xi + xText, yi + yText);
            }
          }
        }
        xText += glyphWidth;
      }
      if(o.wrap) {
        //subtract the glyphWidth to prevent the glyphs from going past the maxWidth
        if(xText > maxWidth - glyphWidth) {
          xText = 0;
          yText += glyphHeight;
          if(text[i + 1] == ' ' || text[i + 1] == '\n') {
            i++;
          }
        }
      }
    }
  }
}

class LayerTileMap extends Layer {
  name = "tileMap";
  
  static description = "A custom image tiled over a layer.";
  
  options = {
    //bayer-style example. the lcd one just looks better
    /*glyph: new Glyph(2, 2,
      [
        0, 0, 1, 1, 0, 1, 0, 1,
        0, 1, 0, 1, 1, 0, 0, 1
      ]
    )*/
    tile: new Glyph(3, 3,
      [
        1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1,
        1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1,
        0.5,0,0, 1, 0,0.5,0, 1, 0,0,0.5, 1
      ]
    )
    //TODO: options for value, alpha, rgb, and rgba
    //TODO: should colorMode be part of the glyph data?
  };
  
  types = {
    tile: {
      type: "glyph"
    }
  };
    
  generate(img, o) {
    const glyphWidth = o.tile.width;
    const glyphHeight = o.tile.height;
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        let glyphIdx = x % glyphWidth + (y % glyphHeight) * glyphWidth;
        let r = o.tile.data[glyphIdx * 4];
        let g = o.tile.data[glyphIdx * 4 + 1];
        let b = o.tile.data[glyphIdx * 4 + 2];
        let a = o.tile.data[glyphIdx * 4 + 3];
        img.plotPixel([r, g, b, a], x, y);
      }
    }
  }
}

class LayerMandelbrot extends Layer {
  name = "mandelbrot";
  
  static description = "The Mandelbrot set.";
  
  options = {
    maxIterations: 16,
    zoom: 0.5,
    xRelOffs: 0,
    yRelOffs: 0,
    xAbsOffs: new UnitLength(0, UNIT_PIXELS),
    yAbsOffs: new UnitLength(0, UNIT_PIXELS),
    viewWidth: new UnitLength(100, UNIT_PERCENTAGE),
    viewHeight: new UnitLength(100, UNIT_PERCENTAGE),
    zRealStart: 0,
    zImagStart: 0,
    discardInside: true,
    outputMode: O_OUTPUT_COLOR
    //TODO: color output and alpha output flags
  };
  
  types = {
    maxIterations: {
      type: "number",
      unsafe: true,
      min: 1,
      max: 32,
      step: 1
    },
    xRelOffs: {
      type: "number",
      min: -2,
      max: 2,
      step: 0.001
    },
    yRelOffs: {
      type: "number",
      min: -2,
      max: 2,
      step: 0.001
    },
    xAbsOffs: {
      type: "length",
      subtype: "width",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
    },
    yAbsOffs: {
      type: "length",
      subtype: "height",
      scaledMin: -1,
      scaledMax: 1,
      step: 1
    },
    viewWidth: {
      type: "length",
      subtype: "width",
      scaledMin: 0,
      scaledMax: 1,
      step: 1
    },
    viewHeight: {
      type: "length",
      subtype: "height",
      scaledMin: 0,
      scaledMax: 1,
      step: 1
    },
    zoom: {
      type: "number",
      min: 0,
      max: 100,
      step: 0.05/*,
      unsafe: true //zoom INDIRECTLY affects how many iterations have to be calculated*/
    },
    discardInside: {
      type: "boolean"
    },
    zRealStart: {
      type: "number",
      min: -2,
      max: 2,
      step: 0.01
    },
    zImagStart: {
      type: "number",
      min: -2,
      max: 2,
      step: 0.01
    },
    outputMode: {
      type: "keyvalues",
      keys: [
        "color only",
        "alpha only",
        "alpha and color"
      ],
      values: [
        O_OUTPUT_COLOR,
        O_OUTPUT_ALPHA,
        O_OUTPUT_BOTH
      ]
    }
  };
  
  generate(img, o) {
    //TODO: fine and coarse offset?
    //TODO: coloring options (zebra stripes)
    const xAbsOffs = UnitLength.getLength(o.xAbsOffs, img.w);
    const yAbsOffs = UnitLength.getLength(o.yAbsOffs, img.h);
    const viewWidth = UnitLength.getLength(o.viewWidth, img.w);
    const viewHeight = UnitLength.getLength(o.viewHeight, img.h);
    const iZoom = 1 / o.zoom;
    
    for(let y = 0; y < img.h; y++) {
      const yN = (y + yAbsOffs - img.h * 0.5) / viewHeight * 2;
      
      for(let x = 0; x < img.w; x++) {
        const xN = (x + xAbsOffs - img.w * 0.5) / viewWidth * 2;
        let c = new Complex(xN * iZoom + o.xRelOffs, yN * iZoom + o.yRelOffs);
        let z = new Complex(o.zRealStart, o.zImagStart);//Complex.ZERO;
        let i = 0;
        while(Complex.abs(z) < 2 && i < o.maxIterations) {
          z = Complex.add(Complex.square(z), c);
          i++;
        }
        if(o.discardInside && i == o.maxIterations)
          i = 0;
        //ts is for good normalizing
        const col = i / (o.maxIterations - (o.discardInside ? 1 : 0));
        
        if(o.outputMode == O_OUTPUT_COLOR)
          img.plotPixel([col, col, col, 1], x, y);
        else if(o.outputMode == O_OUTPUT_ALPHA)
          img.plotPixel([1, 1, 1, col], x, y);
        else
          img.plotPixel([col, col, col, col], x, y);
      }
    }
  }
}

class LayerSeedFractal extends Layer {
  name = "seedFractal";
  
  static description = "A customizable fractal based on a starting seed.";
  //TODO: fix weird edge issues
  options = {
    xScale: 1,
    yScale: 1,
    xOffs: 0,
    yOffs: 0,
    seed: new BinaryGlyph(3, 3,
      [
        1, 1, 1,
        1, 0, 1,
        1, 1, 1
      ]
    )
  };
  
  types = {
    xScale: {
      type: "number",
      min: 0,
      max: 16,
      step: 0.05
    },
    yScale: {
      type: "number",
      min: 0,
      max: 16,
      step: 0.05
    },
    xOffs: {
      type: "number"
    },
    yOffs: {
      type: "number"
    },
    seed: {
      type: "binaryglyph"
    }
  };
  
  generate(img, o) {
    const xScale = 1 / o.xScale;
    const yScale = 1 / o.yScale;
    //if a seed has gaps near the top left sides, then this algorith doesn't work correctly.
    //shifting the test position away from the x y axes is the easiest solution i've found for this (works because fractals are, by definition, self-similar)
    const w = o.seed.width;
    const h = o.seed.height;
      
    /*let needsShifting = false;
    //needs to be checked for both axes? maybe?
    
    for(let i = 0; i < w; i++) {
      if(!(o.seed.getPixel(i, 0) && o.seed.getPixel(0, i))) {
        needsShifting = true;
        break;
      }
    }*/
    //thank you Jnaruk from Wikipedia for this algorithm
    //https://en.wikipedia.org/wiki/Talk:Sierpi%C5%84ski_carpet#Stupid_Java_Code
    function isFilled(x, y) {
      /*while(x > 0 && y > 0) {
        if(x % 3 == 1 && y % 3 == 1)
          return false;
        
        x = Math.floor(x / 3);
        y = Math.floor(y / 3);
      }*/
      
      while(x > 0 && y > 0) {
        //TODO: optimize into one loop
        for(let yi = 0; yi < h; yi++) {
          for(let xi = 0; xi < w; xi++) {
            if(!o.seed.data[xi + yi * w])
              if(x % w == xi && y % h == yi)
                return false;
          }
        }
        
        x = Math.floor(x / w);
        y = Math.floor(y / h);
      }
      return true;
    }
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        if(isFilled(Math.abs(Math.floor(x * xScale) + o.xOffs * Math.floor(img.w)),
        Math.abs(Math.floor(y * yScale) + o.yOffs * Math.floor(img.h))))
          img.plotPixel([1, 1, 1, 1], x, y);
      }
    }
  }
}

/*class LayerGlyphMap extends Layer {
  name = "glyphMap";
  
  static description = "A glyph tiled over a layer. ADD MORE ABOUT CREATION!!!";
  
  options = {
    glyph: "0 9\n9 5",
    glyphWidth: new UnitLength(2, UNIT_PIXELS),
    glyphHeight: new UnitLength(2, UNIT_PIXELS),
    precisionMode: O_CHAR_PREC_10,
    colorMode: 0
  };
  
  types = {
    glyph: {
      type: "string"
    },
    glyphWidth: {
      type: "length",
      subtype: "width",
      scaledMin: 0,
      scaledMax: 1,
      step: 1
    },
    glyphHeight: {
      type: "length",
      subtype: "height",
      scaledMin: 0,
      scaledMax: 1,
      step: 1
    },
    precisionMode: {
      type: "keyvalues",
      keys: [
        "10 value brightness (0, 1, 2...9)",
        "16 hex value brightness (0, 1, 2...f)",
        //"26 alphabetical value brightness (a, b, c...z)",
        "256 hex value brightness (00, 01, 02...ff)"
      ],
      values: [
        O_CHAR_PREC_10,
        O_CHAR_PREC_16,
        //O_CHAR_PREC_26,
        O_CHAR_PREC_256
      ]
    },
    colorMode: {
      type: "keyvalues",
      keys: [
        "brightness (1 value)",
        "alpha (1 value)",
        "red, green & blue (3 values)",
        "red, green, blue & alpha (4 values)"
      ],
      values: [
        O_COLOR_BRIGHTNESS,
        O_COLOR_ALPHA,
        O_COLOR_RGB,
        O_COLOR_RGBA
      ]
    }
  };
    
  generate(img, o) {
    const glyphWidth = UnitLength.getLength(o.glyphWidth, img.w);
    const glyphHeight = UnitLength.getLength(o.glyphHeight, img.h);
    let glyphSplit = o.glyph.split('\n');
    let rawGlyphData = [];
    let glyphData = [];
    //different for...p adding reasons
    let glyphSampleWidth = glyphWidth;
    //TODO: autodetect width?
    for(let y = 0; y < glyphHeight; y++) {
      for(let x = 0; x < glyphSampleWidth; x++) {
        if(glyphSplit[y] == undefined) {
          rawGlyphData.push(0);
        } else if(glyphSplit[y][x] == undefined) {
          rawGlyphData.push(0);
        } else {
          //curChar will ALWAYS be a character
          let curChar = glyphSplit[y][x];
          let val;
          
          switch(o.precisionMode) {
            case O_CHAR_PREC_10:
              val = parseInt(curChar, 10) / 9;
              break;
              
            case O_CHAR_PREC_16:
              val = parseInt(curChar, 16) / 15;
              break;
          }
          //don't add the value if it's invalid (allow for padding between each value)
          //is val nan?
          if(val == val) {
            rawGlyphData.push(val);
          } else {
            //increment so we keep reading the rest of the glyph table
            glyphSampleWidth++;
          }
        }
      }
    }
    //TODO: sucks
    for(let i = 0; i < rawGlyphData.length; i++) {
      let val = rawGlyphData[i];
      let color;
      
      switch(o.colorMode) {
        case O_COLOR_BRIGHTNESS:
          color = [val, val, val, 1];
          break;
          
        case O_COLOR_ALPHA:
          color = [1, 1, 1, val];
          break;
      }
      glyphData.push(color);
    }
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        let glyphIdx = x % glyphWidth + (y % glyphHeight) * glyphWidth;
        let col = glyphData[glyphIdx];
        img.plotPixel(col, x, y);
      }
    }
  }
}*/
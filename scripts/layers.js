"use strict";
//layer classes (data processing)
/*
default layer options are stored in a layer class as "options" object
new options are passed into generate() as "o" (short for options)
*/

//NEVER change these values!
//they are used in save files, so changing them WILL break save files!!!
const O_FADE_NONE = 0;
const O_FADE_NEAR_END = 1;
const O_FADE_NEAR_START = 2;
const O_FADE_NEAR_END_SQUARED = 3;
const O_FADE_NEAR_START_SQUARED = 4;
const O_FADE_NEAR_END_SQRT = 5;
const O_FADE_NEAR_START_SQRT = 6;

const O_INTERP_NEAREST = 0;
const O_INTERP_BILINEAR = 1;

const O_GREATER_THAN = 0;
const O_LESS_THAN = 1;
const O_EQUAL_TO = 2;
const O_NOT_EQUAL_TO = 3;
const O_GREATER_THAN_OR_EQUAL_TO = 4;
const O_LESS_THAN_OR_EQUAL_TO = 5;

const LIMITS_BLEND = {
  type: "keyvalues",
  keys: [
    "plain",
    "add",
    "multiply",
    "subtract",
    "screen",
    "overlay",
    "shift overlay",
    "dissolve",
    "channel dissolve"
  ],
  values: [
    BLEND_PLAIN,
    BLEND_ADD,
    BLEND_MULTIPLY,
    BLEND_SUBTRACT,
    BLEND_SCREEN,
    BLEND_OVERLAY,
    BLEND_SHIFT_OVERLAY,
    BLEND_DISSOLVE,
    BLEND_CHANNEL_DISSOLVE
  ]
}

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
    blend: BLEND_PLAIN,
    //multiply the image by a color
    tint: [1, 1, 1, 1],
    //depth: 255,
    shown: true,
    //position offsets
    x: 0,
    y: 0,
    //layer key used for filters
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
  
  generate(o) {
    //o is short for "options"
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
  
  static description = "A bitwise XOR fractal.";
  
  options = {
    width: 64,
    height: 64
  };
  
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
  
  generate(o) {
    const xScale = 256 / o.width;
    const yScale = 256 / o.height;
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        let col = ((x * xScale) ^ (y * yScale)) / 255;
        img.plotPixel([col, col, col, 1], x, y);
      }
    }
  }
}

class LayerSolid extends Layer {
  name = "solid";
  
  static description = "A layer of solid color.";
  
  options = {
    width: 64,
    height: 64,
    fitCanvas: false
  };
  
  types = {
    width: {
      type: "number",
      step: 1,
      min: 1,
      max: 512,
      unsafe: true
    },
    height: {
      type: "number",
      step: 1,
      min: 1,
      max: 512,
      unsafe: true
    },
    fitCanvas: {
      type: "boolean"
    }
  };
  
  generate(o) {
    let width;
    let height;
    
    if(o.fitCanvas) {
      width = img.w;
      height = img.h;
    } else {
      width = o.width;
      height = o.height;
    }
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
  
  generate(o) {
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        if(o.coverage > Math.random()) {
          if(o.correlated) {
            const weight = Math.random();
            const col = img.blend(o.lowColor, o.highColor, weight);
            img.plotPixel(col, x, y);
          } else {
            const r = img.blend(o.lowColor, o.highColor, Math.random())[0];
            const g = img.blend(o.lowColor, o.highColor, Math.random())[1];
            const b = img.blend(o.lowColor, o.highColor, Math.random())[2];
            const a = img.blend(o.lowColor, o.highColor, Math.random())[3];
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
    width: 64,
    height: 64,
    thickness: 1,
    colorTop: [1, 1, 1, 1],
    colorLeft: [0.75, 0.75, 0.75, 1],
    colorBottom: [0, 0, 0, 1],
    colorRight: [0.25, 0.25, 0.25, 1],
    fadeMode: O_FADE_NONE
  };
  
  types = {
    width: {
      type: "number",
      min: 1,
      max: 256,
      unsafe: true
    },
    height: {
      type: "number",
      min: 1,
      max: 256,
      unsafe: true
    },
    thickness: {
      type: "number",
      min: 1,
      max: 128,
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
  
  generate(o) {
    function blend(c1, c2, alp) {
      return img.blend([c1[0], c1[1], c1[2], c1[3] * alp], [c2[0], c2[1], c2[2], c2[3] * alp], 0.5);
    }
    function fade(c, alp) {
      return [c[0], c[1], c[2], c[3] * alp];
    }
    const alphaStep = 1 / o.thickness;
    let alpha = 1;
    
    if(o.fadeMode == O_FADE_NEAR_END) {
      alpha = 0;
    }
    for(let t = 1; t < o.thickness + 1; t++) {
      if(o.fadeMode == O_FADE_NEAR_END) {
        alpha += alphaStep;
      }
      //left and right edges
      for(let y = t; y < o.height - t; y++) {
        img.plotPixel(fade(o.colorLeft, alpha), t - 1, y);
        img.plotPixel(fade(o.colorRight, alpha), o.width - t, y);
      }
      //top and bottom edges
      for(let x = t; x < o.width - t; x++) {
        img.plotPixel(fade(o.colorTop, alpha), x, t - 1);
        img.plotPixel(fade(o.colorBottom, alpha), x, o.height - t);
      }
      //corners
      img.plotPixel(blend(o.colorTop, o.colorLeft, alpha), t - 1, t - 1);
      img.plotPixel(blend(o.colorTop, o.colorRight, alpha), o.width - t, t - 1);
      img.plotPixel(blend(o.colorBottom, o.colorLeft, alpha), t - 1, o.height - t);
      img.plotPixel(blend(o.colorBottom, o.colorRight, alpha), o.width - t, o.height - t);
      
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
    depth: 3,
    bias: 1,
    dir: true,
    coverage: 1,
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
        if(isDrawn) img.plotPixel(img.blend(o.lowColor, o.highColor, col), x, y);
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
    spacing: 16,
    spread: 0,
    minLength: 8,
    maxLength: 8,
    minWidth: 1,
    maxWidth: 1,
    minAlpha: 1,
    fadeMode: O_FADE_NONE
  };
  
  types = {
    dir: {
      type: "number",
      step: 1,
      max: 360,
      min: 0
    },
    dirOffs: {
      type: "number",
      step: 1,
      min: 0,
      max: 360
    },
    spacing: {
      type: "number",
      min: 1,
      max: 256,
      unsafe: true
    },
    spread: {
      type: "number",
      step: 0.05,
      max: 1,
      min: 0
    },
    minLength: {
      type: "number",
      min: 1,
      max: 256,
      unsafe: true
    },
    maxLength: {
      type: "number",
      min: 1,
      max: 256,
      unsafe: true
    },
    minWidth: {
      type: "number",
      min: 1,
      max: 64,
      unsafe: true
    },
    maxWidth: {
      type: "number",
      min: 1,
      max: 64,
      unsafe: true
    },
    minAlpha: {
      type: "number",
      min: 0,
      max: 1,
      step: 0.05
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
    const lineCount = img.w * img.h / (o.spacing * 2);
    //draw several lines
    for(let l = 0; l < lineCount; l++) {
      const dir = o.dir + (Math.random() * o.dirOffs - o.dirOffs / 2);
      //multiply by sqrt of 2 to prevent weird skipping between angles
      const xChange = Math.sin(dir * DEG2RAD) * Math.sqrt(2);
      const yChange = Math.cos(dir * DEG2RAD) * Math.sqrt(2);
      let xFlip = 1;
      let yFlip = 1;
      if(xChange < 0) {
        xFlip = -1;
      }
      if(yChange < 0) {
        yFlip = -1;
      }
      const xOffs = Math.floor(img.w * Math.random());
      const yOffs = Math.floor(img.h * Math.random());
      //round so that lines are properly variated
      const len = Math.round(Math.random() * (o.maxLength - o.minLength) + o.minLength);
      let progress = 0;
      //round so that lines are properly variated
      const thickness = Math.round(Math.random() * (o.maxWidth - o.minWidth) + o.minWidth);
      
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
  
class LayerCheckers extends Layer {
  name = "checkers";
  
  static description = "A layer that resembles a checkerboard.";
  
  options = {
    evenColor: [1, 1, 1, 1],
    oddColor: [0, 0, 0, 1],
    xScale: 1,
    yScale: 1,
    xShift: 0,
    yShift: 0
  };
  
  types = {
    evenColor: {
      type: "color"
    },
    oddColor: {
      type: "color"
    },
    xScale: {
      type: "number"
    },
    yScale: {
      type: "number"
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
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        let col = (Math.floor((x - o.xShift * (Math.floor(y / o.yScale) % 2)) / o.xScale) + Math.floor((y - o.yShift * (Math.floor(x / o.xScale) % 2)) / o.yScale)) % 2 == 0 ? o.evenColor : o.oddColor;
        img.plotPixel(col, x, y);
      }
    }
  }
}

class LayerBlobs extends Layer {
  name = "blobs";
  
  static description = "A layer of randomly positioned circles.";
  
  options = {
    spacing: 8,
    minDiameter: 8,
    maxDiameter: 8,
    minAlpha: 1,
    fadeMode: O_FADE_NONE
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
    minAlpha: {
      type: "number",
      min: 0,
      max: 1,
      step: 0.05
    },
    fadeMode: {
      type: "keyvalues",
      keys: [
        "no fade",
        "fade near edge",
        "fade near center",
        "fade near edge (squared)",
        "fade near center (squared)",
        "fade near edge (square root'd)",
        "fade near center (square root'd)"
      ],
      values: [
        O_FADE_NONE,
        O_FADE_NEAR_END,
        O_FADE_NEAR_START,
        O_FADE_NEAR_END_SQUARED,
        O_FADE_NEAR_START_SQUARED,
        O_FADE_NEAR_END_SQRT,
        O_FADE_NEAR_START_SQRT
      ]
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
      
      const alpha = Math.max(Math.random(), o.minAlpha);
      
      switch(o.fadeMode) {
        case O_FADE_NONE:
          for(let yi = -r; yi < r; yi++) {
            for(let xi = -r; xi < r; xi++) {
              //subtract 0.5 to make the blobs rounder
              const dist = xi * xi + yi * yi;
              if(dist < (r - 0.5) * (r - 0.5)) {
                let x = Math.floor(xi + xStart);
                let y = Math.floor(yi + yStart);
                img.plotPixel([1, 1, 1, alpha], x, y);
              }
            }
          }
          break;
        case O_FADE_NEAR_END:
          for(let yi = -r; yi < r; yi++) {
            for(let xi = -r; xi < r; xi++) {
              //subtract 0.5 to make the blobs rounder
              const dist = Math.sqrt(xi * xi + yi * yi);
              if(dist < r - 0.5) {
                let x = Math.floor(xi + xStart);
                let y = Math.floor(yi + yStart);
                img.plotPixel([1, 1, 1, (r - dist) / r * alpha], x, y);
              }
            }
          }
          break;
        case O_FADE_NEAR_START:
          for(let yi = -r; yi < r; yi++) {
            for(let xi = -r; xi < r; xi++) {
              //subtract 0.5 to make the blobs rounder
              const dist = Math.sqrt(xi * xi + yi * yi);
              if(dist < r - 0.5) {
                let x = Math.floor(xi + xStart);
                let y = Math.floor(yi + yStart);
                img.plotPixel([1, 1, 1, dist / r * alpha], x, y);
              }
            }
          }
          break;
        //i could probably use algebra to optimize this code but womp womp
        case O_FADE_NEAR_END_SQUARED:
          for(let yi = -r; yi < r; yi++) {
            for(let xi = -r; xi < r; xi++) {
              //subtract 0.5 to make the blobs rounder
              const dist = Math.sqrt(xi * xi + yi * yi);
              if(dist < r - 0.5) {
                let x = Math.floor(xi + xStart);
                let y = Math.floor(yi + yStart);
                img.plotPixel([1, 1, 1, (r - dist) / r * (r - dist) / r * alpha], x, y);
              }
            }
          }
          break;
        case O_FADE_NEAR_START_SQUARED:
          for(let yi = -r; yi < r; yi++) {
            for(let xi = -r; xi < r; xi++) {
              //subtract 0.5 to make the blobs rounder
              const dist = Math.sqrt(xi * xi + yi * yi);
              if(dist < r - 0.5) {
                let x = Math.floor(xi + xStart);
                let y = Math.floor(yi + yStart);
                img.plotPixel([1, 1, 1, dist / r * dist / r * alpha], x, y);
              }
            }
          }
          break;
        case O_FADE_NEAR_END_SQRT:
          for(let yi = -r; yi < r; yi++) {
            for(let xi = -r; xi < r; xi++) {
              //subtract 0.5 to make the blobs rounder
              const dist = Math.sqrt(xi * xi + yi * yi);
              if(dist < r - 0.5) {
                let x = Math.floor(xi + xStart);
                let y = Math.floor(yi + yStart);
                img.plotPixel([1, 1, 1, Math.sqrt((r - dist) / r) * alpha], x, y);
              }
            }
          }
          break;
        case O_FADE_NEAR_START_SQRT:
          for(let yi = -r; yi < r; yi++) {
            for(let xi = -r; xi < r; xi++) {
              //subtract 0.5 to make the blobs rounder
              const dist = Math.sqrt(xi * xi + yi * yi);
              if(dist < r - 0.5) {
                let x = Math.floor(xi + xStart);
                let y = Math.floor(yi + yStart);
                img.plotPixel([1, 1, 1, Math.sqrt(dist / r) * alpha], x, y);
              }
            }
          }
          break;
      }
    }
  }
}
  
class LayerWorley extends Layer {
  name = "worley";
  
  static description = "A layer of Worley noise.";
  
  options = {
    xSpacing: 16,
    ySpacing: 16,
    closeColor: [0, 0, 0, 1],
    farColor: [1, 1, 1, 1],
    minRadiusMult: 1,
    squareDistance: false,
    voronoi: false,
    taxicab: false
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
    minRadiusMult: {
      type: "number",
      step: 0.05,
      min: 0,
      max: 1
    },
    squareDistance: {
      type: "boolean"
    },
    voronoi: {
      type: "boolean"
    },
    taxicab: {
      type: "boolean"
    }
  };
  
  generate(o) {
    let xGrid = Math.ceil(img.w / o.xSpacing);
    let yGrid = Math.ceil(img.h / o.ySpacing);
    let points = new Array(xGrid * yGrid);
    let colors;
    let distMults;
    
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
    if(o.minRadiusMult != 1) {
      distMults = new Array(xGrid * yGrid);
      for(let y = 0; y < yGrid; y++) {
        for(let x = 0; x < xGrid; x++) {
          distMults[x + y * xGrid] = Math.random() * (1 - o.minRadiusMult) + o.minRadiusMult;
        }
      }
    }
    //why did i put this in the cell checking code???
    let xScale = 1;
    let yScale = 1;
    //stretch out blobs if x spacing and y spacing arent equal (prevents some of the weird grid artifacts)
    if(o.xSpacing < o.ySpacing) {
      xScale = o.ySpacing / o.xSpacing;
    } else {
      yScale = o.xSpacing / o.ySpacing;
    }
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        //absurd number so that the distance gets overwritten
        let closestDist = 9999999999999999999999;
        let printCol;
        //iterate through 9 cells to compute the shortest distance
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
            let dist;
            if(o.taxicab) {
              dist = Math.abs(xSqr * xScale) + Math.abs(ySqr * yScale);
            } else {
              dist = (xSqr * xSqr) * xScale + (ySqr * ySqr) * yScale;
            }
            if(o.minRadiusMult != 1) dist *= distMults[pointIdx];
              
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
          let dist;
          if(o.taxicab) {
            //divide by this to look closer to the euclidean distance version
            //no real reason to divide by half of PI, it just... feels right
            dist = closestDist / ((o.xSpacing + o.ySpacing) / (Math.PI / 2));
          } else {
            dist = Math.sqrt(closestDist) / ((o.xSpacing + o.ySpacing) / 2);
          }
          if(o.squareDistance) {
            dist *= dist;
          }
          img.plotPixel(img.blend(o.closeColor, o.farColor, dist), x, y);
        }
      }
    }
  }
}

class LayerGradient extends Layer {
  name = "gradient";
  
  static description = "A layer with a gradual transition between two colors.";
  
  options = {
    dir: 45,
    col1: [1, 1, 1, 1],
    col2: [0, 0, 0, 1],
    xBounds: 64,
    yBounds: 64,
    //TODO: repeat mode
    mix: MIX_PLAIN
  };
  
  types = {
    dir: {
      type: "number",
      step: 1,
      max: 360,
      min: 0
    },
    col1: {
      type: "color"
    },
    col2: {
      type: "color"
    },
    xBounds: {
      type: "number",
      step: 1,
      max: 256,
      min: 1
    },
    yBounds: {
      type: "number",
      step: 1,
      max: 256,
      min: 1
    },
    mix: {
      type: "keyvalues",
      keys: [
        "plain",
        "hard 50%",
        "random",
        "bayer",
        "halftone",
        "daft (horizontal)",
        "daft (vertical)",
        "dither 50%"
      ],
      values: [
        MIX_PLAIN,
        MIX_HALF,
        MIX_RANDOM,
        MIX_BAYER,
        MIX_HALFTONE,
        MIX_DAFT_X,
        MIX_DAFT_Y,
        MIX_HALF_DITHER
      ]
    }
  };
  
  generate(o) {
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
    xStart *= o.xBounds;
    yStart *= o.yBounds;
    
    //the reason the xi and yi increment instructions are placed so weirdly is so the edges and corners dont look all funky
    
    let yi = yStart;
    for(let y = 0; y < img.h; y++) {
      let xi = xStart;
      if(yStart > 0) yi += yChange;
      
      for(let x = 0; x < img.w; x++) {
        if(xStart > 0) xi += xChange;
        const i = x + y * img.w;
        //add 1 to the bounds so that the corners and edges don't look weird
        const bias = mod(xi / o.xBounds + yi / o.yBounds, 1);
        
        let col;
        //https://en.wikipedia.org/wiki/Ordered_dithering
        const DITHER = [
          0,  8,  2,  10,
          12, 4,  14, 6,
          3,  11, 1,  9,
          15, 7,  13, 5
        ];
        const HALFTONE = [
          15, 14, 12, 10, 10, 12, 14, 15,
          14, 12, 10, 8,  8,  10, 12, 14, 
          12, 10, 8,  4,  4,  8,  10, 12,
          10, 8,  4,  0,  2,  6,  8,  10,
          10, 8,  4,  2,  2,  6,  8,  10, 
          12, 10, 8,  6,  6,  8,  10, 12,
          14, 12, 10, 8,  8,  10, 12, 14,
          15, 14, 12, 10, 10, 12, 14, 16
        ];
        switch(o.mix) {
          case MIX_PLAIN:
            col = img.blend(o.col1, o.col2, bias);
            break;
          case MIX_HALF:
            col = (bias < 0.5) ? o.col1 : o.col2;
            break;
          case MIX_RANDOM:
            col = (bias < Math.random()) ? o.col1 : o.col2;
            break;
          case MIX_BAYER:
            col = (bias * 16 < DITHER[x % 4 + y % 4 * 4]) ? o.col1 : o.col2;
            break;
          case MIX_HALFTONE:
            col = (bias * 16 < HALFTONE[x % 8 + y % 8 * 8]) ? o.col1 : o.col2;
            break;
          case MIX_DAFT_X:
            col = (bias < y % 2 / 3 + 0.333) ? o.col1 : o.col2;
            break;
          case MIX_DAFT_Y:
            col = (bias < x % 2 / 3 + 0.333) ? o.col1 : o.col2;
            break;
          case MIX_HALF_DITHER:
            col = (bias < (x + y) % 2 / 3 + 0.333) ? o.col1 : o.col2;
            break;
          default:
            console.error(`unknown mix mode ${o.mix}`);
        }
        //const col = mix(col1, col2, Math.floor(bias * 4) / 4);
        img.plotPixel(col, x, y);
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
    octaves: 2
  };
  
  types = {
    octaves: {
      type: "number",
      step: 1,
      max: 16,
      min: 1,
      unsafe: true
    }
  };
  
  generate(o) {
    let fractalNoise = new Array(img.w * img.h);
    
    for(let i = 0; i < fractalNoise.length; i++) fractalNoise[i] = Math.random();
    
    let scale = 1;
    //the first octave is already done above, so skip it
    for(let octave = 1; octave < o.octaves; octave++) {
      scale *= 2;
      
      let tempNoise = new Array(Math.ceil(img.w / scale) * Math.ceil(img.h / scale));
      
      for(let i = 0; i < tempNoise.length; i++) tempNoise[i] = Math.random();
      
      for(let y = 0; y < img.h; y++) {
        for(let x = 0; x < img.w; x++) {
          const imgIdx = x + y * img.w;
          const scaledIdx = Math.floor(x / scale) + Math.floor(y / scale) * Math.floor(img.w / scale);
          //average noise together (same math as 'plain' blend moe)
          fractalNoise[imgIdx] = fractalNoise[imgIdx] + (1 / scale) * (tempNoise[scaledIdx] - fractalNoise[imgIdx]);
        }
      }
    }
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        let col = fractalNoise[x + y * img.w];
        img.plotPixel([col, col, col, 1], x, y);
      }
    }
  }
}
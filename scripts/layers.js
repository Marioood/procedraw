"use strict";
//layer classes (data processing)
/*
default layer options are stored in a layer class as "options" object
new options are passed into generate() as "o" (short for options)
*/
const O_FADE_NONE = 0;
const O_FADE_NEAR_EDGE = 1;
const O_FADE_NEAR_CENTER = 2;
const O_FADE_SQUARED = 3;
const O_FADE = 4;
  
class Layer {
  //class name
  name;
  //user defined name
  displayName;
  //rendered pixel data, used by filter layers
  data;
  //this should be self explanatory
  isFilter = false;
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
    xScale: 1,
    yScale: 1,
    normalized: true
  };
  
  types = {
    xScale: {
      type: "number",
      step: 0.1
    },
    yScale: {
      type: "number",
      step: 0.1
    },
    normalized: {
      type: "boolean"
    }
  };
  
  generate(o) {
    let xScale, yScale;
    if(o.normalized) {
      xScale = 256 / img.w;
      yScale = 256 / img.h;
    } else {
      xScale = o.xScale;
      yScale = o.yScale;
    }
    
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
    x: 0,
    y: 0,
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
    x: {
      type: "number",
      min: 0,
      max: 256
    },
    y: {
      type: "number",
      min: 0,
      max: 256
    },
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
        O_FADE_NEAR_CENTER,
        O_FADE_NEAR_EDGE
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
    
    if(o.fadeMode == O_FADE_NEAR_EDGE) {
      alpha = 0;
    }
    for(let t = 1; t < o.thickness + 1; t++) {
      if(o.fadeMode == O_FADE_NEAR_EDGE) {
        alpha += alphaStep;
      }
      for(let y = t; y < o.height - t; y++) {
        img.plotPixel(fade(o.colorLeft, alpha), o.x + t - 1, y + o.y);
        img.plotPixel(fade(o.colorRight, alpha), o.x + o.width - t, y + o.y);
      }
      for(let x = t; x < o.width - t; x++) {
        img.plotPixel(fade(o.colorTop, alpha), x + o.x, o.y + t - 1);
        img.plotPixel(fade(o.colorBottom, alpha), x + o.x, o.y + o.height - t);
      }
      img.plotPixel(blend(o.colorTop, o.colorLeft, alpha), o.x + t - 1, o.y + t - 1);
      img.plotPixel(blend(o.colorTop, o.colorRight, alpha), o.x + o.width - t, o.y + t - 1);
      img.plotPixel(blend(o.colorBottom, o.colorLeft, alpha), o.x + t - 1, o.y + o.height - t);
      img.plotPixel(blend(o.colorBottom, o.colorRight, alpha), o.x + o.width - t, o.y + o.height - t);
      
      if(o.fadeMode == O_FADE_NEAR_CENTER) {
        alpha -= alphaStep;
      }
    }
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
      type: "number"
    },
    yShift: {
      type: "number"
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

class LayerWandering2 extends Layer {
  name = "wandering2";
  
  options = {
    dir: 45,
    spacing: 16,
    spread: 0,
    minLength: 8,
    maxLength: 8,
    minWidth: 1,
    maxWidth: 1
  };
  
  types = {
    dir: {
      type: "number",
      step: 1,
      max: 360,
      min: 0
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
      max: 16,
      unsafe: true
    },
    maxWidth: {
      type: "number",
      min: 1,
      max: 16,
      unsafe: true
    }
  };
  
  generate(o) {
    //multiply by sqrt of 2 to prevent weird skipping between angles
    const xChange = sind(o.dir) * Math.sqrt(2);
    const yChange = cosd(o.dir) * Math.sqrt(2);
    let xFlip = 1;
    let yFlip = 1;
    if(xChange < 0) {
      xFlip = -1;
    }
    if(yChange < 0) {
      yFlip = -1;
    }
    const lineCount = img.w * img.h / (o.spacing * 2);
    //draw several lines
    for(let l = 0; l < lineCount; l++) {
      const xOffs = Math.floor(img.w * Math.random());
      const yOffs = Math.floor(img.h * Math.random());
      const len = Math.random() * (o.maxLength - o.minLength) + o.minLength;
      let progress = 0
      //draw a line
      if(Math.abs(xChange) < Math.abs(yChange)) {
        for(let i = 0; i < len; i++) {
          progress += xChange;
          const randOffs = (Math.random() - 0.5) * o.spread * 2;
          //prevent weird looking breaks in the lines
          if(randOffs + xChange < 1 && randOffs + xChange > -1) progress += randOffs;
          
          img.plotPixel([1, 1, 1, 1], Math.round(progress) + xOffs, i * yFlip + yOffs);
        }
      } else {
        for(let i = 0; i < len; i++) {
          progress += yChange;
          const randOffs = (Math.random() - 0.5) * o.spread * 2;
          if(randOffs + yChange < 1 && randOffs + yChange > -1) progress += randOffs;
          
          img.plotPixel([1, 1, 1, 1], i * xFlip + xOffs, Math.round(progress) + yOffs);
        }
      }
    }
  }
}
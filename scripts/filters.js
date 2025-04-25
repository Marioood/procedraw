class Filter extends Layer {
  isFilter = true;
  
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
      hidden: false
    }
  };
}

class FilterTranslate extends Filter {
  name = "translate";
  
  options = {
    x: 0,
    y: 0
  };
  
  types = {
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
        img.plotPixel([r, g, b, a], x + o.x, y + o.y);
      }
    }
  }
}

class FilterTile extends Filter {
  name = "tile";
  
  options = {
    x: 0,
    y: 0,
    width: 16,
    height: 16,
    xOffs: 0,
    yOffs: 0,
    xShift: 0,
    yShift: 0
  };
  
  types = {
    x: {
      type: "number",
      step: 1,
      min: 0,
      max: 256
    },
    y: {
      type: "number",
      step: 1,
      min: 0,
      max: 256
    },
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
      min: 0,
      max: 256
    },
    yOffs: {
      type: "number",
      step: 1,
      min: 0,
      max: 256
    },
    xShift: {
      type: "number",
      step: 1,
      min: 0,
      max: 256
    },
    yShift: {
      type: "number",
      step: 1,
      min: 0,
      max: 256
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
        img.plotPixel([r, g, b, a], x - o.xOffs + o.x + xShift, y - o.yOffs + o.y + yShift);
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
    width: 1,
    height: 1
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
class FilterTranslate extends Layer {
  name = "translate";
  isFilter = true;
  
  options = {
    base: 0,
    x: 0,
    y: 0
  };
  
  types = {
    base: {
      type: "layer"
    },
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
    }
  };
  
  generate(o) {
    const data = img.layers[img.layerHashes[o.base]].data;
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

class FilterTile extends Layer {
  name = "tile";
  isFilter = true;
  
  options = {
    base: 0,
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
    base: {
      type: "layer"
    },
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
    const data = img.layers[img.layerHashes[o.base]].data;
    
    for(let y = 0; y < img.h; y++) {
      for(let x = 0; x < img.w; x++) {
        const xi = mod((x - o.xOffs), o.width) + o.xOffs;
        const yi = mod((y - o.yOffs), o.height) + o.yOffs;
        const idx = xi % img.w + yi % img.h * img.w;
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const a = data[idx * 4 + 3];
        const xShift = o.xShift * Math.floor(y / o.width);
        const yShift = o.yShift * Math.floor(x / o.height);
        img.plotPixel([r, g, b, a], x - o.xOffs + o.x + xShift, y - o.yOffs + o.y + yShift);
      }
    }
  }
}
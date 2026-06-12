//////////////////////////////////////////////
//    All Procedraw Material is Licensed    //
//     December, 2024-???? under MIT by.    //
//         Backshot Betty #killtf2.         //
//                 _______                  //
//                |   |_|+|                 //
//                |___|+|_|                 //
//                |_|+|   |                 //
//                |+|_|___|                 //
//                                          //
//   *Any names, or persons, illustrated    //
// in any of the Procedraw Programs, except //
//     that of Backshot Betty #killtf2,     //
//          that may seem similar           //
//               to anyone                  //
//   in real life, are purely coincidental, //
//         or otherwise parodic.*           //
//////////////////////////////////////////////

"use strict";
//change this variable if you're developing
const DEBUG = true;

//color picker state
const colp = {
  target: null,
  localDisplay: null,
  redSlider: null,
  redBox: null,
  greenSlider: null,
  greenBox: null,
  blueSlider: null,
  blueBox: null,
  hexBox: null,
  hueSlider: null,
  hueBox: null,
  sattySlider: null,
  sattyBox: null,
  valueSlider: null,
  valueBox: null,
  alphaSlider: null,
  alphaBox: null,
  //[R, G, B, A] from 0...1
  RGB: null,
  //[H, S, V] from 0...360 and from 0...1
  HSV: null,
  alpha: 0,
  
  //this is the current selected color input
  globalDisplay: null,
  //this is what happens when the color picker changes
  globalOninput: null,
  //???
  globalUpdate: null,

  externalUpdate: function(inputCol) {
    this.RGB[0] = Math.floor(inputCol[0] * 255);
    this.RGB[1] = Math.floor(inputCol[1] * 255);
    this.RGB[2] = Math.floor(inputCol[2] * 255);
    this.alpha = Math.floor(inputCol[3] * 255);
    this.HSV = RGB2HSV(inputCol);
    
    this.setSlidersRGB();
    this.setSlidersHSV();
    this.setSlidersAlpha();
    this.updateColors();
    this.hexBox.value = RGB2Hex(inputCol);
    let trans = `rgba(${this.RGB[0]}, ${this.RGB[1]}, ${this.RGB[2]}, ${this.alpha / 255})`;
    let opaque = `rgb(${this.RGB[0]}, ${this.RGB[1]}, ${this.RGB[2]})`;
    this.localDisplay.style.background = `linear-gradient(90deg, ${trans} 0%, ${opaque} 100%), url("img/ui/checker.png")`;
  },
  updateColors: function() {
    this.redSlider.style.background = `linear-gradient(90deg, rgb(0, ${this.RGB[1]}, ${this.RGB[2]}) 0%, rgb(255, ${this.RGB[1]}, ${this.RGB[2]}) 100%)`;
    this.greenSlider.style.background = `linear-gradient(90deg, rgb(${this.RGB[0]}, 0, ${this.RGB[2]}) 0%, rgb(${this.RGB[0]}, 255, ${this.RGB[2]}) 100%)`;
    this.blueSlider.style.background = `linear-gradient(90deg, rgb(${this.RGB[0]}, ${this.RGB[1]}, 0) 0%, rgb(${this.RGB[0]}, ${this.RGB[1]}, 255) 100%)`;
    const valByte = Math.floor(this.HSV[2] * 2.55);
    const fullSatty = HSV2ByteRGB([this.HSV[0], 100, this.HSV[2]]);
    const fullVally = HSV2ByteRGB([this.HSV[0], this.HSV[1], 100]);
    this.sattySlider.style.background = `linear-gradient(90deg, rgb(${valByte}, ${valByte}, ${valByte}) 0%, rgb(${fullSatty[0]}, ${fullSatty[1]}, ${fullSatty[2]}) 100%)`;
    this.valueSlider.style.background = `linear-gradient(90deg, black 0%, rgb(${fullVally[0]}, ${fullVally[1]}, ${fullVally[2]}) 100%)`;
    this.alphaSlider.style.background = `linear-gradient(90deg, transparent 0%, rgb(${this.RGB[0]}, ${this.RGB[1]}, ${this.RGB[2]}) 100%), url("img/ui/checker.png")`
  },
  updateDisplay: function() {
    let trans = `rgba(${this.RGB[0]}, ${this.RGB[1]}, ${this.RGB[2]}, ${this.alpha / 255})`;
    let opaque = `rgb(${this.RGB[0]}, ${this.RGB[1]}, ${this.RGB[2]})`;
    if(this.localDisplay != null) this.localDisplay.style.background = `linear-gradient(90deg, ${trans} 0%, ${opaque} 100%), url("img/ui/checker.png")`;
    if(colp.globalDisplay != null) colp.globalDisplay.style.background = `linear-gradient(0deg, ${trans} 0%, ${opaque} 100%), url("img/ui/checker.png")`;
  },
  setSlidersRGB: function() {
    this.redSlider.value = this.RGB[0];
    this.greenSlider.value = this.RGB[1];
    this.blueSlider.value = this.RGB[2];
    this.redBox.value = this.RGB[0];
    this.greenBox.value = this.RGB[1];
    this.blueBox.value = this.RGB[2];
  },
  setSlidersHSV: function() {
    this.hueSlider.value = this.HSV[0];
    this.sattySlider.value = this.HSV[1];
    this.valueSlider.value = this.HSV[2];
    this.hueBox.value = this.HSV[0];
    this.sattyBox.value = this.HSV[1];
    this.valueBox.value = this.HSV[2];
  },
  setSlidersAlpha: function() {
    this.alphaSlider.value = this.alpha;
    this.alphaBox.value = this.alpha;
  },
  updateSlidersRGB: function() {
    this.HSV = byteRGB2HSV(this.RGB);
    const hex = byteRGB2Hex(this.RGB);
    this.updateHexBox();
    this.updateDisplay();
    this.updateColors();
    this.setSlidersHSV();
    
    const newCol = [this.RGB[0] / 255, this.RGB[1] / 255, this.RGB[2] / 255, this.alpha / 255];
    if(colp.globalOninput != null) colp.globalOninput(newCol);
  },
  updateSlidersHSV: function() {
    this.RGB = HSV2ByteRGB(this.HSV);
    const hex = byteRGB2Hex(this.RGB);
    this.updateHexBox();
    this.updateDisplay();
    this.localDisplay.style.backgroundColor = '#' + hex;
    this.updateColors();
    this.setSlidersRGB();
    
    const newCol = [this.RGB[0] / 255, this.RGB[1] / 255, this.RGB[2] / 255, this.alpha / 255];
    if(colp.globalOninput != null) colp.globalOninput(newCol);
  },
  updateSlidersAlpha: function() {
    const newCol = [this.RGB[0] / 255, this.RGB[1] / 255, this.RGB[2] / 255, this.alpha / 255];
    if(colp.globalOninput != null) colp.globalOninput(newCol);
    this.updateHexBox();
    this.updateDisplay();
  },
  updateHexBox: function() {
    const hex = byteRGB2Hex(this.RGB);
    let a = this.alpha.toString(16);
    if(a.length < 2) a = "0" + a;
    this.hexBox.value = hex + a;
  }
};

function main() {
  //all of these get passed through functions
  //the carry important state shit
  //serial is for saving/loading images
  const serial = new Serialization();
  //tether is for interaction between the ui and images
  const tether = new Tether();
  //this is the actual image itself
  const img = new ProcedrawImage();
  
  setupLayerManagementButtons(img, tether);
  setupImageOptions(img, tether, serial);
  setupHeaderMenu(img, tether, serial);
  setupKeybinds(img, tether);
  
  //////// URL SAVE LOADING ////////
  const params = new URLSearchParams(window.location.search);

  (async() => {
    let save = params.get("save");
    if (!save) return;
    const o = save;

    try {
      await serial.loadEnc(img, save);
      tether.generateLayerList(img);
      img.updateSize();
      tether.updateSize(img);
      tether.printImage(img);
      setTitle(img.name);
      
      document.getElementById("img-bg-input").value = '#' + RGB2Hex(img.bg);
      document.getElementById("img-load-data").value = o;
    } catch (why) {
      console.error("Failed to load save");
    }
  })();
  //////// CANVAS ZOOM SCHTUFF ////////
  
  const canvasView = document.getElementById("canvas-container");
  
  canvasView.onwheel = (e) => {
    //wonky because we're updating the zoom amount, not the width and height
    //zooming because exaggerated as the image becomes larger, because the canvasScale is smaller
    //const zoomDiv = (img.w + img.h) / 2; //do this so that zooming is a little less weird... i guess
    //t.canvasScale -= Math.sqrt(Math.abs(e.deltaY / 128)) * zoomMult;
    tether.canvasScale -= (e.deltaY / 128)/* ** 2 * zoomMult*/;
    tether.canvasScale = Math.max(tether.canvasScale, 0);
    tether.updateCanvasScale(img);
  };
  
  //refresh warning
  if(!DEBUG) {
    window.addEventListener("beforeunload", function (e) {
      event.preventDefault();
      event.returnValue = true;
    });
  }
  if(DEBUG) console.log("debug mode is enabled; some features may be disabled or enabled");
  tether.updateSize(img);
  tether.printImage(img, true);
}

function setupLayerManagementButtons(img, tether) {
  const removeLayer = document.getElementById("remove-layer");
  removeLayer.addEventListener("click", function (e) {
    //dont do anything if there arent any layers
    if(img.layers.length == 0) return;
    const curLayer = img.layers[tether.currentLayer]
    if(curLayer.linkCount > 0) {
      alert(`unable to delete layer; it is currently linked with ${curLayer.linkCount} filters(s)`);
      return;
    }
    if(curLayer.isFilter) {
      const baseKey = curLayer.od.base;
      //skip the link count stuff if the base isn't set
      if(baseKey != KEY_CANVAS) { 
        img.layers[img.layerKeys[baseKey]].linkCount--;
      }
      //decrement link counts in layers linked via options (FilterMerge)
      const keys = Object.keys(curLayer.options);
      
      for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if(curLayer.types[key].type == "layer") {
          const layerKey = curLayer.options[key];
          if(layerKey != KEY_CANVAS) img.layers[img.layerKeys[layerKey]].linkCount--;
        }
      }
    }
    //copy keys so that index searching doesn't break
    let keysCopy = new Array(img.layerKeys.length);
    for(let i = 0; i < keysCopy.length; i++) keysCopy[i] = img.layerKeys[i];
    //mark the deleted layer as free
    img.layerKeysFreed.push(keysCopy.indexOf(tether.currentLayer));
    keysCopy[img.layerKeys.indexOf(tether.currentLayer)] = KEY_FREED;
    //rearrange layer keys
    for(let i = tether.currentLayer + 1; i < img.layers.length; i++) {
      const idx = img.layerKeys.indexOf(i);
      keysCopy[idx]--;
    }
    //copy the modified keys back
    for(let i = 0; i < keysCopy.length; i++) img.layerKeys[i] = keysCopy[i];
    
    img.layers.splice(tether.currentLayer, 1);
    //go down a layer if we're in the middle, stay in place if we're at the bottom
    if(tether.currentLayer > 0) {
       tether.setCurrentLayer(tether.currentLayer - 1);
    }
    //clear layer keys and freed indexes if there are no layers (prevent memory leaks)
    if(img.layers.length == 0) {
      img.layerKeys = [];
      img.layerKeysFreed = [];
    }
    tether.updateLayerOptions(img);
    tether.generateLayerList(img);
    tether.printImage(img);
  });
  //warning that you cant remove right now!
  removeLayer.onmousedown = (e) => {
    if(img.layers.length == 0) {
      removeLayer.classList.add("outline-invalid");
    } else {
      removeLayer.classList.remove("outline-invalid");
    }
  };

  const clearLayer = document.getElementById("clear-layer");
  clearLayer.addEventListener("click", function (e) {
    if(img.layers.length == 0) return;
    if(confirm("Clear all layers? This cannot be undone.")) {
      //go down a layer if we're in the middle, stay in place if we're at the bottom
      tether.setCurrentLayer(0);
      img.layers = [];
      //clear layer keys and freed indexes if there are no layers (prevent memory leaks)
      img.layerKeys = [];
      img.layerKeysFreed = [];
      tether.updateLayerOptions(img);
      tether.generateLayerList(img);
      tether.printImage(img);
    }
  });
  //warning that you cant remove right now!
  clearLayer.onmousedown = (e) => {
    if(img.layers.length == 0) {
      clearLayer.classList.add("outline-invalid");
    } else {
      clearLayer.classList.remove("outline-invalid");
    }
  };
  const addLayer = document.getElementById("add-layer");
  addLayer.onclick = (e) => {
    if(img.layers.length > 0) {
      tether.setCurrentLayer(tether.currentLayer + 1);
    }
    const layer = new tether.currentClass;
    layer.displayName = layer.name;
    img.insertLayer(tether.currentLayer, layer);
    
    tether.updateLayerOptions(img);
    tether.generateLayerList(img);
    tether.printImage(img);
  };
  const dupeLayer = document.getElementById("dupe-layer");
  dupeLayer.addEventListener("click", function (e) {
    const layer2Dupe = img.layers[tether.currentLayer];
    if(layer2Dupe == null) return;

    const clone = new img.layerClasses[layer2Dupe.name];
    //create copies - not references
    clone.options = deepObjectCopy(layer2Dupe.options);
    clone.od = deepObjectCopy(layer2Dupe.od);
    
    tether.setCurrentLayer(tether.currentLayer + 1);
    clone.displayName = "copy of " + img.layers[tether.currentLayer - 1].displayName;
    img.insertLayer(tether.currentLayer, clone);
    //fix that smearing!!
    tether.updateLayerOptions(img);
    tether.generateLayerList(img);
    tether.printImage(img);
  });
  //warning that you cant dupe right now!
  dupeLayer.onmousedown = (e) => {
    if(img.layers.length == 0) {
      dupeLayer.classList.add("outline-invalid");
    } else {
      dupeLayer.classList.remove("outline-invalid");
    }
  };
  
  const randomLayer = document.getElementById("random-layer");
  randomLayer.addEventListener("click", function (e) {
    if(img.layers.length > 0) {
      tether.setCurrentLayer(tether.currentLayer + 1);
    }
    const layer = img.godLayer();
    layer.displayName = layer.name;
    img.insertLayer(tether.currentLayer, layer);
    
    tether.updateLayerOptions(img);
    tether.generateLayerList(img);
    tether.printImage(img);
  });
  //LAYER SELECT STUFFFFFFFS
  let layerSelectShown = false;
  
  const layerSelectDropdown = document.getElementById("layer-select-dropdown-button");
  
  layerSelectDropdown.onclick = (e) => {
    if(layerSelectShown) {
      document.getElementById("layer-select-table").style.display = "none";
    } else {
      document.getElementById("layer-select-table").style.display = "table";
    }
    layerSelectShown = !layerSelectShown;
  };
  assert(Object.keys(img.layerClasses).length == 34, "layer-select-table expects 31 layers.");
  document.getElementById("layer-select-table").style.display = "none";
  //TODO: maybe have this be decided based on some value in the layer?
  const regularNames = [
    [
      "xorFractal",
      "solid",
      "border",
      "checkers",
      "gradient",
      "waveTable",
      "mandelbrot",
      "seedFractal"
    ],
    [
      "noise",
      "liney",
      "worley",
      "valueNoise"
    ],
    [
      "wandering",
      "blobs",
      "bitmapText",
      "tileMap"
    ]
  ]
  const filterNames = [
    [
      "tweak",
      //rotate
      "shear",
      "scale",
      "tile",
      "repeat",
      "mask",
      "offset"
    ],
    [
      "invert",
      "contrast",
      "HSV",
      "blur",
      "sine",
      "functionPass"
    ],
    [
      "emboss",
      "sharpen",
      "merge",
      "vectorize",
      "sunlight"
    ]
  ];
  
  //written in yap code
  //uhhhhhhhh max length
  let regularNamesLen = regularNames[0].length;
  if(regularNames[1].length > regularNamesLen) regularNamesLen = regularNames[1].length;
  if(regularNames[2].length > regularNamesLen) regularNamesLen = regularNames[2].length;
  const regularNamesSelect = document.getElementById("layer-select-render-layers");
  
  for(let row = 0; row < regularNamesLen; row++) {
    const rowElem = document.createElement("tr");
    for(let col = 0; col < 3; col++) {
      const item = regularNames[col][row];
      const td = document.createElement("td");
      //skip if the name doesn't exist
      if(item == undefined) {
        //insert excess table data so that the background doesn't get messed up
        rowElem.appendChild(td);
        continue;
      }
      const button = document.createElement("button");
      button.className = "layer-select-table-button";
      button.innerText = item;
      button.title = img.layerClasses[item].description;
      button.value = item;

      button.onclick = (e) => {
        let className = e.target.value;
        tether.currentClass = img.layerClasses[className];
        document.getElementById("layer-select-table").style.display = "none";
        layerSelectShown = false;
        layerSelectDropdown.innerText = className;
        //add layer
        if(img.layers.length > 0) {
          tether.setCurrentLayer(tether.currentLayer + 1);
        }
        const layer = new tether.currentClass;
        layer.displayName = layer.name;
        img.insertLayer(tether.currentLayer, layer);
        
        tether.updateLayerOptions(img);
        tether.generateLayerList(img);
        tether.printImage(img);
      };
      td.appendChild(button);
      rowElem.appendChild(td);
    }
    regularNamesSelect.appendChild(rowElem);
  }
  
  let filterNamesLen = filterNames[0].length;
  if(filterNames[1].length > filterNamesLen) filterNamesLen = filterNames[1].length;
  if(filterNames[2].length > filterNamesLen) filterNamesLen = filterNames[2].length;
  const filterNamesSelect = document.getElementById("layer-select-filter-layers");
  
  for(let row = 0; row < filterNamesLen; row++) {
    const rowElem = document.createElement("tr");
    for(let col = 0; col < 3; col++) {
      const item = filterNames[col][row];
      const td = document.createElement("td");
      //skip if the name doesn't exist
      if(item == undefined) {
        //insert excess table data so that the background doesn't get messed up
        rowElem.appendChild(td);
        continue;
      }
      const button = document.createElement("button");
      button.className = "layer-select-table-button";
      button.innerText = item;
      button.title = img.layerClasses[item].description;
      button.value = item;

      button.onclick = (e) => {
        let className = e.target.value;
        tether.currentClass = img.layerClasses[className];
        document.getElementById("layer-select-table").style.display = "none";
        layerSelectShown = false;
        layerSelectDropdown.innerText = className;
        //add layer
        if(img.layers.length > 0) {
          tether.setCurrentLayer(tether.currentLayer + 1);
        }
        const layer = new tether.currentClass;
        layer.displayName = layer.name;
        img.insertLayer(tether.currentLayer, layer);
        
        tether.updateLayerOptions(img);
        tether.generateLayerList(img);
        tether.printImage(img);
      };
      td.appendChild(button);
      rowElem.appendChild(td);
    }
    filterNamesSelect.appendChild(rowElem);
  }
}

function setupImageOptions(img, tether, serial) {
  const imageOptions = document.getElementById("image-options");
  
  const nameInput = InputText(img.name,(e) => {
    img.name = e.target.value;
    setTitle(img.name);
  }, "large-input");
  nameInput.id = "img-name-input";
  
  const authorInput = InputText(img.author,(e) => {
    img.author = e.target.value;
  });
  authorInput.id = "img-author-input";
  
  const widthInput = InputNumber(1, 512, img.h, (e) => {
    img.w = Number(e.target.value);
    img.updateSize();
    tether.updateSize(img);
    tether.printImage(img, true);
  });
  widthInput.id = "img-width-input";
  
  const heightInput = InputNumber(1, 512, img.w, (e) => {
    img.h = Number(e.target.value);
    img.updateSize();
    tether.updateSize(img);
    tether.printImage(img, true);
  });
  heightInput.id = "img-height-input";
  
  const bgInput = InputColor([0.5, 0.5, 0.5, 1], (newCol) => {
    img.bg = newCol;
  }, () => {
    tether.printImage(img);
  });
  bgInput.id = "img-bg-input";
  
  const scaleInput = InputNumber(0, 64, tether.canvasScale, (e) => {
    tether.canvasScale = e.target.value;
    tether.updateCanvasScale(img);
  });
  scaleInput.step = 0.25;
  scaleInput.id = "img-scale-input";

  function generateSaveUrl(data) {
    const url = new URL(location.href);
    url.searchParams.set("save", data);
    return url.toString();
  }
  
  const saveImageText = Textarea("data is saved here", null, "save-box");
  saveImageText.readOnly = true;
  
  const saveImageButton = Button("save!", async (e) => {
    if(tether.compressSaves) {
      const url = generateSaveUrl(saveImageText.value = await serial.saveEnc(img));
      if (window.history.replaceState && tether.saveURL) {
        window.history.replaceState({}, "", url);
      }
    } else {
      saveImageText.value = serial.save(img);
    }
  }, "aero-btn");
  const loadImageText = Textarea("you put data here", null, "save-box");
  
  const loadImageButton = Button("load!", async (e) => {
    if(confirm("load image?")) {
      try {
        await serial.loadEnc(img, loadImageText.value);
        tether.generateLayerList(img);
        img.updateSize();
        tether.updateSize(img);
        tether.printImage(img, true);
        setTitle(img.name);
        //DOESNT WORK!!!! color input still uses old color when clicked
        document.getElementById("img-bg-input").style.backgroundColor = '#' + RGB2Hex(img.bg);
        authorInput.value = img.author;
        //bgInput.remove();
        if(window.history.replaceState && tether.saveURL) {
          window.history.replaceState({}, "", generateSaveUrl(await serial.saveEnc(img)));
        }
      } catch(error) {
        window.alert("couldn't parse data! \n\n" + error);
        if(DEBUG) console.error(error);
        return;
      }
    }
  }, "aero-btn");
  //custom color picker because i use firefox and it uses the ms paint color picker
  colp.localDisplay = divWrap("colp-display");
  colp.RGB = [0, 0, 0]; //R, G, B
  colp.localDisplay.style.backgroundColor = "#" + RGB2Hex(colp.RGB);
  colp.HSV = byteRGB2HSV(colp.RGB) //H, S, V
  colp.alpha = 255;

  //make this a function to call another function, because colpGlobalUpdate changes what function it is (and is also sometimes null!!)
  function onupdate() {
    if(colp.globalUpdate != null) colp.globalUpdate();
  }
  //chris chan reference...????
  colp.hexBox = InputText("000000ff", (e) => {
    const hex = e.target.value;
    let newCol;
    //color of display and color of output don't match if the input is invalid... but i dont care
    if(hex.length < 6) {
      newCol = intRGB2RGB(Number("0x" + hex));
    } else if(hex.length == 6) {
      newCol = intRGB2RGB(Number("0x" + hex + "ff"));
    } else {
      newCol = intRGB2RGB(Number("0x" + hex));
    }
    
    colp.RGB[0] = Math.floor(newCol[0] * 255);
    colp.RGB[1] = Math.floor(newCol[1] * 255);
    colp.RGB[2] = Math.floor(newCol[2] * 255);
    colp.HSV = RGB2HSV(newCol);
    colp.alpha = Math.floor(newCol[3] * 255);
    
    colp.updateDisplay();
    colp.setSlidersRGB();
    colp.setSlidersHSV();
    colp.setSlidersAlpha();
    colp.updateColors();
    
    if(colp.globalOninput != null) colp.globalOninput(newCol);
  }, "colp-text");

  // RGB //
  colp.redSlider = InputRange(0, 255, 0, (e) => {
    const red = Number(e.target.value);
    colp.RGB[0] = red;
    colp.redBox.value = red;
    colp.updateSlidersRGB();
  
  });
  colp.redSlider.onmouseup = onupdate;
  colp.redBox = InputNumber(0, 255, 0, (e) => {
    const red = Number(e.target.value);
    colp.RGB[0] = red;
    colp.redSlider.value = red;
    colp.updateSlidersRGB();
  });
  
  colp.greenSlider = InputRange(0, 255, 0, (e) => {
    const green = Number(e.target.value);
    colp.RGB[1] = green;
    colp.greenBox.value = green;
    colp.updateSlidersRGB();
  });
  colp.greenSlider.onmouseup = onupdate;
  colp.greenBox = InputNumber(0, 255, 0, (e) => {
    const green = Number(e.target.value);
    colp.RGB[1] = green;
    colp.greenSlider.value = green;
    colp.updateSlidersRGB();
  });
  
  colp.blueSlider = InputRange(0, 255, 0, (e) => {
    const blue = Number(e.target.value);
    colp.RGB[2] = blue;
    colp.blueBox.value = blue;
    colp.updateSlidersRGB();
  });
  colp.blueSlider.onmouseup = onupdate;
  colp.blueBox = InputNumber(0, 255, 0, (e) => {
    const blue = Number(e.target.value);
    colp.RGB[2] = blue;
    colp.blueSlider.value = blue;
    colp.updateSlidersRGB();
  });
  // HSV //
  colp.hueSlider = InputRange(0, 359, 0, (e) => {
    const hue = Number(e.target.value);
    colp.HSV[0] = hue;
    colp.hueBox.value = hue;
    colp.updateSlidersHSV();
  }, "woke-bg");
  colp.hueSlider.onmouseup = onupdate;
  colp.hueBox = InputNumber(0, 359, 0, (e) => {
    const hue = Number(e.target.value);
    colp.HSV[0] = hue;
    colp.hueSlider.value = hue;
    colp.updateSlidersHSV();
  });
  
  colp.sattySlider = InputRange(0, 100, 0, (e) => {
    const satty = Number(e.target.value);
    colp.HSV[1] = satty;
    colp.sattyBox.value = satty;
    colp.updateSlidersHSV();
  });
  colp.sattySlider.onmouseup = onupdate;
  colp.sattyBox = InputNumber(0, 100, 0, (e) => {
    const satty = Number(e.target.value);
    colp.HSV[1] = satty;
    colp.sattySlider.value = satty;
    colp.updateSlidersHSV();
  });
  
  colp.valueSlider = InputRange(0, 100, 0, (e) => {
    const value = Number(e.target.value);
    colp.HSV[2] = value;
    colp.valueBox.value = value;
    colp.updateSlidersHSV();
  });
  colp.valueSlider.onmouseup = onupdate;
  colp.valueBox = InputNumber(0, 100, 0, (e) => {
    const value = Number(e.target.value);
    colp.HSV[2] = value;
    colp.valueSlider.value = value;
    colp.updateSlidersHSV();
  });
  
  // alpha //
  colp.alphaSlider = InputRange(0, 255, 0, (e) => {
    const alpha = Number(e.target.value);
    colp.alpha = alpha;
    colp.alphaBox.value = alpha;
    colp.updateSlidersAlpha();
  });
  colp.alphaSlider.onmouseup = onupdate;
  colp.alphaBox = InputNumber(0, 255, 0, (e) => {
    const alpha = Number(e.target.value);
    colp.alpha = alpha;
    colp.alphaSlider.value = alpha;
    colp.updateSlidersAlpha();
  });
  
  const colpContainer = divWrap(
    "colp-container",
    colp.localDisplay,
    document.createElement("br"),
    Label("red"),
    colp.redSlider,
    colp.redBox,
    document.createElement("br"),
    Label("green"),
    colp.greenSlider,
    colp.greenBox,
    document.createElement("br"),
    Label("blue"),
    colp.blueSlider,
    colp.blueBox,
    document.createElement("br"),
    Label("hex"),
    colp.hexBox,
    document.createElement("br"),
    Label("hue"),
    colp.hueSlider,
    colp.hueBox,
    document.createElement("br"),
    Label("satty"),
    colp.sattySlider,
    colp.sattyBox,
    document.createElement("br"),
    Label("value"),
    colp.valueSlider,
    colp.valueBox,
    document.createElement("br"),
    Label("alpha"),
    colp.alphaSlider,
    colp.alphaBox
  );
      
  colp.setSlidersRGB();
  colp.setSlidersHSV();
  colp.setSlidersAlpha();
  colp.updateColors();
  
  colp.target = colpContainer;
  //document.getElementById("colp-container").appendChild(colp.target);
  //TODO: make inputs consistent with layer options
  imageOptions.appendChild(divWrap(
    nameInput,
    document.createElement("br"),
    Label("author"),
    authorInput,
    document.createElement("br"),
    Label("background"),
    bgInput,
    document.createElement("br"),
    Label("width"),
    widthInput,
    document.createElement("br"),
    Label("height"),
    heightInput,
    document.createElement("br"),
    Tag("hr"),
    divWrap(
      "label-container",
      saveImageButton
    ),
    saveImageText,
    document.createElement("br"),
    divWrap(
      "label-container",
      loadImageButton
    ),
    loadImageText,
    document.createElement("br"),
    Label("zoom"),
    scaleInput,
    document.createElement("br"),
    Button("render", (e) => {
      tether.printImage(img, true);
    }, "aero-btn"),
    colpContainer
  ));
}

function setupHeaderMenu(img, tether, serial) {
  const topContainer = document.getElementById("top-container");
  let curIdx = -1;
  const makeItems = (e, idx, thetan) => {
    const tomCruise = document.getElementById("tom-cruise");
    if(tomCruise != null) tomCruise.remove();
    if(curIdx == idx) {
      curIdx = -1;
      return;
    }
    curIdx = idx;
    //get position of the target element
    //the web was well designed
    const rect = e.target.getBoundingClientRect();
    thetan.style.left = rect.left + "px";
    thetan.style.top = rect.bottom + "px";
    thetan.id = "tom-cruise";
    document.body.appendChild(thetan);
  };
  
  let showCredits = false;
  const creditBox = document.getElementById("credits-container");
  creditBox.style.display = "none";
  
  const creditButton = Button("credits", (e) => {
    showCredits = !showCredits;
    
    if(showCredits) {
      creditBox.style.display = "initial";
    } else {
      creditBox.style.display = "none";
    }
  });
  const godButton = Button("create god image", (e) => {
    
    img.name = godText(16);
    img.author = "God";
    document.getElementById("img-name-input").value = img.name;
    document.getElementById("img-author-input").value = img.author;
    //go down a layer if we're in the middle, stay in place if we're at the bottom
    tether.setCurrentLayer(0);
    img.layers = [];
    //these were causing an error because i accidentally added an s after the 'layer' part...
    //thanks javascript for not catching that one
    img.layerKeys = [];
    img.layerKeysFreed = [];
    setTitle(img.name);
    
    let layerCount = Math.ceil(Math.random() * 24);
    
    for(let i = 0; i < layerCount; i++) {
      const curLayer = img.godLayer();
      curLayer.displayName = godText(2);
      //proper link count for filters
      img.insertLayer(img.layers.length, curLayer);
      tether.currentLayer++;
    }
    tether.currentLayer--;
    tether.setCurrentLayer(tether.currentLayer);
    img.bg = [Math.random(), Math.random(), Math.random(), Math.random()];
    tether.updateLayerOptions(img);
    tether.generateLayerList(img);
    tether.printImage(img);
  });
  
  topContainer.appendChild(
    divWrap(
      Button("file", (e) => {
        makeItems(e, 0, divWrap(
          "header-items",
          Button("save as file"),
          document.createElement("br"),
          Button("load from file"),
          document.createElement("br"),
          Button("share"),
          document.createElement("br"),
          godButton,
          document.createElement("br"),
          Label("compressSaves", "header-label"),
          InputCheckbox(tether.compressSaves, (checked, e) => {
            tether.compressSaves = checked;
          }),
          document.createElement("br"),
          Label("saveURL", "header-label"),
          InputCheckbox(tether.saveURL, (checked, e) => {
            tether.saveURL = checked;
          })
        ));
      }, "header-dropdown"),
      Button("edit", (e) => {
        makeItems(e, 1, divWrap(
          "header-items",
          Text("xenu is real"),
          document.createElement("br"),
          Text("tom cruise is a fudge packer")
        ));
      }, "header-dropdown"),
      Button("view", (e) => {
        makeItems(e, 2, divWrap(
          "header-items",
          Label("renderOnUpdate", "header-label"),
          InputCheckbox(tether.renderOnUpdate, (checked, e) => {
            console.log(checked);
            tether.renderOnUpdate = checked;
          }),
          /*document.createElement("br"),
          Label("useRenderWorker", "header-label"),
          InputCheckbox(t.useRenderWorker, (checked, e) => {
            t.useRenderWorker = checked;
          }),*/
          document.createElement("br"),
          Label("smoothView", "header-label"),
          InputCheckbox(tether.smoothView, (checked, e) => {
            tether.smoothView = checked;
            if(tether.smoothView) {
              tether.canvas.style.imageRendering = "smooth";
            } else {
              tether.canvas.style.imageRendering = "pixelated";
            }
          }),
          document.createElement("br"),
          Label("tileView", "header-label"),
          InputCheckbox(tether.tileView, (checked, e) => {
            tether.tileView = checked;
            tether.updateSize(img);
            tether.printImage(img, true);
          })
        ));
      }, "header-dropdown"),
      Button("????", (e) => {
        makeItems(e, 3, divWrap(
          "header-items",
          creditButton
        ));
      }, "header-dropdown"),
      Text("procedraw " + PD_VERSION, "version-text")
    )
  );
}

function setupKeybinds(img, tether) {
  let oldTimeR = 0;
  document.onkeydown = (e) => {
    //intentionally lag the input so it doesnt print too fast
    let curTime = Math.round(Date.now() / 100);
    if(oldTimeR != curTime) {
      if(e.key == "r" || e.key == "R") {
        oldTimeR = curTime;
        tether.printImage(img, true);
      } else if(DEBUG) {
        if(e.key == "h" || e.key == "H") {
          //print layer keys
          console.log("current layer keys:");
          console.log(img.layerKeys);
          console.log("current freed layer key indices:");
          console.log(img.layerKeysFreed);
          console.log("---");
        } else if(e.key == "c" || e.key == "C") {
          //print out the layer links
          console.log("layer link counts:");
          for(let i = 0; i < img.layers.length; i++) {
            const layer = img.layers[i];
            console.log(`${i}. ${layer.displayName} is linked ${layer.linkCount} time(s)`);
          }
          console.log("---");
        } else if(e.key == "g" || e.key == "G") {
          //print random text (for chang :alien:)
          console.log(godText(256));
        } else if(e.key == "l" || e.key == "L") {
          //print layers
          console.log("--- LAYER INFO ---");
          console.log(img.w + " x " + img.h);
          console.log(img.bg);
          console.log(img.layers);
          console.log("---");
        } else if(e.key == "d" || e.key == "D") {
          //image data error report
          console.log(img.data);
          console.log("errors:");
          let log = [];
          
          for(let y = 0; y < img.h; y++) {
            for(let x = 0; x < img.w; x++) {
              const idx = x + y * img.w;
              
              const r = img.data[idx * 4];
              const g = img.data[idx * 4 + 1];
              const b = img.data[idx * 4 + 2];
              const a = img.data[idx * 4 + 3];
              let errors = "";
              
              if(r === null) {
                errors += "red is null, ";
              } else if(r === undefined) {
                errors += "red is undefined, ";
              } else if(r != r) {
                errors += "red is NaN, ";
              } else if(typeof(r) != "number") {
                errors += "red (" + r + ") is type " + typeof(r) + ", ";
              } else if(r > 1) {
                errors += "red (" + r + ") is >1, ";
              } else if(r < 0) {
                errors += "red (" + r + ") is <0, ";
              }
              if(g === null) {
                errors += "green is null, ";
              } else if(g === undefined) {
                errors += "green is undefined, ";
              } else if(g != g) {
                errors += "green is NaN, ";
              } else if(typeof(g) != "number") {
                errors += "green (" + g + ") is type " + typeof(g) + ", ";
              } else if(g > 1) {
                errors += "green (" + r + ") is >1, ";
              } else if(g < 0) {
                errors += "green (" + r + ") is <0, ";
              }
              if(b === null) {
                errors += "blue is null, ";
              } else if(b === undefined) {
                errors += "blue is undefined, ";
              } else if(b != b) {
                errors += "blue is NaN, ";
              } else if(typeof(a) != "number") {
                errors += "blue (" + b + ") is type " + typeof(b) + ", ";
              } else if(b > 1) {
                errors += "blue (" + r + ") is >1, ";
              } else if(b < 0) {
                errors += "blue (" + r + ") is <0, ";
              }
              if(a === null) {
                errors += "alpha is null, ";
              } else if(a === undefined) {
                errors += "alpha is undefined, ";
              } else if(a != a) {
                errors += "alpha is NaN, ";
              } else if(typeof(a) != "number") {
                errors += "alpha (" + a + ") is type " + typeof(a) + ", ";
              } else if(a > 1) {
                errors += "alpha (" + r + ") is >1, ";
              } else if(a < 0) {
                errors += "alpha (" + r + ") is <0, ";
              }
              if(errors != "") {
                log.push("pixel (" + x + ", " + y + ") " + errors);
              }
            }
          }
          if(log.length == 0) {
            console.log("no errors found!");
          } else {
            console.log(log);
            console.log(log.length + " errors found...");
          }
        } else if((e.key == "m" || e.key == "M") && e.altKey) {
          let willRun = confirm("Alt + M enters 'Monkey Mode.' It is used to test invalid layer settings.\n\nMonkey Mode will DELETE the current image!\n\nIf you wish to cancel, press cancel.");//Enter how many tests you wish to perform.");
         
          if(!willRun) return;
          let iterations = 0;
          //Id or ID?
          let intervalId = null;
          
          function runMonkeyTest() {
            iterations++;
            let errors = [];
            try {
              img.name = "Test #" + iterations + " " + monkeyText(32);
              img.author = "Monkey";
              document.getElementById("img-name-input").value = img.name;
              document.getElementById("img-author-input").value = img.author;
              //go down a layer if we're in the middle, stay in place if we're at the bottom
              tether.setCurrentLayer(0);
              img.layers = [];
              //these were causing an error because i accidentally added an s after the 'layer' part...
              //thanks javascript for not catching that one
              img.layerKeys = [];
              img.layerKeysFreed = [];
              
              let layerCount = Math.ceil(Math.random() * 8);
              
              for(let i = 0; i < layerCount; i++) {
                const curLayer = img.godLayer();
                curLayer.displayName = monkeyText(8)
                //proper link count for filters
                img.insertLayer(img.layers.length, curLayer);
                tether.currentLayer++;
              }
              tether.currentLayer--;
              //TODO: what?
              tether.setCurrentLayer(tether.currentLayer);
              img.bg = [Math.random(), Math.random(), Math.random(), Math.random()];
              tether.updateLayerOptions(img);
              tether.generateLayerList(img);
              tether.printImage(img);
            } catch(e) {
              errors.push(e);
              console.error(e);
            }
            
            for(let i = 0; i < img.data.length; i++) {
              if(img.data[i] != img.data[i]) {
                errors.push("Image contains NaN pixels!");
                console.error("Image contains NaN pixels!");
                break;
              }
              if(img.data[i] == undefined) {
                errors.push("Image contains undefined pixels!");
                console.error("Image contains undefined pixels!");
                break;
              }
            }
            
            if(errors.length > 0) {
              let text = "There were some errors...\n\n";
              for(let i = 0; i < errors.length; i++) {
                text += errors[i];
                text += "\n\n";
              }
              alert(text);
              clearInterval(intervalId);
            }/* else if(iterationsLeft > 0) {
              setTimeout(runMonkeyTest(iterationsLeft - 1), 1000);
            }*/
          }
          
          intervalId = setInterval(runMonkeyTest, 2000);
        }
      }
    }
  }
}
//do this so the variables used during setup aren't in global scope
main();
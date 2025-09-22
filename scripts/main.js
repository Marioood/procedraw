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
//TODO: less global variables?
//TODO: consider making image processing a separate library?
//TODO: less global functions?
//TODO: rethink helper.js
//TODO: should there just be one "procedraw" object? this would make using the image rendering as an external library possible
//TODO: language support
//TODO: make editing less... crude. maybe? or maybe that is style
//https://softwareengineering.stackexchange.com/questions/345344/splitting-up-a-very-large-function-program-into-smaller-functions-effective
//REMINDER: keep ui stuff separate from serialization!
function main() {
  //all of these get passed through functions
  //the carry important state shit
  //serial is for saving/loading images
  const serial = new Serialization();
  //tether is for interaction between the ui and images
  const tether = new Tether();
  //rename to img again
  //this is the actual image itself
  const renameme = new ProcedrawImage();
  //main has had it's heart level shattered to 10%
  setupLayerManagementButtons(renameme, tether);
  setupImageOptions(renameme, tether, serial);
  setupHeaderMenu(renameme, tether, serial);
  setupKeybinds(renameme, tether);
  
  //////// URL SAVE LOADING ////////
  function generateSaveUrl(data) {
    const url = new URL(location.href);
    url.searchParams.set("save", data);
    return url.toString();
  }

  const params = new URLSearchParams(window.location.search);

  (async() => {
    let save = params.get("save");
    if (!save) return;
    const o = save;

    try {
      await serial.loadEnc(renameme, save);
      tether.generateLayerList(renameme);
      renameme.updateSize();
      tether.updateSize(renameme);
      tether.printImage(renameme);
      tether.setTitle(renameme.name);
      
      document.getElementById("img-bg-input").value = '#' + RGB2Hex(renameme.bg);
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
    tether.updateCanvasScale(renameme);
  };
  
  //refresh warning
  if(!DEBUG) {
    window.addEventListener("beforeunload", function (e) {
      event.preventDefault();
      event.returnValue = true;
    });
  }
  if(DEBUG) console.log("debug mode is enabled; some features may be disabled or enabled");
  tether.updateSize(renameme);
  tether.printImage(renameme, true);
}

function setupLayerManagementButtons(renameme, tether) {
  const removeLayer = document.getElementById("remove-layer");
  removeLayer.addEventListener("click", function (e) {
    //dont do anything if there arent any layers
    if(renameme.layers.length == 0) return;
    const curLayer = renameme.layers[tether.currentLayer]
    if(curLayer.linkCount > 0) {
      alert(`unable to delete layer; it is currently linked with ${curLayer.linkCount} filters(s)`);
      return;
    }
    if(curLayer.isFilter) {
      const baseKey = curLayer.od.base;
      //skip the link count stuff if the base isn't set
      if(baseKey != KEY_CANVAS) { 
        renameme.layers[renameme.layerKeys[baseKey]].linkCount--;
      }
      //decrement link counts in layers linked via options (FilterMerge)
      const keys = Object.keys(curLayer.options);
      
      for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if(curLayer.types[key].type == "layer") {
          const layerKey = curLayer.options[key];
          if(layerKey != KEY_CANVAS) renameme.layers[renameme.layerKeys[layerKey]].linkCount--;
        }
      }
    }
    //copy keys so that index searching doesn't break
    let keysCopy = new Array(renameme.layerKeys.length);
    for(let i = 0; i < keysCopy.length; i++) keysCopy[i] = renameme.layerKeys[i];
    //mark the deleted layer as free
    renameme.layerKeysFreed.push(keysCopy.indexOf(tether.currentLayer));
    keysCopy[renameme.layerKeys.indexOf(tether.currentLayer)] = KEY_FREED;
    //rearrange layer keys
    for(let i = tether.currentLayer + 1; i < renameme.layers.length; i++) {
      const idx = renameme.layerKeys.indexOf(i);
      keysCopy[idx]--;
    }
    //copy the modified keys back
    for(let i = 0; i < keysCopy.length; i++) renameme.layerKeys[i] = keysCopy[i];
    
    renameme.layers.splice(tether.currentLayer, 1);
    //go down a layer if we're in the middle, stay in place if we're at the bottom
    if(tether.currentLayer > 0) {
       tether.setCurrentLayer(tether.currentLayer - 1);
    }
    //clear layer keys and freed indexes if there are no layers (prevent memory leaks)
    if(renameme.layers.length == 0) {
      renameme.layerKeys = [];
      renameme.layerKeysFreed = [];
    }
    tether.updateLayerOptions(renameme);
    tether.generateLayerList(renameme);
    tether.printImage(renameme);
  });
  //warning that you cant remove right now!
  removeLayer.onmousedown = (e) => {
    if(renameme.layers.length == 0) {
      removeLayer.classList.add("outline-invalid");
    } else {
      removeLayer.classList.remove("outline-invalid");
    }
  };

  const clearLayer = document.getElementById("clear-layer");
  clearLayer.addEventListener("click", function (e) {
    if(renameme.layers.length == 0) return;
    if(confirm("Clear all layers? This cannot be undone.")) {
      //go down a layer if we're in the middle, stay in place if we're at the bottom
      tether.setCurrentLayer(0);
      renameme.layers = [];
      //clear layer keys and freed indexes if there are no layers (prevent memory leaks)
      renameme.layerKeys = [];
      renameme.layerKeysFreed = [];
      tether.updateLayerOptions(renameme);
      tether.generateLayerList(renameme);
      tether.printImage(renameme);
    }
  });
  //warning that you cant remove right now!
  clearLayer.onmousedown = (e) => {
    if(renameme.layers.length == 0) {
      clearLayer.classList.add("outline-invalid");
    } else {
      clearLayer.classList.remove("outline-invalid");
    }
  };
  const addLayer = document.getElementById("add-layer");
  addLayer.addEventListener("click", function (e) {
    if(renameme.layers.length > 0) {
      tether.setCurrentLayer(tether.currentLayer + 1);
    }
    const layer = new tether.currentClass;
    layer.displayName = layer.name;
    renameme.insertLayer(tether.currentLayer, layer);
    
    tether.updateLayerOptions(renameme);
    tether.generateLayerList(renameme);
    tether.printImage(renameme);
  });
  const dupeLayer = document.getElementById("dupe-layer");
  dupeLayer.addEventListener("click", function (e) {
    const layer2Dupe = renameme.layers[tether.currentLayer];
    if(layer2Dupe == null) return;

    const clone = new renameme.layerClasses[layer2Dupe.name];
    //create copies - not references
    clone.options = deepObjectCopy(layer2Dupe.options);
    clone.od = deepObjectCopy(layer2Dupe.od);
    
    tether.setCurrentLayer(tether.currentLayer + 1);
    clone.displayName = "copy of " + renameme.layers[tether.currentLayer - 1].displayName;
    renameme.insertLayer(tether.currentLayer, clone);
    //fix that smearing!!
    tether.updateLayerOptions(renameme);
    tether.generateLayerList(renameme);
    tether.printImage(renameme);
  });
  //warning that you cant dupe right now!
  dupeLayer.onmousedown = (e) => {
    if(renameme.layers.length == 0) {
      dupeLayer.classList.add("outline-invalid");
    } else {
      dupeLayer.classList.remove("outline-invalid");
    }
  };
  
  const randomLayer = document.getElementById("random-layer");
  randomLayer.addEventListener("click", function (e) {
    if(renameme.layers.length > 0) {
      tether.setCurrentLayer(tether.currentLayer + 1);
    }
    const layer = renameme.godLayer();
    layer.displayName = layer.name;
    renameme.insertLayer(tether.currentLayer, layer);
    
    tether.updateLayerOptions(renameme);
    tether.generateLayerList(renameme);
    tether.printImage(renameme);
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
  assert(Object.keys(renameme.layerClasses).length == 31, "layer-select-table expects 31 layers.");
  document.getElementById("layer-select-table").style.display = "none";
  //TODO: maybe have this be decided based on some value in the layer?
  const regularNames = [
    [
      "xorFractal",
      "solid",
      "border",
      "checkers",
      "gradient",
      "waveTable"
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
      "bitmapText"
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
      button.title = renameme.layerClasses[item].description;
      button.value = item;

      button.onclick = (e) => {
        let className = e.target.value;
        tether.currentClass = renameme.layerClasses[className];
        document.getElementById("layer-select-table").style.display = "none";
        layerSelectShown = false;
        layerSelectDropdown.innerText = className;
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
      button.title = renameme.layerClasses[item].description;
      button.value = item;

      button.onclick = (e) => {
        let className = e.target.value;
        tether.currentClass = renameme.layerClasses[className];
        document.getElementById("layer-select-table").style.display = "none";
        layerSelectShown = false;
        layerSelectDropdown.innerText = className;
      };
      td.appendChild(button);
      rowElem.appendChild(td);
    }
    filterNamesSelect.appendChild(rowElem);
  }
}

function setupImageOptions(renameme, tether, serial) {
  const imageOptions = document.getElementById("image-options");
  
  const nameInput = InputText(renameme.name,(e) => {
    renameme.name = e.target.value;
    tether.setTitle(renameme.name);
  }, "large-input");
  nameInput.id = "img-name-input";
  
  const authorInput = InputText(renameme.author,(e) => {
    renameme.author = e.target.value;
  });
  authorInput.id = "img-author-input";
  
  const widthInput = InputNumber(1, 512, renameme.h, (e) => {
    renameme.w = Number(e.target.value);
    renameme.updateSize();
    tether.updateSize(renameme);
    tether.printImage(renameme, true);
  });
  widthInput.id = "img-width-input";
  
  const heightInput = InputNumber(1, 512, renameme.w, (e) => {
    renameme.h = Number(e.target.value);
    renameme.updateSize();
    tether.updateSize(renameme);
    tether.printImage(renameme, true);
  });
  heightInput.id = "img-height-input";
  
  const bgInput = InputColor([0.5, 0.5, 0.5, 1], (newCol) => {
    renameme.bg = newCol;
  }, () => {
    tether.printImage(renameme);
  });
  bgInput.id = "img-bg-input";
  
  const scaleInput = InputNumber(0, 64, tether.canvasScale, (e) => {
    tether.canvasScale = e.target.value;
    tether.updateCanvasScale(renameme);
  });
  scaleInput.step = 0.25;
  scaleInput.id = "img-scale-input";

  const saveImageText = Textarea("data is saved here", null, "save-box");
  saveImageText.readOnly = true;
  
  const saveImageButton = Button("save!", async (e) => {
    if(tether.compressSaves) {
      const url = generateSaveUrl(saveImageText.value = await serial.saveEnc(renameme));
      if (window.history.replaceState && tether.saveURL) {
        window.history.replaceState({}, "", url);
      }
    } else {
      saveImageText.value = serial.save(renameme);
    }
  }, "aero-btn");
  const loadImageText = Textarea("you put data here", null, "save-box");
  
  const loadImageButton = Button("load!", async (e) => {
    if(confirm("load image?")) {
      try {
        await serial.loadEnc(renameme, loadImageText.value);
        tether.generateLayerList(renameme);
        renameme.updateSize();
        tether.updateSize(renameme);
        tether.printImage(renameme, true);
        tether.setTitle(renameme.name);
        //DOESNT WORK!!!! color input still uses old color when clicked
        document.getElementById("img-bg-input").style.backgroundColor = '#' + RGB2Hex(renameme.bg);
        authorInput.value = renameme.author;
        //bgInput.remove();
        if(window.history.replaceState && tether.saveURL) {
          window.history.replaceState({}, "", generateSaveUrl(await serial.saveEnc(renameme)));
        }
      } catch(error) {
        window.alert("couldn't parse data! \n\n" + error);
        if(DEBUG) console.error(error);
        return;
      }
    }
  }, "aero-btn");
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
      tether.printImage(renameme, true);
    }, "aero-btn")
  ));
}

function setupHeaderMenu(renameme, tether, serial) {
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
    
    renameme.name = godText(16);
    renameme.author = "God";
    document.getElementById("img-name-input").value = renameme.name;
    document.getElementById("img-author-input").value = renameme.author;
    //go down a layer if we're in the middle, stay in place if we're at the bottom
    tether.setCurrentLayer(0);
    renameme.layers = [];
    //these were causing an error because i accidentally added an s after the 'layer' part...
    //thanks javascript for not catching that one
    renameme.layerKeys = [];
    renameme.layerKeysFreed = [];
    
    let layerCount = Math.ceil(Math.random() * 24);
    
    for(let i = 0; i < layerCount; i++) {
      const curLayer = renameme.godLayer();
      curLayer.displayName = godText(2);
      //proper link count for filters
      renameme.insertLayer(renameme.layers.length, curLayer);
      tether.currentLayer++;
    }
    tether.currentLayer--;
    tether.setCurrentLayer(tether.currentLayer);
    renameme.bg = [Math.random(), Math.random(), Math.random(), Math.random()];
    tether.updateLayerOptions(renameme);
    tether.generateLayerList(renameme);
    tether.printImage(renameme);
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
            tether.updateSize(renameme);
            tether.printImage(renameme, true);
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

function setupKeybinds(renameme, tether) {
  let oldTimeR = 0;
  document.onkeydown = (e) => {
    //intentionally lag the input so it doesnt print too fast
    let curTime = Math.round(Date.now() / 100);
    if(oldTimeR != curTime) {
      if(e.key == "r" || e.key == "R") {
        oldTimeR = curTime;
        tether.printImage(renameme, true);
      } else if(DEBUG) {
        if(e.key == "h" || e.key == "H") {
          //print layer keys
          console.log("current layer keys:");
          console.log(renameme.layerKeys);
          console.log("current freed layer key indices:");
          console.log(renameme.layerKeysFreed);
          console.log("---");
        } else if(e.key == "c" || e.key == "C") {
          //print out the layer links
          console.log("layer link counts:");
          for(let i = 0; i < renameme.layers.length; i++) {
            const layer = renameme.layers[i];
            console.log(`${i}. ${layer.displayName} is linked ${layer.linkCount} time(s)`);
          }
          console.log("---");
        } else if(e.key == "g" || e.key == "G") {
          //print random text (for chang :alien:)
          console.log(godText(256));
        } else if(e.key == "l" || e.key == "L") {
          //print layers
          console.log("--- LAYER INFO ---");
          console.log(renameme.w + " x " + renameme.h);
          console.log(renameme.bg);
          console.log(renameme.layers);
          console.log("---");
        } else if(e.key == "d" || e.key == "D") {
          //image data error report
          console.log(renameme.data);
          console.log("errors:");
          let log = [];
          
          for(let y = 0; y < renameme.h; y++) {
            for(let x = 0; x < renameme.w; x++) {
              const idx = x + y * renameme.w;
              
              const r = renameme.data[idx * 4];
              const g = renameme.data[idx * 4 + 1];
              const b = renameme.data[idx * 4 + 2];
              const a = renameme.data[idx * 4 + 3];
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
              renameme.name = "Test #" + iterations + " " + monkeyText(32);
              renameme.author = "Monkey";
              document.getElementById("img-name-input").value = renameme.name;
              document.getElementById("img-author-input").value = renameme.author;
              //go down a layer if we're in the middle, stay in place if we're at the bottom
              tether.setCurrentLayer(0);
              renameme.layers = [];
              //these were causing an error because i accidentally added an s after the 'layer' part...
              //thanks javascript for not catching that one
              renameme.layerKeys = [];
              renameme.layerKeysFreed = [];
              
              let layerCount = Math.ceil(Math.random() * 8);
              
              for(let i = 0; i < layerCount; i++) {
                const curLayer = renameme.godLayer();
                curLayer.displayName = monkeyText(8)
                //proper link count for filters
                renameme.insertLayer(renameme.layers.length, curLayer);
                tether.currentLayer++;
              }
              tether.currentLayer--;
              //TODO: what?
              tether.setCurrentLayer(tether.currentLayer);
              renameme.bg = [Math.random(), Math.random(), Math.random(), Math.random()];
              tether.updateLayerOptions(renameme);
              tether.generateLayerList(renameme);
              tether.printImage(renameme);
            } catch(e) {
              errors.push(e);
              console.error(e);
            }
            
            for(let i = 0; i < renameme.data.length; i++) {
              if(renameme.data[i] != renameme.data[i]) {
                errors.push("Image contains NaN pixels!");
                console.error("Image contains NaN pixels!");
                break;
              }
              if(renameme.data[i] == undefined) {
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
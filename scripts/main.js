"use strict";
//change this variable if you're developing
const DEBUG = true;

const img = new ImageManager();
const t = new Tether();
const s = new Serialization();

function main() {
  //////// LAYER MANAGEMENT BUTTONS ////////
  const removeLayer = document.getElementById("remove-layer");
  removeLayer.addEventListener("click", function (e) {
    //dont do anything if there arent any layers
    if(img.layers.length == 0) return;
    const curLayer = img.layers[t.currentLayer]
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
    img.layerKeysFreed.push(keysCopy.indexOf(t.currentLayer));
    keysCopy[img.layerKeys.indexOf(t.currentLayer)] = KEY_FREED;
    //rearrange layer keys
    for(let i = t.currentLayer + 1; i < img.layers.length; i++) {
      const idx = img.layerKeys.indexOf(i);
      keysCopy[idx]--;
    }
    //copy the modified keys back
    for(let i = 0; i < keysCopy.length; i++) img.layerKeys[i] = keysCopy[i];
    
    img.layers.splice(t.currentLayer, 1);
    //go down a layer if we're in the middle, stay in place if we're at the bottom
    if(t.currentLayer > 0) {
       t.setCurrentLayer(t.currentLayer - 1);
    }
    //clear layer keys and freed indexes if there are no layers (prevent memory leaks)
    if(img.layers.length == 0) {
      img.layerKeys = [];
      img.layerKeysFreed = [];
    }
    t.updateLayerOptions();
    t.generateLayerList();
    img.printImage();
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
    if(confirm("clear all layers?")) {
      //go down a layer if we're in the middle, stay in place if we're at the bottom
      t.setCurrentLayer(0);
      img.layers = [];
      //clear layer keys and freed indexes if there are no layers (prevent memory leaks)
      img.layerKeys = [];
      img.layerKeysFreed = [];
      t.updateLayerOptions();
      t.generateLayerList();
      img.printImage();
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
  addLayer.addEventListener("click", function (e) {
    if(img.layers.length > 0) {
      t.setCurrentLayer(t.currentLayer + 1);
    }
    const layer = new t.currentClass;
    layer.displayName = layer.name;
    img.insertLayer(t.currentLayer, layer);
    
    t.updateLayerOptions();
    t.generateLayerList();
    img.printImage();
  });
  const dupeLayer = document.getElementById("dupe-layer");
  dupeLayer.addEventListener("click", function (e) {
    const layer2Dupe = img.layers[t.currentLayer];
    if(layer2Dupe == null) return;

    const clone = new img.layerClasses[layer2Dupe.name];
    //create copies - not references
    clone.options = deepObjectCopy(layer2Dupe.options);
    clone.od = deepObjectCopy(layer2Dupe.od);
    
    t.setCurrentLayer(t.currentLayer + 1);
    clone.displayName = "copy of " + img.layers[t.currentLayer - 1].displayName;
    img.insertLayer(t.currentLayer, clone);
    //fix that smearing!!
    t.updateLayerOptions();
    t.generateLayerList();
    img.printImage();
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
      t.setCurrentLayer(t.currentLayer + 1);
    }
    const layer = img.godLayer();
    layer.displayName = layer.name;
    img.insertLayer(t.currentLayer, layer);
    
    t.updateLayerOptions();
    t.generateLayerList();
    img.printImage();
  });

  const classSelect = document.getElementById("layer-class-select");
  const regularNames = [
    "xorFractal",
    "solid",
    "noise",
    "border",
    "liney",
    "wandering",
    "checkers",
    "blobs",
    "worley",
    "gradient",
    "valueNoise"
  ]
  const filterNames = [
    "tweak",
    "tile",
    "invert",
    "scale",
    "sine",
    "merge",
    "repeat",
    "mask"
  ];
  
  //written in yap code
  if(Object.keys(img.layerClasses).length != regularNames.length + filterNames.length) alert("the programmer takes a nap!!! -- you forgot to add a new layer to the class select code! expected " + (regularNames.length + filterNames.length) + " classes, found " + Object.keys(img.layerClasses).length);
  
  for(let i = 0; i < regularNames.length; i++) {
    const option = document.createElement("option");
    option.text = regularNames[i];
    option.title = img.layerClasses[regularNames[i]].description;
    classSelect.add(option);
  }
  //seperator to make regular layers and filter layers more distinct to the user
  classSelect.appendChild(document.createElement("hr"));
  
  for(let i = 0; i < filterNames.length; i++) {
    const option = document.createElement("option");
    option.text = filterNames[i];
    option.title = img.layerClasses[filterNames[i]].description;
    classSelect.add(option);
  }

  classSelect.addEventListener("change", function (e) {
    let className;
    if(this.selectedIndex < regularNames.length) {
      className = regularNames[this.selectedIndex];
    } else {
      className = filterNames[this.selectedIndex - regularNames.length];
    }
    t.currentClass = img.layerClasses[className];
  });
  
  let oldTimeR = 0;
  document.onkeydown = (e) => {
    //intentionally lag the input so it doesnt print too fast
    let curTime = Math.round(Date.now() / 100);
    if(oldTimeR != curTime) {
      if(e.key == "r" || e.key == "R") {
        oldTimeR = curTime;
        t.forceRender = true;
        img.printImage();
      } else if(DEBUG) {
          if(e.key == "h" || e.key == "H") {
          console.log("current layer keys:");
          console.log(img.layerKeys);
          console.log("current freed layer key indices:");
          console.log(img.layerKeysFreed);
          console.log("---");
        } else if(e.key == "c" || e.key == "C") {
          console.log("layer link counts:");
          for(let i = 0; i < img.layers.length; i++) {
            const layer = img.layers[i];
            console.log(`${i}. ${layer.displayName} is linked ${layer.linkCount} time(s)`);
          }
          console.log("---");
        } else if(e.key == "g" || e.key == "G") {
          console.log(godText(256));
        }
      }
    }
  }
  //////// IMAGE OPTIONS ////////

  function generateSaveUrl(data) {
    const url = new URL(location.href);
    url.searchParams.set("save", data);
    return url.toString();
  }
    
  const imageOptions = document.getElementById("image-options");
  
  const nameInput = InputText(img.name,(e) => {
    img.name = e.target.value;
    t.setTitle(img.name);
  }, "large-input");
  const authorInput = InputText(img.author,(e) => {
    img.author = e.target.value;
  });
  const widthInput = InputNumber(1, 512, img.h, (e) => {
    img.w = Number(e.target.value);
    img.updateSize();
    updateSize();
    t.forceRender = true;
    img.printImage();
  });
  const heightInput = InputNumber(1, 512, img.w, (e) => {
    img.h = Number(e.target.value);
    img.updateSize();
    updateSize();
    t.forceRender = true;
    img.printImage();
  });
  //move this into tether... maybe?
  //rewrite a bunch of this so its less sloppy
  function updateSize() {
    t.updateCanvasScale();
    const tileScale = (t.tileView) ? 3 : 1;
    t.canvas.height = img.h * tileScale;
    t.canvas.width = img.w * tileScale;
    //update width inpt
    widthInput.value = img.w;
    heightInput.value = img.h;
    //why does it update the name???
    nameInput.value = img.name;
  }
  const bgInput = InputColor([0.5, 0.5, 0.5, 1], (newCol) => {
    img.bg = newCol;
  }, () => {
    img.printImage();
  });
  const scaleInput = InputNumber(0, 64, t.canvasScale, (e) => {
    t.canvasScale = e.target.value;
    t.updateCanvasScale();
  });
  scaleInput.step = 0.25;

  const saveImageText = Textarea("data is saved here", null, "save-box");
  saveImageText.readOnly = true;
  
  const saveImageButton = Button("save!", async (e) => {
    if(t.compressSaves) {
      const url = generateSaveUrl(saveImageText.value = await s.saveEnc());
      if (history.replaceState && t.saveURL) {
        history.replaceState({}, "", url);
      }
    } else {
      saveImageText.value = s.save();
    }
  }, "aero-btn");
  const loadImageText = Textarea("you put data here", null, "save-box");
  
  const loadImageButton = Button("load!", async (e) => {
    if(confirm("load image?")) {
      try {
        await s.loadEnc(loadImageText.value);
        t.generateLayerList();
        img.updateSize();
        updateSize();
        img.printImage();
        t.setTitle(img.name);
        //DOESNT WORK!!!! color input still uses old color when clicked
        bgInput.style.backgroundColor = '#' + RGB2Hex(img.bg);
        authorInput.value = img.author;
        //bgInput.remove();
        if (history.replaceState && t.saveURL) {
          history.replaceState({}, "", generateSaveUrl(await s.saveEnc()));
        }
      } catch(error) {
        window.alert("couldn't parse data! \n\n" + error);
        if(DEBUG) console.log(error);
        return;
      }
    }
  }, "aero-btn");
  //MOVE this
  /*let isDown = true;
  const knobContainer = Button("", null, "knob-container");
  
  knobContainer.onmousedown = (e) => {
    isDown = true;
  };
  knobContainer.onmouseup = (e) => {
    isDown = false;
  };
  knobContainer.pointermove = (e) => {
    if(!isDown) return;
    //https://stackoverflow.com/a/42111623 -- thanks bro
    //get position of the target element
    //the web was well designed
    const rect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const dir = mod(dirFrom(mouseX, mouseY, midX, midY), 360);
    
    console.log(mouseX + ", " + mouseY);
    console.log(dir);
    //whenever i write css functions in javascript it feels so weird...
    e.target.style.transform = `rotate(${dir}deg)`;
  };*/
  //use interval? maybe?? might break when mouse leaves windoooooowwww!!!!!
  //HAHHAHHAHAHAHAHA
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
      t.forceRender = true;
      img.printImage();
    }, "aero-btn")
  ));
  //////// HEADER MENU ////////
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
    nameInput.value = img.name;
    authorInput.value = img.author;
    //go down a layer if we're in the middle, stay in place if we're at the bottom
    t.setCurrentLayer(0);
    img.layers = [];
    //these were causing an error because i accidentally added an s after the 'layer' part...
    //thanks javascript for not catching that one
    img.layerKeys = [];
    img.layerKeysFreed = [];
    
    let layerCount = Math.ceil(Math.random() * 24);
    
    for(let i = 0; i < layerCount; i++) {
      const curLayer = img.godLayer();
      curLayer.displayName = godText(2);
      //proper link count for filters
      console.log(curLayer.od);
      img.insertLayer(img.layers.length, curLayer);
      t.currentLayer++;
    }
    t.currentLayer--;
    t.setCurrentLayer(t.currentLayer);
    img.bg = [Math.random(), Math.random(), Math.random(), Math.random()];
    t.updateLayerOptions();
    t.generateLayerList();
    img.printImage();
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
          InputCheckbox(t.compressSaves, (checked, e) => {
            t.compressSaves = checked;
          }),
          document.createElement("br"),
          Label("saveURL", "header-label"),
          InputCheckbox(t.saveURL, (checked, e) => {
            t.saveURL = checked;
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
          InputCheckbox(t.renderOnUpdate, (checked, e) => {
            t.renderOnUpdate = checked;
          }),
          document.createElement("br"),
          Label("useRenderWorker", "header-label"),
          InputCheckbox(t.useRenderWorker, (checked, e) => {
            t.useRenderWorker = checked;
          }),
          document.createElement("br"),
          Button("reset view"),
          document.createElement("br"),
          Label("tileView", "header-label"),
          InputCheckbox(t.tileView, (checked, e) => {
            t.tileView = checked;
            updateSize();
            t.forceRender = true;
            img.printImage();
          }),
        ));
      }, "header-dropdown"),
      Button("????", (e) => {
        makeItems(e, 3, divWrap(
          "header-items",
          creditButton
        ));
      }, "header-dropdown"),
      Text(t.version, "version-text")
    )
  );
  
  //////// URL SAVE LOADING ////////

  const params = new URLSearchParams(window.location.search);

  (async() => {
    let save = params.get("save");
    if (!save) return;
    const o = save;

    try {
      await s.loadEnc(save);
      t.generateLayerList();
      img.updateSize();
      updateSize();
      img.printImage();
      t.setTitle(img.name);
      
      bgInput.value = '#' + RGB2Hex(img.bg);
      document.getElementById("img-load-data").value = o;
    } catch (why) {
      console.error("Failed to load save");
    }
  })();
  
  //////// CANVAS ZOOM SCHTUFF ////////
  
  //web development feels like programming for retarded people
  
  const canvasView = document.getElementById("canvas-container");
  
  canvasView.onwheel = (e) => {
    //wonky because we're updating the zoom amount, not the width and height
    //zooming because exaggerated as the image becomes larger, because the canvasScale is smaller
    //const zoomDiv = (img.w + img.h) / 2; //do this so that zooming is a little less weird... i guess
    //t.canvasScale -= Math.sqrt(Math.abs(e.deltaY / 128)) * zoomMult;
    t.canvasScale -= (e.deltaY / 128)/* ** 2 * zoomMult*/;
    t.canvasScale = Math.max(t.canvasScale, 0);
    t.updateCanvasScale();
  };
  
  //refresh warning
  if(!DEBUG) {
    window.addEventListener("beforeunload", function (e) {
      event.preventDefault();
      event.returnValue = true;
    });
  }
  if(DEBUG) console.log("debug mode is enabled; some features may be disabled or enabled");
  updateSize();
  img.printImage();
}
//do this so the variables used during setup aren't in global scope
main();
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
      if(baseKey > -1) { 
        img.layers[img.layerKeys[baseKey]].linkCount--;
      }
    }
    //copy keys so that index searching doesn't break
    let keysCopy = new Array(img.layerKeys.length);
    for(let i = 0; i < keysCopy.length; i++) keysCopy[i] = img.layerKeys[i];
    //mark the deleted layer as free
    img.layerKeysFreed.push(keysCopy.indexOf(t.currentLayer));
    keysCopy[img.layerKeys.indexOf(t.currentLayer)] = -1;
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
  removeLayer.addEventListener("mousedown", function (e) {
    if(img.layers.length == 0) removeLayer.classList.add("outline-invalid");
  });
  
  removeLayer.addEventListener("mouseup", function (e) {
    if(img.layers.length == 0) removeLayer.classList.remove("outline-invalid");
  });

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
  clearLayer.addEventListener("mousedown", function (e) {
    if(img.layers.length == 0) clearLayer.classList.add("outline-invalid");
  });
  
  clearLayer.addEventListener("mouseup", function (e) {
    if(img.layers.length == 0) clearLayer.classList.remove("outline-invalid");
  });

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
  dupeLayer.addEventListener("mousedown", function (e) {
    const layer2Dupe = img.layers[t.currentLayer];
    if(!layer2Dupe) {
      dupeLayer.classList.add("outline-invalid");
    }
  });
  
  dupeLayer.addEventListener("mouseup", function (e) {
    const layer2Dupe = img.layers[t.currentLayer];
    if(!layer2Dupe) {
      dupeLayer.classList.remove("outline-invalid");
    }
  });
  
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
  const classNames = Object.keys(img.layerClasses);

  for(let i = 0; i < classNames.length; i++) {
    const option = document.createElement("option");
    option.text = classNames[i];
    classSelect.add(option);
  }

  classSelect.addEventListener("change", function (e) {
    t.currentClass = img.layerClasses[classNames[this.selectedIndex]];
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
    
  const imageOptions = getElem("image-options");
  
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
  function updateSize() {
    //update canvs width
    const tileScale = (t.tileView) ? 3 : 1;
    t.canvas.height = img.h * tileScale;
    t.canvas.style.height = img.h * t.canvasScale * tileScale + "px";
    t.canvas.width = img.w * tileScale;
    t.canvas.style.width = img.w * t.canvasScale * tileScale + "px";
    //update width inpt
    widthInput.value = img.w;
    heightInput.value = img.h;
    nameInput.value = img.name;
  }
  const bgInput = InputColor([0.5, 0.5, 0.5, 1], (newCol) => {
    img.bg = newCol;
  }, () => {
    img.printImage();
  });
  const scaleInput = InputNumber(0, 64, t.canvasScale, (e) => {
    t.canvasScale = e.target.value;
    t.canvas.style.width = img.w * t.canvasScale + "px";
    t.canvas.style.height = img.h * t.canvasScale + "px";
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
  });
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
        bgInput.remove();
        if (history.replaceState && t.saveURL) {
          history.replaceState({}, "", generateSaveUrl(await s.saveEnc()));
        }
      } catch(error) {
        window.alert("couldn't parse data! \n\n" + error);
        if(DEBUG) console.log(error);
        return;
      }
    }
  });
  
  imageOptions.appendChild(Div(
    nameInput,
    Br(),
    Label("author"),
    authorInput,
    Br(),
    Label("background"),
    bgInput,
    Br(),
    Label("width"),
    widthInput,
    Br(),
    Label("height"),
    heightInput,
    Br(),
    Tag("hr"),
    Div(
      "label-container",
      saveImageButton
    ),
    saveImageText,
    Br(),
    Div(
      "label-container",
      loadImageButton
    ),
    loadImageText,
    Br(),
    Label("zoom"),
    scaleInput,
    Br(),
    Button("render", (e) => {
      t.forceRender = true;
      img.printImage();
    })
  ));
  //////// HEADER MENU ////////
  const topContainer = document.getElementById("top-container");
  let curIdx = -1;
  const makeItems = (e, idx, thetan) => {
    const tomCruise = getElem("tom-cruise");
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
  const creditBox = getElem("credits-container");
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
    const words = ["beautiful","dirty","dirt","stone","rough","water","smooth","harsh","jade","gold","golden","plating","plate","plated","notched","carved","carving","chiseled","tile","button","jagged","porus","spongy","sponge","carpet","wall","floor","dull","shiny","special","clay","mud","sand","magma","lava","leaves","wood","bark","cloth","concrete","curtain","striped","flag","sign","pillar","column","linoleum","quartz","planks","screen","metal","iron","fur","plastic","tinny","tin","steel","marble","marbled","meat","meaty","slippery","red","orange","yellow","lime","green","blue","indigo","purple","magenta","black","pink","white","light","dark","grey","black","brown","rouge","lemon","sour","foul","awful","amazing","book","paper","leather","glass","glassy","wet","hot","cold","warm","lukewarm","rock","boulder","moss","mossy","abstract","geometric","artistic","algebraic","archaic","simple","crude","basic","cell","battery","tissue","outlet","screw","nail","iridescent","refractive","pearlescent","pearl","cracked","shattered","torn","worn","broken","java","script","cascading","style","sheet","hypertext","markup","language","powder","powdered","calculus","wave","tangent","square","root","gradient","papyrus","cactus","thorny","terrain","rocky","mountain","enormous","miniscule","firey","string","array","set","map","hash","hashed","text","textual","texture","generic","bland","obtuse","simple","obsidian","geode","ruby","platform","sludge","random","procedural","predictable","c","ansi","plus","flower","bone","boned","ball","grass","weed","roof","shingles","cancer","glowing","glowy","glow","bitwise","fractal","recursive","insane","crazy","self","similar","structure","logical","assembly","low","level","with","flat","sprite","buffer","file","stream","memory","pixel","bottle","ur","heaven","bubble","bubbles","sequence","glitter","glittery","sparkles","sparkly","fancy","holy","temple","frutiger","aero","bar","bars","barred","wavy","null","void","pointer","flooring","machine","machinary","graph","mushroom","stalk","trunk","oak","pine","ghost","gum","table","brain","positive","negative","electron","electric","spark","glaze","wine","bread","skin","blood","lambda","foo","baz","jet","theta","pi","ceiling","tube","lamp","lantern","pattern","design","serpent","apple","software","abraham","angel","theology","cloud","edges","edge","blobs","border","noise","bort","gradient"];
    
    function randName(max) {
      let text = "";
      let wordCount = Math.ceil(Math.random() * max);
      if(Math.random() > 0.99) wordCount *= 2;
      for(let i = 0; i <= wordCount; i++) {
        text = text + words[Math.floor(Math.random() * words.length)];
        if(i < wordCount) text = text + ' ';
      }
      return text;
    }
    
    img.name = randName(8);
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
      curLayer.displayName = randName(2);
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
    Div(
      Button("file", (e) => {
        makeItems(e, 0, Div(
          "header-items",
          Button("save as file"),
          Br(),
          Button("load from file"),
          Br(),
          Button("share"),
          Br(),
          godButton,
          Br(),
          Label("compressSaves", "header-label"),
          InputCheckbox(t.compressSaves, (checked, e) => {
            t.compressSaves = checked;
          }),
          Br(),
          Label("saveURL", "header-label"),
          InputCheckbox(t.saveURL, (checked, e) => {
            t.saveURL = checked;
          })
        ));
      }, "header-dropdown"),
      Button("edit", (e) => {
        makeItems(e, 1, Div(
          "header-items",
          P("xenu is real"),
          P("tom cruise is a fudge packer")
        ));
      }, "header-dropdown"),
      Button("view", (e) => {
        makeItems(e, 2, Div(
          "header-items",
          Label("renderOnUpdate", "header-label"),
          InputCheckbox(t.renderOnUpdate, (checked, e) => {
            t.renderOnUpdate = checked;
          }),
          Br(),
          Label("useRenderWorker", "header-label"),
          InputCheckbox(t.useRenderWorker, (checked, e) => {
            t.useRenderWorker = checked;
          }),
          Br(),
          Button("reset view"),
          Br(),
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
        makeItems(e, 3, Div(
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
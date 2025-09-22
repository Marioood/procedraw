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
//intermingling of html and js - scary!! (data output n input)


//TODO: also just rewrite A LOT of the ui code, it is garbo

//REMINDER: DON'T MOVE THIS STUFF TO HELPER.JS! that is for minor functions that are used everywhere, including image processing. Maybe make a "mathhelper.js" and "uihelper.js?"

//something i hate about javascript and just the web in general is that they started out with these super high level abstractions
//creating good abstractions is quite hard (see: web development)
//they require creating something from a low level, seeing what patterns repeat and that could be compressed, and compressing those
//if you start out with super high level abstractions, or creating abstractions to ANTICIPATE code, instead of creating abstractions based off of useful code, then those abstractions are gonna suck 9 times out of 10
//another thing with abstractions is that they can lead to super ugly, hack-y, or illegable code if no low-level alternatives exist and you have to make something that those abstractions do not support (example: custom html elements; see InputColor and InputColorControl code)

//TODO: what are these? i forgot
//TODO: cut down on global variables. also, this whole stuff is just jank
//this is the current selected color input
let colpGlobalDisplay = null;
//this is what happens when the color picker changes
let colpGlobalOninput = null;
//???
let colpGlobalUpdate = null;

function InputColor(inputCol, oninput, onupdate) { //[R, G, B, A] from 0...1
  const colpDisplay = Button("", (e) => {
    colpGlobalDisplay = e.target;
    let oldTime;
    colpGlobalOninput = (newCol) => {
      inputCol[0] = newCol[0];
      inputCol[1] = newCol[1];
      inputCol[2] = newCol[2];
      inputCol[3] = newCol[3];
      oninput(newCol);
      //intentionally lag the input so your pc doesnt sound like a jet engine when you drag too fast
      let curTime = Math.round(Date.now() / 100);
      
      if(oldTime != curTime) {
        oldTime = curTime;
        onupdate();
      }
    }
    colpGlobalUpdate = onupdate;
    colp.externalUpdate(inputCol);
    
  },"aero-btn colp-input");
  
  let byteInputCol = [Math.floor(inputCol[0] * 255), Math.floor(inputCol[1] * 255), Math.floor(inputCol[2] * 255)];
  let trans = `rgba(${byteInputCol[0]}, ${byteInputCol[1]}, ${byteInputCol[2]}, ${inputCol[3]})`;
  let opaque = `rgb(${byteInputCol[0]}, ${byteInputCol[1]}, ${byteInputCol[2]})`;
  colpDisplay.style.background = `linear-gradient(0deg, ${trans} 0%, ${opaque} 100%), url("img/ui/checker.png")`;
  
  //left click (show palette)
  let isShown = false;
  
  colpDisplay.oncontextmenu = (e) => {
    const palCont = document.getElementById("palette-container");
    
    if(palCont.style.display != "none") {
      //if the palette was displayed by this input, hide it if it's left clicked again
      palCont.style.display = "none";
      isShown = false;
      return false;
    }
    isShown = true;
    
    palCont.style.display = "initial";
    //have position based off of screen quadrents, so the palette doesn't clip off the screen
    const inputBounds = e.target.getBoundingClientRect();
    //FUCKING KILL ALL PEOPLE INVOLVED WITH THE CREATION OF THE WEB FUCK YOU YOU MADE FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU I HATE YOU FUCK YOU WWW CONSORTIUM FUCK YOU TIM BERNERS LEE FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU
    //set the positions to initial, otherwise clicking on the bg input will fuck the position when you try viewing the palette with other color inputs!! FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU
    if(e.pageX > window.innerWidth / 2) {
      //on the right side
      palCont.style.left = "initial";
      palCont.style.right = (window.innerWidth - inputBounds.left) + "px";
    } else { //FUCK YOU NETSCAPE FUCK YOU MICROSOFT FUCK YOU APPLE FUCK YOU LINUS TORVALDS FUCK YOU TIM APPLE FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU FUCK YOU
      //on the left side
      palCont.style.right = "initial";
      palCont.style.left = (inputBounds.left + inputBounds.width) + "px";
    }
    
    if(e.pageY > window.innerHeight / 2) {
      //on the bottom side
      palCont.style.top = "initial";
      palCont.style.bottom = (window.innerHeight - inputBounds.top) + "px";
    } else {
      //on the top side
      palCont.style.bottom = "initial";
      palCont.style.top = (inputBounds.top + inputBounds.height) + "px";
    }
    
    //colpGlobalUpdate = onupdate;
    colpGlobalDisplay = e.target;
    let oldTime;
    colpGlobalOninput = (newCol) => {
      inputCol[0] = newCol[0];
      inputCol[1] = newCol[1];
      inputCol[2] = newCol[2];
      inputCol[3] = newCol[3];
      oninput(newCol);
      //intentionally lag the input so your pc doesnt sound like a jet engine when you drag too fast
      let curTime = Math.round(Date.now() / 100);
      
      if(oldTime != curTime) {
        oldTime = curTime;
        onupdate();
      }
    }
    //don't show the context menu
    return false;
  };
  colpDisplay.title = "Right click to select from a pre-made palette.";
  
  return colpDisplay;
}
class InputColorControl {
  target = null;
  localDisplay = null;
  redSlider = null;
  redBox = null;
  greenSlider = null;
  greenBox = null;
  blueSlider = null;
  blueBox = null;
  hexBox = null;
  hueSlider = null;
  hueBox = null;
  sattySlider = null;
  sattyBox = null;
  valueSlider = null;
  valueBox = null;
  alphaSlider = null;
  alphaBox = null;
  RGB = null;
  HSV = null;
  alpha = 0;

  constructor() { //[R, G, B, A] from 0...1
    //custom color picker because i use firefox and it uses the ms paint color picker
    this.localDisplay = divWrap("colp-display");
    this.RGB = [0, 0, 0]; //R, G, B
    this.localDisplay.style.backgroundColor = "#" + RGB2Hex(this.RGB);
    this.HSV = byteRGB2HSV(this.RGB) //H, S, V
    this.alpha = 255;

    //make this a function to call another function, because colpGlobalUpdate changes what function it is (and is also sometimes null!!)
    function onupdate() {
      if(colpGlobalUpdate != null) colpGlobalUpdate();
    }
    //chris chan reference...????
    this.hexBox = InputText("000000ff", (e) => {
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
      
      this.RGB[0] = Math.floor(newCol[0] * 255);
      this.RGB[1] = Math.floor(newCol[1] * 255);
      this.RGB[2] = Math.floor(newCol[2] * 255);
      this.HSV = RGB2HSV(newCol);
      this.alpha = Math.floor(newCol[3] * 255);
      
      this.updateDisplay();
      this.setSlidersRGB();
      this.setSlidersHSV();
      this.setSlidersAlpha();
      this.updateColors();
      
      if(colpGlobalOninput != null) colpGlobalOninput(newCol);
    }, "colp-text");

    // RGB //
    this.redSlider = InputRange(0, 255, 0, (e) => {
      const red = Number(e.target.value);
      this.RGB[0] = red;
      this.redBox.value = red;
      this.updateSlidersRGB();
    
    });
    this.redSlider.onmouseup = onupdate;
    this.redBox = InputNumber(0, 255, 0, (e) => {
      const red = Number(e.target.value);
      this.RGB[0] = red;
      this.redSlider.value = red;
      this.updateSlidersRGB();
    });
    
    this.greenSlider = InputRange(0, 255, 0, (e) => {
      const green = Number(e.target.value);
      this.RGB[1] = green;
      this.greenBox.value = green;
      this.updateSlidersRGB();
    });
    this.greenSlider.onmouseup = onupdate;
    this.greenBox = InputNumber(0, 255, 0, (e) => {
      const green = Number(e.target.value);
      this.RGB[1] = green;
      this.greenSlider.value = green;
      this.updateSlidersRGB();
    });
    
    this.blueSlider = InputRange(0, 255, 0, (e) => {
      const blue = Number(e.target.value);
      this.RGB[2] = blue;
      this.blueBox.value = blue;
      this.updateSlidersRGB();
    });
    this.blueSlider.onmouseup = onupdate;
    this.blueBox = InputNumber(0, 255, 0, (e) => {
      const blue = Number(e.target.value);
      this.RGB[2] = blue;
      this.blueSlider.value = blue;
      this.updateSlidersRGB();
    });
    // HSV //
    this.hueSlider = InputRange(0, 359, 0, (e) => {
      const hue = Number(e.target.value);
      this.HSV[0] = hue;
      this.hueBox.value = hue;
      this.updateSlidersHSV();
    }, "woke-bg");
    this.hueSlider.onmouseup = onupdate;
    this.hueBox = InputNumber(0, 359, 0, (e) => {
      const hue = Number(e.target.value);
      this.HSV[0] = hue;
      this.hueSlider.value = hue;
      this.updateSlidersHSV();
    });
    
    this.sattySlider = InputRange(0, 100, 0, (e) => {
      const satty = Number(e.target.value);
      this.HSV[1] = satty;
      this.sattyBox.value = satty;
      this.updateSlidersHSV();
    });
    this.sattySlider.onmouseup = onupdate;
    this.sattyBox = InputNumber(0, 100, 0, (e) => {
      const satty = Number(e.target.value);
      this.HSV[1] = satty;
      this.sattySlider.value = satty;
      this.updateSlidersHSV();
    });
    
    this.valueSlider = InputRange(0, 100, 0, (e) => {
      const value = Number(e.target.value);
      this.HSV[2] = value;
      this.valueBox.value = value;
      this.updateSlidersHSV();
    });
    this.valueSlider.onmouseup = onupdate;
    this.valueBox = InputNumber(0, 100, 0, (e) => {
      const value = Number(e.target.value);
      this.HSV[2] = value;
      this.valueSlider.value = value;
      this.updateSlidersHSV();
    });
    
    // alpha //
    this.alphaSlider = InputRange(0, 255, 0, (e) => {
      const alpha = Number(e.target.value);
      this.alpha = alpha;
      this.alphaBox.value = alpha;
      this.updateSlidersAlpha();
    });
    this.alphaSlider.onmouseup = onupdate;
    this.alphaBox = InputNumber(0, 255, 0, (e) => {
      const alpha = Number(e.target.value);
      this.alpha = alpha;
      this.alphaSlider.value = alpha;
      this.updateSlidersAlpha();
    });
    
    const colpContainer = divWrap(
      "colp-container",
      this.localDisplay,
      document.createElement("br"),
      Label("red"),
      this.redSlider,
      this.redBox,
      document.createElement("br"),
      Label("green"),
      this.greenSlider,
      this.greenBox,
      document.createElement("br"),
      Label("blue"),
      this.blueSlider,
      this.blueBox,
      document.createElement("br"),
      Label("hex"),
      this.hexBox,
      document.createElement("br"),
      Label("hue"),
      this.hueSlider,
      this.hueBox,
      document.createElement("br"),
      Label("satty"),
      this.sattySlider,
      this.sattyBox,
      document.createElement("br"),
      Label("value"),
      this.valueSlider,
      this.valueBox,
      document.createElement("br"),
      Label("alpha"),
      this.alphaSlider,
      this.alphaBox
    );
        
    this.setSlidersRGB();
    this.setSlidersHSV();
    this.setSlidersAlpha();
    this.updateColors();
    
    this.target = colpContainer;
  }
  externalUpdate(inputCol) {
    colp.RGB[0] = Math.floor(inputCol[0] * 255);
    colp.RGB[1] = Math.floor(inputCol[1] * 255);
    colp.RGB[2] = Math.floor(inputCol[2] * 255);
    colp.alpha = Math.floor(inputCol[3] * 255);
    colp.HSV = RGB2HSV(inputCol);
    
    colp.setSlidersRGB();
    colp.setSlidersHSV();
    colp.setSlidersAlpha();
    colp.updateColors();
    colp.hexBox.value = RGB2Hex(inputCol);
    //TODO: move this sorta code to uihelper.js
    let trans = `rgba(${colp.RGB[0]}, ${colp.RGB[1]}, ${colp.RGB[2]}, ${colp.alpha / 255})`;
    let opaque = `rgb(${colp.RGB[0]}, ${colp.RGB[1]}, ${colp.RGB[2]})`;
    colp.localDisplay.style.background = `linear-gradient(90deg, ${trans} 0%, ${opaque} 100%), url("img/ui/checker.png")`;
  }
  updateColors() {
    this.redSlider.style.background = `linear-gradient(90deg, rgb(0, ${this.RGB[1]}, ${this.RGB[2]}) 0%, rgb(255, ${this.RGB[1]}, ${this.RGB[2]}) 100%)`;
    this.greenSlider.style.background = `linear-gradient(90deg, rgb(${this.RGB[0]}, 0, ${this.RGB[2]}) 0%, rgb(${this.RGB[0]}, 255, ${this.RGB[2]}) 100%)`;
    this.blueSlider.style.background = `linear-gradient(90deg, rgb(${this.RGB[0]}, ${this.RGB[1]}, 0) 0%, rgb(${this.RGB[0]}, ${this.RGB[1]}, 255) 100%)`;
    const valByte = Math.floor(this.HSV[2] * 2.55);
    const fullSatty = HSV2ByteRGB([this.HSV[0], 100, this.HSV[2]]);
    const fullVally = HSV2ByteRGB([this.HSV[0], this.HSV[1], 100]);
    this.sattySlider.style.background = `linear-gradient(90deg, rgb(${valByte}, ${valByte}, ${valByte}) 0%, rgb(${fullSatty[0]}, ${fullSatty[1]}, ${fullSatty[2]}) 100%)`;
    this.valueSlider.style.background = `linear-gradient(90deg, black 0%, rgb(${fullVally[0]}, ${fullVally[1]}, ${fullVally[2]}) 100%)`;
    this.alphaSlider.style.background = `linear-gradient(90deg, transparent 0%, rgb(${this.RGB[0]}, ${this.RGB[1]}, ${this.RGB[2]}) 100%), url("img/ui/checker.png")`
  }
  updateDisplay() {
    let trans = `rgba(${this.RGB[0]}, ${this.RGB[1]}, ${this.RGB[2]}, ${this.alpha / 255})`;
    let opaque = `rgb(${this.RGB[0]}, ${this.RGB[1]}, ${this.RGB[2]})`;
    if(this.localDisplay != null) this.localDisplay.style.background = `linear-gradient(90deg, ${trans} 0%, ${opaque} 100%), url("img/ui/checker.png")`;
    if(colpGlobalDisplay != null) colpGlobalDisplay.style.background = `linear-gradient(0deg, ${trans} 0%, ${opaque} 100%), url("img/ui/checker.png")`;
  }
  setSlidersRGB() {
    this.redSlider.value = this.RGB[0];
    this.greenSlider.value = this.RGB[1];
    this.blueSlider.value = this.RGB[2];
    this.redBox.value = this.RGB[0];
    this.greenBox.value = this.RGB[1];
    this.blueBox.value = this.RGB[2];
  }
  setSlidersHSV() {
    this.hueSlider.value = this.HSV[0];
    this.sattySlider.value = this.HSV[1];
    this.valueSlider.value = this.HSV[2];
    this.hueBox.value = this.HSV[0];
    this.sattyBox.value = this.HSV[1];
    this.valueBox.value = this.HSV[2];
  }
  setSlidersAlpha() {
    this.alphaSlider.value = this.alpha;
    this.alphaBox.value = this.alpha;
  }
  updateSlidersRGB() {
    this.HSV = byteRGB2HSV(this.RGB);
    const hex = byteRGB2Hex(this.RGB);
    this.updateHexBox();
    this.updateDisplay();
    this.updateColors();
    this.setSlidersHSV();
    
    const newCol = [this.RGB[0] / 255, this.RGB[1] / 255, this.RGB[2] / 255, this.alpha / 255];
    if(colpGlobalOninput != null) colpGlobalOninput(newCol);
  }
  updateSlidersHSV() {
    this.RGB = HSV2ByteRGB(this.HSV);
    const hex = byteRGB2Hex(this.RGB);
    this.updateHexBox();
    this.updateDisplay();
    this.localDisplay.style.backgroundColor = '#' + hex;
    this.updateColors();
    this.setSlidersRGB();
    
    const newCol = [this.RGB[0] / 255, this.RGB[1] / 255, this.RGB[2] / 255, this.alpha / 255];
    if(colpGlobalOninput != null) colpGlobalOninput(newCol);
  }
  updateSlidersAlpha() {
    const newCol = [this.RGB[0] / 255, this.RGB[1] / 255, this.RGB[2] / 255, this.alpha / 255];
    if(colpGlobalOninput != null) colpGlobalOninput(newCol);
    this.updateHexBox();
    this.updateDisplay();
  }
  updateHexBox() {
    const hex = byteRGB2Hex(this.RGB);
    let a = this.alpha.toString(16);
    if(a.length < 2) a = "0" + a;
    this.hexBox.value = hex + a;
  }
}
//TODO: put somewhere else
const colp = new InputColorControl();

//class EditHistory {
//  add layer
//  remove layer
//  duplicate layer
//  move layer
//  rename layer
//  hide layer
//  change layer parameter
//  
//  {}
//}
function InputPaletteColor(colorInt, title) {
  const color = intRGB2RGB(colorInt);
  
  const colpDisplay = Button("", (e) => {
    /*let trans = `rgba(${inputCol[0]}, ${inputCol[1]}, ${inputCol[2]}, ${inputCol[3] / 255})`;
    let opaque = `rgb(${inputCol[0]}, ${inputCol[1]}, ${inputCol[2]})`;
    e.target.style.background = `linear-gradient(90deg, ${trans} 0%, ${opaque} 100%), url("img/ui/checker.png")`;*/
    
    //e.target.style.backgroundColor = 
    if(colpGlobalOninput != null) colpGlobalOninput(color);
    //if(colpGlobalUpdate != null) colpGlobalUpdate();
    colp.externalUpdate(color);
    if(colpGlobalDisplay != null) colpGlobalDisplay.style.background = '#' + RGBA2Hex(color);
    document.getElementById("palette-container").style.display = "none";
    
  }, "aero-btn colp-palette-entry");
  
  colpDisplay.style.backgroundColor = '#' + RGBA2Hex(color);
  
  colpDisplay.title = title;
  
  return colpDisplay;
}
//TODO: fucking please for the love of god, SPLIT THIS UP! it's hell to navigate this file, because of how much shit is in it.
class Tether {
  canvas = undefined;
  ctx = undefined;
  currentLayer = 0;
  previousLayer = 0;
  currentClass = LayerXorFractal;
  canvasScale = 4;
  renderOnUpdate = true;
  //TODO: something something debugging saves
  compressSaves = false;
  saveURL = false;
  tileView = false;
  smoothView = false;
  
  constructor() {
    this.canvas = document.getElementById("render");
    this.ctx = this.canvas.getContext("2d");
    
    const colpContainer = document.getElementById("colp-container")
    colpContainer.appendChild(colp.target);
    
    const palCont = document.getElementById("palette-container");
    palCont.appendChild(InputPaletteColor(0xFFFF00FF, "North West"));
    palCont.appendChild(InputPaletteColor(0x7FFF00FF, "North"));
    palCont.appendChild(InputPaletteColor(0x00FF00FF, "North East"));
    palCont.appendChild(InputPaletteColor(0x00000000, "Transparent"));
    palCont.appendChild(InputPaletteColor(0xD15B40FF, "Eraser"));
    palCont.appendChild(InputPaletteColor(0xD69166FF, "Stucco"));
    palCont.appendChild(InputPaletteColor(0xE7DFC9FF, "Light Sandstone"));
    palCont.appendChild(InputPaletteColor(0xC5D695FF, "Gross White"));
    palCont.appendChild(InputPaletteColor(0xA0D385FF, "Mint"));
    palCont.appendChild(InputPaletteColor(0x4DBCA4FF, "Cooling Tower Water"));
    palCont.appendChild(InputPaletteColor(0x7178DDFF, "Lavander"));
    palCont.appendChild(InputPaletteColor(0x9774D3FF, "Also Lavander"));
    palCont.appendChild(document.createElement("br"));
    palCont.appendChild(InputPaletteColor(0xFF7F00FF, "West"));
    palCont.appendChild(InputPaletteColor(0x7F7F00FF, "No Direction"));
    palCont.appendChild(InputPaletteColor(0x007F00FF, "East"));
    palCont.appendChild(InputPaletteColor(0xFFFFFFFF, "White"));
    palCont.appendChild(InputPaletteColor(0x9E2114FF, "Brick"));
    palCont.appendChild(InputPaletteColor(0xEE771FFF, "Lava"));
    palCont.appendChild(InputPaletteColor(0xCEAF00FF, "Gold"));
    palCont.appendChild(InputPaletteColor(0x9EBB55FF, "Lichen"));
    palCont.appendChild(InputPaletteColor(0x138200FF, "Grass"));
    palCont.appendChild(InputPaletteColor(0x097FA3FF, "Pool Water"));
    palCont.appendChild(InputPaletteColor(0x362C93FF, "Lapis Lazuli"));
    palCont.appendChild(InputPaletteColor(0x6144AAFF, "Amethyst"));
    palCont.appendChild(document.createElement("br"));
    palCont.appendChild(InputPaletteColor(0xFF0000FF, "South West"));
    palCont.appendChild(InputPaletteColor(0x7F0000FF, "South"));
    palCont.appendChild(InputPaletteColor(0x000000FF, "South East"));
    palCont.appendChild(InputPaletteColor(0x808080FF, "Gr(e/a)y"));
    palCont.appendChild(InputPaletteColor(0x492826FF, "Clay"));
    palCont.appendChild(InputPaletteColor(0x633513FF, "Dark Pumpkin"));
    palCont.appendChild(InputPaletteColor(0x3A3202FF, "Dirt"));
    palCont.appendChild(InputPaletteColor(0x40472FFF, "Sand Green"));
    palCont.appendChild(InputPaletteColor(0x19420BFF, "Deep Moss"));
    palCont.appendChild(InputPaletteColor(0x103D59FF, "Ocean Water"));
    palCont.appendChild(InputPaletteColor(0x232149FF, "Lake Water"));
    palCont.appendChild(InputPaletteColor(0x39216DFF, "Toxic Sludge"));
    
    palCont.style.display = "none";
  }
  //TODO: bad name
  updateSize(img) {
    this.updateCanvasScale(img);
    const tileScale = (this.tileView) ? 3 : 1;
    this.canvas.height = img.h * tileScale;
    this.canvas.width = img.w * tileScale;
    document.getElementById("img-width-input").value = img.w;
    document.getElementById("img-height-input").value = img.h;
  }
  
  printImage(img, forceRender = false) {
    //dont render
    if(!this.renderOnUpdate && !forceRender) return;
    
    let startTime = Date.now();
    //nice design, the cursors don't get fucking set when i do this!!!
    //document.body.style.cursor = "wait";
    
    img.renderImage();
    
    let canvasImg = this.ctx.createImageData(img.w, img.h);
    //write image data to canvas
    for(let i = 0; i < img.w * img.h * 4; i++) {
      //convert from 0 - 1 to 0 - 255
      canvasImg.data[i] = img.data[i] * 255;
    }
    //insert new image data
    this.ctx.putImageData(canvasImg, 0, 0);
    if(this.tileView) {
      this.ctx.putImageData(canvasImg, img.w, 0);
      this.ctx.putImageData(canvasImg, img.w * 2, 0);
      
      this.ctx.putImageData(canvasImg, 0, img.h);
      this.ctx.putImageData(canvasImg, img.w, img.h);
      this.ctx.putImageData(canvasImg, img.w * 2, img.h);
      
      this.ctx.putImageData(canvasImg, 0, img.h * 2);
      this.ctx.putImageData(canvasImg, img.w, img.h * 2);
      this.ctx.putImageData(canvasImg, img.w * 2, img.h * 2);
    }
    let renderTime = Date.now() - startTime;
    
    document.getElementById("render-time").textContent = "render time: " + renderTime + "ms";
    
   //document.body.style.cursor = "pointer";
  }
  
  generateLayerOptions(img, options, types, containerId) {
    //this grotesque hell creature needs comments
    const optionContainer = document.getElementById(containerId);
    const layer = img.layers[this.currentLayer];
    //change this later!!!! maybe?
    //const options = layer.defaults;
    const optionKeys = Object.keys(options);
    //bypass dumbass javascript design
    const tempTether = this;
    
    if(optionKeys.length == 0) {
      const message = document.createElement("i");
      message.appendChild(document.createTextNode("layer has no parameters"));
      optionContainer.appendChild(message);
      return;
    }

    for(let i = 0; i < optionKeys.length; i++) {
      const container = document.createElement("div");
      
      const id = containerId + "dyn-param-" + i + "-";
      let text = optionKeys[i];
      const label = Label(text);
      //how the options are displayed (eg. color or number? decimal or integer?)
      const limits = types[optionKeys[i]];
      //skip hidden parameters
      if(limits.hidden) continue;
      //tell the user that these options can cause LAG
      if(limits.unsafe) {
        label.className = "option-unsafe";
        label.title = "This parameter controls a loop; it can cause lag (!)";
      }
      container.appendChild(label);
      //input box
      let input = document.createElement("input");
      input.id = id;
      
      switch(limits.type) {
        case "number":
          let input2 = document.createElement("input");
          //slider
          input.type = "range";
          if(limits.step != undefined) {
            input.step = limits.step;
          }
          //theres probably a better way of doing this but i cant be bothered to learn it (web dev grindset)
          if(limits.min != undefined) input.min = limits.min;
          if(limits.max != undefined) input.max = limits.max;
          //doing this before setting the max and min makes the slider look all funky
          input.value = options[optionKeys[i]];
          
          let oldTime = 0;
          input.oninput = (e) => {
            let val = input.value;
            //do a safety check on unsafe options
            //"unsafe options" are ones that control loops (e.g. maxLines for wandering, thickness for border)
            //having unsafe options too high can crash or freeze the browser!!
            if(limits.unsafe) {
              val = Math.min(Math.max(val, limits.min), limits.max);
              //input.value = val;
              //just dont update the number - cause it makes inputting small numbers a bitch
              if(val != input.value) {
                return;
              }
            }
            input2.value = input.value;
            options[optionKeys[i]] = Number(input.value);
            //dont print too fast so your pc doesnt sound like a jet engine
            let curTime = Math.round(Date.now() / 30);
            if(oldTime != curTime) {
              this.printImage(img);
              oldTime = curTime;
            }
          };
          //print the image when the user lets go of the input
          //prevents visual desync between the input and canvas when the input changes rapidly
          input.onmouseup = (e) => {this.printImage(img)};
          //number box
          input2.type = "number";
          input2.value = options[optionKeys[i]];
          if(limits.step != undefined) input2.step = limits.step;
          if(limits.min != undefined) input2.min = limits.min;
          if(limits.max != undefined) input2.max = limits.max;
          
          input2.oninput = (e) => {
            let val = input2.value;
            //do a safety check on unsafe options
            //"unsafe options" are ones that control loops (e.g. maxLines for wandering, thickness for border)
            //having unsafe options too high can crash or freeze the browser!!
            if(limits.unsafe) {
              val = Math.min(Math.max(val, limits.min), limits.max);
              //just dont update the number - cause it makes inputting small numbers a bitch
              if(val != input2.value) {
                input2.classList.add("input-invalid");
                return;
              } else {
                input2.classList.remove("input-invalid");
              }
            }/* else {
              if(val == "Infinity") {
                val = Infinity;
              } else if(val == "-Infinity") {
                val = -Infinity;
              } else if(val == "NaN") {
                val = NaN;
              }
            }*/
            input.value = Number(val);
            options[optionKeys[i]] = Number(val);
            this.printImage(img);
          };
          container.appendChild(input);
          container.appendChild(input2);
          break;
        case "boolean":
          //moved code to china
          const box = InputCheckbox(options[optionKeys[i]], (checked, e) => {
            options[optionKeys[i]] = checked;
            this.printImage(img);
          });
          
          container.appendChild(box);
          break;
        case "color":
          const inputCol = options[optionKeys[i]];
          const colBox = InputColor(inputCol, (newCol) => {
            if(limits.external) {
              const brother = document.getElementById(limits.brotherId + this.currentLayer);
              brother.style.backgroundColor = limitDarkness(newCol);
            }
          }, () => {
            this.printImage(img);
          });
          container.appendChild(colBox);
          break;
        case "keyvalues":
          input = document.createElement("select");
          input.id = id; //TODO: what?
          
          for(let i = 0; i < limits.keys.length; i++) {
            const option = document.createElement("option");
            option.text = limits.keys[i];
            input.add(option);
          }
          //set the selected item to the default item
          input.selectedIndex = limits.values.indexOf(options[optionKeys[i]]);
          
          input.addEventListener("change", function (e) {
            options[optionKeys[i]] = limits.values[input.selectedIndex];
            tempTether.printImage(img);
          });
          input.onwheel = (e) => {
            if(e.deltaY > 0) {
              input.selectedIndex++;
              if(input.selectedIndex >= input.children.length || input.selectedIndex == -1) input.selectedIndex = 0;
            } else {
              input.selectedIndex--;
              if(input.selectedIndex < 0) input.selectedIndex = input.children.length - 1;
            }
            options[optionKeys[i]] = limits.values[input.selectedIndex];
            this.printImage(img);
            e.preventDefault();
          };
          container.appendChild(input);
          break;
        case "layer":
          input = document.createElement("select");
          input.id = id;
          const canvasOption = document.createElement("option");
          canvasOption.text = "(entire canvas)";
          canvasOption.value = KEY_CANVAS;
          input.add(canvasOption);
          //TODO: fix order of options
          for(let i = 0; i < img.layerKeys.length; i++) {
            const option = document.createElement("option");
            const key = i;
            const idx = img.layerKeys[key];
            if(key == KEY_FREED) continue; //skip if the key is marked as freed
            if(idx == this.currentLayer) continue; //skip if this key points to the current layer
            if(idx == -1) continue; //skip if the index no longer exists. when removing a layer that is above a filter iffy things can happen without this
              option.text = idx + ". " + img.layers[idx].displayName;
            //set the value because the option's index will not always point to a valid key, due to freed keys getting skipped
            option.value = key;
            input.add(option);
          }
          //set the selected item to the current key
          let oldKey = options[optionKeys[i]];
          let visualIdx;
          //find option that corresponds to the selected key
          for(visualIdx = 0; visualIdx < input.children.length && input.children[visualIdx].value != oldKey; visualIdx++);
          
          input.selectedIndex = visualIdx;
          
          input.addEventListener("change", function (e) {
            const key = input.value;
            options[optionKeys[i]] = key;
            
            if(key == oldKey) return;
            if(oldKey != KEY_CANVAS) img.layers[img.layerKeys[oldKey]].linkCount--;
            if(key != KEY_CANVAS) img.layers[img.layerKeys[key]].linkCount++;
            oldKey = key;
            
            if(limits.external) {
              const brother = document.getElementById(limits.brotherId + tempTether.currentLayer);
              if(key == KEY_CANVAS) {
                brother.style.backgroundImage = "url(img/icon/canvas.svg)";
              } else {
                brother.style.backgroundImage = `url(img/icon/${img.layers[img.layerKeys[key]].displayName}.svg)`;
              }
            }
            tempTether.printImage(img);
          });
          container.appendChild(input);
          break;
        case "length": {
          let unitLength = options[optionKeys[i]]; //UnitLength object
          const input2 = document.createElement("input");
          let maxLen = 0;
          
          if(limits.subtype == "width") {
            maxLen = img.w;
          } else if(limits.subtype == "height") {
            maxLen = img.h;
          } else if(limits.subtype == "longest") {
            maxLen = Math.min(img.w, img.h);
          } else {
            alert(JSON.stringify(limits) + " has invalid subtype!");
          }
          function setLengthRange() {
            /*if(limits.subtype == "dimension") {
              if(unitLength.unit == UNIT_PIXELS) {
                input.min = 1;
                input.max = img.w;
                input2.min = 1;
                input2.max = img.w;
              } else {
                input.min = 0;
                input.max = 100;
                input2.min = 0;
                input2.max = 100;
              }
            } else if(limits.subtype == "position") {
              if(unitLength.unit == UNIT_PIXELS) {
                input.min = -img.w;
                input.max = img.w;
                input2.min = -img.w;
                input2.max = img.w;
              } else {
                input.min = -100;
                input.max = 100;
                input2.min = -100;
                input2.max = 100;
              }
            } else */
            if(unitLength.unit == UNIT_PIXELS) {
              input.min = maxLen;
              input.max = maxLen;
              input2.min = maxLen;
              input2.max = maxLen;
            } else {
              input.min = 100;
              input.max = 100;
              input2.min = 100;
              input2.max = 100;
            }
            if(limits.absoluteMin != undefined) {
              input.min = limits.absoluteMin;
              input2.min = limits.absoluteMin;
            } else {
              input.min *= limits.scaledMin;
              input2.min *= limits.scaledMin;
            }
            input.max *= limits.scaledMax;
            input2.max *= limits.scaledMax;
            //on firefox the sliders act weirdly if the mins and maxes are changed without changing the values
            input.value = input.value;
            input2.value = input2.value;
          }
          
          input.step = limits.step;
          input2.step = limits.step;
          
          const unitButton = document.createElement("button");
          unitButton.className = "unit-button aero-btn";
          
          unitButton.innerText = UnitLength.getUnitText(unitLength);
          
          unitButton.onclick = (e) => {
            if(unitLength.unit == UNIT_PIXELS) {
              unitLength.unit = UNIT_PERCENTAGE;
            } else {
              unitLength.unit = UNIT_PIXELS;
            }
            unitButton.innerText = UnitLength.getUnitText(unitLength);
            setLengthRange();
            this.printImage(img);
          }
          //slider
          input.type = "range";
          setLengthRange();
          //doing this before setting the max and min makes the slider look all funky
          input.value = Number(unitLength.value);
          
          let oldTime = 0;
          input.oninput = (e) => {
            unitLength.value = Number(input.value);
            const valUnchanged = unitLength.value//UnitLength.getLength(unitLength, maxLen);
            let val = valUnchanged;
            //do a safety check on unsafe options
            //"unsafe options" are ones that control loops (e.g. maxLines for wandering, thickness for border)
            //having unsafe options too high can crash or freeze the browser!!
            if(limits.unsafe) {
              val = clamp(val, input.min, input.max);
              //input.value = val;
              //just dont update the number - cause it makes inputting small numbers a bitch
              if(val != valUnchanged || Number(val) == NaN) {
                return;
              }
            }
            input2.value = Number(input.value);
            //unitLength.value = Number(val);
            //dont print too fast so your pc doesnt sound like a jet engine
            let curTime = Math.round(Date.now() / 30);
            if(oldTime != curTime) {
              this.printImage(img);
              oldTime = curTime;
            }
          };
          //print the image when the user lets go of the input
          //prevents visual desync between the input and canvas when the input changes rapidly
          input.onmouseup = (e) => {this.printImage(img)};
          //number box
          input2.type = "number";
          input2.value = unitLength.value;
          
          input2.oninput = (e) => {
            unitLength.value = Number(input2.value);
            const valUnchanged = unitLength.value//UnitLength.getLength(unitLength, maxLen);
            let val = valUnchanged;
            //do a safety check on unsafe options
            //"unsafe options" are ones that control loops (e.g. maxLines for wandering, thickness for border)
            //having unsafe options too high can crash or freeze the browser!!
            if(limits.unsafe) {
              val = clamp(val, input2.min, input2.max);
              //just dont update the number - cause it makes inputting small numbers a bitch
              if(val != valUnchanged || Number(val) == NaN) {
                input2.classList.add("input-invalid");
                return;
              } else {
                input2.classList.remove("input-invalid");
              }
            }
            input.value = Number(input2.value);
            this.printImage(img);
          };
          //TODO:
          container.style.height = "64px";
          const buttonContainer = document.createElement("div");
          buttonContainer.style.width = "52px";
          buttonContainer.style.display = "inline-block";
          container.style.transform = "translate(0, -24px)";
          buttonContainer.style.transform = "translate(0, 24px)";
          container.style.pointerEvents = "none";
          input.style.pointerEvents = "auto";
          input2.style.pointerEvents = "auto";
          unitButton.style.pointerEvents = "auto";
          container.appendChild(input);
          buttonContainer.appendChild(input2);
          buttonContainer.appendChild(unitButton);
          container.appendChild(buttonContainer);
          break;
        }
        case "direction": {
          const dial = document.createElement("button");
          const dialFace = document.createElement("div");
          dial.className = "input-dial";
          dialFace.className = "input-dial-face";
          dialFace.style.transform = "rotate(" + (360 - options[optionKeys[i]]) + "deg)"; //360 - theta -- convert between web degrees to renderer degrees
          //web degrees -- clockwise+, counterclockwise-
          //renderer degrees -- clockwise-, counterclockwise+
          
          let startDir = options[optionKeys[i]]; //used to make the dial feel more realistic
          let dir;
          
          dial.onmousedown = (e) => {
            //capture the starting direction for laterrrr
            //get position of the target element
            //the web was well designed
            const rect = e.target.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const midX = rect.width / 2;
            const midY = rect.height / 2;
            dir = dirFrom(mouseX, mouseY, midX, midY);
            startDir = dir - (360 - options[optionKeys[i]]);
            e.target.setPointerCapture(e.pointerId);
          };

          let oldTime = 0;
          dial.onmousemove = (e) => {
            if(e.buttons != 1) return; //holding primary mouse button
            //https://stackoverflow.com/a/42111623 -- thanks bro
            //get position of the target element
            //the web was well designed
            const rect = e.target.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const midX = rect.width / 2;
            const midY = rect.height / 2;
            dir = mod(dirFrom(mouseX, mouseY, midX, midY) - startDir, 360);
            dialFace.style.transform = "rotate(" + dir + "deg)";
            const outputDir = 360 - Math.floor(dir); //convert between web degrees to renderer degrees
            options[optionKeys[i]] = outputDir;
            input.value = outputDir;
            //dont print too fast so your pc doesnt sound like a jet engine
            let curTime = Math.round(Date.now() / 30);
            if(oldTime != curTime) {
              this.printImage(img);
              oldTime = curTime;
            }
          };
          //print the image when the user lets go of the input
          //prevents visual desync between the input and canvas when the input changes rapidly
          dial.onmouseup = (e) => {
            options[optionKeys[i]] = 360 - Math.floor(dir); //convert between web degrees to renderer degrees
            this.printImage(img);
          };
          //number box
          input.type = "number";
          input.value = options[optionKeys[i]];
          input.step = 1;
          input.min = 0;
          input.max = 360;
          
          input.oninput = (e) => {
            let val = input.value;
            options[optionKeys[i]] = Number(input.value);
            dialFace.style.transform = "rotate(" + (360 - options[optionKeys[i]]) + "deg)"; //convert between web 
            this.printImage(img);
          };
          dial.appendChild(dialFace);
          container.appendChild(dial);
          container.appendChild(input);
          break;
        }
        case "string": {
          //slider
          const input2 = document.createElement("textarea");
          input2.value = options[optionKeys[i]];
          input2.className = "input-option-textarea";
          
          input2.oninput = (e) => {
            let val = input2.value;
            //do a safety check on unsafe options
            //"unsafe options" are ones that control loops (e.g. maxLines for wandering, thickness for border)
            //having unsafe options too high can crash or freeze the browser!!
            /*if(limits.unsafe) {
              //just dont update the number - cause it makes inputting a bitch
              if(val.length > ) {
                input2.classList.add("input-invalid");
                return;
              } else {
                input2.classList.remove("input-invalid");
              }
            }*/
            options[optionKeys[i]] = val;
            this.printImage(img);
          };
          container.appendChild(input2);
          break;
        }
        default:
          throw new ProcedrawError(`Unknown option type ${limits.type}`);
      }
      //spacing
      //optionContainer.appendChild(document.createElement("br"));
      optionContainer.appendChild(container);
    }
  }
  
  updateLayerOptions(img) {
    killChildren(document.getElementById("layer-options"));
    killChildren(document.getElementById("layer-options-default"));
    if(img.layers.length == 0) {
      //TODO: just clean up a lot of this code
    } else {
      const layer = img.layers[this.currentLayer];
      this.generateLayerOptions(img, layer.od, layer.typesDefault, "layer-options-default");
      this.generateLayerOptions(img, layer.options, layer.types, "layer-options");
    }
  }
  
  generateLayerList(img) {
    const listContainer = document.getElementById("layer-list-container");
    killChildren(document.getElementById("layer-list-container"));
    
    for(let i = img.layers.length - 1; i >= 0; i--) {
      const layer = img.layers[i];
      //javascript is shitty so i have to do this if i want to reference a class in an event (except for global self referencing-which is disgusting)
      const tempTether = this;
      
      /*<table style="width: 256px">
        <tr>
          <td><div style="width: 32px; height: 32px; background-color: blue"></div></td>
          <!-- use draggable="false" for images -->
          <td rowspan="2"><div style="width: 64px; height: 64px; background-color: red"></div></td>
          <td rowspan="2">0.</td>
          <!-- 100% width makes only this bit stretch when the table is wider than the content -->
          <td rowspan="2" style="width: 100%"><input type="text"></td>
          <td rowspan="2"><div style="width: 32px; height: 32px; background-color: green"></div></td>
        </tr>
        <tr>
          <td><div style="width: 32px; height: 32px; background-color: yellow"></div></td>
        </tr>
      </table>*/
      //TODO: remove unused classes
      //TODO: remove unused coments shits
      const layerTable = document.createElement("table");
      layerTable.id = "dyn-layer-" + i;
      layerTable.className = "layer-container";
      const upContainer = document.createElement("td");
      const downContainer = document.createElement("td");
      const eyeContainer = document.createElement("td");
      
      const up = Button("", (e) => {
        const idx = Number(e.target.dataset.idx);
        //make sure not to move layers out of bounds
        if(idx < img.layers.length - 1) {
          const tempLayer = img.layers[idx + 1];
          img.layers[idx + 1] = img.layers[idx];
          img.layers[idx] = tempLayer;
          
          const thisKeyIdx = img.layerKeys.indexOf(idx);
          const nextKeyIdx = img.layerKeys.indexOf(idx + 1);
          img.layerKeys[thisKeyIdx]++;
          img.layerKeys[nextKeyIdx]--;
          
          tempTether.generateLayerList(img);
          tempTether.setCurrentLayer(idx + 1);
          tempTether.updateLayerOptions(img);
          tempTether.unhighlightLayer(tempTether.previousLayer);
          tempTether.highlightLayer(tempTether.currentLayer);
          tempTether.printImage(img);
        }
      }, "layer-icon-button icon-layer-up");
      up.dataset.idx = i;
      upContainer.appendChild(up);
      
      const down = Button("", (e) => {
        const idx = Number(e.target.dataset.idx);
        //make sure not to move layers out of bounds
        if(idx > 0) {
          const tempLayer = img.layers[idx - 1];
          img.layers[idx - 1] = img.layers[idx];
          img.layers[idx] = tempLayer;
          
          const prevKeyIdx = img.layerKeys.indexOf(idx - 1);
          const thisKeyIdx = img.layerKeys.indexOf(idx);
          img.layerKeys[prevKeyIdx]++;
          img.layerKeys[thisKeyIdx]--;
          
          tempTether.generateLayerList(img);
          tempTether.setCurrentLayer(idx - 1);
          tempTether.updateLayerOptions(img);
          tempTether.unhighlightLayer(tempTether.previousLayer);
          tempTether.highlightLayer(tempTether.currentLayer);
          tempTether.printImage(img);
        }
      }, "layer-icon-button icon-layer-down");
      down.dataset.idx = i;
      downContainer.appendChild(down);
      
      const iconContainer = document.createElement("td");
      iconContainer.rowSpan = 2;
      
      const iconTint = document.createElement("div");
      iconTint.className = "layer-icon-tint";
      iconTint.style.backgroundColor = limitDarkness(layer.od.tint);
      iconTint.id = "dyn-icon-tint-" + i;
      
      const icon = document.createElement("img");
      icon.id = "dyn-icon-" + i;
      icon.draggable = false;
      
      if(layer.isFilter) {
        icon.src = "img/icon/" + layer.name + ".svg";
        
        if(layer.od.base == KEY_CANVAS) {
          icon.style.backgroundImage = "url(img/icon/canvas.svg)";
        } else {
          const baseName = img.layers[img.layerKeys[layer.od.base]].name;
          icon.style.backgroundImage = `url(img/icon/${baseName}.svg)`;
        }
      } else {
        icon.src = "img/icon/" + layer.name + ".svg";
      }
      icon.className = "layer-icon";
      
      iconTint.appendChild(icon);
      iconContainer.appendChild(iconTint);
      
      const indexContainer = document.createElement("td");
      indexContainer.rowSpan = 2;
      const text = i + ". ";
      indexContainer.appendChild(document.createTextNode(text));
      
      const nameInput = InputText(layer.displayName, (e) => {
        layer.displayName = nameInput.value;
      }, "name-input");
      const nameContainer = document.createElement("td");
      nameContainer.appendChild(nameInput);
      nameContainer.rowSpan = 2;
      //store the layer's index in the element itself (never knew you could do that, neato)
      layerTable.dataset.idx = i;
      layerTable.onclick = (e) => {
        tempTether.setCurrentLayer(Number(layerTable.dataset.idx));
        tempTether.updateLayerOptions(img);
        tempTether.unhighlightLayer(tempTether.previousLayer);
        tempTether.highlightLayer(tempTether.currentLayer);
      };
      
      let shown = layer.od.shown;
      const eye = Button("", (e) => {
        shown = !shown;
        layer.od.shown = shown;
        
        if(shown) {
          eye.classList.remove("icon-layer-hidden");
          eye.classList.add("icon-layer-shown");
        } else {
          eye.classList.remove("icon-layer-shown");
          eye.classList.add("icon-layer-hidden");
        }
        this.printImage(img);
        //having this prevents clicking on the eye from also acting as a click to select the layer
        e.stopPropagation();
      }, (shown) ? "icon-layer-shown layer-icon-button" : "icon-layer-hidden layer-icon-button");
      eyeContainer.appendChild(eye);
      eyeContainer.rowSpan = 2;
      
      const topRow = document.createElement("tr");
      const bottomRow = document.createElement("tr");
      
      topRow.appendChild(upContainer);
      bottomRow.appendChild(downContainer);
      topRow.appendChild(iconContainer);
      topRow.appendChild(indexContainer);
      topRow.appendChild(nameContainer);
      topRow.appendChild(eyeContainer);
      
      layerTable.appendChild(topRow);
      layerTable.appendChild(bottomRow);
      //layerContainer.appendChild(layerSelect);
      //layerSelect.appendChild(eyeContainer);
      //eyeContainer.appendChild(eye);
      listContainer.appendChild(layerTable);
    }
    this.unhighlightLayer(this.previousLayer);
    this.highlightLayer(this.currentLayer);
  }
  //javalicious
  setCurrentLayer(idx) {
    this.previousLayer = this.currentLayer;
    this.currentLayer = idx;
  }
  
  highlightLayer(idx) {
    //uhighlight current layer
    const newLayer = document.getElementById("dyn-layer-" + idx);
    if(newLayer == null) return;
    newLayer.classList.add("layer-highlight");
  }
  
  unhighlightLayer(idx) {
    //unhighlight previous layerer
    const oldLayer = document.getElementById("dyn-layer-" + idx);
    if(oldLayer == null) return;
    oldLayer.classList.remove("layer-highlight");
  }
  
  setTitle(text) {
    const title = document.getElementsByTagName("title")[0];
    title.textContent = "procedraw | " + text;
  }
  
  updateCanvasScale(img) {
    const tileScale = (this.tileView) ? 3 : 1;
    this.canvas.style.height = img.h * this.canvasScale * tileScale + "px";
    this.canvas.style.width = img.w * this.canvasScale * tileScale + "px";
  }
}
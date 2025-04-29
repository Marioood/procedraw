"use strict";
//very simple "framework" (ew...) to make intermingling js with html slightly more bearable
//this is basically just a ripoff of gretcha.js by Tsoding (https://github.com/tsoding/grecha.js)
function Tag(tagName, className) {
  let tag = document.createElement(tagName);
  if(className != undefined) {
      tag.className = className;
  }
  return tag;
}
function P(text, className) {
  let para = Tag("p", className);
  para.innerText = text;
  return para;
}
function Text(text, className) {
  let span = Tag("span", className);
  span.innerText = text;
  return span;
}
function H2(text, className) {
  let head = Tag("h2", className);
  head.innerText = text;
  return head;
}
function H3(text, className) {
  let head = Tag("h3", className);
  head.innerText = text;
  return head;
}
function H4(text, className) {
  let head = Tag("h4", className);
  head.innerText = text;
  return head;
}
function Div(...tags) {
  let div = Tag("div");
  let i = 0;
  //hack to have the args be (...tags) OR (className, ...tags)
  //operator overloading wouldn't work because you can't require specific types in javascript
  if(typeof(tags[0]) == "string") {
      i++;
      div.className = tags[0];
  }
  for(; i < tags.length; i++) {
      div.appendChild(tags[i]);
  }
  return div;
}
function Span(...tags) {
  let span = Tag("span");
  let i = 0;
  if(typeof(tags[0]) == "string") {
      i++;
      span.className = tags[0];
  }
  for(; i < tags.length; i++) {
      span.appendChild(tags[i]);
  }
  return span;
}
function Button(text, onclick, className) {
  let button = Tag("button", className);
  button.innerText = text;
  button.onclick = onclick;
  return button;
}
function Input(type, value, oninput, className) {
  let input = Tag("input", className);
  input.type = type;
  input.oninput = oninput;
  input.value = value;
  return input;
}
function InputRange(min, max, value, oninput, className) {
  let range = Input("range", value, oninput, className);
  range.min = min;
  range.max = max;
  return range;
}
function Br(className) { //diamonds...
  return Tag("br", className);
}
function Label(text, className) {
  let label = Tag("label", className);
  label.innerText = text;
  return label;
}
function InputNumber(min, max, value, oninput, className) {
  let input = Input("number", value, oninput, className);
  input.min = min;
  input.max = max;
  return input;
}
function InputText(value, oninput, className) {
  let input = Input("text", value, oninput, className);
  return input;
}
function InputCheckbox(value, oninput) {
  //normal checkbox inputs are annoying to style, so dont bother with em
  let checked = value;
  
  const input = Button("", (e) => {
    checked = !checked;
    if(checked) {
      e.target.classList = "aero-btn checkbox-true";
    } else {
      e.target.classList = "aero-btn checkbox-false";
    }
    oninput(checked, e);
  }, (checked) ? "aero-btn checkbox-true" : "aero-btn checkbox-false");
  return input;
}
function Textarea(hint, oninput, className) {
  const textarea = Tag("textarea", className);
  textarea.placeholder = hint;
  textarea.oninput = oninput;
  return textarea;
}
function getElem(id) {//shorthand because this function is always a pain in the ass to write out
  return document.getElementById(id);
}
function killChildren(container) {
  while(container.firstChild) {
    container.removeChild(container.lastChild);
  }
}

//something i hate about javascript and just the web in general is that they started out with these super high level abstractions
//creating good abstractions is quite hard (see: web development)
//they require creating something from a low level, seeing what patterns repeat and that could be compressed, and compressing those
//if you start out with super high level abstractions, or creating abstractions to ANTICIPATE code, instead of creating abstractions based off of useful code, then those abstractions are gonna suck 9 times out of 10
//another thing with abstractions is that they can lead to super ugly, hack-y, or illegable code if no low-level alternatives exist and you have to make something that those abstractions do not support (example: custom html elements; see InputColor and InputColorControl code)

let colpGlobalDisplay = null;
let colpGlobalOninput = null;
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
    
    colp.RGB[0] = Math.floor(inputCol[0] * 255);
    colp.RGB[1] = Math.floor(inputCol[1] * 255);
    colp.RGB[2] = Math.floor(inputCol[2] * 255);
    colp.alpha = Math.floor(inputCol[3] * 255);
    colp.HSV = RGB2HSV(inputCol);
    
    colp.setSlidersRGB();
    colp.setSlidersHSV();
    colp.setSlidersAlpha();
    colp.updateColors();
    colp.localDisplay.style.backgroundColor = '#' + RGB2Hex(inputCol);
    colp.hexBox.value = RGB2Hex(inputCol);
  },"aero-btn colp-input");
  
  colpDisplay.style.backgroundColor = "#" + RGB2Hex(inputCol);
  
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
    this.localDisplay = Div("colp-display");
    this.RGB = [0, 0, 0]; //R, G, B
    this.localDisplay.style.backgroundColor = "#" + RGB2Hex(this.RGB);
    this.HSV = byteRGB2HSV(this.RGB) //H, S, V
    this.alpha = 255;

    //make this a function to call another function, because colpGlobalUpdate changes what function it is (and is also sometimes null!!)
    function onupdate() {
      if(colpGlobalUpdate != null) colpGlobalUpdate();
    }

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
      
      if(colpGlobalDisplay != null) colpGlobalDisplay.style.backgroundColor = '#' + hex;
      this.localDisplay.style.backgroundColor = '#' + hex;
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
    
    const colpContainer = Div(
      "colp-container",
      this.localDisplay,
      Br(),
      Label("red"),
      this.redSlider,
      this.redBox,
      Br(),
      Label("green"),
      this.greenSlider,
      this.greenBox,
      Br(),
      Label("blue"),
      this.blueSlider,
      this.blueBox,
      Br(),
      Label("hex"),
      this.hexBox,
      Br(),
      Label("hue"),
      this.hueSlider,
      this.hueBox,
      Br(),
      Label("satty"),
      this.sattySlider,
      this.sattyBox,
      Br(),
      Label("value"),
      this.valueSlider,
      this.valueBox,
      Br(),
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
  updateColors() {
    this.redSlider.style.background = `linear-gradient(90deg, rgb(0, ${this.RGB[1]}, ${this.RGB[2]}) 0%, rgb(255, ${this.RGB[1]}, ${this.RGB[2]}) 100%)`;
    this.greenSlider.style.background = `linear-gradient(90deg, rgb(${this.RGB[0]}, 0, ${this.RGB[2]}) 0%, rgb(${this.RGB[0]}, 255, ${this.RGB[2]}) 100%)`;
    this.blueSlider.style.background = `linear-gradient(90deg, rgb(${this.RGB[0]}, ${this.RGB[1]}, 0) 0%, rgb(${this.RGB[0]}, ${this.RGB[1]}, 255) 100%)`;
    const valByte = Math.floor(this.HSV[2] * 2.55);
    const fullSatty = HSV2RGB([this.HSV[0], 100, this.HSV[2]]);
    const fullVally = HSV2RGB([this.HSV[0], this.HSV[1], 100]);
    this.sattySlider.style.background = `linear-gradient(90deg, rgb(${valByte}, ${valByte}, ${valByte}) 0%, rgb(${fullSatty[0]}, ${fullSatty[1]}, ${fullSatty[2]}) 100%)`;
    this.valueSlider.style.background = `linear-gradient(90deg, black 0%, rgb(${fullVally[0]}, ${fullVally[1]}, ${fullVally[2]}) 100%)`;
    this.alphaSlider.style.background = `linear-gradient(90deg, transparent 0%, rgb(${this.RGB[0]}, ${this.RGB[1]}, ${this.RGB[2]}) 100%), url("img/ui/checker.png")`
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
    if(colpGlobalDisplay != null) colpGlobalDisplay.style.backgroundColor = '#' + hex;
    this.localDisplay.style.backgroundColor = '#' + hex;
    this.updateColors();
    this.setSlidersHSV();
    
    const newCol = [this.RGB[0] / 255, this.RGB[1] / 255, this.RGB[2] / 255, this.alpha / 255];
    if(colpGlobalOninput != null) colpGlobalOninput(newCol);
  }
  updateSlidersHSV() {
    this.RGB = HSV2RGB(this.HSV);
    const hex = byteRGB2Hex(this.RGB);
    this.updateHexBox();
    if(colpGlobalDisplay != null) colpGlobalDisplay.style.backgroundColor = '#' + hex;
    this.localDisplay.style.backgroundColor = '#' + hex;
    this.updateColors();
    this.setSlidersRGB();
    
    const newCol = [this.RGB[0] / 255, this.RGB[1] / 255, this.RGB[2] / 255, this.alpha / 255];
    if(colpGlobalOninput != null) colpGlobalOninput(newCol);
  }
  updateSlidersAlpha() {
    //TODO: display alpha more
    const newCol = [this.RGB[0] / 255, this.RGB[1] / 255, this.RGB[2] / 255, this.alpha / 255];
    if(colpGlobalOninput != null) colpGlobalOninput(newCol);
    this.updateHexBox();
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
//intermingling of html and js - scary!! (data output n input)
//TODO: gut this and move most of it to main.js
class Tether {
  canvas = undefined;
  ctx = undefined;
  currentLayer = 0;
  previousLayer = 0;
  currentClass = LayerXorFractal;
  canvasScale = 4;
  version = "VOLATILE 0.7";
  renderOnUpdate = true;
  forceRender = false;
  compressSaves = true;
  saveURL = false;
  tileView = false;
  
  constructor() {
    this.canvas = document.getElementById("render");
    this.ctx = this.canvas.getContext("2d");
    
    const colpContainer = document.getElementById("colp-container")
    colpContainer.appendChild(colp.target);
  }
  
  generateLayerOptions(options, types, containerId) {
    //this grotesque hell creature needs comments
    const container = document.getElementById(containerId);
    const layer = img.layers[this.currentLayer];
    //change this later!!!! maybe?
    //const options = layer.defaults;
    const optionKeys = Object.keys(options);
    
    if(optionKeys.length == 0) {
      const message = document.createElement("i");
      message.appendChild(document.createTextNode("layer has no parameters"));
      container.appendChild(message);
      return;
    }

    for(let i = 0; i < optionKeys.length; i++) {
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
              img.printImage();
              oldTime = curTime;
            }
          };
          //print the image when the user lets go of the input
          //prevents visual desync between the input and canvas when the input changes rapidly
          input.onmouseup = (e) => {img.printImage()};
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
                this.classList.add("input-invalid");
                return;
              } else {
                this.classList.remove("input-invalid");
              }
            }
            input.value = Number(input2.value);
            options[optionKeys[i]] = Number(input2.value);
            img.printImage();
          };
          container.appendChild(input);
          container.appendChild(input2);
          break;
        case "boolean":
          //moved code to china
          const box = InputCheckbox(options[optionKeys[i]], (checked, e) => {
            options[optionKeys[i]] = checked;
            img.printImage();
          });
          
          container.appendChild(box);
          break;
        case "color":
          const inputCol = options[optionKeys[i]];
          const colBox = InputColor(inputCol, (newCol) => {
            if(limits.external) {
              const brother = document.getElementById(limits.brotherId + t.currentLayer);
              brother.style.backgroundColor = limitDarkness(newCol);
            }
          }, () => {
            img.printImage();
          });
          container.appendChild(colBox);
          break;
        case "dropdown":
          input = document.createElement("select");
          input.id = id;
          
          for(let i = 0; i < limits.items.length; i++) {
            const option = document.createElement("option");
            option.text = limits.items[i];
            input.add(option);
          }
          //set the selected item to the default item
          input.selectedIndex = limits.items.indexOf(options[optionKeys[i]]);
          
          input.addEventListener("change", function (e) {
            options[optionKeys[i]] = limits.items[input.selectedIndex];
            img.printImage();
          });
          container.appendChild(input);
          break;
        case "keyvalues":
          input = document.createElement("select");
          input.id = id;
          
          for(let i = 0; i < limits.keys.length; i++) {
            const option = document.createElement("option");
            option.text = limits.keys[i];
            input.add(option);
          }
          //set the selected item to the default item
          input.selectedIndex = limits.values.indexOf(options[optionKeys[i]]);
          
          input.addEventListener("change", function (e) {
            options[optionKeys[i]] = limits.values[input.selectedIndex];
            img.printImage();
          });
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
              const brother = document.getElementById(limits.brotherId + t.currentLayer);
              if(key == KEY_CANVAS) {
                brother.style.backgroundImage = "url(img/icon/canvas.svg)";
              } else {
                brother.style.backgroundImage = `url(img/icon/${img.layers[img.layerKeys[key]].displayName}.svg)`;
              }
            }
            img.printImage();
          });
          container.appendChild(input);
          break;
      }
      //spacing
      container.appendChild(Br());
    }
  }
  
  updateLayerOptions() {
    killChildren(getElem("layer-options"));
    killChildren(getElem("layer-options-default"));
    if(img.layers.length == 0) {
      
    } else {
      const layer = img.layers[this.currentLayer];
      this.generateLayerOptions(layer.od, layer.typesDefault, "layer-options-default");
      this.generateLayerOptions(layer.options, layer.types, "layer-options");
    }
  }
  
  generateLayerList() {
    const listContainer = document.getElementById("layer-list-container");
    killChildren(getElem("layer-list-container"));
    for(let i = img.layers.length - 1; i >= 0; i--) {
      const layer = img.layers[i];
      const layerContainer = Div("layer-container");
      layerContainer.id = "dyn-layer-" + i;
      
      //javascript is shitty so i have to do this if i want to reference a class in an event (except for global self referencing-which is disgusting)
      const tempTether = this;
      const buttonContainer = document.createElement("div");
    
      buttonContainer.className = "layer-button-container";
      
      const up = document.createElement("button");
      up.dataset.idx = i;
      up.classList.add("layer-icon-button", "icon-layer-up");
      
      up.addEventListener("click", function (e) {
        const idx = Number(this.dataset.idx);
        //make sure not to move layers out of bounds
        if(idx < img.layers.length - 1) {
          const tempLayer = img.layers[idx + 1];
          img.layers[idx + 1] = img.layers[idx];
          img.layers[idx] = tempLayer;
          
          const thisKeyIdx = img.layerKeys.indexOf(idx);
          const nextKeyIdx = img.layerKeys.indexOf(idx + 1);
          img.layerKeys[thisKeyIdx]++;
          img.layerKeys[nextKeyIdx]--;
          
          tempTether.generateLayerList();
          tempTether.setCurrentLayer(idx + 1);
          tempTether.updateLayerOptions();
          tempTether.unhighlightLayer(tempTether.previousLayer);
          tempTether.highlightLayer(tempTether.currentLayer);
          img.printImage();
        }
      });
      buttonContainer.appendChild(up);
      
      const buttonBreak = document.createElement("br");
      buttonContainer.appendChild(buttonBreak);
      
      const down = document.createElement("button");
      down.dataset.idx = i;
      down.classList.add("layer-icon-button", "icon-layer-down");
      
      down.addEventListener("click", function (e) {
        const idx = Number(this.dataset.idx);
        //make sure not to move layers out of bounds
        if(idx > 0) {
          const tempLayer = img.layers[idx - 1];
          img.layers[idx - 1] = img.layers[idx];
          img.layers[idx] = tempLayer;
          
          const prevKeyIdx = img.layerKeys.indexOf(idx - 1);
          const thisKeyIdx = img.layerKeys.indexOf(idx);
          img.layerKeys[prevKeyIdx]++;
          img.layerKeys[thisKeyIdx]--;
          
          tempTether.generateLayerList();
          tempTether.setCurrentLayer(idx - 1);
          tempTether.updateLayerOptions();
          tempTether.unhighlightLayer(tempTether.previousLayer);
          tempTether.highlightLayer(tempTether.currentLayer);
          img.printImage();
        }
      });
      
      buttonContainer.appendChild(down);
      layerContainer.appendChild(buttonContainer);
      
      const layerSelect = document.createElement("div");
      layerSelect.className = "layer-select";
      
      const iconContainer = document.createElement("div");
      iconContainer.className = "layer-icon-container";
      
      const iconTint = document.createElement("div");
      iconTint.className = "layer-icon-tint";
      iconTint.style.backgroundColor = limitDarkness(layer.od.tint);
      iconTint.id = "dyn-icon-tint-" + i;
      
      const icon = document.createElement("img");
      icon.id = "dyn-icon-" + i;
      
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
      layerSelect.appendChild(iconContainer);
      
      const name = document.createElement("span");
      name.className = "layer-text-container";
      const text = i + ". ";
      name.appendChild(document.createTextNode(text));
      
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = layer.displayName;
      nameInput.classList.add("name-input");
      nameInput.addEventListener("input", function (e) {
        layer.displayName = nameInput.value;
      });
      //store the layer's index in the element itself (never knew you could do that, neato)
      layerSelect.dataset.idx = i;
      layerSelect.appendChild(name);
      layerSelect.appendChild(nameInput)
      
      layerSelect.addEventListener("click", function (e) {
        tempTether.setCurrentLayer(Number(this.dataset.idx));
        tempTether.updateLayerOptions();
        tempTether.unhighlightLayer(tempTether.previousLayer);
        tempTether.highlightLayer(tempTether.currentLayer);
      });
      const eyeContainer = document.createElement("div");
      eyeContainer.className = "layer-eye-container";
      
      const eye = document.createElement("button");
      let shown = layer.od.shown;
      eye.classList.add("layer-icon-button");
        
      if(shown) {
        eye.classList.add("icon-layer-shown");
      } else {
        eye.classList.add("icon-layer-hidden");
      }
      
      eye.onclick = (e) => {
        shown = !shown;
        layer.od.shown = shown;
        
        if(shown) {
          eye.classList.remove("icon-layer-hidden");
          eye.classList.add("icon-layer-shown");
        } else {
          eye.classList.remove("icon-layer-shown");
          eye.classList.add("icon-layer-hidden");
        }
        img.printImage();
      };
      
      layerContainer.appendChild(layerSelect);
      layerSelect.appendChild(eyeContainer);
      eyeContainer.appendChild(eye);
      listContainer.appendChild(layerContainer);
    }
    this.unhighlightLayer(this.previousLayer);
    this.highlightLayer(this.currentLayer);
  }
  
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
  
  updateCanvasScale() {
    const tileScale = (t.tileView) ? 3 : 1;
    this.canvas.style.height = img.h * this.canvasScale * tileScale + "px";
    this.canvas.style.width = img.w * this.canvasScale * tileScale + "px";
  }
}
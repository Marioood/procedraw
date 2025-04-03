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
function Input(type, oninput, className) {
  let input = Tag("input", className);
  input.type = type;
  input.oninput = oninput;
  return input;
}
function InputRange(min, max, value, oninput, className) {
  let range = Input("range", oninput, className);
  range.min = min;
  range.max = max;
  range.value = value;
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
  let input = Input("number", oninput, className);
  input.min = min;
  input.max = max;
  input.value = value;
  return input;
}
function InputText(value, oninput, className) {
  let input = Input("text", oninput, className);
  input.value = value;
  return input;
}
let colpGlobalDisplay = null;
let colpGlobalOninput = null;

function InputColor(inputCol, oninput, onclick) { //[R, G, B, A] from 0...1
	const colpDisplay = Button("", (e) => {
		colpGlobalDisplay = e.target;
		const oninputPlus = (newCol) => {
			inputCol[0] = newCol[0];
			inputCol[1] = newCol[1];
			inputCol[2] = newCol[2];
			inputCol[3] = newCol[3];
			oninput(newCol);
		}
		colpGlobalOninput = oninputPlus;
		
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
	},"colp-input");
	
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

		this.hexBox = InputText("000000", (e) => {
			console.log("TODO: implement");
		}, "colp-text");

		// RGB //
		this.redSlider = InputRange(0, 255, 0, (e) => {
			const red = Number(e.target.value);
			this.RGB[0] = red;
			this.redBox.value = red;
			this.updateSlidersRGB();
		});
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
			Label("red", "colp-label"),
			this.redSlider,
			this.redBox,
			Br(),
			Label("green", "colp-label"),
			this.greenSlider,
			this.greenBox,
			Br(),
			Label("blue", "colp-label"),
			this.blueSlider,
			this.blueBox,
			Br(),
			Label("hex", "colp-label"),
			this.hexBox,
			Br(),
			Label("hue", "colp-label"),
			this.hueSlider,
			this.hueBox,
			Br(),
			Label("satty", "colp-label"),
			this.sattySlider,
			this.sattyBox,
			Br(),
			Label("value", "colp-label"),
			this.valueSlider,
			this.valueBox,
			Br(),
			Label("alpha", "colp-label"),
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
		this.hexBox.value = hex;
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
		this.hexBox.value = hex;
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
	}
}
//TODO: put somewhere else
const colp = new InputColorControl();
		console.log("charge headphones!!");
//intermingling of html and js - scary!! (data output n input)
//TODO: gut this and move most of it to main.js
class Tether {
  canvas = undefined;
  ctx = undefined;
  currentLayer = 0;
  previousLayer = 0;
  currentClass = LayerXorFractal;
  canvasScale = 4;
  version = "VOLATILE 0.4";
  renderOnUpdate = true;
  forceRender = false;
  compressSaves = true;
  saveURL = false;
  
  constructor() {
    this.canvas = document.getElementById("render");
    this.ctx = this.canvas.getContext("2d");
    this.updateSize();
    
    const versionText = document.getElementById("version-text");
    versionText.textContent = this.version;
		
		const colpContainer = document.getElementById("colp-container")
		colpContainer.appendChild(colp.target);
		const paletteContainer = Div(
			InputColor(hex2RGB("#F26F80")),
			InputColor(hex2RGB("#E8BFA4")),
			InputColor(hex2RGB("#E0D091")),
			InputColor(hex2RGB("#9EE86A")),
			InputColor(hex2RGB("#13BAEC")),
			InputColor(hex2RGB("#687EF9")),
			InputColor(hex2RGB("#8882FF")),
			InputColor(hex2RGB("#FC5DD7")),
			Br(),
			InputColor(hex2RGB("#D11006")),
			InputColor(hex2RGB("#F2721A")),
			InputColor(hex2RGB("#FCD31B")),
			InputColor(hex2RGB("#60D91C")),
			InputColor(hex2RGB("#097FA3")),
			InputColor(hex2RGB("#0D29DD")),
			InputColor(hex2RGB("#320F84")),
			InputColor(hex2RGB("#8404A0")),
			Br(),
			InputColor(hex2RGB("#7A0305")),
			InputColor(hex2RGB("#A34520")),
			InputColor(hex2RGB("#C48F15")),
			InputColor(hex2RGB("#2FA310")),
			InputColor(hex2RGB("#004C72")),
			InputColor(hex2RGB("#0919A5")),
			InputColor(hex2RGB("#1B085B")),
			InputColor(hex2RGB("#57007C")),
			Br(),
			InputColor(hex2RGB("#510709")),
			InputColor(hex2RGB("#5B3A2D")),
			InputColor(hex2RGB("#7C5D18")),
			InputColor(hex2RGB("#0D7004")),
			InputColor(hex2RGB("#063349")),
			InputColor(hex2RGB("#0E1547")),
			InputColor(hex2RGB("#0A0323")),
			InputColor(hex2RGB("#300256"))
		);
		colpContainer.appendChild(paletteContainer);
		
    //refresh warning
    /*if(!DEBUG) {
      window.addEventListener("beforeunload", function (e) {
        event.preventDefault();
        event.returnValue = true;
      });
    }*/
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
      //label
      const label = document.createElement("span");
      const id = containerId + "dyn-param-" + i + "-";
      //label.for = id;
      let text = optionKeys[i];
      //how the options are displayed (eg. color or number? decimal or integer?)
      const limits = types[optionKeys[i]];
      
      let labelContainer = document.createElement("span");
      labelContainer.classList.add("label-container");
      //tell the user that these options can cause LAG
      if(limits.unsafe) {
        //text = "!" + text;
        label.className = "option-unsafe";
        labelContainer.title = "This parameter controls a loop. Meaning it can cause lag (!)";
      }

      label.appendChild(document.createTextNode(text));
      labelContainer.appendChild(label);
      container.appendChild(labelContainer);
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
          if(limits.min != undefined) {
            input.min = limits.min;
          }
          if(limits.max != undefined) {
            input.max = limits.max;
          }
          //doing this before setting the max and min makes the slider look all funky
          input.value = options[optionKeys[i]];
          
          input.addEventListener("input", function (e) {
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
            img.printImage();
          });
          //number box
          input2.type = "number";
          input2.value = options[optionKeys[i]];
          if(limits.step != undefined) {
            input2.step = limits.step;
          }
          //theres probably a better way of doing this but i cant be bothered to learn it (web dev grindset)
          if(limits.min != undefined) {
            input2.min = limits.min;
          }
          if(limits.max != undefined) {
            input2.max = limits.max;
          }
          
          input2.addEventListener("input", function (e) {
            let val = input2.value;
            //do a safety check on unsafe options
            //"unsafe options" are ones that control loops (e.g. maxLines for wandering, thickness for border)
            //having unsafe options too high can crash or freeze the browser!!
            if(limits.unsafe) {
              val = Math.min(Math.max(val, limits.min), limits.max);
              //input.value = val;
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
          });
          container.appendChild(input2);
          container.appendChild(input);
          break;
        case "boolean":
          let box = document.createElement("button");
          let on = options[optionKeys[i]];
          
          box.classList.add("box-16");
          let trueClass = "checkbox-true";
          let falseClass = "checkbox-false";
          if(limits.direction) {
            trueClass = "checkbox-x";
            falseClass = "checkbox-y";
          }
          
          if(on) {
            box.classList.add(trueClass);
          } else {
            box.classList.add(falseClass);
          }
          
          box.addEventListener("click", function (e) {
            on = !on;
            options[optionKeys[i]] = on;
            
            if(on) {
              box.classList.remove(falseClass);
              box.classList.add(trueClass);
            } else {
              box.classList.remove(trueClass);
              box.classList.add(falseClass);
            }
            img.printImage();
          });
          container.appendChild(box);
          break;
        case "color":
					const inputCol = options[optionKeys[i]];
          let oldTime;
					const colBox = InputColor(inputCol, (newCol) => {
						//intentionally lag the input so your pc doesnt sound like a jet engine when you drag too fast
						let curTime = Math.round(Date.now() / 100);
						
						if(oldTime != curTime) {
							oldTime = curTime;
							img.printImage();
						}
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
          input.selectedIndex = limits.items.indexOf(options[optionKeys[i]]);
          
          input.addEventListener("change", function (e) {
            options[optionKeys[i]] = limits.items[input.selectedIndex];
            img.printImage();
          });
          container.appendChild(input);
          break;
      }
      //spacing
      const lineBreak = document.createElement("br");
      container.appendChild(lineBreak);
    }
  }
  
  killAllChildren(elementId) {
    const container = document.getElementById(elementId);
    
    while(container.firstChild) {
      container.removeChild(container.lastChild);
    }
  }
  
  updateLayerOptions() {
    this.killAllChildren("layer-options");
    this.killAllChildren("layer-options-default");
    if(img.layers.length == 0) {
      
    } else {
      const layer = img.layers[this.currentLayer];
      this.generateLayerOptions(layer.od, layer.typesDefault, "layer-options-default");
      this.generateLayerOptions(layer.options, layer.types, "layer-options");
        
      const layerTitle = document.getElementById("layer-title");
      layerTitle.textContent = img.layers[this.currentLayer].name + " layer options";
    }
  }
  
  generateLayerList() {
    const listContainer = document.getElementById("layer-list-container");
    this.killAllChildren("layer-list-container");
    for(let i = img.layers.length - 1; i >= 0; i--) {
      const layer = img.layers[i];
      const layerContainer = document.createElement("div");
      layerContainer.className = "layer-container";
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
          tempTether.generateLayerList();
          tempTether.setCurrentLayer(Number(idx + 1));
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
          tempTether.generateLayerList();
          tempTether.setCurrentLayer(Number(idx - 1));
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
      iconTint.style.backgroundColor = tempTether.limitDarkness(layer.od.tint);
      iconTint.id = "dyn-icon-tint-" + i;
      
      const icon = document.createElement("img");
      icon.src = "img/icon/" + layer.name + ".png";
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
      //eye.dataset.idx = i;
      let shown = layer.od.shown;
      eye.classList.add("layer-icon-button");
        
      if(shown) {
        eye.classList.add("icon-layer-shown");
      } else {
        eye.classList.add("icon-layer-hidden");
      }
      
      eye.id = "dyn-layer-eye-" + i;
      
      eye.addEventListener("click", function (e) {
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
      });
      
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
  
  updateSize() {
    //update canvs width
    this.canvas.height = img.y;
    this.canvas.style.height = img.y * this.canvasScale + "px";
    this.canvas.width = img.x;
    this.canvas.style.width = img.x * this.canvasScale + "px";
    //update width inpt
    const widthInput = document.getElementById("img-width");
    const heightInput = document.getElementById("img-height");
    widthInput.value = img.x;
    heightInput.value = img.y;
    const nameInput = document.getElementById("name-input")
    nameInput.value = img.name;
  }
  
  limitDarkness(color) {
    //dont become too dark so the ui is still legible
    //make a copy of the color. modifying the argument color messed with layer duping
    let newCol = [color[0], color[1], color[2], color[3]];
    const darkLimit = 0.25;
    const brightness = (newCol[0] + newCol[1] + newCol[2]) / 3;
    if(brightness < darkLimit) {
      newCol[0] = Math.max(newCol[0], darkLimit);
      newCol[1] = Math.max(newCol[1], darkLimit);
      newCol[2] = Math.max(newCol[2], darkLimit);
    }
    return img.RGB2Hex(newCol);
  }
  
  setTitle(text) {
    const title = document.getElementsByTagName("title")[0];
    title.textContent = "procedraw | " + text;
  }
}
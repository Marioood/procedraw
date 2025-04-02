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
function InputColor(inputCol, oninput) { //[R, G, B, A] from 0...1
  //custom color picker because i use firefox and it uses the ms paint color picker
	//TODO: this creates a shitload of elements (!), just have one color picker window that is shared across all color inputs
	const colpDisplay = Button("", (e) => {
		colpContainer.style.visibility = "visible";
		colpContainer.style.left = e.clientX + "px";
		colpContainer.style.top = e.clientY + "px";
	},"colp-input");
	colpDisplay.style.backgroundColor = RGB2Hex(inputCol);
  let colpRGB = [Math.floor(inputCol[0] * 255), Math.floor(inputCol[1] * 255), Math.floor(inputCol[2] * 255)]; //R, G, B
  let colpHSV = RGB2HSV(colpRGB) //H, S, V
	let colpAlpha = Math.floor(inputCol[3] * 255);

  const hexBox = InputText("000000", (e) => {
    console.log("TODO: implement");
  }, "colp-text");

  const colpUpdateColors = () => {
    redSlider.style.background = `linear-gradient(90deg, rgb(0, ${colpRGB[1]}, ${colpRGB[2]}) 0%, rgb(255, ${colpRGB[1]}, ${colpRGB[2]}) 100%)`;
    greenSlider.style.background = `linear-gradient(90deg, rgb(${colpRGB[0]}, 0, ${colpRGB[2]}) 0%, rgb(${colpRGB[0]}, 255, ${colpRGB[2]}) 100%)`;
    blueSlider.style.background = `linear-gradient(90deg, rgb(${colpRGB[0]}, ${colpRGB[1]}, 0) 0%, rgb(${colpRGB[0]}, ${colpRGB[1]}, 255) 100%)`;
    const valByte = Math.floor(colpHSV[2] * 2.55);
    const fullSatty = HSV2RGB([colpHSV[0], 100, colpHSV[2]]);
    const fullVally = HSV2RGB([colpHSV[0], colpHSV[1], 100]);
    sattySlider.style.background = `linear-gradient(90deg, rgb(${valByte}, ${valByte}, ${valByte}) 0%, rgb(${fullSatty[0]}, ${fullSatty[1]}, ${fullSatty[2]}) 100%)`;
    valueSlider.style.background = `linear-gradient(90deg, black 0%, rgb(${fullVally[0]}, ${fullVally[1]}, ${fullVally[2]}) 100%)`;
  };
	const colpSetSlidersRGB = () => {
    redSlider.value = colpRGB[0];
    greenSlider.value = colpRGB[1];
    blueSlider.value = colpRGB[2];
    redBox.value = colpRGB[0];
    greenBox.value = colpRGB[1];
    blueBox.value = colpRGB[2];
	};
	const colpSetSlidersHSV = () => {
    hueSlider.value = colpHSV[0];
    sattySlider.value = colpHSV[1];
    valueSlider.value = colpHSV[2];
    hueBox.value = colpHSV[0];
    sattyBox.value = colpHSV[1];
    valueBox.value = colpHSV[2];
	};
  function colpUpdateSlidersRGB() {
    colpHSV = RGB2HSV(colpRGB);
    const hex = byteRGB2Hex(colpRGB);
    hexBox.value = hex;
    colpDisplay.style.backgroundColor = '#' + hex;
    colpUpdateColors();
		colpSetSlidersHSV();
		
		const newCol = [colpRGB[0] / 255, colpRGB[1] / 255, colpRGB[2] / 255, colpAlpha / 255];
		oninput(newCol);
  }
  function colpUpdateSlidersHSV() {
    colpRGB = HSV2RGB(colpHSV);
    const hex = byteRGB2Hex(colpRGB);
    hexBox.value = hex;
    colpDisplay.style.backgroundColor = '#' + hex;
    colpUpdateColors();
		colpSetSlidersRGB();
		
		const newCol = [colpRGB[0] / 255, colpRGB[1] / 255, colpRGB[2] / 255, colpAlpha / 255];
		oninput(newCol);
  }
  // RGB //
  const redSlider = InputRange(0, 255, 0, (e) => {
    const red = Number(e.target.value);
    colpRGB[0] = red;
    redBox.value = red;
    colpUpdateSlidersRGB();
  });
  const redBox = InputNumber(0, 255, 0, (e) => {
    const red = Number(e.target.value);
    colpRGB[0] = red;
    redSlider.value = red;
    colpUpdateSlidersRGB();
  });
  const greenSlider = InputRange(0, 255, 0, (e) => {
    const green = Number(e.target.value);
    colpRGB[1] = green;
    greenBox.value = green;
    colpUpdateSlidersRGB();
  });
  const greenBox = InputNumber(0, 255, 0, (e) => {
    const green = Number(e.target.value);
    colpRGB[1] = green;
    greenSlider.value = green;
    colpUpdateSlidersRGB();
  });
  const blueSlider = InputRange(0, 255, 0, (e) => {
    const blue = Number(e.target.value);
    colpRGB[2] = blue;
    blueBox.value = blue;
    colpUpdateSlidersRGB();
  });
  const blueBox = InputNumber(0, 255, 0, (e) => {
    const blue = Number(e.target.value);
    colpRGB[2] = blue;
    blueSlider.value = blue;
    colpUpdateSlidersRGB();
  });
  // HSV //
  const hueSlider = InputRange(0, 359, 0, (e) => {
    const hue = Number(e.target.value);
    colpHSV[0] = hue;
    hueBox.value = hue;
    colpUpdateSlidersHSV();
  }, "woke-bg");
  const hueBox = InputNumber(0, 359, 0, (e) => {
    const hue = Number(e.target.value);
    colpHSV[0] = hue;
    hueSlider.value = hue;
    colpUpdateSlidersHSV();
  });
  const sattySlider = InputRange(0, 100, 0, (e) => {
    const satty = Number(e.target.value);
    colpHSV[1] = satty;
    sattyBox.value = satty;
    colpUpdateSlidersHSV();
  });
  const sattyBox = InputNumber(0, 100, 0, (e) => {
    const satty = Number(e.target.value);
    colpHSV[1] = satty;
    sattySlider.value = satty;
    colpUpdateSlidersHSV();
  });
  const valueSlider = InputRange(0, 100, 0, (e) => {
    const value = Number(e.target.value);
    colpHSV[2] = value;
    valueBox.value = value;
    colpUpdateSlidersHSV();
  });
  const valueBox = InputNumber(0, 100, 0, (e) => {
    const value = Number(e.target.value);
    colpHSV[2] = value;
    valueSlider.value = value;
    colpUpdateSlidersHSV();
  });
	const colpClose = Button("x", () => {
		colpContainer.style.visibility = "hidden";
	}, "colp-x");
	
	const colpHeader = Button("color picker");
	let offsX = 0;
	let offsY = 0;
	let isMouseDown = false;
	//BUG: doesnt get dragged when mouse moves off element
	//BUG: sometimes mouseup does not get fired (when the mouse is moving fast)
	//BUG: color picker window gets weirdly squahsed when its beyond the edge of the screen
	
	//TODO: every one that answered this question should kill themselves
	//https://stackoverflow.com/questions/9506041/events-mouseup-not-firing-after-mousemove
	//FUCK YOU none of that shit FUCKING WORKED FUCK you
	
	colpHeader.onmousedown = (e) => {
		offsX = e.offsetX + e.target.offsetLeft;
		offsY = e.offsetY + e.target.offsetTop;
		isMouseDown = true;
		e.preventDefault();
	};
	colpHeader.onmousemove = (e) => {
		if(isMouseDown) {
			colpContainer.style.left = (e.clientX - offsX) + "px";
			colpContainer.style.top = (e.clientY - offsY) + "px";
		}
	};
	colpHeader.onmouseup = (e) => {
		isMouseDown = false;
	};
	colpHeader.draggable = false;
  const colpContainer = Div(
		"colp-container",
		Div(	
			"colp-x-container",
			colpHeader,
			colpClose
		),
		Div(
			Div(
				"colp-slider-container",
				Label("red", "colp-label"),
				redSlider,
				redBox,
			),
			Div(
				Label("green", "colp-label"),
				greenSlider,
				greenBox,
			),
			Div(
				Label("blue", "colp-label"),
				blueSlider,
				blueBox,
			),
			Div(
				Label("hex", "colp-label"),
				hexBox,
			), 
			Div(
				Label("hue", "colp-label"),
				hueSlider,
				hueBox,
			),
			Div(
				Label("satty", "colp-label"),
				sattySlider,
			sattyBox,
			),
			Div(
				Label("value", "colp-label"),
				valueSlider,
				valueBox,
			)
		)
  );
      
  colpSetSlidersRGB();
  colpSetSlidersHSV();
	colpUpdateColors();
	
	document.body.appendChild(colpContainer);
	colpContainer.style.visibility = "hidden";
	colpContainer.style.position = "absolute";
	
  return colpDisplay;
}
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
						
          container.appendChild(
						InputColor(inputCol, (col) => {
							options[optionKeys[i]] = col;
							//intentionally lag the input so your pc doesnt sound like a jet engine when you drag too fast
							let curTime = Math.round(Date.now() / 100);
							
							if(oldTime != curTime) {
								oldTime = curTime;
								img.printImage();
							}
						})
					);
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
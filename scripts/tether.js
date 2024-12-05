//intermingling of html and js - scary!! (data output n input)
class Tether {
	canvas = undefined;
	ctx = undefined;
	currentLayer = 0;
	previousLayer = 0;
	currentClass = LayerXorFractal;
	canvasScale = 4;
	
	constructor() {
		this.canvas = document.getElementById("render");
		this.ctx = this.canvas.getContext("2d");
		this.canvas.setAttribute("width", img.x);
		this.canvas.setAttribute("height", img.y);
		this.canvas.style.width = img.x * this.canvasScale + "px";
		this.canvas.style.height = img.y * this.canvasScale + "px";
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
			const label = document.createElement("label");
			const id = containerId + "dyn-param-" + i + "-";
			label.for = id;
			const text = optionKeys[i] + ": ";
			
			label.appendChild(document.createTextNode(text));
			container.appendChild(label);
			//input box
			let input = document.createElement("input");
			input.id = id;
			
			//how the options are displayed (eg. color or number? decimal or integer?)
			const limits = types[optionKeys[i]];
			
			switch(limits.type) {
				case "number":
					input.type = "number";
					input.value = options[optionKeys[i]];
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
					
					input.addEventListener("input", function (e) {
						let val = input.value
						//do a safety check on unsafe options
						//"unsafe options" are ones that control loops (e.g. maxLines for wandering, thickness for border)
						//having unsafe options too high can crash or freeze the browser!!
						if(limits.unsafe) {
							val = Math.min(Math.max(val, limits.min), limits.max);
							input.value = val;
						}
						options[optionKeys[i]] = Number(input.value);
						img.printImage();
					});
					break;
				case "boolean":
					input.type = "checkbox";
					//doesnt work with the "checked" atrribute.... janky
					input.value = options[optionKeys[i]];
					input.addEventListener("input", function (e) {
						options[optionKeys[i]] = input.checked;
						img.printImage();
					});
					break;
				case "color":
					input.type = "color";
					input.value = img.RGB2Hex(options[optionKeys[i]]);
					
					let oldTime;
					
					input.addEventListener("input", function (e) {
						//intentionally lag the input so your pc doesnt sound like a jet engine when you drag too fast
						let curTime = Math.round(Date.now() / 100);
						
						if(oldTime != curTime) {
							oldTime = curTime;
							options[optionKeys[i]] = img.parseHex(input.value);
							img.printImage();
						}
					});
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
					break;
			}
			container.appendChild(input);
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
		/*<div class="layer-container">
			<div style="float:left;">
				<button>^</button>
				<br>
				<button>V</button>
			</div>
			<img src="img/icon/xorFractal.png"></img>
			<span>CLASS NAME</span>
		</div>
		
		<div class="layer-container">
			<div style="float:left; height: 100%;">
				<button style="height: 50%;">^</button>
				<br>
				<button style="height: 50%;">V</button>
			</div>
			<img src="img/icon/xorFractal.png"></img>
			<span>CLASS NAME</span>
		</div>*/
		
		const listContainer = document.getElementById("layer-list-container");
		this.killAllChildren("layer-list-container");
		for(let i = 0; i < img.layers.length; i++) {
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
			up.appendChild(document.createTextNode("^"));
			buttonContainer.appendChild(up);
			
			up.addEventListener("click", function (e) {
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
				}
			});
			
			const buttonBreak = document.createElement("br");
			buttonContainer.appendChild(buttonBreak);
			
			const down = document.createElement("button");
			down.dataset.idx = i;
			down.appendChild(document.createTextNode("V"));
			
			down.addEventListener("click", function (e) {
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
				}
			});
			
			buttonContainer.appendChild(down);
			layerContainer.appendChild(buttonContainer);
			
			const layerSelect = document.createElement("div");
			layerSelect.className = "layer-select";
			
			const icon = document.createElement("img");
			icon.src = "img/icon/" + layer.name + ".png";
			
			layerSelect.appendChild(icon);
			
			const name = document.createElement("span");
			const text = i + ". " + layer.name;
			name.appendChild(document.createTextNode(text));
			layerSelect.appendChild(name);
			//store the layer's index in the element itself (never knew you could do that, neato)
			layerSelect.dataset.idx = i;
			
			layerSelect.addEventListener("click", function (e) {
				tempTether.setCurrentLayer(Number(this.dataset.idx));
				tempTether.updateLayerOptions();
				tempTether.unhighlightLayer(tempTether.previousLayer);
				tempTether.highlightLayer(tempTether.currentLayer);
			});
			layerContainer.appendChild(layerSelect);
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
		newLayer.classList.add("layer-highlight");
	}
	
	unhighlightLayer(idx) {
		//unhighlight previous layerer
		const oldLayer = document.getElementById("dyn-layer-" + idx);
		oldLayer.classList.remove("layer-highlight");
	}
}
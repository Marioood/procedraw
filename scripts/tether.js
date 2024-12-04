//intermingling of html and js - scary!! (data output n input)
class Tether {
	canvas = undefined;
	ctx = undefined;
	currentLayer = 0;
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
			const id = containerId + this.currentLayer + "-param-" + i + "-";
			label.setAttribute("for", id);
			const text = optionKeys[i] + ": ";
			
			label.appendChild(document.createTextNode(text));
			container.appendChild(label);
			//input box
			let input = document.createElement("input");
			input.setAttribute("id", id);
			
			//how the options are displayed (eg. color or number? decimal or integer?)
			const limits = types[optionKeys[i]];
			
			switch(limits.type) {
				case "number":
					input.setAttribute("type", "number");
					input.setAttribute("value", options[optionKeys[i]]);
					if(limits.step != undefined) {
						input.setAttribute("step", limits.step);
					}
					//theres probably a better way of doing this but i cant be bothered to learn it (web dev grindset)
					if(limits.min != undefined) {
						input.setAttribute("min", limits.min);
					}
					if(limits.max != undefined) {
						input.setAttribute("max", limits.max);
					}
					
					input.addEventListener("input", function (e) {
						options[optionKeys[i]] = Number(input.value);
						img.printImage();
					});
					break;
				case "boolean":
					input.setAttribute("type", "checkbox");
					//doesnt work with the "checked" atrribute.... janky
					input.setAttribute("value", options[optionKeys[i]]);
					input.addEventListener("input", function (e) {
						options[optionKeys[i]] = input.checked;
						img.printImage();
					});
					break;
				case "color":
					input.setAttribute("type", "color");
					input.setAttribute("value", img.RGB2Hex(options[optionKeys[i]]));
					
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
					input.setAttribute("id", id);
					
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
}
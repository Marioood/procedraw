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
		this.updateSize();
	
		const refreshImage = document.getElementById("img-refresh");

		refreshImage.addEventListener("click", function (e) {
			img.printImage();
		});
	
		const nameInput = document.getElementById("name-input");
		
		nameInput.addEventListener("input", function (e) {
			img.name = nameInput.value;
		});
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
			const label = document.createElement("text");
			const id = containerId + "dyn-param-" + i + "-";
			//label.for = id;
			let text = optionKeys[i];
			//how the options are displayed (eg. color or number? decimal or integer?)
			const limits = types[optionKeys[i]];
			//tell the user that these options can cause LAG
			if(limits.unsafe) {
				//text = "!" + text;
				label.className = "option-unsafe";
			}

			let labelContainer = document.createElement("span");
			labelContainer.className = "label-container";
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
					
					box.classList.add("checkbox");
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
					let color = document.createElement("input");
					let alpha = document.createElement("input");
					color.type = "color";
					color.value = img.RGB2Hex(options[optionKeys[i]]);
					
					let oldTime;
					const tempTether = this;
					
					color.addEventListener("input", function (e) {
						//intentionally lag the input so your pc doesnt sound like a jet engine when you drag too fast
						let curTime = Math.round(Date.now() / 100);
						
						if(oldTime != curTime) {
							oldTime = curTime;
							//append alpha to color
							let alphaVal = Number(alpha.value).toString(16);
							if(alphaVal.length < 2) alphaVal = "0" + alphaVal;
							options[optionKeys[i]] = img.parseHex(color.value + alphaVal);
							img.printImage();
							if(limits.external) {
								const brother = document.getElementById(limits.brotherId + t.currentLayer);
								brother.style.backgroundColor = tempTether.limitDarkness(img.parseHex(color.value));
							}
						}
					});
					//alpha box
					//said "input2" was already declared.... in the number case
					//javascript is actually stupid
					alpha.type = "number";
					alpha.value = options[optionKeys[i]][3];
					alpha.step = 1;
					alpha.min = 0;
					alpha.max = 255;
					
					alpha.addEventListener("input", function (e) {
						let val = alpha.value;
						val = Math.min(Math.max(val, alpha.min), alpha.max);
						//input.value = val;
						//just dont update the number - cause it makes inputting small numbers a bitch
						if(val != alpha.value) {
							this.classList.add("input-invalid");
							return;
						} else {
							this.classList.remove("input-invalid");
						}
						options[optionKeys[i]][3] = Number(alpha.value);
						img.printImage();
						
					});
					container.appendChild(color);
					container.appendChild(alpha);
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
			const text = i + ". " + layer.name;
			name.appendChild(document.createTextNode(text));
			//store the layer's index in the element itself (never knew you could do that, neato)
			layerSelect.dataset.idx = i;
			layerSelect.appendChild(name);
			
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
		const darkLimit = 63;
		const brightness = (color[0] + color[1] + color[2]) / 3;
		if(brightness < darkLimit) {
			color[0] = Math.max(color[0], darkLimit);
			color[1] = Math.max(color[1], darkLimit);
			color[2] = Math.max(color[2], darkLimit);
		}
		
		return img.RGB2Hex(color);
	}
}
class Serialization {
	save() {
		let saved = {};
		saved.img = {
			bg: img.RGB2Hex(img.bg),
			x: img.x,
			y: img.y,
			name: img.name,
			version: t.version
		};
		saved.layers = [];
		
		for(let i = 0; i < img.layers.length; i++) {
			let layer = img.layers[i];
			let optionsNew = {};
			const optionKeys = Object.keys(layer.options);
			let newLayer = {};
			let newOptionDefaults = Object.assign({}, layer.od);
			newOptionDefaults.tint = img.RGB2Hex(newOptionDefaults.tint);
			//factory fresh version of the layer, for parameter stripping
			let refLayer = new img.layerClasses[layer.name];
			//dont bother saving the options if they're empty
			let optionCount = 0;
			if(optionKeys.length > 0) {
				//replace some options so theyre a little smaller (colors are arrays during runtime - but theyre smaller as hex strings)
				for(let o = 0; o < optionKeys.length; o++) {
					const key = optionKeys[o];
					let val = layer.options[key];
					let refVal = refLayer.options[key];
					if(layer.types[key].type == "color") {
						val = img.RGBA2Hex(val);
						refVal = img.RGBA2Hex(refVal);
					}
					//dont save the parameter if its just the default value
					if(refVal == val) continue;
					optionCount++;
					optionsNew[key] = val;
				}
			}
			newLayer["name"] = layer.name;
				//dont bother saving the name if its unchanged
			if(layer.name != layer.displayName) {
				newLayer["displayName"] = layer.displayName;
			}
			newLayer["od"] = newOptionDefaults;
			//dont save the options if all of them are default or there arent any
			if(optionCount > 0 || optionKeys.length > 0) {
				newLayer["options"] = optionsNew;
			}
			saved.layers.push(newLayer);
		}
		
		return JSON.stringify(saved);
	}
	
	load(savedText) {
		//welcome to my hooker palace!
		let saved = JSON.parse(savedText);
		
		img.bg = img.parseHex(saved.img.bg);
		img.x = saved.img.x;
		img.y = saved.img.y;
		if(saved.img.name == undefined) {
			img.name = "our ancient beauty";
		} else {
			img.name = saved.img.name;
		}
		//blank layers so we arent loading images on top of eachother
		img.layers = [];

		for(let i = 0; i < saved.layers.length; i++) {
			const fauxLayer = saved.layers[i];
			let newLayer = new img.layerClasses[fauxLayer.name];
			
			newLayer.od = Object.assign(newLayer.od, fauxLayer.od);
			if(fauxLayer.od.tint != undefined) {
				newLayer.od.tint = img.parseHex(newLayer.od.tint);
			}
			//backwards compatability for pre-name layers
			if(fauxLayer.displayName == undefined) {
				newLayer.displayName = fauxLayer.name;
			} else {
				newLayer.displayName = fauxLayer.displayName;
			}
			//dont bother writing option data if there is none!!
			if(fauxLayer.options != undefined) {
				//clean up colors!
				let optionsNew = {};
				//make sure the faux options have the correct amount of options (if an image from an old version gets loaded in a version w new options)
				fauxLayer.options = Object.assign(newLayer.options, fauxLayer.options);
				const optionKeys = Object.keys(fauxLayer.options);
				
				for(let o = 0; o < optionKeys.length; o++) {
					const key = optionKeys[o];
					const val = fauxLayer.options[key];
					if(newLayer.types[key].type == "color") {
						//too lazy to parse colors that are from the default layer... just check if theyre an array and plop em in
						if(typeof val == "object") {
							optionsNew[key] = val;
						} else {
							optionsNew[key] = img.parseHex(val);
						}
					} else {
						optionsNew[key] = val;
					}
				}
				
				newLayer.options = optionsNew;
			}
			
			img.layers.push(newLayer);
		}
	}
}
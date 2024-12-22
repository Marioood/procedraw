class Serialization {
	save() {
		let saved = {};
		saved.img = {
			bg: img.RGB2Hex(img.bg),
			x: img.x,
			y: img.y,
			name: img.name,
			version: "VOLATILE 0.2"
		};
		saved.layers = [];
		
		for(let i = 0; i < img.layers.length; i++) {
			let layer = img.layers[i];
			let optionsNew = {};
			const optionKeys = Object.keys(layer.options);
			let newLayer = {};
			let newOptionDefaults = Object.assign({}, layer.od);
			newOptionDefaults.tint = img.RGB2Hex(newOptionDefaults.tint);
			//dont bother saving the options if they're empty
			if(optionKeys.length > 0) {
				//replace some options so theyre a little smaller (colors are arrays during runtime - but theyre smaller as hex strings)
				for(let o = 0; o < optionKeys.length; o++) {
					const key = optionKeys[o];
					const val = layer.options[key];
					
					if(layer.types[key].type == "color") {
						optionsNew[key] = img.RGB2Hex(val);
					} else {
						optionsNew[key] = val;
					}
				}
				newLayer = {
					name: layer.name,
					od: newOptionDefaults,
					options: optionsNew
				};
			} else {
				newLayer = {
					name: layer.name,
					od: newOptionDefaults
				};
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
						optionsNew[key] = img.parseHex(val);
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
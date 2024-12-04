class Serialization {
	save() {
		let saved = {};
		saved.img = {
			bg: img.RGB2Hex(img.bg),
			x: img.x,
			y: img.y
		};
		saved.layers = [];
		
		for(let i = 0; i < img.layers.length; i++) {
			let layer = img.layers[i];
			let optionsNew = {};
			const optionKeys = Object.keys(layer.options);
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
			
			saved.layers.push({
				class: layer.name,
				od: layer.od,
				options: optionsNew
			});
		}
		
		return JSON.stringify(saved);
	}
	
	load(savedText) {
		//welcome to my hooker palace!
		let saved = JSON.parse(savedText);
		
		img.bg = img.parseHex(saved.img.bg);
		img.x = saved.img.x;
		img.y = saved.img.y;
	}
}
const img = new ImageManager();
const t = new Tether();
const s = new Serialization();

img.printImage();
//do this so the variables used during setup aren't in global scope
//also this stuff can't quite be moved to tether.js
setupInterop();

function setupInterop() {

	const removeLayer = document.getElementById("remove-layer");

	removeLayer.addEventListener("click", function (e) {img.layers.splice(t.currentLayer, 1);
		//go down a layer if we're in the middle, stay in place if we're at the bottom
		if(t.currentLayer > 0) {
			 t.setCurrentLayer(t.currentLayer - 1);
		}
		t.updateLayerOptions();
		t.generateLayerList();
		img.printImage();
	});

	const addLayer = document.getElementById("add-layer");

	addLayer.addEventListener("click", function (e) {
		if(img.layers.length > 0) {
			t.setCurrentLayer(t.currentLayer + 1);
		}
		img.layers.splice(t.currentLayer, 0, new t.currentClass);
		//fix that smearing!!
		//later me here what the hell did i mean by that
		t.updateLayerOptions();
		t.generateLayerList();
		img.printImage();
	});

	const dupeLayer = document.getElementById("dupe-layer");
	dupeLayer.addEventListener("click", function (e) {
		const layer2Dupe = img.layers[t.currentLayer];
		//fuck you stack overflow
		const clone = new img.layerClasses[layer2Dupe.name];
		//create copies - not references
		clone.options = Object.assign({}, layer2Dupe.options);
		clone.od = Object.assign({}, layer2Dupe.od);
		
		t.setCurrentLayer(t.currentLayer + 1)
		img.layers.splice(t.currentLayer, 0, clone);
		//fix that smearing!!
		t.updateLayerOptions();
		t.generateLayerList();
		img.printImage();
	});

	const classSelect = document.getElementById("layer-class-select");
	const classNames = Object.keys(img.layerClasses);

	for(let i = 0; i < classNames.length; i++) {
		const option = document.createElement("option");
		option.text = classNames[i];
		classSelect.add(option);
	}

	classSelect.addEventListener("change", function (e) {
		t.currentClass = img.layerClasses[classNames[this.selectedIndex]];
	});
	
	const bgInput = document.getElementById("img-bg-color");
	let oldTime;
	//copied from tether.js
	bgInput.addEventListener("input", function (e) {
		//intentionally lag the input so your pc doesnt sound like a jet engine when you drag too fast
		let curTime = Math.round(Date.now() / 100);
		
		if(oldTime != curTime) {
			oldTime = curTime;
			img.bg = img.parseHex(bgInput.value);
			img.printImage();
		}
	});
	
	const widthInput = document.getElementById("img-width");
	widthInput.value = img.x;

	widthInput.addEventListener("input", function (e) {
		img.x = Number(this.value);
		img.updateSize();
		t.updateSize();
		img.printImage();
	});
	
	const heightInput = document.getElementById("img-height");
	heightInput.value = img.y;
	
	heightInput.addEventListener("input", function (e) {
		img.y = Number(this.value);
		img.updateSize();
		t.updateSize();
		img.printImage();
	});
	
	const scaleInput = document.getElementById("canvas-scale");
	scaleInput.value = t.canvasScale;
	
	scaleInput.addEventListener("input", function (e) {
		t.canvasScale = scaleInput.value;
		t.canvas.style.width = img.x * t.canvasScale + "px";
		t.canvas.style.height = img.y * t.canvasScale + "px";
	});
	
	const saveImage = document.getElementById("img-save");

	saveImage.addEventListener("click", function (e) {
		const saveOutput = document.getElementById("img-save-data");
		saveOutput.value = s.save();
	});
	
	const loadImage = document.getElementById("img-load-button");

	loadImage.addEventListener("click", function (e) {
		const loadInput = document.getElementById("img-load-data");
		if(confirm("load image?")) {
			try {
				s.load(loadInput.value);
				t.generateLayerList();
				img.updateSize();
				t.updateSize();
				img.printImage();
				
				bgInput.value = img.RGB2Hex(img.bg);
			} catch(error) {
				window.alert("couldn't parse data! \n\n" + error);
				return;
			}
		}
	});
	//oldTime is already defined (near the background selection events)
	let oldTimeR = 0
	document.addEventListener("keydown", function(event) {
		//intentionally lag the input so it doesnt print too fast
		let curTime = Math.round(Date.now() / 100);
		if(oldTimeR != curTime) {
			if(event.key == "r" || event.key == "R") {
				oldTimeR = curTime;
				img.printImage();
			}
		}
	});
}
//NEW goalz
//hex codes in color input
//layer names
//make sure that textures loop!!
//shown option changes eye button
//grout layer
//take a break! work on the programmer art thing
//overlap option (see wandering lines)
//brightness tolerance

//the set color function sucked it was like 4 times slower


//later
//snap image editor
//layer link
//color ramp
//tiled view
//variables and math expressions
//filters (?) they seem kinda slow.....
	//layer tiling periods, layer offsets
	//scale + normalized scale (like xor fractal)
	//plot filters (only change the output of plotPixel()) dont seem like they'd be slow
//perlin noise


//DONT SLAP MORE SHIT ONTO SHIT
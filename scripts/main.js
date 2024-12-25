const img = new ImageManager();
const t = new Tether();
const s = new Serialization();
img.printImage();
//do this so the variables used during setup aren't in global scope
//also this stuff can't quite be moved to tether.js
setupInterop();

function setupInterop() {

	const removeLayer = document.getElementById("remove-layer");
	removeLayer.addEventListener("click", function (e) {
		img.layers.splice(t.currentLayer, 1);
		//go down a layer if we're in the middle, stay in place if we're at the bottom
		if(t.currentLayer > 0) {
			 t.setCurrentLayer(t.currentLayer - 1);
		}
		t.updateLayerOptions();
		t.generateLayerList();
		img.printImage();
	});

	const clearLayer = document.getElementById("clear-layer");
	clearLayer.addEventListener("click", function (e) {
		//go down a layer if we're in the middle, stay in place if we're at the bottom
		t.setCurrentLayer(0);
		img.layers.splice(0);
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
		img.layers[t.currentLayer].displayName = img.layers[t.currentLayer].name;
		//fix that smearing!!
		//later me here what the hell did i mean by that
		t.updateLayerOptions();
		t.generateLayerList();
		img.printImage();
	});

	const dupeLayer = document.getElementById("dupe-layer");
	let dupeRedTimer = null;
	dupeLayer.addEventListener("click", function (e) {
		const layer2Dupe = img.layers[t.currentLayer];
		if (!layer2Dupe) {
			if (dupeRedTimer !== null) clearTimeout(dupeRedTimer);
			dupeRedTimer = setTimeout(() => {
				dupeLayer.style.color = null;
				dupeLayer.style.borderColor = null;
			}, 150);
			dupeLayer.style.color = 'red';
			dupeLayer.style.borderColor = 'red';
			return;
		}
		//fuck you stack overflow
		const clone = new img.layerClasses[layer2Dupe.name];
		//create copies - not references
		clone.options = Object.assign({}, layer2Dupe.options);
		clone.od = Object.assign({}, layer2Dupe.od);
		
		t.setCurrentLayer(t.currentLayer + 1)
		img.layers.splice(t.currentLayer, 0, clone);
		img.layers[t.currentLayer].displayName = /*"copy of " + */img.layers[t.currentLayer - 1].displayName;
		//fix that smearing!!
		t.updateLayerOptions();
		t.generateLayerList();
		img.printImage();
	});

	const randomLayer = document.getElementById("random-layer");
	randomLayer.addEventListener("click", function (e) {
		if(img.layers.length > 0) {
			t.setCurrentLayer(t.currentLayer + 1);
		}
		const choice = x => x[Math.floor(Math.random() * x.length)];
		/** @type {Layer} */
		const layer = new (choice(Object.values(img.layerClasses)));
		function randomize(opts, desc) {
			for(const key in opts) {
				const d = desc[key];
				switch (d.type) {
					case 'number': {
						const min = d.min === void 0 ? 0 : d.min;
						const max = d.max === void 0 ? 100 : d.max;
						const step = d.step === void 0 ? 1 : d.step;
						opts[key] = Math.random() * (max - min) + min;
						opts[key] /= step;
						opts[key] = Math.floor(opts[key]) * step;
						opts[key] *= 1e10;
						opts[key] = Math.floor(opts[key]);
						opts[key] /= 1e10;
					} break;
					case 'boolean':
						opts[key] = Math.random() > 0.5;
					break;
					case 'color':
						opts[key] = Array(4).fill(1).map(m => Math.random() * m);
					break;
					case 'dropdown':
						opts[key] = choice(d.items);
					break;
					default:
						console.error(`Unsupported option type ${d.type}`);
				}
			}
		}
		randomize(layer.od, layer.typesDefault);
		randomize(layer.options, layer.types);
		layer.od.shown = true;
		img.layers.splice(t.currentLayer, 0, layer);
		img.layers[t.currentLayer].displayName = img.layers[t.currentLayer].name;
		//fix that smearing!!
		//later me here what the hell did i mean by that
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
		img.bg = img.parseHex(bgInput.value);
		
		if(oldTime != curTime) {
			oldTime = curTime;
			img.printImage();
		}
	});
	
	const widthInput = document.getElementById("img-width");
	widthInput.value = img.x;

	widthInput.addEventListener("input", function (e) {
		img.x = Number(this.value);
		img.updateSize();
		t.updateSize();
		t.forceRender = true;
		img.printImage();
	});
	
	const heightInput = document.getElementById("img-height");
	heightInput.value = img.y;
	
	heightInput.addEventListener("input", function (e) {
		img.y = Number(this.value);
		img.updateSize();
		t.updateSize();
		t.forceRender = true;
		img.printImage();
	});
	
	const scaleInput = document.getElementById("canvas-scale");
	scaleInput.value = t.canvasScale;
	
	scaleInput.addEventListener("input", function (e) {
		t.canvasScale = scaleInput.value;
		t.canvas.style.width = img.x * t.canvasScale + "px";
		t.canvas.style.height = img.y * t.canvasScale + "px";
	});

	function generateSaveUrl(data) {
		const url = new URL(location.href);
		url.searchParams.set("save", data);
		return url.toString();
	}

	const saveImage = document.getElementById("img-save");
	saveImage.addEventListener("click", async function (e) {
		const saveOutput = document.getElementById("img-save-data");
		if(t.compressSaves) {
			const url = generateSaveUrl(saveOutput.value = await s.saveEnc());
			if (history.replaceState && t.saveURL) {
				history.replaceState({}, "", url);
			}
		} else {
			saveOutput.value = s.save();
		}
	});
	
	const loadImage = document.getElementById("img-load-button");
	loadImage.addEventListener("click", async function (e) {
		const loadInput = document.getElementById("img-load-data");
		if(confirm("load image?")) {
			try {
				await s.loadEnc(loadInput.value);
				t.generateLayerList();
				img.updateSize();
				t.updateSize();
				img.printImage();
				
				bgInput.value = img.RGB2Hex(img.bg);

				if (history.replaceState && t.saveURL) {
					history.replaceState({}, "", generateSaveUrl(await s.saveEnc()));
				}
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
				t.forceRender = true;
				img.printImage();
			}
		}
	});
	
	const refreshImage = document.getElementById("img-refresh");

	refreshImage.addEventListener("click", function (e) {
		t.forceRender = true;
		img.printImage();
	});
	
	const renderUpdateInput = document.getElementById("render-on-update");
	renderUpdateInput.checked = t.renderOnUpdate;
	renderUpdateInput.addEventListener("input", function (e) {
		t.renderOnUpdate = renderUpdateInput.checked;
	});
		
	const useRenderWorkerInput = document.getElementById("use-render-worker");
	useRenderWorkerInput.checked = t.useRenderWorker;
	useRenderWorkerInput.addEventListener("input", function (e) {
		t.useRenderWorker = useRenderWorkerInput.checked;
	});
		
	const compressSavesInput = document.getElementById("compress-saves");
	compressSavesInput.checked = t.compressSaves;
	compressSavesInput.addEventListener("input", function (e) {
		t.compressSaves = compressSavesInput.checked;
	});
		
	const saveURLInput = document.getElementById("save-url");
	saveURLInput.checked = t.saveURL;
	saveURLInput.addEventListener("input", function (e) {
		t.saveURL = saveURLInput.checked;
	});

	const params = new URLSearchParams(window.location.search);

	(async() => {
		let save = params.get("save");
		if (!save) return;
		const o = save;

		try {
			await s.loadEnc(save);
			t.generateLayerList();
			img.updateSize();
			t.updateSize();
			img.printImage();
			
			bgInput.value = img.RGB2Hex(img.bg);
			document.getElementById("img-load-data").value = o;
		} catch (why) {
			console.error("Failed to load save");
		}
	})();
}
//NEW goalz
//hex codes in color input
//shown option changes eye button
//take a break! work on the programmer art thing
//overlap option (see wandering lines)
//brightness tolerance
//img.blend function is broken! when the col1 alpha smaller than col0 thing look weird

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
const img = new ImageManager();
const t = new Tether();

const layerClasses = {
	xorFractal: LayerXorFractal,
	solid: LayerSolid,
	noise: LayerNoise,
	border: LayerBorder,
	liney: LayerLiney,
	wandering: LayerWandering
};

img.printImage()

const layerInput = document.getElementById("current-layer");
layerInput.setAttribute("min", 0);
layerInput.setAttribute("max", img.layers.length - 1);

layerInput.addEventListener("input", function (e) {
	t.currentLayer = Number(this.value);
	t.updateLayerOptions();
});
//hack-y way to get the optios to show up REMOVE
layerInput.dispatchEvent(new Event("input"));

const removeLayer = document.getElementById("remove-layer");

removeLayer.addEventListener("click", function (e) {
	//abort if theres only one layer (change this later since theres gonna be bg color)
	if(t.currentLayer == 0 && img.layers.length == 1) return;
	
	img.layers.splice(t.currentLayer, 1);
	//go down a layer if we're in the middle, stay in place if we're at the bottom
	if(t.currentLayer > 0) {
		 t.currentLayer--;
	}
	layerInput.setAttribute("max", img.layers.length - 1);
	layerInput.value = t.currentLayer;
	t.updateLayerOptions();
	img.printImage();
});

const addLayer = document.getElementById("add-layer");

addLayer.addEventListener("click", function (e) {
	t.currentLayer++;
	img.layers.splice(t.currentLayer, 0, new t.currentClass);
		 
	layerInput.setAttribute("max", img.layers.length - 1);
	layerInput.value = t.currentLayer;
	//fix that smearing!!
	//later me here what the hell did i mean by that
	t.updateLayerOptions();
	img.printImage();
});

const dupeLayer = document.getElementById("dupe-layer");
//copy and pasted from the add layer functions - change later!!
dupeLayer.addEventListener("click", function (e) {
	t.currentLayer++;
	img.layers.splice(t.currentLayer, 0, img.layers[t.currentLayer - 1]);
		 
	layerInput.setAttribute("max", img.layers.length - 1);
	layerInput.value = t.currentLayer;
	//fix that smearing!!
	t.updateLayerOptions();
	img.printImage();
});

const classSelect = document.getElementById("layer-class-select");
const classNames = Object.keys(layerClasses);

for(let i = 0; i < classNames.length; i++) {
	const option = document.createElement("option");
	option.text = classNames[i];
	classSelect.add(option);
}

classSelect.addEventListener("change", function (e) {
	t.currentClass = layerClasses[classNames[this.selectedIndex]];
	console.log(this.selectedIndex);
});

//NEW goalz
//serialization
//checkerboard layer
//thick border
//pretty sure the overlay blend mode is innaccurate
//filters (?) they seem kinda slow.....
	//layer tiling periods, layer offsets
	//layer tint
	//scale + normalized scale (like xor fractal)
//normalized is broken?
//hex codes in color input
//add those cute blended corners to LayerBorder that the old version had
//bg color
//option type for directions
//maybe have universal options be global? so theres less to type
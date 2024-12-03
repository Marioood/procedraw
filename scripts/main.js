const img = new ImageManager();
const t = new Tether();

img.printImage()
//maybe move this into tether.js?
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
	img.layers.splice(t.currentLayer, 0, new LayerXorFractal(1, "plain"));
		 
	layerInput.setAttribute("max", img.layers.length);
	layerInput.value = t.currentLayer;
	//fix that smearing!!
	t.updateLayerOptions();
	img.printImage();
});
//NEW goalz
//layer creation
//serialization
//port the rest of the layers
//checkerboard layer
//thick border
//pretty sure the overlay blend mode is innaccurate
//filters (?) they seem kinda slow.....
	//layer tiling periods, layer offsets
	//layer tint
//normalized is broken?
//hex codes in color input
//add those cute blended corners to LayerBorder that the old version had
//bg color
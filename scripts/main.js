const img = new ImageManager();
const t = new Tether();

img.printImage()
//maybe move this into tether.js?
const layerInput = document.getElementById("current-layer");
layerInput.setAttribute("min", 0);
layerInput.setAttribute("max", img.layers.length - 1);

layerInput.addEventListener("input", function (e) {
	t.currentLayer = Number(this.value);
	t.killAllChildren("layer-options");
	t.killAllChildren("layer-options-default");
	const layer = img.layers[t.currentLayer];
	t.generateLayerOptions(layer.od, layer.typesDefault, "layer-options-default");
	t.generateLayerOptions(layer.options, layer.types, "layer-options");
});
//hack-y way to get the optios to show up REMOVE
layerInput.dispatchEvent(new Event("input"));

//NEW goalz
//layer creation
//serialization
//port the rest of the layers
//checkerboard layer
//thick border
//pretty sure the overlay blend mode is innaccurate
//layer tiling periods, layer offsets
//layer tint
//filters (?) they seem kinda slow.....
//normalized is broken?
//hex codes in color input
//add those cute blended corners to LayerBorder that the old version had
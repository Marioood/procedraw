class PlotFilter {
	edit(r, g, b, a) {
		
	}
}

class FilterInvert extends PlotFilter {
	edit(r, g, b, a) {
		return [255 - r, 255 - g, 255 - b, a];
	}
}

class FilterBrightness extends PlotFilter {
	edit(r, g, b, a) {
		let brightness = 1;
		return [r * brightness, g * brightness, b * brightness, a];
	}
}

class FilterQuantize extends PlotFilter {
	edit(r, g, b, a) {
		let depth = 4;
		return [Math.floor(r / depth) * depth, Math.floor(g / depth) * depth, Math.floor(b / depth) * depth, a];
	}
}
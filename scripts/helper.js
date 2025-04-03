//helpful functions that are used everywhere in the code

function mod(dividend, divisor) {
    //% is remainder and there's no built in mod function...
    //thanks https://stackoverflow.com/a/17323608
    return ((dividend % divisor) + divisor) % divisor;
}
function RGB2Hex(arr) {
	return byteRGB2Hex([Math.floor(arr[0] * 255), Math.floor(arr[1] * 255), Math.floor(arr[2] * 255)]);
}
function RGBA2Hex(arr) {
	//[1, 1, 1, 1] to #ffffffff
	let r = Math.floor(arr[0] * 255).toString(16);
	let g = Math.floor(arr[1] * 255).toString(16);
	let b = Math.floor(arr[2] * 255).toString(16);
	let a = Math.floor(arr[3] * 255).toString(16);
	//padding so all colors are the same length (black was encoded as #000 instead of #000000!!)
	if(r.length < 2) r = "0" + r;
	if(g.length < 2) g = "0" + g;
	if(b.length < 2) b = "0" + b;
	if(a.length < 2) a = "0" + a;
	return r + g + b + a;
}
function byteRGB2Hex(arr) {
	//[255, 255, 255, 255] to #ffffff
	let r = arr[0].toString(16);
	let g = arr[1].toString(16);
	let b = arr[2].toString(16);
	//padding so all colors are the same length (black was encoded as #000 instead of #000000!!)
	if(r.length < 2) r = "0" + r;
	if(g.length < 2) g = "0" + g;
	if(b.length < 2) b = "0" + b;
	return r + g + b;
}
function HSV2RGB(col) { //[H, S, V] array
    //https://en.wikipedia.org/wiki/HSL_and_HSV#Color_conversion_formulae
    let s2 = col[1] / 100;
    let v2 = col[2] / 100;
    let chroma = v2 * s2;
    let h2 = col[0] / 60;
    let temp = chroma * (1 - Math.abs(h2 % 2 - 1));
    let r = -1;
    let g = -1;
    let b = -1;
    let h3 = Math.floor(h2);
    if(h3 == 0) {
        r = chroma;
        g = temp;
        b = 0;
    } else if(h3 == 1) {
        r = temp;
        g = chroma;
        b = 0;
    } else if(h3 == 2) {
        r = 0;
        g = chroma;
        b = temp;
    } else if(h3 == 3) {
        r = 0;
        g = temp;
        b = chroma;
    } else if(h3 == 4) {
        r = temp;
        g = 0;
        b = chroma;
    } else if(h3 == 5) {
        r = chroma;
        g = 0;
        b = temp;
    }
    let m = v2 - chroma;
    r += m;
    g += m;
    b += m;
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}
function byteRGB2HSV(col) {
	return RGB2HSV([col[0] / 255, col[1] / 255, col[2] / 255]);
}
function RGB2HSV(col) { //[R, G, B] array
    //https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
    const r = col[0];
    const g = col[1];
    const b = col[2];
    let value = Math.max(Math.max(r, g), b);
    let min = Math.min(Math.min(r, g), b);
    let chroma = value - min;
    let satty = chroma / value; //chroma is just value * saturation, so this works (not sure why its not on wikipedia)
    let hue = 0;
    
    if(value == r) {
        hue = mod((g - b) / chroma, 6) * 60;
    } else if(value == g) {
        hue = ((b - r) / chroma + 2) * 60;
    } else if(value == b) {
        hue = ((r - g) / chroma + 4) * 60;
    }
    if(hue != hue) hue = 0; //nan check
    if(satty != satty) satty = 0; //nan check

    return [Math.floor(hue), Math.floor(satty * 100), Math.floor(value * 100)];
}
function intRGB2RGB(hex) {
	const r = ((hex & 0xFF000000) >> 24) & 0xFF; //signed 2 unsigned
	const g = (hex & 0x00FF0000) >> 16;
	const b = (hex & 0x0000FF00) >> 8;
	const a = hex & 0x000000FF;
	return [r / 255, g / 255, b / 255, a / 255];
}
function hex2RGB(hex) {
	//convert #RRGGBB to 0xRRGGBB and then [R, G, B] from 0...1
	//rgba or rgb depending on length
	if(hex.length <= 7) {
		//hack for versions that didnt support alpha input
		return intRGB2RGB(Number("0x" + hex.slice(1) + "ff"));
	} else {
		return intRGB2RGB(Number("0x" + hex.slice(1)));
	}
}
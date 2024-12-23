importScripts("./layers.js", "./image.js", "./serialization.js");

const img = new ImageManager();
const s = new Serialization();

onmessage = event => {
	const {type} = event.data;
	switch (type) {
		case 'hello':
			postMessage({type: 'hello'});
		break;
		case 'draw': {
            s.load(event.data.settings);
            img.data = new Array(img.x * img.y * 4).fill(0);
            img._processImageRaw();
            const buffer = new Uint8Array(img.data);
            postMessage({
                type: 'draw',
                buffer,
                x: img.x,
                y: img.y,
            }, [buffer.buffer]);
        } break;
	}
}
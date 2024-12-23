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
            for (let x = 0; x < img.x; x++) for (let y = 0; y < img.y; y++) {
                const i = (x + y * img.x) * 4;
                img.data[i] = img.bg[0];
                img.data[i + 1] = img.bg[1];
                img.data[i + 2] = img.bg[2];
                img.data[i + 3] = img.bg[3];
            }
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
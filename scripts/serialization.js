"use strict";

class Serialization {
  format = 1;
  
  save() {
    let saved = {};
    saved.img = {
      bg: RGBA2Hex(img.bg),
      w: img.w,
      h: img.h,
      name: img.name,
      version: t.version,
      format: this.format
    };
    saved.layers = [];
    
    for(let i = 0; i < img.layers.length; i++) {
      let layer = img.layers[i];
      let optionsNew = {};
      const optionKeys = Object.keys(layer.options);
      let newLayer = {};
      let newOptionDefaults = Object.assign({}, layer.od);
      newOptionDefaults.tint = RGB2Hex(newOptionDefaults.tint);
      //factory fresh version of the layer, for parameter stripping
      let refLayer = new img.layerClasses[layer.name];
      //dont bother saving the options if they're empty
      let optionCount = 0;
      if(optionKeys.length > 0) {
        //replace some options so theyre a little smaller (colors are arrays during runtime - but theyre smaller as hex strings)
        for(let o = 0; o < optionKeys.length; o++) {
          const key = optionKeys[o];
          let val = layer.options[key];
          let refVal = refLayer.options[key];
          const type = layer.types[key].type;
          if(type == "color") {
            val = RGBA2Hex(val);
            refVal = RGBA2Hex(refVal);
          } else if(type == "layer") {
            //save layer index, because the keys get lost after saving
            val = img.layerKeys[val];
            refVal = img.layerKeys[refVal];
          }
          //dont save the parameter if its just the default value
          if(refVal == val) continue;
          optionCount++;
          optionsNew[key] = val;
        }
      }
      newLayer["name"] = layer.name;
      //dont bother saving the name if its unchanged
      if(layer.name != layer.displayName) {
        newLayer["displayName"] = layer.displayName;
      }
      newLayer["od"] = newOptionDefaults;
      //dont save the options if all of them are default or there arent any
      if(optionCount > 0 || optionKeys.length > 0) {
        newLayer["options"] = optionsNew;
      }
      saved.layers.push(newLayer);
    }
    
    return JSON.stringify(saved);
  }
  
  load(savedText) {
    //welcome to my hooker palace!
    let saved = typeof savedText == 'string' ? JSON.parse(savedText) : savedText;
    
    img.bg = hex2RGB('#' + saved.img.bg);
    img.w = saved.img.w;
    img.h = saved.img.h;
    img.name = saved.img.name;
    if(saved.img.format == undefined) {
      alert(`this image was saved in an ancient version of procedraw (before VOLATILE 0.5), it will not work with out repair\n\nthe image is from version ${saved.img.version}\n\n...sorry!`);
    } else if(saved.img.format < this.format) {
      alert(`this image was saved in an earlier version of procedraw\n\nthe image uses format ${saved.img.format}, while the current save format is ${this.format}\n\nthe image is also from version ${saved.img.version}\n\ntherefore, it may not load in properly (!)`);
    } else if(saved.img.format > this.format) {
      alert(`either you are from the future or are using an old version of procedraw\n\nthe image uses format ${saved.img.format}, while this version's save format is ${this.format}\n\nthe image is also from version ${saved.img.version}\n\ntherefore, it may not load in properly (!)`);
    }
    //blank layers so we arent loading images on top of eachother
    img.layers = [];
    img.layerKeys = [];
    img.layerKeysFreed = [];

    for(let i = 0; i < saved.layers.length; i++) {
      const fauxLayer = saved.layers[i];
      let newLayer = new img.layerClasses[fauxLayer.name];
      //for stripped out layer names
      if(fauxLayer.displayName == undefined) {
        newLayer.displayName = fauxLayer.name;
      } else {
        newLayer.displayName = fauxLayer.displayName;
      }
      
      newLayer.od = Object.assign(newLayer.od, fauxLayer.od);
      newLayer.od.tint = hex2RGB('#' + newLayer.od.tint);
      //increment layer link counts--layer rendering shits itself if it isn't right!!
      //just using the layer index should be fine, since layer indices and keys are the same at this point
      if(newLayer.od.base > -1) img.layers[newLayer.od.base].linkCount++;
      //dont bother writing option data if there is none!!
      if(fauxLayer.options != undefined) {
        //clean up colors!
        let optionsNew = {};
        //make sure the faux options have the correct amount of options (if an image from an old version gets loaded in a version w new options)
        fauxLayer.options = Object.assign(newLayer.options, fauxLayer.options);
        const optionKeys = Object.keys(fauxLayer.options);
        
        for(let o = 0; o < optionKeys.length; o++) {
          const key = optionKeys[o];
          const val = fauxLayer.options[key];
          const type = newLayer.types[key].type;
          if(type == "color") {
            //too lazy to parse colors that are from the default layer... just check if theyre an array and plop em in
            //TODO: figure out why the hell i do this? apparently it's important and stuff breaks without it, but the comment is absolute ass
            //THANKS PAST ME
            if(typeof val == "object") {
              optionsNew[key] = val;
            } else {
              optionsNew[key] = hex2RGB('#' + val);
            }
          } else {
            optionsNew[key] = val;
          }
        }
        
        newLayer.options = optionsNew;
        //the layer indices should be the same as the keys at this point (starting from scratch)
        //this should be fine....
        img.layerKeys.push(i);
      }
      
      img.layers.push(newLayer);
    }
  }

  async saveEnc() {
    const data = this.save();

    if (typeof CompressionStream !== 'undefined') {
      try {
        const zipped = await this.gzip(data);
        //the zipped data can SOMETIMES be longer than the unzipped data
        if(zipped.length > data.length) {
          return data;
        } else {
          return zipped;
        }
      } catch(why) {
        console.error("Failed to gzip save:", why);
      }
    }

    return data;
  }
  async loadEnc(savedText) {
    if (typeof savedText == 'object') this.load(savedText);

    if (typeof DecompressionStream !== 'undefined') {
      try {
        savedText = await this.ungzip(savedText);
      } catch (_) {}
    }

    this.load(savedText);
  }

  async gzip(data) {
    const blob = new Blob([new Uint8Array(new Array(data.length).fill().map((_, i) => data.charCodeAt(i)))]);
    const compression = new CompressionStream('gzip');
    const compressed = await new Response(blob.stream().pipeThrough(compression)).blob();
    return await new Promise(res => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result.split(',')[1]);
      reader.readAsDataURL(compressed);
    });
  }
  async ungzip(savedText) {
    const bytes = atob(savedText);
    const blob = new Blob([new Uint8Array(new Array(bytes.length).fill().map((_, i) => bytes.charCodeAt(i)))]);
    const compression = new DecompressionStream('gzip');
    return await new Response(blob.stream().pipeThrough(compression)).json();
  }
}
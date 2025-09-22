//////////////////////////////////////////////
//    All Procedraw Material is Licensed    //
//     December, 2024-???? under MIT by.    //
//         Backshot Betty #killtf2.         //
//                 _______                  //
//                |   |_|+|                 //
//                |___|+|_|                 //
//                |_|+|   |                 //
//                |+|_|___|                 //
//                                          //
//   *Any names, or persons, illustrated    //
// in any of the Procedraw Programs, except //
//     that of Backshot Betty #killtf2,     //
//          that may seem similar           //
//               to anyone                  //
//   in real life, are purely coincidental, //
//         or otherwise parodic.*           //
//////////////////////////////////////////////

"use strict";

class Serialization {
  save(img) {
    let saved = {};
    saved.img = {
      bg: RGBA2Hex(img.bg),
      w: img.w,
      h: img.h,
      name: img.name,
      author: img.author,
      version: PD_VERSION,
      format: PD_SAVE_FORMAT
    };
    saved.layers = [];
    
    for(let i = 0; i < img.layers.length; i++) {
      let layer = img.layers[i];
      let newLayer = {};
      //factory fresh version of the layer, for parameter stripping
      let refLayer = new img.layerClasses[layer.name];
      
      function copyKeys(oldOptions, types, refOptions) {
        let newOptions = {};
        const optionKeys = Object.keys(oldOptions);
        //replace some options so there's less filler in the save
        for(let o = 0; o < optionKeys.length; o++) {
          const key = optionKeys[o];
          let val = oldOptions[key];
          let refVal = refOptions[key];
          const type = types[key].type;
          let refIsEqual = val == refVal;
          
          if(type == "color") {
            //colors are arrays during runtime - but theyre smaller as hex strings
            val = RGBA2Hex(val);
            refVal = RGBA2Hex(refVal);
          } else if(type == "layer") {
            //save layer index, because the keys get lost after saving
            val = img.layerKeys[val];
            refVal = img.layerKeys[refVal];
          } else if(type == "length") {
            refIsEqual = val.value == refVal.value && val.unit == refVal.unit;
            //arrays are smaller than objects
            val = [val.value, val.unit];
            refVal = [refVal.value, refVal.unit];
          }
          if(refIsEqual) continue;
          newOptions[key] = val;
        }
        return newOptions;
      }
      const newOptionsDefault = copyKeys(layer.od, layer.typesDefault, refLayer.od);
      const newOptions = copyKeys(layer.options, layer.types, refLayer.options);
      
      newLayer["name"] = layer.name;
      //dont bother saving the name if its unchanged
      if(layer.name != layer.displayName) {
        newLayer["displayName"] = layer.displayName;
      }
      //dont save the parameter if its just the default value
      if(Object.keys(newOptionsDefault).length > 0) newLayer["od"] = newOptionsDefault;
      if(Object.keys(newOptions).length > 0) newLayer["options"] = newOptions;
      saved.layers.push(newLayer);
    }
    
    return JSON.stringify(saved);
  }
  
  load(img, savedText) {
    let saved = typeof savedText == 'string' ? JSON.parse(savedText) : savedText;
    
    img.bg = hex2RGB('#' + saved.img.bg);
    img.w = saved.img.w;
    img.h = saved.img.h;
    img.name = saved.img.name;
    img.author = saved.img.author;
    if(saved.img.format == undefined) {
      alert(`this image was saved in an ancient version of procedraw (before VOLATILE 0.5), it will not work without repair\n\nthe image is from version ${saved.img.version}\n\n...sorry!`);
    } else if(saved.img.format < PD_SAVE_FORMAT) {
      alert(`this image was saved in an earlier version of procedraw\n\nthe image uses format ${saved.img.format}, while the current save format is ${this.format}\n\nthe image is also from version ${saved.img.version}\n\ntherefore, it may not load in properly (!)`);
    } else if(saved.img.format > PD_SAVE_FORMAT) {
      alert(`either you are from the future or are using an old version of procedraw\n\nthe image uses format ${saved.img.format}, while this version's save format is ${this.format}\n\nthe image is also from version ${saved.img.version}\n\ntherefore, it may not load in properly (!)`);
    }
    //blank layers so we arent loading images on top of eachother
    img.layers = [];
    img.layerKeys = [];
    img.layerKeysFreed = [];

    for(let i = 0; i < saved.layers.length; i++) {
      const fauxLayer = saved.layers[i];
      let newLayer = new img.layerClasses[fauxLayer.name];
      //add back display names, for stripped out layer names
      if(fauxLayer.displayName == undefined) {
        newLayer.displayName = fauxLayer.name;
      } else {
        newLayer.displayName = fauxLayer.displayName;
      }
      
      //increment layer link counts--layer rendering shits itself if it isn't right!!
      //just using the layer index should be fine, since layer indices and keys are the same at this point
      if(newLayer.od.base != KEY_CANVAS) img.layers[newLayer.od.base].linkCount++;
      
            //TODO: these comments are fucking incomprehensible, even to the person who wrote them
      function loadOptions(fauxOptions, types) {
        //clean up colors!
        let newOptions = {};
        const optionKeys = Object.keys(fauxOptions);
        
        for(let o = 0; o < optionKeys.length; o++) {
          const key = optionKeys[o];
          const val = fauxOptions[key];
          const type = types[key].type;
          if(type == "color") {
            //too lazy to parse colors that are from the default layer... just check if theyre an array and plop em in
            //TODO: figure out why the hell i do this? apparently it's important and stuff breaks without it, but the comment is absolute ass
            //THANKS PAST ME
            //i have yet to gleam any meaning from this comment
            if(typeof val == "object") {
              newOptions[key] = val;
              console.log("i am john object: " + key);
            } else {
              newOptions[key] = hex2RGB('#' + val);
            }
          } else if(type == "layer") {
            newOptions[key] = val;
            //skip link count increment if the layer has no base
            if(val == KEY_CANVAS) continue;
            //prevent filters from shitting themselves
            //because layer data only gets defined when the link count is > 0
            img.layers[img.layerKeys[val]].linkCount++;
          } else if(type == "length") {
            //length is stored in saves as an array (smaller), but it can be an object if it's taken from the default layer options (e.g. after the default values got stripped)
            if(Array.isArray(val)) {
              //[value, units]
              newOptions[key] = new UnitLength(val[0], val[1]);
            } else if(typeof(val) == "object") {
              newOptions[key] = val;
            } else {
              //TODO: fixing this error is trivial, but wait to do that once the save format is finalized
              newOptions[key] = val;
              throw new ProcedrawError(`'${key}' has incorrect type ${typeof(val)}. type should be array or object.`);
            }
          } else {
            newOptions[key] = val;
          }
        }
        return newOptions;
      }
      //make sure the faux options have the correct amount of options
      //for when a layer has stripped out options (very likely)
      const fauxOptionsDefault = Object.assign(newLayer.od, fauxLayer.od);
      const fauxOptions = Object.assign(newLayer.options, fauxLayer.options);
      //dont bother writing option data if there is none
      if(fauxLayer.od != undefined) newLayer.od = loadOptions(fauxOptionsDefault, newLayer.typesDefault);
      if(fauxLayer.options != undefined) newLayer.options = loadOptions(fauxOptions, newLayer.types);
      //the layer indices should be the same as the keys at this point (starting from scratch)
      //this should be fine....
      img.layerKeys.push(i);
      img.layers.push(newLayer);
    }
  }

  async saveEnc(img) {
    const data = this.save(img);

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
  async loadEnc(img, savedText) {
    if (typeof savedText == 'object') this.load(img, savedText);

    if (typeof DecompressionStream !== 'undefined') {
      try {
        savedText = await this.ungzip(savedText);
      } catch (_) {}
    }

    this.load(img, savedText);
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
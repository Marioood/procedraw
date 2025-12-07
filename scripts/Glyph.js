//
// All Procedraw material is licensed under MIT
// Author: Marioood
// Purpose: custom 'glyph' data type for tileMap layers. just a bitmap image
//

"use strict";

class Glyph {
  width;
  height;
  data;
  //colorFormat: RGBA, RGB
  //palette size: 16, 256, unpalettized
  
  //unpalletized
  //[int width, int height, enum colorFormat, string pixel data]
  
  //palletized
  //[int width, int height, enum colorFormat, int palette size, string palette data, string index data]
  
  constructor(width, height, data) {
    this.width = width;
    this.height = height;
    this.data = data;
  }
  
  setSize(newWidth, newHeight, bg = [0, 0, 0, 0]) {
    let newData = Array(newWidth * newHeight * 4);

    for(let y = 0; y < newHeight; y++) {
      for(let x = 0; x < newWidth; x++) {
        let idxNew = x + y * newWidth;
        if(x < this.width && y < this.height) {
          let idxOld = x + y * this.width;
          newData[idxNew * 4] = this.data[idxOld * 4];
          newData[idxNew * 4 + 1] = this.data[idxOld * 4 + 1];
          newData[idxNew * 4 + 2] = this.data[idxOld * 4 + 2];
          newData[idxNew * 4 + 3] = this.data[idxOld * 4 + 3];
        } else {
          //image is larger than it originally was
          newData[idxNew * 4] = bg[0];
          newData[idxNew * 4 + 1] = bg[1];
          newData[idxNew * 4 + 2] = bg[2];
          newData[idxNew * 4 + 3] = bg[3];
        }
      }
    }
    
    this.data = newData;
    this.width = newWidth;
    this.height = newHeight;
  }
  
  shift(xShift, yShift) {
    let newData = Array(this.width * this.height * 4);
    
    for(let y = 0; y < this.height; y++) {
      for(let x = 0; x < this.width; x++) {
        let idx = x + y * this.width;
        let idxShifted = mod(x - xShift, this.width) + mod(y - yShift, this.height) * this.width;
        newData[idx * 4] = this.data[idxShifted * 4];
        newData[idx * 4 + 1] = this.data[idxShifted * 4 + 1];
        newData[idx * 4 + 2] = this.data[idxShifted * 4 + 2];
        newData[idx * 4 + 3] = this.data[idxShifted * 4 + 3];
      }
    }
    
    this.data = newData;
  }
  
  getPixel(x, y) {
    const idx = (x + y * this.width) * 4;
    return [
      this.data[idx],
      this.data[idx + 1],
      this.data[idx + 2],
      this.data[idx + 3]
    ];
  }
    
  replaceColor(refCol, newCol) {
    for(let y = 0; y < this.height; y++) {
      for(let x = 0; x < this.width; x++) {
        let idx = (x + y * this.width) * 4;
        let curCol = [this.data[idx], this.data[idx + 1], this.data[idx + 2], this.data[idx + 3]];
        if(arrayIsEqualShallow(curCol, refCol)) {
          this.data[idx] = newCol[0];
          this.data[idx + 1] = newCol[1];
          this.data[idx + 2] = newCol[2];
          this.data[idx + 3] = newCol[3];
        }
      }
    }
  }
  
  floodFill(refCol, newCol, startX, startY) {
    //stack overflows happen if these are equal!!!
    if(arrayIsEqualShallow(refCol, newCol)) return;
    const recursiveFill = (x, y) => {
      console.log(`(${x}, ${y})`);
      let idx = (x + y * this.width) * 4;
      this.data[idx] = newCol[0];
      this.data[idx + 1] = newCol[1];
      this.data[idx + 2] = newCol[2];
      this.data[idx + 3] = newCol[3];
          
      let curCol;
      //north
      idx = (x + (y - 1) * this.width) * 4;
      if(this.coordIsValid(x, y - 1)) {
        curCol = [this.data[idx], this.data[idx + 1], this.data[idx + 2], this.data[idx + 3]];
        if(arrayIsEqualShallow(curCol, refCol)) {
          recursiveFill(x, y - 1);
        }
      }
      //east
      idx = (x + 1 + y * this.width) * 4;
      if(this.coordIsValid(x + 1, y)) {
        curCol = [this.data[idx], this.data[idx + 1], this.data[idx + 2], this.data[idx + 3]];
        if(arrayIsEqualShallow(curCol, refCol)) {
          recursiveFill(x + 1, y);
        }
      }
      //south
      idx = (x + (y + 1) * this.width) * 4;
      if(this.coordIsValid(x, y + 1)) {
        curCol = [this.data[idx], this.data[idx + 1], this.data[idx + 2], this.data[idx + 3]];
        if(arrayIsEqualShallow(curCol, refCol)) {
          recursiveFill(x, y + 1);
        }
      }
      //west
      idx = (x - 1 + y * this.width) * 4;
      if(this.coordIsValid(x - 1, y)) {
        curCol = [this.data[idx], this.data[idx + 1], this.data[idx + 2], this.data[idx + 3]];
        if(arrayIsEqualShallow(curCol, refCol)) {
          recursiveFill(x - 1, y);
        }
      }
    };
    
    recursiveFill(startX, startY);
  }
  
  coordIsValid(x, y) {
    if(x >= this.width || x < 0) return false;
    if(y >= this.height || y < 0) return false;
    return true;
  }
  
  serialize() {
    //TODO: test whether or not storing alpha seperately has any impact on compression
    let intData = new Uint32Array(this.width * this.height);
    //TODO: check for alpha
    let isTranslucent = true;
    let colorFormat = isTranslucent ? GLYPH_FMT_RGBA : GLYPH_FMT_RGB;
    
    for(let i = 0; i < this.width * this.height; i++) {
      let idx = i * 4;
      //red
      let intCol = Math.floor(this.data[idx] * 255) << 24;
      //green
      intCol |= Math.floor(this.data[idx + 1] * 255) << 16;
      //blue
      intCol |= Math.floor(this.data[idx + 2] * 255) << 8;
      //alpha
      intCol |= Math.floor(this.data[idx + 3] * 255);
      
      intData[i] = intCol;
    }
    let uniqueColors = new Set();
    
    for(let i = 0; i < this.width * this.height; i++) {
      let curCol = intData[i];
      //.add() already checks if the item is in the set, so no need to check
      uniqueColors.add(curCol);
    }
    console.log(uniqueColors);
    let paletteIndexSize = 0;
    let paletteSize = 0;
    
    if(uniqueColors.size <= 256) {
      if(uniqueColors.size <= 16) {
        paletteIndexSize = 16;
      } else {
        paletteIndexSize = 256;
      }
      paletteSize = uniqueColors.size;
      
      let palette = Array(paletteSize);
      let iterator = uniqueColors.keys();
      let palStackIdx = 0;
      let paletteIndexMap = {};
      let iterStep = iterator.next();
      
      while(!iterStep.done) {
        let curCol = iterStep.value;
        palette[palStackIdx] = curCol;
        paletteIndexMap[curCol] = palStackIdx;
        
        iterStep = iterator.next();
        palStackIdx++;
      }
      
      console.log(palette);
      console.log(paletteIndexMap);
      let indexedData = new Array(this.width * this.height);
      
      for(let i = 0; i < this.width * this.height; i++) {
        indexedData[i] = paletteIndexMap[intData[i]];
      }
      console.log(indexedData);
      console.log(paletteIndexSize);
      
      let serializedIndexData = "";
      let serializedPaletteData = "";
      
      if(paletteIndexSize == 16) {
        for(let i = 0; i < this.width * this.height; i++) {
          let stringIdx = indexedData[i].toString(16);
          serializedIndexData += stringIdx;
        }
        
      } else if(paletteIndexSize == 256) {
        for(let i = 0; i < this.width * this.height; i++) {
          let stringIdx = indexedData[i].toString(16);
          
          if(stringIdx.length == 1) {
            stringIdx = '0' + stringIdx;
          }
          serializedIndexData += stringIdx;
        }
        
      } else {
        console.log("unreachable. palette index cannot be " + paletteIndexSize);
      }
        
      for(let i = 0; i < palette.length; i++) {
        let stringCol = palette[i].toString(16).padStart(8, '0');
        serializedPaletteData += stringCol;
      }
        
      console.log(serializedIndexData);
      console.log(serializedPaletteData);
      
      return [
        this.width,
        this.height,
        colorFormat,
        paletteIndexSize,
        serializedPaletteData,
        serializedIndexData
      ];
      
    } else {
      //unpalettized
      let serializedColorData = "";
      
      for(let i = 0; i < this.width * this.height; i++) {
        let stringCol = intData[i].toString(16).padStart(8, '0');
        
        serializedColorData += stringCol;
      }
      
      return [
        this.width,
        this.height,
        colorFormat,
        serializedColorData
      ];
    }
  }
  
  static deserialize(val) {
    let width = val[0];
    let height = val[1];
    //see top of file to see how val is organized
    if(!Array.isArray(val))
      throw new ProcedrawError(`malformed glyph; val is not an array, but is instead a ${typeof(val)} that looks like: ${val}.`);
      
    const data = new Array(width * height * 4);
    
    if(val.length == 4) {
      this.deserializeUnpalettized(val, data);
      
    } else if(val.length == 6) {
      this.deserializePalettized(val, data);
      
    } else {
      throw new ProcedrawError(`malformed glyph; length of val is ${val.length} instead of 4 or 6.`);
    }
    
    return new Glyph(width, height, data);
  }
  
  static deserializeUnpalettized(val, data) {
    let width = val[0];
    let height = val[1];
    let colorFormat = val[2];
    //unpalettized data
    let hexColorData = segmentString(val[3], 2);
    console.log(hexColorData);
    //raw data is just one big string, so split it into a bunch of hex strings
    if(hexColorData[hexColorData.length - 1].length != 2) {
      //last hex string is NOT 8 characters long (something is wrong!)
      throw new ProcedrawError(`malformed glyph; either in the wrong format, or does not contain color data`);
    }
    
    if(colorFormat == GLYPH_FMT_RGBA) {
      if(hexColorData.length != width * height * 4)
        throw new ProcedrawError(`malformed glyph; width and height do not match the amount of data found. segmented data length: ${hexColorData.length} width: ${width} height: ${height} and expected data length: ${width * height * 4}`);
      
      console.log("parsing rgba");
      
      for(let i = 0; i < hexColorData.length; i++) {
        data[i] = parseInt(hexColorData[i], 16) / 255;
      }
    } else if(colorFormat == GLYPH_FMT_RGB) {
      /*if(hexColorData.length != width * height * 3)
        throw new ProcedrawError(`malformed glyph; width and height do not match the amount of data found. segmented data length: ${hexColorData.length} width: ${width} height: ${height} and expected data length: ${width * height * 3}`);*/

      console.log("parsing rgb minus the a");
      
      for(let i = 0; i < width * height; i++) {
        data[i * 4] = parseInt(hexColorData[i * 3], 16) / 255;
        data[i * 4 + 1] = parseInt(hexColorData[i * 3 + 1], 16) / 255;
        data[i * 4 + 2] = parseInt(hexColorData[i * 3 + 2], 16) / 255;
        data[i * 4 + 3] = 1;
      }
    }
  }
  
  static deserializePalettized(val, data) {
    let width = val[0];
    let height = val[1];
    let colorFormat = val[2];
    
    let paletteSize = val[3];
    let paletteData = segmentString(val[4], 2).map(x => parseInt(x, 16) / 255);
    console.log(paletteData);
    let indices = new Array(width * height);
    
    let hexIndexData;
    
    if(paletteSize == 16)
      hexIndexData = val[5];
    else if(paletteSize == 256)
      hexIndexData = segmentString(val[5], 2);
    else
      throw new ProcedrawError(`malformed glyph; palette size is ${paletteSize} instead of 16 or 256.`);
    
    for(let i = 0; i < indices.length; i++)
      indices[i] = parseInt(hexIndexData[i], 16);
      
    //TODO: sanity checks
    
    if(colorFormat == GLYPH_FMT_RGBA) {
      for(let i = 0; i < width * height; i++) {
        let curIdx = indices[i];
        data[i * 4] = paletteData[curIdx * 4];
        data[i * 4 + 1] = paletteData[curIdx * 4 + 1];
        data[i * 4 + 2] = paletteData[curIdx * 4 + 2];
        data[i * 4 + 3] = paletteData[curIdx * 4 + 3];
      }
    } else if(colorFormat == GLYPH_FMT_RGB) {
      for(let i = 0; i < width * height; i++) {
        let curIdx = indices[i];
        data[i * 4] = paletteData[curIdx * 3];
        data[i * 4 + 1] = paletteData[curIdx * 3 + 1];
        data[i * 4 + 2] = paletteData[curIdx * 3 + 2];
        data[i * 4 + 3] = 1;
      }
    }
  }
}

class BinaryGlyph {
  width;
  height;
  data;
  //colorFormat: 1 or 0
  //[int width, int height, string pixel data]
  
  constructor(width, height, data) {
    this.width = width;
    this.height = height;
    this.data = data;
  }
  
  setSize(newWidth, newHeight) {
    let newData = Array(newWidth * newHeight);

    for(let y = 0; y < newHeight; y++) {
      for(let x = 0; x < newWidth; x++) {
        let idxNew = x + y * newWidth;
        if(x < this.width && y < this.height) {
          let idxOld = x + y * this.width;
          newData[idxNew] = this.data[idxOld];
        } else {
          //image is larger than it originally was
          newData[idxNew] = 0;
        }
      }
    }
    
    this.data = newData;
    this.width = newWidth;
    this.height = newHeight;
  }
  
  shift(xShift, yShift) {
    let newData = Array(this.width * this.height);
    
    for(let y = 0; y < this.height; y++) {
      for(let x = 0; x < this.width; x++) {
        let idx = x + y * this.width;
        let idxShifted = mod(x - xShift, this.width) + mod(y - yShift, this.height) * this.width;
        newData[idx] = this.data[idxShifted];
      }
    }
    
    this.data = newData;
  }
  
  getPixel(x, y) {
    return this.data[x + y * this.width];
  }
  
  serialize() {
    let hexData = "";
    let nybbleCount = Math.floor(this.width * this.height / 4);
    let nybbleRem = this.width * this.height % 4;
    for(let n = 0; n < nybbleCount; n++) {
      let curNybble = 0;
      for(let i = 0; i < 4; i++) {
        let idx = i + n * 4;
        curNybble |= this.data[idx] << i;
      }
      hexData += curNybble.toString(16);
    }
    if(nybbleRem > 0) {
      let partialNybble = 0;
      for(let i = 0; i < nybbleRem; i++) {
        let idx = i + nybbleCount * 4;
        partialNybble |= this.data[idx] << i;
      }
      hexData += partialNybble.toString(16);
    }
    
    return [this.width, this.height, hexData];
  }
  
  static deserialize(val) {
    let newWidth = val[0];
    let newHeight = val[1];
    const retroData = val[2];
    const newData = new Array(newWidth * newHeight);
    const nybbleCount = Math.floor(newWidth * newHeight / 4);
    const nybbleRem = newWidth * newHeight % 4;
    for(let n = 0; n < nybbleCount; n++) {
      let curNybble = parseInt(retroData[n], 16);
      for(let i = 0; i < 4; i++) {
        const idx = i + n * 4;
        newData[idx] = (curNybble & (1 << i)) >> i;
      }
    }
    let partNybble = parseInt(retroData[nybbleCount], 16);
    for(let i = 0; i < nybbleRem; i++) {
      const idx = i + nybbleCount * 4;
      newData[idx] = (partNybble & (1 << i)) >> i;
    }
    return new BinaryGlyph(newWidth, newHeight, newData);
  }
}
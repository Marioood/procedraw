//
// All Procedraw material is licensed under MIT
// Author: Marioood
// Purpose: custom data type for layers to use. allows users to have input based on  pixel count or the dimensions of the image
//

"use strict";

class UnitLength {
  //ALL FUNCTIONS IN THIS CLASS __HAVE__ TO BE STATIC; OTHERWISE, LAYER DUPLICATION WILL NOT WORK
  value;
  unit;
  //lengthType;
  
  constructor(value, unit) {
    this.value = value;
    this.unit = unit;
    //this.lengthType = lengthType;
  }
  //returns the current length (in pixels)
  static getLength(unitLength, maxLength, isRounded) {
    let length;
    
    switch(unitLength.unit) {
      case UNIT_PIXELS:
        length = unitLength.value;
        break;
      case UNIT_PERCENTAGE:
        length = unitLength.value / 100 * maxLength;
        break;
      default:
        console.error("error in 'getLength()': unknown unit " + unitLength.unit);
        length = 0;
        break;
    }
    if(length == NaN) {
      alert("unit length returned as not a number (!!!)\n\n" + unitLength);
      return 1;
    }
    if(isRounded) {
      return Math.floor(length);
    } else {
      return length;
    }
  }
  //returns the name of the current unit
  static getUnitText(unitLength) {
    switch(unitLength.unit) {
      case UNIT_PIXELS:
        return "pixels";
      case UNIT_PERCENTAGE:
        return "%";
      default:
        console.error("error in 'getUnitText()': unknown unit " + unitLength.unit);
        return "undefined";
    }
  }
}
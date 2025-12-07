//
// All Procedraw material is licensed under MIT
// Author: Marioood
// Purpose: big balls in your mouth good night... termites!!!!
//

"use strict";

class IndexedMap {
  //list of indices in the layers array. used for filter layers, so that their base layers don't change
  keys = []; //key -> value
  //indexes in keys that are not being used
  freed = [];
  
  free() {
    this.keys = [];
    this.freed = [];
  }
}
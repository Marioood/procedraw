"use strict";

onmessage = (e) => {
  switch(e.data[0]) {
    case "render":
      threadedRender(e.data[1]);
      break;
  }
}

function threadedRender(img) {
}
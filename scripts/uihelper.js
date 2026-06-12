//
// All Procedraw material is licensed under MIT
// Author: Marioood
// Purpose: very simple "framework" (ew...) to make intermingling js with html slightly more bearable. somewhat inspired, but not really like gretcha.js by Tsoding (https://github.com/tsoding/grecha.js)
//
"use strict";
//TODO: cut down on these wrapper functions, a lot of them are not very useful and are only used twice
function Tag(tagName, className) {
  let tag = document.createElement(tagName);
  if(className != undefined) {
      tag.className = className;
  }
  return tag;
}
function Br(className) {
  return Tag("br", className);
}
function Text(text, className) {
  let span = Tag("span", className);
  span.innerText = text;
  return span;
}
function divWrap(...tags) {
  let div = Tag("div");
  let i = 0;
  //hack to have the args be (...tags) OR (className, ...tags)
  //operator overloading wouldn't work because you can't require specific types in javascript
  if(typeof(tags[0]) == "string") {
      i++;
      div.className = tags[0];
  }
  for(; i < tags.length; i++) {
      div.appendChild(tags[i]);
  }
  return div;
}
function Button(text, onclick, className) {
  let button = Tag("button", className);
  button.innerText = text;
  button.onclick = onclick;
  return button;
}
function Input(type, value, oninput, className) {
  let input = Tag("input", className);
  input.type = type;
  input.oninput = oninput;
  input.value = value;
  return input;
}
function InputRange(min, max, value, oninput, className) {
  let range = Input("range", value, oninput, className);
  range.min = min;
  range.max = max;
  return range;
}
function Label(text, className) {
  let label = Tag("label", className);
  label.innerText = text;
  return label;
}
function InputNumber(min, max, value, oninput, className) {
  let input = Input("number", value, oninput, className);
  input.min = min;
  input.max = max;
  return input;
}
function InputText(value, oninput, className) {
  let input = Input("text", value, oninput, className);
  return input;
}
function InputCheckbox(value, oninput) {
  //normal checkbox inputs are annoying to style, so dont bother with em
  let checked = value;
  
  const input = Button("", (e) => {
    checked = !checked;
    if(checked) {
      e.target.classList = "aero-btn checkbox-true";
    } else {
      e.target.classList = "aero-btn checkbox-false";
    }
    oninput(checked, e);
  }, (checked) ? "aero-btn checkbox-true" : "aero-btn checkbox-false");
  return input;
}
function Textarea(hint, oninput, className) {
  const textarea = Tag("textarea", className);
  textarea.placeholder = hint;
  textarea.oninput = oninput;
  return textarea;
}
function Td(child, className) {
  const td = Tag("td", className);
  if(child != undefined) {
    td.appendChild(child);
  }
  return td;
}
function Tr(...tags) {
  let tr = Tag("tr");
  //hack to have the args be (...tags) OR (...tags, className)
  //operator overloading wouldn't work because you can't require specific types in javascript
  if(typeof(tags[tags.length - 1]) == "string") {
      tr.className = tags.pop();
  }
  for(let i = 0; i < tags.length; i++) {
      tr.appendChild(tags[i]);
  }
  return tr;
}
function Table(...tags) {
  let table = Tag("table");
  //hack to have the args be (...tags) OR (...tags, className)
  //operator overloading wouldn't work because you can't require specific types in javascript
  let end = tags.length;
  if(typeof(tags[tags.length - 1]) == "string") {
      table.className = tags.pop();
      end--;
  }
  for(let i = 0; i < end; i++) {
      table.appendChild(tags[i]);
  }
  return table;
}
function DynamicDownloadButton(name, getBlob, getFileName, className) {
  const saveFileLink = document.createElement("a");
  const saveFileInput = document.createElement("button");
  
  saveFileInput.innerText = name;
  saveFileInput.className = className;
  saveFileLink.href = "dummy";
  saveFileLink.download = "dummy";
  
  let blobURL = "";
  
  saveFileInput.onmousedown = (e) => {
    document.body.style.cursor = "wait";
    try {
      const blob = getBlob();
      blobURL = URL.createObjectURL(blob);
      saveFileLink.href = blobURL;
      saveFileLink.download = getFileName();
    } catch(ex) {
      alert(ex);
      e.preventDefaults();
    }
    document.body.style.cursor = "auto";
  }
  saveFileLink.onmouseup = (e) => {
    URL.revokeObjectURL(blobURL);
  }
  saveFileLink.appendChild(saveFileInput);
  return saveFileLink;
}

function setTitle(text) {
  const title = document.getElementsByTagName("title")[0];
  title.textContent = "procedraw | " + text;
}
//sets an element's attribute and returns the element
//Purpose: makes code a little more concise, because i dont have to declare as many variables when i want a somewhat complicated element wrapped in a div or table
function setAttr(elem, attr, value) {
  elem.setAttribute(attr, value);
  
  return elem;
}
//Purpose: kill children. used for recreating the layer options (i think) and recreating the layer list
function killChildren(container) {
  while(container.firstChild) {
    container.removeChild(container.lastChild);
  }
}
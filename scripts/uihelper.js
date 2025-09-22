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

//very simple "framework" (ew...) to make intermingling js with html slightly more bearable
//somewhat inspired, but not really like gretcha.js by Tsoding (https://github.com/tsoding/grecha.js)

//TODO: cut down on these wrapper functions, a lot of them are not very useful and are only used twice
function Tag(tagName, className) {
  let tag = document.createElement(tagName);
  if(className != undefined) {
      tag.className = className;
  }
  return tag;
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
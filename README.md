# Procedraw
A work in progress procedural image editor.

## Usage
If you want to run Procedraw on the interwebs, just go to https://marioood.github.io/procedraw.

If you're wanting to run Procedraw locally, just git clone the repo (or however you download git repositories) and run index.html.

If you want to create some custom layers or whatever, check out scripts/layers.js.

### Warning
This is by no means finished. Don't expect saved images to work in future versions. (I ain't doing backwards compatability for something that's unfinished!)

### License
This website's code, assets, and whatever are licensed under MIT.

## Layer Design Guide
This isn't really for people using the program, but for people making it (me and pretty much only me).

Guide for layers:
* Don't use unintended behavior (negative alpha, invalid colors, etc.)
  * Although, don't prevent users from using unintended behavior (unless it literally crashes the browser)
* Layer options should be independent from resolution, especially for spaced out patterns (see blobs, wandering, or worley)
* Mark ANY parameter that controls a loop as unsafe (see blobs or wandering)
    * Doing so could cause insane lag if the user isn't careful (!!!)
  * Also make sure parameters don't cause infinite loops (set proper mins and maxes)
    
## TODO's
* Rewrite tether.js using color picker style code (custom framework)
* "outsource rendering to china" once again after most of the code is refactored (add back web worker rendering)
    * Doesn't work properly and throws a bunch of errors when testing offline
* Reorganize code
* Optimize layer rendering
* Anime woman mascot
* Look into the legality of using an MIT license with modified W3C assets
  * I am unable to find license/legal info on those specific images (the closest thing was https://www.w3.org/policies/logos/)
    * Can I edit parts of them? Can I include them in an MIT licensed project? Who knows!
    
## Code Style Guide
* 2 spaces per tab
* semicolons after every line
* "use strict"; at the top of every file
* Absolutely NO stolen code, or code written by or with the aid of AI
* Credit where you get algorithms/snippets of code above where you use them
* No external libraries
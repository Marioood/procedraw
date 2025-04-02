# procedraw
A procedural image editor.

## link
https://marioood.github.io/procedraw

## warning
This is by no means finished. Don't expect saved images to work in future versions. (I ain't doing backwards compatability for something that's unfinished!)

## layer design guide
This isn't really for people using the program, but for people making it (me and pretty much only me).

Guide for layers:
* Don't use unintended behavior (negative alpha, invalid colors, etc.)
	* Although, don't prevent users from using unintended behavior (unless it literally crashes the browser)
* Layer options should be independent from resolution, especially for spaced out patterns (see blobs, wandering, or worley)
* Mark ANY parameter that controls a loop as unsafe (see blobs or wandering)
    * Doing so could cause insane lag if the user isn't careful (!!!)
	* Also make sure parameters don't cause infinite loops (set proper mins and maxes)
    
TODO's:
* New color picker
* Rewrite tether.js using color picker style code (custom framework)
* "outsource rendering to china" once again after most of the code is refactored (add back web worker rendering)
    * Doesn't work properly and throws a bunch of errors when testing offline
* Reorganize code
* Optimize layer rendering
* Standardize code to use 2 spaces for every 1 tab

unorganized todos
 
blend types for layer interpolation (e.g. border corners, vornoi noise)
link layer that copies another layer's pixels and modifies them
filter layer that modifies the current cavnas' pixels
value noise layer
perlin noise layer
give the solid layer similar options to border layer
save as file
image layer that has is an embedded image
remove external dependencies
new color picker
make ImageManager.combinePixel use CONSTANTS instead of "strings" and test performance
move RGB2Hex() and other similar functions to a global helper.js file -- no external libraries are ever gonna be used so it shouldnt matter
make killAllChildren() and other similar functions global in tether.js, and make tether.js just be html--js interaction functions
ctrl + scroll to zoom in and out
scroll to move up and down
shift + scroll to move left and right
frutiger aero ui -- stuff can look crappy as long as it's also interesting
save stuff in cookies (?)
"use strict" can help clean up sloppy code
better width and height customization (set limit, with warning)
remove bitwise functions -- faster
only have one color picker -- having a bunch of them per color input isn't ideal (DO LATER)
god layer
future me here. what the fuck is a god layer?
test browser support (and provide appropriate taxes)
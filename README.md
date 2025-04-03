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
* Rewrite tether.js using color picker style code (custom framework)
* "outsource rendering to china" once again after most of the code is refactored (add back web worker rendering)
    * Doesn't work properly and throws a bunch of errors when testing offline
* Reorganize code
* Optimize layer rendering
* Standardize code to use 2 spaces for every 1 tab

unorganized todos
 
blend types for layer interpolation (e.g. border corners, vornoi noise) "mix types"
link layer that copies another layer's pixels and modifies them
filter layer that modifies the current cavnas' pixels
value noise layer
perlin noise layer
give the solid layer similar options to border layer
save as file
image layer that has is an embedded image
remove external dependencies
make killAllChildren() and other similar functions global in tether.js, and make tether.js just be html--js interaction functions
ctrl + scroll to zoom in and out
scroll to move up and down
shift + scroll to move left and right
frutiger aero ui -- stuff can look crappy as long as it's also interesting
save stuff in cookies (?)
"use strict" can help clean up sloppy code
better width and height customization (set limit, with warning)
god layer
future me here. what the fuck is a god layer?
test browser support (and provide appropriate taxes)
add title bar
save authors
option limit skeletons (for documentation)
//could be a "map" filter?
color picker sometimes doesnt reprint the image when youre done changing it
//NEW goalz
//hex codes in color input
//shown option changes eye button
//take a break! work on the programmer art thing
//overlap option (see wandering lines)
//brightness tolerance
//img.blend function is broken! when the col1 alpha smaller than col0 thing look weird
//the set color function sucked it was like 4 times slower
//later
//snap image editor
//layer link
//color ramp
//tiled view
//variables and math expressions
//filters (?) they seem kinda slow.....
	//layer tiling periods, layer offsets
	//scale + normalized scale (like xor fractal)
	//plot filters (only change the output of plotPixel()) dont seem like they'd be slow
//perlin noise
//DONT SLAP MORE SHIT ONTO SHIT
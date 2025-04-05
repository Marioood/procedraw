# Procedraw
A work in progress procedural image editor.

## Link
https://marioood.github.io/procedraw

## Warning
This is by no means finished. Don't expect saved images to work in future versions. (I ain't doing backwards compatability for something that's unfinished!)

## Layer Design Guide
This isn't really for people using the program, but for people making it (me and pretty much only me).

Guide for layers:
* Don't use unintended behavior (negative alpha, invalid colors, etc.)
	* Although, don't prevent users from using unintended behavior (unless it literally crashes the browser)
* Layer options should be independent from resolution, especially for spaced out patterns (see blobs, wandering, or worley)
* Mark ANY parameter that controls a loop as unsafe (see blobs or wandering)
    * Doing so could cause insane lag if the user isn't careful (!!!)
	* Also make sure parameters don't cause infinite loops (set proper mins and maxes)
    
## TODO's:
* Rewrite tether.js using color picker style code (custom framework)
* "outsource rendering to china" once again after most of the code is refactored (add back web worker rendering)
    * Doesn't work properly and throws a bunch of errors when testing offline
* Reorganize code
* Optimize layer rendering
* Standardize code to use 2 spaces for every 1 tab
* Anime woman mascot

This website's code, assets, and whatever are licensed under MIT.
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
* Layer types should be independent from resolution, especially for spaced out patterns (see blobs, wandering, or worley)
* Mark ANY parameter that controls a loop as unsafe (see blobs or wandering)
	* Also make sure parameters don't cause infinite loops (set proper mins and maxes)
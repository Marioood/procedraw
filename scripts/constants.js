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

//All constants (enums, patterns for whatever, etc.) are stored here to make the code a bit less cluttered

//TODO: move some stuff from the Tether class to here
//TODO: move some stuff from the Serialization class to here


//////// PROGRAM INFO ////////
PD_VERSION = "VOLATILE 0.9"; //scarily close to 1.0
//this gets changed when the SAVE FORMAT is changed, not when layer paramters are changed
//do not change until Procedraw exits the VOLATILE stage of development  
PD_SAVE_FORMAT = 0;
  
//////// OPTION ENUMS ////////

//NEVER change these values!
//they are used in save files, so changing them WILL break save files!!!
const O_FADE_NONE = 0;
const O_FADE_NEAR_END = 1;
const O_FADE_NEAR_START = 2;
const O_FADE_NEAR_END_SQUARED = 3;
const O_FADE_NEAR_START_SQUARED = 4;
const O_FADE_NEAR_END_SQRT = 5;
const O_FADE_NEAR_START_SQRT = 6;

const O_WRAP = 0;
const O_CLAMP = 1;
const O_VOID = 2;
const O_REFLECT = 3;

const O_MASK_GREATER_THAN = 0;
const O_MASK_LESS_THAN = 1;
const O_MASK_EQUAL_TO = 2;
const O_MASK_NOT_EQUAL_TO = 3;
const O_MASK_GREATER_THAN_OR_EQUAL_TO = 4;
const O_MASK_LESS_THAN_OR_EQUAL_TO = 5;

const O_EASE_LINEAR = 0;
const O_EASE_SQUARE = 1;
const O_EASE_INVERSE_SQUARE = 2;
const O_EASE_COSINE = 3;

const O_BLUR_BOX = 0;
const O_BLUR_BOKEH = 1;
const O_BLUR_GAUSSIAN = 2;

const O_METRIC_EUCLIDEAN = 0;
const O_METRIC_TAXICAB = 1;
const O_METRIC_CHEBYSHEV = 2;
const O_METRIC_INVERSE_EUCLIDEAN = 3;
const O_METRIC_SQUARE_OIL = 4;

const O_ORACLE_NONE = 0;
const O_ORACLE_GOD = 1;
const O_ORACLE_MONKEY = 2;
const O_ORACLE_MAZE = 3;
const O_ORACLE_NUMBERS = 4;
const O_ORACLE_LETTERS = 5;

const O_CASE_NONE = 0;
const O_CASE_UPPER = 1;
const O_CASE_LOWER = 2;
const O_CASE_INVERTED = 3;
const O_CASE_LEET = 4;
const O_CASE_SPONGE = 5;

const O_FUNCTION_CLAMP = 0;
const O_FUNCTION_WRAP = 1;
const O_FUNCTION_NORMALIZE = 2;
const O_FUNCTION_SQRT = 3;
const O_FUNCTION_POWER = 4;

//////// BLEND/MIX ENUMS AND TABLES ////////

//NEVER change these values!
//they are used in save files, so changing them WILL break save files!!!
const O_BLEND_ADD = 0;
const O_BLEND_MULTIPLY = 1;
const O_BLEND_PLAIN = 2;
const O_BLEND_SCREEN = 3;
const O_BLEND_OVERLAY = 4;
const O_BLEND_SUBTRACT = 5;
const O_BLEND_CHANNEL_DISSOLVE = 6;
const O_BLEND_DISSOLVE = 7;
const O_BLEND_SHIFT_OVERLAY = 8;
const O_BLEND_OVERBLOWN_TEST = 9;
const O_BLEND_BAYER = 10;
const O_BLEND_HALFTONE = 11;
const O_BLEND_HSV_HUE = 12;
const O_BLEND_HSV_SATTY = 13;
const O_BLEND_XOR = 14;

const COUNT_BLEND_MODES = 15;

assert(COUNT_BLEND_MODES == 15, "plotPixel() expects 15 blend modes");
       
const O_MIX_PLAIN = 0;
const O_MIX_HALF = 1;
const O_MIX_RANDOM = 2;
const O_MIX_BAYER = 3;
const O_MIX_HALFTONE = 4;
const O_MIX_DAFT_X = 5;
const O_MIX_DAFT_Y = 6;
const O_MIX_HALF_DITHER = 7;

const O_INTERP_NEAREST = 0;
const O_INTERP_BILINEAR = 1;
const O_INTERP_BILINEAR_COS = 2;

//the layer keys technically aren't options, but are also technically options
const KEY_FREED = -1;
const KEY_CANVAS = -2;

//https://en.wikipedia.org/wiki/Ordered_dithering
//be happy that i manually aligned the tables... it looks pretty
//these tables AREN'T options, so they are not prefixed with O_
const BLEND_TABLE_BAYER = [
  0,      0.5,    0.125,  0.625,
  0.75,   0.25,   0.875,  0.375,
  0.1875, 0.6875, 0.0625, 0.5625,
  0.9375, 0.4375, 0.8125, 0.3125
];

const BLEND_TABLE_HALFTONE = [
  0.9375, 0.875, 0.75,  0.625,  0.625,  0.75,  0.875, 0.9375,
  0.875,  0.75,  0.625, 0.5,    0.5,    0.625, 0.75,  0.875,
  0.75,   0.625, 0.5,   0.25,   0.25,   0.5,   0.625, 0.75,
  0.625,  0.5,   0.25,  0,      0.0625, 0.25,  0.5,   0.625,
  0.625,  0.5,   0.25,  0.0625, 0.0625, 0.25,  0.5,   0.625,
  0.75,   0.625, 0.5,   0.25,   0.25,   0.5,   0.625, 0.75,
  0.875,  0.75,  0.625, 0.5,    0.5,    0.625, 0.75,  0.875,
  0.9375, 0.875, 0.75,  0.625,  0.625,  0.75,  0.875, 0.9375
];
 

//////// OPTION LIMITS ////////
assert(COUNT_BLEND_MODES == 15, "LIMITS_BLEND expects 15 blend modes");

const LIMITS_BLEND = {
  type: "keyvalues",
  keys: [
    "plain",
    "add",
    "multiply",
    "subtract",
    "screen",
    "overlay",
    "shift overlay",
    "HSV hue",
    "HSV satty",
    "dissolve",
    "channel dissolve",
    "bayer",
    "halftone",
    "xor",
    "(DEBUG) overblown test"
  ],
  values: [
    O_BLEND_PLAIN,
    O_BLEND_ADD,
    O_BLEND_MULTIPLY,
    O_BLEND_SUBTRACT,
    O_BLEND_SCREEN,
    O_BLEND_OVERLAY,
    O_BLEND_SHIFT_OVERLAY,
    O_BLEND_HSV_HUE,
    O_BLEND_HSV_SATTY,
    O_BLEND_DISSOLVE,
    O_BLEND_CHANNEL_DISSOLVE,
    O_BLEND_BAYER,
    O_BLEND_HALFTONE,
    O_BLEND_XOR,
    O_BLEND_OVERBLOWN_TEST
  ]
}

const LIMITS_MIX = {
  type: "keyvalues",
  keys: [
    "plain",
    "hard 50%",
    "random",
    "bayer",
    "halftone",
    "daft (horizontal)",
    "daft (vertical)",
    "dither 50%"
  ],
  values: [
    O_MIX_PLAIN,
    O_MIX_HALF,
    O_MIX_RANDOM,
    O_MIX_BAYER,
    O_MIX_HALFTONE,
    O_MIX_DAFT_X,
    O_MIX_DAFT_Y,
    O_MIX_HALF_DITHER
  ]
}

const LIMITS_INTERP = {
  type: "keyvalues",
  keys: [
    "nearest neighbo(u)r",
    "bilinear",
    "bilinear (cosine easing)"
  ],
  values: [
    O_INTERP_NEAREST,
    O_INTERP_BILINEAR,
    O_INTERP_BILINEAR_COS
  ]
}

//////// FONTS ////////

//8x8 monospace atari and commodore 64 inspired font
//space is not drawn, any other character is drawn. 'M' is used because it is the closest ascii char to a square
const GLYPHS_CLASCII = {
  unknown: [
    "MMMMMMMM",
    "MM    MM",
    "M  MM  M",
    "MMMM  MM",
    "MMM  MMM",
    "MMMMMMMM",
    "MMM  MMM",
    "MMMMMMMM"
  ],
  A: [
    " MMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MMMMMMM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "        "
  ],
  B: [
    "MMMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MMMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MMMMMM  ",
    "        "
  ],
  C: [
    " MMMMM  ",
    "MM   MM ",
    "MM      ",
    "MM      ",
    "MM      ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  D: [
    "MMMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MMMMMM  ",
    "        "
  ],
  E: [
    "MMMMMMM ",
    "MM      ",
    "MM      ",
    "MMMMM   ",
    "MM      ",
    "MM      ",
    "MMMMMMM ",
    "        "
  ],
  F: [
    "MMMMMMM ",
    "MM      ",
    "MM      ",
    "MMMMM   ",
    "MM      ",
    "MM      ",
    "MM      ",
    "        "
  ],
  G: [
    " MMMMM  ",
    "MM   MM ",
    "MM      ",
    "MM MMMM ",
    "MM   MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  H: [
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MMMMMMM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "        "
  ],
  I: [
    "MMMMMM  ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "MMMMMM  ",
    "        "
  ],
  J: [
    "     MM ",
    "     MM ",
    "     MM ",
    "     MM ",
    "     MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  K: [
    "MM   MM ",
    "MM  MM  ",
    "MM MM   ",
    "MMMM    ",
    "MM MM   ",
    "MM  MM  ",
    "MM   MM ",
    "        "
  ],
  L: [
    "MM      ",
    "MM      ",
    "MM      ",
    "MM      ",
    "MM      ",
    "MM      ",
    "MMMMMMM ",
    "        "
  ],
  M: [
    "MM   MM ",
    "MMM MMM ",
    "MMMMMMM ",
    "MM M MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "        "
  ],
  N: [
    "MM   MM ",
    "MMM  MM ",
    "MMMM MM ",
    "MM MMMM ",
    "MM  MMM ",
    "MM   MM ",
    "MM   MM ",
    "        "
  ],
  O: [
    " MMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  P: [
    "MMMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MMMMMM  ",
    "MM      ",
    "MM      ",
    "MM      ",
    "        "
  ],
  Q: [
    " MMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM  MM  ",
    " MMM MM ",
    "        "
  ],
  R: [
    "MMMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MMMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "        "
  ],
  S: [
    " MMMMM  ",
    "MM   MM ",
    "MM      ",
    " MMMMM  ",
    "     MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  T: [
    "MMMMMM  ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "        "
  ],
  U: [
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  V: [
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    " MM MM  ",
    "  MMM   ",
    "   M    ",
    "        "
  ],
  W: [
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM M MM ",
    "MM M MM ",
    "MM M MM ",
    " MM MM  ",
    "        "
  ],
  X: [
    "MM  MM  ",
    "MM  MM  ",
    " MMMM   ",
    "  MM    ",
    " MMMM   ",
    "MM  MM  ",
    "MM  MM  ",
    "        "
  ],
  Y: [
    "MM  MM  ",
    "MM  MM  ",
    " MMMM   ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "        "
  ],
  Z: [
    "MMMMMMM ",
    "    MM  ",
    "   MM   ",
    "  MM    ",
    " MM     ",
    "MM      ",
    "MMMMMMM ",
    "        "
  ],
  '.': [
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "   MM   ",
    "   MM   ",
    "        "
  ],
  ',': [
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "   MM   ",
    "   MM   ",
    "  MM    "
  ],
  '/': [
    "      MM",
    "     MM ",
    "    MM  ",
    "   MM   ",
    "  MM    ",
    " MM     ",
    "MM      ",
    "M       "
  ],
  '\\': [
    "MM      ",
    " MM     ",
    "  MM    ",
    "   MM   ",
    "    MM  ",
    "     MM ",
    "      MM",
    "       M"
  ],
  '$': [
    "   M    ",
    " MMMMM  ",
    "MM M MM ",
    " MMM    ",
    "   MMM  ",
    "MM M MM ",
    " MMMMM  ",
    "   M    "
  ],
  '0': [
    " MMMMM  ",
    "MMM  MM ",
    "MMMM MM ",
    "MM MMMM ",
    "MM  MMM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  '1': [
    " MMM    ",
    "MMMM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "MMMMMM  ",
    "        "
  ],
  '2': [
    " MMMM   ",
    "MM  MM  ",
    "    MM  ",
    "   MM   ",
    "  MM    ",
    " MM     ",
    "MMMMMM  ",
    "        "
  ],
  '3': [
    " MMMMM  ",
    "MM   MM ",
    "     MM ",
    "   MMM  ",
    "     MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  '4': [
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MMMMMMM ",
    "     MM ",
    "     MM ",
    "     MM ",
    "        "
  ],
  '5': [
    "MMMMMMM ",
    "MM      ",
    "MM      ",
    " MMMMM  ",
    "     MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  '6': [
    " MMMMM  ",
    "MM   MM ",
    "MM      ",
    "MMMMMM  ",
    "MM   MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  '7': [
    "MMMMMMM ",
    "     MM ",
    "    MM  ",
    "   MM   ",
    "  MM    ",
    " MM     ",
    "MM      ",
    "        "
  ],
  '8': [
    " MMMMM  ",
    "MM   MM ",
    "MM   MM ",
    " MMMMM  ",
    "MM   MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  '9': [
    " MMMMM  ",
    "MM   MM ",
    "MM   MM ",
    " MMMMMM ",
    "     MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  '-': [
    "        ",
    "        ",
    "        ",
    "MMMMMMM ",
    "        ",
    "        ",
    "        ",
    "        "
  ],
  '+': [
    "   M    ",
    "   M    ",
    "   M    ",
    "MMMMMMM ",
    "   M    ",
    "   M    ",
    "   M    ",
    "        "
  ],
  '*': [
    "   M    ",
    " MMMMM  ",
    "  MMM   ",
    " MMMMM  ",
    "   M    ",
    "        ",
    "        ",
    "        "
  ],
  '^': [
    "   M    ",
    "  MMM   ",
    " MM MM  ",
    " M   M  ",
    "        ",
    "        ",
    "        ",
    "        "
  ],
  '&': [
    " MMM    ",
    "MM MM   ",
    "MM MM M ",
    " MMMMMM ",
    "MM   MM ",
    "MM  MM  ",
    " MMM MM ",
    "        "
  ],
  '%': [
    "MM    M ",
    "MM   MM ",
    "    MM  ",
    "   MM   ",
    "  MM    ",
    " MM  MM ",
    "MM   MM ",
    "        "
  ],
  '!': [
    "   MM   ",
    "  MMMM  ",
    "  MMMM  ",
    "   MM   ",
    "   MM   ",
    "        ",
    "   MM   ",
    "        "
  ],
  '?': [
    "  MMMM  ",
    " MM  MM ",
    "     MM ",
    "    MM  ",
    "   MM   ",
    "        ",
    "   MM   ",
    "        "
  ],
  '=': [
    "        ",
    "        ",
    "MMMMMMM ",
    "        ",
    "MMMMMMM ",
    "        ",
    "        ",
    "        "
  ],
  '_': [
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "MMMMMMMM",
    "        "
  ],
  '"': [
    "  MM MM ",
    "  MM MM ",
    " MM MM  ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        "
  ],
  '\'': [
    "   MM   ",
    "   MM   ",
    "  MM    ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        "
  ],
  '`': [
    "  MM    ",
    "   MM   ",
    "    MM  ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        "
  ],
  '~': [
    "        ",
    "        ",
    " MM     ",
    "MMMM  M ",
    "M  MMMM ",
    "    MM  ",
    "        ",
    "        "
  ],
  '|': [
    "   MM   ",
    "   MM   ",
    "   MM   ",
    "   MM   ",
    "   MM   ",
    "   MM   ",
    "   MM   ",
    "   MM   "
  ],
  ':': [
    "   MM   ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "   MM   ",
    "        "
  ],
  ';': [
    "   MM   ",
    "        ",
    "        ",
    "        ",
    "        ",
    "   MM   ",
    "   MM   ",
    "  MM    "
  ],
  '(': [
    "   MMM  ",
    "  MM    ",
    " MM     ",
    " MM     ",
    " MM     ",
    "  MM    ",
    "   MMM  ",
    "        "
  ],
  ')': [
    "  MMM   ",
    "    MM  ",
    "     MM ",
    "     MM ",
    "     MM ",
    "    MM  ",
    "  MMM   ",
    "        "
  ],
  '[': [
    " MMMMM  ",
    " MM     ",
    " MM     ",
    " MM     ",
    " MM     ",
    " MM     ",
    " MMMMM  ",
    "        "
  ],
  ']': [
    "  MMMMM ",
    "     MM ",
    "     MM ",
    "     MM ",
    "     MM ",
    "     MM ",
    "  MMMMM ",
    "        "
  ],
  '{': [
    "   MMM  ",
    "  MM    ",
    "  MM    ",
    "MM      ",
    "  MM    ",
    "  MM    ",
    "   MMM  ",
    "        "
  ],
  '}': [
    "  MMM   ",
    "    MM  ",
    "    MM  ",
    "      MM",
    "    MM  ",
    "    MM  ",
    "  MMM   ",
    "        "
  ],
  '<': [
    "    MM  ",
    "   MM   ",
    "  MM    ",
    " MM     ",
    "  MM    ",
    "   MM   ",
    "    MM  ",
    "        "
  ],
  '>': [
    "  MM    ",
    "   MM   ",
    "    MM  ",
    "     MM ",
    "    MM  ",
    "   MM   ",
    "  MM    ",
    "        "
  ],
  '#': [
    "        ",
    " MM MM  ",
    "MMMMMMM ",
    " MM MM  ",
    " MM MM  ",
    "MMMMMMM ",
    " MM MM  ",
    "        "
  ],
  '@': [
    " MMMMM  ",
    "MM   MM ",
    "MM M MM ",
    "MM MMMM ",
    "MM      ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  a: [
    "        ",
    "        ",
    "  MMMM  ",
    " MM  MM ",
    "MM   MM ",
    "MM  MM  ",
    " MMM MM ",
    "        "
  ],
  b: [
    "MM      ",
    "MM      ",
    "MM      ",
    "MMMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MMMMMM  ",
    "        "
  ],
  c: [
    "        ",
    "        ",
    " MMMMM  ",
    "MM   MM ",
    "MM      ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  d: [
    "     MM ",
    "     MM ",
    "     MM ",
    " MMMMMM ",
    "MM   MM ",
    "MM   MM ",
    " MMMMMM ",
    "        "
  ],
  e: [
    "        ",
    "        ",
    " MMMMM  ",
    "MM   MM ",
    "MMMMMMM ",
    "MM      ",
    " MMMMM  ",
    "        "
  ],
  f: [
    "  MMMM  ",
    " MM  MM ",
    " MM     ",
    "MMMMM   ",
    " MM     ",
    " MM     ",
    " MM     ",
    "        "
  ],
  g: [
    "        ",
    "        ",
    " MMMMM  ",
    "MM   MM ",
    "MM   MM ",
    " MMMMMM ",
    "     MM ",
    "MMMMMM  "
  ],
  h: [
    "MM      ",
    "MM      ",
    "MM      ",
    "MMMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "        "
  ],
  i: [
    "  MM    ",
    "        ",
    "MMMM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "MMMMMM  ",
    "        "
  ],
  j: [
    "     MM ",
    "        ",
    "     MM ",
    "     MM ",
    "     MM ",
    "     MM ",
    "MM   MM ",
    " MMMMM  "
  ],
  k: [
    "MM      ",
    "MM  MM  ",
    "MM MM   ",
    "MMMM    ",
    "MM MM   ",
    "MM  MM  ",
    "MM   MM ",
    "        "
  ],
  l: [
    "MMMM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "MMMMMM  ",
    "        "
  ],
  m: [
    "        ",
    "        ",
    "M M MM  ",
    "MM M MM ",
    "MM M MM ",
    "MM M MM ",
    "MM M MM ",
    "        "
  ],
  n: [
    "        ",
    "        ",
    "MM MMM  ",
    "MMM  MM ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "        "
  ],
  o: [
    "        ",
    "        ",
    " MMMMM  ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    " MMMMM  ",
    "        "
  ],
  p: [
    "        ",
    "        ",
    "MM MMM  ",
    "MMM  MM ",
    "MM   MM ",
    "MMMMMM  ",
    "MM      ",
    "MM      "
  ],
  q: [
    "        ",
    "        ",
    " MMM MM ",
    "MM  MMM ",
    "MM   MM ",
    " MMMMMM ",
    "     MM ",
    "     MM "
  ],
  r: [
    "        ",
    "        ",
    "MM MMM  ",
    "MMM  MM ",
    "MM      ",
    "MM      ",
    "MM      ",
    "        "
  ],
  s: [
    "        ",
    "        ",
    " MMMMM  ",
    "MM      ",
    " MMMMM  ",
    "     MM ",
    " MMMMM  ",
    "        "
  ],
  t: [
    "  MM    ",
    "  MM    ",
    "MMMMMM  ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "  MM    ",
    "        "
  ],
  u: [
    "        ",
    "        ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    "MM  MMM ",
    " MMM MM ",
    "        "
  ],
  v: [
    "        ",
    "        ",
    "MM   MM ",
    "MM   MM ",
    " MM MM  ",
    "  MMM   ",
    "   M    ",
    "        "
  ],
  w: [
    "        ",
    "        ",
    "MM M MM ",
    "MM M MM ",
    "MM M MM ",
    "MM M MM ",
    " MM MM  ",
    "        "
  ],
  x: [
    "        ",
    "        ",
    "MM   MM ",
    " MM MM  ",
    "  MMM   ",
    " MM MM  ",
    "MM   MM ",
    "        "
  ],
  y: [
    "        ",
    "        ",
    "MM   MM ",
    "MM   MM ",
    "MM   MM ",
    " MMMMMM ",
    "     MM ",
    "MMMMMM  "
  ],
  z: [
    "        ",
    "        ",
    "MMMMMMM ",
    "     MM ",
    "   MM   ",
    " MM     ",
    "MMMMMMM ",
    "        "
  ],
  "\u2588": [
    "MMMMMMMM",
    "MMMMMMMM",
    "MMMMMMMM",
    "MMMMMMMM",
    "MMMMMMMM",
    "MMMMMMMM",
    "MMMMMMMM",
    "MMMMMMMM"
  ],
  "\u2593": [
    " MMM MMM",
    "MM MMM M",
    " MMM MMM",
    "MM MMM M",
    " MMM MMM",
    "MM MMM M",
    " MMM MMM",
    "MM MMM M"
  ],
  "\u2592": [
    "M M M M ",
    " M M M M",
    "M M M M ",
    " M M M M",
    "M M M M ",
    " M M M M",
    "M M M M ",
    " M M M M"
  ],
  "\u2591": [
    "M   M   ",
    "  M   M ",
    "M   M   ",
    "  M   M ",
    "M   M   ",
    "  M   M ",
    "M   M   ",
    "  M   M "
  ]
};
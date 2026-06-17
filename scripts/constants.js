//
// All Procedraw material is licensed under MIT
// Author: Marioood
// Purpose: All constants (enums, patterns for whatever, etc.) are stored here to make the code a bit less cluttered
//

//TODO: move some stuff from the Tether class to here
//TODO: move some stuff from the Serialization class to here


//////// PROGRAM INFO ////////
const PD_VERSION = "VOLATILE 0.9.1"; //scarily close to 1.0
//this gets changed when the SAVE FORMAT is changed, not when layer paramters are changed
//do not change until Procedraw exits the VOLATILE stage of development  
const PD_SAVE_FORMAT = 0;
  
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

const O_BITWISE_XOR = 0;
const O_BITWISE_AND = 1;
const O_BITWISE_OR = 2;
const O_BITWISE_RAW = 3;
const O_BITWISE_HAMMING_DIST = 4;
const O_BITWISE_INTERLACE = 5;

const O_OUTPUT_COLOR = 0;
const O_OUTPUT_ALPHA = 1;
const O_OUTPUT_BOTH = 2;

const O_START_MANUAL = 0;
const O_START_RANDOM = 1;

//////// OTHER ////////
//do NOT change these values! they are used in saves
const GLYPH_FMT_RGB = 0;
const GLYPH_FMT_RGBA = 1;

const UNIT_PIXELS = 0;
const UNIT_PERCENTAGE = 1;
const UNIT_VAR = 2;
const UNIT_RATIO = 3;
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

const LIMITS_EDGE = {
  type: "keyvalues",
  keys: [
    "wrap",
    "clamp",
    "void",
    "reflect"
  ],
  values: [
    O_WRAP,
    O_CLAMP,
    O_VOID,
    O_REFLECT
  ]
};

//////// FONTS ////////

//8x8 monospace atari and commodore 64 inspired font
//each member holds the data for a character
//if a member stores a bigint, then that is the raw data for the glyph. a 1 bit means white, 0 means transparent
//if a member stores a string, it acts as an alias to another glyph, which just points to another glyph's data
//this is to prevent tons of copy-and-pasting for when two glyphs look identical (e.g. uppercase alpha and uppercase a)

//code is autogenerated from (preprocess/cnvt.html)
const GLYPHS_CLASCII = {
  'unknown': 0xFFE7FFE7CF99C3FFn,
  '0': 0x003E63737B6F673En,
  '1': 0x003F0C0C0C0C0F0En,
  '2': 0x003F060C1830331En,
  '3': 0x003E63603860633En,
  '4': 0x006060607F636363n,
  '5': 0x003E63603E03037Fn,
  '6': 0x003E63633F03633En,
  '7': 0x0003060C1830607Fn,
  '8': 0x003E63633E63633En,
  '9': 0x003E63607E63633En,
  'A': 0x006363637F63633En,
  'B': 0x003F63633F63633Fn,
  'C': 0x003E63030303633En,
  'D': 0x003F63636363633Fn,
  'E': 0x007F03031F03037Fn,
  'F': 0x000303031F03037Fn,
  'G': 0x003E63637B03633En,
  'H': 0x006363637F636363n,
  'I': 0x003F0C0C0C0C0C3Fn,
  'J': 0x003E636060606060n,
  'K': 0x0063331B0F1B3363n,
  'L': 0x007F030303030303n,
  'M': 0x006363636B7F7763n,
  'N': 0x006363737B6F6763n,
  'O': 0x003E63636363633En,
  'P': 0x000303033F63633Fn,
  'Q': 0x006E33636363633En,
  'R': 0x006363633F63633Fn,
  'S': 0x003E63603E03633En,
  'T': 0x000C0C0C0C0C0C3Fn,
  'U': 0x003E636363636363n,
  'V': 0x00081C3663636363n,
  'W': 0x00366B6B6B636363n,
  'X': 0x0033331E0C1E3333n,
  'Y': 0x000C0C0C0C1E3333n,
  'Z': 0x007F03060C18307Fn,
  '.': 0x0018180000000000n,
  ',': 0x0C18180000000000n,
  '/': 0x0103060C183060C0n,
  '\\': 0x80C06030180C0603n,
  '$': 0x083E6B380E6B3E08n,
  '-': 0x000000007F000000n,
  '+': 0x000808087F080808n,
  '*': 0x000000083E1C3E08n,
  '^': 0x0000000022361C08n,
  '&': 0x006E33637E5B1B0En,
  '%': 0x0063660C18306343n,
  '!': 0x00180018183C3C18n,
  '?': 0x001800183060663Cn,
  '=': 0x0000007F007F0000n,
  '_': 0x00FF000000000000n,
  '"': 0x0000000000366C6Cn,
  '\'': 0x00000000000C1818n,
  '`': 0x000000000030180Cn,
  '~': 0x000030794F060000n,
  '|': 0x1818181818181818n,
  ':': 0x0018000000000018n,
  ';': 0x0C18180000000018n,
  '(': 0x00380C0606060C38n,
  ')': 0x001C30606060301Cn,
  '[': 0x003E06060606063En,
  ']': 0x007C60606060607Cn,
  '{': 0x00380C0C030C0C38n,
  '}': 0x001C3030C030301Cn,
  '<': 0x0030180C060C1830n,
  '>': 0x000C18306030180Cn,
  '#': 0x00367F36367F3600n,
  '@': 0x003E63037B6B633En,
  'a': 0x006E3363663C0000n,
  'b': 0x003F63633F030303n,
  'c': 0x003E6303633E0000n,
  'd': 0x007E63637E606060n,
  'e': 0x003E037F633E0000n,
  'f': 0x000606061F06663Cn,
  'g': 0x3F607E63633E0000n,
  'h': 0x006363633F030303n,
  'i': 0x003F0C0C0C0F000Cn,
  'j': 0x3E63606060600060n,
  'k': 0x0063331B0F1B3303n,
  'l': 0x003F0C0C0C0C0C0Fn,
  'm': 0x006B6B6B6B350000n,
  'n': 0x00636363673B0000n,
  'o': 0x003E6363633E0000n,
  'p': 0x03033F63673B0000n,
  'q': 0x60607E63736E0000n,
  'r': 0x00030303673B0000n,
  's': 0x003E603E033E0000n,
  't': 0x000C0C0C0C3F0C0Cn,
  'u': 0x006E736363630000n,
  'v': 0x00081C3663630000n,
  'w': 0x00366B6B6B6B0000n,
  'x': 0x0063361C36630000n,
  'y': 0x3F607E6363630000n,
  'z': 0x007F0618607F0000n,
  '\u2588': 0xFFFFFFFFFFFFFFFFn,
  '\u2593': 0xBBEEBBEEBBEEBBEEn,
  '\u2592': 0xAA55AA55AA55AA55n,
  '\u2591': 0x4411441144114411n,
  '\u03b1': 0x006E3333336E0000n,
  '\u0391': 'A',
  '\u03b2': 0x033B67633F63633En,
  '\u0392': 'B',
  '\u03b3': 0x0C0C0C1E33330000n,
  '\u0393': 0x000303030303037Fn,
  '\u03b4': 0x007F636336361C1Cn,
  '\u0394': 0x003E6363633E037Fn,
  '\u03b5': 0x003E6306633E0000n,
  '\u0395': 'E',
  '\u03b6': 0x607E0303060C187Fn,
  '\u0396': 'Z',
  '\u03b7': 0x60636363673B0000n,
  '\u0397': 'H',
  '\u03b8': 0x003E63637F63633En,
  '\u0398': 0x003E63636B63633En,
  '\u03b9': 0x00180C0C0C000000n,
  '\u0399': 'I',
  '\u03ba': 0x00331B0F1B330000n,
  '\u039a': 'K',
  '\u03bb': 0x0063363C18180C0Cn,
  '\u039b': 0x0063636336361C1Cn,
  '\u03bc': 0x03DB676363630000n,
  '\u039c': 'M',
  '\u03bd': 'v',
  '\u039d': 'N',
  '\u03be': 0x607E03030E03037Fn,
  '\u039e': 0x007F63001C00637Fn,
  '\u039f': 'O',
  '\u03bf': 'o',
  '\u03c0': 0x00663636367F0000n,
  '\u03a0': 0x006363636363637Fn,
  '\u03c1': 0x03033F63633E0000n,
  '\u03a1': 'P',
  '\u03a3': 0x007F63060C06637Fn,
  '\u03c4': 0x00180C0C0C3F0000n,
  '\u03a4': 'T',
  '\u03c5': 0x003E636363630000n,
  '\u03a5': 'Y',
  '\u03c6': 0x08083E6B6B320000n,
  '\u03a6': 0x00083E6B6B6B3E08n,
  '\u03a7': 'X',
};
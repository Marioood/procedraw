//
// All Procedraw material is licensed under MIT
// Author: Marioood
// Purpose: Programming language implementation for the graph layer. I'd like to call it Procecalc.
//

//quick test: calcHumanProgram(calcParseTokens(calcTokenize("(-x) & 2"), ["x"], []), ["x"])

//TODO: should ^ be for exponents or no? (harder to parse, issues with unary -, is it more/less intuitive than pow(b, e)?)
//TODO: booleans, comparison, and a switch(cond, then, else) function (in place of ternaries)
//TODO (AFTER FIRST REVISION): factor out constant parts of functions (e.g. shortening x / (0.5 * 3) to x / 1.5)
//TODO: variadic functions (for hypot) or maybe not? might be pointless. what aaaaabout variadic min/max?

"use strict";

//The calculator works as a stack machine. This means that operations are done entirely on a stack.
//Operation documentation: arg0 arg1 arg2... -- return0 return1 return2...
//Where the args are popped off of the stack and the return values are pushed back onto the stack.
//Values in {brackets} are stored and retrieved from the operation itself

//these constants can change, they are not used in saves
const OP_PUSH_FLOAT = 0; // -- {value}
const OP_PUSH_LOCAL = 1; // -- {local index}

//algebraic operations
const OP_ADD = 2; //a b -- c
const OP_MUL = 3; //a b -- c
const OP_SUB = 4; //a b -- c
const OP_DIV = 5; //a b -- c
const OP_SQRT = 6; //x -- y
const OP_NEG = 7; //x -- y
const OP_REM = 8; //a b -- c
const OP_MOD = 9; //a b -- c
const OP_POW = 10; //b e -- c
const OP_FLOOR = 11; //x -- y
const OP_ROUND = 12; //x -- y
const OP_CEIL = 13; //x -- y
const OP_CBRT = 14; //x -- y
const OP_ABS = 15; //x -- y
const OP_MIN = 16; //x -- y
const OP_MAX = 17; //x -- y
//TODO: for sure add these functions
  //const OP_FAC = 9; //x -- y
  //const OP_VA_HYPOT = 9; //argc x y z... -- c
//TODO: maybe add these functions
  //const OP_LN = 9; //x -- y
  //const OP_EXP = 9; //e -- c
  //const OP_LOG2 = 9; //x -- y
  //const OP_LOG10 = 9; //x -- y
  //const OP_LOGN = 9; //b x -- y
  //const OP_NRT = 9; //b x -- y

//trigonomic operations
const OP_SIN = 18; //theta -- x
const OP_COS = 19; //theta -- x
const OP_TAN = 20; //theta -- x
const OP_ASIN = 21; //x -- theta
const OP_ACOS = 22; //x -- theta
const OP_ATAN = 23; //x -- theta
const OP_ATAN2 = 24; //x y -- theta

//bitwise operations
const OP_B_AND = 25; //a b -- c
const OP_B_OR = 26; //a b -- c
const OP_B_XOR = 27; //a b -- c

const OP_COUNT = 28;

function Op(t, v) {
  return {type: t, value: v};
}

function calcTokenize(source) {
  //rules:
    //if char is space AND previous char was a space/is start of string, skip char
    //if char is space AND token.length > 0, push & clear current token
    //if char is a special symbol, push & clear current token & push current char
    //if end of string, push current token
    //otherwise, append cur char to cur token
  let tokens = [];
  let curToken = "";
  
  for(let i = 0; i < source.length; i++) {
    let ch = source[i];
    if(ch == ' ') {
      if(curToken.length > 0) {
        tokens.push(curToken);
        curToken = "";
      }
    } else if("()+-*/%<>&|^@,".indexOf(ch) >= 0) {
      if(curToken.length > 0) {
        tokens.push(curToken);
        curToken = "";
      }
      tokens.push(ch);
    } else if(i == source.length - 1) {
      curToken += ch;
      tokens.push(curToken);
    } else {
      curToken += ch;
    }
  }
  return tokens;
}
//maybe make errors a handler function? e.g. calcParseTokens(tokens, varialbes, (err) => console.log(err))
function calcParseTokens(tokens, variables, errors) {
  const PRECEDENCE = {
    "(": 0,
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "u-neg": 3,
    "&": 3,
    "@": 3,
    "|": 3
  };
  const TOK2OP = {
    "+": OP_ADD,
    "*": OP_MUL,
    "-": OP_SUB,
    "u-neg": OP_NEG,
    "/": OP_DIV,
    
    "sqrt": OP_SQRT,
    "cbrt": OP_CBRT,
    "mod": OP_MOD,
    "rem": OP_REM,
    "pow": OP_POW,
    "floor": OP_FLOOR,
    "round": OP_ROUND,
    "ceil": OP_CEIL,
    "abs": OP_ABS,
    "min": OP_MIN,
    "max": OP_MAX,
    
    "sin": OP_SIN,
    "cos": OP_COS,
    "tan": OP_TAN,
    "asin": OP_ASIN,
    "acos": OP_ACOS,
    "atan": OP_ATAN,
    "atan2": OP_ATAN2,
    
    "&": OP_B_AND,
    "@": OP_B_XOR,
    "|": OP_B_OR,
    //these SHOULD not be used. if they aren't, it's a bug!
    "(": -1,
    ")": -2
  };
  const BUILTINS = {
    "sqrt": 1,
    "cbrt": 1,
    "mod": 2,
    "rem": 2,
    "pow": 2,
    "floor": 1,
    "round": 1,
    "ceil": 1,
    "abs": 1,
    "min": 2,
    "max": 2,
    
    "sin": 1,
    "cos": 1,
    "tan": 1,
    "asin": 1,
    "acos": 1,
    "atan": 1,
    "atan2": 2
  };
  const CONSTS = {
    //Infinity is already defined from Number.parseFloat()
    "PI": Math.PI,
    "TAU": Math.PI * 2,
    "E": Math.E,
    "PHI": (1 + Math.sqrt(5)) / 2,
    "NaN": NaN,
    "TRUE": 1,
    "FALSE": 0
  };
  //shunting yard
  const opStack = [];
  const argcStack = [];
  const funcFrontStack = [];
  const program = [];
  
  for(let i = 0; i < tokens.length; i++) {
    let curTok = tokens[i];
    const tokNumeric = Number.parseFloat(curTok);
    
    if(tokNumeric != tokNumeric) {
      //not a number
      switch(curTok) {
        case "-": {
          const prev = tokens[i - 1];
          //unary negate vs. subtraction
          //previous token is an operator OR if no literal is before the -
          if(i == 0 || PRECEDENCE[prev] != undefined) {
            curTok = "u-neg";
          }
        }
        case "+":
        case "*":
        case "/":
        case "&":
        case "|":
        case "@":
          while(opStack.length > 0 && PRECEDENCE[opStack[opStack.length - 1]] >= PRECEDENCE[curTok]) {
            program.push(Op(TOK2OP[opStack.pop()]));
          }
          opStack.push(curTok);
          break;
        case "(":
          opStack.push(curTok);
          //parentheses are not part of a function
          if(BUILTINS[tokens[i - 1]] == undefined) {
            argcStack.push(tokens[i + 1] == ")" ? 0 : 1);
            funcFrontStack.push("(");
          }
          break;
        case ")": {
          const curArgc = argcStack.pop();
          const funcFront = funcFrontStack.pop();
          if(funcFront == "(") {
            if(curArgc > 1) {
              errors.push("Commas may only appear in function calls, not grouping.");
              return;
            } else if(curArgc == 0) {
              errors.push("Parentheses cannot be empty.");
              return;
            }
          } else {
            const expectedArgc = BUILTINS[funcFront];
            if(curArgc != expectedArgc) {
              errors.push(`"${funcFront}" expects ${expectedArgc} argument(s), not ${curArgc}`);
              return;
            }
          }
          
          while(opStack.length > 0 && opStack[opStack.length - 1] != "(") {
            program.push(Op(TOK2OP[opStack.pop()]));
          }
          if(opStack.length == 0) {
            errors.push(") does not have a corresponding (.");
            return;
          } else {
            opStack.pop();
            if(opStack.length > 0 && BUILTINS[opStack[opStack.length - 1]] != undefined) {
              program.push(Op(TOK2OP[opStack.pop()]));
            }
          }
          break;
        }
        case ",":
          argcStack.push(argcStack.pop() + 1);
          
          while(opStack.length > 0 && opStack[opStack.length - 1] != "(") {
            program.push(Op(TOK2OP[opStack.pop()]));
          }
          break;
        default:
          if(tokens[i + 1] == "(") {
            if(BUILTINS[curTok] != undefined) {
              opStack.push(curTok);
              argcStack.push(tokens[i + 2] == ")" ? 0 : 1);
              funcFrontStack.push(curTok);
            } else {
              errors.push(`Unknown function "${curTok}".`);
              return;
            }
          } else {
            if(CONSTS[curTok] != undefined) {
              program.push(Op(OP_PUSH_FLOAT, CONSTS[curTok]));
            } else {
              const varr = variables.indexOf(curTok);
              if(varr == -1) {
                errors.push(`Unknown variable "${curTok}".`);
                return;
              } else {
                program.push(Op(OP_PUSH_LOCAL, varr));
              }
            }
          }
          break;
      }
    } else {
      //is a number
      program.push(Op(OP_PUSH_FLOAT, tokNumeric));
    }
  }
  while(opStack.length > 0) {
    const top = opStack.pop();
    if(top == "(") {
      errors.push("( does not have a corresponding ).");
      return;
    }
    program.push(Op(TOK2OP[top]));
  }
  return program;
}

function calcHumanProgram(program, variables) {
  const OP2TOK = [];
  OP2TOK[OP_ADD] = "+";
  OP2TOK[OP_MUL] = "*";
  OP2TOK[OP_SUB] = "-";
  OP2TOK[OP_DIV] = "/";
  OP2TOK[OP_NEG] = "u-neg";

  OP2TOK[OP_SQRT] = "sqrt";
  OP2TOK[OP_CBRT] = "cbrt";
  OP2TOK[OP_MOD] = "mod";
  OP2TOK[OP_REM] = "rem";
  OP2TOK[OP_POW] = "pow";
  OP2TOK[OP_FLOOR] = "floor";
  OP2TOK[OP_ROUND] = "round";
  OP2TOK[OP_CEIL] = "ceil";
  OP2TOK[OP_ABS] = "abs";
  OP2TOK[OP_MIN] = "min";
  OP2TOK[OP_MAX] = "max";
  
  OP2TOK[OP_SIN] = "sin";
  OP2TOK[OP_COS] = "cos";
  OP2TOK[OP_TAN] = "tan";
  OP2TOK[OP_ASIN] = "asin";
  OP2TOK[OP_ACOS] = "acos";
  OP2TOK[OP_ATAN] = "atan";
  OP2TOK[OP_ATAN2] = "atan2";

  OP2TOK[OP_B_AND] = "&";
  OP2TOK[OP_B_XOR] = "@";
  OP2TOK[OP_B_OR] = "|";

  let out = "";
  for(let i = 0; i < program.length; i++) {
    const typ = program[i].type;
    const val = program[i].value;
    if(typ == OP_PUSH_FLOAT) {
      out += val;
    } else if(typ == OP_PUSH_LOCAL) {
      out += variables[val];
    } else {
      out += OP2TOK[typ];
    }
    if(i != program.length - 1) {
      out += ' ';
    }
  }
  return out;
}

function calcRun(program, locals) {
  const stack = [];
  for(let ip = 0; ip < program.length; ip++) {
    const op = program[ip];
    switch(op.type) {
      case OP_PUSH_FLOAT:
        stack.push(op.value);
        break;
      case OP_PUSH_LOCAL:
        stack.push(locals[op.value]);
        break;
      case OP_ADD:
        stack.push(stack.pop() + stack.pop());
        break;
      case OP_SUB: {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a - b);
        break;
      }
      case OP_MUL:
        stack.push(stack.pop() * stack.pop());
        break;
      case OP_DIV: {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a / b);
        break;
      }
      case OP_POW: {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a ** b);
        break;
      }
      case OP_NEG:
        stack.push(-(stack.pop()));
        break;
      case OP_REM: {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a % b);
        break;
      }
      case OP_MOD: {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(((a % b) + b) % b);
        break;
      }
      case OP_FLOOR:
        stack.push(Math.floor(stack.pop()));
        break;
      case OP_ROUND:
        stack.push(Math.round(stack.pop()));
        break;
      case OP_CEIL:
        stack.push(Math.ceil(stack.pop()));
        break;
      case OP_SQRT:
        stack.push(Math.sqrt(stack.pop()));
        break;
      case OP_CBRT:
        stack.push(Math.cbrt(stack.pop()));
        break;
      case OP_ABS:
        stack.push(Math.abs(stack.pop()));
        break;
      case OP_MIN:
        stack.push(Math.min(stack.pop(), stack.pop()));
        break;
      case OP_MAX:
        stack.push(Math.max(stack.pop(), stack.pop()));
        break;
        
      case OP_SIN:
        stack.push(Math.sin(stack.pop()));
        break;
      case OP_COS:
        stack.push(Math.cos(stack.pop()));
        break;
      case OP_TAN:
        stack.push(Math.tan(stack.pop()));
        break;
      case OP_ASIN:
        stack.push(Math.asin(stack.pop()));
        break;
      case OP_ACOS:
        stack.push(Math.acos(stack.pop()));
        break;
      case OP_ATAN:
        stack.push(Math.atan(stack.pop()));
        break;
      case OP_ATAN2: {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(Math.atan2(a, b));
        break;
      }
        
      case OP_B_AND:
        stack.push(stack.pop() & stack.pop());
        break;
      case OP_B_XOR:
        stack.push(stack.pop() ^ stack.pop());
        break;
      case OP_B_OR:
        stack.push(stack.pop() | stack.pop());
        break;
      default:
        console.error(`Unknown operation ${op.type}`);
        return;
    }
  }
  return stack[0];
}
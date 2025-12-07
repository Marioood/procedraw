//
// All Procedraw material is licensed under MIT
// Author: Marioood
// Purpose: Representation of complex numbers for the mandelbrot Layer
//
class Complex {
  static ZERO = new Complex(0, 0);
  static ONE = new Complex(1, 0);
  static I = new Complex(0, 1);
  
  real;
  imag;
  //complex numbers are mutable, but the static methods return new instances
  constructor(r, i) {
    this.real = r;
    this.imag = i;
  }
  //Complex Complex -> Complex
  static add(a, b) {
    return new Complex(a.real + b.real, a.imag + b.imag);
  }
  //Complex Complex -> Complex
  static mul(a, b) {
    return new Complex(
      a.real * b.real - a.imag * b.imag,
      a.real * b.imag + b.real * a.imag
    );
  }
  //Complex -> Complex
  static square(n) {
    return new Complex(
      n.real * n.real - n.imag * n.imag,
      n.real * n.imag * 2
    );
  }
  //Real -> Complex
  //takes any real (including negatives) and converts it into a complex number
  static sqrtReal(n) {
    if(n >= 0) {
      return new Complex(Math.sqrt(n), 0);
    } else {
      return new Complex(0, Math.sqrt(Math.abs(n)));
    }
  }
  //Complex -> Real
  static abs(n) {
    return Math.sqrt(n.real * n.real + n.imag * n.imag);
  }

  toString = () => `${this.real}${this.imag >= 0 ? '+' : ''}${this.imag}i`;
  clone = () => new Complex(this.real, this.imag);
}
export class Coord {
  constructor(x, y) {
    if (Array.isArray(x)) {
      [x, y] = x;
    }
    if (x instanceof Coord) {
      y = x.y;
      x = x.x;
    }
    if (isNaN(x) || isNaN(y)) {
      throw new TypeError(`Invalid points (${x}, ${y})`);
    }
    this.x = x;
    this.y = y;
  }

  toArray() {
    return [this.x, this.y];
  }

  toString() {
    return `Coord{ x: ${this.x}, y: ${this.y} }`;
  }

  static fromArray([x, y]) {
    return new Coord(x, y);
  }

  // given a point and an offset return the new coord.
  static transform(coord, offset) {
    return new Coord(coord.x + offset[0], coord.y + offset[1]);
  }
}

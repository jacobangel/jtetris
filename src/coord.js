export class Coord {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    toArray() { return [this.x, this.y]; }

    static fromArray([x, y]) {
      return new Coord(x, y);
    }
    
    // given a point and an offset return the new coord.
    static transform(coord, offset) {
      return new Coord(coord.x + offset[0], coord.y + offset[1]);
    }
  }
import { Coord } from "./coord";
export class Tetrimo {
  constructor(center) {
    this.center = Coord.fromArray(center);
    this._coords = [[[0, 0]]];
    this.index = 0;
  }

  getCopy() {
    return new this.constructor([this.center.x, this.center.y]);
  }

  get coords() {
    return this._coords[this.index];
  }

  move(dir) {
    // return the new center
    this.center = Coord.transform(this.center, dir);
  }

  setIndex(bump) {
    this.index += bump;
    if (this.index < 0) {
      this.index = this._coords.length - 1;
    } else if (this.index > this._coords.length - 1) {
      this.index = 0;
    }
  }

  rotate(dir) {
    if (dir === "left") {
      this.setIndex(-1);
    } else {
      this.setIndex(1);
    }
    return this;
  }

  getCoords() {
    return this.coords.map(coord => {
      return Coord.transform(this.center, coord);
    });
  }
}

export class OPiece extends Tetrimo {
  constructor(props) {
    super(props);
    this._coords = [[[0, 0], [-1, 0], [0, 1], [-1, 1]]];
  }
}

export class IPiece extends Tetrimo {
  constructor(props) {
    super(props);
    this._coords = [
      [[0, 0], [-1, 0], [1, 0], [-2, 0]],
      [[0, -1], [0, 0], [0, 1], [0, 2]]
    ];
  }
}

export class SPiece extends Tetrimo {
  constructor(props) {
    super(props);
    this._coords = [
      [[0, 0], [1, 0], [0, 1], [-1, 1]],
      [[0, 0], [0, -1], [1, 1], [1, 0]]
    ];
  }
}

export class ZPiece extends Tetrimo {
  constructor(props) {
    super(props);
    this._coords = [
      [[-1, 0], [0, 0], [0, 1], [1, 1]],
      [[0, 0], [1, 0], [1, -1], [0, 1]]
    ];
  }
}

export class LPiece extends Tetrimo {
  constructor(props) {
    super(props);
    this._coords = [
      [[-1, 1], [-1, 0], [0, 0], [1, 0]],
      [[0, -1], [0, 0], [0, 1], [-1, -1]],
      [[-1, 0], [0, 0], [1, 0], [1, -1]],
      [[0, -1], [0, 0], [0, 1], [-1, 1]]
    ];
  }
}

export class JPiece extends Tetrimo {
  constructor(props) {
    super(props);
    this._coords = [
      [[-1, 0], [0, 0], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [0, -1], [-1, 1]],
      [[-1, 0], [0, 0], [1, 0], [-1, -1]],
      [[0, 0], [0, 1], [0, -1], [1, -1]],
    ];
  }
}

export class TPiece extends Tetrimo {
  constructor(props) {
    super(props);
    this._coords = [
      [[0, 0], [-1, 0], [1, 0], [0, 1]],
      [[0, -1], [0, 0], [0, 1], [1, 0]],
      [[0, 0], [-1, 0], [1, 0], [0, -1]],
      [[0, -1], [0, 0], [0, 1], [-1, 0]]
    ];
  }
}

export const TETRIMO_TYPES = {
  O: OPiece,
  I: IPiece,
  S: SPiece,
  Z: ZPiece,
  L: LPiece,
  J: JPiece,
  T: TPiece
};
const pieceList = [OPiece, IPiece, SPiece, ZPiece, LPiece, JPiece, TPiece];

const randomInt = top => Math.floor(Math.random() * top);

export const getRandomPiece = center => {
  let index = randomInt(pieceList.length);
  return new pieceList[index](center);
};

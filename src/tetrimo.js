import { Coord } from './coord';

export class Tetrimo {
  constructor(center, color = 'grey') {
    if (Array.isArray(center)) {
      center = Coord.fromArray(center);
    }
    this.center = center;
    this._coords = [[[0, 0]]];
    this.index = 0;
    this.color = color;
  }

  getCopy() {
    const copy = new this.constructor([this.center.x, this.center.y]);
    copy.index = this.index;
    return copy;
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
    if (dir === TETRIMO_DIR.LEFT) {
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
  constructor(props, color = 'yellow') {
    super(props, color);
    this._coords = [[[0, 0], [-1, 0], [0, 1], [-1, 1]]];
  }
}

export class IPiece extends Tetrimo {
  constructor(props, color = 'cyan') {
    super(props, color);
    this.color = color;
    this._coords = [
      [[0, 0], [-1, 0], [1, 0], [-2, 0]],
      [[0, -1], [0, 0], [0, 1], [0, 2]],
    ];
  }
}

export class SPiece extends Tetrimo {
  constructor(props, color = 'green') {
    super(props, color);
    this._coords = [
      [[0, 0], [1, 0], [0, 1], [-1, 1]],
      [[0, 0], [0, -1], [1, 1], [1, 0]],
    ];
  }
}

export class ZPiece extends Tetrimo {
  constructor(props, color = 'red') {
    super(props, color);
    this._coords = [
      [[-1, 0], [0, 0], [0, 1], [1, 1]],
      [[0, 0], [1, 0], [1, -1], [0, 1]],
    ];
  }
}

export class LPiece extends Tetrimo {
  constructor(props, color = 'orange') {
    super(props, color);

    this._coords = [
      [[-1, 1], [-1, 0], [0, 0], [1, 0]],
      [[0, -1], [0, 0], [0, 1], [-1, -1]],
      [[-1, 0], [0, 0], [1, 0], [1, -1]],
      [[0, -1], [0, 0], [0, 1], [-1, 1]],
    ];
  }
}

export class JPiece extends Tetrimo {
  constructor(props, color = 'blue') {
    super(props, color);
    this._coords = [
      [[-1, 0], [0, 0], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [0, -1], [-1, 1]],
      [[-1, 0], [0, 0], [1, 0], [-1, -1]],
      [[0, 0], [0, 1], [0, -1], [1, -1]],
    ];
  }
}

export class TPiece extends Tetrimo {
  constructor(props, color = 'magenta') {
    super(props, color);
    this._coords = [
      [[0, 0], [-1, 0], [1, 0], [0, 1]],
      [[0, -1], [0, 0], [0, 1], [1, 0]],
      [[0, 0], [-1, 0], [1, 0], [0, -1]],
      [[0, -1], [0, 0], [0, 1], [-1, 0]],
    ];
  }
}

export class Block extends Tetrimo {
  constructor(props, color = 'gray') {
    super(props);
    this.color = color;
  }
}

export const TETRIMO_DIR = {
  LEFT: 'left',
  RIGHT: 'right',
};

export const TETRIMO_TYPES = {
  O: OPiece,
  I: IPiece,
  S: SPiece,
  Z: ZPiece,
  L: LPiece,
  J: JPiece,
  T: TPiece,
};
const pieceList = [OPiece, IPiece, SPiece, ZPiece, LPiece, JPiece, TPiece];

const randomInt = top => Math.floor(Math.random() * top);

export const getRandomPiece = center => {
  let index = randomInt(pieceList.length);
  return new pieceList[index](center);
};

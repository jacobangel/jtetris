import { Coord } from './coord';
export class Tetrimo {
  constructor(center) {
    this.center = Coord.fromArray(center);
    this.orientation = 0;
    this.coords = [[0, 0]]
  }

  move(dir) {
    this.coord = this.coord.transform(dir);
  }

  getCoords() {
    return this.coords.map((coord) => {
      return Coord.transform(this.center, coord);
    });
  }
}

export class OPiece extends Tetrimo {
  constructor(props) { 
    super(props); 
    this.coords = [
      [0, 0],
      [-1, 0],
      [0, 1],
      [-1, 1]
    ]
  }
}

export class IPiece extends Tetrimo {
  constructor(props) { super(props); }
}

export class SPiece extends Tetrimo {
  constructor(props) { super(props); }
}

export class ZPiece extends Tetrimo {
  constructor(props) { super(props); }
}

export class LPiece extends Tetrimo {
  constructor(props) { super(props); }
}

export class JPiece extends Tetrimo {
  constructor(props) { super(props); }
}

export class TPiece extends Tetrimo {
  constructor(props) { super(props); }
}

export const TETRIMO_TYPES = { O: OPiece, I: IPiece, S: SPiece, Z: ZPiece, L: LPiece, 
    J: JPiece, T:TPiece };
const pieceList = [
    OPiece,
    IPiece,
    SPiece,
    ZPiece,
    LPiece,
    JPiece,
    TPiece,
]
const randomInt = (top) => Math.floor(Math.random() * (top));
export const getRandomPiece = (center) => {
   let index = randomInt(pieceList.length);
   index = 0;
   return new (pieceList[index])(center);
}
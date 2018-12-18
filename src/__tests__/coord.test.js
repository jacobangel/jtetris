import { Coord } from '../coord';

describe('Coord', () => {
  test('constructor', () => {
    const c1 = new Coord(1, 2);
    expect(c1).toMatchInlineSnapshot(`
Coord {
  "x": 1,
  "y": 2,
}
`);
    const c2 = new Coord([4, 5]);
    expect(c2).toMatchInlineSnapshot(`
Coord {
  "x": 4,
  "y": 5,
}
`);
    const c3 = new Coord(c1);
    expect(c3).not.toBe(c1);
    expect(c3).toMatchInlineSnapshot(`
Coord {
  "x": 1,
  "y": 2,
}
`);
  });

  test('conversion', () => {
    const originalArr = [1, 2];
    const newCoord = Coord.fromArray(originalArr);
    const generatedArr = newCoord.toArray();
    expect(generatedArr).toEqual(originalArr);
    expect(generatedArr).not.toBe(originalArr);
  });

  test('#transform', () => {
    const c = new Coord(1, 2);
    expect(Coord.transform(c, [2, 3])).toMatchInlineSnapshot(`
Coord {
  "x": 3,
  "y": 5,
}
`);
  });
});

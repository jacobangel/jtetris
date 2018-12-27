import { Tetris } from "../tetris";

describe('Tetris', () => {
  test('#getPointsAward', () => {
    expect(Tetris.getPointsAward(0, 1, 0)).toBe(40);
    expect(Tetris.getPointsAward(1, 1, 0)).toBe(80);
    expect(Tetris.getPointsAward(0, 0, 13)).toBe(13);
    expect(Tetris.getPointsAward(9, 1, 0)).toBe(400);
    expect(Tetris.getPointsAward(9, 4, 0)).toBe(12000);
  })

  test('#computeEarnedLevel', () => {
      expect(Tetris.computeEarnedLevel(0)).toBe(1);
      expect(Tetris.computeEarnedLevel(40)).toBe(4);
      expect(Tetris.computeEarnedLevel(10000)).toBe(10);
  })
})
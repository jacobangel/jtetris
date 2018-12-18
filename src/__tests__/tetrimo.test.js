import { Tetrimo } from '../tetrimo';
describe('tetrimos', () => {
  test('BaseClass', () => {
    expect(new Tetrimo(0, 0)).toBeTruthy();
  });
});

import { SENTINEL } from '../src/constants.mjs';
import * as frames from '../src/frames.mjs';

describe('frames', () => {
  it('should send a postMessage with frames.sendMessage', done => {
    const type = '__only_a_test__';
    const key = 'hello';
    const value = 5;

    window.addEventListener('message', ({ data }) => {
      expect(data.sentinel).toBe(SENTINEL);
      expect(data.type).toBe(type);
      expect(data[key]).toEqual(value);

      done();
    });

    frames.sendMessage(type, { [key]: value });
  });

  // it('should call sendFrameHeight() on window.load', done => {
  //   window.addEventListener('load', () => {
  //     console.log('hi');
  //     expect(true).toBeTruthy();
  //     done();
  //   });
  // });
});

import * as constants from '../constants.js';
import { sleep } from '../util.js';

export default {
  description: 'iterative',

  async move({ id, board }) {
    let player = 0n;
    let opponent = 0n;
    let holes = 0n;
    let empty = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        player <<= 1n;
        opponent <<= 1n;
        holes <<= 1n;

        switch (board[row][col]) {
          case constants.EMPTY:
            empty++;
            break;
          case constants.HOLE:
            holes |= 1n;
            break;
          case id:
            player |= 1n;
            break;
          default:
            opponent |= 1n;
            break;
        }
      }
    }

    let pos;
    const worker = new Worker(new URL('./worker.js', import.meta.url));

    const search = async () => {
      for (let depth = 0; depth < empty; depth++) {
        pos = await new Promise((resolve) => {
          worker.onmessage = (event) => resolve(event.data);
          worker.postMessage({ player, opponent, holes, depth });
        });
      }
    };

    // search as far ahead as possible
    await Promise.any([search(), sleep(5000)]);
    worker.terminate();

    return {
      row: Math.floor(pos / 8),
      col: pos % 8,
    };
  },
};

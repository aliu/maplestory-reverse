import * as constants from '../constants.js';

export default {
  description: 'minimax',

  async move({ id, board }) {
    let player = 0n;
    let opponent = 0n;
    let holes = 0n;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        player <<= 1n;
        opponent <<= 1n;
        holes <<= 1n;

        switch (board[row][col]) {
          case constants.EMPTY:
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

    const worker = new Worker(new URL('./worker.js', import.meta.url));

    // this is actually negamax, but minimax sounds nicer
    const pos = await new Promise((resolve) => {
      worker.onmessage = (event) => resolve(event.data);
      worker.postMessage({ player, opponent, holes, depth: 5 });
    });

    worker.terminate();

    return {
      row: Math.floor(pos / 8),
      col: pos % 8,
    };
  },
};

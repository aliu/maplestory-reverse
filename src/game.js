import * as constants from './constants.js';
import { directions } from './util.js';

export class Game {
  constructor() {
    this.reset();
  }

  get(row, col) {
    if (0 <= row && row < 8 && 0 <= col && col < 8) {
      return this.arr[row * 8 + col];
    }
  }

  set(row, col, id) {
    this.arr[row * 8 + col] = id;
  }

  board() {
    const board = [...new Array(8)].map(() => new Array(8));
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        board[row][col] = this.get(row, col);
      }
    }
    return board;
  }

  moves() {
    const moves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.valid({ row, col })) {
          moves.push({ row, col });
        }
      }
    }
    return moves;
  }

  move(move) {
    const flipped = [];
    if (move !== undefined) {
      flipped.push(...this.flipped(move));
      this.set(move.row, move.col, this.player);
      for (const { row, col } of flipped) {
        this.set(row, col, this.player);
      }
    }
    [this.player, this.opponent] = [this.opponent, this.player];
    return flipped;
  }

  valid(move) {
    return (
      move !== undefined &&
      this.get(move.row, move.col) === constants.EMPTY &&
      this.flipped(move).length > 0
    );
  }

  flipped(move) {
    const flipped = [];
    for (const { dr, dc } of directions) {
      const current = [];
      let row = move.row + dr;
      let col = move.col + dc;

      while (this.get(row, col) === this.opponent) {
        current.push({ row, col });
        row += dr;
        col += dc;
      }

      if (current.length > 0 && this.get(row, col) === this.player) {
        flipped.push(...current);
      }
    }
    return flipped;
  }

  reset() {
    this.arr = new Array(8 * 8).fill(constants.EMPTY);
    this.set(3, 4, constants.SLIME);
    this.set(4, 3, constants.SLIME);
    this.set(3, 3, constants.BEAN);
    this.set(4, 4, constants.BEAN);

    this.player = constants.SLIME;
    this.opponent = constants.BEAN;
  }
}

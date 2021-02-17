import * as constants from './constants.js';
import { Game } from './game.js';
import { Board } from './ui.js';
import { sleep } from './util.js';
import players from './players';

const game = new Game();
const ui = new Board(document.getElementById('board'));
const start = document.getElementById('start');
const slime = document.getElementById('slime');
const bean = document.getElementById('bean');
const info = document.getElementById('info');

let started = false;

createDropdown(slime);
createDropdown(bean);
reset();

ui.events.addEventListener('move', input);

start.onclick = async function () {
  if (started) return;
  started = start.disabled = slime.disabled = bean.disabled = true;

  const slimePlayer = players[slime.selectedIndex];
  const beanPlayer = players[bean.selectedIndex];

  let animation = Promise.resolve();

  while (true) {
    info.textContent = `${name(game.player)}'s turn.`;

    let moves = game.moves();
    if (moves.length === 0) {
      game.move();
      moves = game.moves();
      if (moves.length > 0) {
        // skip the current player's turn
        info.textContent = `Turn skipped. ${name(game.player)}'s turn`;
      } else {
        // no player has any moves, end the game
        info.textContent = 'Game over!';
        break;
      }
    }

    // show guide tiles
    for (const { row, col } of moves) {
      ui.tiles[row][col].guide();
    }
    // wait for tiles to finish animating
    await animation;

    const player = game.player === constants.SLIME ? slimePlayer : beanPlayer;
    const id = game.player;
    const move = await player.move({
      moves,
      board: game.board(),
      events: ui.events,
    });
    if (!game.valid(move)) {
      throw new Error(
        `${name(game.player)} played an invalid move: ${JSON.stringify(move)}`
      );
    }
    const flipped = game.move(move);

    // hide guide tiles
    for (const { row, col } of moves) {
      ui.tiles[row][col].set(constants.EMPTY);
    }
    // animate player move
    ui.tiles[move.row][move.col].drop(id);
    // animate flipped tiles
    animation = (async function () {
      for (const group of flipped) {
        for (const { row, col } of group) {
          ui.tiles[row][col].reverse(id);
        }
        await sleep(150);
      }
      await sleep(400);
    })();
  }

  // wait for any currently executing animations to finish
  await animation;
  await sleep(1000);
  reset();
};

function reset() {
  started = start.disabled = slime.disabled = bean.disabled = false;
  info.textContent = 'Click on empty tiles to toggle holes.';

  game.reset();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      ui.tiles[row][col].set(game.get(row, col));
    }
  }
}

function input(event) {
  const { row, col } = event.detail;
  if (!started) {
    // toggle walls
    switch (game.get(row, col)) {
      case constants.EMPTY:
        game.set(row, col, constants.HOLE);
        ui.tiles[row][col].set(constants.HOLE);
        break;
      case constants.HOLE:
        game.set(row, col, constants.EMPTY);
        ui.tiles[row][col].set(constants.EMPTY);
        break;
    }
  } else {
    // only forward valid moves
    if (!game.valid({ row, col })) {
      event.stopImmediatePropagation();
    }
  }
}

function name(id) {
  switch (id) {
    case constants.SLIME:
      return 'Slime';
    case constants.BEAN:
      return 'PinkBean';
  }
}

function createDropdown(select) {
  for (const player of players) {
    const option = document.createElement('option');
    option.text = player.description;
    select.add(option);
  }
}

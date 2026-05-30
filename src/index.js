import * as constants from './constants.js';
import { Game } from './game.js';
import { Board } from './ui.js';
import { sleep } from './util.js';
import players from './players';
import {
  playCriHit,
  playCriHit2,
  playDraw,
  playDrop,
  playLose,
  playFlip,
  playGood,
  playGreat,
  playNormalHit,
  playStart,
  playWin,
  setVolume,
} from './audio.js';

const game = new Game();
const ui = new Board(document.getElementById('board'));
const start = document.getElementById('start');
const slime = document.getElementById('slime');
const bean = document.getElementById('bean');
const info = document.getElementById('info');
const winScreen = document.getElementById('win-screen');
const winTitle = document.getElementById('win-title');
const winScore = document.getElementById('win-score');
const playAgainBtn = document.getElementById('play-again');
const slimeHpFill = document.getElementById('slime-hp-fill');
const beanHpFill = document.getElementById('bean-hp-fill');
const slimeHpText = document.getElementById('slime-hp-text');
const beanHpText = document.getElementById('bean-hp-text');
const volumeSlider = document.getElementById('volume');

const MAX_HP = 10000;

// TODO: This formula is likely incorrect
function damageFor(n) {
  let damage = 0;
  if (n <= 3) {
    damage = 5 * n * n + 95 * n;
  } else if (n <= 5) {
    damage = 5 * n * n + 135 * n - 120;
  } else {
    damage = 5 * n * n + 115 * n - 70;
  }
  return damage;
}

let slimeHp = MAX_HP;
let beanHp = MAX_HP;
let started = false;

load();

async function load() {
  createDropdown(slime);
  createDropdown(bean);

  await ui.load();

  reset();
  ui.events.addEventListener('move', input);
  start.onclick = play;
  volumeSlider.oninput = () => setVolume(Number(volumeSlider.value));
}

async function play() {
  if (started) return;
  started = start.disabled = slime.disabled = bean.disabled = true;

  playStart();

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
      id,
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
    playDrop();

    const totalFlipped = flipped.reduce((sum, group) => sum + group.length, 0);
    const totalDamage = damageFor(totalFlipped);

    if (id === constants.SLIME) {
      beanHp = Math.max(0, beanHp - totalDamage);
    } else {
      slimeHp = Math.max(0, slimeHp - totalDamage);
    }
    updateHpBars();

    if (totalFlipped >= 6) {
      playGreat();
    } else if (totalFlipped >= 4) {
      playGood();
    }

    animation = (async () => {
      for (const group of flipped) {
        for (let i = 0; i < group.length; i++) {
          playFlip();
        }
        for (const { row, col } of group) {
          ui.tiles[row][col].reverse(id);
        }
        await sleep(150);
      }

      if (totalFlipped > 0) {
        playNormalHit();
      }
      if (totalFlipped >= 5) {
        playCriHit();
      }
      // TODO: This threshold is likely incorrect for CriHit2
      if (totalFlipped >= 8) {
        playCriHit2();
      }
      await sleep(400);
    })();
  }

  await animation;

  const { slimeCount, beanCount } = countPieces();
  if (slimeCount === beanCount) {
    playDraw();
    showWinScreen("It's a Tie!", slimeCount, beanCount);
  } else {
    const slimeWon = slimeCount > beanCount;
    const isSlimeHuman = slimePlayer.description === 'human';
    const isBeanHuman = beanPlayer.description === 'human';
    const humanVsAI = isSlimeHuman !== isBeanHuman;
    const humanLost = humanVsAI && ((slimeWon && isBeanHuman) || (!slimeWon && isSlimeHuman));
    if (humanLost) {
      playLose();
    } else {
      playWin();
    }
    showWinScreen(slimeWon ? 'Slime Wins!' : 'PinkBean Wins!', slimeCount, beanCount);
  }

  await new Promise((resolve) => {
    playAgainBtn.onclick = () => {
      winScreen.classList.add('hidden');
      resolve();
    };
  });

  reset();
}

function reset() {
  started = start.disabled = slime.disabled = bean.disabled = false;
  info.textContent = 'Click on empty tiles to toggle holes.';

  slimeHp = beanHp = MAX_HP;
  updateHpBars();

  game.reset();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      ui.tiles[row][col].set(game.get(row, col));
    }
  }
}

function updateHpBars() {
  slimeHpFill.style.width = `${(slimeHp / MAX_HP) * 100}%`;
  beanHpFill.style.width = `${(beanHp / MAX_HP) * 100}%`;
  slimeHpText.textContent = Math.round(slimeHp);
  beanHpText.textContent = Math.round(beanHp);
}

function showWinScreen(title, slimeCount, beanCount) {
  winTitle.textContent = title;
  winScore.textContent = `Slime: ${slimeCount} — PinkBean: ${beanCount}`;
  winScreen.classList.remove('hidden');
}

function countPieces() {
  let slimeCount = 0;
  let beanCount = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = game.get(row, col);
      if (cell === constants.SLIME) slimeCount++;
      else if (cell === constants.BEAN) beanCount++;
    }
  }
  return { slimeCount, beanCount };
}

function input(event) {
  const { row, col } = event.detail;
  if (!started) {
    // toggle holes
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

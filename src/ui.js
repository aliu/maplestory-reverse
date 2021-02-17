import * as PIXI from 'pixi.js';
import * as constants from './constants.js';

const sheet = PIXI.Loader.shared.resources.assets.spritesheet;

const textures = {
  empty: [PIXI.Texture.EMPTY],
  slime: [sheet.textures.slime],
  bean: [sheet.textures.bean],
  hole: [sheet.textures.hole],
  guide: frames(sheet.animations.guide, 210),
  drop_slime: frames(sheet.animations.drop_slime, 120),
  drop_bean: frames(sheet.animations.drop_bean, 120),
  reverse_slime: frames(sheet.animations.reverse_slime, 120),
  reverse_bean: frames(sheet.animations.reverse_bean, 120),
};

function frames(animation, time) {
  return animation.map((texture) => ({ texture, time }));
}

export class Board {
  constructor(canvas) {
    this.tiles = [...new Array(8)].map(() => new Array(8));
    this.events = new EventTarget();

    this.app = new PIXI.Application({
      width: 334,
      height: 335,
      view: canvas,
      transparent: true,
    });
    this.app.stage.addChild(new PIXI.Sprite(sheet.textures.background));

    const container = new PIXI.Container();
    container.position.set(7, 8);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const tile = new Tile(sheet);
        tile.position.set(col * 40, row * 40);
        tile.interactive = true;
        tile.on('pointertap', () => {
          const event = new CustomEvent('move', { detail: { row, col } });
          this.events.dispatchEvent(event);
        });
        this.tiles[row][col] = tile;
        container.addChild(tile);
      }
    }
    this.app.stage.addChild(container);
  }
}

class Tile extends PIXI.AnimatedSprite {
  constructor() {
    super(textures.empty);
    this.updateAnchor = true;
    this.loop = false;
    this.hitArea = new PIXI.Rectangle(0, 0, 40, 40);
  }

  set(id) {
    this.loop = false;
    switch (id) {
      case constants.EMPTY:
        this.textures = textures.empty;
        break;
      case constants.SLIME:
        this.textures = textures.slime;
        break;
      case constants.BEAN:
        this.textures = textures.bean;
        break;
      case constants.HOLE:
        this.textures = textures.hole;
        break;
    }
  }

  guide() {
    this.textures = textures.guide;
    this.loop = true;
    this.play();
  }

  drop(id) {
    this.textures =
      id === constants.SLIME ? textures.drop_slime : textures.drop_bean;
    this.loop = false;
    this.onComplete = function () {
      this.onComplete = null;
      this.set(id);
    };
    this.play();
  }

  reverse(id) {
    this.textures =
      id === constants.SLIME ? textures.reverse_slime : textures.reverse_bean;
    this.loop = false;
    this.onComplete = function () {
      this.onComplete = null;
      this.set(id);
    };
    this.play();
  }
}

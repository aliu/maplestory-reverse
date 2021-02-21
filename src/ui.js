import * as PIXI from 'pixi.js';
import * as constants from './constants.js';

const sprites = 'assets/spritesheet.json';

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
  }

  async load() {
    await new Promise((resolve) => this.app.loader.add(sprites).load(resolve));

    const sheet = this.app.loader.resources[sprites].spritesheet;
    const animations = {
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

    this.app.stage.addChild(new PIXI.Sprite(sheet.textures.background));

    const container = new PIXI.Container();
    container.position.set(7, 8);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const tile = new Tile(animations);
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
  constructor(animations) {
    super(animations.empty);
    this.animations = animations;
    this.updateAnchor = true;
    this.loop = false;
    this.hitArea = new PIXI.Rectangle(0, 0, 40, 40);
  }

  set(id) {
    this.loop = false;
    switch (id) {
      case constants.EMPTY:
        this.textures = this.animations.empty;
        break;
      case constants.SLIME:
        this.textures = this.animations.slime;
        break;
      case constants.BEAN:
        this.textures = this.animations.bean;
        break;
      case constants.HOLE:
        this.textures = this.animations.hole;
        break;
    }
  }

  guide() {
    this.textures = this.animations.guide;
    this.loop = true;
    this.play();
  }

  drop(id) {
    this.textures =
      id === constants.SLIME
        ? this.animations.drop_slime
        : this.animations.drop_bean;
    this.loop = false;
    this.onComplete = () => {
      this.onComplete = null;
      this.set(id);
    };
    this.play();
  }

  reverse(id) {
    this.textures =
      id === constants.SLIME
        ? this.animations.reverse_slime
        : this.animations.reverse_bean;
    this.loop = false;
    this.onComplete = () => {
      this.onComplete = null;
      this.set(id);
    };
    this.play();
  }
}

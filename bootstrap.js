import * as PIXI from 'pixi.js';

PIXI.Loader.shared
  .add('assets', 'assets/spritesheet.json')
  .load(() => import('./src/index.js').catch(console.error));

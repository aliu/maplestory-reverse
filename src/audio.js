const sounds = {};

function load(name) {
  const audio = new Audio(`assets/sound/${name}.mp3`);
  audio.preload = 'auto';
  sounds[name] = audio;
}

load('criHit');
load('criHit2');
load('draw');
load('dropstone');
load('good');
load('great');
load('lose');
load('normalHit');
load('reverse');
load('start');
load('win');

let volume = 0.5;

export function setVolume(v) {
  volume = v;
}

function play(name, multiplier = 1) {
  const sound = sounds[name];
  if (!sound) {
    return;
  }
  const instance = sound.cloneNode();
  instance.volume = Math.min(1, volume * multiplier);
  instance.play().catch(() => {});
}

export const playCriHit = () => play('criHit');
export const playCriHit2 = () => play('criHit2');
export const playDraw = () => play('draw');
export const playDrop = () => play('dropstone', 0.6);
export const playGood = () => play('good');
export const playGreat = () => play('great');
export const playLose = () => play('lose');
export const playNormalHit = () => play('normalHit', 0.3);
export const playFlip = () => play('reverse');
export const playStart = () => play('start');
export const playWin = () => play('win');

self.onmessage = async (event) => {
  const wasm = await import('maplestory-reverse-wasm');
  const { player, opponent, holes, depth } = event.data;

  const pos = wasm.evaluate(player, opponent, holes, depth);
  self.postMessage(pos);
};

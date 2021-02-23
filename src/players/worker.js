self.onmessage = async (event) => {
  const wasm = await import('maplestory-reverse-wasm');
  const { player, opponent, holes } = event.data;

  const pos = wasm.evaluate(player, opponent, holes, 5);
  self.postMessage(pos);
};

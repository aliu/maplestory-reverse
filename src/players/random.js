export default {
  description: 'random',

  async move({ moves }) {
    return moves[Math.floor(Math.random() * moves.length)];
  },
};

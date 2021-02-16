export default {
  description: 'human',

  async move({ events }) {
    return new Promise((resolve) =>
      events.addEventListener('move', (event) => resolve(event.detail), {
        once: true,
      })
    );
  },
};

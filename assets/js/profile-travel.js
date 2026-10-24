/* The movie has no source until a visitor explicitly starts the journey. */
(() => {
  const root = document.querySelector('[data-profile-journey]');
  if (!root) return;
  const video = root.querySelector('video');
  const button = root.querySelector('button');
  const label = button.querySelector('[data-label]');
  const status = root.querySelector('[data-status]');
  if (!video.canPlayType('video/mp4')) return;
  let requested = false;
  let attempt = 0;

  function restore(message = '') {
    requested = false;
    attempt += 1;
    video.pause();
    root.classList.remove('is-traveling');
    button.setAttribute('aria-pressed', 'false');
    label.textContent = 'travel into the picture';
    status.textContent = message;
  }

  button.hidden = false;
  button.addEventListener('click', () => {
    if (requested) {
      restore('Journey stopped.');
      return;
    }
    requested = true;
    const currentAttempt = ++attempt;
    button.setAttribute('aria-pressed', 'true');
    label.textContent = 'stop the journey';
    status.textContent = 'Preparing the journey.';
    if (!video.hasAttribute('src')) video.src = button.dataset.video;
    video.currentTime = 0;
    // Keep play() in the click handler so mobile browsers retain user activation.
    video.play().catch(() => {
      if (attempt === currentAttempt) restore('The journey could not play. Please try again.');
    });
  });
  video.addEventListener('playing', () => {
    if (!requested) { video.pause(); return; }
    root.classList.add('is-traveling');
    status.textContent = 'Traveling into the picture.';
  });
  video.addEventListener('ended', () => restore('Journey complete.'));
  video.addEventListener('error', () => restore('The journey could not load. Please try again.'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && requested) restore();
  });
  // Explicit playback is available with reduced motion; nothing autoplays.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting && requested) restore();
    }).observe(root);
  }
})();

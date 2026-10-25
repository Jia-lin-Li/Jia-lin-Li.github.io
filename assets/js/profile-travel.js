/* First reveal the spiral; only a later click requests and plays the movie. */
(() => {
  const root = document.querySelector('[data-profile-journey]');
  if (!root) return;
  const video = root.querySelector('video');
  const button = root.querySelector('button');
  const label = button.querySelector('[data-label]');
  const status = root.querySelector('[data-status]');
  if (!video.canPlayType('video/mp4')) return;
  let transformed = false;
  let transforming = false;
  let requested = false;
  let attempt = 0;

  async function transform() {
    if (transforming) return;
    transforming = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    label.textContent = 'transforming…';
    status.textContent = 'Preparing the spiral picture.';
    const picture = root.querySelector('[data-spiral-portrait]').content.firstElementChild.cloneNode(true);
    root.querySelector('.profile-frame').append(picture);
    try {
      await picture.querySelector('img').decode();
      // Establish opacity 0 before revealing, including when the image is cached.
      picture.getBoundingClientRect();
      root.classList.add('is-transformed');
      root.querySelector('[data-source-portrait]').setAttribute('aria-hidden', 'true');
      picture.removeAttribute('aria-hidden');
      transformed = true;
      label.textContent = 'travel into the picture';
      status.textContent = 'Picture transformed. Click again to travel into it.';
    } catch {
      picture.remove();
      label.textContent = 'twist to travel';
      status.textContent = 'The spiral picture could not load. Please try again.';
    } finally {
      transforming = false;
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  }

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
    if (!transformed) {
      transform();
      return;
    }
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

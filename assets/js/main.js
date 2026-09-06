/* Contact and responsive navigation. No external JavaScript dependencies. */
(() => {
  'use strict';

  const contact = document.querySelector('.author__urls-wrapper');
  const contactButton = contact && contact.querySelector('button');
  const contactLinks = contact && contact.querySelector('.author__urls');
  const nav = document.querySelector('#site-nav');
  const navButton = nav && nav.querySelector('button');
  const visibleLinks = nav && nav.querySelector('.visible-links');
  const overflowLinks = nav && nav.querySelector('.hidden-links');

  function setContact(open) {
    if (!contactButton) return;
    contactButton.setAttribute('aria-expanded', String(open));
    contactLinks.classList.toggle('is-open', open);
  }

  function setNavigation(open) {
    if (!navButton) return;
    navButton.setAttribute('aria-expanded', String(open));
    navButton.classList.toggle('close', open);
    overflowLinks.classList.toggle('hidden', !open);
  }

  function updateNavigation() {
    if (!navButton) return;
    const focused = document.activeElement;
    const wasOpen = navButton.getAttribute('aria-expanded') === 'true';
    while (overflowLinks.firstElementChild) {
      visibleLinks.append(overflowLinks.firstElementChild);
    }
    navButton.classList.add('hidden');
    if (visibleLinks.offsetWidth > nav.clientWidth) {
      navButton.classList.remove('hidden');
      const available = nav.clientWidth - navButton.offsetWidth - 30;
      while (visibleLinks.children.length > 1 && visibleLinks.offsetWidth > available) {
        overflowLinks.prepend(visibleLinks.lastElementChild);
      }
    }
    const hasOverflow = overflowLinks.children.length > 0;
    navButton.classList.toggle('hidden', !hasOverflow);
    setNavigation(hasOverflow && (wasOpen || overflowLinks.contains(focused)));
  }

  if (contactButton) {
    contactButton.addEventListener('click', () => {
      setContact(contactButton.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (navButton) {
    navButton.addEventListener('click', () => {
      setNavigation(navButton.getAttribute('aria-expanded') !== 'true');
    });
  }

  document.addEventListener('click', event => {
    if (contact && !contact.contains(event.target)) setContact(false);
    if (nav && !nav.contains(event.target)) setNavigation(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (contactButton && contactButton.getAttribute('aria-expanded') === 'true') {
      if (contact.contains(document.activeElement)) contactButton.focus();
      setContact(false);
    }
    if (navButton && navButton.getAttribute('aria-expanded') === 'true') {
      if (nav.contains(document.activeElement)) navButton.focus();
      setNavigation(false);
    }
  });

  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      setContact(false);
      updateNavigation();
    });
  });
  updateNavigation();
})();

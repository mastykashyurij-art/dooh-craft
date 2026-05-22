(function () {
  'use strict';

  // ── PRELOADER ──────────────────────────────────────────────
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const MIN_MS = 3900; // match animation duration
    const t0 = Date.now();
    function hidePreloader() {
      const wait = Math.max(0, MIN_MS - (Date.now() - t0));
      setTimeout(() => preloader.classList.add('hidden'), wait);
    }
    if (document.readyState === 'complete') {
      hidePreloader();
    } else {
      window.addEventListener('load', hidePreloader, { once: true });
    }
  }

  const progressBar = document.getElementById('scrollProgress');
  const MIN_OPACITY = 0.0;
  const PLATEAU = 0.34;
  let fadeEls = [];

  function scrollFraction() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.min(Math.max(window.scrollY / docHeight, 0), 1) : 0;
  }

  function updateFades() {
    const vpCenter = window.innerHeight / 2;
    const maxDist  = window.innerHeight / 2;
    for (let i = 0; i < fadeEls.length; i++) {
      const rect = fadeEls[i].getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      let t = Math.min(Math.abs(elCenter - vpCenter) / maxDist, 1);
      t = t <= PLATEAU ? 0 : (t - PLATEAU) / (1 - PLATEAU);
      const eased = t * t * (3 - 2 * t);
      fadeEls[i].style.opacity = (1 - eased * (1 - MIN_OPACITY)).toFixed(3);
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const frac = scrollFraction();
      if (progressBar) progressBar.style.width = (frac * 100) + '%';
      const header = document.getElementById('siteHeader');
      if (header) header.classList.toggle('scrolled', window.scrollY > 60);
      updateFades();
      ticking = false;
    });
  }

  function init() {
    fadeEls = Array.from(document.querySelectorAll('.scroll-fade'));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateFades, { passive: true });

    const previewBox = document.getElementById('beerPreview');
    const previewImg = document.getElementById('beerPreviewImg');
    let activeCard = null;
    let lastScrollY = window.scrollY;

    function hidePreview() {
      previewBox.classList.remove('visible');
      activeCard = null;
    }

    const cards = Array.from(document.querySelectorAll('[data-preview]'));

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeCard === card) {
          hidePreview();
        } else {
          const speed = card.dataset.previewSpeed || '0.7s';
          previewBox.style.transition = `opacity ${speed} ease, transform ${speed} ease`;
          previewImg.src = card.dataset.preview;
          previewBox.classList.add('visible');
          activeCard = card;
          lastScrollY = window.scrollY;
        }
      });
    });

    // Dismiss on click anywhere outside a beer card
    document.addEventListener('click', (e) => {
      if (activeCard && !e.target.closest('[data-preview]')) {
        hidePreview();
      }
    });

    // Dismiss on scroll
    window.addEventListener('scroll', () => {
      if (activeCard && Math.abs(window.scrollY - lastScrollY) > 60) {
        hidePreview();
      }
    }, { passive: true });
  }

  // Mobile nav
  const navToggle = document.getElementById('navToggle');
  const siteNav   = document.getElementById('siteNav');

  navToggle?.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen.toString());
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  siteNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && siteNav.classList.contains('open')) {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

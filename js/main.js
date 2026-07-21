/* =========================================================
   THE CALCUTTA CANTEEN — MAIN JAVASCRIPT
   Scroll animations, parallax, cursor, micro-interactions
   ========================================================= */

(function () {
  'use strict';

  /* ── Helpers ── */
  const qs  = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ── Custom Cursor ── */
  const cursor     = qs('#cursor');
  const cursorRing = qs('#cursor-ring');
  let mx = 0, my = 0;
  let cx = 0, cy = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateCursor() {
    cx = lerp(cx, mx, 0.35);
    cy = lerp(cy, my, 0.35);
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);

    if (cursor)     { cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px'; }
    if (cursorRing) { cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px'; }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // hover states
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('a, button, [data-hover], .menu-item-card, .mosaic-item, .ingredient-obj, .review-card');
    if (t) document.body.classList.add('hovering');
  });
  document.addEventListener('mouseout', e => {
    const t = e.target.closest('a, button, [data-hover], .menu-item-card, .mosaic-item, .ingredient-obj, .review-card');
    if (t) document.body.classList.remove('hovering');
  });

  /* ── Navigation ── */
  const nav = qs('#nav');
  function updateNav() {
    if (window.scrollY > 40) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ── Arrival: hero parallax + camera push ── */
  const arrivalBg = qs('.arrival-bg');

  function parallaxArrival() {
    const scrollY = window.scrollY;
    if (arrivalBg) {
      const translateY = scrollY * 0.35;
      arrivalBg.style.transform = `translateY(${translateY}px) scale(${1 + scrollY * 0.0002})`;
    }
  }

  /* ── Discovery: ingredient parallax on scroll + cursor tilt ── */
  const ingObjs = qsa('.ingredient-obj');
  const ingRates = [0.08, 0.14, 0.06]; // parallax speed per layer

  function parallaxIngredients() {
    const discEl = qs('#discovery');
    if (!discEl) return;
    const rect  = discEl.getBoundingClientRect();
    const progress = -rect.top / window.innerHeight;

    ingObjs.forEach((el, i) => {
      const rate  = ingRates[i] || 0.1;
      const shift = progress * 120 * rate * (i % 2 === 0 ? 1 : -1);
      el.style.transform = `translateY(${shift}px)`;
    });
  }

  // cursor tilt on ingredient objects
  ingObjs.forEach(obj => {
    obj.addEventListener('mousemove', e => {
      const rect = obj.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width  / 2;
      const relY = e.clientY - rect.top  - rect.height / 2;
      const rotX = (relY / rect.height) * -3;
      const rotY = (relX / rect.width)  *  3;
      obj.querySelector('img').style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      obj.querySelector('img').style.transition = 'transform 0.15s ease';
    });
    obj.addEventListener('mouseleave', () => {
      obj.querySelector('img').style.transform = '';
      obj.querySelector('img').style.transition = 'transform 0.6s ease';
    });
  });

  /* ── Room section: pan image + cursor glow ── */
  const roomPanImg = qs('.room-pan-img');
  const roomGlow   = qs('.room-glow');
  const roomSection = qs('#the-room');

  function parallaxRoom() {
    if (!roomSection) return;
    const rect     = roomSection.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
    if (roomPanImg) {
      const panX = (progress - 0.5) * 10;
      roomPanImg.style.transform = `translateX(${-15 + panX}%)`;
    }
  }

  if (roomSection) {
    roomSection.addEventListener('mousemove', e => {
      if (roomGlow) {
        const rect = roomSection.getBoundingClientRect();
        roomGlow.style.left = (e.clientX - rect.left) + 'px';
        roomGlow.style.top  = (e.clientY - rect.top)  + 'px';
        roomGlow.style.opacity = '1';
      }
    });
    roomSection.addEventListener('mouseleave', () => {
      if (roomGlow) roomGlow.style.opacity = '0';
    });
  }

  /* ── Master scroll handler ── */
  function onScroll() {
    parallaxArrival();
    parallaxIngredients();
    parallaxRoom();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── IntersectionObserver: reveal animations ── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  qsa('.reveal-up, .craft-item, .mosaic-item, .disc-caption, .room-headline, .room-desc').forEach(el => {
    revealObs.observe(el);
  });

  /* ── Craft section: stagger items ── */
  const craftItems = qsa('.craft-item');
  const craftObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(craftItems).indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.18}s`;
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });

  craftItems.forEach(el => craftObs.observe(el));

  /* ── Mosaic: staggered reveal ── */
  const mosaicItems = qsa('.mosaic-item');
  const mosaicObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(mosaicItems).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 180);
      }
    });
  }, { threshold: 0.1 });

  mosaicItems.forEach(el => mosaicObs.observe(el));

  /* ── Discovery captions stagger ── */
  const discCaptions = qsa('.disc-caption');
  const discObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(discCaptions).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 220);
      }
    });
  }, { threshold: 0.2 });

  discCaptions.forEach(el => discObs.observe(el));

  /* ── Reviews strip: duplicate items for seamless loop ── */
  const track = qs('.reviews-track');
  if (track) {
    const items   = qsa('.review-card', track);
    const clones  = items.map(el => el.cloneNode(true));
    clones.forEach(c => track.appendChild(c));
  }

  /* ── Ticker: duplicate for seamless loop ── */
  const tickerTrack = qs('.ticker-track');
  if (tickerTrack) {
    const clone = tickerTrack.cloneNode(true);
    tickerTrack.parentElement.appendChild(clone);
  }

  /* ── Candle flicker SVG/CSS (Section 4) ── */
  const candleEl = qs('.candle-flame');
  if (candleEl) {
    setInterval(() => {
      const intensity = 0.85 + Math.random() * 0.15;
      const skewX = (Math.random() - 0.5) * 6;
      candleEl.style.opacity   = intensity;
      candleEl.style.transform = `skewX(${skewX}deg) scaleY(${0.92 + Math.random() * 0.08})`;
    }, 120);
  }

  /* ── Reservation form ── */
  const resForm = qs('#res-form');
  if (resForm) {
    resForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = resForm.querySelector('.res-btn');
      btn.textContent = 'Request Received — We\'ll Confirm Shortly';
      btn.style.background = '#3D5068';
      btn.disabled = true;
      // In production: POST to backend / WhatsApp API / booking system
    });

    // Set min date to today
    const dateInput = resForm.querySelector('input[type="date"]');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }
  }

  /* ── Audio toggle (ambient) ── */
  const audioToggle = qs('#audio-toggle');
  let audioPlaying  = false;
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      audioPlaying = !audioPlaying;
      audioToggle.setAttribute('data-playing', audioPlaying);
      audioToggle.title = audioPlaying ? 'Mute ambient audio' : 'Play ambient audio';
    });
  }

  /* ── Smooth anchor scroll ── */
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = qs(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Section transition: trust section lightens bg ── */
  const trustSection = qs('#trust');
  if (trustSection) {
    const trustObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        document.body.classList.toggle('in-trust', entry.isIntersecting);
      });
    }, { threshold: 0.3 });
    trustObs.observe(trustSection);
  }

  /* ── Menu item cards: reveal ingredient story on hover ── */
  qsa('.menu-item-card').forEach(card => {
    card.addEventListener('touchstart', () => card.classList.toggle('hovered'));
  });

  console.log(
    '%cThe Calcutta Canteen',
    'font-size:18px; font-family: Georgia, serif; font-style: italic; color: #C9843A;',
    '\nDurgapur\'s Mediterranean dining room. Come inside.'
  );
})();

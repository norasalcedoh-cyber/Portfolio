document.addEventListener('DOMContentLoaded', () => {

  // ── FANCYBOX ───────────────────────────────────────────
  // Elimina el hash de la URL antes de que Fancybox lo lea
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  if (window.Fancybox) {
    Fancybox.bind('[data-fancybox]', {
      Thumbs: false,
      Hash: false,
      Toolbar: {
        display: { left: [], middle: [], right: ['close'] },
      },
    });
  }

  // ── ESTRELLAS ──────────────────────────────────────────
  const starsBg = document.querySelector('.stars-bg');
  const stars = [];

  if (starsBg) {
    const COLS = 26, ROWS = 22;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const el = document.createElement('span');
        el.classList.add('star');
        el.textContent = '★';

        const baseRotation = Math.random() * 360;
        const dir = (r + c) % 2 === 0 ? 1 : -1;

        el.style.left = `${(c / (COLS - 1)) * 100}%`;
        el.style.top  = `${(r / (ROWS - 1)) * 100}%`;
        el.style.setProperty('--star-size',    `${0.7 + Math.random() * 0.9}rem`);
        el.style.setProperty('--star-opacity', `${0.4 + Math.random() * 0.25}`);
        el.style.transformOrigin = 'center center';

        starsBg.appendChild(el);
        stars.push({ el, baseRotation, dir });
      }
    }

    window.addEventListener('scroll', () => {
      const deg = window.scrollY * 0.28;
      stars.forEach(({ el, baseRotation, dir }) => {
        el.style.transform = `rotate(${baseRotation + dir * deg}deg)`;
      });
    }, { passive: true });
  }

  // ── CINTA DE IMÁGENES — solo galería del index ─────────
  const isResponsive = window.matchMedia('(max-width: 900px)').matches;

  document.querySelectorAll('.gallery-section .project-row').forEach((row, i) => {
    const track    = row.querySelector('.project-row__track');
    const viewport = row.querySelector('.project-row__images');
    if (!track || !viewport) return;

    // En tablet/móvil: scroll manual, sin animación
    if (isResponsive) return;

    // Duplicar hijos para loop sin salto visible
    [...track.children].forEach(child => track.appendChild(child.cloneNode(true)));

    requestAnimationFrame(() => {
      const half   = track.scrollWidth / 2;
      const speed  = 100;
      const dur    = half / speed;
      const goLeft = i % 2 === 0;

      const tween = gsap.fromTo(
        track,
        { x: goLeft ? 0 : -half },
        { x: goLeft ? -half : 0, duration: dur, ease: 'none', repeat: -1 }
      );

      // Curva de velocidad: acelera y frena en ola continua
      const pulse = { rate: 0.7 };
      const pulseTween = gsap.to(pulse, {
        rate: 1.6,
        duration: 3.5 + i * 0.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        onUpdate: () => tween.timeScale(pulse.rate),
      });

      viewport.addEventListener('mouseenter', () => {
        pulseTween.pause();
        gsap.to(tween, { timeScale: 0.08, duration: 0.8, ease: 'power2.out' });
      });
      viewport.addEventListener('mouseleave', () => {
        gsap.to(tween, {
          timeScale: pulse.rate,
          duration: 1,
          ease: 'power2.inOut',
          onComplete: () => pulseTween.resume(),
        });
      });
    });
  });

  // ── HOVER ESCALA en imágenes individuales ──────────────
  document.querySelectorAll('.project-image').forEach(card => {
    const media = card.querySelector('img, video');
    if (!media) return;

    card.addEventListener('mouseenter', () =>
      gsap.to(media, { scale: 1.08, duration: 0.5, ease: 'power2.out' })
    );
    card.addEventListener('mouseleave', () =>
      gsap.to(media, { scale: 1, duration: 0.5, ease: 'power2.out' })
    );
  });

});

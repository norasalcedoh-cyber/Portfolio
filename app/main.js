document.addEventListener('DOMContentLoaded', () => {

  // ── FANCYBOX ───────────────────────────────────────────
  // Elimina el hash de la URL antes de que Fancybox lo lea
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  // ── CURSOR NAV FANCYBOX ────────────────────────────────
  const PINK = '#ff1fad';
  let fbArrow = null;
  let fbContainer = null;

  function fbInject() {
    fbContainer = document.querySelector('.fancybox__container');
    if (!fbContainer || fbContainer.dataset.fbUi) return;
    fbContainer.dataset.fbUi = '1';

    const mobile = window.matchMedia('(max-width:900px)').matches;

    // × cerrar
    const x = document.createElement('button');
    x.textContent = '×';
    x.style.cssText = 'position:fixed;top:16px;right:16px;z-index:2147483647;display:flex;align-items:center;justify-content:center;width:52px;height:52px;color:' + PINK + ';font-size:2.8rem;line-height:1;background:none;border:none;cursor:pointer;padding:0;font-family:Arial,sans-serif;-webkit-tap-highlight-color:transparent;';
    fbContainer.appendChild(x);
    x.addEventListener('click',    e => { e.stopPropagation(); window.Fancybox.close(); });
    x.addEventListener('touchend', e => { e.preventDefault(); e.stopPropagation(); window.Fancybox.close(); });

    if (!mobile) {
      fbArrow = document.createElement('div');
      fbArrow.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;font-size:10rem;line-height:1;-webkit-text-stroke:2px ' + PINK + ';color:transparent;transform:translate(-50%,-55%);opacity:0;transition:opacity .1s;user-select:none;font-family:"Britanica",Arial,sans-serif;';
      fbContainer.appendChild(fbArrow);
      document.body.style.cursor = 'none';
    }
  }

  function fbCleanup() {
    if (fbContainer) delete fbContainer.dataset.fbUi;
    fbArrow = null;
    fbContainer = null;
    document.body.style.cursor = '';
  }

  // Desktop: flecha sigue cursor
  document.addEventListener('mousemove', e => {
    if (!fbArrow) return;
    fbArrow.textContent = e.clientX < window.innerWidth / 2 ? '‹' : '›';
    fbArrow.style.left    = e.clientX + 'px';
    fbArrow.style.top     = e.clientY + 'px';
    fbArrow.style.opacity = '1';
  });

  // Navegación click/tap — capture para interceptar antes que Fancybox
  document.addEventListener('click', e => {
    if (!fbContainer) return;
    if (!fbContainer.contains(e.target)) return;
    if (e.target.closest('button')) return;  // deja pasar clicks en botones (×)
    e.stopPropagation(); e.preventDefault();
    const c = window.Fancybox?.getCarousel();
    if (c) e.clientX < window.innerWidth / 2 ? c.prev() : c.next();
  }, true);

  if (window.Fancybox) {
    Fancybox.bind('[data-fancybox]', {
      Thumbs:      false,
      Hash:        false,
      closeButton: false,
      Toolbar:     { display: { left: [], middle: [], right: [] } },
      on: {
        init:    () => setTimeout(fbInject, 0),
        destroy: ()  => fbCleanup(),
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

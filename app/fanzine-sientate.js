document.addEventListener('DOMContentLoaded', () => {
  fetch('data/fanzine-sientate.json')
    .then(r => r.json())
    .then(d => init(d))
    .catch(err => console.error('Error cargando datos del proyecto:', err));
});

function init(d) {
  document.querySelector('.proyecto-detail')?.classList.add('proyecto-detail--fanzine');

  // ── ESTRELLAS ──────────────────────────────────────────
  const starsBg = document.querySelector('.stars-bg');
  if (starsBg) {
    const COLS = 26, ROWS = 22;
    const stars = [];

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

  // ── TÍTULO DE PÁGINA ──────────────────────────────────
  if (d.titulo_pagina) document.title = d.titulo_pagina;

  // ── HERO ──────────────────────────────────────────────
  const hero = document.querySelector('.proyecto__hero');
  if (hero && d.hero) {
    hero.innerHTML = `<img src="${d.hero.src}" alt="${d.hero.alt}" />`;
  }

  // ── CABECERA ──────────────────────────────────────────
  const cabecera = document.querySelector('.proyecto__cabecera');
  if (cabecera) {
    cabecera.innerHTML = `
      <p class="proyecto__categoria">${d.categoria}</p>
      <div class="proyecto__cabecera-izq">
        <h2 class="proyecto__titulo">${d.titulo}</h2>
        <p class="proyecto__subtitulo">${d.subtitulo}</p>
      </div>
      <p class="proyecto__intro">${d.intro}</p>
    `;
  }

  // ── METADATA ──────────────────────────────────────────
  const meta = document.querySelector('.proyecto__meta');
  if (meta && d.meta) {
    meta.innerHTML = d.meta.map(item => `
      <div class="proyecto__meta-item">
        <span class="proyecto__meta-label">${item.label}</span>
        <span class="proyecto__meta-valor">${item.valor}</span>
      </div>
    `).join('');
  }

  // ── CUERPO ────────────────────────────────────────────
  const cuerpo = document.querySelector('.proyecto__cuerpo');
  if (cuerpo && d.bloques) {
    cuerpo.innerHTML = d.bloques.map(renderBloque).join('');
  }

  // ── NAVEGACIÓN ────────────────────────────────────────
  const nav = document.querySelector('.proyecto__nav');
  if (nav && d.nav) {
    const prev = d.nav.prev
      ? `<a href="${d.nav.prev.href}" class="proyecto__nav-item proyecto__nav-item--prev">
           <span class="proyecto__nav-dir">← Proyecto anterior</span>
           <img class="proyecto__nav-thumb" src="${d.nav.prev.thumb}" alt="${d.nav.prev.alt}" />
           <span class="proyecto__nav-nombre">${d.nav.prev.nombre}</span>
         </a>`
      : `<div class="proyecto__nav-item"></div>`;

    const next = d.nav.next
      ? `<a href="${d.nav.next.href}" class="proyecto__nav-item proyecto__nav-item--next">
           <span class="proyecto__nav-dir">Proyecto siguiente →</span>
           ${d.nav.next.thumb
             ? d.nav.next.thumb.endsWith('.mp4')
               ? `<video class="proyecto__nav-thumb" preload="metadata" src="${d.nav.next.thumb}" autoplay muted loop playsinline></video>`
               : `<img class="proyecto__nav-thumb" src="${d.nav.next.thumb}" alt="${d.nav.next.alt}" />`
             : ''}
           <span class="proyecto__nav-nombre">${d.nav.next.nombre}</span>
         </a>`
      : `<div class="proyecto__nav-item proyecto__nav-item--next"></div>`;

    nav.innerHTML = prev + next;
  }

  // ── FADE-IN SCROLL ────────────────────────────────────
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.proyecto__bloque').forEach(el => observer.observe(el));

  // ── MARQUEES ──────────────────────────────────────────
  initMarquees();
}

function initMarquees() {
  if (window.matchMedia('(max-width: 900px)').matches) return;

  document.querySelectorAll('.proyecto__marquee').forEach((viewport, index) => {
    const track = viewport.querySelector('.proyecto__marquee-track');
    if (!track) return;

    [...track.children].forEach(child => {
      track.appendChild(child.cloneNode(true));
    });

    const halfWidth = track.scrollWidth / 2;
    const goLeft = index % 2 === 0;
    const duration = 40;

    const tween = gsap.fromTo(
      track,
      { x: goLeft ? 0 : -halfWidth },
      { x: goLeft ? -halfWidth : 0, duration, ease: 'none', repeat: -1 }
    );

    viewport.addEventListener('mouseenter', () => {
      gsap.to(tween, { timeScale: 0, duration: 0.5, ease: 'power2.out' });
    });
    viewport.addEventListener('mouseleave', () => {
      gsap.to(tween, { timeScale: 1, duration: 0.8, ease: 'power2.inOut' });
    });
  });
}

function renderBloque(b) {
  switch (b.tipo) {

    case 'full':
      return `
        <div class="proyecto__bloque proyecto__bloque--full">
          <img loading="lazy" decoding="async" src="${b.src}" alt="${b.alt}" />
          ${b.caption ? `<p class="proyecto__caption">${b.caption}</p>` : ''}
        </div>`;

    case 'img':
      return `
        <div class="proyecto__bloque proyecto__bloque--img">
          <img loading="lazy" decoding="async" src="${b.src}" alt="${b.alt}" />
          ${b.caption ? `<p class="proyecto__caption">${b.caption}</p>` : ''}
        </div>`;

    case 'duo':
      return `
        <div class="proyecto__bloque proyecto__bloque--duo">
          ${b.items.map(item => `
            <div>
              <img loading="lazy" decoding="async" src="${item.src}" alt="${item.alt}" />
              ${item.caption ? `<p class="proyecto__caption">${item.caption}</p>` : ''}
            </div>
          `).join('')}
        </div>`;

    case 'texto':
      return `
        <div class="proyecto__bloque proyecto__bloque--texto">
          ${b.parrafos.map(p => `<p>${p}</p>`).join('')}
        </div>`;

    case 'texto-duo':
      return `
        <div class="proyecto__bloque proyecto__bloque--texto-duo">
          ${b.parrafos.map(p => `<p>${p}</p>`).join('')}
        </div>`;

    case 'marquee':
      return `
        <div class="proyecto__bloque proyecto__bloque--marquee">
          <div class="proyecto__marquee">
            <div class="proyecto__marquee-track">
              ${b.items.map(item => `<img loading="lazy" decoding="async" src="${item.src}" alt="${item.alt}" />`).join('')}
            </div>
          </div>
          ${b.caption ? `<p class="proyecto__caption">${b.caption}</p>` : ''}
        </div>`;

    default:
      return '';
  }
}

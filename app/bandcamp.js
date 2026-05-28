document.addEventListener('DOMContentLoaded', () => {
  fetch('data/bandcamp.json')
    .then(r => r.json())
    .then(d => init(d))
    .catch(err => console.error('Error cargando datos del proyecto:', err));
});

function init(d) {

  if (d.titulo_pagina) document.title = d.titulo_pagina;

  const hero = document.querySelector('.proyecto__hero');
  if (hero && d.hero) {
    hero.innerHTML = `<img src="${d.hero.src}" alt="${d.hero.alt}" />`;
  }

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

  const meta = document.querySelector('.proyecto__meta');
  if (meta && d.meta) {
    meta.innerHTML = d.meta.map(item => `
      <div class="proyecto__meta-item">
        <span class="proyecto__meta-label">${item.label}</span>
        <span class="proyecto__meta-valor">${item.valor}</span>
      </div>
    `).join('');
  }

  const cuerpo = document.querySelector('.proyecto__cuerpo');
  if (cuerpo && d.bloques) {
    cuerpo.innerHTML = d.bloques.map(renderBloque).join('');
    document.querySelectorAll('[data-pdf]').forEach(el => initRevista(el));
  }

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
           <img class="proyecto__nav-thumb" src="${d.nav.next.thumb}" alt="${d.nav.next.alt}" />
           <span class="proyecto__nav-nombre">${d.nav.next.nombre}</span>
         </a>`
      : `<div class="proyecto__nav-item proyecto__nav-item--next"></div>`;

    nav.innerHTML = prev + next;
  }

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

  initMarquees();
}

function initMarquees() {
  if (window.matchMedia('(max-width: 900px)').matches) return;

  document.querySelectorAll('.proyecto__marquee').forEach((viewport, index) => {
    const track = viewport.querySelector('.proyecto__marquee-track');
    if (!track) return;

    [...track.children].forEach(child => track.appendChild(child.cloneNode(true)));

    const halfWidth = track.scrollWidth / 2;
    const goLeft = index % 2 === 0;

    const tween = gsap.fromTo(
      track,
      { x: goLeft ? 0 : -halfWidth },
      { x: goLeft ? -halfWidth : 0, duration: 40, ease: 'none', repeat: -1 }
    );

    viewport.addEventListener('mouseenter', () =>
      gsap.to(tween, { timeScale: 0, duration: 0.5, ease: 'power2.out' }));
    viewport.addEventListener('mouseleave', () =>
      gsap.to(tween, { timeScale: 1, duration: 0.8, ease: 'power2.inOut' }));
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
    case 'pdf-revista':
      return `
        <div class="proyecto__bloque proyecto__bloque--revista" data-pdf="${b.src}">
          <div class="revista">
            <canvas class="revista__canvas"></canvas>
            <div class="revista__barra"></div>
          </div>
          ${b.caption ? `<p class="proyecto__caption">${b.caption}</p>` : ''}
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

function initRevista(block) {
  const src    = block.dataset.pdf;
  const canvas = block.querySelector('.revista__canvas');
  const barra  = block.querySelector('.revista__barra');

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  script.onload = async () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    let pdf, total, pages;
    try {
      pdf   = await pdfjsLib.getDocument(src).promise;
      total = pdf.numPages;
      pages = [];

      const SCALE = Math.min(window.devicePixelRatio || 1, 2) * 1.5;
      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const vp   = page.getViewport({ scale: SCALE });
        const c    = document.createElement('canvas');
        c.width  = vp.width;
        c.height = vp.height;
        await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        pages.push(c);
      }
    } catch (e) {
      console.error('PDF no cargado:', e);
      return;
    }

    canvas.width  = pages[0].width;
    canvas.height = pages[0].height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(pages[0], 0, 0);

    let current = 0;
    const HALF  = 380;

    function updateBarra(i) {
      if (barra) barra.style.width = ((i + 1) / total * 100) + '%';
    }
    updateBarra(0);

    function flipTo(next) {
      next = ((next % total) + total) % total;
      let t0 = null;

      function out(ts) {
        if (!t0) t0 = ts;
        const p    = Math.min((ts - t0) / HALF, 1);
        const ease = 1 - (1 - p) * (1 - p);
        canvas.style.transform = `perspective(1400px) rotateY(${ease * -90}deg)`;
        if (p < 1) { requestAnimationFrame(out); return; }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(pages[next], 0, 0);
        current = next;
        updateBarra(current);
        canvas.style.transform = 'perspective(1400px) rotateY(90deg)';

        let t1 = null;
        function inn(ts2) {
          if (!t1) t1 = ts2;
          const p2    = Math.min((ts2 - t1) / HALF, 1);
          const ease2 = 1 - (1 - p2) * (1 - p2);
          canvas.style.transform = `perspective(1400px) rotateY(${(1 - ease2) * 90}deg)`;
          if (p2 < 1) { requestAnimationFrame(inn); return; }
          canvas.style.transform = '';
        }
        requestAnimationFrame(inn);
      }
      requestAnimationFrame(out);
    }

    setInterval(() => flipTo(current + 1), 3000);
  };
  document.head.appendChild(script);
}

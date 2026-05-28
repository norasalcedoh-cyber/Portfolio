(function () {
  // ── INYECTAR CSS ─────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @media(hover:hover) and (pointer:fine){body,a,button{cursor:none}}
    .cursor{position:fixed;top:0;left:0;pointer-events:none;z-index:99999;will-change:transform;font-size:1.3rem;color:#ff1fad;line-height:1;user-select:none;transition:font-size .18s ease,opacity .18s ease}
    .cursor::before{content:"★";display:block}
    .cursor.cursor--hover{font-size:2.4rem;opacity:.35}
    .cursor-trail{position:fixed;top:0;left:0;pointer-events:none;z-index:99997;color:#ff1fad;line-height:1;user-select:none;will-change:transform}
    @media(hover:none),(pointer:coarse){.cursor,.cursor-trail{display:none}}
  `;
  document.head.appendChild(style);

  // Estrella del nav — rota en scroll
  const navTitle = document.querySelector('.site-title');
  if (navTitle) {
    window.addEventListener('scroll', () => {
      navTitle.style.setProperty('--nav-star-rot', (window.scrollY * 0.3) + 'deg');
    }, { passive: true });
  }

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // ── ESTELA ───────────────────────────────────────────────
  const TRAIL = 5;
  const trails = Array.from({ length: TRAIL }, () => {
    const el = document.createElement('span');
    el.className = 'cursor-trail';
    el.textContent = '★';
    document.body.appendChild(el);
    return { el, x: -200, y: -200 };
  });

  let mouseX = -200, mouseY = -200;
  let curX   = -200, curY   = -200;
  let started = false;

  function tick() {
    curX += (mouseX - curX) * 0.15;
    curY += (mouseY - curY) * 0.15;
    cursor.style.transform = `translate(calc(${curX}px - 50%), calc(${curY}px - 50%))`;

    let px = curX, py = curY;
    trails.forEach((t, i) => {
      t.x += (px - t.x) * 0.12;
      t.y += (py - t.y) * 0.12;
      const p = (i + 1) / (TRAIL + 1);
      t.el.style.opacity   = (0.28 * (1 - p)).toFixed(3);
      t.el.style.fontSize  = (0.9 - p * 0.5) + 'rem';
      t.el.style.transform = `translate(calc(${t.x}px - 50%), calc(${t.y}px - 50%))`;
      px = t.x;
      py = t.y;
    });

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  window.addEventListener('mousemove', (e) => {
    if (!started) {
      curX = e.clientX; curY = e.clientY;
      trails.forEach(t => { t.x = e.clientX; t.y = e.clientY; });
      started = true;
    }
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  const interactive = 'a, button, [data-fancybox], .project-image, .project-card, .f-button';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) cursor.classList.add('cursor--hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) cursor.classList.remove('cursor--hover');
  });
})();

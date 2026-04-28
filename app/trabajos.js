document.addEventListener('DOMContentLoaded', () => {

  const viewport = document.querySelector('.trabajos-index__marquee');
  const track    = document.querySelector('.trabajos-index__track');
  if (!track || !viewport) return;

  // Tablet/móvil: scroll nativo, sin GSAP
  if (window.matchMedia('(max-width: 900px)').matches) {
    document.querySelectorAll('.project-card video').forEach(video => {
      const obs = new IntersectionObserver(
        entries => entries.forEach(e => e.isIntersecting ? video.play() : video.pause()),
        { threshold: 0.3 }
      );
      obs.observe(video);
    });
    return;
  }

  // Desktop: carrusel infinito con GSAP
  const originals = [...track.children];
  originals.forEach(child => track.appendChild(child.cloneNode(true)));
  originals.forEach(child => track.appendChild(child.cloneNode(true)));

  const oneSet = track.scrollWidth / 3;

  const tween = gsap.fromTo(
    track,
    { x: 0 },
    { x: -oneSet, duration: 32, ease: 'none', repeat: -1 }
  );

  const pulse = { rate: 0.8 };
  gsap.to(pulse, {
    rate: 1.5, duration: 4.5, ease: 'sine.inOut', repeat: -1, yoyo: true,
    onUpdate: () => tween.timeScale(pulse.rate)
  });

  viewport.addEventListener('mouseenter', () =>
    gsap.to(tween, { timeScale: 0.06, duration: 0.5, ease: 'power2.out' }));
  viewport.addEventListener('mouseleave', () =>
    gsap.to(tween, { timeScale: 1, duration: 0.8, ease: 'power2.inOut' }));

});

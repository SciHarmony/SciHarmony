// ================= SciHarmony App =================

// Impact Counter
document.addEventListener('DOMContentLoaded', async () => {
  const el = document.querySelector('#impact-counters');
  if (!el) return;

  try {
    const res = await fetch('data/impact.json');
    if (!res.ok) return;
    const data = await res.json();

    const items = [
      ['Clinic-prep kits', data.kits_distributed],
      ['Preparedness (pre→post)', `${data.preparedness_pre}→${data.preparedness_post}`],
      ['Mirror-tolerance change', `${(data.mirror_tolerance_change_seconds>0?'+':'')}${data.mirror_tolerance_change_seconds}s`],
      ['Ortho Lab sessions', data.ortho_sessions],
      ['Students served', data.students_served],
      ['Volunteers trained', data.volunteers_trained]
    ];

    el.innerHTML = items
      .map(([k, v]) => `
        <div class="kpi lift">
          <div class="num">${v ?? '—'}</div>
          <div class="lbl">${k}</div>
        </div>
      `)
      .join('');

    // Count-up for numeric tiles
    el.querySelectorAll('.num').forEach(num => {
      const target = parseInt(num.textContent, 10);
      if (isNaN(target)) return;
      let cur = 0;
      const step = Math.max(1, Math.round(target / 60));
      const tick = () => {
        cur = Math.min(target, cur + step);
        num.textContent = cur;
        if (cur < target) requestAnimationFrame(tick);
      };
      tick();
    });
  } catch (err) {
    console.warn('Impact data load failed:', err);
  }
});

// Parallax Hero (layered background shift)
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const midSpeed = 0.25, fgSpeed = 0.12;
  function onScroll() {
    const y = window.scrollY || 0;
    hero.style.backgroundPosition =
      `center ${50 + Math.round(y*fgSpeed)}px, center ${50 + Math.round(y*midSpeed)}px, center 50%`;
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Dropdown aria-expanded Accessibility
document.querySelectorAll('.main-nav .has-dropdown > a').forEach(link => {
  const li = link.parentElement;
  const set = v => link.setAttribute('aria-expanded', v ? 'true' : 'false');
  li.addEventListener('mouseenter', () => set(true));
  li.addEventListener('mouseleave', () => set(false));
  link.addEventListener('focus', () => set(true));
  li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) set(false); });
});

// Reveal on Scroll
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

console.log("SciHarmony app loaded.");
window.addEventListener('load', () => document.body.classList.add('loaded'));

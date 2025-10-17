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

// ---- Parallax Hero (CSS-variable drift; plays nice with backgrounds)
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  function onScroll() {
    // nudge the tiled dental icons layer a bit
    hero.style.setProperty('--bg-drift', (window.scrollY * 0.20) + 'px');
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

// Page Fade-In
console.log("SciHarmony app loaded.");
document.body.classList.add('fade-in');
window.addEventListener('load', () => document.body.classList.remove('fade-in'));
/* ============ Aesthetic Bundle JS: hero particles + footer progress ============ */

// 1) Subtle floating particles inside .hero (no HTML changes; we inject a canvas)
(function(){
  const hero = document.querySelector('.hero');
  if(!hero) return;

  // Respect reduced motion
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'heroParticles';
  hero.prepend(canvas); // sit under .hero-inner and ::after
  const ctx = canvas.getContext('2d');

  let w = 0, h = 0;
  let particles = [];
  let rafId = null;

  function resize(){
    // size canvas to hero box
    const rect = hero.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height || window.innerHeight * 0.6;

    // regenerate particles
    const count = Math.max(14, Math.min(32, Math.round(w / 60)));
    particles = Array.from({length: count}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 1,        // 1–3 px
      s: Math.random() * 0.35 + 0.15,  // speed
      a: Math.random() * Math.PI * 2   // drift angle
    }));
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    for(const p of particles){
      p.y += p.s;
      p.x += Math.sin(p.a) * 0.3;
      p.a += 0.003;
      if(p.y > h + 10) p.y = -10;
      if(p.x > w + 10) p.x = -10;
      if(p.x < -10) p.x = w + 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    rafId = requestAnimationFrame(draw);
  }

  // kick off
  resize(); draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    resize(); draw();
  });
})();

// 6) Footer scroll progress bar (auto-injected)
(function(){
  const bar = document.createElement('div');
  bar.id = 'footer-progress';
  document.body.appendChild(bar);

  function set(){
    const h = document.documentElement;
    const p = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = (p || 0) + '%';
  }
  set();
  window.addEventListener('scroll', set, { passive:true });
})();
// ===== Mobile Drawer (injects button + menu) =====
(function(){
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.main-nav');
  if(!header || !nav) return;

  // Button
  const btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-label','Open menu');
  btn.innerHTML = '<span></span>';
  header.appendChild(btn);

  // Drawer
  const drawer = document.createElement('nav');
  drawer.className = 'drawer';
  drawer.setAttribute('aria-label','Mobile');
  drawer.innerHTML = `
    <div class="group">About</div>
    <a href="about.html">About Us</a>
    <a href="faq.html">FAQ</a>
    <a href="press-kit.html">Press Kit</a>
    <a href="contact.html">Contact</a>
    <div class="group">Programs</div>
    <a href="clinic-prep.html">Clinic-Prep</a>
    <a href="ortho-lab.html">Ortho Lab</a>
    <a href="downloads.html">Downloads</a>
    <div class="group">More</div>
    <a href="impact.html">Impact</a>
    <a href="accessibility.html">Accessibility</a>
    <a class="btn primary" href="get-involved.html#donate" style="display:inline-block;margin-top:6px;">Donate</a>
  `;
  document.body.appendChild(drawer);

  function toggle(open){
    drawer.classList.toggle('open', open);
    btn.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  btn.addEventListener('click', ()=>toggle(!drawer.classList.contains('open')));
  drawer.addEventListener('click', e=>{ if(e.target.tagName === 'A') toggle(false); });
  window.addEventListener('resize', ()=>{ if(window.innerWidth>860) toggle(false); });
})();
// ===== Theme: auto + toggle =====
(function(){
  const root = document.documentElement;
  // initial: respect saved pref or system
  const saved = localStorage.getItem('theme');
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (systemDark ? 'dark' : 'light'));

  // inject toggle button
  const header = document.querySelector('.site-header');
  if(!header) return;
  const toggle = document.createElement('button');
  toggle.className = 'theme-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label','Toggle theme');
  const setLabel = () => toggle.textContent = root.getAttribute('data-theme') === 'dark' ? '☀︎' : '☾';
  setLabel();
  header.appendChild(toggle);

  toggle.addEventListener('click', ()=>{
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setLabel();
  });
})();
// ===== 3D tilt micro-interaction =====
(function(){
  const els = document.querySelectorAll('.card, .kpi');
  els.forEach(el => el.classList.add('tiltable'));

  function tilt(e){
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * 6;   // max 6deg
    const ry = (x - 0.5) * 8;   // max 8deg
    e.currentTarget.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  }
  function reset(e){
    e.currentTarget.style.transform = '';
  }
  els.forEach(el=>{
    el.addEventListener('mousemove', tilt);
    el.addEventListener('mouseleave', reset);
    el.addEventListener('touchend', reset, {passive:true});
  });
})();

/* ================= SciHarmony App (consolidated) ================= */

/* 1) Impact Counter */
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

    el.innerHTML = items.map(([k, v]) => `
      <div class="kpi lift">
        <div class="num">${v ?? '—'}</div>
        <div class="lbl">${k}</div>
      </div>
    `).join('');

    // Count-up animation
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

/* 2) Parallax drift (CSS variable) */
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  function onScroll() {
    hero.style.setProperty('--bg-drift', (window.scrollY * 0.20) + 'px');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* 3) Dropdown aria-expanded */
document.querySelectorAll('.main-nav .has-dropdown > a').forEach(link => {
  const li = link.parentElement;
  const set = v => link.setAttribute('aria-expanded', v ? 'true' : 'false');
  li.addEventListener('mouseenter', () => set(true));
  li.addEventListener('mouseleave', () => set(false));
  link.addEventListener('focus', () => set(true));
  li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) set(false); });
});

/* 4) Reveal-on-scroll baseline */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* 5) Page fade-in baseline */
document.body.classList.add('fade-in');
window.addEventListener('load', () => document.body.classList.remove('fade-in'));

console.log("SciHarmony app loaded.");

/* ================= Aesthetic Bundle: particles + footer progress ================= */

/* 6) Floating particles in hero */
(function(){
  const hero = document.querySelector('.hero');
  if(!hero) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'heroParticles';
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w=0, h=0, particles=[], rafId=null;

  function resize(){
    const rect = hero.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height || window.innerHeight * 0.6;
    const count = Math.max(14, Math.min(32, Math.round(w / 60)));
    particles = Array.from({length: count}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      r: Math.random()*2+1, s: Math.random()*0.35+0.15, a: Math.random()*Math.PI*2
    }));
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    for(const p of particles){
      p.y += p.s; p.x += Math.sin(p.a)*0.3; p.a += 0.003;
      if(p.y>h+10) p.y=-10;
      if(p.x>w+10) p.x=-10;
      if(p.x<-10) p.x=w+10;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    rafId = requestAnimationFrame(draw);
  }
  resize(); draw();
  window.addEventListener('resize', () => { cancelAnimationFrame(rafId); resize(); draw(); });
})();

/* 7) Footer scroll progress bar */
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

/* ================= Mobile drawer + Theme toggle + 3D tilt ================= */

/* 8) Mobile drawer nav */
(function(){
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.main-nav');
  if(!header || !nav) return;

  const btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-label','Open menu');
  btn.innerHTML = '<span></span>';
  header.appendChild(btn);

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

/* 9) Theme: auto + toggle chip */
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (systemDark ? 'dark' : 'light'));

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

/* 10) 3D tilt on cards/KPIs */
(function(){
  const els = document.querySelectorAll('.card, .kpi');
  els.forEach(el => el.classList.add('tiltable'));
  function tilt(e){
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * 6;
    const ry = (x - 0.5) * 8;
    e.currentTarget.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  }
  function reset(e){ e.currentTarget.style.transform = ''; }
  els.forEach(el=>{
    el.addEventListener('mousemove', tilt);
    el.addEventListener('mouseleave', reset);
    el.addEventListener('touchend', reset, {passive:true});
  });
})();

/* ================= Enhancements: testimonials, badge, theme-color, spotlight, mini-chart, a11y, year ================= */

/* 11) Testimonial carousel */
(function(){
  const after = document.querySelector('.section');
  if(!after) return;
  const wrap = document.createElement('section');
  wrap.className = 'section testimonials reveal';
  wrap.innerHTML = `
    <div class="container">
      <h2>What families say</h2>
      <div class="testimonial-track" id="testiTrack">
        <div class="testimonial"><p>“Clinic-Prep turned our dreaded visit into a routine. Visual cards helped us rehearse at home.”</p><div class="who">Ava’s Mom</div><div class="role">Caregiver</div></div>
        <div class="testimonial"><p>“Ortho Lab made forces finally click. I could predict elastic pull within 0.2N by the third trial.”</p><div class="who">Rohan</div><div class="role">Student, 10th</div></div>
        <div class="testimonial"><p>“Quiet-hour tool demos were a game changer for sensory needs. Students arrived ready.”</p><div class="who">Ms. Tran</div><div class="role">School Nurse</div></div>
        <div class="testimonial"><p>“The AAC dental board gave my nonverbal son a voice for the first time in a clinic.”</p><div class="who">Miguel’s Dad</div><div class="role">Caregiver</div></div>
      </div>
      <div class="testi-nav" id="testiDots"></div>
    </div>`;
  after.insertAdjacentElement('afterend', wrap);

  const track = wrap.querySelector('#testiTrack');
  const dotsEl = wrap.querySelector('#testiDots');
  const items = Array.from(track.children);
  let i = 0;
  items.forEach((_,idx)=>{
    const d=document.createElement('div'); d.className='testi-dot'+(idx===0?' active':'');
    d.addEventListener('click',()=>go(idx)); dotsEl.appendChild(d);
  });
  function go(idx){
    i = idx % items.length;
    track.style.transform = `translateX(${-(items[0].offsetWidth+16)*i}px)`;
    dotsEl.querySelectorAll('.testi-dot').forEach((d,k)=>d.classList.toggle('active',k===i));
  }
  function auto(){ go(i+1); }
  let t=setInterval(auto, 4000);
  wrap.addEventListener('mouseenter', ()=>clearInterval(t));
  wrap.addEventListener('mouseleave', ()=>t=setInterval(auto,4000));
})();

/* 12) Footer badge */
(function(){
  const tgt = document.querySelector('.site-footer .footer-main, .footer-grid');
  if(!tgt) return;
  const badge = document.createElement('div');
  badge.className = 'footer-badge';
  badge.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.09 6.26h6.58l-5.32 3.86 2.03 6.24L12 15.77 6.62 18.36l2.03-6.24L3.33 8.26h6.58L12 2z"/></svg> Made with students`;
  (tgt.querySelector('.footer-copy')||tgt).insertAdjacentElement('beforebegin', badge);
})();

/* 13) Theme-color meta reflects theme */
(function(){
  function setThemeColor(){
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    let m = document.querySelector('meta[name="theme-color"]');
    if(!m){ m = document.createElement('meta'); m.setAttribute('name','theme-color'); document.head.appendChild(m); }
    m.setAttribute('content', dark ? '#0b1220' : '#ffffff');
  }
  setThemeColor();
  const obs = new MutationObserver(setThemeColor);
  obs.observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
})();

/* 14) Hero spotlight tracks cursor */
(function(){
  const hero = document.querySelector('.hero');
  if(!hero) return;
  const move = e => {
    const r = hero.getBoundingClientRect();
    const x = ((e.clientX - r.left)/r.width)*100;
    const y = ((e.clientY - r.top)/r.height)*100;
    hero.style.setProperty('--mx', x+'%');
    hero.style.setProperty('--my', y+'%');
  };
  hero.addEventListener('mousemove', move);
})();

/* 15) Impact mini donut chart */
(function(){
  const host = document.querySelector('#impact-counters');
  if(!host) return;
  const box = document.createElement('div');
  box.id = 'impact-mini';
  box.innerHTML = `<canvas id="impactChart" width="520" height="220" aria-label="Preparedness chart"></canvas>`;
  host.insertAdjacentElement('afterend', box);

  fetch('data/impact.json').then(r=>r.ok?r.json():null).then(data=>{
    if(!data) return;
    const pre = Number(data.preparedness_pre||0);
    const post = Number(data.preparedness_post||0);
    const ctx = document.getElementById('impactChart').getContext('2d');
    const W = ctx.canvas.width, H = ctx.canvas.height, cx=W/2, cy=H/2, R=80, r=48;
    ctx.clearRect(0,0,W,H);
    const total = pre+post || 1;
    const angPre = (pre/total)*Math.PI*2, angPost = (post/total)*Math.PI*2;

    function ring(start, ang, color){
      ctx.beginPath();
      ctx.arc(cx,cy,R,start,start+ang);
      ctx.arc(cx,cy,r,start+ang,start,true);
      ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    }
    ring(-Math.PI/2, angPre, '#d1fae5');
    ring(-Math.PI/2+angPre, angPost, '#1C7C54');

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#0f172a';
    ctx.font = '700 16px Manrope, Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Preparedness', cx, cy-6);
    ctx.font = '700 20px Manrope, Inter, system-ui';
    ctx.fillText(`${pre} → ${post}`, cx, cy+18);
  }).catch(()=>{});
})();

/* 16) Accessibility helper */
(function(){
  const root = document.documentElement;
  const btn = document.createElement('button');
  btn.id = 'a11y-btn'; btn.title = 'Accessibility';
  btn.innerHTML = '⚙️';
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.id = 'a11y-panel';
  panel.innerHTML = `
    <h3>Accessibility</h3>
    <div class="row">
      <button class="chip" data-textzoom="">Text: Default</button>
      <button class="chip" data-textzoom="lg">Text: Large</button>
      <button class="chip" data-textzoom="xl">Text: X-Large</button>
    </div>
    <div class="row" style="margin-top:8px">
      <button class="chip" data-contrast="">Contrast: Normal</button>
      <button class="chip" data-contrast="high">Contrast: High</button>
    </div>
    <div class="row" style="margin-top:8px">
      <button class="chip" data-motion="">Motion: Normal</button>
      <button class="chip" data-motion="reduce">Motion: Reduce</button>
    </div>
    <div class="row" style="margin-top:8px">
      <button class="chip" data-sound="off">UI Sound: Off</button>
      <button class="chip" data-sound="on">UI Sound: On</button>
    </div>
    <div class="row" style="margin-top:8px">
      <button class="chip" data-theme="light">Theme: Light</button>
      <button class="chip" data-theme="dark">Theme: Dark</button>
    </div>
  `;
  document.body.appendChild(panel);

  const state = {
    textzoom: localStorage.getItem('textzoom') || '',
    contrast: localStorage.getItem('contrast') || '',
    motion:   localStorage.getItem('motion') || '',
    sound:    localStorage.getItem('sound') || 'off',
    theme:    localStorage.getItem('theme') || root.getAttribute('data-theme') || 'light'
  };
  apply();

  btn.addEventListener('click', ()=>panel.classList.toggle('open'));
  panel.addEventListener('click', e=>{
    const c = e.target.closest('.chip'); if(!c) return;
    ['textzoom','contrast','motion','sound','theme'].forEach(k=>{
      const v = c.dataset[k]; if(v===undefined) return;
      state[k] = v; localStorage.setItem(k,v);
    });
    apply(); markActive();
  });

  function apply(){
    root.setAttribute('data-textzoom', state.textzoom || '');
    root.setAttribute('data-contrast', state.contrast || '');
    root.setAttribute('data-motion',   state.motion || '');
    root.setAttribute('data-theme',    state.theme || 'light');
  }
  function markActive(){
    panel.querySelectorAll('.chip').forEach(ch=>{
      let active=false;
      for(const key of ['textzoom','contrast','motion','sound','theme']){
        const v=ch.dataset[key]; if(v!==undefined) active = (state[key]===v);
      }
      ch.classList.toggle('active', active);
    });
  }
  markActive();

  // Tiny UI blip (only if enabled)
  document.addEventListener('mouseover', e=>{
    if(state.sound!=='on') return;
    if(!e.target.closest('.btn, .chip, .menu > li > a, .card')) return;
    try{
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type='sine'; o.frequency.value=880;
      g.gain.value=0.0009; o.connect(g); g.connect(ctx.destination);
      o.start(); setTimeout(()=>{o.stop(); ctx.close()}, 40);
    }catch(_){}
  }, {passive:true});
})();

/* 17) Footer year auto-update */
(function(){
  const el = document.querySelector('.footer-copy, .copyright');
  if(!el) return;
  el.innerHTML = (el.innerHTML||'').replace(/\b20\d{2}\b/, new Date().getFullYear());
})();

/* ================= Final Polish: page transitions, cursor, section glow, headline split ================= */

/* 18) Smooth internal page transitions */
(function(){
  const isInternal = href =>
    href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#') && !href.startsWith('tel:');

  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if(!a) return;
    const href = a.getAttribute('href');
    if(!isInternal(href) || a.hasAttribute('download') || a.getAttribute('target') === '_blank') return;
    e.preventDefault();
    document.body.classList.add('out');
    setTimeout(() => { window.location.href = href; }, 180);
  });
  window.addEventListener('pageshow', () => document.body.classList.remove('out'));
})();

/* 19) Custom cursor ring (desktop only) */
(function(){
  const coarse = window.matchMedia && (window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer:coarse)').matches);
  if(coarse) return;
  const ring = document.createElement('div');
  ring.className = 'cursor-ring hide';
  document.body.appendChild(ring);

  let raf=null, x=0, y=0;
  const move = e => {
    x = e.clientX; y = e.clientY;
    if(!raf){
      raf = requestAnimationFrame(() => {
        ring.style.left = x + 'px';
        ring.style.top  = y + 'px';
        ring.classList.remove('hide');
        raf = null;
      });
    }
  };
  window.addEventListener('mousemove', move, { passive:true });

  const hoverables = 'a, button, .btn, .card, .kpi, .chip, .menu > li > a';
  document.addEventListener('mouseover', e => {
    ring.classList.toggle('grow', !!e.target.closest(hoverables));
  }, { passive:true });

  window.addEventListener('mouseout', e => { if(!e.relatedTarget) ring.classList.add('hide'); });
})();

/* 20) Section glow seam on reveal */
(function(){
  const sections = document.querySelectorAll('.section');
  if(!sections.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('glow-on');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.28 });
  sections.forEach(s => obs.observe(s));
})();

/* 21) HERO HEADLINE: space-safe word split (inserts REAL spaces) */
(function () {
  const h = document.querySelector('.hero h1');
  if (!h) return;

  const txt = h.textContent.trim().replace(/\s+/g, ' ');
  const words = txt.split(' ');

  h.textContent = '';
  h.classList.add('split');

  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = w;
    span.style.animationDelay = (0.06 * i) + 's';
    h.appendChild(span);
    if (i < words.length - 1) h.appendChild(document.createTextNode(' ')); // ← real space node
  });
})();
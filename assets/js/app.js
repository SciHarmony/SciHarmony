document.addEventListener('DOMContentLoaded', async () => {
  const el = document.querySelector('#impact-counters');
  if(!el) return;
  try{
    const res = await fetch('data/impact.json');
    if(!res.ok) return;
    const data = await res.json();
    const items = [
      ['Clinic-prep kits', data.kits_distributed],
      ['Preparedness (pre→post)', (data.preparedness_pre + '→' + data.preparedness_post)],
      ['Mirror-tolerance change', (data.mirror_tolerance_change_seconds>0?'+':'') + data.mirror_tolerance_change_seconds + 's'],
      ['Ortho Lab sessions', data.ortho_sessions],
      ['Students served', data.students_served],
      ['Volunteers trained', data.volunteers_trained]
    ];
    el.innerHTML = items.map(([k,v])=>`<div class="kpi"><div class="num">${v ?? '—'}</div><div class="lbl">${k}</div></div>`).join('');
  }catch(e){}
});
// Parallax nudge for layered hero
(function(){
  const hero = document.querySelector('.hero');
  if(!hero) return;
  const midSpeed = 0.25, fgSpeed = 0.12;
  function onScroll(){
    const y = window.scrollY || 0;
    hero.style.backgroundPosition =
      `center ${50 + Math.round(y*fgSpeed)}px, center ${50 + Math.round(y*midSpeed)}px, center 50%`;
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
})();
// Update aria-expanded on hover/focus for dropdowns
document.querySelectorAll('.main-nav .has-dropdown > a').forEach(link=>{
  const li = link.parentElement;
  function set(expanded){ link.setAttribute('aria-expanded', expanded ? 'true':'false'); }
  li.addEventListener('mouseenter', ()=>set(true));
  li.addEventListener('mouseleave', ()=>set(false));
  link.addEventListener('focus', ()=>set(true));
  li.addEventListener('focusout', (e)=>{ if(!li.contains(e.relatedTarget)) set(false); });
});

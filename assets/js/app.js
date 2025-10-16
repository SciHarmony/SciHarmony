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
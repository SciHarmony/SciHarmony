document.addEventListener('DOMContentLoaded', async () => {
  const el = document.querySelector('#impact-counters');
  if(!el) return;
  try{
    const res = await fetch('data/impact.json');
    if(!res.ok) return;
    const data = await res.json();
    const items = [
      ['Students served', data.students_served||0],
      ['Contact hours', data.contact_hours||0],
      ['Volunteers trained', data.volunteers_trained||0]
    ];
    el.innerHTML = items.map(([k,v])=>`<div class="kpi"><div class="num">${v}</div><div class="lbl">${k}</div></div>`).join('');
  }catch(e){}
});
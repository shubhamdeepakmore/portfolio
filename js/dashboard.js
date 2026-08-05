(function(){
  try {
  /* ── DATA ── update these three blocks to change dashboard content ── */
  const projects = {
    'Nacelle':         { kpi:{spi:0.98,cpi:1.03,raid:6,ms:75,risks:2,budget:61}, burnStart:45, burnWeeks:14, burnNoise:0.06 },
    'Landing Gear':    { kpi:{spi:0.87,cpi:0.94,raid:4,ms:67,risks:1,budget:48}, burnStart:38, burnWeeks:16, burnNoise:0.12 },
    'Thrust Reverser': { kpi:{spi:1.02,cpi:1.01,raid:5,ms:67,risks:1,budget:34}, burnStart:30, burnWeeks:12, burnNoise:0.04 },
    'ECS Ducting':     { kpi:{spi:0.74,cpi:0.81,raid:7,ms:25,risks:2,budget:79}, burnStart:42, burnWeeks:13, burnNoise:0.18 }
  };
  const raidAll = [
    {id:'R001',proj:'Nacelle',        type:'Risk',     title:'Supplier Delay – Composite Panels',     rag:'R'},
    {id:'I001',proj:'ECS Ducting',    type:'Issue',    title:'Drawing Release Late',                  rag:'R'},
    {id:'I002',proj:'Thrust Reverser',type:'Issue',    title:'Test Rig Calibration Failure',          rag:'R'},
    {id:'R002',proj:'Landing Gear',   type:'Risk',     title:'Skilled Resource Shortage',             rag:'A'},
    {id:'R004',proj:'Nacelle',        type:'Risk',     title:'Weight Exceedance – Pylon Bracket',     rag:'A'},
    {id:'D001',proj:'Thrust Reverser',type:'Decision', title:'Test Facility Selection',               rag:'A'},
    {id:'R003',proj:'ECS Ducting',    type:'Risk',     title:'Regulatory Compliance Gap (DO-160G)',   rag:'A'},
    {id:'A002',proj:'Landing Gear',   type:'Action',   title:'Submit FRACAS Report to DE&S',          rag:'G'},
    {id:'D002',proj:'Nacelle',        type:'Decision', title:'Subcontract vs In-House Sealing',       rag:'G'},
    {id:'A001',proj:'Nacelle',        type:'Action',   title:'Update ICD with Airbus',                rag:'G'}
  ];
  const milestonesAll = [
    {proj:'Nacelle',        name:'Design Freeze',            baseline:'30 Sep 25',forecast:'28 Sep 25',variance:-2, status:'Achieved'},
    {proj:'Nacelle',        name:'PDR Completion',           baseline:'15 Dec 25',forecast:'19 Dec 25',variance:4,  status:'Achieved'},
    {proj:'Nacelle',        name:'CDR Completion',           baseline:'31 Mar 26',forecast:'14 Apr 26',variance:14, status:'AtRisk'},
    {proj:'Landing Gear',   name:'Strip & Inspect Complete', baseline:'31 Oct 25',forecast:'07 Nov 25',variance:7,  status:'Achieved'},
    {proj:'Landing Gear',   name:'Component Repair Sign-off',baseline:'28 Feb 26',forecast:'14 Mar 26',variance:14, status:'AtRisk'},
    {proj:'Thrust Reverser',name:'Test Plan Approval',       baseline:'31 Jan 26',forecast:'29 Jan 26',variance:-2, status:'Achieved'},
    {proj:'Thrust Reverser',name:'Qualification Test Start', baseline:'01 Apr 26',forecast:'08 Apr 26',variance:7,  status:'AtRisk'},
    {proj:'ECS Ducting',    name:'Drawing Pack Release',     baseline:'15 Jan 26',forecast:'12 Feb 26',variance:28, status:'Delayed'},
    {proj:'ECS Ducting',    name:'Manufacturing Start',      baseline:'01 Feb 26',forecast:'01 Mar 26',variance:28, status:'Delayed'},
    {proj:'ECS Ducting',    name:'Delivery to Airbus Hamburg',baseline:'31 Mar 26',forecast:'28 Apr 26',variance:28,status:'Delayed'}
  ];
  /* ── END DATA ── */

  let currentProj = 'all';
  const line = 'rgba(244,245,240,0.1)';
  const th = 'font-family:var(--f-mono);font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(244,245,240,0.5);text-align:left;padding:8px 10px;border-bottom:1px solid '+line+';font-weight:400;';
  const td = 'padding:10px;border-bottom:1px solid rgba(244,245,240,0.06);color:rgba(244,245,240,0.85);vertical-align:middle;';
  const mono = 'font-family:var(--f-mono);font-size:11px;';

  function avg(a){ return a.reduce((s,v)=>s+v,0)/a.length; }
  function ragColor(v){ return v>=0.95?'#6FD196':v>=0.85?'#E8B25C':'#E07B7B'; }
  function statusCSS(s){
    const m = {Achieved:'background:rgba(111,209,150,0.15);color:#6FD196',
               OnTrack:'background:rgba(124,123,165,0.2);color:#8E8FC4',
               AtRisk:'background:rgba(232,178,92,0.15);color:#E8B25C',
               Delayed:'background:rgba(224,123,123,0.15);color:#E07B7B'};
    return m[s.replace(/\s/g,'')] || '';
  }
  function statusLabel(s){ return s.replace(/([A-Z])/g,' $1').trim(); }
  function fmtVar(v){ return v===0?'<span style="color:rgba(244,245,240,0.4)">0d</span>':v>0?'<span style="color:#E07B7B">+'+v+'d</span>':'<span style="color:#6FD196">'+v+'d</span>'; }

  function buildBurndown(pk){
    const ps = pk==='all'?Object.values(projects):[projects[pk]];
    const weeks = Math.max(...ps.map(p=>p.burnWeeks));
    const exp=[],act=[];
    for(let w=0;w<=weeks;w++){
      let e=0;
      ps.forEach(p=>{ e+=p.burnStart*Math.max(0,1-w/p.burnWeeks); });
      exp.push(Math.round(e*10)/10);
      const noise=(Math.sin(w*1.7+ps.length)*ps[0].burnNoise+0.02)*ps[0].burnStart;
      act.push(Math.round(Math.max(0,e+noise)*10)/10);
    }
    return {labels:Array.from({length:weeks+1},(_,i)=>'Wk '+(i+1)),exp,act};
  }

  function renderKPIs(){
    const ps = currentProj==='all'?Object.values(projects):[projects[currentProj]];
    const spi=avg(ps.map(p=>p.kpi.spi)), cpi=avg(ps.map(p=>p.kpi.cpi));
    const raid=ps.reduce((s,p)=>s+p.kpi.raid,0);
    const ms=avg(ps.map(p=>p.kpi.ms)), risks=ps.reduce((s,p)=>s+p.kpi.risks,0);
    const budget=avg(ps.map(p=>p.kpi.budget));
    const items=[
      {l:'Active Projects',v:ps.length,     sub:'in scope',           c:'var(--paper)'},
      {l:'Avg SPI',        v:spi.toFixed(2), sub:spi>=1?'ahead of plan':'behind plan', c:ragColor(spi)},
      {l:'Avg CPI',        v:cpi.toFixed(2), sub:cpi>=1?'under budget':'over budget',  c:ragColor(cpi)},
      {l:'Open RAID',      v:raid,           sub:risks+' high risks',  c:'var(--paper)'},
      {l:'Milestones On Track', v:Math.round(ms)+'%', sub:'this quarter', c:ragColor(ms/100)},
      {l:'Budget Used',    v:Math.round(budget)+'%', sub:'of approved',  c:'var(--paper)'}
    ];
    document.getElementById('dash-kpis').innerHTML = items.map(k=>'<div style="background:rgba(244,245,240,0.03);border:1px solid rgba(244,245,240,0.14);border-radius:4px;padding:16px;"><div style="'+mono+'font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(244,245,240,0.5);margin-bottom:8px;">'+k.l+'</div><div style="font-family:var(--f-display);font-size:26px;font-weight:400;color:'+k.c+';line-height:1;">'+k.v+'</div><div style="'+mono+'font-size:10px;color:rgba(244,245,240,0.4);margin-top:6px;">'+k.sub+'</div></div>').join('');
  }

  function renderBurndown(){
    const d = buildBurndown(currentProj);
    const wrap = document.getElementById('burnChartWrap');
    const isMobile = window.innerWidth < 600;
    const H = isMobile ? 240 : 300;
    wrap.style.height = H + 'px';
    
    const W = wrap.offsetWidth || 600;
    const padL = 36, padR = 14, padT = 14, padB = 50;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    
    const maxY = Math.max(...d.exp, ...d.act, 1);
    const yTicks = 5;
    const xLabelStep = Math.max(1, Math.ceil(d.labels.length / (isMobile ? 6 : 10)));
    const xStep = chartW / Math.max(d.labels.length - 1, 1);
    
    const toX = i => padL + i * xStep;
    const toY = v => padT + chartH - (v / maxY) * chartH;
    const buildPath = (arr) => arr.map((v, i) => (i === 0 ? 'M' : 'L') + toX(i).toFixed(1) + ',' + toY(v).toFixed(1)).join(' ');
    
    let svg = '<svg width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="display:block;">';
    
    for (let i = 0; i <= yTicks; i++) {
      const y = padT + (chartH * i / yTicks);
      const v = Math.round(maxY * (1 - i / yTicks));
      svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="rgba(244,245,240,0.06)" stroke-width="1"/>';
      svg += '<text x="' + (padL - 6) + '" y="' + (y + 3) + '" text-anchor="end" fill="rgba(244,245,240,0.5)" font-family="JetBrains Mono, monospace" font-size="9">' + v + '</text>';
    }
    
    for (let i = 0; i < d.labels.length; i += xLabelStep) {
      svg += '<text x="' + toX(i) + '" y="' + (H - padB + 16) + '" text-anchor="middle" fill="rgba(244,245,240,0.5)" font-family="JetBrains Mono, monospace" font-size="9">' + d.labels[i] + '</text>';
    }
    
    svg += '<path d="' + buildPath(d.exp) + '" stroke="#7C7BA5" stroke-width="2" fill="none" stroke-dasharray="6,4"/>';
    svg += '<path d="' + buildPath(d.act) + '" stroke="#C9A36B" stroke-width="2.5" fill="none"/>';
    d.act.forEach((v, i) => {
      svg += '<circle cx="' + toX(i).toFixed(1) + '" cy="' + toY(v).toFixed(1) + '" r="3" fill="#C9A36B"/>';
    });
    
    const lgY = H - 18;
    svg += '<g font-family="JetBrains Mono, monospace" font-size="10" fill="rgba(244,245,240,0.7)">';
    svg += '<line x1="' + (padL) + '" y1="' + lgY + '" x2="' + (padL + 14) + '" y2="' + lgY + '" stroke="#7C7BA5" stroke-width="2" stroke-dasharray="6,4"/>';
    svg += '<text x="' + (padL + 20) + '" y="' + (lgY + 3) + '">Expected</text>';
    svg += '<line x1="' + (padL + 90) + '" y1="' + lgY + '" x2="' + (padL + 104) + '" y2="' + lgY + '" stroke="#C9A36B" stroke-width="2.5"/>';
    svg += '<text x="' + (padL + 110) + '" y="' + (lgY + 3) + '">Actual</text>';
    svg += '</g>';
    
    svg += '</svg>';
    wrap.innerHTML = svg;
  }

  function renderRAID(){
    const rows = currentProj==='all' ? raidAll.slice(0,6) : raidAll.filter(r=>r.proj===currentProj);
    const ragCSS = r=>({R:'background:#E07B7B;color:#4a0e0e',A:'background:#E8B25C;color:#3d2300',G:'background:#6FD196;color:#0a3a1f'}[r]||'');
    document.getElementById('raid-head').innerHTML = '<tr><th style="'+th+'">ID</th><th style="'+th+'">Type</th><th style="'+th+'">Title</th><th style="'+th+'text-align:center;">RAG</th></tr>';
    document.getElementById('raid-body').innerHTML = rows.length===0
      ? '<tr><td colspan="4" style="'+td+'text-align:center;color:rgba(244,245,240,0.4);">No items</td></tr>'
      : rows.map(r=>'<tr><td style="'+td+mono+'color:rgba(244,245,240,0.5);">'+r.id+'</td><td style="'+td+'">'+r.type+'</td><td style="'+td+'">'+r.title+'</td><td style="'+td+'text-align:center;"><span style="display:inline-block;width:22px;height:22px;border-radius:50%;font-family:var(--f-mono);font-size:11px;font-weight:500;text-align:center;line-height:22px;'+ragCSS(r.rag)+'">'+r.rag+'</span></td></tr>').join('');
  }

  function renderMilestones(){
    const rows = currentProj==='all' ? milestonesAll : milestonesAll.filter(m=>m.proj===currentProj);
    document.getElementById('ms-head').innerHTML = '<tr><th style="'+th+'">Project</th><th style="'+th+'">Milestone</th><th style="'+th+'">Baseline</th><th style="'+th+'">Forecast</th><th style="'+th+'text-align:center;">Variance</th><th style="'+th+'">Status</th></tr>';
    document.getElementById('ms-body').innerHTML = rows.length===0
      ? '<tr><td colspan="6" style="'+td+'text-align:center;color:rgba(244,245,240,0.4);">No milestones</td></tr>'
      : rows.map(m=>'<tr><td style="'+td+'color:rgba(244,245,240,0.55);">'+m.proj+'</td><td style="'+td+'">'+m.name+'</td><td style="'+td+mono+'">'+m.baseline+'</td><td style="'+td+mono+'">'+m.forecast+'</td><td style="'+td+mono+'text-align:center;">'+fmtVar(m.variance)+'</td><td style="'+td+'"><span style="font-family:var(--f-mono);font-size:9px;letter-spacing:0.08em;text-transform:uppercase;padding:3px 8px;border-radius:999px;display:inline-block;'+statusCSS(m.status)+'">'+statusLabel(m.status)+'</span></td></tr>').join('');
  }

  function render(){ renderKPIs(); renderBurndown(); renderRAID(); renderMilestones(); }

  const projTabsEl = document.getElementById('proj-tabs');
  const projTabHandler = e => {
    const btn = e.target.closest('.dash-tab');
    if(!btn) return;
    e.preventDefault();
    document.querySelectorAll('#proj-tabs .dash-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentProj = btn.dataset.proj;
    render();
  };
  projTabsEl.addEventListener('click', projTabHandler);

  render();
  
  // Redraw on resize/orientation change
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { renderBurndown(); }, 150);
  });
  } catch(err) {
    console.error('Dashboard error:', err);
    const wrap = document.getElementById('burnChartWrap');
    if(wrap) wrap.innerHTML = '<div style="padding:40px;color:rgba(244,245,240,0.5);font-family:monospace;font-size:12px;text-align:center;">Dashboard error: ' + err.message + '</div>';
  }
})();

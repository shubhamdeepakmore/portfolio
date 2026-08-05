(function(){
  try {
    // ── DATA ──────────────────────────────────────────────────
    // For each month, working-day statuses for each pillar.
    // G = OK, R = Not OK. The donut renderer fills weekends and future days automatically.
    // today_day is the last day with data; days after that show as future (pale).
    const sqcdpiData = {
      mar: {
        label: 'March 2026',
        daysInMonth: 31,
        firstWeekday: 6,   // 1st March 2026 = Sunday (6)
        todayDay: 31,      // full month of data
        statuses: {
          S: ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
          Q: ['G','G','R','G','G','G','G','R','G','G','G','G','G','R','G','G','G','G','G','G','G','G'],
          C: ['G','G','G','G','G','G','R','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
          D: ['G','R','G','G','R','G','G','G','G','R','G','G','R','G','G','G','G','R','G','G','G','G'],
          P: ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
          I: ['R','G','R','G','G','R','G','G','R','G','G','R','G','G','R','G','G','G','R','G','G','R']
        }
      },
      apr: {
        label: 'April 2026',
        daysInMonth: 30,
        firstWeekday: 2,   // 1st April 2026 = Wednesday (2)
        todayDay: 30,
        statuses: {
          S: ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
          Q: ['G','G','R','G','G','G','G','R','G','G','G','G','G','G','G','G','G','R','G','G','G','G'],
          C: ['G','G','G','R','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
          D: ['G','R','G','G','R','G','R','G','G','R','G','G','G','R','G','G','G','R','G','G','R','G'],
          P: ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
          I: ['G','R','G','G','R','G','R','G','G','R','G','G','R','G','G','R','G','G','G','R','G','G']
        }
      },
      may: {
        label: 'May 2026',
        daysInMonth: 31,
        firstWeekday: 4,   // 1st May 2026 = Friday (4)
        todayDay: 31,
        statuses: {
          S: ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
          Q: ['G','G','G','R','G','G','R','G','G','G','G','G','R','G','G','G','G','G','G','R','G','G'],
          C: ['G','G','R','G','G','G','G','G','G','G','G','R','G','G','G','G','G','G','G','G','G','G'],
          D: ['R','R','G','R','G','R','G','R','R','G','R','G','G','R','G','R','G','R','G','G','R','G'],
          P: ['G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
          I: ['R','G','R','R','G','R','R','G','R','G','G','R','G','R','G','R','R','G','R','G','R','G']
        }
      }
    };

    const pillars = [
      { letter: 'S', label: 'Safety' },
      { letter: 'Q', label: 'Quality' },
      { letter: 'C', label: 'Cost' },
      { letter: 'D', label: 'Delivery' },
      { letter: 'P', label: 'People' },
      { letter: 'I', label: 'Innovation' }
    ];

    // Mock actions — one entry per Red day, keyed by month + pillar + working day index
    const sqcdpiActions = {
      may: {
        Q: [
          { wd: 3,  cause: 'FOD found on assembly line',     action: 'Stand-down, retrained shift on FOD procedures', owner: 'Quality Manager', status: 'Closed' },
          { wd: 6,  cause: 'NCR raised on out-of-tolerance part', action: 'Concession raised, supplier re-audited',   owner: 'Quality Engineer', status: 'Closed' },
          { wd: 12, cause: 'Repeat defect on Nacelle batch', action: 'Root-cause investigation underway',             owner: 'Quality Manager', status: 'Open' },
          { wd: 19, cause: 'First-article inspection failed', action: 'Rework in progress, re-FAI scheduled',         owner: 'Quality Engineer', status: 'Open' }
        ],
        C: [
          { wd: 2,  cause: 'Material price increase from supplier', action: 'Alternative supplier sourcing initiated',    owner: 'Purchasing', status: 'Open' },
          { wd: 11, cause: 'Overtime spend exceeded budget',        action: 'Resource plan reviewed with Programme Manager',  owner: 'PMO',        status: 'Closed' }
        ],
        D: [
          { wd: 0,  cause: 'Supplier missed promised date',         action: 'Escalated to Purchasing, expedite agreed', owner: 'Programme Manager', status: 'Closed' },
          { wd: 1,  cause: 'Assembly delay due to part shortage',   action: 'Kit rebalanced from buffer stock',          owner: 'Operations',    status: 'Closed' },
          { wd: 3,  cause: 'Engineering query delayed sign-off',    action: 'Daily stand-up cadence introduced',         owner: 'Engineering',   status: 'Closed' },
          { wd: 5,  cause: 'Customer change request mid-build',     action: 'Change board convened, impact assessed',    owner: 'Programme Manager', status: 'Closed' },
          { wd: 7,  cause: 'Inspection backlog at Quality gate',    action: 'Additional inspector resourced',            owner: 'Quality Manager',   status: 'Open' },
          { wd: 8,  cause: 'Goods-in receiving delay',              action: 'Logistics SLA renegotiated',                owner: 'Purchasing',    status: 'Open' },
          { wd: 10, cause: 'Shipping documentation incomplete',     action: 'Doc template updated, training delivered',  owner: 'Operations',    status: 'Closed' },
          { wd: 13, cause: 'Customer slot rescheduled',             action: 'Slot confirmed for following week',         owner: 'Programme Manager', status: 'Closed' },
          { wd: 15, cause: 'Critical path slip on milestone',       action: 'Recovery plan agreed with stakeholder',     owner: 'PMO',           status: 'Open' },
          { wd: 17, cause: 'Resource conflict across programmes',   action: 'Resource levelling exercise complete',      owner: 'PMO',           status: 'Closed' },
          { wd: 20, cause: 'Late engineering drawing release',      action: 'Drawing review process tightened',          owner: 'Engineering',   status: 'Open' }
        ],
        I: [
          { wd: 0,  cause: 'Kaizen workshop cancelled',             action: 'Rescheduled for next week',                 owner: 'CI Lead',       status: 'Closed' },
          { wd: 2,  cause: 'No improvement ideas logged today',     action: 'Reminder posted to shop-floor board',       owner: 'CI Lead',       status: 'Closed' },
          { wd: 3,  cause: 'Process improvement trial paused',      action: 'Trial scope reviewed and refined',          owner: 'Operations',    status: 'Closed' },
          { wd: 5,  cause: 'CI Power Hour attendance below target', action: 'Promoted internally, lunch slot trialled',  owner: 'CI Lead',       status: 'Closed' },
          { wd: 6,  cause: '5S audit score regression on station',  action: '5S coach visit scheduled',                  owner: 'Operations',    status: 'Open' },
          { wd: 11, cause: 'Suggestion scheme idea backlog growing', action: 'Backlog triage held with Operations',       owner: 'CI Lead',       status: 'Closed' },
          { wd: 13, cause: 'Improvement project missed gate review', action: 'Gate review rescheduled, scope tightened',  owner: 'PMO',           status: 'Open' },
          { wd: 15, cause: 'New process not adopted by all shifts',  action: 'Toolbox talk delivered to all shifts',     owner: 'CI Lead',       status: 'Open' },
          { wd: 16, cause: 'Standard work documentation outdated',   action: 'Docs refresh planned with Quality',        owner: 'Quality Engineer',   status: 'Open' },
          { wd: 18, cause: 'Lessons-learned not captured this week', action: 'Capture session held with team',           owner: 'PMO',           status: 'Closed' },
          { wd: 20, cause: 'Visual management board out of date',    action: 'Board updated, ownership reassigned',      owner: 'Operations',    status: 'Closed' }
        ]
      },
      apr: {
        Q: [
          { wd: 2,  cause: 'Customer complaint on finish quality',  action: 'Process inspection added at final stage',   owner: 'Quality Manager', status: 'Closed' },
          { wd: 7,  cause: 'Supplier batch rejected at goods-in',   action: 'Supplier improvement plan agreed',          owner: 'Quality Engineer', status: 'Closed' },
          { wd: 17, cause: 'Calibration overdue on test rig',       action: 'Calibration completed, schedule reviewed',  owner: 'Quality Engineer', status: 'Closed' }
        ],
        C: [
          { wd: 3,  cause: 'Tooling repair cost overrun',           action: 'Budget reforecast, contingency drawn',      owner: 'Engineering', status: 'Closed' }
        ],
        D: [
          { wd: 1,  cause: 'Late material delivery from supplier',  action: 'Expedite agreed, no schedule impact',       owner: 'Purchasing',    status: 'Closed' },
          { wd: 4,  cause: 'Assembly fixture failure',              action: 'Fixture repaired, preventive maintenance scheduled', owner: 'Engineering', status: 'Closed' },
          { wd: 6,  cause: 'Customer review meeting overran',       action: 'Action log issued, follow-up booked',       owner: 'Programme Manager', status: 'Closed' },
          { wd: 9,  cause: 'Engineering change held delivery',      action: 'Change board prioritised review',           owner: 'Engineering',   status: 'Closed' },
          { wd: 13, cause: 'Resource short on critical path',       action: 'Contractor onboarded',                      owner: 'PMO',           status: 'Closed' },
          { wd: 17, cause: 'Approval delay from Quality',           action: 'Daily sign-off cadence introduced',         owner: 'Quality Manager',   status: 'Closed' },
          { wd: 20, cause: 'Shipping documentation error',          action: 'Template updated, training delivered',      owner: 'Operations',    status: 'Closed' }
        ],
        I: [
          { wd: 1,  cause: 'CI board not updated for 3 days',       action: 'Daily update ownership assigned',           owner: 'CI Lead',       status: 'Closed' },
          { wd: 4,  cause: 'Improvement idea blocked by safety',    action: 'Joint review with HSE team',                owner: 'CI Lead',       status: 'Closed' },
          { wd: 6,  cause: 'Process trial delayed',                 action: 'Trial restarted with revised plan',         owner: 'Operations',    status: 'Closed' },
          { wd: 9,  cause: 'Kaizen event under-attended',           action: 'Event format revised for shifts',           owner: 'CI Lead',       status: 'Closed' },
          { wd: 12, cause: 'Standard work breach observed',         action: 'Refresher training delivered',              owner: 'Operations',    status: 'Closed' },
          { wd: 15, cause: 'Audit finding on CI documentation',     action: 'Documentation gap closed',                  owner: 'PMO',           status: 'Closed' },
          { wd: 19, cause: 'CI metric below monthly target',        action: 'Action plan reviewed at Steer Co',          owner: 'CI Lead',       status: 'Closed' }
        ]
      },
      mar: {
        Q: [
          { wd: 2,  cause: 'Defect found late in process',         action: 'Earlier inspection point added',            owner: 'Quality Engineer', status: 'Closed' },
          { wd: 7,  cause: 'NCR open beyond target turnaround',    action: 'NCR review board cadence increased',        owner: 'Quality Manager', status: 'Closed' },
          { wd: 13, cause: 'Customer audit finding',               action: 'Corrective action plan delivered',          owner: 'Quality Manager', status: 'Closed' }
        ],
        C: [
          { wd: 6,  cause: 'Unexpected scrap from rework',         action: 'Scrap reduction project initiated',         owner: 'Operations',  status: 'Closed' }
        ],
        D: [
          { wd: 1,  cause: 'Production line stoppage',             action: 'Maintenance schedule revised',              owner: 'Engineering',   status: 'Closed' },
          { wd: 4,  cause: 'Supplier non-conformance held delivery', action: 'Supplier corrective action verified',      owner: 'Purchasing',    status: 'Closed' },
          { wd: 9,  cause: 'Test rig downtime',                    action: 'Backup rig procured',                       owner: 'Engineering',   status: 'Closed' },
          { wd: 12, cause: 'Resource gap on weekend shift',        action: 'Overtime authorised',                       owner: 'Operations',    status: 'Closed' },
          { wd: 17, cause: 'Customer change request',              action: 'Change board convened',                     owner: 'Programme Manager', status: 'Closed' }
        ],
        I: [
          { wd: 0,  cause: 'CI suggestion box empty',              action: 'Comms campaign launched',                   owner: 'CI Lead',       status: 'Closed' },
          { wd: 2,  cause: 'Process trial blocked by spec issue',  action: 'Spec clarification obtained',               owner: 'Engineering',   status: 'Closed' },
          { wd: 5,  cause: 'Kaizen workshop postponed',            action: 'Workshop held in following week',           owner: 'CI Lead',       status: 'Closed' },
          { wd: 8,  cause: 'CI metric not reported',           action: 'Reporting template updated', owner: 'PMO', status: 'Closed' },
          { wd: 11, cause: 'Standard work not followed',           action: 'Refresher training delivered',              owner: 'Operations',    status: 'Closed' },
          { wd: 14, cause: 'Improvement idea backlog grew',        action: 'Triage session held',                       owner: 'CI Lead',       status: 'Closed' },
          { wd: 18, cause: 'CI Power Hour cancelled',              action: 'Rescheduled for next month',                owner: 'CI Lead',       status: 'Closed' }
        ]
      }
    };

    const COL_G = '#6FD196';
    const COL_R = '#E07B7B';
    const COL_W = 'rgba(244,245,240,0.18)';
    const COL_X = 'rgba(244,245,240,0.08)';

    let currentMonth = 'may';

    // Build month status array including weekends + future
    function buildMonthArray(monthKey, pillarKey) {
      const m = sqcdpiData[monthKey];
      const workingStatuses = m.statuses[pillarKey];
      const out = [];
      let wdIdx = 0;
      for (let d = 1; d <= m.daysInMonth; d++) {
        const weekday = (m.firstWeekday + d - 1) % 7;
        if (weekday >= 5) {
          out.push('W');
        } else if (d > m.todayDay) {
          out.push('X');
        } else {
          out.push(workingStatuses[wdIdx] || 'X');
          wdIdx++;
        }
      }
      return out;
    }

    // SVG donut renderer
    function renderDonut(letter, statuses, totalDays) {
      const cx = 50, cy = 50, rOuter = 42, rInner = 32;
      const segGap = 1.0;
      const segAngle = (360 / totalDays) - segGap;
      let paths = '';
      for (let i = 0; i < totalDays; i++) {
        const status = statuses[i] || 'X';
        let colour = COL_X;
        if (status === 'G') colour = COL_G;
        else if (status === 'R') colour = COL_R;
        else if (status === 'W') colour = COL_W;
        const startAngle = (i * (360 / totalDays)) - 90 + (segGap / 2);
        const endAngle = startAngle + segAngle;
        const sa = startAngle * Math.PI / 180;
        const ea = endAngle * Math.PI / 180;
        const x1 = cx + rOuter * Math.cos(sa);
        const y1 = cy + rOuter * Math.sin(sa);
        const x2 = cx + rOuter * Math.cos(ea);
        const y2 = cy + rOuter * Math.sin(ea);
        const x3 = cx + rInner * Math.cos(ea);
        const y3 = cy + rInner * Math.sin(ea);
        const x4 = cx + rInner * Math.cos(sa);
        const y4 = cy + rInner * Math.sin(sa);
        const largeArc = segAngle > 180 ? 1 : 0;
        paths += `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z" fill="${colour}"/>`;
      }
      paths += `<text x="50" y="56" text-anchor="middle" dominant-baseline="middle" font-family="var(--f-display), Fraunces, serif" font-size="22" fill="#F4F5F0">${letter}</text>`;
      return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
    }

    function renderActions() {
      const wrap = document.getElementById('sqcdpi-actions-wrap');
      if (!wrap) return;
      const monthActions = sqcdpiActions[currentMonth] || {};
      const m = sqcdpiData[currentMonth];
      
      // Helper: working-day index → actual day-of-month
      function wdToDate(monthKey, wdIdx) {
        const md = sqcdpiData[monthKey];
        let count = 0;
        for (let d = 1; d <= md.daysInMonth; d++) {
          const weekday = (md.firstWeekday + d - 1) % 7;
          if (weekday < 5) {
            if (count === wdIdx) return d;
            count++;
          }
        }
        return null;
      }
      
      const monthShort = m.label.split(' ')[0].substring(0,3);
      const allRows = [];
      pillars.forEach(p => {
        const pillarActions = monthActions[p.letter] || [];
        pillarActions.forEach(a => {
          const day = wdToDate(currentMonth, a.wd);
          allRows.push({
            pillar: p.letter,
            pillarLabel: p.label,
            day: day + ' ' + monthShort,
            sortKey: day,
            cause: a.cause,
            action: a.action,
            owner: a.owner,
            status: a.status
          });
        });
      });
      allRows.sort((a,b) => a.sortKey - b.sortKey);
      
      if (allRows.length === 0) {
        wrap.innerHTML = '<div class="sq-actions-empty">No actions required this month — all pillars green</div>';
        return;
      }
      
      let html = '<table class="sq-actions-table"><thead><tr><th>Day</th><th>Pillar</th><th>Root Cause</th><th>Action</th><th>Owner</th><th>Status</th></tr></thead><tbody>';
      allRows.forEach(r => {
        const statusColour = r.status === 'Open' ? '#E07B7B' : '#6FD196';
        html += '<tr><td>' + r.day + '</td><td><span class="sq-pillar-tag">' + r.pillar + '</span> ' + r.pillarLabel + '</td><td>' + r.cause + '</td><td>' + r.action + '</td><td>' + r.owner + '</td><td><span class="sq-status-pill" style="color:' + statusColour + '">' + r.status + '</span></td></tr>';
      });
      html += '</tbody></table>';
      wrap.innerHTML = html;
    }
    
    function renderSQCDPI() {
      const grid = document.getElementById('sqcdpi-grid');
      if (!grid) return;
      renderActions();
      const m = sqcdpiData[currentMonth];
      let html = '';
      pillars.forEach(p => {
        const monthArray = buildMonthArray(currentMonth, p.letter);
        const donut = renderDonut(p.letter, monthArray, m.daysInMonth);
        const workingStatuses = m.statuses[p.letter];
        const greenCount = workingStatuses.filter(s => s === 'G').length;
        const totalSoFar = workingStatuses.length;
        const pct = totalSoFar > 0 ? Math.round(100 * greenCount / totalSoFar) : 0;
        let pctColour = '#E07B7B';
        if (pct >= 80) pctColour = '#6FD196';
        else if (pct >= 60) pctColour = '#E8B25C';
        html += `<div class="sq-tile">
          <div class="sq-label">${p.label}</div>
          ${donut}
          <div class="sq-stats">
            <div class="sq-count">${greenCount} <span class="sq-of">/</span> ${totalSoFar}</div>
            <div class="sq-pct-line">days OK · <span style="color:${pctColour}">${pct}%</span></div>
          </div>
        </div>`;
      });
      grid.innerHTML = html;
    }

    // Month picker
    const monthTabs = document.getElementById('sqcdpi-month-tabs');
    if (monthTabs) {
      monthTabs.addEventListener('click', e => {
        const btn = e.target.closest('.dash-tab');
        if (!btn) return;
        e.preventDefault();
        monthTabs.querySelectorAll('.dash-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMonth = btn.dataset.month;
        renderSQCDPI();
      });
    }

    // Dashboard toggle
    const switcher = document.getElementById('dashSwitcher');
    const permitsPanel = document.getElementById('permitsPanel');
    const sqcdpiPanel = document.getElementById('sqcdpiPanel');
    if (switcher && permitsPanel && sqcdpiPanel) {
      switcher.addEventListener('click', e => {
        const btn = e.target.closest('.dash-switch-btn');
        if (!btn) return;
        e.preventDefault();
        switcher.querySelectorAll('.dash-switch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        if (view === 'permits') {
          permitsPanel.style.display = '';
          sqcdpiPanel.style.display = 'none';
        } else {
          permitsPanel.style.display = 'none';
          sqcdpiPanel.style.display = '';
          renderSQCDPI();  // re-render on toggle in case fonts loaded late
        }
      });
    }

    // Initial render
    renderSQCDPI();
  } catch (err) {
    console.error('SQCDPI error:', err);
  }
})();

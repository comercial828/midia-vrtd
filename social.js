/* =========================================================
   SOCIAL MEDIA PAGE — Demands + Editorial Calendar + Posting Calendar
   ========================================================= */
const SocialPage = (() => {

  let calYear, calMonth;

  /* ─── MY DEMANDS ─── */
  const renderMyDemands = (user) => {
    const all = Store.getDemands();
    // Social media handles copy_pending and beyond
    const mine = all.filter(d => ['approved','copy_pending','scheduled','published'].includes(d.status)
      || d.assignedTo === user.id)
      .sort((a,b) => new Date(a.postingDate) - new Date(b.postingDate));

    const pending = mine.filter(d => ['approved','copy_pending'].includes(d.status));
    const scheduled = mine.filter(d => d.status === 'scheduled');
    const published = mine.filter(d => d.status === 'published');

    const content = `
    <div class="p-6 max-w-5xl mx-auto">
      ${Components.sectionHeader('Minhas Tarefas', `Olá, ${user.name.split(' ')[0]}! Gerencie suas postagens e copys.`)}

      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="stat-card text-center py-4">
          <div class="text-2xl font-black text-orange-500">${pending.length}</div>
          <div class="text-xs text-slate-500 font-medium mt-1">Aguardando Copy</div>
        </div>
        <div class="stat-card text-center py-4">
          <div class="text-2xl font-black text-cyan-500">${scheduled.length}</div>
          <div class="text-xs text-slate-500 font-medium mt-1">Programados</div>
        </div>
        <div class="stat-card text-center py-4">
          <div class="text-2xl font-black text-green-500">${published.length}</div>
          <div class="text-xs text-slate-500 font-medium mt-1">Publicados</div>
        </div>
      </div>

      <!-- Pending copy -->
      ${pending.length ? `
        <h2 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
          ${Components.icon('copy_icon','w-4 h-4 text-orange-500')} Aguardando Copy <span class="badge badge-copy_pending">${pending.length}</span>
        </h2>
        <div class="space-y-3 mb-6">
          ${pending.map(d => socialDemandCard(d, user)).join('')}
        </div>` : ''}

      <!-- Scheduled -->
      ${scheduled.length ? `
        <h2 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
          ${Components.icon('calendar','w-4 h-4 text-cyan-500')} Programados
        </h2>
        <div class="space-y-3 mb-6">
          ${scheduled.map(d => socialDemandCard(d, user, true)).join('')}
        </div>` : ''}

      ${!pending.length && !scheduled.length ? Components.emptyState('Tudo em dia!', 'Nenhum conteúdo aguardando copy ou programação.') : ''}
    </div>`;

    document.getElementById('page-content').innerHTML = content;
  };

  const socialDemandCard = (d, user, compact = false) => {
    const days = Dates.daysUntil(d.postingDate);
    return `
    <div class="card p-4">
      <div class="flex items-start gap-3">
        <div class="flex-1 min-w-0 cursor-pointer" onclick="App.openDemandDetail('${d.id}')">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            ${Components.statusBadge(d.status)}
            ${Components.platformBadge(d.platform)}
          </div>
          <h3 class="font-semibold text-slate-800">${d.title}</h3>
          <p class="text-xs text-slate-500 mt-1">
            Postagem: ${Dates.format(d.postingDate)} às ${d.postingTime || '—'}
            ${days === 0 ? ' <span class="text-amber-600 font-bold">HOJE</span>' : days > 0 ? ` (em ${days}d)` : ' <span class="text-red-500 font-bold">ATRASADO</span>'}
          </p>
        </div>
      </div>

      <!-- Copy editor -->
      <div class="mt-3 pt-3 border-t border-slate-100">
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-bold text-slate-600 uppercase tracking-wide">Copy</label>
          ${d.copy ? `<span class="text-xs text-green-600 font-semibold">✓ Salvo</span>` : `<span class="text-xs text-orange-500 font-semibold">Pendente</span>`}
        </div>
        <textarea id="copy-${d.id}" class="copy-area" rows="3" placeholder="Digite a copy para esta postagem…">${d.copy || ''}</textarea>
        <div class="flex gap-2 mt-2">
          <button onclick="SocialPage.saveCopy('${d.id}')" class="btn btn-primary btn-sm flex-1">
            ${Components.icon('check','w-3.5 h-3.5')} Salvar Copy
          </button>
          ${d.copy ? `<button onclick="SocialPage.schedulePost('${d.id}')" class="btn btn-secondary btn-sm flex-1">
            ${Components.icon('calendar','w-3.5 h-3.5')} Programar
          </button>` : ''}
        </div>
      </div>
    </div>`;
  };

  const saveCopy = (demandId) => {
    const copyEl = document.getElementById(`copy-${demandId}`);
    if (!copyEl) return;
    const copy = copyEl.value.trim();
    if (!copy) { Components.toast('Digite a copy antes de salvar.', 'error'); return; }
    Store.updateDemand(demandId, { copy, status: 'copy_pending' });
    Store.addDemandHistory(demandId, { action: 'copy_saved', user: Auth.currentUser().name, note: 'Copy salva pelo Social Media' });
    Components.toast('Copy salva com sucesso!', 'success');
    renderMyDemands(Auth.currentUser());
  };

  const schedulePost = (demandId) => {
    const d = Store.getDemandById(demandId);
    if (!d?.copy) { Components.toast('Salve a copy primeiro.', 'error'); return; }
    Store.updateDemand(demandId, { status: 'scheduled' });
    Store.addDemandHistory(demandId, { action: 'scheduled', user: Auth.currentUser().name, note: 'Conteúdo programado para postagem' });
    Components.toast('Conteúdo programado!', 'success');
    renderMyDemands(Auth.currentUser());
  };

  /* ─── EDITORIAL CALENDAR ─── */
  const renderCalendar = (user) => {
    const now = new Date();
    if (!calYear) calYear = now.getFullYear();
    if (calMonth === undefined || calMonth === null) calMonth = now.getMonth();

    const demands = Store.getDemands();
    const content = `
    <div class="p-6 max-w-5xl mx-auto">
      ${Components.sectionHeader('Calendário Editorial', 'Todos os conteúdos por data de postagem.')}
      <div class="card p-5">
        <div class="flex items-center justify-between mb-5">
          <button onclick="SocialPage.calNav(-1)" class="btn btn-secondary btn-sm">← Anterior</button>
          <h2 class="font-bold text-slate-800">${Dates.getMonthName(calMonth)} ${calYear}</h2>
          <button onclick="SocialPage.calNav(1)" class="btn btn-secondary btn-sm">Próximo →</button>
        </div>
        ${Components.renderCalendarGrid(calYear, calMonth, demands)}
      </div>
      <div id="cal-day-detail" class="hidden card p-5 mt-4"><div id="cal-day-content"></div></div>
    </div>`;
    document.getElementById('page-content').innerHTML = content;
  };

  const calNav = (dir) => {
    calMonth += dir;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar(App.currentUser);
  };

  /* ─── POSTING CALENDAR ─── */
  const renderPostingCalendar = (user) => {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const demands = Store.getDemands()
      .filter(d => {
        if (!d.postingDate) return false;
        const [y, m] = d.postingDate.split('-').map(Number);
        return y === year && m - 1 === month;
      })
      .sort((a,b) => {
        const dA = new Date(`${a.postingDate}T${a.postingTime || '09:00'}`);
        const dB = new Date(`${b.postingDate}T${b.postingTime || '09:00'}`);
        return dA - dB;
      });

    // Group by day
    const byDay = {};
    demands.forEach(d => {
      if (!byDay[d.postingDate]) byDay[d.postingDate] = [];
      byDay[d.postingDate].push(d);
    });

    const days = Object.keys(byDay).sort();

    const content = `
    <div class="p-6 max-w-4xl mx-auto">
      ${Components.sectionHeader('Calendário de Postagem',
        `${Dates.getMonthName(month)} ${year} — ${demands.length} conteúdo(s) programado(s).`)}

      ${!days.length ? Components.emptyState('Nenhum conteúdo programado este mês.', '') : `
      <div class="space-y-6">
        ${days.map(day => {
          const dayDemands = byDay[day];
          const isToday = day === Dates.todayStr();
          return `
          <div>
            <div class="flex items-center gap-3 mb-3">
              <div class="w-px h-8 bg-brand-200 ml-2"></div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-800">${Dates.format(day)}</span>
                ${isToday ? `<span class="badge badge-in_progress">Hoje</span>` : ''}
              </div>
            </div>
            <div class="space-y-3 ml-6">
              ${dayDemands.map(d => `
                <div class="post-slot border-l-4 ${
                  d.status === 'published' ? 'border-l-green-400' :
                  d.status === 'scheduled' ? 'border-l-cyan-400' : 'border-l-orange-400'}">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <span class="time-label">${d.postingTime || '—'}</span>
                        ${Components.platformBadge(d.platform)}
                        ${Components.statusBadge(d.status)}
                      </div>
                      <h3 class="font-semibold text-slate-800 mb-2 cursor-pointer hover:text-brand-600" onclick="App.openDemandDetail('${d.id}')">${d.title}</h3>
                      ${d.copy ? `
                        <div class="bg-slate-50 rounded-lg p-3 mt-2">
                          <p class="text-xs font-bold text-slate-600 mb-1">COPY</p>
                          <p class="text-sm text-slate-700 whitespace-pre-wrap">${d.copy}</p>
                        </div>` : `
                        <div class="bg-orange-50 rounded-lg p-3 mt-2">
                          <p class="text-xs text-orange-600 font-semibold">⚠️ Copy não preenchida</p>
                          <textarea id="quick-copy-${d.id}" class="copy-area mt-2 bg-white" rows="2" placeholder="Adicione a copy aqui…"></textarea>
                          <button onclick="SocialPage.saveQuickCopy('${d.id}')" class="btn btn-primary btn-sm mt-2">Salvar Copy</button>
                        </div>`}
                    </div>
                    ${d.attachments?.length || d.fileName ? `
                    <div class="flex-shrink-0">
                      ${d.attachments?.length ? d.attachments.map(a =>
                        `<a href="${a.url||'#'}" target="_blank" class="file-chip">${Components.icon('drive','w-3 h-3')} ${a.name}</a>`
                      ).join('') : d.fileName ? `<span class="file-chip">${Components.icon('drive','w-3 h-3')} ${d.fileName}</span>` : ''}
                    </div>` : ''}
                  </div>
                </div>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>`}
    </div>`;

    document.getElementById('page-content').innerHTML = content;
  };

  const saveQuickCopy = (demandId) => {
    const copyEl = document.getElementById(`quick-copy-${demandId}`);
    if (!copyEl?.value?.trim()) { Components.toast('Digite a copy.', 'error'); return; }
    Store.updateDemand(demandId, { copy: copyEl.value.trim(), status: 'scheduled' });
    Components.toast('Copy salva e conteúdo programado!', 'success');
    renderPostingCalendar(Auth.currentUser());
  };

  return { renderMyDemands, saveCopy, schedulePost, renderCalendar, calNav, renderPostingCalendar, saveQuickCopy };
})();

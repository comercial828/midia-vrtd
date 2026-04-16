/* =========================================================
   DESIGNER PAGE — My demands + calendar
   ========================================================= */
const DesignerPage = (() => {

  const STATUS_ORDER = ['assigned', 'in_progress', 'review', 'approved', 'copy_pending', 'scheduled'];

  const renderMyDemands = (user) => {
    const all = Store.getDemandsByUser(user.id);
    const active = all.filter(d => !['published','scheduled'].includes(d.status))
      .sort((a,b) => {
        const dateA = new Date(a.deliveryDate), dateB = new Date(b.deliveryDate);
        if (dateA - dateB !== 0) return dateA - dateB;
        return (b.gutScores?.total || 0) - (a.gutScores?.total || 0);
      });
    const done = all.filter(d => ['published','scheduled'].includes(d.status));

    const overdueCnt = active.filter(d => Dates.isOverdue(d.deliveryDate, d.status)).length;
    const todayCnt = active.filter(d => d.deliveryDate === Dates.todayStr()).length;

    const content = `
    <div class="p-6 max-w-5xl mx-auto">
      ${Components.sectionHeader('Minhas Tarefas', `Olá, ${user.name.split(' ')[0]}! Você tem ${active.length} tarefa(s) ativa(s).`)}

      <!-- Quick stats -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="stat-card text-center py-4">
          <div class="text-2xl font-black text-brand-500">${active.length}</div>
          <div class="text-xs text-slate-500 font-medium mt-1">Ativas</div>
        </div>
        <div class="stat-card text-center py-4">
          <div class="text-2xl font-black ${overdueCnt > 0 ? 'text-red-500' : 'text-green-500'}">${overdueCnt}</div>
          <div class="text-xs text-slate-500 font-medium mt-1">Atrasadas</div>
        </div>
        <div class="stat-card text-center py-4">
          <div class="text-2xl font-black text-amber-500">${todayCnt}</div>
          <div class="text-xs text-slate-500 font-medium mt-1">Entregam Hoje</div>
        </div>
      </div>

      <!-- Schedule hint -->
      ${renderScheduleHint(user)}

      <!-- Active demands -->
      <h2 class="font-bold text-slate-800 mb-3">Tarefas em Andamento</h2>
      ${active.length ? `
        <div class="space-y-3 mb-8">
          ${active.map(d => memberDemandCard(d, user)).join('')}
        </div>` : Components.emptyState('Nenhuma tarefa ativa', 'Aguardando novas demandas do gestor.')}

      <!-- Done -->
      ${done.length ? `
        <h2 class="font-bold text-slate-800 mb-3 mt-6">Concluídos Recentemente</h2>
        <div class="space-y-2">
          ${done.slice(0,5).map(d => `
            <div class="flex items-center gap-3 p-3 card hover:shadow cursor-pointer" onclick="App.openDemandDetail('${d.id}')">
              ${Components.renderAvatar(user,'sm')}
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-700 truncate">${d.title}</p>
                <p class="text-xs text-slate-400">${Dates.format(d.postingDate)}</p>
              </div>
              ${Components.statusBadge(d.status)}
            </div>`).join('')}
        </div>` : ''}
    </div>`;

    document.getElementById('page-content').innerHTML = content;
  };

  const renderScheduleHint = (user) => {
    const schedule = Distribution.getDailySchedule(user.id);
    if (!schedule.length) return '';
    const next = schedule[0];
    const days = Dates.daysUntil(next.deliveryDate);
    return `
    <div class="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-5 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
        ${Components.icon('calendar','w-5 h-5 text-white')}
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-brand-800">Próxima entrega: <span class="text-brand-600">${next.title}</span></p>
        <p class="text-xs text-brand-600">${days === 0 ? 'Entrega HOJE!' : days < 0 ? `Atrasado ${Math.abs(days)} dia(s)!` : `Em ${days} dia(s) — ${Dates.format(next.deliveryDate)}`}</p>
      </div>
      ${days <= 0 ? `<span class="text-red-500 font-bold text-sm">⚠️</span>` : ''}
    </div>`;
  };

  const memberDemandCard = (d, user) => {
    const overdue = Dates.isOverdue(d.deliveryDate, d.status);
    const days = Dates.daysUntil(d.deliveryDate);
    const statusFlow = { assigned: 'in_progress', in_progress: 'review' };
    const nextStatus = statusFlow[d.status];
    const nextLabel = { in_progress: 'Iniciar', review: 'Enviar para Revisão' }[nextStatus] || null;

    return `
    <div class="card p-4 border-l-4 ${overdue ? 'border-l-red-400' : `priority-${d.priority}`}">
      <div class="flex items-start gap-3">
        <div class="flex-1 min-w-0 cursor-pointer" onclick="App.openDemandDetail('${d.id}')">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            ${Components.statusBadge(d.status)}
            ${Components.platformBadge(d.platform)}
            ${Components.priorityBadge(d.priority)}
          </div>
          <h3 class="font-semibold text-slate-800">${d.title}</h3>
          ${d.description ? `<p class="text-xs text-slate-500 mt-1 line-clamp-2">${d.description}</p>` : ''}
          <div class="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span class="${overdue ? 'text-red-500 font-semibold' : ''}">
              ${Components.icon('calendar','w-3.5 h-3.5 inline')} Entrega: ${Dates.format(d.deliveryDate)}
              ${overdue ? ' ⚠️ ATRASADO' : days === 0 ? ' — HOJE!' : days <= 2 ? ' — URGENTE' : ''}
            </span>
            <span>${Components.icon('calendar','w-3.5 h-3.5 inline')} Postagem: ${Dates.format(d.postingDate)} ${d.postingTime || ''}</span>
          </div>
        </div>
        <div class="flex flex-col gap-2 flex-shrink-0">
          ${nextLabel ? `<button onclick="event.stopPropagation();MemberActions.changeStatus('${d.id}','${nextStatus}')" class="btn btn-primary btn-sm whitespace-nowrap">${nextLabel}</button>` : ''}
          <button onclick="event.stopPropagation();MemberActions.openUpload('${d.id}')" class="btn btn-secondary btn-sm">
            ${Components.icon('upload','w-3.5 h-3.5')} Arquivo
          </button>
        </div>
      </div>
      ${d.gutScores ? `<div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
        <span class="text-xs text-slate-400">GUT ${d.gutScores.total}</span>
        <div class="progress-bar flex-1"><div class="progress-fill" style="width:${Math.min(100,(d.gutScores.total/125)*100)}%;background:${GUT.getPriorityColor(d.priority)}"></div></div>
      </div>` : ''}
    </div>`;
  };

  /* ───────────── CALENDAR ───────────── */
  let calYear, calMonth;
  const renderCalendar = (user) => {
    const now = new Date();
    if (!calYear) calYear = now.getFullYear();
    if (calMonth === undefined || calMonth === null) calMonth = now.getMonth();

    const demands = Store.getDemandsByUser(user.id);
    const content = `
    <div class="p-6 max-w-5xl mx-auto">
      ${Components.sectionHeader('Meu Calendário', 'Suas tarefas organizadas por data de entrega.')}
      <div class="card p-5">
        <div class="flex items-center justify-between mb-5">
          <button onclick="DesignerPage.calNav(-1)" class="btn btn-secondary btn-sm">← Anterior</button>
          <h2 class="font-bold text-slate-800">${Dates.getMonthName(calMonth)} ${calYear}</h2>
          <button onclick="DesignerPage.calNav(1)" class="btn btn-secondary btn-sm">Próximo →</button>
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

  return { renderMyDemands, renderCalendar, calNav, memberDemandCard };
})();

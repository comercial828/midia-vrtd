/* =========================================================
   MANAGER PAGES — Dashboard, Demands, Calendar, Finished
   ========================================================= */
const ManagerPage = (() => {

  /* ───────────── DASHBOARD ───────────── */
  const renderDashboard = (user) => {
    const stats = Store.getStats();
    const demands = Store.getDemands();
    const overdueDemands = demands.filter(d => Dates.isOverdue(d.deliveryDate, d.status));
    const todayDemands = demands.filter(d => {
      const del = d.deliveryDate || d.postingDate;
      return del === Dates.todayStr() && !['published','scheduled'].includes(d.status);
    });

    const content = `
    <div class="p-6 max-w-7xl mx-auto">
      ${Components.sectionHeader('Dashboard', `Bem-vinda, ${user.name.split(' ')[0]}! Aqui está um resumo da operação.`,
        `<button onclick="Drive.showSetupModal()" class="btn btn-secondary btn-sm">${Components.icon('drive','w-4 h-4')} Google Drive</button>
         <button onclick="App.openAddDemand()" class="btn btn-primary btn-sm">${Components.icon('plus','w-4 h-4')} Nova Demanda</button>`
      )}

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        ${statCard('Total de Demandas', stats.total, '#6366f1', Components.icon('demands','w-5 h-5'))}
        ${statCard('Em Andamento', stats.inProgress, '#f59e0b', Components.icon('chart','w-5 h-5'))}
        ${statCard('Aguardando Revisão', stats.review, '#8b5cf6', Components.icon('approvals','w-5 h-5'))}
        ${statCard('Atrasados', stats.overdue, stats.overdue > 0 ? '#ef4444' : '#22c55e', Components.icon('calendar','w-5 h-5'))}
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="card p-5 lg:col-span-2">
          <h3 class="font-semibold text-slate-800 mb-4">Produção Mensal</h3>
          <div style="height:200px"><canvas id="chart-monthly"></canvas></div>
        </div>
        <div class="card p-5">
          <h3 class="font-semibold text-slate-800 mb-4">Status das Demandas</h3>
          <div style="height:200px"><canvas id="chart-status"></canvas></div>
        </div>
      </div>

      <!-- Workload + Alerts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="card p-5">
          <h3 class="font-semibold text-slate-800 mb-4">Carga da Equipe</h3>
          <div style="height:180px"><canvas id="chart-workload"></canvas></div>
        </div>
        <div class="card p-5">
          <h3 class="font-semibold text-slate-800 mb-1">Entregas Hoje</h3>
          <p class="text-xs text-slate-500 mb-3">${Dates.format(Dates.todayStr())}</p>
          ${todayDemands.length ? todayDemands.slice(0,4).map(d => `
            <div class="flex items-center gap-2 mb-2 p-2 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100" onclick="App.openDemandDetail('${d.id}')">
              <span class="priority-dot dot-${d.priority}"></span>
              <span class="text-sm text-slate-700 truncate flex-1">${d.title}</span>
              ${Components.statusBadge(d.status)}
            </div>`).join('') : `<div class="text-sm text-slate-400 text-center py-4">Nenhuma entrega hoje 🎉</div>`}
        </div>
        <div class="card p-5">
          <h3 class="font-semibold text-slate-800 mb-1 text-red-600">⚠️ Atrasados</h3>
          <p class="text-xs text-slate-500 mb-3">${overdueDemands.length} demanda(s)</p>
          ${overdueDemands.length ? overdueDemands.slice(0,4).map(d => `
            <div class="flex items-center gap-2 mb-2 p-2 rounded-lg bg-red-50 cursor-pointer hover:bg-red-100" onclick="App.openDemandDetail('${d.id}')">
              <span class="text-red-400 text-xs font-bold">${Math.abs(Dates.daysUntil(d.deliveryDate))}d</span>
              <span class="text-sm text-red-700 truncate flex-1">${d.title}</span>
            </div>`).join('') : `<div class="text-sm text-slate-400 text-center py-4">Nenhum atraso 🎉</div>`}
        </div>
      </div>

      <!-- Recent Demands Table -->
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-800">Demandas Recentes</h3>
          <a href="#demands" class="text-sm text-brand-500 hover:text-brand-700 font-medium">Ver todas →</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="text-left py-2 px-3 font-semibold text-slate-600">Demanda</th>
                <th class="text-left py-2 px-3 font-semibold text-slate-600 hidden md:table-cell">Plataforma</th>
                <th class="text-left py-2 px-3 font-semibold text-slate-600">Status</th>
                <th class="text-left py-2 px-3 font-semibold text-slate-600 hidden lg:table-cell">Responsável</th>
                <th class="text-left py-2 px-3 font-semibold text-slate-600">Entrega</th>
                <th class="text-left py-2 px-3 font-semibold text-slate-600">Prioridade</th>
              </tr>
            </thead>
            <tbody>
              ${demands.filter(d => !['published'].includes(d.status)).slice(0,8).map(d => {
                const assignedUser = d.assignedTo ? Store.getUserById(d.assignedTo) : null;
                const overdue = Dates.isOverdue(d.deliveryDate, d.status);
                return `<tr class="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onclick="App.openDemandDetail('${d.id}')">
                  <td class="py-2.5 px-3">
                    <div class="flex items-center gap-2">
                      <span class="priority-dot dot-${d.priority}"></span>
                      <span class="font-medium text-slate-800 truncate max-w-[160px]">${d.title}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 hidden md:table-cell">${Components.platformBadge(d.platform)}</td>
                  <td class="py-2.5 px-3">${Components.statusBadge(d.status)}</td>
                  <td class="py-2.5 px-3 hidden lg:table-cell">
                    ${assignedUser ? `<div class="flex items-center gap-1.5">${Components.renderAvatar(assignedUser,'sm')}<span class="text-slate-600">${assignedUser.name.split(' ')[0]}</span></div>` : '—'}
                  </td>
                  <td class="py-2.5 px-3 ${overdue ? 'text-red-500 font-semibold' : 'text-slate-600'}">${Dates.formatShort(d.deliveryDate)}</td>
                  <td class="py-2.5 px-3">${Components.priorityBadge(d.priority)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

    document.getElementById('page-content').innerHTML = content;

    // Render charts after DOM update
    setTimeout(() => {
      const s = Store.getStats();
      if (Object.keys(s.byStatus).length) Charts.renderStatusChart('chart-status', s.byStatus);
      if (Object.keys(s.monthly).length) Charts.renderMonthlyChart('chart-monthly', s.monthly);
      if (s.workload.length) Charts.renderWorkloadChart('chart-workload', s.workload);
    }, 100);
  };

  const statCard = (label, value, color, iconHtml) => `
    <div class="stat-card">
      <div class="flex items-start justify-between mb-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:${color}15;color:${color}">${iconHtml}</div>
      </div>
      <div class="text-3xl font-black" style="color:${color}">${value}</div>
      <div class="text-sm text-slate-500 mt-1 font-medium">${label}</div>
    </div>`;

  /* ───────────── DEMANDS (KANBAN) ───────────── */
  const renderDemands = (user, filterStatus = 'all', filterMember = 'all', searchQuery = '') => {
    let demands = Store.getDemands();

    if (filterStatus !== 'all') demands = demands.filter(d => d.status === filterStatus);
    if (filterMember !== 'all') demands = demands.filter(d => d.assignedTo === filterMember);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      demands = demands.filter(d => d.title.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
    }

    const columns = [
      { id: 'backlog',      label: 'Backlog',         color: '#94a3b8' },
      { id: 'assigned',     label: 'Atribuído',       color: '#3b82f6' },
      { id: 'in_progress',  label: 'Em Andamento',    color: '#f59e0b' },
      { id: 'review',       label: 'Em Revisão',      color: '#8b5cf6' },
      { id: 'approved',     label: 'Aprovado',        color: '#10b981' },
      { id: 'copy_pending', label: 'Copy Pendente',   color: '#f97316' },
      { id: 'scheduled',    label: 'Programado',      color: '#06b6d4' },
      { id: 'published',    label: 'Publicado',       color: '#22c55e' }
    ];

    const members = Store.getUsers().filter(u => ['designer','videomaker','social_media'].includes(u.role));

    const content = `
    <div class="p-6">
      ${Components.sectionHeader('Demandas', `${demands.length} demanda(s) encontrada(s)`,
        `<button onclick="App.openAddDemand()" class="btn btn-primary btn-sm">${Components.icon('plus','w-4 h-4')} Nova Demanda</button>`)}

      <!-- Filters -->
      <div class="flex items-center gap-3 mb-5 flex-wrap">
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${Components.icon('search','w-4 h-4')}</span>
          <input type="text" id="demand-search" placeholder="Buscar demanda…"
            class="form-input pl-9 pr-4 py-2 text-sm w-52" value="${searchQuery}"
            oninput="ManagerPage.renderDemands(App.currentUser,'all','all',this.value)">
        </div>
        <select id="filter-member" class="form-input py-2 text-sm w-44"
          onchange="ManagerPage.renderDemands(App.currentUser,'all',this.value,document.getElementById('demand-search').value)">
          <option value="all">Todos os membros</option>
          ${members.map(m => `<option value="${m.id}" ${filterMember === m.id ? 'selected' : ''}>${m.name.split(' ')[0]}</option>`).join('')}
        </select>
        <select id="filter-status" class="form-input py-2 text-sm w-44"
          onchange="ManagerPage.renderDemands(App.currentUser,this.value,document.getElementById('filter-member').value,document.getElementById('demand-search').value)">
          <option value="all">Todos os status</option>
          ${columns.map(c => `<option value="${c.id}" ${filterStatus === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
        </select>
      </div>

      <!-- Kanban Board -->
      <div class="flex gap-3 overflow-x-auto pb-4">
        ${columns.map(col => {
          const colDemands = demands.filter(d => d.status === col.id).sort((a,b) => (b.gutScores?.total||0) - (a.gutScores?.total||0));
          return `
          <div class="kanban-col">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:${col.color}"></span>
                <span class="kanban-col-title" style="color:${col.color}">${col.label}</span>
              </div>
              <span class="text-xs text-slate-400 font-semibold">${colDemands.length}</span>
            </div>
            <div class="kanban-list space-y-2">
              ${colDemands.length ? colDemands.map(d => Components.demandCard(d)).join('') : `<div class="text-xs text-slate-400 text-center py-6">Vazio</div>`}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;

    document.getElementById('page-content').innerHTML = content;
  };

  /* ───────────── CALENDAR ───────────── */
  let calYear, calMonth;

  const renderCalendar = (user) => {
    const now = new Date();
    if (!calYear) calYear = now.getFullYear();
    if (!calMonth && calMonth !== 0) calMonth = now.getMonth();

    const demands = Store.getDemands();
    const monthName = Dates.getMonthName(calMonth);

    const content = `
    <div class="p-6">
      ${Components.sectionHeader('Calendário Editorial', 'Visualize todas as demandas por data de postagem.')}
      <div class="card p-5">
        <!-- Nav -->
        <div class="flex items-center justify-between mb-5">
          <button onclick="ManagerPage.calNav(-1)" class="btn btn-secondary btn-sm">← Anterior</button>
          <h2 class="font-bold text-slate-800 text-lg">${monthName} ${calYear}</h2>
          <button onclick="ManagerPage.calNav(1)" class="btn btn-secondary btn-sm">Próximo →</button>
        </div>
        <div id="cal-grid-container">
          ${Components.renderCalendarGrid(calYear, calMonth, demands)}
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-4 mt-4 flex-wrap">
        ${[
          { status: 'backlog', label: 'Backlog', color: '#94a3b8' },
          { status: 'in_progress', label: 'Em Andamento', color: '#f59e0b' },
          { status: 'review', label: 'Em Revisão', color: '#8b5cf6' },
          { status: 'approved', label: 'Aprovado', color: '#10b981' },
          { status: 'scheduled', label: 'Programado', color: '#06b6d4' },
          { status: 'published', label: 'Publicado', color: '#22c55e' }
        ].map(l => `<div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm" style="background:${l.color}"></span><span class="text-xs text-slate-600">${l.label}</span></div>`).join('')}
      </div>

      <!-- Day detail panel -->
      <div id="cal-day-detail" class="hidden card p-5 mt-4">
        <div id="cal-day-content"></div>
      </div>
    </div>`;

    document.getElementById('page-content').innerHTML = content;
  };

  const calNav = (dir) => {
    calMonth += dir;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar(App.currentUser);
  };

  const showDayDetail = (dateStr) => {
    const demands = Store.getDemands().filter(d => d.postingDate === dateStr);
    const panel = document.getElementById('cal-day-detail');
    const content = document.getElementById('cal-day-content');
    if (!panel || !content) return;

    panel.classList.remove('hidden');
    if (!demands.length) {
      content.innerHTML = `<p class="text-slate-500 text-sm">Nenhuma demanda em ${Dates.format(dateStr)}.</p>`;
      return;
    }
    content.innerHTML = `
      <h3 class="font-bold text-slate-800 mb-3">${Dates.format(dateStr)} — ${demands.length} conteúdo(s)</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${demands.map(d => Components.demandCard(d)).join('')}
      </div>`;
  };

  /* ───────────── FINISHED ───────────── */
  const renderFinished = (user) => {
    const demands = Store.getPublishedDemands().sort((a,b) => new Date(b.postingDate) - new Date(a.postingDate));

    const content = `
    <div class="p-6">
      ${Components.sectionHeader('Conteúdos Finalizados', `${demands.length} conteúdo(s) publicado(s) ou programado(s).`)}

      ${!demands.length ? Components.emptyState('Nenhum conteúdo finalizado ainda.', 'Os conteúdos publicados e programados aparecerão aqui.') : `
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        ${demands.map(d => finishedCard(d)).join('')}
      </div>`}
    </div>`;

    document.getElementById('page-content').innerHTML = content;
  };

  const finishedCard = (d) => {
    const assignedUser = d.assignedTo ? Store.getUserById(d.assignedTo) : null;
    return `
    <div class="card p-5 hover:shadow-md cursor-pointer" onclick="App.openDemandDetail('${d.id}')">
      <div class="flex items-start justify-between gap-2 mb-3">
        <div class="flex items-center gap-2 flex-wrap">
          ${Components.statusBadge(d.status)}
          ${Components.platformBadge(d.platform)}
        </div>
        <span class="text-xs text-slate-400 flex-shrink-0">${Dates.formatShort(d.postingDate)}</span>
      </div>
      <h3 class="font-semibold text-slate-800 mb-2">${d.title}</h3>
      ${d.copy ? `<p class="text-xs text-slate-500 line-clamp-2 mb-3 bg-slate-50 rounded-lg p-2 italic">"${d.copy}"</p>` : ''}
      ${d.attachments?.length ? `
        <div class="flex flex-wrap gap-1.5 mb-3">
          ${d.attachments.map(a => `
            <a href="${a.url || '#'}" target="_blank" onclick="event.stopPropagation()" class="file-chip">
              ${Components.icon('drive','w-3 h-3')} ${a.name}
            </a>`).join('')}
        </div>` : d.fileName ? `<div class="flex items-center gap-2 mb-3 text-sm text-slate-500">${Components.icon('drive','w-4 h-4')} ${d.fileName}</div>` : ''}
      ${assignedUser ? `
        <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
          ${Components.renderAvatar(assignedUser,'sm')}
          <span class="text-xs text-slate-500">${assignedUser.name}</span>
        </div>` : ''}
    </div>`;
  };

  /* ───────────── ADD DEMAND MODAL ───────────── */
  const openAddDemandModal = () => {
    Components.openModal(`
      ${Components.modalHeader('Nova Demanda', 'Preencha os dados para criar e atribuir automaticamente.')}
      <form id="add-demand-form" onsubmit="ManagerPage.submitDemand(event)" class="p-6 space-y-4">

        <!-- Row 1 -->
        <div class="form-group">
          <label class="form-label">Título da Demanda *</label>
          <input type="text" id="dem-title" class="form-input" placeholder="Ex: Post Agenda Semanal" required>
        </div>

        <!-- Row 2 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="form-group mb-0">
            <label class="form-label">Tipo de Conteúdo *</label>
            <select id="dem-type" class="form-input" required onchange="ManagerPage.updateDemandPreview()">
              <option value="">Selecione…</option>
              <option value="post_static">Post Estático</option>
              <option value="carousel">Carrossel</option>
              <option value="reels">Reels</option>
              <option value="story">Story</option>
              <option value="video">Vídeo</option>
              <option value="arte">Arte Final</option>
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Plataforma *</label>
            <select id="dem-platform" class="form-input" required onchange="ManagerPage.updateDemandPreview()">
              <option value="">Selecione…</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>

        <!-- Row 3 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="form-group mb-0">
            <label class="form-label">Data de Postagem *</label>
            <input type="date" id="dem-posting-date" class="form-input" required
              min="${Dates.todayStr()}" onchange="ManagerPage.updateDemandPreview()">
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Horário de Postagem</label>
            <input type="time" id="dem-posting-time" class="form-input" value="09:00">
          </div>
        </div>

        <div class="flex items-center gap-3">
          <input type="checkbox" id="dem-is-event" class="w-4 h-4 accent-brand-500" onchange="ManagerPage.updateDemandPreview()">
          <label for="dem-is-event" class="text-sm text-slate-700">É um conteúdo para evento especial?</label>
        </div>

        <div class="form-group">
          <label class="form-label">Descrição / Brief</label>
          <textarea id="dem-description" class="copy-area" rows="3" placeholder="Descreva o que deve ser criado, referências, informações importantes…"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Observações</label>
          <input type="text" id="dem-notes" class="form-input" placeholder="Notas adicionais…">
        </div>

        <!-- Smart Preview -->
        <div id="demand-preview" class="hidden bg-gradient-to-br from-slate-50 to-brand-50 border border-brand-100 rounded-xl p-4">
          <p class="text-xs font-bold text-brand-600 uppercase tracking-wider mb-3">✨ Análise Automática</p>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-slate-500 text-xs mb-1">Responsável Sugerido</p>
              <p id="preview-assignee" class="font-semibold text-slate-800">—</p>
            </div>
            <div>
              <p class="text-slate-500 text-xs mb-1">Prazo de Entrega</p>
              <p id="preview-delivery" class="font-semibold text-slate-800">—</p>
            </div>
            <div>
              <p class="text-slate-500 text-xs mb-1">Complexidade</p>
              <p id="preview-complexity" class="font-semibold text-slate-800">—</p>
            </div>
            <div>
              <p class="text-slate-500 text-xs mb-1">Prioridade GUT</p>
              <p id="preview-priority" class="font-semibold text-slate-800">—</p>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-slate-500 text-xs mb-2">Matriz GUT</p>
            <div id="preview-gut"></div>
          </div>
        </div>

        <div id="add-demand-error" class="form-error hidden"></div>

        <div class="flex gap-3 pt-2">
          <button type="button" onclick="Components.closeModal()" class="btn btn-secondary flex-1">Cancelar</button>
          <button type="submit" id="add-demand-btn" class="btn btn-primary flex-1">Criar Demanda</button>
        </div>
      </form>`);
  };

  const updateDemandPreview = () => {
    const type = document.getElementById('dem-type')?.value;
    const platform = document.getElementById('dem-platform')?.value;
    const postingDate = document.getElementById('dem-posting-date')?.value;
    const isEvent = document.getElementById('dem-is-event')?.checked;
    const preview = document.getElementById('demand-preview');
    if (!type || !platform || !postingDate || !preview) return;

    preview.classList.remove('hidden');
    const gutScores = GUT.calculate(type, platform, postingDate, isEvent);
    const priority = GUT.getPriority(gutScores.total);
    const deliveryDate = Dates.calcDeliveryDate(postingDate, type);
    const complexity = Dates.getComplexity(type);
    const assignee = Distribution.assignDemand(type);

    document.getElementById('preview-assignee').textContent = assignee ? assignee.name : 'Nenhum membro disponível';
    document.getElementById('preview-delivery').textContent = Dates.formatRelative(deliveryDate) + ' (' + Dates.format(deliveryDate) + ')';
    document.getElementById('preview-complexity').textContent = { simples: 'Simples', media: 'Média', complexa: 'Complexa' }[complexity] || complexity;
    const priorityColors = { critical: 'text-red-600', high: 'text-orange-600', medium: 'text-yellow-700', low: 'text-green-600' };
    document.getElementById('preview-priority').innerHTML = `<span class="${priorityColors[priority]} font-bold">${GUT.getPriorityLabel(priority)} (${gutScores.total})</span>`;
    document.getElementById('preview-gut').innerHTML = Components.gutDisplay(gutScores, priority);
  };

  const submitDemand = (e) => {
    e.preventDefault();
    const errEl = document.getElementById('add-demand-error');
    const btn = document.getElementById('add-demand-btn');
    errEl.classList.add('hidden');

    const type = document.getElementById('dem-type').value;
    const platform = document.getElementById('dem-platform').value;
    const postingDate = document.getElementById('dem-posting-date').value;
    const isEvent = document.getElementById('dem-is-event').checked;

    const gutScores = GUT.calculate(type, platform, postingDate, isEvent);
    const priority = GUT.getPriority(gutScores.total);
    const deliveryDate = Dates.calcDeliveryDate(postingDate, type);
    const reviewDate = Dates.calcReviewDate(deliveryDate);
    const assignee = Distribution.assignDemand(type);
    const complexity = Dates.getComplexity(type);

    btn.innerHTML = '<div class="spinner"></div>';
    btn.disabled = true;

    setTimeout(() => {
      try {
        const user = Auth.currentUser();
        Store.createDemand({
          title: document.getElementById('dem-title').value,
          type, platform, postingDate,
          postingTime: document.getElementById('dem-posting-time').value,
          description: document.getElementById('dem-description').value,
          notes: document.getElementById('dem-notes').value,
          deliveryDate, reviewDate, status: assignee ? 'assigned' : 'backlog',
          priority, gutScores, complexity, isEvent,
          assignedTo: assignee?.id || null,
          assignedName: assignee?.name || null,
          createdBy: user.id, createdByName: user.name,
          copy: '', driveFileId: null, driveFileUrl: null, fileName: null
        });
        Components.closeModal();
        Components.toast(`Demanda criada e atribuída para ${assignee?.name || 'sem responsável'}!`, 'success');
        App.navigate(App.currentRoute || 'demands');
      } catch(err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
        btn.innerHTML = 'Criar Demanda';
        btn.disabled = false;
      }
    }, 400);
  };

  return { renderDashboard, renderDemands, renderCalendar, calNav, showDayDetail, renderFinished, openAddDemandModal, updateDemandPreview, submitDemand };
})();

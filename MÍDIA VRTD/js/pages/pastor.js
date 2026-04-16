/* =========================================================
   PASTOR PAGE — Overview + Approvals
   ========================================================= */
const PastorPage = (() => {

  /* ─── OVERVIEW ─── */
  const renderOverview = (user) => {
    const stats = Store.getStats();
    const all = Store.getDemands();
    const upcoming = all.filter(d => {
      if (!d.postingDate) return false;
      const days = Dates.daysUntil(d.postingDate);
      return days >= 0 && days <= 7;
    }).sort((a,b) => new Date(a.postingDate) - new Date(b.postingDate));

    const content = `
    <div class="p-6 max-w-5xl mx-auto">
      ${Components.sectionHeader('Visão Geral', `Bem-vindo, ${user.name.split(' ')[0]}! Acompanhe a operação da agência.`)}

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="stat-card text-center py-5">
          <div class="text-3xl font-black text-brand-500">${stats.total}</div>
          <div class="text-sm text-slate-500 mt-1">Total</div>
        </div>
        <div class="stat-card text-center py-5">
          <div class="text-3xl font-black text-amber-500">${stats.inProgress}</div>
          <div class="text-sm text-slate-500 mt-1">Em Andamento</div>
        </div>
        <div class="stat-card text-center py-5">
          <div class="text-3xl font-black text-violet-500">${stats.review}</div>
          <div class="text-sm text-slate-500 mt-1">Aguardando Revisão</div>
        </div>
        <div class="stat-card text-center py-5">
          <div class="text-3xl font-black text-green-500">${stats.done}</div>
          <div class="text-sm text-slate-500 mt-1">Publicados</div>
        </div>
      </div>

      <!-- Upcoming this week -->
      <div class="card p-5 mb-4">
        <h3 class="font-bold text-slate-800 mb-4">Próximas Postagens — 7 dias</h3>
        ${upcoming.length ? `
          <div class="space-y-2">
            ${upcoming.map(d => {
              const assignedUser = d.assignedTo ? Store.getUserById(d.assignedTo) : null;
              return `
              <div class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer" onclick="App.openDemandDetail('${d.id}')">
                ${Components.platformBadge(d.platform)}
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-700 truncate">${d.title}</p>
                </div>
                <span class="text-xs text-slate-500 flex-shrink-0">${Dates.format(d.postingDate)}</span>
                ${Components.statusBadge(d.status)}
              </div>`;
            }).join('')}
          </div>` : `<p class="text-slate-400 text-sm">Nenhuma postagem nos próximos 7 dias.</p>`}
      </div>

      <!-- Team -->
      <div class="card p-5">
        <h3 class="font-bold text-slate-800 mb-4">Equipe</h3>
        <div class="space-y-3">
          ${Distribution.getTeamWorkload().map(w => `
            <div class="flex items-center gap-3">
              ${Components.renderAvatar(w.user)}
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-slate-700">${w.user.name}</span>
                  <span class="text-xs text-slate-500">${w.active} ativa(s)</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${Math.min(100, w.active * 12.5)}%;background:${w.user.color}"></div>
                </div>
              </div>
              ${w.overdue > 0 ? `<span class="text-xs text-red-500 font-bold flex-shrink-0">⚠️ ${w.overdue}</span>` : ''}
            </div>`).join('')}
        </div>
      </div>
    </div>`;

    document.getElementById('page-content').innerHTML = content;
  };

  /* ─── APPROVALS ─── */
  const renderApprovals = (user) => {
    const toReview = Store.getDemands().filter(d => d.status === 'review');

    const content = `
    <div class="p-6 max-w-4xl mx-auto">
      ${Components.sectionHeader('Aprovações', `${toReview.length} demanda(s) aguardando sua aprovação.`)}

      ${!toReview.length ? `
        <div class="card p-12 text-center">
          <div class="text-5xl mb-4">🙌</div>
          <p class="text-slate-600 font-semibold">Nenhuma demanda aguardando aprovação.</p>
          <p class="text-slate-400 text-sm mt-1">Você está em dia!</p>
        </div>` : `
      <div class="space-y-4">
        ${toReview.map(d => {
          const assignedUser = d.assignedTo ? Store.getUserById(d.assignedTo) : null;
          return `
          <div class="card p-5">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  ${Components.platformBadge(d.platform)}
                  ${Components.priorityBadge(d.priority)}
                </div>
                <h3 class="font-bold text-slate-800 text-lg cursor-pointer hover:text-brand-600" onclick="App.openDemandDetail('${d.id}')">${d.title}</h3>
                ${d.description ? `<p class="text-sm text-slate-500 mt-1">${d.description}</p>` : ''}
              </div>
              ${assignedUser ? Components.renderAvatar(assignedUser) : ''}
            </div>

            <div class="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span>${Components.icon('calendar','w-3.5 h-3.5 inline')} Postagem: ${Dates.format(d.postingDate)}</span>
              ${assignedUser ? `<span>Criado por: ${assignedUser.name}</span>` : ''}
            </div>

            ${d.fileName || d.attachments?.length ? `
              <div class="flex flex-wrap gap-2 mb-4">
                ${d.attachments?.map(a => `<a href="${a.url||'#'}" target="_blank" class="file-chip">${Components.icon('drive','w-3 h-3')} ${a.name}</a>`).join('') || ''}
                ${d.fileName && !d.attachments?.length ? `<span class="file-chip">${Components.icon('drive','w-3 h-3')} ${d.fileName}</span>` : ''}
              </div>` : ''}

            <div class="flex gap-3">
              <button onclick="PastorPage.approve('${d.id}')" class="btn btn-primary flex-1 justify-center">
                ${Components.icon('check','w-4 h-4')} Aprovar
              </button>
              <button onclick="PastorPage.requestChanges('${d.id}')" class="btn btn-danger flex-1 justify-center">
                Solicitar Alterações
              </button>
              <button onclick="App.openDemandDetail('${d.id}')" class="btn btn-secondary">Ver Detalhes</button>
            </div>
          </div>`;
        }).join('')}
      </div>`}
    </div>`;

    document.getElementById('page-content').innerHTML = content;
  };

  const approve = (demandId) => {
    Store.updateDemand(demandId, { status: 'approved' });
    Store.addDemandHistory(demandId, { action: 'approved', user: Auth.currentUser().name, note: 'Aprovado pelo Pastor/Líder' });
    Components.toast('Demanda aprovada!', 'success');
    renderApprovals(Auth.currentUser());
  };

  const requestChanges = (demandId) => {
    Components.openModal(`
      ${Components.modalHeader('Solicitar Alterações')}
      <div class="p-6 space-y-4">
        <div class="form-group">
          <label class="form-label">Descreva o que precisa ser alterado</label>
          <textarea id="changes-note" class="copy-area" rows="4" placeholder="Ex: Alterar a cor do fundo, revisar o texto…"></textarea>
        </div>
        <div class="flex gap-3">
          <button onclick="Components.closeModal()" class="btn btn-secondary flex-1">Cancelar</button>
          <button onclick="PastorPage.submitChanges('${demandId}')" class="btn btn-danger flex-1">Solicitar Alterações</button>
        </div>
      </div>`);
  };

  const submitChanges = (demandId) => {
    const note = document.getElementById('changes-note')?.value?.trim();
    if (!note) { Components.toast('Descreva as alterações necessárias.', 'error'); return; }
    Store.updateDemand(demandId, { status: 'in_progress' });
    Store.addDemandHistory(demandId, { action: 'changes_requested', user: Auth.currentUser().name, note });
    Components.closeModal();
    Components.toast('Solicitação de alterações enviada.', 'info');
    renderApprovals(Auth.currentUser());
  };

  return { renderOverview, renderApprovals, approve, requestChanges, submitChanges };
})();

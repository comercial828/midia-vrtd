/* =========================================================
   APP — Main entry point, routing, demand detail modal,
         member actions (status changes, file uploads)
   ========================================================= */

/* ===== MEMBER ACTIONS (shared across roles) ===== */
const MemberActions = (() => {

  const changeStatus = (demandId, newStatus) => {
    const user = Auth.currentUser();
    Store.updateDemand(demandId, { status: newStatus });
    Store.addDemandHistory(demandId, {
      action: 'status_change', user: user.name,
      note: `Status alterado para: ${Components.STATUS_LABELS[newStatus] || newStatus}`
    });
    Components.toast(`Status atualizado para "${Components.STATUS_LABELS[newStatus]}"`, 'success');
    App.navigate(App.currentRoute || 'my-demands');
  };

  const openUpload = (demandId) => {
    const d = Store.getDemandById(demandId);
    if (!d) return;
    const user = Auth.currentUser();
    Components.openModal(`
      ${Components.modalHeader('Enviar Arquivo', `Demanda: ${d.title}`)}
      <div class="p-6 space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          ${Drive.isConfigured()
            ? '✓ Google Drive configurado. O arquivo será enviado para a pasta do responsável.'
            : '⚠️ Google Drive não configurado. O arquivo será salvo localmente (demo).'}
        </div>
        <div class="form-group">
          <label class="form-label">Selecione o arquivo</label>
          <input type="file" id="upload-file" class="form-input" accept="image/*,video/*,.pdf,.psd,.ai,.fig">
        </div>
        <div id="upload-progress" class="hidden">
          <div class="flex items-center gap-3 text-sm text-slate-600">
            <div class="spinner border-brand-500 border-t-brand-200"></div>
            <span>Enviando para o Drive…</span>
          </div>
        </div>
        <div id="upload-error" class="form-error hidden"></div>
        <div class="flex gap-3">
          <button onclick="Components.closeModal()" class="btn btn-secondary flex-1">Cancelar</button>
          <button onclick="MemberActions.submitUpload('${demandId}')" class="btn btn-primary flex-1" id="upload-btn">
            ${Components.icon('upload','w-4 h-4')} Enviar Arquivo
          </button>
        </div>
      </div>`);
  };

  const submitUpload = async (demandId) => {
    const fileInput = document.getElementById('upload-file');
    const btn = document.getElementById('upload-btn');
    const progress = document.getElementById('upload-progress');
    const errEl = document.getElementById('upload-error');
    const d = Store.getDemandById(demandId);
    const user = Auth.currentUser();

    if (!fileInput?.files?.length) { errEl.textContent = 'Selecione um arquivo.'; errEl.classList.remove('hidden'); return; }

    const file = fileInput.files[0];
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';
    progress.classList.remove('hidden');
    errEl.classList.add('hidden');

    try {
      let result;
      if (Drive.isConfigured()) {
        result = await Drive.uploadFile(file, d.title, user.name);
      } else {
        result = await Drive.mockUpload(file, d.title);
      }

      const attachments = d.attachments || [];
      attachments.push({ name: file.name, driveId: result.id, url: result.url });

      Store.updateDemand(demandId, {
        fileName: file.name, driveFileId: result.id, driveFileUrl: result.url,
        attachments, status: d.status === 'in_progress' ? 'review' : d.status
      });
      Store.addDemandHistory(demandId, { action: 'file_uploaded', user: user.name, note: `Arquivo enviado: ${file.name}` });

      Components.closeModal();
      Components.toast(`Arquivo "${file.name}" enviado com sucesso!`, 'success');
      App.navigate(App.currentRoute || 'my-demands');
    } catch(err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = `${Components.icon('upload','w-4 h-4')} Enviar Arquivo`;
      progress.classList.add('hidden');
    }
  };

  return { changeStatus, openUpload, submitUpload };
})();

/* ===== DEMAND DETAIL MODAL ===== */
const DemandDetail = (() => {

  const open = (demandId) => {
    const d = Store.getDemandById(demandId);
    if (!d) { Components.toast('Demanda não encontrada.', 'error'); return; }

    const user = Auth.currentUser();
    const assignedUser = d.assignedTo ? Store.getUserById(d.assignedTo) : null;
    const overdue = Dates.isOverdue(d.deliveryDate, d.status);
    const canEdit = user.role === 'gestor';
    const canApprove = ['gestor', 'pastor'].includes(user.role) && d.status === 'review';
    const canChangeSelf = (user.id === d.assignedTo);
    const statusFlow = { assigned: 'in_progress', in_progress: 'review' };

    Components.openModal(`
      ${Components.modalHeader(d.title, `${Components.TYPE_LABELS[d.type] || d.type} • ${Components.PLATFORM_LABELS[d.platform] || d.platform}`)}
      <div class="p-6 space-y-5">

        <!-- Status + Platform row -->
        <div class="flex items-center gap-3 flex-wrap">
          ${Components.statusBadge(d.status)}
          ${Components.platformBadge(d.platform)}
          ${Components.priorityBadge(d.priority)}
          ${d.isEvent ? `<span class="badge" style="background:#fef3c7;color:#92400e">🎉 Evento</span>` : ''}
        </div>

        <!-- Dates grid -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-slate-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-500 mb-1">Postagem</p>
            <p class="font-bold text-slate-800">${Dates.format(d.postingDate)}</p>
            <p class="text-xs text-slate-400">${d.postingTime || '—'}</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-3 text-center ${overdue ? 'bg-red-50' : ''}">
            <p class="text-xs text-slate-500 mb-1">Entrega</p>
            <p class="font-bold ${overdue ? 'text-red-600' : 'text-slate-800'}">${Dates.format(d.deliveryDate)}</p>
            <p class="text-xs ${overdue ? 'text-red-400' : 'text-slate-400'}">${Dates.formatRelative(d.deliveryDate)}</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-500 mb-1">Revisão</p>
            <p class="font-bold text-slate-800">${Dates.format(d.reviewDate)}</p>
          </div>
        </div>

        <!-- GUT -->
        <div>
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Prioridade — Matriz GUT</p>
          ${Components.gutDisplay(d.gutScores, d.priority)}
        </div>

        <!-- Assignee -->
        ${assignedUser ? `
        <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          ${Components.renderAvatar(assignedUser)}
          <div>
            <p class="text-xs text-slate-500">Responsável</p>
            <p class="font-semibold text-slate-800">${assignedUser.name}</p>
            <p class="text-xs text-slate-400">${Auth.ROLE_LABELS[assignedUser.role] || assignedUser.role}</p>
          </div>
        </div>` : ''}

        <!-- Description -->
        ${d.description ? `
        <div>
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Brief / Descrição</p>
          <p class="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 leading-relaxed">${d.description}</p>
        </div>` : ''}

        <!-- Notes -->
        ${d.notes ? `
        <div>
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Observações</p>
          <p class="text-sm text-slate-600">${d.notes}</p>
        </div>` : ''}

        <!-- Attachments -->
        ${d.attachments?.length || d.fileName ? `
        <div>
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Arquivos</p>
          <div class="flex flex-wrap gap-2">
            ${d.attachments?.map(a => `<a href="${a.url||'#'}" target="_blank" class="file-chip">${Components.icon('drive','w-3 h-3')} ${a.name}</a>`).join('') || ''}
            ${d.fileName && !d.attachments?.length ? `<span class="file-chip">${Components.icon('drive','w-3 h-3')} ${d.fileName}</span>` : ''}
          </div>
        </div>` : ''}

        <!-- Copy -->
        ${(user.role === 'social_media' || user.role === 'gestor') && ['approved','copy_pending','scheduled','published'].includes(d.status) ? `
        <div>
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Copy</p>
          <textarea id="detail-copy-${d.id}" class="copy-area" rows="3" placeholder="Copy para postagem…">${d.copy || ''}</textarea>
          <button onclick="DemandDetail.saveCopy('${d.id}')" class="btn btn-secondary btn-sm mt-2">${Components.icon('check','w-3.5 h-3.5')} Salvar Copy</button>
        </div>` : d.copy ? `
        <div>
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Copy</p>
          <p class="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 italic">"${d.copy}"</p>
        </div>` : ''}

        <!-- History -->
        ${d.history?.length ? `
        <div>
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Histórico</p>
          <div class="space-y-2">
            ${[...d.history].reverse().slice(0,5).map(h => `
              <div class="flex items-start gap-2 text-xs">
                <span class="text-slate-400 flex-shrink-0">${new Date(h.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>
                <span class="text-slate-600"><strong>${h.user}</strong> — ${h.note}</span>
              </div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Actions -->
        <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          ${canApprove ? `<button onclick="DemandDetail.approve('${d.id}')" class="btn btn-primary">${Components.icon('check','w-4 h-4')} Aprovar</button>` : ''}
          ${canChangeSelf && statusFlow[d.status] ? `
            <button onclick="DemandDetail.changeStatus('${d.id}','${statusFlow[d.status]}')" class="btn btn-primary">
              ${statusFlow[d.status] === 'in_progress' ? 'Iniciar Tarefa' : 'Enviar para Revisão'}
            </button>` : ''}
          ${canChangeSelf ? `<button onclick="MemberActions.openUpload('${d.id}')" class="btn btn-secondary">${Components.icon('upload','w-4 h-4')} Upload</button>` : ''}
          ${canEdit ? `
            <button onclick="DemandDetail.deleteConfirm('${d.id}')" class="btn btn-danger ml-auto">${Components.icon('trash','w-4 h-4')}</button>` : ''}
        </div>
      </div>`, 'max-w-xl');
  };

  const saveCopy = (demandId) => {
    const copyEl = document.getElementById(`detail-copy-${demandId}`);
    if (!copyEl) return;
    Store.updateDemand(demandId, { copy: copyEl.value.trim() });
    Components.toast('Copy salva!', 'success');
  };

  const approve = (demandId) => {
    Store.updateDemand(demandId, { status: 'approved' });
    Store.addDemandHistory(demandId, { action: 'approved', user: Auth.currentUser().name, note: 'Aprovado' });
    Components.closeModal();
    Components.toast('Demanda aprovada!', 'success');
    App.navigate(App.currentRoute || 'demands');
  };

  const changeStatus = (demandId, newStatus) => {
    MemberActions.changeStatus(demandId, newStatus);
    Components.closeModal();
  };

  const deleteConfirm = (demandId) => {
    const d = Store.getDemandById(demandId);
    if (!confirm(`Excluir a demanda "${d?.title}"? Esta ação não pode ser desfeita.`)) return;
    Store.deleteDemand(demandId);
    Components.closeModal();
    Components.toast('Demanda excluída.', 'info');
    App.navigate(App.currentRoute || 'demands');
  };

  return { open, saveCopy, approve, changeStatus, deleteConfirm };
})();

/* ===== MAIN APP ===== */
const App = (() => {

  let currentUser = null;
  let currentRoute = null;

  /* ─── INIT ─── */
  const init = () => {
    currentUser = Auth.currentUser();

    if (!currentUser) {
      document.getElementById('auth-container').classList.remove('hidden');
      document.getElementById('app-container').classList.add('hidden');
      LoginPage.render();
      return;
    }

    document.getElementById('auth-container').innerHTML = '';
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('flex');

    setupLayout();
    Router.init();

    // Set default route based on role
    const defaultRoutes = {
      gestor: 'dashboard', designer: 'my-demands', videomaker: 'my-demands',
      social_media: 'my-demands', pastor: 'overview'
    };

    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === 'default') {
      Router.navigate(defaultRoutes[currentUser.role] || 'dashboard');
    }
  };

  /* ─── LAYOUT ─── */
  const setupLayout = () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    currentRoute = hash;

    document.getElementById('sidebar').innerHTML = Components.renderSidebar(currentUser, hash);
    document.getElementById('top-header').innerHTML = Components.renderHeader(currentUser, getPageTitle(hash));
  };

  const getPageTitle = (route) => {
    const titles = {
      dashboard: 'Dashboard', demands: 'Demandas', calendar: 'Calendário Editorial',
      finished: 'Conteúdos Finalizados', 'my-demands': 'Minhas Tarefas',
      posting: 'Calendário de Postagem', overview: 'Visão Geral', approvals: 'Aprovações'
    };
    return titles[route] || 'MÍDIA VRTD';
  };

  /* ─── ROUTING ─── */
  const navigate = (route) => {
    currentRoute = route;
    setupLayout();
    Router.navigate(route);
  };

  const setupRoutes = () => {
    // Handlers read currentUser lazily (after init sets it)
    const role = () => currentUser?.role;

    Router.register('dashboard', () => {
      if (role() === 'gestor') ManagerPage.renderDashboard(currentUser);
    });

    Router.register('demands', () => {
      if (role() === 'gestor') ManagerPage.renderDemands(currentUser);
    });

    Router.register('calendar', () => {
      if (role() === 'gestor') ManagerPage.renderCalendar(currentUser);
      else if (role() === 'designer') DesignerPage.renderCalendar(currentUser);
      else if (role() === 'videomaker') VideomakerPage.renderCalendar(currentUser);
      else if (role() === 'social_media') SocialPage.renderCalendar(currentUser);
    });

    Router.register('finished', () => {
      if (role() === 'gestor') ManagerPage.renderFinished(currentUser);
    });

    Router.register('my-demands', () => {
      if (role() === 'designer') DesignerPage.renderMyDemands(currentUser);
      else if (role() === 'videomaker') VideomakerPage.renderMyDemands(currentUser);
      else if (role() === 'social_media') SocialPage.renderMyDemands(currentUser);
    });

    Router.register('posting', () => {
      if (role() === 'social_media') SocialPage.renderPostingCalendar(currentUser);
    });

    Router.register('overview', () => {
      if (role() === 'pastor') PastorPage.renderOverview(currentUser);
    });

    Router.register('approvals', () => {
      if (role() === 'pastor') PastorPage.renderApprovals(currentUser);
    });

    Router.register('default', () => {
      const defaults = { gestor: 'dashboard', designer: 'my-demands', videomaker: 'my-demands', social_media: 'my-demands', pastor: 'overview' };
      navigate(defaults[role()] || 'dashboard');
    });
  };

  /* ─── MODAL SHORTCUTS ─── */
  const openDemandDetail = (id) => DemandDetail.open(id);

  const openAddDemand = () => {
    if (currentUser?.role === 'gestor') ManagerPage.openAddDemandModal();
  };

  const calDayClick = (dateStr) => {
    const role = currentUser?.role;
    if (role === 'gestor') ManagerPage.showDayDetail(dateStr);
    else {
      const detail = document.getElementById('cal-day-detail');
      const content = document.getElementById('cal-day-content');
      if (!detail || !content) return;
      const demands = role === 'social_media' ? Store.getDemands() : Store.getDemandsByUser(currentUser.id);
      const dayDemands = demands.filter(d => d.postingDate === dateStr);
      detail.classList.remove('hidden');
      content.innerHTML = dayDemands.length
        ? `<h3 class="font-bold mb-3">${Dates.format(dateStr)}</h3><div class="space-y-2">${dayDemands.map(d => Components.demandCard(d)).join('')}</div>`
        : `<p class="text-slate-400 text-sm">${Dates.format(dateStr)} — sem demandas.</p>`;
    }
  };

  /* ─── CLOSE MODAL ON OVERLAY CLICK ─── */
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) Components.closeModal();
  });

  /* ─── SETUP ROUTES & INIT ─── */
  setupRoutes();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init, navigate,
    get currentRoute() { return currentRoute; },
    get currentUser() { return currentUser; },
    openDemandDetail, openAddDemand, calDayClick
  };
})();

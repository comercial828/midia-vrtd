/* =========================================================
   COMPONENTS — Sidebar, Header, Modal, Toast, shared UI
   ========================================================= */
const Components = (() => {

  /* ===== ICONS (inline SVG snippets) ===== */
  const icon = (name, cls = 'w-5 h-5') => {
    const icons = {
      dashboard: `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
      demands:   `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
      calendar:  `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
      finished:  `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`,
      posting:   `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
      approvals: `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      overview:  `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
      plus:      `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M12 4v16m8-8H4"/></svg>`,
      close:     `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>`,
      logout:    `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>`,
      drive:     `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor"><path d="M4.585 17.5L1.5 12.25 7.085 3h10.19L22.5 12.25 19.415 17.5H4.585zm1.54-1.5h11.75L20.46 12.25 14.875 4H9.125L3.54 12.25 6.125 16z"/></svg>`,
      upload:    `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>`,
      download:  `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/></svg>`,
      edit:      `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 013.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>`,
      check:     `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>`,
      bell:      `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>`,
      filter:    `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>`,
      instagram: `<svg class="${cls}" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
      youtube:   `<svg class="${cls}" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
      facebook:  `<svg class="${cls}" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
      tiktok:    `<svg class="${cls}" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z"/></svg>`,
      whatsapp:  `<svg class="${cls}" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
      copy_icon: `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
      search:    `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
      trash:     `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
      chart:     `<svg class="${cls}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    };
    return icons[name] || '';
  };

  /* ===== PLATFORM ICONS ===== */
  const platformIcon = (platform, cls = 'w-4 h-4') => {
    const map = { instagram: 'instagram', youtube: 'youtube', facebook: 'facebook', tiktok: 'tiktok', whatsapp: 'whatsapp' };
    return icon(map[platform] || 'posting', cls);
  };

  /* ===== TYPE LABELS ===== */
  const TYPE_LABELS = { post_static: 'Post Estático', carousel: 'Carrossel', reels: 'Reels', story: 'Story', video: 'Vídeo', arte: 'Arte Final' };
  const PLATFORM_LABELS = { instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok', whatsapp: 'WhatsApp' };
  const STATUS_LABELS = {
    backlog: 'Backlog', assigned: 'Atribuído', in_progress: 'Em Andamento',
    review: 'Em Revisão', approved: 'Aprovado', copy_pending: 'Copy Pendente',
    scheduled: 'Programado', published: 'Publicado'
  };

  /* ===== AVATAR ===== */
  const renderAvatar = (user, size = 'md') => {
    const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
    return `<div class="avatar ${sizes[size] || sizes.md}" style="background:${user.color || '#6366f1'}20;color:${user.color || '#6366f1'}">${user.avatar || '?'}</div>`;
  };

  /* ===== STATUS BADGE ===== */
  const statusBadge = (status) => `<span class="badge badge-${status}">${STATUS_LABELS[status] || status}</span>`;

  /* ===== PRIORITY BADGE ===== */
  const priorityBadge = (priority) => `<span class="badge badge-${priority}">${GUT.getPriorityLabel(priority)}</span>`;

  /* ===== PLATFORM BADGE ===== */
  const platformBadge = (platform) =>
    `<span class="platform-badge platform-${platform}">${platformIcon(platform, 'w-3 h-3')} ${PLATFORM_LABELS[platform] || platform}</span>`;

  /* ===== DEMAND CARD ===== */
  const demandCard = (d, compact = false) => {
    const overdue = Dates.isOverdue(d.deliveryDate, d.status);
    const daysLeft = Dates.daysUntil(d.deliveryDate);
    const assignedUser = d.assignedTo ? Store.getUserById(d.assignedTo) : null;
    return `
    <div class="demand-card priority-${d.priority}" onclick="App.openDemandDetail('${d.id}')">
      <div class="flex items-start justify-between gap-2 mb-3">
        <p class="font-semibold text-slate-800 text-sm leading-snug flex-1">${d.title}</p>
        <div class="flex-shrink-0">${statusBadge(d.status)}</div>
      </div>
      <div class="flex items-center gap-2 flex-wrap mb-3">
        ${platformBadge(d.platform)}
        <span class="badge badge-${d.priority}">${TYPE_LABELS[d.type] || d.type}</span>
      </div>
      ${!compact ? `
      <div class="flex items-center justify-between text-xs text-slate-500 mt-2">
        <div class="flex items-center gap-1.5">
          ${icon('calendar', 'w-3.5 h-3.5')}
          <span class="${overdue ? 'text-red-500 font-semibold' : ''}">
            Entrega: ${Dates.formatShort(d.deliveryDate)} ${overdue ? '⚠️' : ''}
          </span>
        </div>
        ${assignedUser ? renderAvatar(assignedUser, 'sm') : ''}
      </div>
      <div class="mt-2 flex items-center gap-2">
        <div class="flex items-center gap-1">
          <span class="priority-dot dot-${d.priority}"></span>
          <span class="text-xs text-slate-500">GUT: ${d.gutScores?.total || '—'}</span>
        </div>
        ${daysLeft < 0 && !['published','scheduled'].includes(d.status) ? `<span class="text-xs text-red-500 font-semibold">Atrasado ${Math.abs(daysLeft)}d</span>` : ''}
        ${daysLeft >= 0 && daysLeft <= 2 && !['published','scheduled'].includes(d.status) ? `<span class="text-xs text-orange-500 font-semibold">Urgente!</span>` : ''}
      </div>
      ` : ''}
    </div>`;
  };

  /* ===== SIDEBAR ===== */
  const renderSidebar = (user, activePage) => {
    const navItems = getNavItems(user.role);
    const roleLabel = Auth.ROLE_LABELS[user.role] || user.role;
    return `
    <div class="p-5 border-b border-slate-700/50">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          ${icon('chart', 'w-4 h-4 text-white')}
        </div>
        <div>
          <p class="text-white font-bold text-sm leading-none">MÍDIA VRTD</p>
          <p class="text-slate-400 text-xs mt-0.5">Agência de Marketing</p>
        </div>
      </div>
    </div>
    <nav class="flex-1 p-3 space-y-1">
      ${navItems.map(item => `
        <a href="#${item.route}" class="nav-item ${activePage === item.route ? 'active' : ''}">
          ${icon(item.icon, 'nav-icon')}
          <span>${item.label}</span>
        </a>
      `).join('')}
    </nav>
    ${user.role === 'gestor' ? `
    <div class="p-3">
      <button onclick="App.openAddDemand()" class="btn btn-primary w-full justify-center">
        ${icon('plus', 'w-4 h-4')} Nova Demanda
      </button>
    </div>` : ''}
    <div class="p-3 border-t border-slate-700/50">
      <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-700/30 cursor-pointer">
        ${renderAvatar(user)}
        <div class="flex-1 min-w-0">
          <p class="text-white text-sm font-medium truncate">${user.name}</p>
          <p class="text-slate-400 text-xs truncate">${roleLabel}</p>
        </div>
        <button onclick="Auth.logout()" class="btn-icon text-slate-400 hover:text-red-400" title="Sair">
          ${icon('logout', 'w-4 h-4')}
        </button>
      </div>
    </div>`;
  };

  const getNavItems = (role) => {
    const all = {
      gestor: [
        { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { route: 'demands', label: 'Demandas', icon: 'demands' },
        { route: 'calendar', label: 'Calendário Editorial', icon: 'calendar' },
        { route: 'finished', label: 'Finalizados', icon: 'finished' }
      ],
      designer: [
        { route: 'my-demands', label: 'Minhas Tarefas', icon: 'demands' },
        { route: 'calendar', label: 'Calendário', icon: 'calendar' }
      ],
      videomaker: [
        { route: 'my-demands', label: 'Minhas Tarefas', icon: 'demands' },
        { route: 'calendar', label: 'Calendário', icon: 'calendar' }
      ],
      social_media: [
        { route: 'my-demands', label: 'Minhas Tarefas', icon: 'demands' },
        { route: 'calendar', label: 'Calendário Editorial', icon: 'calendar' },
        { route: 'posting', label: 'Calendário de Postagem', icon: 'posting' }
      ],
      pastor: [
        { route: 'overview', label: 'Visão Geral', icon: 'overview' },
        { route: 'approvals', label: 'Aprovações', icon: 'approvals' }
      ]
    };
    return all[role] || [];
  };

  /* ===== HEADER ===== */
  const renderHeader = (user, title) => {
    const overdue = Store.getDemands().filter(d => Dates.isOverdue(d.deliveryDate, d.status)).length;
    return `
    <div class="flex items-center justify-between h-16 px-6">
      <div>
        <h1 class="page-title text-lg">${title}</h1>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <button class="btn-icon relative" title="Notificações">
            ${icon('bell', 'w-5 h-5')}
            ${overdue > 0 ? `<span class="notif-dot"></span>` : ''}
          </button>
        </div>
        <div class="flex items-center gap-2 text-sm text-slate-600">
          ${renderAvatar(user, 'sm')}
          <span class="font-medium hidden sm:block">${user.name.split(' ')[0]}</span>
        </div>
      </div>
    </div>`;
  };

  /* ===== MODAL ===== */
  const openModal = (html, maxWidth = 'max-w-2xl') => {
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');
    container.className = `bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[92vh] overflow-y-auto relative`;
    container.innerHTML = html;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    document.body.style.overflow = '';
  };

  const modalHeader = (title, subtitle = '') => `
    <div class="flex items-start justify-between p-6 border-b border-slate-100">
      <div>
        <h2 class="text-lg font-bold text-slate-900">${title}</h2>
        ${subtitle ? `<p class="text-sm text-slate-500 mt-0.5">${subtitle}</p>` : ''}
      </div>
      <button onclick="Components.closeModal()" class="btn-icon ml-4 flex-shrink-0">
        ${icon('close', 'w-5 h-5')}
      </button>
    </div>`;

  /* ===== TOAST ===== */
  const toast = (message, type = 'info', duration = 3500) => {
    const container = document.getElementById('toast-container');
    const id = 'toast_' + Date.now();
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    const el = document.createElement('div');
    el.id = id;
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="font-bold">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = 'all 0.3s'; setTimeout(() => el.remove(), 300); }, duration);
  };

  /* ===== EMPTY STATE ===== */
  const emptyState = (message, sub = '') => `
    <div class="empty-state">
      <div class="text-5xl mb-4">📭</div>
      <p class="text-slate-600 font-semibold">${message}</p>
      ${sub ? `<p class="text-sm mt-1">${sub}</p>` : ''}
    </div>`;

  /* ===== SECTION HEADER ===== */
  const sectionHeader = (title, subtitle = '', actions = '') => `
    <div class="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="page-title">${title}</h1>
        ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
      </div>
      ${actions ? `<div class="flex items-center gap-2 flex-wrap">${actions}</div>` : ''}
    </div>`;

  /* ===== GUT DISPLAY ===== */
  const gutDisplay = (scores, priority) => {
    if (!scores) return '';
    const colors = { critical: '#fee2e2', high: '#ffedd5', medium: '#fef9c3', low: '#dcfce7' };
    const txtColors = { critical: '#b91c1c', high: '#c2410c', medium: '#92400e', low: '#15803d' };
    return `
    <div class="flex items-center gap-3">
      <div class="text-center">
        <div class="text-xs text-slate-500 mb-1">G</div>
        <div class="gut-score" style="background:#f1f5f9;color:#374151">${scores.g}</div>
      </div>
      <div class="text-slate-400 font-bold">×</div>
      <div class="text-center">
        <div class="text-xs text-slate-500 mb-1">U</div>
        <div class="gut-score" style="background:#f1f5f9;color:#374151">${scores.u}</div>
      </div>
      <div class="text-slate-400 font-bold">×</div>
      <div class="text-center">
        <div class="text-xs text-slate-500 mb-1">T</div>
        <div class="gut-score" style="background:#f1f5f9;color:#374151">${scores.t}</div>
      </div>
      <div class="text-slate-400 font-bold">=</div>
      <div class="text-center">
        <div class="text-xs text-slate-500 mb-1">Total</div>
        <div class="gut-score" style="background:${colors[priority]};color:${txtColors[priority]}">${scores.total}</div>
      </div>
    </div>`;
  };

  /* ===== MINI CALENDAR ===== */
  const renderCalendarGrid = (year, month, demands, onDayClick) => {
    const firstDay = Dates.getFirstDayOfMonth(year, month);
    const daysInMonth = Dates.getDaysInMonth(year, month);
    const today = new Date(); today.setHours(0,0,0,0);
    const todayStr = today.toISOString().split('T')[0];

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const demandsByDay = {};
    demands.forEach(d => {
      const key = d.postingDate;
      if (!key) return;
      const [y, m] = key.split('-').map(Number);
      if (y === year && m - 1 === month) {
        if (!demandsByDay[key]) demandsByDay[key] = [];
        demandsByDay[key].push(d);
      }
    });

    const statusColors = {
      backlog: '#94a3b8', assigned: '#3b82f6', in_progress: '#f59e0b',
      review: '#8b5cf6', approved: '#10b981', copy_pending: '#f97316',
      scheduled: '#06b6d4', published: '#22c55e'
    };

    let html = `
    <div class="cal-grid text-center mb-1">
      ${weekDays.map(d => `<div class="py-2 text-xs font-semibold text-slate-500">${d}</div>`).join('')}
    </div>
    <div class="cal-grid border-l border-t border-slate-100">`;

    for (let i = 0; i < firstDay; i++) {
      html += `<div class="cal-day other-month border-r border-b border-slate-100"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const dayDemands = demandsByDay[dateStr] || [];

      html += `
      <div class="cal-day border-r border-b border-slate-100 ${isToday ? 'today' : ''}" onclick="App.calDayClick('${dateStr}')">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs ${isToday ? 'bg-brand-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold' : 'text-slate-600 font-medium'}">${day}</span>
          ${dayDemands.length > 2 ? `<span class="text-xs text-slate-400">+${dayDemands.length - 2}</span>` : ''}
        </div>
        ${dayDemands.slice(0, 2).map(d => `
          <div class="cal-event" style="background:${statusColors[d.status]}20;color:${statusColors[d.status]};border-left:2px solid ${statusColors[d.status]};"
               onclick="event.stopPropagation();App.openDemandDetail('${d.id}')" title="${d.title}">
            ${d.title}
          </div>
        `).join('')}
      </div>`;
    }
    html += '</div>';
    return html;
  };

  return {
    icon, platformIcon, TYPE_LABELS, PLATFORM_LABELS, STATUS_LABELS,
    renderAvatar, statusBadge, priorityBadge, platformBadge,
    demandCard, renderSidebar, renderHeader, getNavItems,
    openModal, closeModal, modalHeader,
    toast, emptyState, sectionHeader, gutDisplay, renderCalendarGrid
  };
})();

/* =========================================================
   STORE — Data layer with localStorage persistence
   ========================================================= */
const Store = (() => {

  const KEYS = {
    users: 'mvrtd_users',
    demands: 'mvrtd_demands',
    schedules: 'mvrtd_schedules',
    session: 'mvrtd_session',
    drive_config: 'mvrtd_drive'
  };

  /* ---------- helpers ---------- */
  const uid = () => 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  const now = () => new Date().toISOString();
  const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  /* ========== INIT ========== */
  // Production mode — no demo data seeded.

  /* ========== USERS ========== */
  const getUsers = () => load(KEYS.users, []);
  const getUserById = (id) => getUsers().find(u => u.id === id);
  const getUserByEmail = (email) => getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  const getUsersByRole = (role) => getUsers().filter(u => u.role === role);

  const createUser = (data) => {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('E-mail já cadastrado.');
    }
    const user = { id: uid(), createdAt: now(), ...data };
    users.push(user);
    save(KEYS.users, users);
    return user;
  };

  /* ========== SESSION ========== */
  const getSession = () => load(KEYS.session, null);
  const setSession = (user) => save(KEYS.session, user);
  const clearSession = () => localStorage.removeItem(KEYS.session);

  /* ========== DEMANDS ========== */
  const getDemands = () => load(KEYS.demands, []);

  const getDemandById = (id) => getDemands().find(d => d.id === id);

  const getDemandsByUser = (userId) => getDemands().filter(d => d.assignedTo === userId);

  const getActiveDemandsByUser = (userId) =>
    getDemandsByUser(userId).filter(d => !['published', 'scheduled'].includes(d.status));

  const getPublishedDemands = () => getDemands().filter(d => ['published', 'scheduled'].includes(d.status));

  const createDemand = (data) => {
    const demands = getDemands();
    const demand = { id: uid(), createdAt: now(), updatedAt: now(), history: [], attachments: [], ...data };
    demand.history.push({ action: 'created', user: data.createdByName || 'Sistema', date: now(), note: 'Demanda criada' });
    demands.push(demand);
    save(KEYS.demands, demands);
    return demand;
  };

  const updateDemand = (id, updates) => {
    const demands = getDemands();
    const idx = demands.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Demanda não encontrada.');
    demands[idx] = { ...demands[idx], ...updates, updatedAt: now() };
    save(KEYS.demands, demands);
    return demands[idx];
  };

  const deleteDemand = (id) => {
    const demands = getDemands().filter(d => d.id !== id);
    save(KEYS.demands, demands);
  };

  const addDemandHistory = (id, entry) => {
    const demand = getDemandById(id);
    if (!demand) return;
    demand.history = demand.history || [];
    demand.history.push({ ...entry, date: now() });
    updateDemand(id, { history: demand.history });
  };

  /* ========== STATISTICS ========== */
  const getStats = () => {
    const demands = getDemands();
    const total = demands.length;
    const byStatus = {};
    demands.forEach(d => { byStatus[d.status] = (byStatus[d.status] || 0) + 1; });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = demands.filter(d => {
      if (['published', 'scheduled'].includes(d.status)) return false;
      const del = new Date(d.deliveryDate);
      del.setHours(0, 0, 0, 0);
      return del < today;
    }).length;

    const inProgress = (byStatus['in_progress'] || 0) + (byStatus['assigned'] || 0);
    const review = byStatus['review'] || 0;
    const done = (byStatus['published'] || 0) + (byStatus['scheduled'] || 0);

    const users = getUsers().filter(u => ['designer', 'videomaker'].includes(u.role));
    const workload = users.map(u => ({
      name: u.name, role: u.role, color: u.color,
      active: getActiveDemandsByUser(u.id).length,
      total: getDemandsByUser(u.id).length
    }));

    const monthly = {};
    demands.forEach(d => {
      const month = (d.postingDate || d.createdAt.split('T')[0]).slice(0, 7);
      monthly[month] = (monthly[month] || 0) + 1;
    });

    return { total, byStatus, overdue, inProgress, review, done, workload, monthly };
  };

  /* ========== DRIVE CONFIG ========== */
  const getDriveConfig = () => load(KEYS.drive_config, null);
  const setDriveConfig = (cfg) => save(KEYS.drive_config, cfg);

  /* ========== INIT ========== */

  return {
    uid, now,
    getUsers, getUserById, getUserByEmail, getUsersByRole, createUser,
    getSession, setSession, clearSession,
    getDemands, getDemandById, getDemandsByUser, getActiveDemandsByUser,
    getPublishedDemands, createDemand, updateDemand, deleteDemand, addDemandHistory,
    getStats,
    getDriveConfig, setDriveConfig
  };
})();

/* =========================================================
   GUT MATRIX — Priority scoring
   G × U × T = Priority Score (max 125)
   ========================================================= */
const GUT = (() => {

  /* Gravidade (Severity) based on content type */
  const gravityByType = {
    video: 5, reels: 4, carousel: 4, post_static: 3, arte: 3, story: 2
  };

  /* Platform modifier */
  const platformMod = {
    youtube: 1, instagram: 0, tiktok: 0, facebook: -1, whatsapp: -1
  };

  /* Urgência (Urgency) based on days until posting */
  const calcUrgency = (postingDate) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const post  = new Date(postingDate); post.setHours(0,0,0,0);
    const days  = Math.round((post - today) / 86400000);
    if (days <= 1)  return 5;
    if (days <= 3)  return 4;
    if (days <= 7)  return 3;
    if (days <= 14) return 2;
    return 1;
  };

  /* Tendência (Trend) — how bad does delay get */
  const calcTrend = (isEvent, postingDate) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const post  = new Date(postingDate); post.setHours(0,0,0,0);
    const days  = Math.round((post - today) / 86400000);
    if (isEvent) return 5;
    if (days <= 5) return 4;
    if (days <= 10) return 3;
    return 2;
  };

  const calculate = (type, platform, postingDate, isEvent, overrides = {}) => {
    let g = overrides.g !== undefined ? overrides.g
          : Math.min(5, Math.max(1, (gravityByType[type] || 3) + (platformMod[platform] || 0) + (isEvent ? 1 : 0)));
    let u = overrides.u !== undefined ? overrides.u : calcUrgency(postingDate);
    let t = overrides.t !== undefined ? overrides.t : calcTrend(isEvent, postingDate);

    g = Math.min(5, Math.max(1, g));
    u = Math.min(5, Math.max(1, u));
    t = Math.min(5, Math.max(1, t));

    return { g, u, t, total: g * u * t };
  };

  const getPriority = (total) => {
    if (total >= 75) return 'critical';
    if (total >= 40) return 'high';
    if (total >= 15) return 'medium';
    return 'low';
  };

  const getPriorityLabel = (priority) => ({
    critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo'
  })[priority] || priority;

  const getPriorityColor = (priority) => ({
    critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e'
  })[priority] || '#64748b';

  return { calculate, getPriority, getPriorityLabel, getPriorityColor };
})();

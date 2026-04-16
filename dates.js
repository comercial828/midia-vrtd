/* =========================================================
   DATES — Delivery date calculator & formatting utilities
   ========================================================= */
const Dates = (() => {

  /* Days before posting to deliver content */
  const deliveryLeadDays = {
    post_static: 1,
    carousel: 2,
    reels: 3,
    story: 1,
    video: 5,
    arte: 2
  };

  /* Complexity definitions */
  const complexityByType = {
    post_static: 'simples',
    story: 'simples',
    arte: 'simples',
    carousel: 'media',
    reels: 'media',
    video: 'complexa'
  };

  const calcDeliveryDate = (postingDate, type) => {
    const post = new Date(postingDate);
    post.setHours(0, 0, 0, 0);
    const lead = deliveryLeadDays[type] || 2;
    post.setDate(post.getDate() - lead);
    // skip weekends for delivery (push back)
    while (post.getDay() === 0) post.setDate(post.getDate() - 1);
    while (post.getDay() === 6) post.setDate(post.getDate() - 1);
    return post.toISOString().split('T')[0];
  };

  const calcReviewDate = (deliveryDate) => {
    const d = new Date(deliveryDate);
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const daysUntil = (dateStr) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(dateStr); target.setHours(0,0,0,0);
    return Math.round((target - today) / 86400000);
  };

  const isOverdue = (dateStr, status) => {
    if (['published', 'scheduled'].includes(status)) return false;
    return daysUntil(dateStr) < 0;
  };

  const format = (dateStr, opts = {}) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', ...opts });
  };

  const formatShort = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatRelative = (dateStr) => {
    const days = daysUntil(dateStr);
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Amanhã';
    if (days === -1) return 'Ontem';
    if (days < 0) return `${Math.abs(days)} dias atrás`;
    if (days <= 7) return `Em ${days} dias`;
    return format(dateStr);
  };

  const getMonthName = (monthNum) => [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ][monthNum];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const todayStr = () => new Date().toISOString().split('T')[0];

  const getComplexity = (type) => complexityByType[type] || 'media';

  return {
    calcDeliveryDate, calcReviewDate, daysUntil, isOverdue,
    format, formatShort, formatRelative,
    getMonthName, getDaysInMonth, getFirstDayOfMonth, todayStr, getComplexity
  };
})();

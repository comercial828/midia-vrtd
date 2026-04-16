/* =========================================================
   DISTRIBUTION — Smart task assignment & workload balancing
   ========================================================= */
const Distribution = (() => {

  /* Which roles handle which demand types */
  const typeToRole = {
    post_static: 'designer',
    carousel: 'designer',
    arte: 'designer',
    story: 'designer',
    reels: 'videomaker',
    video: 'videomaker'
  };

  const getResponsibleRole = (type) => typeToRole[type] || 'designer';

  /* Find best assignee: least active workload, then FIFO fairness */
  const assignDemand = (demandType) => {
    const role = getResponsibleRole(demandType);
    const members = Store.getUsersByRole(role);
    if (!members.length) return null;

    const workloads = members.map(m => ({
      user: m,
      active: Store.getActiveDemandsByUser(m.id).length
    }));

    // Sort: least active first, then by name (deterministic)
    workloads.sort((a, b) => a.active - b.active || a.user.name.localeCompare(b.user.name));
    return workloads[0].user;
  };

  /* Generate a daily schedule for a user (their demands sorted by priority) */
  const getDailySchedule = (userId) => {
    const demands = Store.getActiveDemandsByUser(userId);
    return demands
      .filter(d => !['backlog', 'published'].includes(d.status))
      .sort((a, b) => {
        // Sort by delivery date then GUT score desc
        const dateA = new Date(a.deliveryDate), dateB = new Date(b.deliveryDate);
        if (dateA - dateB !== 0) return dateA - dateB;
        return (b.gutScores?.total || 0) - (a.gutScores?.total || 0);
      });
  };

  /* Weekly schedule: demands due this week */
  const getWeeklySchedule = (userId) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const endOfWeek = new Date(today); endOfWeek.setDate(today.getDate() + 7);
    return Store.getActiveDemandsByUser(userId).filter(d => {
      const del = new Date(d.deliveryDate); del.setHours(0,0,0,0);
      return del >= today && del <= endOfWeek;
    }).sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  };

  /* Monthly schedule: demands this month grouped by day */
  const getMonthlySchedule = (userId, year, month) => {
    const grouped = {};
    Store.getDemandsByUser(userId).forEach(d => {
      const date = d.deliveryDate || d.postingDate;
      if (!date) return;
      const [y, m] = date.split('-').map(Number);
      if (y === year && m - 1 === month) {
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(d);
      }
    });
    return grouped;
  };

  /* Team workload summary */
  const getTeamWorkload = () => {
    const users = Store.getUsers().filter(u => ['designer', 'videomaker', 'social_media'].includes(u.role));
    return users.map(u => {
      const active = Store.getActiveDemandsByUser(u.id);
      const overdue = active.filter(d => Dates.isOverdue(d.deliveryDate, d.status));
      return {
        user: u,
        active: active.length,
        overdue: overdue.length,
        score: active.length * 10 + overdue.length * 20
      };
    }).sort((a, b) => b.active - a.active);
  };

  return { getResponsibleRole, assignDemand, getDailySchedule, getWeeklySchedule, getMonthlySchedule, getTeamWorkload };
})();

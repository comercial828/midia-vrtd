/* =========================================================
   CHARTS — Chart.js wrappers
   ========================================================= */
const Charts = (() => {

  const instances = {};

  const destroy = (id) => {
    if (instances[id]) { instances[id].destroy(); delete instances[id]; }
  };

  const defaultFont = { family: 'Inter', size: 12 };

  /* ===== STATUS DONUT ===== */
  const renderStatusChart = (canvasId, byStatus) => {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const statusColors = {
      backlog: '#94a3b8', assigned: '#3b82f6', in_progress: '#f59e0b',
      review: '#8b5cf6', approved: '#10b981', copy_pending: '#f97316',
      scheduled: '#06b6d4', published: '#22c55e'
    };
    const labels = Object.keys(byStatus).map(s => Components.STATUS_LABELS[s] || s);
    const data = Object.values(byStatus);
    const colors = Object.keys(byStatus).map(s => statusColors[s] || '#94a3b8');

    instances[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'right', labels: { font: defaultFont, padding: 12, boxWidth: 12, boxHeight: 12, borderRadius: 4, usePointStyle: true, pointStyle: 'rectRounded' } },
          tooltip: { bodyFont: defaultFont, titleFont: { ...defaultFont, weight: '600' } }
        }
      }
    });
  };

  /* ===== MONTHLY BAR ===== */
  const renderMonthlyChart = (canvasId, monthly) => {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const sorted = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    const labels = sorted.map(([k]) => {
      const [y, m] = k.split('-');
      return Dates.getMonthName(parseInt(m) - 1).slice(0, 3) + '/' + y.slice(2);
    });
    const data = sorted.map(([, v]) => v);

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Conteúdos', data,
          backgroundColor: 'rgba(99,102,241,0.8)', borderRadius: 8,
          borderSkipped: false, hoverBackgroundColor: '#4f46e5'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { bodyFont: defaultFont, titleFont: { ...defaultFont, weight: '600' } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultFont, color: '#64748b' }, border: { display: false } },
          y: { grid: { color: '#f1f5f9' }, ticks: { font: defaultFont, color: '#64748b', stepSize: 1 }, border: { display: false } }
        }
      }
    });
  };

  /* ===== WORKLOAD HORIZONTAL BAR ===== */
  const renderWorkloadChart = (canvasId, workload) => {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const labels = workload.map(w => w.name.split(' ')[0]);
    const data = workload.map(w => w.active);
    const colors = workload.map(w => w.color || '#6366f1');

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Tarefas Ativas', data,
          backgroundColor: colors.map(c => c + '99'),
          borderColor: colors,
          borderWidth: 2, borderRadius: 8, borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { bodyFont: defaultFont, titleFont: { ...defaultFont, weight: '600' } } },
        scales: {
          x: { grid: { color: '#f1f5f9' }, ticks: { font: defaultFont, color: '#64748b', stepSize: 1 }, border: { display: false } },
          y: { grid: { display: false }, ticks: { font: defaultFont, color: '#374151' }, border: { display: false } }
        }
      }
    });
  };

  /* ===== PRIORITY PIE ===== */
  const renderPriorityChart = (canvasId, demands) => {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    demands.forEach(d => { if (counts[d.priority] !== undefined) counts[d.priority]++; });

    const colors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
    const labels = { critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' };

    const activeKeys = Object.keys(counts).filter(k => counts[k] > 0);
    if (!activeKeys.length) return;

    instances[canvasId] = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: activeKeys.map(k => labels[k]),
        datasets: [{ data: activeKeys.map(k => counts[k]), backgroundColor: activeKeys.map(k => colors[k]), borderWidth: 0, hoverOffset: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: defaultFont, padding: 10, boxWidth: 10, usePointStyle: true } } }
      }
    });
  };

  return { renderStatusChart, renderMonthlyChart, renderWorkloadChart, renderPriorityChart, destroy };
})();

/* =========================================================
   VIDEOMAKER PAGE — mirrors Designer with video-specific labels
   ========================================================= */
const VideomakerPage = (() => {
  let calYear, calMonth;

  const renderMyDemands = (user) => DesignerPage.renderMyDemands(user);

  const renderCalendar = (user) => {
    const now = new Date();
    if (!calYear) calYear = now.getFullYear();
    if (calMonth === undefined || calMonth === null) calMonth = now.getMonth();

    const demands = Store.getDemandsByUser(user.id);
    const content = `
    <div class="p-6 max-w-5xl mx-auto">
      ${Components.sectionHeader('Meu Calendário', 'Suas produções organizadas por data.')}
      <div class="card p-5">
        <div class="flex items-center justify-between mb-5">
          <button onclick="VideomakerPage.calNav(-1)" class="btn btn-secondary btn-sm">← Anterior</button>
          <h2 class="font-bold text-slate-800">${Dates.getMonthName(calMonth)} ${calYear}</h2>
          <button onclick="VideomakerPage.calNav(1)" class="btn btn-secondary btn-sm">Próximo →</button>
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

  return { renderMyDemands, renderCalendar, calNav };
})();

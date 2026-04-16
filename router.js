/* =========================================================
   ROUTER — Hash-based SPA routing
   ========================================================= */
const Router = (() => {

  const routes = {};

  const register = (path, handler) => { routes[path] = handler; };

  const navigate = (path) => {
    window.location.hash = path;
  };

  const getCurrentRoute = () => {
    const hash = window.location.hash.replace('#', '') || 'default';
    return hash;
  };

  const dispatch = (path) => {
    const handler = routes[path] || routes['default'];
    if (handler) handler(path);
  };

  const init = () => {
    window.addEventListener('hashchange', () => {
      dispatch(getCurrentRoute());
    });
    dispatch(getCurrentRoute());
  };

  return { register, navigate, getCurrentRoute, dispatch, init };
})();

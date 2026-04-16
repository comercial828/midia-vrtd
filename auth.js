/* =========================================================
   AUTH — Login, register, session management
   ========================================================= */
const Auth = (() => {

  const ROLE_LABELS = {
    gestor: 'Gestor de Marketing',
    designer: 'Designer',
    social_media: 'Social Media',
    videomaker: 'Videomaker',
    pastor: 'Líder/Pastor'
  };

  const ROLE_COLORS = {
    gestor: '#6366f1',
    designer: '#10b981',
    social_media: '#ec4899',
    videomaker: '#3b82f6',
    pastor: '#8b5cf6'
  };

  const getInitials = (name) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const login = (email, password) => {
    const user = Store.getUserByEmail(email);
    if (!user) throw new Error('E-mail não encontrado.');
    if (user.password !== password) throw new Error('Senha incorreta.');
    Store.setSession(user);
    return user;
  };

  const register = (data) => {
    const { name, email, confirmEmail, role, password, confirmPassword } = data;

    if (!name || name.trim().length < 3) throw new Error('Nome deve ter ao menos 3 caracteres.');
    if (!email || !email.includes('@') || !email.includes('.')) throw new Error('E-mail inválido.');
    if (email.toLowerCase() !== confirmEmail.toLowerCase()) throw new Error('Os e-mails não coincidem.');
    if (!role) throw new Error('Selecione uma função.');
    if (!password || password.length < 6) throw new Error('Senha deve ter ao menos 6 caracteres.');
    if (password !== confirmPassword) throw new Error('As senhas não coincidem.');

    const user = Store.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      password,
      avatar: getInitials(name),
      color: ROLE_COLORS[role] || '#6366f1'
    });
    Store.setSession(user);
    return user;
  };

  const logout = () => {
    Store.clearSession();
    App.init();
  };

  const currentUser = () => Store.getSession();

  const isLoggedIn = () => !!Store.getSession();

  const can = (user, action) => {
    const perms = {
      gestor: ['create_demand', 'edit_demand', 'delete_demand', 'approve', 'view_all', 'view_dashboard', 'view_finished'],
      designer: ['update_status', 'upload_file', 'view_own'],
      videomaker: ['update_status', 'upload_file', 'view_own'],
      social_media: ['update_status', 'edit_copy', 'view_own', 'view_posting_calendar'],
      pastor: ['approve', 'view_all']
    };
    return (perms[user.role] || []).includes(action);
  };

  return { login, register, logout, currentUser, isLoggedIn, can, ROLE_LABELS, ROLE_COLORS, getInitials };
})();

/* =========================================================
   LOGIN PAGE — Login and Register forms
   ========================================================= */
const LoginPage = (() => {

  let activeTab = Store.getUsers().length === 0 ? 'register' : 'login';

  const render = () => {
    // If no users yet, force register tab so first member can sign up
    if (Store.getUsers().length === 0) activeTab = 'register';
    const container = document.getElementById('auth-container');
    container.innerHTML = `
    <div class="auth-page">
      <!-- Background pattern -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div class="auth-card relative z-10">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-brand-500 to-violet-600 rounded-2xl mb-4 shadow-lg">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">MÍDIA VRTD</h1>
          <p class="text-slate-500 text-sm mt-1">Plataforma de Gestão da Agência</p>
        </div>

        <!-- Tabs -->
        <div class="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button id="tab-login" onclick="LoginPage.setTab('login')" class="tab-btn flex-1 ${activeTab === 'login' ? 'active' : ''}">
            Entrar
          </button>
          <button id="tab-register" onclick="LoginPage.setTab('register')" class="tab-btn flex-1 ${activeTab === 'register' ? 'active' : ''}">
            Criar Conta
          </button>
        </div>

        <!-- Forms -->
        <div id="login-form-container" class="${activeTab !== 'login' ? 'hidden' : ''}">
          ${renderLoginForm()}
        </div>
        <div id="register-form-container" class="${activeTab !== 'register' ? 'hidden' : ''}">
          ${renderRegisterForm()}
        </div>

        <!-- First-use welcome message (only shown when no users exist) -->
        ${Store.getUsers().length === 0 ? `
        <div class="mt-4 p-3 bg-brand-50 rounded-xl border border-brand-100">
          <p class="text-xs text-brand-700 font-semibold">👋 Bem-vindo à MÍDIA VRTD!</p>
          <p class="text-xs text-brand-600 mt-1">Crie a primeira conta da equipe para começar. O Gestor de Marketing deve cadastrar-se primeiro.</p>
        </div>` : ''}
      </div>
    </div>`;
  };

  const renderLoginForm = () => `
    <form onsubmit="LoginPage.handleLogin(event)" class="space-y-4">
      <div class="form-group">
        <label class="form-label">E-mail</label>
        <input type="email" id="login-email" class="form-input" placeholder="seu@email.com" required autocomplete="email">
      </div>
      <div class="form-group">
        <label class="form-label">Senha</label>
        <input type="password" id="login-password" class="form-input" placeholder="••••••••" required autocomplete="current-password">
        <div id="login-error" class="form-error hidden"></div>
      </div>
      <button type="submit" id="login-btn" class="btn btn-primary w-full justify-center mt-2">
        Entrar na Plataforma
      </button>
    </form>`;

  const renderRegisterForm = () => `
    <form onsubmit="LoginPage.handleRegister(event)" class="space-y-3">
      <div class="form-group">
        <label class="form-label">Nome Completo</label>
        <input type="text" id="reg-name" class="form-input" placeholder="Seu nome completo" required>
      </div>
      <div class="form-group">
        <label class="form-label">E-mail</label>
        <input type="email" id="reg-email" class="form-input" placeholder="seu@email.com" required>
      </div>
      <div class="form-group">
        <label class="form-label">Confirmar E-mail</label>
        <input type="email" id="reg-confirm-email" class="form-input" placeholder="confirme seu@email.com" required>
      </div>
      <div class="form-group">
        <label class="form-label">Função / Cargo</label>
        <select id="reg-role" class="form-input" required>
          <option value="">Selecione sua função…</option>
          <option value="gestor">Gestor de Marketing</option>
          <option value="designer">Designer</option>
          <option value="social_media">Social Media</option>
          <option value="videomaker">Videomaker</option>
          <option value="pastor">Líder/Pastor</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Senha</label>
        <input type="password" id="reg-password" class="form-input" placeholder="Mínimo 6 caracteres" required>
      </div>
      <div class="form-group">
        <label class="form-label">Confirmar Senha</label>
        <input type="password" id="reg-confirm-password" class="form-input" placeholder="Repita a senha" required>
        <div id="reg-error" class="form-error hidden"></div>
      </div>
      <button type="submit" id="reg-btn" class="btn btn-primary w-full justify-center mt-2">
        Criar Conta
      </button>
    </form>`;

  const setTab = (tab) => {
    activeTab = tab;
    render();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    errEl.classList.add('hidden');
    btn.innerHTML = '<div class="spinner"></div>';
    btn.disabled = true;

    setTimeout(() => {
      try {
        Auth.login(email, password);
        App.init();
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
        btn.innerHTML = 'Entrar na Plataforma';
        btn.disabled = false;
      }
    }, 400);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const errEl = document.getElementById('reg-error');
    const btn = document.getElementById('reg-btn');

    errEl.classList.add('hidden');
    btn.innerHTML = '<div class="spinner"></div>';
    btn.disabled = true;

    const data = {
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      confirmEmail: document.getElementById('reg-confirm-email').value,
      role: document.getElementById('reg-role').value,
      password: document.getElementById('reg-password').value,
      confirmPassword: document.getElementById('reg-confirm-password').value
    };

    setTimeout(() => {
      try {
        Auth.register(data);
        App.init();
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
        btn.innerHTML = 'Criar Conta';
        btn.disabled = false;
      }
    }, 400);
  };

  return { render, setTab, handleLogin, handleRegister };
})();

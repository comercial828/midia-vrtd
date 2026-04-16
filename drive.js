/* =========================================================
   DRIVE — Google Drive API Integration
   Configure CLIENT_ID and API_KEY from Google Cloud Console
   ========================================================= */
const Drive = (() => {

  let gapiLoaded = false;
  let gisLoaded = false;
  let tokenClient = null;
  let accessToken = null;

  const SCOPES = 'https://www.googleapis.com/auth/drive.file';
  const FOLDER_COLOR = '#6366f1';

  /* --- Load GAPI & GIS (called from app init if configured) --- */
  const init = (clientId, apiKey) => {
    if (!clientId || !apiKey) return;
    Store.setDriveConfig({ clientId, apiKey });

    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({ apiKey, discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'] });
        gapiLoaded = true;
      });
    };
    document.head.appendChild(gapiScript);

    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId, scope: SCOPES,
        callback: (resp) => { if (!resp.error) accessToken = resp.access_token; }
      });
      gisLoaded = true;
    };
    document.head.appendChild(gisScript);
  };

  /* --- Request access token --- */
  const authorize = () => new Promise((resolve, reject) => {
    if (!gisLoaded || !tokenClient) { reject(new Error('Drive não configurado.')); return; }
    tokenClient.callback = (resp) => {
      if (resp.error) reject(new Error(resp.error));
      else { accessToken = resp.access_token; resolve(accessToken); }
    };
    if (accessToken) resolve(accessToken);
    else tokenClient.requestAccessToken({ prompt: 'consent' });
  });

  /* --- Find or create folder by name under parent --- */
  const ensureFolder = async (folderName, parentId = 'root') => {
    const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
    const res = await window.gapi.client.drive.files.list({ q: query, fields: 'files(id,name)', spaces: 'drive' });
    if (res.result.files.length > 0) return res.result.files[0].id;

    const createRes = await window.gapi.client.drive.files.create({
      resource: { name: folderName, mimeType: 'application/vnd.google-apps.folder', parents: [parentId], folderColorRgb: FOLDER_COLOR },
      fields: 'id'
    });
    return createRes.result.id;
  };

  /* --- Upload file to responsible's folder --- */
  const uploadFile = async (file, demandTitle, responsibleName) => {
    if (!accessToken) await authorize();
    if (!window.gapi?.client?.drive) throw new Error('GAPI não inicializado. Configure a integração com Drive nas configurações.');

    // Folder structure: MÍDIA VRTD / [ResponsibleName] / [file]
    const rootFolderId = await ensureFolder('MÍDIA VRTD');
    const userFolderId = await ensureFolder(responsibleName, rootFolderId);

    const metadata = { name: `${demandTitle} — ${file.name}`, parents: [userFolderId] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form
    });

    if (!uploadRes.ok) throw new Error('Falha no upload para o Drive.');
    const result = await uploadRes.json();
    return { id: result.id, name: result.name, url: result.webViewLink };
  };

  /* --- Get shareable link --- */
  const getFileUrl = (fileId) => `https://drive.google.com/file/d/${fileId}/view`;

  /* --- Setup modal for Drive config --- */
  const showSetupModal = () => {
    const cfg = Store.getDriveConfig() || {};
    Components.openModal(`
      ${Components.modalHeader('Integração Google Drive', 'Configure as credenciais do Google Cloud Console')}
      <div class="p-6 space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p class="font-semibold mb-1">Como configurar:</p>
          <ol class="list-decimal list-inside space-y-1 text-xs">
            <li>Acesse o Google Cloud Console</li>
            <li>Crie um projeto e ative a Drive API</li>
            <li>Crie credenciais OAuth 2.0 (Aplicativo da Web)</li>
            <li>Adicione o domínio atual como origem autorizada</li>
            <li>Cole o Client ID e API Key abaixo</li>
          </ol>
        </div>
        <div class="form-group">
          <label class="form-label">Client ID</label>
          <input id="drive-client-id" class="form-input" placeholder="xxxx.apps.googleusercontent.com" value="${cfg.clientId || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">API Key</label>
          <input id="drive-api-key" class="form-input" placeholder="AIzaSy..." value="${cfg.apiKey || ''}">
        </div>
        <div class="flex gap-3 pt-2">
          <button onclick="Components.closeModal()" class="btn btn-secondary flex-1">Cancelar</button>
          <button onclick="Drive.saveConfig()" class="btn btn-primary flex-1">Salvar e Conectar</button>
        </div>
      </div>`);
  };

  const saveConfig = () => {
    const clientId = document.getElementById('drive-client-id')?.value?.trim();
    const apiKey = document.getElementById('drive-api-key')?.value?.trim();
    if (!clientId || !apiKey) { Components.toast('Preencha todos os campos.', 'error'); return; }
    init(clientId, apiKey);
    Components.closeModal();
    Components.toast('Drive configurado! Autorizando acesso…', 'success');
    setTimeout(() => authorize().then(() => Components.toast('Google Drive conectado com sucesso!', 'success')).catch(e => Components.toast(e.message, 'error')), 1500);
  };

  /* --- Mock upload for demo (when Drive not configured) --- */
  const mockUpload = (file, demandTitle) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ id: 'mock_' + Date.now(), name: file.name, url: '#demo' });
      }, 1200);
    });
  };

  const isConfigured = () => !!Store.getDriveConfig();

  return { init, authorize, uploadFile, mockUpload, getFileUrl, showSetupModal, saveConfig, isConfigured };
})();

const API = {
  async getConfig() { return (await fetch('/api/config')).json(); },
  async saveConfig(raw) {
    const r = await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ raw }) });
    return r.json();
  },
  async getPlugins() { return (await fetch('/api/plugins')).json(); },
  async savePlugin(name, content) {
    const r = await fetch('/api/plugins/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, content }) });
    return r.json();
  },
  async createPlugin(name) {
    const r = await fetch('/api/plugins/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    return r.json();
  },
  async reload() { return (await fetch('/api/reload', { method: 'POST' })).json(); },
  async start() { return (await fetch('/api/start', { method: 'POST' })).json(); },
  async getStatus() { return (await fetch('/api/status')).json(); },
  async getCatalog() { return (await fetch('/api/plugins/catalog')).json(); },
  async installPlugin(name) { return (await fetch('/api/plugins/install', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })).json(); },
  async resetDefaults() { return (await fetch('/api/plugins/reset-defaults', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })).json(); },
  async getThemes() { return (await fetch('/api/themes')).json(); },
  async installTheme(url) { return (await fetch('/api/themes/install', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })).json(); },
  async updateBar(data) {
    const r = await fetch('/api/bar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return r.json();
  }
};

let state = { configRaw: '', items: [], plugins: [] };

// --- NAV ---
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// --- STATUS ---
async function checkStatus() {
  const s = await API.getStatus();
  const badge = document.getElementById('status-badge');
  if (s.running) {
    badge.textContent = '● activo';
    badge.className = 'badge running';
  } else {
    badge.textContent = '● detenido';
    badge.className = 'badge stopped';
  }
}
checkStatus();
setInterval(checkStatus, 5000);

// --- TOAST ---
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  setTimeout(() => el.classList.add('hidden'), 3000);
}

// --- BAR TAB ---
function hexToSketchybar(hex) {
  const c = hex.replace('#', '');
  return `0x40${c}`;
}
function sketchybarToHex(sk) {
  const h = sk.replace('0x40', '0x40').replace('0x', '');
  if (h.length === 8) return '#' + h.slice(2);
  if (h.length === 6) return '#' + h;
  return '#000000';
}

async function loadBarConfig() {
  const data = await API.getConfig();
  state.configRaw = data.raw;
  const barMatch = data.raw.match(/sketchybar --bar (.+)/);
  if (!barMatch) return;

  const props = barMatch[1];
  const pos = props.match(/position=(\S+)/);
  const height = props.match(/height=(\d+)/);
  const blur = props.match(/blur_radius=(\d+)/);
  const color = props.match(/color=(0x[0-9a-fA-F]+)/);

  if (pos) document.getElementById('bar-position').value = pos[1];
  if (height) document.getElementById('bar-height').value = parseInt(height[1]);
  if (blur) {
    document.getElementById('bar-blur').value = parseInt(blur[1]);
    document.getElementById('bar-blur-value').textContent = blur[1];
  }
  if (color) {
    document.getElementById('bar-color').value = color[1];
    document.getElementById('bar-color-picker').value = sketchybarToHex(color[1]);
  }
  updatePreview();
}

document.getElementById('bar-position').addEventListener('change', updatePreview);
document.getElementById('bar-height').addEventListener('input', updatePreview);
document.getElementById('bar-blur').addEventListener('input', (e) => {
  document.getElementById('bar-blur-value').textContent = e.target.value;
  updatePreview();
});
document.getElementById('bar-color-picker').addEventListener('input', (e) => {
  document.getElementById('bar-color').value = hexToSketchybar(e.target.value);
  updatePreview();
});
document.getElementById('bar-color').addEventListener('input', (e) => {
  const v = e.target.value;
  if (v.startsWith('0x')) {
    document.getElementById('bar-color-picker').value = sketchybarToHex(v);
  }
  updatePreview();
});

function updatePreview() {
  const preview = document.getElementById('bar-preview');
  const h = document.getElementById('bar-height').value;
  const blur = document.getElementById('bar-blur').value;
  const color = document.getElementById('bar-color').value;
  preview.style.height = h + 'px';

  const alpha = parseInt(color.slice(2, 4), 16) || 64;
  const r = parseInt(color.slice(4, 6), 16);
  const g = parseInt(color.slice(6, 8), 16);
  const b = parseInt(color.slice(8, 10), 16);
  preview.style.background = `rgba(${r},${g},${b},${alpha/255})`;
  preview.style.backdropFilter = `blur(${blur}px)`;
  preview.style.webkitBackdropFilter = `blur(${blur}px)`;

  const pos = document.getElementById('bar-position').value;
  preview.style.borderRadius = pos === 'top' ? '0 0 var(--radius) var(--radius)' : 'var(--radius) var(--radius) 0 0';
}

document.getElementById('btn-save-bar').addEventListener('click', async () => {
  const data = {
    position: document.getElementById('bar-position').value,
    height: parseInt(document.getElementById('bar-height').value),
    blurRadius: parseInt(document.getElementById('bar-blur').value),
    color: document.getElementById('bar-color').value,
  };
  const r = await API.updateBar(data);
  if (!r.success) toast(r.error || 'Error al guardar barra', 'error');
});

// --- ITEMS TAB ---
// --- PLUGINS TAB ---
async function loadPlugins() {
  const data = await API.getPlugins();
  state.plugins = data.plugins;
  const container = document.getElementById('plugins-list');
  container.innerHTML = '';

  data.plugins.forEach(p => {
    const card = document.createElement('div');
    card.className = 'plugin-card';

    const header = document.createElement('div');
    header.className = 'plugin-header';
    header.innerHTML = `<span class="plugin-name">${p.name}</span>`;
    header.style.cursor = 'pointer';

    const actions = document.createElement('div');
    actions.className = 'plugin-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-danger';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm(`¿Eliminar ${p.name}?`)) return;
      // Can't delete via API yet, just show message
      toast('Usá el Finder para eliminar plugins', 'error');
    });
    actions.appendChild(deleteBtn);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-sm btn-primary';
    saveBtn.textContent = 'Guardar';
    saveBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ta = card.querySelector('textarea');
      const r = await API.savePlugin(p.name, ta.value);
      if (r.success) {
        toast(`Plugin ${p.name} guardado`);
        await API.reload();
      } else {
        toast(r.error || 'Error al guardar', 'error');
      }
    });
    actions.appendChild(saveBtn);

    header.appendChild(actions);
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'plugin-body';

    const ta = document.createElement('textarea');
    ta.value = p.content;
    body.appendChild(ta);

    header.addEventListener('click', () => {
      body.classList.toggle('open');
      if (body.classList.contains('open')) {
        // delay resize to ensure visible
        setTimeout(() => ta.style.height = ta.scrollHeight + 'px', 50);
      }
    });

    card.appendChild(body);
    container.appendChild(card);
  });
}

document.getElementById('btn-new-plugin').addEventListener('click', () => {
  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = 'Nuevo plugin';
  document.getElementById('modal-body').innerHTML = `
    <label class="card-label">Nombre del plugin (sin .sh)</label>
    <input type="text" id="new-plugin-name" class="input" placeholder="ej: cpu, memory, weather">
  `;
  document.getElementById('modal-footer').innerHTML = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal').classList.add('hidden')">Cancelar</button>
    <button class="btn btn-primary" id="btn-create-plugin">Crear</button>
  `;
  modal.classList.remove('hidden');

  document.getElementById('btn-create-plugin').addEventListener('click', async () => {
    const name = document.getElementById('new-plugin-name').value.trim();
    if (!name) return toast('Escribí un nombre', 'error');
    const r = await API.createPlugin(name);
    if (r.success) {
      modal.classList.add('hidden');
      toast(`Plugin ${r.name} creado`);
      await loadPlugins();
      await loadBarConfig();
    } else {
      toast(r.error || 'Error', 'error');
    }
  });
});

document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal').classList.add('hidden');
});

// --- SEARCH ---
document.getElementById('plugin-search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('#plugins-list .plugin-card').forEach(card => {
    const name = card.querySelector('.plugin-name').textContent.toLowerCase();
    card.style.display = name.includes(q) ? '' : 'none';
  });
});

document.getElementById('catalog-search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('#catalog-list .catalog-item').forEach(item => {
    const name = item.querySelector('.catalog-name').textContent.toLowerCase();
    const desc = item.querySelector('.catalog-desc').textContent.toLowerCase();
    item.style.display = (name.includes(q) || desc.includes(q)) ? '' : 'none';
  });
});

document.getElementById('theme-search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('#themes-list .theme-card').forEach(card => {
    const name = card.querySelector('.theme-card-name').textContent.toLowerCase();
    const desc = card.querySelector('.theme-card-desc').textContent.toLowerCase();
    card.style.display = (name.includes(q) || desc.includes(q)) ? '' : 'none';
  });
});

// --- PLUGIN SUB-TABS ---
document.querySelectorAll('.plugins-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.plugins-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.plugins-tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById('ptab-' + btn.dataset.ptab).classList.add('active');
  });
});

// --- CATALOG ---
async function loadCatalog() {
  const data = await API.getCatalog();
  const container = document.getElementById('catalog-list');
  container.innerHTML = '';

  data.catalog.forEach(p => {
    const item = document.createElement('div');
    item.className = `catalog-item${p.installed ? ' installed' : ''}`;

    const iconEl = document.createElement('span');
    iconEl.className = 'catalog-icon';
    iconEl.textContent = p.icon;

    const info = document.createElement('div');
    info.className = 'catalog-info';
    info.innerHTML = `<div class="catalog-name">${p.name}</div><div class="catalog-desc">${p.description}</div>`;

    const cat = document.createElement('span');
    cat.className = 'catalog-category';
    cat.textContent = p.category;

    const action = document.createElement('div');
    action.className = 'catalog-action';
    const btn = document.createElement('button');
    btn.className = `btn btn-sm ${p.installed ? 'btn-secondary' : 'btn-primary'}`;
    btn.textContent = p.installed ? 'Instalado' : 'Instalar';
    if (!p.installed) {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = '...';
        const r = await API.installPlugin(p.name);
        if (r.success) {
          toast(`✅ ${r.message}`);
          await loadCatalog();
          await loadPlugins();
          btn.textContent = 'Instalado';
        } else {
          toast(r.error || 'Error', 'error');
          btn.disabled = false;
          btn.textContent = 'Instalar';
        }
      });
    }
    action.appendChild(btn);

    item.append(iconEl, info, cat, action);
    container.appendChild(item);
  });
}

// --- RESET DEFAULTS ---
document.getElementById('btn-reset-defaults').addEventListener('click', async () => {
  if (!confirm('¿Restaurar los 5 plugins originales? Esto sobreescribirá los existentes.')) return;
  const r = await API.resetDefaults();
  if (r.success) {
    toast(r.message);
    await loadPlugins();
    await loadCatalog();
  } else {
    toast(r.error || 'Error', 'error');
  }
});

// --- THEMES ---
async function loadThemes() {
  const data = await API.getThemes();
  const container = document.getElementById('themes-list');
  container.innerHTML = '';

  data.themes.forEach(t => {
    const card = document.createElement('div');
    card.className = 'theme-card';
    card.innerHTML = `
      <div class="theme-card-name">${t.name}</div>
      <div class="theme-card-desc">${t.desc}</div>
      <div class="theme-card-meta">
        <span>⭐ ${t.stars}</span>
        <span>Ver en GitHub →</span>
      </div>
    `;
    card.addEventListener('click', () => window.open(t.url, '_blank'));
    container.appendChild(card);
  });
}

document.getElementById('btn-install-theme').addEventListener('click', async () => {
  const url = document.getElementById('theme-url').value.trim();
  if (!url) return toast('Pegá un link de GitHub', 'error');

  const status = document.getElementById('theme-install-status');
  status.className = 'theme-status loading';
  status.textContent = '⏳ Buscando configuración...';

  const r = await API.installTheme(url);
  if (r.success) {
    status.className = 'theme-status success';
    status.textContent = `✅ ${r.message}${r.pluginsInstalled ? ` (${r.pluginsInstalled} plugins instalados)` : ''}`;
    await loadEditor();
    await loadPlugins();
    await loadCatalog();
  } else {
    status.className = 'theme-status error';
    status.textContent = `❌ ${r.error}`;
  }
});

// --- EDITOR TAB ---
async function loadEditor() {
  if (!state.configRaw) {
    const data = await API.getConfig();
    state.configRaw = data.raw;
  }
  document.getElementById('raw-editor').value = state.configRaw;
  updateLineCount();
}

function updateLineCount() {
  const lines = document.getElementById('raw-editor').value.split('\n').length;
  document.getElementById('line-count').textContent = `${lines} líneas`;
}

document.getElementById('raw-editor').addEventListener('input', updateLineCount);

document.getElementById('btn-editor-reload').addEventListener('click', async () => {
  await loadEditor();
  toast('Cambios descartados');
});

// --- SAVE ALL (single button) ---
document.getElementById('btn-save-all').addEventListener('click', async () => {
  const activeTab = document.querySelector('.nav-btn.active').dataset.tab;
  let saved = false;

  // Save bar config if on bar tab
  if (activeTab === 'bar') {
    const data = {
      position: document.getElementById('bar-position').value,
      height: parseInt(document.getElementById('bar-height').value),
      blurRadius: parseInt(document.getElementById('bar-blur').value),
      color: document.getElementById('bar-color').value,
    };
    const r = await API.updateBar(data);
    if (!r.success) return toast(r.error || 'Error al guardar barra', 'error');
    saved = true;
  }

  // Save editor config if on editor tab
  if (activeTab === 'editor') {
    const raw = document.getElementById('raw-editor').value;
    const r = await API.saveConfig(raw);
    if (!r.success) return toast(r.syntaxError || r.error || 'Error de sintaxis', 'error');
    state.configRaw = raw;
    saved = true;
  }

  // Reload if SketchyBar is running; start it otherwise.
  const status = await API.getStatus();
  const r = status.running ? await API.reload() : await API.start();
  if (r.success) {
    toast(saved ? '✅ Guardado y aplicado' : `↻ ${r.message}`);
    await checkStatus();
    await loadBarConfig();
    await loadPlugins();
    await loadCatalog();
  } else {
    toast(r.error || 'Error al recargar', 'error');
  }
});

// --- INIT ---
(async function init() {
  await loadBarConfig();
  await loadPlugins();
  await loadCatalog();
  await loadThemes();
  await loadEditor();
})();

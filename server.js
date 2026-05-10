const express = require('express');
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const app = express();
const PORT = 2999;
const CONFIG_DIR = path.join(os.homedir(), '.config', 'sketchybar');
const CONFIG_FILE = path.join(CONFIG_DIR, 'sketchybarrc');
const PLUGINS_DIR = path.join(CONFIG_DIR, 'plugins');

function ensureConfigDirs() {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  if (!fs.existsSync(PLUGINS_DIR)) fs.mkdirSync(PLUGINS_DIR, { recursive: true });
}

app.use(express.json());
app.use('/landing', express.static(path.join(__dirname, 'landing')));
app.use(express.static(path.join(__dirname, 'public')));

// GET /api/config — leer config completa
app.get('/api/config', (req, res) => {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = parseConfig(raw);
    res.json({ raw, parsed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/config — guardar config
app.post('/api/config', (req, res) => {
  try {
    const { raw } = req.body;
    if (!raw) return res.status(400).json({ error: 'Falta raw content' });
    ensureConfigDirs();

    const tmpFile = CONFIG_FILE + '.tmp';
    fs.writeFileSync(tmpFile, raw, 'utf-8');
    // validate syntax — detect if Lua or bash
    const isLua = raw.trimStart().startsWith('#!/usr/bin/env lua') || raw.includes('require(');
    if (!isLua) {
      try {
        execSync(`bash -n "${tmpFile}"`, { timeout: 5000 });
      } catch (e) {
        fs.unlinkSync(tmpFile);
        return res.status(400).json({
          error: 'Error de sintaxis en bash. Revisá el archivo.',
          syntaxError: e.stderr ? e.stderr.toString() : e.message,
        });
      }
    }
    fs.renameSync(tmpFile, CONFIG_FILE);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/plugins — listar plugins
app.get('/api/plugins', (req, res) => {
  try {
    if (!fs.existsSync(PLUGINS_DIR)) {
      return res.json({ plugins: [] });
    }
    const files = fs.readdirSync(PLUGINS_DIR).filter(f => f.endsWith('.sh'));
    const plugins = files.map(f => ({
      name: f,
      path: path.join(PLUGINS_DIR, f),
      content: fs.readFileSync(path.join(PLUGINS_DIR, f), 'utf-8'),
      executable: !!(fs.statSync(path.join(PLUGINS_DIR, f)).mode & 0o111),
    }));
    res.json({ plugins });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/plugins/save — guardar un plugin
app.post('/api/plugins/save', (req, res) => {
  try {
    const { name, content } = req.body;
    if (!name || content === undefined) {
      return res.status(400).json({ error: 'Falta name o content' });
    }
    ensureConfigDirs();
    const filePath = path.join(PLUGINS_DIR, name);
    fs.writeFileSync(filePath, content, 'utf-8');
    fs.chmodSync(filePath, 0o755);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/plugins/create — crear nuevo plugin
app.post('/api/plugins/create', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Falta name' });
    ensureConfigDirs();
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(PLUGINS_DIR, safeName + '.sh');
    if (fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Ya existe un plugin con ese nombre' });
    }
    const template = `#!/bin/sh\n\n# Plugin: ${safeName}\n# Creado con Barra\n\nsketchybar --set "$NAME" label="Hola"\n`;
    fs.writeFileSync(filePath, template, 'utf-8');
    fs.chmodSync(filePath, 0o755);
    res.json({ success: true, name: safeName + '.sh' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Catálogo de plugins comunitarios
const PLUGIN_CATALOG = [
  // Oficiales
  { name: 'battery.sh', description: 'Nivel de batería con icono dinámico', icon: '󰂄', category: 'oficial' },
  { name: 'clock.sh', description: 'Reloj con fecha', icon: '', category: 'oficial' },
  { name: 'front_app.sh', description: 'App activa en la barra', icon: '󰀵', category: 'oficial' },
  { name: 'space.sh', description: 'Espacios de Mission Control', icon: '󰻞', category: 'oficial' },
  { name: 'volume.sh', description: 'Control de volumen con icono', icon: '󰕾', category: 'oficial' },
  // Sistema
  { name: 'cpu.sh', description: 'Uso de CPU en tiempo real', icon: '󰍛', category: 'sistema' },
  { name: 'ram.sh', description: 'Uso de memoria RAM', icon: '󰟜', category: 'sistema' },
  { name: 'disk.sh', description: 'Espacio en disco usado', icon: '󰋊', category: 'sistema' },
  { name: 'brew.sh', description: 'Updates pendientes de Homebrew', icon: '󰏓', category: 'sistema' },
  // Red
  { name: 'wifi.sh', description: 'Red WiFi activa con IP', icon: '󰤨', category: 'red' },
  { name: 'bluetooth.sh', description: 'Dispositivos Bluetooth conectados', icon: '󰂱', category: 'red' },
  { name: 'vpn.sh', description: 'Estado de conexión VPN', icon: '󰌆', category: 'red' },
  // Info
  { name: 'calendar.sh', description: 'Fecha y hora extendida', icon: '󰸗', category: 'info' },
  { name: 'weather.sh', description: 'Clima actual (wttr.in)', icon: '󰖐', category: 'info' },
  // Multimedia
  { name: 'media.sh', description: 'Canción en Spotify/Apple Music', icon: '󰝚', category: 'multimedia' },
];

const COMMUNITY_CODE = {
  // === OFICIALES ===
  'battery.sh': `#!/bin/sh

PERCENTAGE="$(pmset -g batt | grep -Eo "\\d+%" | cut -d% -f1)"
CHARGING="$(pmset -g batt | grep 'AC Power')"

if [ "$PERCENTAGE" = "" ]; then
  exit 0
fi

case "\${PERCENTAGE}" in
  9[0-9]|100) ICON="\\uf240"
  ;;
  [6-8][0-9]) ICON="\\uf241"
  ;;
  [3-5][0-9]) ICON="\\uf242"
  ;;
  [1-2][0-9]) ICON="\\uf243"
  ;;
  *) ICON="\\uf244"
esac

if [[ "$CHARGING" != "" ]]; then
  ICON="\\uf0e7"
fi

sketchybar --set "$NAME" icon="$ICON" label="\${PERCENTAGE}%"
`,
  'clock.sh': `#!/bin/sh

sketchybar --set "$NAME" label="$(date '+%d/%m %H:%M')"
`,
  'front_app.sh': `#!/bin/sh

if [ "$SENDER" = "front_app_switched" ]; then
  sketchybar --set "$NAME" label="$INFO"
fi
`,
  'space.sh': `#!/bin/sh

sketchybar --set "$NAME" background.drawing="$SELECTED"
`,
  'volume.sh': `#!/bin/sh

if [ "$SENDER" = "volume_change" ]; then
  VOLUME="$INFO"

  case "$VOLUME" in
    [6-9][0-9]|100) ICON="\\uf05e"
    ;;
    [3-5][0-9]) ICON="\\uf6a0"
    ;;
    [1-9]|[1-2][0-9]) ICON="\\uf69f"
    ;;
    *) ICON="\\uf6a1"
  esac

  sketchybar --set "$NAME" icon="$ICON" label="$VOLUME%"
fi
`,
  // === SISTEMA ===
  'cpu.sh': `#!/bin/sh

CPU_INFO=$(ps -eo pcpu,user --no-headers | awk '{usage[$2]+=$1} END {for (user in usage) print usage[user], user}' | sort -rn | head -n 1)
CPU_USAGE=$(echo "$CPU_INFO" | awk '{print int($1)}')

if [ "$CPU_USAGE" -gt 75 ]; then
  ICON="\\uf405"
elif [ "$CPU_USAGE" -gt 50 ]; then
  ICON="\\ufb85"
else
  ICON="\\ufb86"
fi

sketchybar --set "$NAME" icon="$ICON" label="\${CPU_USAGE}%"
`,
  'ram.sh': `#!/bin/sh

MEM_USED=$(memory_pressure | grep "System-wide memory free percentage:" | awk '{ printf("%02.0f\\n", 100-$5"%") }')

sketchybar --set "$NAME" label="$MEM_USED%"
`,
  'disk.sh': `#!/bin/sh

DISK=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
USED=$(df -h / | awk 'NR==2 {print $3}')
TOTAL=$(df -h / | awk 'NR==2 {print $2}')

if [ "$DISK" -gt 90 ]; then
  ICON="\\uf2ca"
elif [ "$DISK" -gt 70 ]; then
  ICON="\\uf2cc"
else
  ICON="\\uf2cb"
fi

sketchybar --set "$NAME" icon="$ICON" label="$USED/$TOTAL"
`,
  'brew.sh': `#!/bin/sh

UPDATES=$(brew outdated 2>/dev/null | wc -l | tr -d ' ')

if [ "$UPDATES" -gt 0 ]; then
  ICON="\\uf3d3"
  LABEL="$UPDATES"
else
  ICON="\\uf3d7"
  LABEL=""
fi

sketchybar --set "$NAME" icon="$ICON" label="$LABEL"
`,
  // === RED ===
  'wifi.sh': `#!/bin/sh

IP="$(ipconfig getifaddr en0)"
ICON="\\ue648 "
if [[ -n "$IP" ]]; then
  ICON="\\ue647 "
  HOTSPOT=$(ipconfig getsummary en0 | grep sname | awk '{print $3}')
  if [[ $HOTSPOT != "" ]]; then
    ICON="\\uf0ac "
  fi
fi
sketchybar --set "$NAME" icon="$ICON"
`,
  'bluetooth.sh': `#!/bin/sh

COUNT=$(system_profiler SPBluetoothDataType 2>/dev/null | grep "Connected:" | wc -l | tr -d ' ')

if [ "$COUNT" -gt 0 ]; then
  ICON="\\uf0b1"
  LABEL="$COUNT"
else
  ICON="\\uf0b2"
  LABEL=""
fi

sketchybar --set "$NAME" icon="$ICON" label="$LABEL"
`,
  'vpn.sh': `#!/bin/sh

VPN=$(scutil --nwi 2>/dev/null | grep -E "utun|ppp" | head -1)

if [ "$VPN" != "" ]; then
  ICON="\\uf306"
  LABEL="VPN"
else
  ICON="\\uf307"
  LABEL=""
fi

sketchybar --set "$NAME" icon="$ICON" label="$LABEL"
`,
  // === INFO ===
  'calendar.sh': `#!/bin/sh

sketchybar --set "$NAME" label="$(date '+%d [%a] %H:%M')"
`,
  'weather.sh': `#!/bin/sh

DATA=$(curl -s "wttr.in?format=%C+%t" 2>/dev/null)
CONDITION=$(echo "$DATA" | awk '{print $1}')
TEMP=$(echo "$DATA" | awk '{print $2}')

case "$CONDITION" in
  *Clear*|*Sunny*) ICON="\\uf599";;
  *Cloud*) ICON="\\uf590";;
  *Rain*|*Drizzle*) ICON="\\uf597";;
  *Snow*) ICON="\\uf536";;
  *Thunder*) ICON="\\uf593";;
  *Fog*|*Mist*) ICON="\\uf591";;
  *) ICON="\\uf59a";;
esac

sketchybar --set "$NAME" icon="$ICON" label="$TEMP"
`,
  // === MULTIMEDIA ===
  'media.sh': `#!/bin/sh

STATE=$(osascript -e 'tell application "System Events" to (name of first application process whose frontmost is true)')

if [ "$STATE" = "Spotify" ]; then
  TRACK=$(osascript -e 'tell application "Spotify" to if player state is playing then return artist of current track & " — " & name of current track')
elif [ "$STATE" = "Music" ]; then
  TRACK=$(osascript -e 'tell application "Music" to if player state is playing then return artist of current track & " — " & name of current track')
fi

if [ "$TRACK" != "" ]; then
  ICON="\\uf75a"
  LABEL="$TRACK"
else
  ICON="\\uf75b"
  LABEL=""
fi

sketchybar --set "$NAME" icon="$ICON" label="$LABEL"
`,
};

// GET /api/plugins/catalog — catálogo de plugins
app.get('/api/plugins/catalog', (req, res) => {
  const installed = fs.existsSync(PLUGINS_DIR)
    ? fs.readdirSync(PLUGINS_DIR).filter(f => f.endsWith('.sh'))
    : [];
  const catalog = PLUGIN_CATALOG.map(p => ({
    ...p,
    installed: installed.includes(p.name),
    code: COMMUNITY_CODE[p.name] || null,
  }));
  res.json({ catalog });
});

// POST /api/plugins/install — instalar un plugin del catálogo
app.post('/api/plugins/install', (req, res) => {
  try {
    const { name } = req.body;
    const code = COMMUNITY_CODE[name];
    if (!code) return res.status(400).json({ error: 'Plugin no encontrado en el catálogo' });
    if (!fs.existsSync(PLUGINS_DIR)) fs.mkdirSync(PLUGINS_DIR, { recursive: true });
    const filePath = path.join(PLUGINS_DIR, name);
    fs.writeFileSync(filePath, code, 'utf-8');
    fs.chmodSync(filePath, 0o755);
    res.json({ success: true, message: `${name} instalado` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/plugins/reset-defaults — restaurar plugins originales
app.post('/api/plugins/reset-defaults', (req, res) => {
  try {
    const defaults = ['battery.sh', 'clock.sh', 'front_app.sh', 'space.sh', 'volume.sh'];
    if (!fs.existsSync(PLUGINS_DIR)) fs.mkdirSync(PLUGINS_DIR, { recursive: true });
    defaults.forEach(name => {
      const code = COMMUNITY_CODE[name];
      if (code) {
        const filePath = path.join(PLUGINS_DIR, name);
        fs.writeFileSync(filePath, code, 'utf-8');
        fs.chmodSync(filePath, 0o755);
      }
    });
    // Also restore sketchybarrc if it exists in catalog memory
    res.json({ success: true, message: 'Plugins originales restaurados' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === TEMAS ===
const POPULAR_THEMES = [
  { name: 'FelixKratz/dotfiles', desc: 'Config oficial del creador de SketchyBar', stars: '2k+', url: 'https://github.com/FelixKratz/dotfiles' },
  { name: 'm4xshen/dotfiles', desc: 'Neovim + Kitty + SketchyBar minimalista', stars: '436', url: 'https://github.com/m4xshen/dotfiles' },
  { name: 'rockyzhang24/dotfiles', desc: 'Config completa con yabai + sketchybar', stars: '230', url: 'https://github.com/rockyzhang24/dotfiles' },
  { name: 'mehd-io/dotfiles', desc: 'Aerospace + SketchyBar setup', stars: '166', url: 'https://github.com/mehd-io/dotfiles' },
  { name: 'falleco/dotfiles', desc: 'macOS con Aerospace + Borders + Sketchybar', stars: '79', url: 'https://github.com/falleco/dotfiles' },
  { name: 'nekowinston/dotfiles', desc: 'Config limpia y bien documentada', stars: '71', url: 'https://github.com/nekowinston/dotfiles' },
  { name: 'haydenrou/dotfiles', desc: 'Entorno de desarrollo personalizado', stars: '45', url: 'https://github.com/haydenrou/dotfiles' },
  { name: 'crissNb/Dynamic-Island-Sketchybar', desc: 'Dynamic Island estilo iPhone en Mac', stars: '522', url: 'https://github.com/crissNb/Dynamic-Island-Sketchybar' },
];

// GET /api/themes — lista de temas populares
app.get('/api/themes', (req, res) => {
  res.json({ themes: POPULAR_THEMES });
});

// Helper: fetch GitHub raw content
function githubFetch(urlPath) {
  return new Promise((resolve, reject) => {
    https.get(`https://raw.githubusercontent.com${urlPath}`, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => {
        if (resp.statusCode === 200) resolve(data);
        else reject(new Error(`HTTP ${resp.statusCode}: ${urlPath}`));
      });
    }).on('error', reject);
  });
}

function githubTree(owner, repo, branch) {
  return new Promise((resolve, reject) => {
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    https.get(treeUrl, { headers: { 'User-Agent': 'Barra-Studio' } }, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (resp.statusCode >= 400) return reject(new Error(parsed.message || `HTTP ${resp.statusCode}`));
          resolve(parsed.tree || []);
        } catch {
          reject(new Error('Respuesta inválida de GitHub'));
        }
      });
    }).on('error', reject);
  });
}

// POST /api/themes/install — instalar tema desde URL de GitHub
app.post('/api/themes/install', async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Falta la URL' });

    // Parse GitHub URL: https://github.com/user/repo or https://github.com/user/repo/tree/branch
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return res.status(400).json({ error: 'URL de GitHub no válida' });

    const [, owner, repo] = match;
    let branch = 'main';
    const branchMatch = url.match(/tree\/([^/]+)/);
    if (branchMatch) branch = branchMatch[1];

    let repoTree = [];
    try {
      repoTree = await githubTree(owner, repo, branch);
    } catch (e) {
      if (branch === 'main') {
        branch = 'master';
        repoTree = await githubTree(owner, repo, branch);
      } else {
        throw e;
      }
    }

    // Backup current config
    const backupPath = CONFIG_FILE + '.backup.' + Date.now();
    if (fs.existsSync(CONFIG_FILE)) {
      fs.copyFileSync(CONFIG_FILE, backupPath);
    }

    const configCandidates = repoTree
      .filter(f => f.type === 'blob' && path.basename(f.path) === 'sketchybarrc')
      .sort((a, b) => {
        const score = p => (p.includes('.config/sketchybar') ? 0 : p.includes('sketchybar') ? 1 : 2);
        return score(a.path) - score(b.path) || a.path.length - b.path.length;
      });

    const foundConfig = configCandidates[0];
    let configContent = null;
    let foundPath = null;

    if (foundConfig) {
      foundPath = foundConfig.path;
      configContent = await githubFetch(`/${owner}/${repo}/${branch}/${foundPath}`);
    }

    if (!configContent) {
      return res.status(404).json({
        error: 'No se encontró sketchybarrc en ese repo. Probá con otro link.',
        tried: ['**/sketchybarrc'],
      });
    }

    // Save the config
    fs.writeFileSync(CONFIG_FILE, configContent, 'utf-8');

    // Try to fetch plugins from the repo
    const pluginsDir = path.join(CONFIG_DIR, 'plugins');
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });

    let pluginsInstalled = 0;
    const configDir = path.dirname(foundPath);
    const plugins = repoTree.filter(f =>
      f.type === 'blob' &&
      f.path.endsWith('.sh') &&
      (f.path.startsWith(`${configDir}/plugins/`) || f.path.includes('/sketchybar/plugins/'))
    );

    for (const plugin of plugins) {
      const pluginName = path.basename(plugin.path);
      const rawPath = `/${owner}/${repo}/${branch}/${plugin.path}`;
      try {
        const pluginContent = await githubFetch(rawPath);
        fs.writeFileSync(path.join(pluginsDir, pluginName), pluginContent, 'utf-8');
        fs.chmodSync(path.join(pluginsDir, pluginName), 0o755);
        pluginsInstalled++;
      } catch (e) {
        // skip plugin if can't fetch
      }
    }

    res.json({
      success: true,
      message: `Tema instalado desde ${owner}/${repo}`,
      configPath: foundPath,
      pluginsInstalled,
      backupPath,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/start — iniciar sketchybar
app.post('/api/start', (req, res) => {
  exec('brew services start sketchybar 2>/dev/null || (sketchybar >/tmp/sketchybar.log 2>&1 &)', (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({
        error: 'No se pudo iniciar SketchyBar',
        detail: stderr || err.message,
      });
    }
    res.json({ success: true, message: 'SketchyBar iniciado' });
  });
});

// POST /api/reload — recargar sketchybar
app.post('/api/reload', (req, res) => {
  exec('sketchybar --reload', (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({
        error: 'No se pudo recargar. ¿SketchyBar está instalado?',
        detail: stderr || err.message,
      });
    }
    res.json({ success: true, message: 'SketchyBar recargado' });
  });
});

// GET /api/status — estado de sketchybar
app.get('/api/status', (req, res) => {
  try {
    exec('pgrep -x sketchybar', (err, stdout) => {
      const running = !err && stdout.trim().length > 0;
      res.json({ running, pid: running ? stdout.trim() : null });
    });
  } catch (e) {
    res.json({ running: false, pid: null });
  }
});

// POST /api/bar — actualizar solo propiedades de la barra
app.post('/api/bar', (req, res) => {
  try {
    const { position, height, blurRadius, color } = req.body;
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');

    const setBarProp = (line, key, value) => {
      if (value === undefined || value === null || value === '') return line;
      const prop = `${key}=${value}`;
      const propRegex = new RegExp(`(^|\\s)${key}=\\S+`);
      return propRegex.test(line)
        ? line.replace(propRegex, (match, prefix) => `${prefix}${prop}`)
        : `${line} ${prop}`;
    };

    const lines = raw.split('\n');
    let foundBarLine = false;
    const updatedLines = lines.map(line => {
      if (!/^\s*sketchybar\s+--bar\b/.test(line)) return line;
      foundBarLine = true;
      let updatedLine = line;
      updatedLine = setBarProp(updatedLine, 'position', position);
      updatedLine = setBarProp(updatedLine, 'height', height);
      updatedLine = setBarProp(updatedLine, 'blur_radius', blurRadius);
      updatedLine = setBarProp(updatedLine, 'color', color);
      return updatedLine;
    });

    if (!foundBarLine) {
      updatedLines.unshift(`sketchybar --bar position=${position || 'top'} height=${height || 40} blur_radius=${blurRadius ?? 30} color=${color || '0x40000000'}`);
    }

    const updated = updatedLines.join('\n');

    fs.writeFileSync(CONFIG_FILE, updated, 'utf-8');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function parseConfig(raw) {
  const lines = raw.split('\n');
  const sections = [];
  let currentComment = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#')) {
      currentComment.push(line);
      continue;
    }
    if (line.trim() === '') {
      currentComment = [];
      continue;
    }
    sections.push({
      line: i + 1,
      content: line,
      comments: currentComment.join('\n'),
    });
    currentComment = [];
  }
  return { sections, totalLines: lines.length };
}

const serverReady = new Promise((resolve, reject) => {
  const server = app.listen(PORT, () => {
    console.log(`Express listo en puerto ${PORT}`);
    resolve(server);
  });
  server.on('error', reject);
});

if (require.main === module) {
  serverReady.then(() => {
    console.log(`\n  🟦 Barra v1.0 — Configurador SketchyBar`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  Abrí en tu navegador: http://localhost:${PORT}\n`);
  });
}

module.exports = serverReady;

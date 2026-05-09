# ApliArte SketchyBar

> Configurador visual local para [SketchyBar](https://github.com/FelixKratz/SketchyBar) en macOS.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![SketchyBar](https://img.shields.io/badge/SketchyBar-compatible-ff8f00?logo=apple&logoColor=white)](https://github.com/FelixKratz/SketchyBar)
[![macOS](https://img.shields.io/badge/macOS-local--first-000000?logo=apple&logoColor=white)](https://www.apple.com/macos/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**ApliArte SketchyBar** es una app web local para personalizar SketchyBar desde el navegador: ajustar la apariencia, editar plugins, tocar el `sketchybarrc` y aplicar cambios con **Guardar y recargar**.

🔗 Repositorio: <https://github.com/erbolamm/SketchyBar-Config>  
🌐 Landing pública: <https://erbolamm.github.io/SketchyBar-Config/>  
🧪 Landing local: `http://localhost:2999/landing/` con el servidor en marcha.  
📄 Fuentes de landing: [`docs/index.html`](docs/index.html) para GitHub Pages y [`landing/index.html`](landing/index.html) para la ruta local.

---

## Resumen rápido

| Dato | Valor |
|------|-------|
| Tipo | Herramienta developer / app web local |
| Plataforma | macOS |
| Stack | Node.js + Express + HTML/CSS/JS vanilla + PWA |
| URL local | `http://localhost:2999` |
| Landing pública | `https://erbolamm.github.io/SketchyBar-Config/` |
| Landing local | `http://localhost:2999/landing/` |
| Config que edita | `~/.config/sketchybar/` |

---

## Qué podés hacer

- 🎨 **Ajustar la barra**: posición, altura, desenfoque y color con vista previa.
- 🧩 **Gestionar plugins**: instalar desde catálogo, crear plugins y editar scripts.
- 📝 **Editar RAW**: modificar el archivo `sketchybarrc` directamente.
- 💾 **Guardar y recargar**: aplicar cambios desde un único botón.
- 📱 **Instalar como PWA**: usarla como app standalone en macOS.

---

## Instalación

### Requisitos

- macOS
- Node.js 18+

### Pasos

1. **Instalá la barra oficial** con Homebrew:

```bash
brew install sketchybar
```

2. **Descargá la App:**
   - Podés bajar el archivo `.dmg` listo para usar desde la sección de **Releases** en GitHub.
   - O podés clonar y compilarla vos mismo:

```bash
git clone https://github.com/erbolamm/SketchyBar-Config.git
cd SketchyBar-Config
npm install
npm run dist
```

Después abrí:

```text
http://localhost:2999
```

Para ver la landing local:

```text
http://localhost:2999/landing/
```

---

## Uso básico

1. Abrí la app local.
2. Entrá en **Barra** para ajustar apariencia.
3. Usá **Plugins** para instalar o editar scripts.
4. Si necesitás control fino, entrá en **Editor RAW**.
5. Aplicá cambios con **Guardar y recargar**.

---

## Privacidad y alcance local

Esta herramienta corre en tu Mac y edita archivos locales de SketchyBar. No es un servicio en la nube.

Tené en cuenta:

- Los cambios se escriben en `~/.config/sketchybar/`.
- Los plugins son scripts locales de tu configuración.
- Si ya tenés una configuración avanzada, revisá antes de guardar.

---

## Estructura

```text
SketchyBar-Config/
├── docs/                 # Landing pública para GitHub Pages
│   ├── index.html
│   └── styles.css
├── landing/              # Landing estática del proyecto
│   ├── index.html
│   └── styles.css
├── public/               # App web local / PWA
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── manifest.json
│   ├── sw.js
│   └── icon.png
├── server.js             # Servidor Express + APIs locales
├── package.json
└── README.md
```

---

## APIs principales

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/api/config` | GET/POST | Leer o guardar `sketchybarrc` |
| `/api/plugins` | GET | Listar plugins instalados |
| `/api/plugins/save` | POST | Guardar un plugin |
| `/api/plugins/create` | POST | Crear un plugin |
| `/api/plugins/install` | POST | Instalar plugin del catálogo |
| `/api/plugins/reset-defaults` | POST | Restaurar plugins base |
| `/api/bar` | POST | Actualizar propiedades de la barra |
| `/api/status` | GET | Ver estado de SketchyBar |
| `/api/reload` | POST | Recargar SketchyBar |
| `/api/start` | POST | Iniciar SketchyBar si no está corriendo |

---

## Identidad visual

La interfaz usa una estética oscura inspirada en ApliArte y Catppuccin:

| Color | Hex | Uso |
|-------|-----|-----|
| Fondo | `#211426` | Base visual |
| Superficie | `#33253f` | Tarjetas y paneles |
| Texto | `#cdd6f4` | Texto principal |
| Rosa | `#f5bde6` | Acento ApliArte |
| Azul | `#8bd5ff` | Acento secundario |
| Verde | `#a6e3a1` | Estado activo |

---

## Autor

Javier Mateo (ApliArte) — github.com/erbolamm

## 💬 Una nota personal del autor / A personal note from the author

ℹ️ Nota: El texto siguiente es un mensaje personal del autor, escrito en varios idiomas para que pueda leerlo gente de todo el mundo. Esto no implica que el proyecto tenga soporte funcional completo en esos idiomas.

ℹ️ Note: The text below is a personal message from the author, written in several languages so people around the world can read it. This does not imply full multilingual feature support in those languages.

<details>
<summary>🇪🇸 Español</summary>

Hola, soy Javier. Creé **ApliArte SketchyBar** para tener una forma más visual y tranquila de configurar SketchyBar en macOS. Este proyecto edita la configuración local de tu barra, ayuda a probar plugins y permite aplicar cambios sin vivir dentro de la terminal. Lo comparto porque quizás también te ahorre tiempo si estás personalizando tu Mac.
</details>

<details>
<summary>🇬🇧 English</summary>

Hi, I'm Javier. I created **ApliArte SketchyBar** to have a calmer, more visual way to configure SketchyBar on macOS. This project edits your local bar configuration, helps you test plugins, and lets you apply changes without living inside the terminal. I’m sharing it because it may save you time if you enjoy customizing your Mac.
</details>

<details>
<summary>🇧🇷 Português</summary>

Olá, sou o Javier. Criei o **ApliArte SketchyBar** para ter uma forma mais visual e tranquila de configurar o SketchyBar no macOS. Este projeto edita a configuração local da sua barra, ajuda a testar plugins e permite aplicar mudanças sem depender o tempo todo do terminal. Compartilho porque talvez ele também economize tempo para quem gosta de personalizar o Mac.
</details>

<details>
<summary>🇫🇷 Français</summary>

Salut, je suis Javier. J’ai créé **ApliArte SketchyBar** pour configurer SketchyBar sur macOS d’une manière plus visuelle et plus sereine. Ce projet modifie la configuration locale de votre barre, aide à tester des plugins et permet d’appliquer les changements sans rester constamment dans le terminal. Je le partage parce qu’il peut aussi faire gagner du temps aux personnes qui personnalisent leur Mac.
</details>

<details>
<summary>🇩🇪 Deutsch</summary>

Hallo, ich bin Javier. Ich habe **ApliArte SketchyBar** erstellt, um SketchyBar auf macOS ruhiger und visueller konfigurieren zu können. Dieses Projekt bearbeitet deine lokale Bar-Konfiguration, hilft beim Testen von Plugins und erlaubt es, Änderungen anzuwenden, ohne ständig im Terminal zu arbeiten. Ich teile es, weil es auch anderen Zeit sparen kann, die ihren Mac gern anpassen.
</details>

<details>
<summary>🇮🇹 Italiano</summary>

Ciao, sono Javier. Ho creato **ApliArte SketchyBar** per avere un modo più visuale e tranquillo di configurare SketchyBar su macOS. Questo progetto modifica la configurazione locale della tua barra, aiuta a provare plugin e permette di applicare modifiche senza restare sempre nel terminale. Lo condivido perché può far risparmiare tempo anche a chi ama personalizzare il proprio Mac.
</details>

## 💖 Apoya el proyecto

Herramienta gratuita y open source. Si te ahorra tiempo, un café ayuda a mantener el desarrollo.

| Plataforma | Enlace |
|-----------|--------|
| PayPal | paypal.me/erbolamm |
| Ko-fi | ko-fi.com/C0C11TWR1K |
| Twitch Tip | streamelements.com/apliarte/tip |

🌐 Sitio Oficial · 📦 GitHub

## Licencia

MIT — © 2026 ApliArte

## About

ApliArte SketchyBar is a local-first macOS developer tool for configuring SketchyBar from a browser. It provides a visual bar editor, plugin management, raw configuration editing, a PWA interface, and a static landing page for publishing the project on GitHub.

# Barra Studio

> Configurador visual para [SketchyBar](https://github.com/FelixKratz/SketchyBar) — la barra de menú reemplazable para macOS.

[![Node.js](https://img.shields.io/badge/Node.js-25+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![SketchyBar](https://img.shields.io/badge/SketchyBar-Compatible-4a90d9?logo=apple&logoColor=white)](https://github.com/FelixKratz/SketchyBar)
[![macOS](https://img.shields.io/badge/macOS-13+-000000?logo=apple&logoColor=white)](https://www.apple.com/macos/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Barra Studio es una aplicación web local (PWA) que te permite configurar SketchyBar de forma visual, sin tocar la terminal. Cambia colores, activa/desactiva items, instala plugins de la comunidad y edita la configuración directamente desde tu navegador.

---

## ✨ Características

| Función | Descripción |
|---------|-------------|
| 🎨 **Apariencia** | Cambiá posición, altura, desenfoque y color de la barra con vista previa en vivo |
| 📦 **Catálogo de plugins** | 15 plugins listos para instalar con 1 click (CPU, RAM, WiFi, clima, música...) |
| ✏️ **Editor de plugins** | Editá el código de tus plugins directamente desde la interfaz |
| 📝 **Editor RAW** | Editá el archivo `sketchybarrc` completo con validación de sintaxis bash |
| 🔄 **Recarga instantánea** | Un botón para recargar SketchyBar después de cada cambio |
| ▶️ **Control de estado** | Iniciá, detené y recargá SketchyBar desde la app |
| ↺ **Restaurar defaults** | Volvé a los 5 plugins originales con un click |
| 📱 **PWA** | Instalable como app standalone en tu Mac |

---

## 🚀 Instalación

### Requisitos

- **macOS 13+** (Ventura o superior)
- **Node.js 18+**
- **SketchyBar** instalado (`brew install sketchybar`)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/erbolamm/barra.git
cd barra

# 2. Instalar dependencias
npm install

# 3. Iniciar la app
npm start
```

Abrí **`http://localhost:2999`** en tu navegador.

---

## 📖 Uso rápido

### 1. Iniciar SketchyBar

Si la barra no está corriendo, hacé click en **▶ Iniciar** en el sidebar.

### 2. Personalizar la barra

Andá a la pestaña **Barra** y ajustá:
- **Posición**: arriba o abajo
- **Altura**: entre 20 y 100px
- **Desenfoque**: efecto de transparencia
- **Color**: fondo de la barra

### 3. Instalar plugins

Andá a **Plugins → Catálogo** y hacé click en **Instalar** en el plugin que quieras. Después recargá con **↻ Recargar**.

### 4. Editar configuración

Usá la pestaña **Editor RAW** para modificar directamente el archivo `sketchybarrc`. La sintaxis bash se valida antes de guardar.

---

## 🧩 Plugins disponibles

### Oficiales (SketchyBar)

| Plugin | Descripción |
|--------|-------------|
| `battery.sh` | Nivel de batería con icono dinámico |
| `clock.sh` | Reloj con fecha |
| `front_app.sh` | App activa en la barra |
| `space.sh` | Espacios de Mission Control |
| `volume.sh` | Control de volumen con icono |

### Comunidad

| Plugin | Descripción |
|--------|-------------|
| `cpu.sh` | Uso de CPU en tiempo real |
| `ram.sh` | Uso de memoria RAM |
| `disk.sh` | Espacio en disco usado |
| `wifi.sh` | Red WiFi activa con IP |
| `brew.sh` | Updates pendientes de Homebrew |
| `bluetooth.sh` | Dispositivos Bluetooth conectados |
| `vpn.sh` | Estado de conexión VPN |
| `calendar.sh` | Fecha y hora extendida |
| `weather.sh` | Clima actual (vía wttr.in) |
| `media.sh` | Canción en Spotify/Apple Music |

---

## 🏗️ Estructura del proyecto

```
barra/
├── package.json          # Dependencias y scripts
├── server.js             # Servidor Express + APIs
├── public/
│   ├── index.html        # Interfaz principal
│   ├── styles.css        # Estilos (Catppuccin Mocha)
│   ├── app.js            # Lógica del frontend
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service Worker
│   └── icon.png          # Icono de la app
└── README.md             # Este archivo
```

---

## 🔌 APIs del servidor

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/config` | GET | Leer configuración actual |
| `/api/config` | POST | Guardar configuración |
| `/api/plugins` | GET | Listar plugins instalados |
| `/api/plugins/save` | POST | Guardar un plugin |
| `/api/plugins/create` | POST | Crear nuevo plugin |
| `/api/plugins/install` | POST | Instalar plugin del catálogo |
| `/api/plugins/catalog` | GET | Obtener catálogo de plugins |
| `/api/plugins/reset-defaults` | POST | Restaurar plugins originales |
| `/api/reload` | POST | Recargar SketchyBar |
| `/api/start` | POST | Iniciar SketchyBar |
| `/api/status` | GET | Estado de SketchyBar |
| `/api/bar` | POST | Actualizar propiedades de la barra |

---

## 🎨 Tema visual

Barra Studio usa el tema **Catppuccin Mocha**:

| Color | Hex | Uso |
|-------|-----|-----|
| Background | `#1e1e2e` | Fondo principal |
| Surface | `#313244` | Tarjetas y paneles |
| Text | `#cdd6f4` | Texto principal |
| Accent | `#89b4fa` | Botones y enlaces |
| Green | `#a6e3a1` | Estado activo |
| Red | `#f38ba8` | Estado inactivo |

---

## 🤝 Contribuir

1. Hacé un fork del repositorio
2. Creá una rama para tu feature (`git checkout -b feature/mi-feature`)
3. Commiteá tus cambios (`git commit -m 'feat: agregué mi feature'`)
4. Pusheá la rama (`git push origin feature/mi-feature`)
5. Abrí un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## Autor

Javier Mateo (ApliArte) — github.com/erbolamm

## 💬 Una nota personal del autor / A personal note from the author

ℹ️ Nota: El texto siguiente es un mensaje personal del autor, escrito en varios idiomas para que pueda leerlo gente de todo el mundo. Esto no implica que el proyecto tenga soporte funcional completo en esos idiomas.

ℹ️ Note: The text below is a personal message from the author, written in several languages so people around the world can read it. This does not imply full multilingual feature support in those languages.

<details>
<summary>🇪🇸 Español</summary>

Hola, soy Javier. Creé **Barra Studio** porque quería una forma fácil de configurar SketchyBar sin tener que editar archivos de texto en la terminal. Soy autodidacta desde abril de 2023 y este proyecto nació de mi propia necesidad de personalizar mi Mac de forma visual. Espero que te sea tan útil como a mí. ¡Si tenés ideas o encontrás bugs, no dudes en abrir un issue!
</details>

<details>
<summary>🇬🇧 English</summary>

Hi, I'm Javier. I created **Barra Studio** because I wanted an easy way to configure SketchyBar without editing text files in the terminal. I'm self-taught since April 2023 and this project came from my own need to customize my Mac visually. I hope you find it as useful as I do. If you have ideas or find bugs, feel free to open an issue!
</details>

<details>
<summary>🇧🇷 Português</summary>

Olá, sou o Javier. Criei o **Barra Studio** porque queria uma forma fácil de configurar o SketchyBar sem editar arquivos de texto no terminal. Sou autodidata desde abril de 2023 e este projeto nasceu da minha própria necessidade de personalizar meu Mac de forma visual. Espero que seja tão útil para você quanto é para mim. Se tiver ideias ou encontrar bugs, não hesite em abrir uma issue!
</details>

<details>
<summary>🇫🇷 Français</summary>

Salut, je suis Javier. J'ai créé **Barra Studio** parce que je voulais une façon facile de configurer SketchyBar sans éditer des fichiers texte dans le terminal. Je suis autodidacte depuis avril 2023 et ce projet est né de mon propre besoin de personnaliser mon Mac de manière visuelle. J'espère qu'il vous sera aussi utile qu'à moi. Si vous avez des idées ou trouvez des bugs, n'hésitez pas à ouvrir une issue !
</details>

<details>
<summary>🇩🇪 Deutsch</summary>

Hallo, ich bin Javier. Ich habe **Barra Studio** erstellt, weil ich eine einfache Möglichkeit suchte, SketchyBar zu konfigurieren, ohne Textdateien im Terminal zu bearbeiten. Ich bin seit April 2023 Autodidakt und dieses Projekt entstand aus meinem eigenen Bedürfnis, meinen Mac visuell anzupassen. Ich hoffe, es ist für dich genauso nützlich wie für mich. Wenn du Ideen hast oder Bugs findest, zögere nicht, ein Issue zu öffnen!
</details>

<details>
<summary>🇮🇹 Italiano</summary>

Ciao, sono Javier. Ho creato **Barra Studio** perché volevo un modo semplice per configurare SketchyBar senza modificare file di testo nel terminale. Sono autodidatta da aprile 2023 e questo progetto è nato dal mio bisogno di personalizzare il mio Mac in modo visivo. Spero che ti sia utile quanto lo è per me. Se hai idee o trovi bug, non esitare ad aprire una issue!
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

Barra Studio es un configurador visual para SketchyBar que permite personalizar la barra de menú de macOS desde el navegador. Incluye catálogo de plugins, editor de configuración, vista previa en vivo y recarga instantánea. Hecho con Node.js, Express y vanilla JS.

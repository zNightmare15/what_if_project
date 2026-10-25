# What If? — Viral 3D Science Simulation Engine

Motor modular y determinista para la generación automatizada de vídeos de simulación científica 3D en formato vertical (`1080x1920`, 60 FPS) al estilo viral de TikTok / Reels (`@man_ia_c`).

---

## 📁 Estructura del Proyecto

```text
what_if_project/
├── src/                          # Código fuente del motor Three.js y WebGL
│   ├── sketch_viewer.html        # Visor interactivo y canvas de renderizado
│   ├── world_actors.js           # Personajes y props animados
│   ├── world_textures.js         # Generación procedimental de texturas (césped, atardecer, X-Ray)
│   ├── world_skyline_and_lidar.js# Rascacielos low-poly y nube de puntos LiDAR (115k)
│   ├── world_fx_overlay.js       # Efectos visuales 2D (destello, lente solar, onda de choque)
│   ├── world_postfx.js           # Pipeline de post-procesado (bloom, ACES filmic, aberración)
│   ├── story_config.js           # Configuración activa de la historia en ejecución
│   ├── build_story.js            # Compilador CLI de historias JSON a story_config.js
│   ├── export_video.js           # Exportador headless GPU a MP4 vía Edge + Puppeteer + FFmpeg
│   └── three.min.js              # Biblioteca Three.js core
│
├── stories/                      # Plantillas modulares de historias en formato JSON
│   ├── electrons_5s.json         # Historia completa: "¿Y si los electrones desaparecieran por 5 segundos?"
│   └── gravity_5s_example.json   # Plantilla ejemplo: "¿Y si la gravedad desapareciera por 5 segundos?"
│
├── assets/                       # Recursos multimedia
│   ├── audio/                    # Pistas de audio, efectos y scripts de mezcla
│   └── references/               # Fotogramas de referencia extraídos y validaciones
│
├── blender/                      # Escenas y scripts para renderizado alternativo en EEVEE
│
├── output/                       # Vídeos renderizados finales (.mp4)
│
└── docs/                         # Documentación técnica y especificaciones de estilo
```

---

## 🚀 Requisitos y Configuración

- **Node.js** (v18+)
- **FFmpeg** instalado y disponible en el `PATH` del sistema.
- **Microsoft Edge** o Google Chrome para renderizado headless con aceleración GPU D3D11.

Instalación de dependencias:
```bash
npm install
```

---

## 🎬 Generación y Renderizado

### 1. Compilar una Historia
```bash
node build_story.js stories/electrons_5s.json
```

### 2. Validar Fotogramas de Borrador
```bash
node export_video.js --verify-only
```

### 3. Exportar Vídeo Definitivo a 60 FPS
```bash
node export_video.js --fps=60
```
El vídeo final se guarda automáticamente en `what_if_electrons_tiktok.mp4` y en la carpeta `output/`.


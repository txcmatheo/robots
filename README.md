# Segunda piel · Westcol × Blessd

Experiencia 3D sobre dos robots **EngineAI T800 Max** forrados en película PPF. Está construida con Vite, three.js y GSAP.

## Uso

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # producción en dist/ (es una carpeta estática que se sube tal cual)
npm run preview   # sirve dist/ en local
```

## Estructura

| Ruta | Contenido |
| --- | --- |
| `index.html` | Marcado de todas las secciones: portada, selección, capítulo de cada robot, La piel y cierre |
| `src/main.js` | Escena 3D, estados, cámara, UI, sonido y carga |
| `src/datos.js` | Modelo, colores de fábrica, zonas y **colección de Westcol** (W Sound 24, W Sound Oro, Kid W, En vivo) |
| `src/estudio.js` | Estudio fotográfico procedural: ciclorama, piso con reflejo, luces y polvo |
| `src/cierre.js` / `cierre.css` | Animación de cierre |
| `src/diagramas.css` | Diagramas SVG de La piel: capas, proceso y regla |
| `public/` | Assets ya optimizados |
| `raw/` | Originales sin optimizar (no están en el repo; solo hacen falta para `npm run assets`) |
| `scripts/optimizar.mjs` | `npm run assets` regenera `public/` a partir de `raw/` |
| `scripts/og.mjs` | Genera la imagen para compartir en redes |

Las pieles de Blessd salen de `public/disenos/blessd.json`, junto con su GLB de materiales `blessd_A.glb`. Las de Westcol se definen en código, en `WESTCOL_DISENOS`. Ahí cada concepto define el color y el acabado de cada zona y los impresos, que se dibujan en canvas y se proyectan sobre los paneles reales.

## Optimizaciones frente al original

- **GLB:** el T800 pasa de 6,8 MB a 2,7 MB, con `EXT_meshopt_compression`, cuantización y texturas WebP. Se eliminó el PM01 (12,6 MB).
- **Draw calls:** las ~270 mallas de cada robot se fusionan por zona, lado y material. Se pasa de ~1.400 a ~600 llamadas por frame.
- **Carga:** el modelo base se precarga y los diseños se cargan en paralelo. La API de YouTube solo se carga al entrar a un capítulo.
- **Media:** el vídeo del despiece pasa de 4,5 MB a 0,76 MB y solo se descarga al verse. Los renders van en WebP, un 55 % más ligeros, con miniaturas para la galería. El audio va a 128 kbps.
- **Fuentes:** autoalojadas, solo el subconjunto latino y solo los pesos que se usan. Antes eran 9 familias de Google Fonts.
- **Render:** DPR adaptativo según los fps y bloom a media resolución. La sombra se recalcula cada 2 frames. No se dibuja el 3D cuando algo opaco lo tapa (cierre, visor de imágenes, scroll de La piel). El robot que está fuera de escena no se dibuja.
- **Accesibilidad:** foco visible, `aria-*` en controles y diálogos, y `prefers-reduced-motion`.

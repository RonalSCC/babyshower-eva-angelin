# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Página de una sola vista (mobile-first, máx. 440px) para el baby shower de Eva Angelin: hero, cuenta regresiva, fecha/lugar (domingo 8 nov 2026, 2:00 PM, Bosques de Kennedy, Bogotá), links a Google Calendar / Maps / Waze y formulario RSVP.

No hay build, package.json ni tests; se publica en GitHub Pages con `git push` a `main`. Para verla en local: `npx -y http-server -p 8001 -c-1` en la raíz y abrir `http://localhost:8001`.

## Arquitectura

- `index.html` es un documento exportado de Claude Design en formato **dc-runtime**:
  - `<x-dc>` contiene la plantilla HTML con estilos inline y huecos `{{ variable }}`.
  - `<helmet>` contiene lo que va al `<head>` (fuentes de Google, keyframes).
  - Un `<script data-dc-script>` al final define `class Component extends DCLogic`. Su `renderVals()` devuelve el objeto que llena los `{{ }}` de la plantilla (valores, estilos, handlers como `submit`, `setYes`, `inc`). Para cambiar algo dinámico se edita `renderVals()`; para cambiar markup o estilos, la plantilla.
- `support.js` es el runtime **generado** (`dc-runtime`, "do not edit"). Carga React 18.3.1 UMD desde CDN, parsea `<x-dc>` y monta el componente. No se modifica.
- `assets/` tiene las imágenes (`angel-bebe.jpeg`, `angel-baile.jpeg`).

## RSVP (estado actual)

Las constantes están al inicio del script: `KEY = 'babyshower-rsvp-v1'`, `TARGET` (fecha de la cuenta regresiva) y `ADDR`. Las fechas de Calendar y las coordenadas de Maps/Waze están escritas directamente en `renderVals()`; si cambia el evento, hay que actualizarlas junto con `TARGET`.

La respuesta (`{ id, name, attending: 'yes'|'no', guests: 0..5, at }`) se guarda en `localStorage` y, si `RSVP_URL` tiene valor, también se envía por POST a un Web App de Google Apps Script (`apps-script.gs`, que vive pegado en la hoja de Google, no se despliega con el sitio). El `id` (UUID que se genera en el primer envío) es la llave: cuando alguien cambia su respuesta, el script sobrescribe su fila en vez de agregar otra. El POST va como `text/plain` a propósito, para que el navegador no haga preflight CORS. Si el envío falla, la respuesta no queda como guardada y se muestra `errors.send`.

Hosting: GitHub Pages, publicando desde la rama `main` en la raíz.

## Portada y música

Al cargar se muestra una portada a pantalla completa (`intro: 'open'`). El toque en "Abrir invitación" es la interacción que el navegador exige para reproducir audio con sonido; el scroll no cuenta. La portada y el botón de música están **fuera de `<main>`** a propósito: `<main>` se anima con `transform` (`pageIn`), y eso rompería su `position:fixed`. `assets/cancion.mp3` ya viene editada con ffmpeg desde el original: recortada desde el 0:10 (`-ss 10`, porque saltar con `currentTime` fallaba en Safari de iOS) y con el volumen bajado -19 dB (iOS ignora `audio.volume`). Suena una sola vez, sin `loop`.

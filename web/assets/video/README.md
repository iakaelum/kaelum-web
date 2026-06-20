# Vídeo de presentación del hero

Coloca aquí el vídeo final con este nombre exacto:

    kaelum-intro.mp4

Lo reproduce el hero de la Home (`/web/index.html`) desde:

    <video> → <source src="/assets/video/kaelum-intro.mp4" type="video/mp4">

Recomendaciones:
- Formato MP4 (H.264 + AAC), proporción 16:9, peso < 8 MB.
- Sin audio imprescindible (arranca en muted/autoplay; hay botón de play de respaldo).
- Opcional: añade también `kaelum-intro.webm` y un segundo <source> en el HTML.
- Si quieres un póster propio, sustituye `/assets/img/video-poster.svg`.

Mientras no exista el archivo, el hero muestra el póster con el botón de play
(no da error: el contenedor `.video-frame` enseña `.video-poster`).

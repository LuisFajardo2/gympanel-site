# GymPanel Site

Sitio público informativo de GymPanel, publicado mediante GitHub Pages en `info.gympanel.xyz`.

## Desarrollo local

El sitio es HTML, CSS y JavaScript estático. Puede abrirse con cualquier servidor HTTP local.

## Validación

Con Node.js 18 o posterior, ejecutar `node --test tests/site.test.mjs`. Las pruebas no envían mensajes: comprueban enlaces, recursos, precios, límites, condiciones promocionales y navegación por teclado. Complementar con una revisión visual de móvil, escritorio y zoom.

## Publicación

GitHub Pages publica el contenido de la rama `main`. El dominio personalizado se declara en `CNAME`.

// Genera las versiones de un solo archivo (CSS y JS en línea). Uso: node build.js
//  - compartir.html  → para publicar como Artifact (el visor pone <html>/<head>/<body>)
//  - 4patitas-movil.html → documento completo para abrir en el celular o subir a cualquier hosting
// Ambas usan OpenStreetMap; si las teselas no cargan, muestran el mapa dibujado de anillos.
const fs = require('fs'), path = require('path');
const r = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const LOGO_URI = 'data:image/svg+xml;base64,' + Buffer.from(r('media/logo.svg')).toString('base64');

const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>4 Patitas</title>
<meta name="description" content="La red de vecinos que cuida a las mascotas de Santa Cruz de la Sierra.">
<meta name="theme-color" content="#FFE935">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="icon" type="image/svg+xml" href="${LOGO_URI}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800&family=Yusei+Magic&display=swap" rel="stylesheet">
<style>
${r('vendor/leaflet.min.css')}
${r('css/styles.css')}
</style>`;

// online: incluye Supabase + config (base de datos compartida). El Artifact no puede conectarse
// a servidores externos, así que su versión queda en modo local.
const makeBody = online => `<div id="app"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/3.5.13/vue.global.prod.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
${online ? `<script>
${r('vendor/supabase.min.js')}
</script>
<script>
${r('js/config.js')}
</script>` : ''}
<script>
${r('js/data.js')}
</script>
<script>
${r('js/api.js')}
</script>
<script>
${r('js/app.js')}
</script>`;
// El visor de claude.ai bloquea imágenes externas (teselas): ahí se usa directo el mapa dibujado
const body = `<script>window.HUELLAS_VECTOR_MAP = true;</script>\n${makeBody(false)}`;

// Para la versión de un solo archivo se incrustan las fotos y los videos cortos como data URIs,
// así se ve completa aunque se mande sola por WhatsApp (sin la carpeta media/).
const TYPES = { '.jpg': 'image/jpeg', '.avif': 'image/avif', '.mp4': 'video/mp4', '.svg': 'image/svg+xml' };
const embed = ['media/logo.svg', 'media/logo-escena.svg', 'media/img2.avif', 'media/v1.mp4', 'media/v2.mp4', 'media/v4.mp4',
  ...fs.readdirSync(path.join(__dirname, 'media/pets')).filter(f => f.endsWith('.jpg')).map(f => 'media/pets/' + f)];
const media = Object.fromEntries(embed.map(p => [p, `data:${TYPES[path.extname(p)]};base64,` + fs.readFileSync(path.join(__dirname, p)).toString('base64')]));
const liteBody = `<script>window.HUELLAS_LITE = true; window.HUELLAS_MEDIA = ${JSON.stringify(media)};</script>\n${makeBody(true)}`;

const out = {
  'compartir.html': `${head}\n${body}\n`,
  '4patitas-movil.html': `<!doctype html>\n<html lang="es">\n<head>\n${head}\n</head>\n<body>\n${liteBody}\n</body>\n</html>\n`,
};
for (const [name, html] of Object.entries(out)) {
  fs.writeFileSync(path.join(__dirname, name), html);
  console.log(name, (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB');
}

# 4 Patitas

**Web en vivo:** https://azzaccell.github.io/4patitas/

Red social de mascotas de Santa Cruz de la Sierra: mapa en vivo de mascotas perdidas, avistadas y rescatadas, perfiles de mascotas y una comunidad.

## Cómo correrla

```bash
node server.js
```

Abre http://localhost:5210. No hay que compilar nada ni correr `npm install`.

## Versión para compartir y para celular

```bash
node build.js
```

Genera dos archivos que llevan el CSS y el JS dentro:

- `4patitas-movil.html`: documento completo con el mapa de OpenStreetMap. Lo empaqueta `4patitas-movil.zip`, como `index.html` más la carpeta `media/`, listo para subir a cualquier hosting.
- `compartir.html`: versión publicada en https://claude.ai/artifact/7pvxrQH86sxVVW6qux9Fok. Ese visor no permite cargar teselas externas ni conectarse a la base de datos, así que usa el mapa dibujado de Santa Cruz y datos de ejemplo.

La web y `4patitas-movil.html` usan OpenStreetMap; si las teselas no cargan, muestran el mapa dibujado de Santa Cruz (anillos, radiales y río Piraí). Para revisar ese mapa dibujado en cualquier versión, agrega `?mapa=dibujo` a la dirección.
Cada vez que cambies algo en `css/` o `js/`, vuelve a correr `node build.js`.

## Base de datos compartida (Supabase)

Sin configurar, cada visitante ve solo sus propios datos. Con Supabase, todos ven las mismas alertas en tiempo real.

1. Crea un proyecto gratis en https://supabase.com, con la región **South America (São Paulo)**.
2. En **SQL Editor** pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y presiona **Run**. Eso crea las tablas, las reglas de seguridad, el espacio para fotos, el tiempo real y los datos de ejemplo.
3. En **Authentication → Sign In / Providers**, activa **Allow anonymous sign-ins**. Así cada visitante recibe una sesión anónima y solo puede editar o borrar lo que publicó.
4. En **Project Settings → API**, copia la **Project URL** y la **anon / publishable key** a [`js/config.js`](js/config.js).
5. Ejecuta `node build.js` y luego haz `git push`.

Las reglas de seguridad (Row Level Security) se definen en `schema.sql`:

- Todos pueden leer.
- Para escribir hace falta una sesión.
- Cada quien edita y borra solo lo suyo.
- Los "me gusta" y los seguidores pasan por funciones que solo suman o restan 1.
- Las fotos se suben a la carpeta de cada usuario, con un máximo de 2 MB.

## Diseño

Referencia general: la app japonesa Dokonoko (amarillo de marca, tinta negra plana, mucho blanco, fotos redondas, mosaico de fotos y afiches de "se busca").

- **Logo:** `media/logo.svg`, la gata calicó y el perro blanco de la ilustración original (`media/ilustracion.jpg`), redibujados como figuras planas recortadas, con sombreros de paja y pañuelos verdes. `media/logo-escena.svg` es la misma escena sin fondo, para la portada.
- **Paleta:** amarillo `#FFE935`, amarillo afiche `#FFF700`, tinta `#1C1B19`, blanco, gris suave `#F6F5F1`, celeste `#A8DCF3` y los estados (rojo, naranja, celeste y verde).
- **Tipografía:** M PLUS Rounded 1c para todo el texto y Yusei Magic para los toques a mano.
- **Piezas:** barra superior amarilla, barra inferior blanca con íconos grises en el celular, plaza en mosaico, alertas como afiche amarillo y pines del mapa con la foto de la mascota.

## Stack

- **Vue 3**: componentes reactivos y router por hash
- **GSAP + ScrollTrigger**: animaciones con el scroll, transiciones de página y scroll horizontal fijado
- **Lenis**: scroll suave
- **Leaflet + OpenStreetMap**: mapa gratis, sin API key

Todo se carga desde CDN, y el código propio pesa unos 100 KB sin comprimir.
Los datos se guardan en `localStorage`, que funciona como base de datos de demo.

## Estructura

- `index.html`: shell
- `css/styles.css`: diseño (tokens, responsive y barra inferior en celular)
- `js/data.js`: datos semilla de Santa Cruz, store, cálculo de coincidencias y distancias
- `js/app.js`: páginas (Inicio, Mapa, Publicar, Comunidad, Perfil, Registrar) y animaciones
- `media/`: videos e imágenes

# VodaControl — Landing para producción

Pack listo para subir a cualquier hosting estático.

## Estructura

```
deploy/
├── index.html          ← landing principal (autocontenido, ~1.8 MB)
├── brand/              ← favicons + isotipo
│   ├── isotipo.svg
│   ├── icon_16.png
│   ├── icon_32.png
│   ├── icon_180.png    (apple-touch-icon)
│   ├── icon_192.png
│   └── icon_512.png
└── README.md
```

## Despliegue rápido

### Opción 1 — Vercel / Netlify / Cloudflare Pages (recomendado)

1. Crea cuenta gratis en [vercel.com](https://vercel.com), [netlify.com](https://netlify.com) o [pages.cloudflare.com](https://pages.cloudflare.com).
2. Arrastra la carpeta `deploy/` a la zona de "Deploy".
3. Listo — tendrás URL pública en ~30 segundos.
4. Conecta tu dominio (`vodacontrol.es` o el que sea) desde el panel.

### Opción 2 — Cualquier hosting clásico (cPanel, FTP, etc.)

Sube el contenido de `deploy/` a la raíz pública (`public_html/`, `www/`, etc.). El `index.html` se servirá automáticamente.

### Opción 3 — Local (preview)

Abre `deploy/index.html` en el navegador. Funciona sin servidor.

---

## Conectar el formulario de contacto

El `<form>` actual es solo UI — no envía datos. Para conectarlo:

### A — Formspree (más rápido, sin código backend)

1. Crea cuenta en [formspree.io](https://formspree.io) → New form → copia el endpoint (`https://formspree.io/f/xxxxxxxx`).
2. Edita `index.html` y busca `<form` (Ctrl+F). Cambia:
   ```html
   <form>
   ```
   por:
   ```html
   <form action="https://formspree.io/f/TU_ID_AQUI" method="POST">
   ```
3. Asegúrate que cada `<input>` tenga `name="..."`:
   - `name="nombre"`, `name="empresa"`, `name="email"`, `name="telefono"`, `name="comerciales"`

### B — HubSpot / Pipedrive / CRM con webhook

Cambia el `action` por la URL del webhook de tu CRM. Mismo `method="POST"`.

### C — Backend propio

Endpoint que reciba `application/x-www-form-urlencoded` con los campos arriba.

---

## SEO + Analytics

### Google Analytics / GA4

Añade antes del `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Meta Pixel / LinkedIn Insight Tag

Pegar antes del `</head>` el snippet que te da cada plataforma.

---

## Variantes A/B

Tienes 3 versiones del mensaje principal para testear:

- **Información** → "Tu negocio en tiempo real, sin un equipo detrás"
- **Control** → "Cada comercial, cada cliente, bajo control"
- **Crecimiento** (actual) → "Decisiones con datos en vivo, no con intuición"

Para cambiar la versión activa, edita `index.html`, busca:
```js
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "hero": "growth",     ← cambia a "info" o "control"
  ...
}
```

O sube las 3 versiones a subdominios distintos (`info.vodacontrol.es`, `control.vodacontrol.es`, etc.) y haz split test con tu herramienta de A/B testing favorita.

---

## Datos de marca (para uso externo)

- **Color primario:** `#E60000` (rojo Vodafone)
- **Color tinta:** `#0A0A0A`
- **Tipografías:** Space Grotesk (display), Inter (body), JetBrains Mono (código)
- Todas cargadas desde Google Fonts (ya embebidas en el bundle)

---

## Soporte

Si necesitas modificar la landing y no quieres tocar HTML, vuelve al proyecto Claude original y pide los cambios — se re-bundlea en segundos.

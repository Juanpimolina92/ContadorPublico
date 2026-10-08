# Federico Molina · Contador público

Landing page estática en español con HTML, Sass, CSS compilado, Bootstrap y JavaScript. Diseño adaptable a celulares, tabletas y computadoras, con animaciones que respetan la preferencia de movimiento reducido.

La paleta usa el azul `#004066` de la captura proporcionada por el usuario, blanco y un azul auxiliar más oscuro `#071e2e`. Las variables de diseño están al inicio de `assets/scss/styles.scss`. Los servicios se verificaron en esa captura del perfil de Instagram. El texto de presentación es editorial y no agrega datos biográficos ni credenciales que no hayan sido proporcionados.

Servicios para empresas incluidos en la referencia: contabilidad general integral; liquidación de sueldos y cargas sociales; preparación y presentación de impuestos (IVA, IIBB y otros); gestión de libros contables obligatorios; asesoramiento en planificación fiscal y tributaria; regularización de deudas impositivas; y trámites ante organismos públicos.

## Ver la página

El CSS ya está compilado: podés abrir `index.html` directamente. Bootstrap está incluido en `assets/vendor/bootstrap/`. Las tipografías de Google Fonts requieren conexión a Internet; si no están disponibles, se usan las fuentes alternativas definidas en CSS.

Para trabajar con Sass y usar el servidor local, instalá Node.js 18 o superior y ejecutá:

```sh
npm install
npm run build
npm run dev
```

Abrí `http://127.0.0.1:4173`. Para recompilar Sass al editarlo, ejecutá `npm run watch:css` en otra terminal. El servidor local sirve los archivos sin exponer `.git`, archivos ocultos ni `node_modules`.

## Contacto

- Teléfono: 2645299575.
- Correo: federico.molina15@gmail.com.
- Instagram: https://www.instagram.com/federicomolina.contadorpublico/.
- WhatsApp: `https://wa.me/5492645299575`.

El formulario valida los datos y prepara una conversación de WhatsApp con el mensaje escrito. La persona lo revisa y lo envía desde WhatsApp. No hay backend, envío automático ni almacenamiento de consultas.

## Instagram integrado

La sección Instagram contiene una tarjeta permanente del perfil `federicomolina.contadorpublico` y enlaces directos. Al desplegar **Mostrar el perfil aquí**, se carga la integración con el script oficial de Instagram. La visualización depende de Instagram y de que la cuenta sea pública y permita inserciones. Si la plataforma bloquea la carga, quedan disponibles la tarjeta y el enlace al perfil. No requiere tokens ni contraseñas. No se pudo confirmar la visualización de publicaciones desde el entorno de desarrollo.

## Publicar en Vercel

Los archivos se entregan para que el usuario realice la publicación. No se ha subido ni desplegado el sitio.

La configuración ya está incluida en `vercel.json`. Al importar el proyecto en Vercel: **Framework Preset: Other**, **Build Command: `npm run build`** y **Output Directory: `dist`**. El directorio raíz es la carpeta que contiene `index.html` y `package.json`. El build compila Sass y copia únicamente el HTML y los recursos públicos a `dist/`. También podés publicar manualmente esa carpeta como sitio estático.

Antes de publicar, revisá el texto de presentación y comprobá los enlaces de contacto.

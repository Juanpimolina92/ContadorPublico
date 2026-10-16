# ContadorPublico
landing page para contador publico

# Federico Molina · Contador público

Landing page estática en español con HTML, Sass, CSS compilado, Bootstrap y JavaScript. Diseño adaptable a celulares, tabletas y computadoras, con animaciones que respetan la preferencia de movimiento reducido.

Incluye una sección de gestión para comercios, negocios de servicios y emprendimientos: ventas, productos, clientes, cobranzas, organización y planificación. En el encabezado figura **Subcoordinador @comisionjovenessj**, con enlace al perfil de Instagram indicado por el cliente.

## Dashboard de demostración

El panel de `#gestion` permite elegir entre **Comercio**, **Servicios** y **Emprendimiento**, y cambiar entre semana, mes y trimestre de ejemplo. Se actualizan ingresos, margen bruto estimado, cantidad de ventas o trabajos, ticket promedio, gráfico, distribución de ingresos y saldos por cobrar. Las sugerencias cambian con el tipo de negocio.

Todos los números son ficticios y están identificados como ejemplos. La suma del gráfico y de las líneas de ingresos coincide con el total del período; los saldos individuales suman el indicador de cobranzas. El margen se calcula sobre costos directos y no representa ganancia neta. Sin JavaScript permanece visible un ejemplo de comercio y se ocultan los filtros.

Esta web presenta una propuesta comercial y una demo. El panel no tiene usuarios, base de datos, carga de ventas, gestión real de stock ni automatizaciones conectadas. Esas funciones requieren acordar el alcance y desarrollar el sistema definitivo. No se guardan datos ni se conectan cuentas externas. Los enlaces de WhatsApp preparan consultas que el visitante revisa y envía.

La lógica y los datos de ejemplo están en `assets/js/gestion.js`. Los estilos se editan en `assets/scss/styles.scss` y se compilan con `npm run build`.

La paleta usa el azul `#004066` de la captura proporcionada por el usuario, blanco y un azul auxiliar más oscuro `#071e2e`. Las variables de diseño están al inicio de `assets/scss/styles.scss`. Los servicios se verificaron en esa captura del perfil de Instagram. El texto de presentación es editorial y no agrega datos biográficos ni credenciales que no hayan sido proporcionados.

Servicios para empresas incluidos en la referencia: contabilidad general integral; liquidación de sueldos y cargas sociales; preparación y presentación de impuestos (IVA, IIBB y otros); gestión de libros contables obligatorios; asesoramiento en planificación fiscal y tributaria; regularización de deudas impositivas; y trámites ante organismos públicos.

## Ver la página

El CSS ya está compilado: podés abrir `index.html` directamente. Bootstrap está incluido en `assets/vendor/bootstrap/`. Las tipografías de Google se descargan al abrir la página si hay conexión; hay tipografías alternativas del sistema.



```sh
npm install
npm run build
npm run dev
```



## Contacto

- Teléfono: 2645299575.
- Correo: federico.molina15@gmail.com.
- Instagram: https://www.instagram.com/federicomolina.contadorpublico/.
- WhatsApp: `https://wa.me/5492645299575`.

El formulario valida los datos y prepara una conversación de WhatsApp con el mensaje escrito. La persona lo revisa y lo envía desde WhatsApp. No hay backend, envío automático ni almacenamiento de consultas.

## Instagram integrado

La sección Instagram contiene una tarjeta permanente del perfil `federicomolina.contadorpublico` y enlaces directos. Al desplegar **Mostrar el perfil aquí**, se carga la integración con el script oficial de Instagram. La visualización depende de Instagram y de que la cuenta sea pública y permita inserciones. Si la plataforma bloquea la carga, quedan disponibles la tarjeta y el enlace al perfil. No requiere tokens ni contraseñas. No se pudo confirmar la visualización de publicaciones desde el entorno de desarrollo.



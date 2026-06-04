# DOM en Línea — Proyecto reutilizable por municipio

## Estructura del proyecto

```
dom-municipio/
├── config.js        ← ✅ ÚNICO archivo que debes editar
├── index.html       ← No editar
├── script.js        ← No editar
├── chatbot.js       ← No editar
├── style.css        ← No editar
└── img/
    ├── logomuni.png       ← Reemplazar con el logo del municipio
    ├── hero.png           ← Reemplazar con foto del municipio
    ├── pasos.jpg          ← Opcional
    └── Doc/
        ├── cip_base.pdf   ← Formulario base del CIP (reemplazar)
        ├── cip.pdf
        ├── cup.pdf
        └── formulario.pdf
```

## Cómo adaptar a otro municipio

Solo edita `config.js`. Cambia:

| Sección | Qué editar |
|---|---|
| Identidad | Nombre municipio, región, logo |
| Contacto | Dirección, teléfono, email, horario |
| Hero | Título, subtítulo, descripción, imagen de fondo |
| Video | Activar/desactivar, ruta del video |
| Certificados | Agregar/quitar/editar certificados y documentos requeridos |
| FAQ | Agregar/quitar preguntas frecuentes |
| Recursos | Mini-cards de documentos y links |
| Chatbot | Textos del asistente virtual |
| Mapa | Centro del mapa, zoom, viewbox de búsqueda |
| PDF | Ruta del formulario base y posiciones de texto |

## Variables disponibles en textos del chatbot

En los textos de `chatbot:` puedes usar:

- `{municipalidad}` → nombre corto del municipio
- `{direccion}` → dirección de la DOM
- `{telefono}` → teléfono de contacto
- `{email}` → email de contacto
- `{horario}` → horario de atención

## Ejemplo: adaptar a San Fernando

```js
municipalidad:      "SAN FERNANDO",
municipalidadCorta: "San Fernando",
region:             "DEL LIBERTADOR GENERAL BERNARDO O'HIGGINS",
centroMapa:         [-34.585, -70.987],
comunaBusqueda:     "San Fernando",
contacto: {
  direccion: "Manuel Rodríguez #950",
  telefono:  "72-2710200",
  email:     "dom@sanfernando.cl",
  horario:   "Lunes a Viernes\n8:30 a 14:00 hrs",
  urlSitioMunicipal: "https://www.sanfernando.cl/"
}
```

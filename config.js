/*
╔══════════════════════════════════════════════════════════════════╗
║         ARCHIVO DE CONFIGURACIÓN MUNICIPAL — DOM EN LÍNEA        ║
║                                                                  ║
║  ✅ Este es el ÚNICO archivo que debe editar para adaptar        ║
║     el sitio a otro municipio.                                   ║
║                                                                  ║
║  ❌ No modifique index.html, script.js, chatbot.js ni style.css  ║
╚══════════════════════════════════════════════════════════════════╝
*/

window.DOM_CONFIG = {

  /* ============================================================
     1. IDENTIDAD DEL MUNICIPIO
     ============================================================ */

  municipalidad:          "DOÑIHUE",
  municipalidadCorta:     "Doñihue",      // usado en chatbot y textos breves
  region:                 "DEL LIBERTADOR GENERAL BERNARDO O'HIGGINS",
  regionCorta:            "O'Higgins",    // usado en textos breves

  // Logo en el header. Ruta relativa a index.html o URL absoluta.
  // Dejar "" si no hay logo → se mostrará solo el nombre del municipio.
  logoUrl:                "./img/logomuni.png",
  logoAlt:                "Municipalidad de Doñihue",

  // Título en la pestaña del navegador
  tituloPagina:           "DOM en Línea | Municipalidad de Doñihue",


  /* ============================================================
     2. CONTACTO Y DATOS DE LA DOM
     ============================================================ */

  contacto: {
    direccion:        "Av. Estación #344",
    telefono:         "72-2959202",
    email:            "dom@mdonihue.cl",   // dejar "" para no mostrar
    horario:          "Lunes a Viernes\n8:30 a 14:00 hrs",
    urlSitioMunicipal:"https://mdonihue.cl/"
  },


  /* ============================================================
     3. TEXTOS DE LA PORTADA (hero)
     ============================================================ */

  hero: {
    eyebrow:     "Dirección de Obras Municipales Doñihue",
    titulo:      "DOM en Línea",
    subtitulo:   "Trámites más simples, rápidos y seguros",
    descripcion: "DOM en Línea es la plataforma digital de la Dirección de Obras Municipales que permite a vecinos y contribuyentes gestionar certificados y trámites de manera rápida, segura y sin necesidad de acudir presencialmente.",
    imagenFondo: "./img/hero.png"
  },


  /* ============================================================
     4. VIDEO INFORMATIVO
     ============================================================ */

  video: {
    mostrar:     true,              // false para ocultar la sección completa
    archivo:     "./img/video/VideoDOM.mp4",
    titulo:      "Conoce DOM en Línea",
    descripcion: "Video informativo sobre la plataforma DOM en Línea y su funcionamiento, orientado a facilitar el acceso digital a trámites y certificados de la Dirección de Obras Municipales."
  },


  /* ============================================================
     5. CERTIFICADOS DISPONIBLES
     --------------------------------------------------------------
     Agregue, quite o edite certificados libremente.
     Cada uno puede tener su propio formulario PDF.
     ============================================================ */

  certificados: [
    {
      nombre:      "Certificado de Número",
      plazo:       "7 días hábiles",
      descripcion: "Acredita el número municipal asignado a una propiedad.",
      documentos:  ["Rol de avalúo", "Croquis de ubicación", "Dominio Vigente", "Copia Escritura"],
      formulario:  "./img/doc/formulario.pdf"
    },
    {
      nombre:      "Certificado de Informaciones Previas",
      plazo:       "7 días hábiles",
      descripcion: "Entrega información urbanística aplicable a un predio.",
      documentos:  ["Rol de avalúo", "Croquis", "Poder simple si corresponde", "Dominio Vigente", "Copia Escritura"],
      formulario:  "./img/doc/cip.pdf"
    },
    {
      nombre:      "Certificado de Afectación a Utilidad Pública",
      plazo:       "7 días hábiles",
      descripcion: "Certifica si una propiedad se encuentra afecta a utilidad pública según la planificación vigente.",
      documentos:  ["Rol de avalúo", "Croquis de ubicación", "Dominio Vigente", "Copia Escritura"],
      formulario:  "./img/doc/cup.pdf"
    },
    {
      nombre:      "Certificado de Vivienda Social",
      plazo:       "7 días hábiles",
      descripcion: "Permite acreditar antecedentes para fines asociados a vivienda social.",
      documentos:  ["Rol", "Antecedentes de la propiedad", "Dominio Vigente", "Copia Escritura"],
      formulario:  "./img/doc/formulario.pdf"
    },
    {
      nombre:      "Certificado de Zonificación",
      plazo:       "7 días hábiles",
      descripcion: "Informa la zonificación aplicable a un predio.",
      documentos:  ["Rol", "Dirección", "Croquis", "Dominio Vigente", "Copia Escritura"],
      formulario:  "./img/doc/formulario.pdf"
    },
    {
      nombre:      "Otro",
      plazo:       "Según revisión",
      descripcion: "Corresponde a solicitudes especiales no listadas explícitamente.",
      documentos:  ["Antecedentes según solicitud"],
      formulario:  "./img/doc/formulario.pdf"
    }
  ],


  /* ============================================================
     6. PREGUNTAS FRECUENTES (FAQ)
     --------------------------------------------------------------
     Agregue, quite o edite preguntas libremente.
     ============================================================ */

  faq: [
    {
      pregunta:  "¿Qué necesito para solicitar un certificado?",
      respuesta: "Normalmente se solicita rol de avalúo, dirección del predio, croquis de ubicación, Dominio Vigente, Copia Escritura y otros antecedentes según el certificado."
    },
    {
      pregunta:  "¿Los plazos son exactos?",
      respuesta: "No. Los plazos son referenciales y pueden variar según revisión municipal, complejidad del caso y cantidad de solicitudes."
    },
    {
      pregunta:  "¿Dónde ingreso el trámite?",
      respuesta: "El ingreso se realiza en la plataforma oficial DOM en Línea del MINVU."
    },
    {
      pregunta:  "¿Puedo revisar primero los requisitos?",
      respuesta: "Sí. Esta página está pensada justamente para orientar antes de entrar a la plataforma oficial."
    }
  ],


  /* ============================================================
     7. RECURSOS DE APOYO (mini-cards)
     --------------------------------------------------------------
     color: "purple" | "blue" | "orange" | "teal"
     externo: true abre en nueva pestaña
     ============================================================ */

  recursos: [
    {
      icono:      "📘",
      color:      "purple",
      titulo:     "Trípticos",
      descripcion:"Material informativo descargable sobre el proceso.",
      boton:      "Ver tríptico",
      url:        "./img/doc/Pasoapaso.pdf",
      externo:    true
    },
    {
      icono:      "📋",
      color:      "blue",
      titulo:     "Paso a paso",
      descripcion:"Guía simple para orientar al usuario antes de iniciar el trámite.",
      boton:      "Ver paso a paso",
      url:        "./img/pasos.jpg",
      externo:    false
    },
    {
      icono:      "📄",
      color:      "orange",
      titulo:     "Formatos",
      descripcion:"Formularios descargables según el trámite.",
      boton:      "Ver formularios",
      url:        "https://www.minvu.gob.cl/elementos-tecnicos/formularios/0-certificados-y-otros/",
      externo:    true
    },
    {
      icono:      "🔐",
      color:      "teal",
      titulo:     "Recupera Clave Única",
      descripcion:"Todos estos trámites se realizan con tu ClaveÚnica.",
      boton:      "Recuperar ClaveÚnica",
      url:        "https://claveunica.gob.cl/recuperar",
      externo:    true
    }
  ],


  /* ============================================================
     8. CHATBOT — textos personalizables
     --------------------------------------------------------------
     {municipalidad} se reemplaza automáticamente por municipalidadCorta.
     {direccion}, {telefono}, {email}, {horario} vienen del bloque contacto.
     ============================================================ */

  chatbot: {
    saludo:
      "¡Hola! 👋 Soy DOM tu asistente virtual de {municipalidad}.\n\n¿En qué puedo ayudarte hoy?",

    mensajeContacto:
      "📞 **Contacto DOM de {municipalidad}**\n\n📍 **Dirección:** {direccion}\n☎️ **Teléfono:** {telefono}\n✉️ **Email:** {email}\n\n⏰ **Horarios:**\n{horario}\n\n💡 Los trámites en línea puedes iniciarlos las 24 horas.",

    mensajeQueNecesito:
      "✅ **¿Qué necesito tener listo?**\n\n• Rol de avalúo (número SII del predio)\n• Dirección exacta\n• Croquis o ubicación en mapa\n• Dominio Vigente (Conservador de Bienes Raíces)\n• Copia de escritura\n• ClaveÚnica\n• Documentos digitalizados (PDF o imagen)\n\n💡 Si no recuerdas el Rol SII, búscalo en el sitio del SII con el RUT del propietario."
  },


  /* ============================================================
     9. URL DE LA PLATAFORMA OFICIAL
     ============================================================ */

  urlDomEnLinea: "https://domenlinea.minvu.cl/",


  /* ============================================================
     10. MAPA (Leaflet + Nominatim)
     ============================================================ */

  comunaBusqueda:          "Doñihue",
  regionBusqueda:          "Región del Libertador General Bernardo O'Higgins",
  paisBusqueda:            "Chile",
  codigoPais:              "cl",
  centroMapa:              [-34.233333, -70.966667],
  zoomInicial:             14,
  zoomBusqueda:            17,
  viewboxBusqueda:         "-71.0500,-34.1600,-70.8800,-34.3100",
  boundedBusqueda:         false,
  localidadPredeterminada: "Doñihue",
  zonaPredeterminada:      "",


  /* ============================================================
     11. PDF BASE (Certificado de Informaciones Previas)
     ============================================================ */

  rutasPdfCip: [
    "./img/doc/formulario.pdf"
  ],

  /*
    POSICIONES DE TEXTO EN EL PDF
    Si cambia el formulario base ajuste estos valores.
    Subir: +Y  |  Bajar: -Y  |  Derecha: +X  |  Izquierda: -X
  */
  posicionesPdf: {
    municipalidadSuperior:    { x: 270, y: 850, size: 9, bold: true,  max: 42 },
    regionSuperior:           { x: 212, y: 820, size: 7, bold: false, max: 60 },
    marcaUrbano:              { x: 240, y: 745, size: 13, bold: true, max: 1  },
    marcaRural:               { x: 380, y: 745, size: 13, bold: true, max: 1  },

    nombre:                   { x: 60,  y: 600, size: 8, bold: false, max: 55 },
    rut:                      { x: 338, y: 600, size: 8, bold: false, max: 20 },
    email:                    { x: 60,  y: 575, size: 8, bold: false, max: 35 },
    telefono:                 { x: 238, y: 575, size: 8, bold: false, max: 18 },

    calle:                    { x: 60,  y: 540, size: 8, bold: false, max: 55 },
    numero:                   { x: 356, y: 540, size: 8, bold: false, max: 12 },
    depto:                    { x: 420, y: 540, size: 8, bold: false, max: 12 },
    block:                    { x: 495, y: 540, size: 8, bold: false, max: 12 },
    manzana:                  { x: 35,  y: 515, size: 8, bold: false, max: 12 },
    lote:                     { x: 90, y: 515, size: 8, bold: false, max: 12 },
    localidad:                { x: 180, y: 515, size: 8, bold: false, max: 35 },
    planoLoteo:               { x: 412, y: 515, size: 8, bold: false, max: 18 },
    rolSii:                   { x: 512, y: 515, size: 8, bold: false, max: 18 },

    mapa:                     { x: 36,  y: 240, width: 522, height: 245 },
    coordenadas:              { x: 35,  y: 250, size: 8, bold: true,  max: 80 },

    municipalidadComprobante: { x: 256, y: 155, size: 9, bold: true,  max: 35 },
    calleComprobante:         { x: 200,  y: 50, size: 8, bold: false, max: 65 },
    numeroComprobante:        { x: 500, y: 50, size: 8, bold: false, max: 15 }
  }

}; /* fin window.DOM_CONFIG */

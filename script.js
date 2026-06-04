/* ================================================================
   script.js  —  DOM en Línea
   NO editar. Toda la configuración está en config.js
   ================================================================ */

/* ── helpers ── */
function cfg(clave, def) {
  return (window.DOM_CONFIG && Object.prototype.hasOwnProperty.call(window.DOM_CONFIG, clave))
    ? window.DOM_CONFIG[clave]
    : def;
}
function cfgPdf(clave, def) {
  const pos = cfg("posicionesPdf", {});
  return pos[clave] || def;
}
function cfgContacto(clave, def) {
  const c = cfg("contacto", {});
  return c[clave] !== undefined ? c[clave] : def;
}

/* ── aplicar config al DOM al cargar ── */
document.addEventListener("DOMContentLoaded", function () {

  /* título pestaña */
  const titulo = cfg("tituloPagina", "DOM en Línea");
  document.title = titulo;

  /* logo / nombre en header */
  const logoUrl = cfg("logoUrl", "");
  const logoEl  = document.getElementById("headerLogo");
  const nombreEl= document.getElementById("headerNombre");
  if (logoEl) {
    if (logoUrl) {
      logoEl.src = logoUrl;
      logoEl.alt = cfg("logoAlt", "Municipalidad");
      logoEl.style.display = "block";
      if (nombreEl) nombreEl.style.display = "none";
    } else {
      logoEl.style.display = "none";
      if (nombreEl) nombreEl.textContent = cfg("municipalidadCorta", cfg("municipalidad", "Municipalidad"));
    }
  }

  /* hero */
  const hero = cfg("hero", {});
  setText("heroEyebrow",    hero.eyebrow    || "");
  setText("heroTitulo",     hero.titulo     || "DOM en Línea");
  setText("heroSubtitulo",  hero.subtitulo  || "");
  setText("heroDescripcion",hero.descripcion|| "");
  const heroBg = document.querySelector(".hero");
  if (heroBg && hero.imagenFondo) {
    heroBg.style.backgroundImage =
      `linear-gradient(90deg,rgba(15,60,104,.85) 0%,rgba(15,60,104,.7) 40%,rgba(15,60,104,.4) 70%,rgba(15,60,104,.2) 100%),url("${hero.imagenFondo}")`;
  }

  /* video */
  const vid = cfg("video", { mostrar: true });
  const secVideo = document.getElementById("seccionVideo");
  if (secVideo) secVideo.style.display = vid.mostrar ? "" : "none";
  if (vid.mostrar) {
    const sourceEl = document.getElementById("videoSrc");
    const videoEl  = document.getElementById("videoEl");
    if (sourceEl && vid.archivo) {
      sourceEl.src = vid.archivo;
      /* Hay que llamar load() en el <video> para que el navegador
         recargue el nuevo src asignado por JavaScript */
      if (videoEl) videoEl.load();
    }
    setText("videoTitulo",     vid.titulo     || "");
    setText("videoDescripcion",vid.descripcion|| "");
  }

  /* footer */
  const footerMuni = cfg("municipalidadCorta", cfg("municipalidad", ""));
  setText("footerMunicipalidad", "Municipalidad de " + footerMuni);

  const footerDir = cfgContacto("direccion", "");
  const footerTel = cfgContacto("telefono",  "");
  const footerMail= cfgContacto("email",     "");

  const elDir  = document.getElementById("footerDireccion");
  const elTel  = document.getElementById("footerTelefono");
  const elMail = document.getElementById("footerEmail");

  if (elDir  && footerDir)  { elDir.innerHTML  = "📍 " + footerDir; }
  if (elTel  && footerTel)  { elTel.innerHTML  = "☎️ " + footerTel; }
  if (elMail && footerMail) {
    elMail.innerHTML = "✉️ <a href='mailto:" + footerMail + "' style='color:#fff'>" + footerMail + "</a>";
  }

  /* certificados (acordeón) */
  construirAcordeon();

  /* faq */
  construirFaq();

  /* recursos (mini-cards) */
  construirRecursos();

  /* mapa */
  iniciarMapaPredio();
  actualizarEstadoFlujo();

  /* rut */
  activarValidacionRut();
  activarOpcionSinNumero();
});

function setText(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

/* ── ACORDEÓN CERTIFICADOS ── */
function construirAcordeon() {
  const lista = cfg("certificados", []);
  const contenedor = document.getElementById("certificadosAccordion");
  if (!contenedor) return;
  contenedor.innerHTML = "";
  const urlDom = cfg("urlDomEnLinea", "https://domenlinea.minvu.cl/");

  lista.forEach(cert => {
    const item = document.createElement("div");
    item.className = "accordion-item";
    item.innerHTML = `
      <button class="accordion-header" type="button">
        <div class="accordion-title-wrap">
          <div class="accordion-badge">📄</div>
          <div>
            <h3 class="accordion-title">${cert.nombre}</h3>
            <p class="accordion-subtitle">Plazo referencial: ${cert.plazo}</p>
          </div>
        </div>
        <div class="accordion-arrow">⌄</div>
      </button>
      <div class="accordion-content">
        <div class="accordion-grid">
          <div class="info-box">
            <h4>Descripción</h4>
            <p>${cert.descripcion}</p>
          </div>
          <div class="info-box">
            <h4>Documentos requeridos</h4>
            <ul>${cert.documentos.map(d => `<li>${d}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="accordion-actions">
          ${cert.formulario ? `<a class="btn btn-outline" href="${cert.formulario}" target="_blank">Ver formulario</a>` : ""}
          <a class="btn btn-accent" href="${urlDom}" target="_blank">Ir a DOM en Línea</a>
        </div>
      </div>`;
    item.querySelector(".accordion-header").addEventListener("click", () => item.classList.toggle("active"));
    contenedor.appendChild(item);
  });
}

/* ── FAQ ── */
function construirFaq() {
  const lista = cfg("faq", []);
  const contenedor = document.getElementById("faqContenedor");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  lista.forEach(item => {
    const div = document.createElement("div");
    div.className = "faq-item";
    div.innerHTML = `
      <button class="faq-question">${item.pregunta}</button>
      <div class="faq-answer">${item.respuesta}</div>`;
    div.querySelector(".faq-question").addEventListener("click", () => div.classList.toggle("active"));
    contenedor.appendChild(div);
  });
}

/* ── RECURSOS (mini-cards) ── */
function construirRecursos() {
  const lista = cfg("recursos", []);
  const contenedor = document.getElementById("recursosContenedor");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  lista.forEach(r => {
    const target = r.externo ? 'target="_blank"' : "";
    const article = document.createElement("article");
    article.className = "mini-card";
    article.innerHTML = `
      <div class="mini-icon ${r.color}">${r.icono}</div>
      <h3>${r.titulo}</h3>
      <p>${r.descripcion}</p>
      <button class="mini-btn ${r.color}-btn">
        <a href="${r.url}" ${target}>${r.boton}</a>
      </button>`;
    contenedor.appendChild(article);
  });
}

/* ================================================================
   MAPA — Leaflet
   ================================================================ */
let mapaPredio, marcadorPredio;

function iniciarMapaPredio() {
  const contenedor = document.getElementById("mapaPredio");
  if (!contenedor) return;

  const centro = cfg("centroMapa", [-34.233333, -70.966667]);
  const zoom   = cfg("zoomInicial", 14);

  mapaPredio = L.map("mapaPredio").setView(centro, zoom);

  const mapaNormal = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 });
  const satelite   = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 });
  const etiquetas  = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, opacity: 0.7 });
  const grupoSat   = L.layerGroup([satelite, etiquetas]);

  grupoSat.addTo(mapaPredio);
  L.control.layers({ "Calles": mapaNormal, "Satélite": grupoSat }).addTo(mapaPredio);

  mapaPredio.on("click", async function (e) {
    actualizarUbicacionPredio(e.latlng.lat, e.latlng.lng, "Punto marcado en el mapa");
    await completarDireccionPorCoordenadas(e.latlng.lat, e.latlng.lng);
  });

  setTimeout(() => mapaPredio.invalidateSize(), 300);
}

function actualizarUbicacionPredio(lat, lng, texto) {
  const latInput  = document.getElementById("latitud");
  const lngInput  = document.getElementById("longitud");
  const coordText = document.getElementById("coordenadasTexto");
  const latF = Number(lat).toFixed(6);
  const lngF = Number(lng).toFixed(6);
  if (latInput)  latInput.value  = latF;
  if (lngInput)  lngInput.value  = lngF;
  if (coordText) coordText.textContent = `${texto} | Latitud: ${latF} - Longitud: ${lngF}`;

  if (marcadorPredio) {
    marcadorPredio.setLatLng([lat, lng]);
  } else {
    marcadorPredio = L.marker([lat, lng], { draggable: true }).addTo(mapaPredio);
    marcadorPredio.on("dragend", async function () {
      const p = marcadorPredio.getLatLng();
      actualizarUbicacionPredio(p.lat, p.lng, "Punto ajustado manualmente");
      await completarDireccionPorCoordenadas(p.lat, p.lng);
    });
  }
  marcadorPredio.bindPopup("Ubicación seleccionada para el croquis").openPopup();

  // Detectar zona urbana/rural con polígonos oficiales
  const zonaOficial = detectarZonaOficial(lat, lng);
  if (zonaOficial) {
    mostrarIndicadorZona(lat, lng, zonaOficial);
  }

  actualizarEstadoFlujo();
}

async function completarDireccionPorCoordenadas(lat, lng) {
  const params = new URLSearchParams({
    format: "jsonv2", lat: String(lat), lon: String(lng),
    addressdetails: "1", "accept-language": "es",
    countrycodes: cfg("codigoPais", "cl")
  });
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
    const d = await r.json();
    if (d && d.address) autocompletarDireccionFormulario(d.address, d.display_name || "");
  } catch (e) { console.warn("No se pudo autocompletar desde el mapa.", e); }
}

async function buscarDireccionEnMapa() {
  const input = document.getElementById("buscarDireccion");
  const dir   = input ? input.value.trim() : "";
  if (!dir) { alert("Ingrese una dirección o sector para buscar."); return; }

  const consulta = [dir, cfg("comunaBusqueda",""), cfg("regionBusqueda",""), cfg("paisBusqueda","Chile")].filter(Boolean).join(", ");
  const params   = new URLSearchParams({
    format: "jsonv2", limit: "1", addressdetails: "1", "accept-language": "es",
    q: consulta, countrycodes: cfg("codigoPais","cl")
  });
  const vb = cfg("viewboxBusqueda","");
  if (vb) { params.set("viewbox", vb); if (cfg("boundedBusqueda",false)) params.set("bounded","1"); }

  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
    const d = await r.json();
    if (!d || d.length === 0) { alert("No se encontró la dirección. Marque el punto manualmente."); return; }
    const res = d[0];
    mapaPredio.setView([parseFloat(res.lat), parseFloat(res.lon)], cfg("zoomBusqueda",17));
    actualizarUbicacionPredio(parseFloat(res.lat), parseFloat(res.lon), "Dirección encontrada");
    autocompletarDireccionFormulario(res.address || {}, dir);
  } catch (e) { alert("No se pudo buscar la dirección. Revise la conexión."); }
}

/* Autocompletar campos desde la dirección devuelta por Nominatim */
function autocompletarDireccionFormulario(address = {}, textoBusqueda = "") {
  const calle = limpiarCalle(address.road||address.pedestrian||address.residential||address.footway||address.path||address.neighbourhood||"");
  const numero = address.house_number || extraerNumeroDireccion(textoBusqueda);
  const localidad = address.city||address.town||address.village||address.hamlet||address.municipality||address.county||address.suburb||cfg("localidadPredeterminada","")||cfg("comunaBusqueda","");
  const zonaDetectada = (address.hamlet||address.farm||address.allotments) ? "rural" : (address.city||address.town||address.village||address.suburb||address.neighbourhood) ? "urbano" : "";

  const inputNumero = document.getElementById("numero");
  if (inputNumero) inputNumero.value = "";
  asignarValor("calle", calle, true);

  const checkSN = document.getElementById("sinNumero");
  if (checkSN && checkSN.checked) asignarValor("numero","S/N",true);
  else if (numero) asignarValor("numero", numero, true);

  asignarValor("localidad", localidad, true);

  const zona = document.getElementById("zona");
  if (zona && zonaDetectada)                   zona.value = zonaDetectada;
  else if (zona && cfg("zonaPredeterminada","") && !zona.value) zona.value = cfg("zonaPredeterminada","");

  actualizarEstadoFlujo();
}

/* ── flujo de pasos ── */
function hayUbicacionSeleccionada() {
  return Boolean(obtenerValor("latitud") && obtenerValor("longitud"));
}
function actualizarPaso(id, estado) {
  const p = document.getElementById(id);
  if (!p) return;
  p.classList.remove("activo","completado");
  if (estado) p.classList.add(estado);
}
function actualizarEstadoFlujo() {
  const hay = hayUbicacionSeleccionada();
  ["btnGuardarDatos","btnGenerarPdf","btnImprimirPdf"].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.disabled = !hay;
  });
  const est = document.getElementById("estadoUbicacion");
  if (est) {
    if (hay) {
      est.textContent = "Ubicación lista. Revise los datos y complete los datos personales.";
      est.classList.replace("pendiente","listo");
    } else {
      est.textContent = "Seleccione una ubicación para continuar con el formulario.";
      est.classList.replace("listo","pendiente");
    }
  }
  if (hay) { actualizarPaso("pasoUbicacion","completado"); actualizarPaso("pasoFormulario","activo"); actualizarPaso("pasoPdf",""); }
  else      { actualizarPaso("pasoUbicacion","activo");    actualizarPaso("pasoFormulario","");       actualizarPaso("pasoPdf",""); }
}
function irAlFormularioDespuesDeUbicacion() {
  if (!hayUbicacionSeleccionada()) { alert("Primero debe buscar una dirección o marcar el punto en el mapa."); return; }
  const f = document.getElementById("solicitudForm");
  if (f) f.scrollIntoView({ behavior:"smooth", block:"start" });
}

/* ── eventos mapa ── */
document.addEventListener("DOMContentLoaded", function () {
  const btnBuscar = document.getElementById("btnBuscarMapa");
  if (btnBuscar) btnBuscar.addEventListener("click", buscarDireccionEnMapa);
  const inputBuscar = document.getElementById("buscarDireccion");
  if (inputBuscar) inputBuscar.addEventListener("keydown", e => { if (e.key==="Enter"){e.preventDefault();buscarDireccionEnMapa();} });

  const btnConf = document.getElementById("btnConfirmarUbicacion");
  if (btnConf) btnConf.addEventListener("click", irAlFormularioDespuesDeUbicacion);

  const btnGuardar = document.getElementById("btnGuardarDatos");
  if (btnGuardar) btnGuardar.addEventListener("click", function () {
    if (!validarFormularioCip()) return;
    actualizarPaso("pasoFormulario","completado");
    actualizarPaso("pasoPdf","activo");
    alert("Datos preparados. Ahora puede descargar o imprimir el formulario PDF.");
  });

  const btnPdf = document.getElementById("btnGenerarPdf");
  if (btnPdf) btnPdf.addEventListener("click", () => generarPdfCip(false));
  const btnImp = document.getElementById("btnImprimirPdf");
  if (btnImp) btnImp.addEventListener("click", () => generarPdfCip(true));
});

/* ================================================================
   GENERACIÓN PDF
   ================================================================ */
function obtenerValor(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}
function asignarValor(id, valor, sobrescribir=true) {
  const el = document.getElementById(id);
  if (!el || valor===undefined||valor===null||String(valor).trim()==="") return;
  if (sobrescribir||!el.value.trim()) el.value = String(valor).trim();
}
function extraerNumeroDireccion(texto) {
  if (!texto) return "";
  const m = String(texto).match(/\b\d{1,6}[A-Za-z]?\b/);
  return m ? m[0] : "";
}
function limpiarCalle(c) {
  return String(c||"").replace(/\s+/g," ").trim();
}

async function cargarPdfBaseCip() {
  const rutas = cfg("rutasPdfCip",["./img/Doc/cip_base.pdf"]);
  for (const ruta of rutas) {
    try {
      const r = await fetch(ruta);
      if (r.ok) return await r.arrayBuffer();
    } catch(e) { console.warn("No se cargó PDF en:",ruta); }
  }
  throw new Error("No se encontró el PDF base CIP.");
}

async function capturarMapaParaPdf() {
  if (mapaPredio) mapaPredio.invalidateSize();
  const canvas = await html2canvas(document.getElementById("mapaPredio"),{ useCORS:true,backgroundColor:"#fff",scale:2 });
  return canvas.toDataURL("image/png");
}

function cortarTexto(t,max) { return String(t||"").length>max ? String(t).substring(0,max) : String(t||""); }

/* ================================================================
   MAPA DE CHECKBOXES — posiciones en el formulario PDF
   Coordenadas medidas con pdfplumber sobre formulario.pdf
   ================================================================ */
const CHECKBOXES_PDF = {
  NUMERO:               { x: 56,  y: 759 },
  RURALIDAD:            { x: 56,  y: 738 },
  URBANIZACION:         { x: 56,  y: 719 },
  AFECTACION:           { x: 56,  y: 698 },
  OTROS:                { x: 56,  y: 677 },
  INFORMACIONES_PREVIAS:{ x: 353, y: 758 },
  VIVIENDA_SOCIAL:      { x: 353, y: 737 },
  LOCALIZACION:         { x: 353, y: 718 },
  ZONIFICACION:         { x: 353, y: 697 },
  URBANO:               { x: 168, y: 652 },
  RURAL:                { x: 266, y: 652 }
};

async function generarPdfCip(imprimir=false) {
  if (!validarFormularioCip()) return;
  actualizarPaso("pasoFormulario","completado");
  actualizarPaso("pasoPdf","activo");
  try {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc  = await PDFDocument.load(await cargarPdfBaseCip());
    const pagina  = pdfDoc.getPages()[0];
    const font    = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontB   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const negro   = rgb(0,0,0);

    function escribir(texto,x,y,size=8,bold=false) {
      if (!texto) return;
      pagina.drawText(String(texto),{x,y,size,font:bold?fontB:font,color:negro});
    }
    function escribirPos(texto,pos) {
      if (!pos) return;
      escribir(cortarTexto(String(texto||"").toUpperCase(),pos.max||60),pos.x,pos.y,pos.size||8,pos.bold||false);
    }
    function campo(clave,texto,def,upper=true) {
      const pos = cfgPdf(clave,def);
      const val = upper ? String(texto||"").toUpperCase() : String(texto||"");
      escribirPos(val,pos);
    }
    function marcarCheck(clave) {
      const pos = CHECKBOXES_PDF[clave];
      if (pos) escribir("X", pos.x, pos.y, 10, true);
    }

    const muni = cfg("municipalidad","");
    const reg  = cfg("region","");
    const zona = obtenerValor("zona");

    // Municipalidad y región en encabezado
    escribirPos(muni, cfgPdf("municipalidadSuperior",{x:220,y:893,size:9,bold:true,max:42}));
    escribirPos(reg,  cfgPdf("regionSuperior",       {x:220,y:820,size:8,bold:false,max:60}));

    // Tipo de certificado seleccionado
    const tipoCert = obtenerValor("tipoCertificado");
    if (tipoCert && CHECKBOXES_PDF[tipoCert]) marcarCheck(tipoCert);

    // Urbano / Rural
    if (zona==="urbano") marcarCheck("URBANO");
    if (zona==="rural")  marcarCheck("RURAL");

    campo("nombre",  obtenerValor("nombre"),  {x:60, y:675,size:8,bold:false,max:55});
    campo("rut",     obtenerValor("rut"),     {x:338,y:675,size:8,bold:false,max:20});
    campo("email",   obtenerValor("email"),   {x:60, y:655,size:8,bold:false,max:35},false);
    campo("telefono",obtenerValor("telefono"),{x:238,y:655,size:8,bold:false,max:18},false);
    campo("calle",   obtenerValor("calle"),   {x:60, y:620,size:8,bold:false,max:55});
    campo("numero",  obtenerValor("numero"),  {x:356,y:620,size:8,bold:false,max:12});
    campo("depto",   obtenerValor("depto"),   {x:432,y:620,size:8,bold:false,max:12});
    campo("block",   obtenerValor("block"),   {x:512,y:620,size:8,bold:false,max:12});
    campo("manzana", obtenerValor("manzana"), {x:60, y:595,size:8,bold:false,max:12});
    campo("lote",    obtenerValor("lote"),    {x:120,y:595,size:8,bold:false,max:12});
    campo("localidad",obtenerValor("localidad"),{x:180,y:595,size:8,bold:false,max:35});
    campo("planoLoteo",obtenerValor("planoLoteo"),{x:412,y:595,size:8,bold:false,max:18});
    campo("rolSii",  obtenerValor("rolSii"),  {x:512,y:595,size:8,bold:false,max:18});

    const imgBase64 = await capturarMapaParaPdf();
    const imgPng    = await pdfDoc.embedPng(imgBase64);
    const posMapa   = cfgPdf("mapa",{x:55,y:305,width:529,height:259});
    pagina.drawImage(imgPng,{x:posMapa.x,y:posMapa.y,width:posMapa.width,height:posMapa.height});

    const posCoord = cfgPdf("coordenadas",{x:65,y:312,size:8,bold:true,max:80});
    escribir(`Latitud: ${obtenerValor("latitud")}    Longitud: ${obtenerValor("longitud")}`,posCoord.x,posCoord.y,posCoord.size||8,posCoord.bold!==false);

    escribirPos(muni, cfgPdf("municipalidadComprobante",{x:255,y:190,size:9,bold:true,max:35}));
    campo("calleComprobante", obtenerValor("calle"),  {x:60, y:116,size:8,bold:false,max:65});
    campo("numeroComprobante",obtenerValor("numero"), {x:500,y:116,size:8,bold:false,max:15});

    const blob = new Blob([await pdfDoc.save()],{type:"application/pdf"});
    const url  = URL.createObjectURL(blob);
    if (imprimir) { const w=window.open(url,"_blank"); if(w) w.onload=()=>w.print(); }
    else { const a=document.createElement("a"); a.href=url; a.download=`formulario_cip_${Date.now()}.pdf`; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
  } catch(e) { console.error(e); alert("No se pudo generar el PDF. Revise las rutas del PDF base en config.js."); }
}

/* ================================================================
   VALIDACIÓN RUT CHILENO
   ================================================================ */
function limpiarRut(r) { return String(r||"").replace(/[^0-9kK]/g,"").toUpperCase(); }
function formatearRut(r) {
  const l=limpiarRut(r); if(l.length<2) return l;
  const c=l.slice(0,-1); const d=l.slice(-1);
  return `${c.replace(/\B(?=(\d{3})+(?!\d))/g,".")}-${d}`;
}
function calcularDV(cuerpo) {
  let s=0,m=2;
  for(let i=cuerpo.length-1;i>=0;i--){s+=Number(cuerpo[i])*m;m=m===7?2:m+1;}
  const r=11-(s%11); if(r===11)return"0"; if(r===10)return"K"; return String(r);
}
function validarRutChileno(rut) {
  const l=limpiarRut(rut); if(l.length<2) return false;
  const c=l.slice(0,-1); const d=l.slice(-1);
  if(!/^\d+$/.test(c)) return false;
  return calcularDV(c)===d;
}
function obtenerMensajeRut() {
  let m=document.getElementById("rutMensaje");
  const inp=document.getElementById("rut");
  if(!inp) return null;
  if(!m){m=document.createElement("small");m.id="rutMensaje";m.style.cssText="display:block;margin-top:6px;font-weight:700";inp.insertAdjacentElement("afterend",m);}
  return m;
}
function mostrarEstadoRut() {
  const inp=document.getElementById("rut"); const m=obtenerMensajeRut();
  if(!inp||!m) return true;
  const v=inp.value.trim(); if(!v){inp.style.borderColor="";inp.setCustomValidity("");m.textContent="";return false;}
  inp.value=formatearRut(v);
  if(validarRutChileno(inp.value)){inp.style.borderColor="#16a34a";inp.setCustomValidity("");m.textContent="RUT válido.";m.style.color="#0f6b45";return true;}
  inp.style.borderColor="#dc2626";inp.setCustomValidity("RUT inválido.");m.textContent="RUT inválido. Revise el número o dígito verificador.";m.style.color="#b91c1c";return false;
}
function activarValidacionRut() {
  const inp=document.getElementById("rut"); if(!inp) return;
  inp.setAttribute("maxlength","12"); inp.setAttribute("autocomplete","off");
  inp.addEventListener("input",function(){this.value=this.value.replace(/[^0-9kK.\-]/g,"").toUpperCase();const m=obtenerMensajeRut();if(m)m.textContent="";this.style.borderColor="";this.setCustomValidity("");});
  inp.addEventListener("blur",mostrarEstadoRut);
}

function validarFormularioCip() {
  const rutInput=document.getElementById("rut"); const checkSN=document.getElementById("sinNumero"); const numInput=document.getElementById("numero");
  if(rutInput) rutInput.value=formatearRut(rutInput.value);
  if(checkSN&&checkSN.checked&&numInput) numInput.value="S/N";
  const nombre=obtenerValor("nombre"),rut=obtenerValor("rut"),calle=obtenerValor("calle"),numero=obtenerValor("numero"),rolSii=obtenerValor("rolSii"),lat=obtenerValor("latitud"),lng=obtenerValor("longitud"),sinNum=checkSN?checkSN.checked:false;
  if(!nombre||!rut||!calle||(!numero&&!sinNum)||!rolSii){alert("Debe completar nombre, RUT, calle, número y Rol SII.");return false;}
  if(!validarRutChileno(rut)){alert("RUT inválido.");if(rutInput){mostrarEstadoRut();rutInput.focus();}return false;}
  if(!lat||!lng){alert("Debe seleccionar una ubicación en el mapa.");return false;}
  return true;
}

function activarOpcionSinNumero() {
  const inp=document.getElementById("numero"); const chk=document.getElementById("sinNumero");
  if(!inp||!chk) return;
  chk.addEventListener("change",function(){
    if(this.checked){inp.value="S/N";inp.readOnly=true;}
    else{if(inp.value.trim().toUpperCase()==="S/N")inp.value="";inp.readOnly=false;inp.focus();}
  });
}

/* ================================================================
   DETECCIÓN DE ZONA URBANA/RURAL — usando polígonos oficiales
   ================================================================ */

/**
 * Algoritmo Ray Casting — determina si un punto [lat,lng]
 * está dentro de un polígono.
 */
function puntoEnPoligono(lat, lng, poligono) {
  let dentro = false;
  const n = poligono.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poligono[i][1], yi = poligono[i][0];
    const xj = poligono[j][1], yj = poligono[j][0];
    const intersecta = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersecta) dentro = !dentro;
  }
  return dentro;
}

/**
 * Detecta si las coordenadas caen en zona urbana o rural
 * según los polígonos del Plan Regulador (zonas.js).
 * Retorna: "urbano" | "rural"
 */
function detectarZonaOficial(lat, lng) {
  if (!window.DOM_ZONAS || !window.DOM_ZONAS.zonasUrbanas) return null;

  for (const zona of window.DOM_ZONAS.zonasUrbanas) {
    if (zona.poligono && puntoEnPoligono(lat, lng, zona.poligono)) {
      return "urbano";
    }
  }
  return "rural";
}

/**
 * Muestra un indicador visual en el mapa con la zona detectada
 * y permite al usuario corregirla.
 */
function mostrarIndicadorZona(lat, lng, zonaDetectada) {
  // Eliminar indicador anterior si existe
  const anteriorPopup = document.getElementById("zonaIndicador");
  if (anteriorPopup) anteriorPopup.remove();

  const zonaSelect = document.getElementById("zona");
  if (!zonaSelect) return;

  // Asignar zona detectada
  zonaSelect.value = zonaDetectada;

  // Mostrar notificación visual sobre el mapa
  const contenedorMapa = document.getElementById("mapaPredio");
  if (!contenedorMapa) return;

  const indicador = document.createElement("div");
  indicador.id = "zonaIndicador";
  indicador.style.cssText = `
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: ${zonaDetectada === "urbano" ? "#0f3c68" : "#2d6a4f"};
    color: #fff;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  `;
  indicador.innerHTML = `
    <span>${zonaDetectada === "urbano" ? "🏙️ Zona Urbana detectada" : "🌿 Zona Rural detectada"}</span>
    <span style="opacity:.7;font-weight:400;font-size:.78rem">¿No es correcto?</span>
    <button onclick="corregirZona()" style="
      background:rgba(255,255,255,.2);
      border:1px solid rgba(255,255,255,.4);
      color:#fff;
      border-radius:10px;
      padding:3px 10px;
      font-size:.78rem;
      font-weight:700;
      cursor:pointer;
    ">Cambiar</button>
  `;

  // Posicionar relativo al contenedor del mapa
  contenedorMapa.style.position = "relative";
  contenedorMapa.appendChild(indicador);

  // Auto-ocultar después de 6 segundos
  setTimeout(() => {
    if (indicador.parentNode) {
      indicador.style.opacity = "0";
      indicador.style.transition = "opacity 0.5s";
      setTimeout(() => indicador.remove(), 500);
    }
  }, 6000);
}

/**
 * Permite al usuario corregir manualmente la zona
 * mostrando el selector de forma destacada.
 */
window.corregirZona = function () {
  const indicador = document.getElementById("zonaIndicador");
  if (indicador) indicador.remove();

  const zonaSelect = document.getElementById("zona");
  if (!zonaSelect) return;

  // Scroll al selector y destacarlo
  zonaSelect.scrollIntoView({ behavior: "smooth", block: "center" });
  zonaSelect.style.transition = "box-shadow 0.3s, border-color 0.3s";
  zonaSelect.style.borderColor = "#2f76ea";
  zonaSelect.style.boxShadow = "0 0 0 4px rgba(47,118,234,0.25)";

  setTimeout(() => {
    zonaSelect.style.borderColor = "";
    zonaSelect.style.boxShadow = "";
  }, 3000);

  zonaSelect.focus();
};

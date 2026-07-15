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

  /* modo tótem — fuentes grandes */
  const totem = cfg("modoTotem", {});
  if (totem.activo) {
    document.body.classList.add("modo-totem");
    const px = totem.fontBasePixels || 20;
    document.documentElement.style.setProperty("--totem-base", px + "px");
  }

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
  const heroBgImg = document.getElementById("heroBgImg");
  if (heroBgImg && hero.imagenFondo) heroBgImg.src = hero.imagenFondo;

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
  activarValidacionTelefono();
  activarValidacionNumero();
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
   MAPA — Leaflet + Leaflet.draw
   ================================================================ */
let mapaPredio, marcadorPredio;
let drawnItems, drawControl;
let miniMapa = null, miniMapaLayer = null;

function iniciarMapaPredio() {
  const contenedor = document.getElementById("mapaPredio");
  if (!contenedor) return;

  const centro = cfg("centroMapa", [-34.233333, -70.966667]);
  const zoom   = cfg("zoomInicial", 14);

  mapaPredio = L.map("mapaPredio", { zoomControl: true }).setView(centro, zoom);

  /* Satélite Google (mejor resolución para Chile) */
  L.tileLayer("https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
    subdomains: ["0","1","2","3"], maxNativeZoom: 21, maxZoom: 21,
    attribution: "Tiles &copy; Google"
  }).addTo(mapaPredio);

  /* Traducciones Leaflet.draw al español */
  L.drawLocal.draw.toolbar.buttons.polygon   = "Trazar polígono del predio";
  L.drawLocal.draw.toolbar.buttons.rectangle = "Trazar rectángulo del predio";
  L.drawLocal.draw.toolbar.actions.title     = "Cancelar trazado";
  L.drawLocal.draw.toolbar.actions.text      = "Cancelar";
  L.drawLocal.draw.toolbar.finish.title      = "Finalizar trazado";
  L.drawLocal.draw.toolbar.finish.text       = "Finalizar";
  L.drawLocal.draw.toolbar.undo.title        = "Eliminar último punto";
  L.drawLocal.draw.toolbar.undo.text         = "Deshacer";
  L.drawLocal.draw.handlers.polygon.tooltip  = { start:"Haga clic para comenzar", cont:"Haga clic para continuar", end:"Cierre el polígono en el primer punto" };
  L.drawLocal.draw.handlers.rectangle.tooltip = { start:"Haga clic y arrastre para trazar el rectángulo" };
  L.drawLocal.edit.toolbar.buttons.edit           = "Editar límites";
  L.drawLocal.edit.toolbar.buttons.editDisabled   = "Sin límites para editar";
  L.drawLocal.edit.toolbar.buttons.remove         = "Eliminar límites";
  L.drawLocal.edit.toolbar.buttons.removeDisabled = "Sin límites para eliminar";
  L.drawLocal.edit.toolbar.actions.save.text      = "Guardar";
  L.drawLocal.edit.toolbar.actions.cancel.text    = "Cancelar";
  L.drawLocal.edit.toolbar.actions.clearAll.text  = "Eliminar todo";
  L.drawLocal.edit.handlers.edit.tooltip = { text:"Arrastre los vértices para editar", subtext:"Haga clic en Cancelar para deshacer" };
  L.drawLocal.edit.handlers.remove.tooltip = { text:"Haga clic en el trazado para eliminarlo" };

  /* Capa para polígonos dibujados */
  drawnItems = new L.FeatureGroup();
  mapaPredio.addLayer(drawnItems);

  /* Control de dibujo */
  drawControl = new L.Control.Draw({
    position: "topleft",
    draw: {
      polygon:  { allowIntersection:false, showArea:true, shapeOptions:{ color:"#e63946", weight:2.5, fillColor:"#e63946", fillOpacity:0.12 } },
      rectangle:{ shapeOptions:{ color:"#e63946", weight:2.5, fillColor:"#e63946", fillOpacity:0.12 } },
      polyline:false, circle:false, circlemarker:false, marker:false
    },
    edit: { featureGroup:drawnItems, remove:true }
  });
  mapaPredio.addControl(drawControl);

  /* Botón mover mapa */
  const ControlMover = L.Control.extend({
    options: { position:"topleft" },
    onAdd: function () {
      const div = L.DomUtil.create("div","leaflet-bar leaflet-control");
      div.innerHTML = `<a class="leaflet-mover-btn" id="btnMoverMapa" href="#" title="Mover el mapa" role="button">✋</a>`;
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.on(div,"click",function(e){
        L.DomEvent.preventDefault(e);
        mapaPredio.fire("draw:drawstop");
        mapaPredio.getContainer().style.cursor = "grab";
        document.querySelectorAll(".leaflet-draw-toolbar a").forEach(a => a.classList.remove("leaflet-draw-toolbar-button-enabled"));
        document.getElementById("btnMoverMapa")?.classList.add("mover-activo");
      });
      return div;
    }
  });
  mapaPredio.addControl(new ControlMover());

  /* Eventos de dibujo */
  mapaPredio.on(L.Draw.Event.CREATED, async function (e) {
    drawnItems.clearLayers();
    drawnItems.addLayer(e.layer);
    guardarLimitesPropiedad();
    const centro = e.layer.getBounds().getCenter();
    actualizarUbicacionPredio(centro.lat, centro.lng, "Ubicación centrada en el dibujo");
    await completarDireccionPorCoordenadas(centro.lat, centro.lng);
  });
  mapaPredio.on(L.Draw.Event.EDITED, async function () {
    guardarLimitesPropiedad();
    if (drawnItems.getLayers().length > 0) {
      const centro = drawnItems.getLayers()[0].getBounds().getCenter();
      actualizarUbicacionPredio(centro.lat, centro.lng, "Ubicación actualizada al editar");
      await completarDireccionPorCoordenadas(centro.lat, centro.lng);
    }
  });
  mapaPredio.on(L.Draw.Event.DELETED, function () {
    const campo = document.getElementById("limitesPropiedad");
    if (campo) campo.value = "";
    actualizarInfoLimites(null);
  });
  mapaPredio.on(L.Draw.Event.DRAWSTART, function () {
    if (marcadorPredio && mapaPredio) { mapaPredio.removeLayer(marcadorPredio); marcadorPredio = null; }
    const inputBuscar = document.getElementById("buscarDireccion");
    if (inputBuscar) inputBuscar.value = "";
    ["calle","numero","localidad","latitud","longitud","limitesPropiedad"].forEach(function(id) {
      const el = document.getElementById(id); if (el) el.value = "";
    });
    const ct = document.getElementById("coordenadasTexto");
    if (ct) ct.textContent = "Aún no se ha seleccionado una ubicación.";
    actualizarInfoLimites(null);
  });

  /* Clic para marcar punto */
  mapaPredio.on("click", async function (e) {
    if (mapaPredio._drawingMode) return;
    if (drawnItems && drawnItems.getLayers().length > 0) {
      drawnItems.clearLayers();
      const campo = document.getElementById("limitesPropiedad"); if (campo) campo.value = "";
      actualizarInfoLimites(null);
    }
    actualizarUbicacionPredio(e.latlng.lat, e.latlng.lng, "Punto marcado en el mapa");
    await completarDireccionPorCoordenadas(e.latlng.lat, e.latlng.lng);
  });

  setTimeout(() => mapaPredio.invalidateSize(), 300);
}

function guardarLimitesPropiedad() {
  const campo = document.getElementById("limitesPropiedad");
  if (!campo || !drawnItems) return;
  const geojson = drawnItems.toGeoJSON();
  if (!geojson.features || geojson.features.length === 0) { campo.value = ""; actualizarInfoLimites(null); return; }
  campo.value = JSON.stringify(geojson);
  actualizarInfoLimites(geojson.features[0]);
}

function actualizarInfoLimites(feature) {
  const badge      = document.getElementById("limitesBadge");
  const texto      = document.getElementById("limitesTexto");
  const btnLimpiar = document.getElementById("btnLimpiarLimites");
  const wrap       = document.getElementById("limitesMiniMapaWrap");
  const sinDemar   = document.getElementById("limitesSinDemarcar");
  if (!badge) return;

  if (!feature) {
    badge.textContent = "Sin demarcar";
    badge.className   = "limites-badge sin-limites";
    if (wrap)      wrap.style.display      = "none";
    if (sinDemar)  sinDemar.style.display  = "block";
    if (texto)     texto.textContent       = "";
    if (btnLimpiar) btnLimpiar.style.display = "none";
    if (miniMapa) { miniMapa.remove(); miniMapa = null; miniMapaLayer = null; }
    return;
  }

  badge.textContent = "Demarcado ✓";
  badge.className   = "limites-badge con-limites";
  if (sinDemar)  sinDemar.style.display  = "none";
  if (wrap)      wrap.style.display      = "block";
  if (btnLimpiar) btnLimpiar.style.display = "inline-block";

  if (texto) {
    const coords = feature.geometry.coordinates[0];
    const n = feature.geometry.type === "Polygon" ? coords.length - 1 : coords.length;
    texto.textContent = `Figura demarcada con ${n} vértice${n !== 1 ? "s" : ""}. Se incluirá en el PDF.`;
  }

  setTimeout(() => {
    const contenedor = document.getElementById("limitesMiniMapa");
    if (!contenedor) return;
    if (!miniMapa) {
      miniMapa = L.map("limitesMiniMapa",{ zoomControl:false, dragging:false, scrollWheelZoom:false,
        doubleClickZoom:false, touchZoom:false, keyboard:false, attributionControl:false });
      L.tileLayer("https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        { subdomains:["0","1","2","3"], maxNativeZoom:21, maxZoom:21 }).addTo(miniMapa);
    }
    if (miniMapaLayer) { miniMapa.removeLayer(miniMapaLayer); miniMapaLayer = null; }
    miniMapaLayer = L.geoJSON(feature, { style:{ color:"#e63946", weight:2.5, fillColor:"#e63946", fillOpacity:0.15 } }).addTo(miniMapa);
    miniMapa.fitBounds(miniMapaLayer.getBounds(), { padding:[20,20] });
    miniMapa.invalidateSize();
  }, 150);
}

function decimalADMS(lat, lng) {
  function toDMS(decimal, esLat) {
    const abs = Math.abs(decimal);
    const g = Math.floor(abs);
    const minDec = (abs - g) * 60;
    const m = Math.floor(minDec);
    const s = ((minDec - m) * 60).toFixed(1);
    const h = esLat ? (decimal >= 0 ? "N" : "S") : (decimal >= 0 ? "E" : "W");
    return `${g}°${m}'${s}"${h}`;
  }
  return `${toDMS(lat, true)} ${toDMS(lng, false)}`;
}

function actualizarUbicacionPredio(lat, lng, texto) {
  const latInput  = document.getElementById("latitud");
  const lngInput  = document.getElementById("longitud");
  const coordText = document.getElementById("coordenadasTexto");
  const latF = Number(lat).toFixed(6);
  const lngF = Number(lng).toFixed(6);
  if (latInput)  latInput.value  = latF;
  if (lngInput)  lngInput.value  = lngF;
  if (coordText) coordText.textContent = `${texto} | ${decimalADMS(Number(lat), Number(lng))}`;

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

  /* Detección de zona con límite oficial — instantánea al marcar el punto */
  const zonaInmediata = puntoEnLimiteUrbano(lat, lng);
  if (zonaInmediata) {
    const zonaEl = document.getElementById("zona");
    if (zonaEl) zonaEl.value = zonaInmediata;
    mostrarIndicadorZona(zonaInmediata);
  }

  actualizarEstadoFlujo();
}

/* ================================================================
   DETECCIÓN DE ZONA POR LÍMITE URBANO OFICIAL (MINVU 2013)
   Algoritmo ray-casting sobre window.DOM_LIMITES_URBANOS.
   Retorna "urbano" | "rural" | null (si no hay polígono cargado).
   ================================================================ */
function puntoEnLimiteUrbano(lat, lng) {
  const limites = window.DOM_LIMITES_URBANOS;
  if (!limites || !limites.coordinates || !limites.coordinates[0]) return null;
  const poly = limites.coordinates[0]; // pares [lng, lat] en GeoJSON
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      dentro = !dentro;
    }
  }
  return dentro ? "urbano" : "rural";
}

async function completarDireccionPorCoordenadas(lat, lng) {
  /* Zona ya fue establecida síncronamente en actualizarUbicacionPredio.
     Aquí solo se obtiene para pasarla a autocompletarDireccionFormulario. */
  const zonaPoligono = puntoEnLimiteUrbano(lat, lng);

  const params = new URLSearchParams({
    format: "jsonv2", lat: String(lat), lon: String(lng),
    addressdetails: "1", extratags: "1", zoom: "18", "accept-language": "es",
    countrycodes: cfg("codigoPais", "cl")
  });
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
    const d = await r.json();
    if (d && d.address) autocompletarDireccionFormulario(d.address, d.display_name || "", d.place_rank || null, zonaPoligono);
  } catch (e) { console.warn("No se pudo autocompletar desde el mapa.", e); }
}

async function buscarDireccionEnMapa(centroFallback) {
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
    if (!d || d.length === 0) {
      /* Si viene un centroide fallback, centrar el mapa en la localidad */
      if (centroFallback && Array.isArray(centroFallback) && centroFallback.length === 2) {
        mapaPredio.setView(centroFallback, 16);
        setStatus && typeof setStatus === "function"
          ? null
          : null;
        alert("No se encontró la dirección exacta en el mapa.\nSe centró en la localidad correspondiente.\nMarque el punto del predio haciendo clic en el mapa.");
      } else {
        alert("No se encontró la dirección. Marque el punto manualmente.");
      }
      return;
    }
    const res = d[0];
    const resLat = parseFloat(res.lat), resLng = parseFloat(res.lon);
    mapaPredio.setView([resLat, resLng], cfg("zoomBusqueda",17));
    actualizarUbicacionPredio(resLat, resLng, "Dirección encontrada");
    autocompletarDireccionFormulario(res.address || {}, dir, res.place_rank || null, puntoEnLimiteUrbano(resLat, resLng));
  } catch (e) { alert("No se pudo buscar la dirección. Revise la conexión."); }
}

/* Autocompletar campos desde la dirección devuelta por Nominatim */
function autocompletarDireccionFormulario(address = {}, textoBusqueda = "", placeRank = null, zonaPoligono = null) {
  const calle = limpiarCalle(address.road||address.pedestrian||address.residential||address.footway||address.path||address.neighbourhood||"");
  const numero = address.house_number || extraerNumeroDireccion(textoBusqueda);
  const localidad = address.city||address.town||address.village||address.hamlet||address.municipality||address.county||address.suburb||cfg("localidadPredeterminada","")||cfg("comunaBusqueda","");

  /* Zona: polígono oficial tiene prioridad; Nominatim como respaldo */
  let zonaDetectada;
  if (zonaPoligono) {
    zonaDetectada = zonaPoligono;
  } else {
    const indicadoresUrbano = [address.city, address.town, address.suburb, address.neighbourhood, address.quarter, address.industrial, address.commercial, address.residential, address.allotments, address.retail];
    const indicadoresRural  = [address.village, address.hamlet, address.farm, address.farmyard, address.isolated_dwelling, address.locality, address.municipality];
    const esUrbano = indicadoresUrbano.some(Boolean);
    const esRural  = !esUrbano && indicadoresRural.some(Boolean);
    zonaDetectada = esUrbano ? "urbano" : esRural ? "rural" : (placeRank !== null ? (placeRank <= 16 ? "urbano" : "rural") : "");
  }

  asignarValor("calle", calle, true);

  const checkSN = document.getElementById("sinNumero");
  if (checkSN && checkSN.checked) asignarValor("numero","S/N",true);
  else asignarValor("numero", numero, true);

  asignarValor("localidad", localidad, true);

  const zonaEl = document.getElementById("zona");
  if (zonaEl && zonaDetectada) zonaEl.value = zonaDetectada;
  else if (zonaEl && cfg("zonaPredeterminada","") && !zonaEl.value) zonaEl.value = cfg("zonaPredeterminada","");

  mostrarIndicadorZona(zonaDetectada);
  actualizarEstadoFlujo();
}

function mostrarIndicadorZona(zona) {
  const panel = document.getElementById("zonaDetectadaPanel");
  if (!panel) return;
  if (!zona) { panel.style.display = "none"; return; }
  const esUrbano = zona === "urbano";
  panel.style.display = "flex";
  panel.className = "zona-detectada-panel " + (esUrbano ? "zona-urbana" : "zona-rural");
  panel.textContent = esUrbano
    ? "🏙 Zona Urbana — detectado automáticamente"
    : "🌿 Zona Rural — detectado automáticamente";
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
  const hayUbicacion = hayUbicacionSeleccionada();
  const cfgConsent = cfg("consentimiento", {});
  const consentimientoRequerido = cfgConsent.requerido !== false;
  const chkConsent = document.getElementById("consentimientoDatos");
  const hayConsentimiento = !consentimientoRequerido || (chkConsent ? chkConsent.checked : false);
  const ok = hayUbicacion && hayConsentimiento;

  ["btnGuardarDatos","btnImprimirPdf","btnContinuarCelular"].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.disabled = !ok;
  });
  const btnEnv = document.getElementById("btnEnviarSolicitud");
  if (btnEnv && btnEnv.style.display !== "none") btnEnv.disabled = !ok;

  const est = document.getElementById("estadoUbicacion");
  if (est) {
    if (!hayUbicacion) {
      est.textContent = "Seleccione una ubicación para continuar con el formulario.";
      est.classList.remove("listo"); est.classList.add("pendiente");
    } else if (!hayConsentimiento) {
      est.textContent = "Ubicación lista. Debe aceptar el consentimiento de datos para continuar.";
      est.classList.remove("pendiente"); est.classList.add("listo");
    } else {
      est.textContent = "Ubicación lista. Revise los datos autocompletados y complete los datos personales.";
      est.classList.remove("pendiente"); est.classList.add("listo");
    }
  }

  if (hayUbicacion) { actualizarPaso("pasoUbicacion","completado"); actualizarPaso("pasoFormulario","activo"); actualizarPaso("pasoPdf",""); }
  else              { actualizarPaso("pasoUbicacion","activo");      actualizarPaso("pasoFormulario","");       actualizarPaso("pasoPdf",""); }
}
function irAlFormularioDespuesDeUbicacion() {
  if (!hayUbicacionSeleccionada()) { alert("Primero debe buscar una dirección o marcar el punto en el mapa."); return; }
  const f = document.getElementById("solicitudForm");
  if (f) f.scrollIntoView({ behavior:"smooth", block:"start" });
}

/* ── eventos mapa ── */
function mostrarModalQr() {
  if (!validarFormularioCip()) return;
  if (typeof qrcode === "undefined") {
    alert("La librería QR no está disponible. Intente recargar la página.");
    return;
  }
  const modal  = document.getElementById("modalQrCelular");
  const canvas = document.getElementById("qrModalCanvas");
  if (!modal || !canvas) return;

  const base = window.location.origin + window.location.pathname;
  const qrParams = new URLSearchParams();
  const _c  = obtenerValor("calle");
  const _n  = obtenerValor("numero");
  const _r  = obtenerValor("rolSii");
  const _lt = obtenerValor("latitud");
  const _ln = obtenerValor("longitud");
  const _ce  = obtenerValor("tipoCertificado");
  const _lo  = obtenerValor("localidad");
  const _nom = obtenerValor("nombre");
  const _rut = obtenerValor("rut");
  const _em  = obtenerValor("email");
  const _tel = obtenerValor("telefono");
  if (_c)   qrParams.set("calle",    _c);
  if (_n)   qrParams.set("numero",   _n);
  if (_r)   qrParams.set("rol",      _r);
  if (_lt)  qrParams.set("lat",      _lt);
  if (_ln)  qrParams.set("lng",      _ln);
  if (_ce)  qrParams.set("cert",     _ce);
  if (_lo)  qrParams.set("loc",      _lo);
  if (_nom) qrParams.set("nombre",   _nom);
  if (_rut) qrParams.set("rut",      _rut);
  if (_em)  qrParams.set("email",    _em);
  if (_tel) qrParams.set("tel",      _tel);

  try {
    const qr = qrcode(0, "M");
    qr.addData(base + "?" + qrParams.toString() + "#preparar-solicitud");
    qr.make();
    const cellSize    = 6;
    const moduleCount = qr.getModuleCount();
    canvas.width      = moduleCount * cellSize;
    canvas.height     = moduleCount * cellSize;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1e3a5f";
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
    modal.style.display = "flex";
  } catch (e) {
    console.error("Error generando QR modal:", e);
  }
}

function leerParametrosUrl() {
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;
  const _c = params.get("calle");
  const _n = params.get("numero");
  const _r = params.get("rol");
  const _lt = params.get("lat");
  const _ln = params.get("lng");
  const _ce = params.get("cert");
  const _lo = params.get("loc");
  if (_c)  asignarValor("calle",    _c);
  if (_n)  asignarValor("numero",   _n);
  if (_r)  asignarValor("rolSii",   _r);
  if (_lo) asignarValor("localidad", _lo);
  if (_ce) {
    const sel = document.getElementById("tipoCertificado");
    if (sel) sel.value = _ce;
  }
  const _nom = params.get("nombre");
  const _rut = params.get("rut");
  const _em  = params.get("email");
  const _tel = params.get("tel");
  if (_nom) asignarValor("nombre",   _nom);
  if (_rut) asignarValor("rut",      _rut);
  if (_em)  asignarValor("email",    _em);
  if (_tel) asignarValor("telefono", _tel);
  if (_lt && _ln) {
    const latN = parseFloat(_lt);
    const lngN = parseFloat(_ln);
    if (!isNaN(latN) && !isNaN(lngN)) {
      const colocarMarcador = () => {
        if (typeof mapaPredio !== "undefined" && mapaPredio) {
          mapaPredio.setView([latN, lngN], 17);
          actualizarUbicacionPredio(latN, lngN, [_c, _n].filter(Boolean).join(" ") || "Cargado desde QR");
        } else {
          setTimeout(colocarMarcador, 500);
        }
      };
      colocarMarcador();
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  leerParametrosUrl();

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
    alert("Datos preparados correctamente. Ahora puede descargar o imprimir el formulario PDF.");
  });

  const btnImp = document.getElementById("btnImprimirPdf");
  if (btnImp) btnImp.addEventListener("click", () => generarPdfCip(true));

  const btnCelular = document.getElementById("btnContinuarCelular");
  if (btnCelular) btnCelular.addEventListener("click", function() {
    mostrarModalQr();
    mostrarBtnEnviar();
  });

  const btnEnviar = document.getElementById("btnEnviarSolicitud");
  if (btnEnviar) btnEnviar.addEventListener("click", enviarSolicitudDOM);

  /* Detectar si se llegó escaneando el QR (URL tiene parámetros del formulario) */
  const _qp = new URLSearchParams(window.location.search);
  const desdeQR = ["calle","rol","lat","lng","cert","nombre","rut"].some(p => _qp.has(p));

  /* Detectar si es un dispositivo móvil real */
  const esMobil = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (desdeQR || esMobil) {
    /* Estamos en el teléfono: no tiene sentido "continuar en teléfono" */
    if (btnCelular) btnCelular.style.display = "none";
    mostrarBtnEnviar();
  }

  const btnCerrarQr = document.getElementById("btnCerrarModalQr");
  if (btnCerrarQr) btnCerrarQr.addEventListener("click", () => {
    const m = document.getElementById("modalQrCelular");
    if (m) m.style.display = "none";
  });
  document.getElementById("modalQrCelular")?.addEventListener("click", function(e) {
    if (e.target === this) this.style.display = "none";
  });

  /* Adjuntar documentación — guardar File objects para incluir en PDF */
  const inputAdj = document.getElementById("adjuntosDoc");
  if (inputAdj) {
    inputAdj.addEventListener("change", function() {
      const lista = document.getElementById("listaAdjuntos");
      if (!lista) return;
      Array.from(this.files).forEach(file => {
        const ext = file.name.split(".").pop().toUpperCase();
        const li  = document.createElement("li");
        li.dataset.name = file.name;
        li._fileObj = file;
        li.innerHTML = `<span class="doc-ext">${ext}</span><span>${file.name}</span><button title="Quitar">✕</button>`;
        li.querySelector("button").addEventListener("click", () => li.remove());
        lista.appendChild(li);
      });
      this.value = "";
    });
  }


  const btnLimpiarLimites = document.getElementById("btnLimpiarLimites");
  if (btnLimpiarLimites) {
    btnLimpiarLimites.addEventListener("click", function () {
      if (drawnItems) drawnItems.clearLayers();
      const campo = document.getElementById("limitesPropiedad"); if (campo) campo.value = "";
      actualizarInfoLimites(null);
    });
  }

  /* Consentimiento dinámico desde config.js */
  inicializarConsentimiento();
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
  const canvas = await html2canvas(document.getElementById("mapaPredio"),{
    useCORS:true, allowTaint:false, backgroundColor:"#ffffff", scale:2, foreignObjectRendering:false
  });

  /* Dibujar el polígono encima si existe (html2canvas no captura SVG de Leaflet) */
  if (drawnItems && drawnItems.getLayers().length > 0) {
    const ctx = canvas.getContext("2d");
    const escala = 2;
    drawnItems.eachLayer(function (layer) {
      const coords = layer.getLatLngs ? layer.getLatLngs()[0] : null;
      if (!coords || coords.length < 2) return;
      ctx.beginPath();
      coords.forEach(function (latlng, i) {
        const pt = mapaPredio.latLngToContainerPoint(latlng);
        if (i === 0) ctx.moveTo(pt.x * escala, pt.y * escala);
        else ctx.lineTo(pt.x * escala, pt.y * escala);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(230,57,70,0.18)"; ctx.fill();
      ctx.strokeStyle = "#e63946"; ctx.lineWidth = 2.5 * escala; ctx.stroke();
    });
  }

  return {
    imagen: canvas.toDataURL("image/png"),
    bounds: mapaPredio ? mapaPredio.getBounds() : null
  };
}

function cortarTexto(t,max) { return String(t||"").length>max ? String(t).substring(0,max) : String(t||""); }

/* ================================================================
   MAPA DE CHECKBOXES — posiciones en el formulario PDF
   Coordenadas medidas con pdfplumber sobre formulario.pdf
   ================================================================ */
const CHECKBOXES_PDF = {
  NUMERO:               { x: 52,  y: 757 },
  RURALIDAD:            { x: 52,  y: 736 },
  URBANIZACION:         { x: 52,  y: 717 },
  AFECTACION:           { x: 52,  y: 696 },
  OTROS:                { x: 52,  y: 675 },
  INFORMACIONES_PREVIAS:{ x: 350, y: 756 },
  VIVIENDA_SOCIAL:      { x: 350, y: 735 },
  LOCALIZACION:         { x: 350, y: 716 },
  ZONIFICACION:         { x: 350, y: 695 },
  URBANO:               { x: 168, y: 650 },
  RURAL:                { x: 266, y: 650 }
};

/* Genera el PDF y devuelve los bytes (Uint8Array). Lanzará error si algo falla. */
async function construirBytesPdfCip() {
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

    // Urbano / Rural — usa config.js si tiene posiciones, si no usa CHECKBOXES_PDF
    if (zona==="urbano") {
      const p = cfgPdf("marcaUrbano", null);
      if (p) escribir("X", p.x, p.y, p.size||13, true);
      else marcarCheck("URBANO");
    }
    if (zona==="rural") {
      const p = cfgPdf("marcaRural", null);
      if (p) escribir("X", p.x, p.y, p.size||13, true);
      else marcarCheck("RURAL");
    }

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

    const capturaInfo = await capturarMapaParaPdf();
    const imgPng      = await pdfDoc.embedPng(capturaInfo.imagen);
    const posMapa     = cfgPdf("mapa",{x:55,y:305,width:529,height:259});
    pagina.drawImage(imgPng,{x:posMapa.x,y:posMapa.y,width:posMapa.width,height:posMapa.height});

    const posCoord = cfgPdf("coordenadas",{x:65,y:312,size:8,bold:true,max:80});
    if (obtenerValor("latitud") && obtenerValor("longitud")) {
      const textoCoord = decimalADMS(Number(obtenerValor("latitud")), Number(obtenerValor("longitud")));
      escribir(textoCoord, posCoord.x, posCoord.y, posCoord.size||8, posCoord.bold!==false);
    }

    /* Polígono de deslindes dibujado sobre el PDF */
    const limitesJson = obtenerValor("limitesPropiedad");
    if (limitesJson && capturaInfo.bounds) {
      try {
        const geojson = JSON.parse(limitesJson);
        const feature = geojson.features?.[0];
        const bounds  = capturaInfo.bounds;
        if (feature && bounds) {
          const swLat=bounds.getSouth(), neLat=bounds.getNorth(), swLng=bounds.getWest(), neLng=bounds.getEast();
          function geo2pdf(lat, lng) {
            return { x: posMapa.x + ((lng-swLng)/(neLng-swLng))*posMapa.width,
                     y: posMapa.y + ((lat-swLat)/(neLat-swLat))*posMapa.height };
          }
          const anillo = feature.geometry.coordinates[0];
          const rojo = rgb(0.9,0.15,0.2);
          for (let i=0; i<anillo.length-1; i++) {
            pagina.drawLine({ start:geo2pdf(anillo[i][1],anillo[i][0]), end:geo2pdf(anillo[i+1][1],anillo[i+1][0]), thickness:2, color:rojo, opacity:0.92 });
          }
          for (let i=0; i<anillo.length-1; i++) {
            const p = geo2pdf(anillo[i][1],anillo[i][0]);
            pagina.drawCircle({ x:p.x, y:p.y, size:3, color:rojo, opacity:0.9 });
          }
        }
      } catch (_) { /* ignorar si el GeoJSON falla */ }
    }

    escribirPos(muni, cfgPdf("municipalidadComprobante",{x:255,y:190,size:9,bold:true,max:35}));
    campo("calleComprobante", obtenerValor("calle"),  {x:60, y:116,size:8,bold:false,max:65});
    campo("numeroComprobante",obtenerValor("numero"), {x:500,y:116,size:8,bold:false,max:15});

    /* Fecha y hora de generación */
    const ahora = new Date();
    const fechaGen = ahora.toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit",year:"numeric"});
    const horaGen  = ahora.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"});
    const posFecha = cfgPdf("fechaGeneracionPdf",{x:400,y:730,size:7.5,bold:true,max:45});
    escribir(`Generado: ${fechaGen}  ${horaGen} hrs.`, posFecha.x, posFecha.y, posFecha.size||7.5, posFecha.bold===true);

    /* Registro de consentimiento en el PDF */
    const cfgConsent = cfg("consentimiento", {});
    if (cfgConsent.registrarEnPdf && document.getElementById("consentimientoDatos")?.checked) {
      const fechaHora = ahora.toLocaleDateString("es-CL") + " " + ahora.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"});
      const textoConsent = `El solicitante autorizó el tratamiento de sus datos personales el ${fechaHora} hrs.`;
      const posConsent = cfgPdf("consentimientoPdf",{x:55,y:95,size:6.5,bold:false,max:120});
      escribir(textoConsent, posConsent.x, posConsent.y, posConsent.size||6.5, posConsent.bold===true);
    }


  return await pdfDoc.save();
}

function mostrarBtnEnviar() {
  const btn = document.getElementById("btnEnviarSolicitud");
  if (!btn) return;
  btn.style.display = "";
  /* habilitar solo si el formulario ya está validado */
  const ok = !document.getElementById("btnImprimirPdf")?.disabled;
  btn.disabled = !ok;
}

/* Enviar solicitud completa (PDF + adjuntos) a la DOM desde el teléfono */
async function enviarSolicitudDOM() {
  if (!validarFormularioCip()) return;
  const panel = document.getElementById("panelEnvio");
  if (panel) { panel.style.display = "block"; panel.innerHTML = '<p class="envio-generando">⏳ Generando solicitud completa…</p>'; panel.scrollIntoView({ behavior:"smooth", block:"nearest" }); }

  try {
    const formBytes = await construirBytesPdfCip();
    const bytes     = await combinarConAdjuntos(formBytes);

    const tipo  = (obtenerValor("tipoCertificado") || "CERT").replace(/[^a-zA-Z0-9]/g,"_");
    const rol   = (obtenerValor("rolSii") || "SIN_ROL").replace(/[^a-zA-Z0-9\-]/g,"_");
    const fecha = new Date().toISOString().slice(0,10);
    const nombre = `Solicitud_DOM_${tipo}_${rol}_${fecha}.pdf`;
    const file   = new File([bytes], nombre, { type: "application/pdf" });

    const emailDOM = (window.DOM_CONFIG?.contacto?.email) || "dom@mdonihue.cl";
    const asunto   = encodeURIComponent(`Solicitud ${tipo.replace(/_/g," ")} – ROL ${rol} – ${fecha}`);
    const cuerpo   = encodeURIComponent(`Estimados,\n\nAdjunto mi solicitud de certificado DOM.\n\nROL: ${rol}\nFecha: ${fecha}\n\nAtentamente,\n${obtenerValor("nombre")}`);

    /* Intentar Web Share API (móvil) */
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: "Solicitud DOM Doñihue", text: `Solicitud ${tipo} – ROL ${rol}`, files: [file] });
      if (panel) panel.innerHTML = '<p class="envio-ok">✅ Solicitud compartida correctamente.</p>';
    } else {
      /* Fallback escritorio: descargar + botones */
      const url = URL.createObjectURL(new Blob([bytes], { type:"application/pdf" }));
      const a   = document.createElement("a"); a.href=url; a.download=nombre;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      if (panel) panel.innerHTML = `
        <p class="envio-desc">El PDF fue descargado. Ahora puede enviarlo a la DOM:</p>
        <div class="envio-btns">
          <a class="btn btn-accent" href="mailto:${emailDOM}?subject=${asunto}&body=${cuerpo}">✉️ Abrir correo</a>
          <a class="btn btn-wsp" href="https://wa.me/${(window.DOM_CONFIG?.contacto?.telefono||'').replace(/[^0-9]/g,'')}?text=${cuerpo}" target="_blank" rel="noopener">💬 WhatsApp DOM</a>
        </div>
        <p class="envio-hint">Adjunte manualmente el PDF descargado al mensaje.</p>`;
    }
  } catch(e) {
    if (e.name !== "AbortError") {
      console.error(e);
      if (panel) panel.innerHTML = '<p class="envio-error">❌ No se pudo generar la solicitud. Intente nuevamente.</p>';
    } else {
      if (panel) panel.style.display = "none";
    }
  }
}

/* Combina el formulario PDF con los adjuntos (PDF e imágenes) en un solo PDF */
async function combinarConAdjuntos(formBytes) {
  const lista = document.getElementById("listaAdjuntos");
  const items = lista ? Array.from(lista.querySelectorAll("li")).filter(li => li._fileObj) : [];
  if (!items.length) return formBytes;

  const { PDFDocument } = PDFLib;
  const final = await PDFDocument.create();

  /* 1. Páginas del formulario */
  const formDoc = await PDFDocument.load(formBytes);
  const formPags = await final.copyPages(formDoc, formDoc.getPageIndices());
  formPags.forEach(p => final.addPage(p));

  /* 2. Cada adjunto */
  for (const li of items) {
    const file = li._fileObj;
    const buf  = await file.arrayBuffer();
    const nom  = file.name.toLowerCase();
    try {
      if (nom.endsWith(".pdf")) {
        const adjDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pags   = await final.copyPages(adjDoc, adjDoc.getPageIndices());
        pags.forEach(p => final.addPage(p));
      } else {
        const bytes = new Uint8Array(buf);
        const img   = nom.endsWith(".png") ? await final.embedPng(bytes) : await final.embedJpg(bytes);
        const pag   = final.addPage([595.28, 841.89]); // A4
        const scaled = img.scaleToFit(535, 781);
        pag.drawImage(img, {
          x: (595.28 - scaled.width)  / 2,
          y: (841.89 - scaled.height) / 2,
          width:  scaled.width,
          height: scaled.height
        });
      }
    } catch(e) { console.warn("No se pudo incluir adjunto:", file.name, e); }
  }

  return await final.save();
}

async function generarPdfCip(imprimir=false) {
  if (!validarFormularioCip()) return;
  actualizarPaso("pasoFormulario","completado");
  actualizarPaso("pasoPdf","activo");
  try {
    const formBytes = await construirBytesPdfCip();
    const bytes     = await combinarConAdjuntos(formBytes);
    const blob  = new Blob([bytes],{type:"application/pdf"});
    const url   = URL.createObjectURL(blob);
    if (imprimir) {
      const w = window.open(url,"_blank");
      if (w) { w.onload = function(){ w.print(); URL.revokeObjectURL(url); setTimeout(limpiarFormulario,1500); }; }
    } else {
      const tipo  = (obtenerValor("tipoCertificado") || "CERT").replace(/[^a-zA-Z0-9]/g,"_");
      const rol   = (obtenerValor("rolSii") || "SIN_ROL").replace(/[^a-zA-Z0-9\-]/g,"_");
      const fecha = new Date().toISOString().slice(0,10);
      const a = document.createElement("a"); a.href=url; a.download=`${tipo}_${rol}_${fecha}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); limpiarFormulario(); }, 1500);
    }
  } catch(e) { console.error(e); alert("No se pudo generar el PDF. Revise los archivos adjuntos e intente nuevamente."); }
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

function activarValidacionTelefono() {
  const inp = document.getElementById("telefono"); if (!inp) return;
  inp.setAttribute("maxlength", "9");
  inp.setAttribute("inputmode", "numeric");
  let msg = document.getElementById("telefonoMensaje");
  if (!msg) { msg = document.createElement("small"); msg.id = "telefonoMensaje"; msg.style.cssText = "display:block;margin-top:6px;font-weight:700"; inp.insertAdjacentElement("afterend", msg); }
  inp.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 9);
    msg.textContent = ""; inp.style.borderColor = ""; inp.setCustomValidity("");
  });
  inp.addEventListener("blur", function () {
    const v = this.value.trim();
    if (!v) { inp.style.borderColor = ""; msg.textContent = ""; inp.setCustomValidity(""); return; }
    if (v.length !== 9) { inp.style.borderColor = "#dc2626"; msg.style.color = "#b91c1c"; msg.textContent = "El teléfono debe tener exactamente 9 dígitos."; inp.setCustomValidity("Teléfono inválido."); }
    else { inp.style.borderColor = "#16a34a"; msg.style.color = "#0f6b45"; msg.textContent = "Teléfono válido."; inp.setCustomValidity(""); }
  });
}

function activarValidacionNumero() {
  const inp = document.getElementById("numero"); if (!inp) return;
  inp.setAttribute("inputmode", "numeric");
  inp.addEventListener("input", function () {
    if (this.readOnly) return;
    this.value = this.value.replace(/\D/g, "");
  });
}

function validarFormularioCip() {
  const rutInput=document.getElementById("rut"); const checkSN=document.getElementById("sinNumero"); const numInput=document.getElementById("numero");
  if(rutInput) rutInput.value=formatearRut(rutInput.value);
  if(checkSN&&checkSN.checked&&numInput) numInput.value="S/N";
  const nombre=obtenerValor("nombre"),rut=obtenerValor("rut"),calle=obtenerValor("calle"),numero=obtenerValor("numero"),rolSii=obtenerValor("rolSii"),lat=obtenerValor("latitud"),lng=obtenerValor("longitud"),sinNum=checkSN?checkSN.checked:false;
  const telefono=obtenerValor("telefono");
  if(!nombre||!rut||!calle||(!numero&&!sinNum)||!rolSii){alert("Debe completar nombre, RUT, calle, número y Rol SII.");return false;}
  if(!validarRutChileno(rut)){alert("RUT inválido.");if(rutInput){mostrarEstadoRut();rutInput.focus();}return false;}
  if(telefono && (!/^\d+$/.test(telefono)||telefono.length!==9)){alert("El teléfono debe tener exactamente 9 dígitos numéricos.");document.getElementById("telefono").focus();return false;}
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
   LIMPIAR FORMULARIO — reset completo tras generar PDF
   ================================================================ */
function limpiarFormulario() {
  ["nombre","rut","email","telefono","calle","numero","depto","block",
   "manzana","lote","localidad","planoLoteo","rolSii","latitud","longitud","limitesPropiedad"
  ].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) { el.value = ""; el.style.borderColor = ""; el.setCustomValidity && el.setCustomValidity(""); }
  });
  const inputBuscar = document.getElementById("buscarDireccion");
  if (inputBuscar) inputBuscar.value = "";
  ["rutMensaje","telefonoMensaje"].forEach(function(id) {
    const el = document.getElementById(id); if (el) el.textContent = "";
  });
  const zona = document.getElementById("zona"); if (zona) zona.selectedIndex = 0;
  const sinNum = document.getElementById("sinNumero"); if (sinNum) sinNum.checked = false;
  const consent = document.getElementById("consentimientoDatos"); if (consent) consent.checked = false;
  const panelZona = document.getElementById("zonaDetectadaPanel"); if (panelZona) panelZona.style.display = "none";
  const ct = document.getElementById("coordenadasTexto"); if (ct) ct.textContent = "Aún no se ha seleccionado una ubicación.";
  if (marcadorPredio && mapaPredio) { mapaPredio.removeLayer(marcadorPredio); marcadorPredio = null; }
  if (drawnItems) drawnItems.clearLayers();
  actualizarInfoLimites(null);
  actualizarPaso("pasoUbicacion","activo");
  actualizarPaso("pasoFormulario","");
  actualizarPaso("pasoPdf","");
  actualizarEstadoFlujo();
}

/* ================================================================
   CONSENTIMIENTO DINÁMICO — se renderiza desde config.js
   ================================================================ */
function escaparHtml(str) {
  return String(str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function inicializarConsentimiento() {
  const contenedor = document.getElementById("consentimientoContainer");
  if (!contenedor) return;

  const cfgC = cfg("consentimiento", {});
  if (!cfgC.textoConsentimiento) return;

  const mun  = cfg("municipalidadCorta", cfg("municipalidad","la Municipalidad"));
  /* replaceAll para múltiples tokens; escaparHtml evita XSS desde config */
  const texto = cfgC.textoConsentimiento.replaceAll("{municipalidad}", escaparHtml(mun));

  /* Construcción segura: DOM API en lugar de innerHTML con concatenación */
  const wrapper = document.createElement("div");
  wrapper.className = "form-group consent-group";

  const label = document.createElement("label");
  label.className = "consent-label";

  const chk = document.createElement("input");
  chk.type = "checkbox";
  chk.id   = "consentimientoDatos";
  chk.checked = false; /* siempre desactivado al cargar */

  const span = document.createElement("span");
  span.appendChild(document.createTextNode(texto + " "));

  /* Soporta array `leyes` (nuevo) y campo único legacy (textoEnlace + urlPoliticaPrivacidad) */
  const leyes = Array.isArray(cfgC.leyes) && cfgC.leyes.length
    ? cfgC.leyes
    : (cfgC.textoEnlace ? [{ texto: cfgC.textoEnlace, url: cfgC.urlPoliticaPrivacidad || "" }] : []);

  leyes.forEach(function(ley, i) {
    if (i > 0) {
      span.appendChild(document.createTextNode(i === leyes.length - 1 ? " y la " : ", la "));
    }
    if (ley.url) {
      const a = document.createElement("a");
      a.href        = ley.url;
      a.target      = "_blank";
      a.rel         = "noopener";
      a.textContent = ley.texto;
      span.appendChild(a);
    } else {
      span.appendChild(document.createTextNode(ley.texto));
    }
  });
  span.appendChild(document.createTextNode(leyes.length ? "." : ""));

  label.appendChild(chk);
  label.appendChild(span);
  wrapper.appendChild(label);
  contenedor.appendChild(wrapper);

  chk.addEventListener("change", actualizarEstadoFlujo);
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

/* mostrarIndicadorZona está definida arriba */
/*
  cn_module.js — Módulo Certificado de Número
  PAGINA DOM OFICIAL — Municipalidad de Doñihue

  Flujo: busca en historico.json → seleccionar registro →
         precarga el formulario CIP principal → usuario completa
         mapa + datos → descarga / imprime el PDF CIP con
         checkbox NUMERO marcado.
*/
(function () {
  "use strict";

  /* ── config desde config.js ── */
  function cfg(clave, def) {
    return (window.DOM_CONFIG && window.DOM_CONFIG[clave] !== undefined)
      ? window.DOM_CONFIG[clave] : def;
  }
  const DOM_EMAIL = (cfg("contacto", {}).email) || "dom@mdonihue.cl";
  const MUNICIPIO = cfg("municipalidadCorta", "Doñihue");

  /* Localidades conocidas + alias abreviados que aparecen en el histórico */
  const LOCALIDADES = ["Lo Miranda", "Doñihue", "Peumo", "Coinco", "San Pedro", "Los Lirios", "Las Mercedes"];

  /* Alias → nombre completo (para normalizar abreviaturas del histórico) */
  const ALIAS_LOCALIDAD = {
    "lo mda":      "Lo Miranda",
    "lo miranda":  "Lo Miranda",
    "lo mir":      "Lo Miranda",
    "l. miranda":  "Lo Miranda",
    "donihue":     "Doñihue",
    "dohihue":     "Doñihue"
  };

  /* Coordenadas aproximadas por localidad (fallback cuando Nominatim falla) */
  const CENTROS = {
    "Lo Miranda": [-34.2453, -70.8817],
    "Doñihue":    [-34.2158, -70.9091],
    "Peumo":      [-34.3756, -71.1997],
    "Coinco":     [-34.2622, -70.9519],
    "San Pedro":  [-34.2420, -70.8944],
    "Los Lirios": [-34.2233, -70.8889],
    "Las Mercedes":[-34.1980, -70.9210]
  };

  /* Expande abreviaturas de calles comunes en el texto del histórico */
  function expandirAbreviaturas(texto) {
    return texto
      .replace(/\bAv\.?\s+/gi,      "Avenida ")
      .replace(/\bPje\.?\s+/gi,     "Pasaje ")
      .replace(/\bPob\.?\s+/gi,     "Población ")
      .replace(/\bPobl?\.?\s+/gi,   "Población ")
      .replace(/\bSta\.?\s+/gi,     "Santa ")
      .replace(/\bSto\.?\s+/gi,     "Santo ")
      .replace(/\bGral\.?\s+/gi,    "General ")
      .replace(/\bPte\.?\s+/gi,     "Puente ")
      .replace(/\bHno\.?\s+/gi,     "Hermano ")
      .replace(/\s{2,}/g,           " ")
      .trim();
  }

  /* Detecta y resuelve alias de localidad en texto libre */
  function resolverLocalidadAlias(texto) {
    const t = texto.toLowerCase().trim();
    for (const [alias, nombre] of Object.entries(ALIAS_LOCALIDAD)) {
      if (t === alias || t.endsWith(" " + alias) || t.includes(", " + alias)) {
        return nombre;
      }
    }
    return null;
  }

  /* ── utilidades ── */
  function normalizar(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }
  function normalRol(s) {
    return String(s || "").replace(/\s/g, "").toLowerCase();
  }

  /* Extrae localidad, calle y número de un string de dirección */
  function parsearDireccion(dir) {
    if (!dir) return { calle: "", numero: "", localidad: "" };
    let texto    = String(dir).trim();
    let localidad = "";

    /* 1. Detectar localidad al final — primero nombres completos, luego alias */
    const candidatos = [
      ...LOCALIDADES.map(n => ({ patron: n, nombre: n })),
      ...Object.entries(ALIAS_LOCALIDAD).map(([alias, nombre]) => ({ patron: alias, nombre }))
    ];
    for (const { patron, nombre } of candidatos) {
      const esc = patron.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re  = new RegExp("[-,]?\\s*" + esc + "\\s*$", "i");
      if (re.test(texto)) {
        localidad = nombre;
        texto = texto.replace(re, "").trim().replace(/[-,\s]+$/, "").trim();
        break;
      }
    }

    /* 2. Extraer número: acepta #123, N°123, Nro 123, nro.123, s/n */
    let numero = "";
    const reNum  = /(?:#|[Nn][º°ro.]*\s*)(\d+[A-Za-z]?)/;
    const reSN   = /\bs[\/.]?n\b/i;                    // S/N
    const reFin  = /\s+(\d{1,5}[A-Za-z]?)\s*$/;       // número al final

    if (reSN.test(texto)) {
      numero = "S/N";
      texto  = texto.replace(reSN, "").trim();
    } else {
      let m = texto.match(reNum);
      if (m) {
        numero = m[1];
        texto  = texto.replace(m[0], "").trim();
      } else {
        m = texto.match(reFin);
        if (m) {
          numero = m[1];
          texto  = texto.slice(0, texto.length - m[0].length).trim();
        }
      }
    }

    return { calle: texto, numero, localidad };
  }

  /* ── datos ── */
  let DATOS    = null;
  let cargando = false;

  function cargarDatos(cb) {
    if (DATOS) { cb(null); return; }
    if (cargando) { setTimeout(() => cargarDatos(cb), 300); return; }
    cargando = true;
    setStatus("Cargando base de datos histórica...", "info");
    fetch("./historico.json")
      .then(r => r.json())
      .then(json => { DATOS = json; cargando = false; cb(null); })
      .catch(err => { cargando = false; cb(err); });
  }

  /* ── búsqueda ── */
  let _buscarTotal = 0; // total de coincidencias de la última búsqueda

  function buscar(termino) {
    if (!DATOS || !DATOS.registros) return [];
    const t  = normalizar(termino);
    const tr = normalRol(termino);
    if (!t) { _buscarTotal = 0; return []; }

    /* Si el término tiene formato ROL (solo dígitos y guión), buscar solo por ROL */
    const esRol = /^\d{1,4}(-\d{0,4})?$/.test(termino.trim());

    /* Tokens individuales de al menos 3 caracteres para nombre/dirección */
    const tokens = t.split(/\s+/).filter(tok => tok.length >= 3);

    _buscarTotal = 0;
    const todos = DATOS.registros
      .map(rec => {
        let score = 0;
        const rolN = normalRol(rec.r || "");

        /* Coincidencia por ROL */
        if (rolN && rolN === tr)               score += 100;
        else if (rolN && rolN.startsWith(tr))  score +=  80;
        else if (rolN && rolN.includes(tr))    score +=  60;

        /* Coincidencia por nombre/dirección (solo si NO es formato ROL) */
        if (!esRol && tokens.length > 0) {
          const nombreN = normalizar(rec.n);
          const dirN    = normalizar(rec.d || "");
          /* TODAS las palabras del término deben estar presentes en el campo */
          if (tokens.every(tok => nombreN.includes(tok))) score += 40;
          if (tokens.every(tok => dirN.includes(tok)))    score += 30;
        }

        return { rec, score };
      })
      .filter(x => { if (x.score > 0) { _buscarTotal++; return true; } return false; })
      .sort((a, b) => b.score - a.score);

    return todos.slice(0, 30).map(x => x.rec);
  }

  /* ── UI helpers ── */
  function setStatus(msg, tipo) {
    const el = document.getElementById("cn-status");
    if (!el) return;
    el.className = "cn-status cn-status-" + (tipo || "info");
    el.textContent = msg;
    el.style.display = msg ? "block" : "none";
  }

  function chipFuente(src) {
    if (!src) return "";
    const map = { H: "Histórico", "2024": "2024", "2025": "2025", "2026": "2026", R2026: "Rég. Trans." };
    return `<span class="cn-chip cn-chip-src-${src}">${map[src] || src}</span>`;
  }

  /* ── Precargar formulario CIP principal ── */
  function precargarCip(rec) {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== null && String(val).trim()) {
        el.value = String(val).trim();
        /* disparar evento para que el script.js detecte cambios */
        el.dispatchEvent(new Event("input",  { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };

    const { calle, numero, localidad } = parsearDireccion(rec.d);

    set("rolSii",    String(rec.r || "").replace(/[,;\s]+$/, ""));
    set("calle",     calle);
    set("numero",    numero === "S/N" ? "" : numero);
    set("localidad", localidad || MUNICIPIO);

    /* S/N → marcar checkbox */
    const cbSN = document.getElementById("sinNumero");
    if (cbSN) cbSN.checked = (numero === "S/N");

    /* Seleccionar tipo NUMERO */
    const tipoCert = document.getElementById("tipoCertificado");
    if (tipoCert) {
      tipoCert.value = "NUMERO";
      tipoCert.dispatchEvent(new Event("change", { bubbles: true }));
    }

    /* Mostrar panel de aviso en el CIP */
    const aviso = document.getElementById("cn-aviso-cip");
    if (aviso) aviso.style.display = "block";

    /* Ir al formulario CIP y luego marcar en el mapa */
    const seccion = document.getElementById("preparar-solicitud");
    if (seccion) {
      setTimeout(() => seccion.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
    }

    /* Geocodificar: expandir abreviaturas y pasar centroide como fallback */
    const calleExpandida = expandirAbreviaturas(calle);
    const locFinal       = localidad || MUNICIPIO;
    const dirBusqueda    = [calleExpandida, numero && numero !== "S/N" ? numero : "", locFinal]
      .filter(Boolean).join(" ");
    const campoBusq = document.getElementById("buscarDireccion");
    if (campoBusq && typeof buscarDireccionEnMapa === "function") {
      campoBusq.value = dirBusqueda;
      const centroFallback = CENTROS[locFinal] || CENTROS[MUNICIPIO] || null;
      setTimeout(() => buscarDireccionEnMapa(centroFallback), 800);
    }

    setStatus(
      `✓ Datos cargados en el formulario: ${calle}${numero ? " " + numero : ""}${localidad ? ", " + localidad : ""}. Buscando ubicación en el mapa…`,
      "ok"
    );
  }

  /* ── Descargar CIP pre-llenado ── */
  async function descargarCipPreLlenado(rec) {
    if (typeof XLSX === "undefined") {
      alert("La librería de Excel aún no ha cargado. Espere un momento e intente nuevamente.");
      return;
    }

    const { calle, numero, localidad } = parsearDireccion(rec.d);
    const rol = String(rec.r || "").replace(/[,;\s]+$/, "");

    try {
      const res = await fetch("./img/doc/cip_base.xls");
      if (!res.ok) throw new Error("No se pudo cargar el archivo CIP base.");
      const buf = await res.arrayBuffer();

      const wb = XLSX.read(new Uint8Array(buf), { type: "array", cellStyles: true });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];

      const setCelda = (addr, valor, tipo) => {
        if (!ws[addr]) ws[addr] = {};
        ws[addr].v = valor;
        ws[addr].t = tipo || "s";
        ws[addr].w = String(valor);
      };

      /* Campos de sección 1 — Identificación de la propiedad */
      if (calle)     setCelda("N19", calle.toUpperCase());
      if (localidad) setCelda("D20", localidad.toUpperCase());
      if (rol)       setCelda("D21", rol);
      /* N° municipal (X21): DOM lo completa — dejamos vacío o con número de dirección */
      if (numero && numero !== "S/N") setCelda("X21", numero);

      /* Fecha de hoy como serial Excel */
      const hoy = new Date();
      const serial = Math.round((hoy - new Date(1899, 11, 30)) / 86400000);
      if (ws["W9"]) { ws["W9"].v = serial; ws["W9"].t = "n"; ws["W9"].w = hoy.toLocaleDateString("es-CL"); }

      /* Nombre del archivo */
      const calleSlug = calle.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20);
      XLSX.writeFile(wb, `CIP_${calleSlug}_${rol || "SIN_ROL"}.xlsx`);

    } catch (e) {
      console.error(e);
      alert("No se pudo generar el CIP. Verifique que el archivo cip_base.xls esté disponible.\n" + e.message);
    }
  }

  /* ── Renderizar resultados ── */
  function renderResultados(resultados) {
    const contenedor = document.getElementById("cn-resultados");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (!resultados.length) {
      setStatus("No se encontraron registros. Puede enviar una consulta al equipo DOM.", "warn");
      const div = document.createElement("div");
      div.className = "cn-no-encontrado";
      div.innerHTML = `
        <p>Si su predio no aparece en el registro histórico, envíe una consulta directamente al equipo DOM para que le asignen el número oficial.</p>
        <button class="btn btn-outline" id="cn-btn-correo-nf">Enviar consulta por correo</button>
      `;
      contenedor.appendChild(div);
      document.getElementById("cn-btn-correo-nf").addEventListener("click", enviarCorreoConsulta);
      return;
    }

    const msgTotal = _buscarTotal > 30
      ? `Mostrando 30 de ${_buscarTotal} coincidencias. Refine su búsqueda para mejores resultados.`
      : `${resultados.length} resultado(s). Seleccione el predio para cargar los datos en el formulario.`;
    setStatus(msgTotal, _buscarTotal > 30 ? "warn" : "info");

    resultados.forEach(rec => {
      const { calle, numero, localidad } = parsearDireccion(rec.d);
      const item = document.createElement("div");
      item.className = "cn-resultado-item";

      const numTexto   = (numero && numero !== "S/N") ? `<span class="cn-tag cn-tag-num">N° ${numero}</span>` : (numero === "S/N" ? `<span class="cn-tag cn-tag-num">S/N</span>` : "");
      const locTexto   = localidad ? `<span class="cn-tag cn-tag-loc">${localidad}</span>` : "";
      const rolLimpio  = String(rec.r || "").replace(/[,;\s]+$/, "");
      const rolTexto   = rolLimpio ? `<span class="cn-tag cn-tag-rol">ROL ${rolLimpio}</span>` : "";
      const fuenteChip = chipFuente(rec.src);

      /* Detalle del trámite */
      const recepcion  = String(rec.rec || "").trim();
      const superficie = String(rec.s   || "").trim();
      const detalles   = [];
      if (rec.m)       detalles.push(`<span class="cn-det-tipo">${rec.m}</span>`);
      if (rec.f)       detalles.push(`<span class="cn-det-fecha">${rec.f}</span>`);
      if (superficie)  detalles.push(`<span class="cn-det-sup">Sup. ${superficie} m²</span>`);
      if (recepcion)   detalles.push(`<span class="cn-det-rec">Recep. N° ${recepcion}</span>`);

      item.innerHTML = `
        <div class="cn-res-header">
          <span class="cn-res-nombre">${rec.n || "(sin nombre)"}</span>
          ${fuenteChip}
        </div>
        <div class="cn-res-dir">
          ${calle ? `<span class="cn-dir-calle">${calle}</span>` : ""}
          ${numTexto}${locTexto}${rolTexto}
        </div>
        ${detalles.length ? `<div class="cn-res-detalle">${detalles.join("")}</div>` : ""}
        <div class="cn-res-acciones">
          <button class="btn btn-accent btn-sm cn-btn-sel">Cargar en formulario →</button>
        </div>
      `;
      item.querySelector(".cn-btn-sel").addEventListener("click", () => precargarCip(rec));
      contenedor.appendChild(item);
    });
  }

  /* ── Correo de consulta ── */
  function enviarCorreoConsulta() {
    const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
    const termino = get("cn-busqueda");
    const asunto  = encodeURIComponent("Consulta Certificado de Número — DOM Doñihue");
    const cuerpo  = encodeURIComponent(
      "Estimados,\n\n" +
      "Solicito información para obtener el Certificado de Número del siguiente predio:\n\n" +
      `  Búsqueda realizada: "${termino}"\n` +
      "\nEl predio no fue encontrado en la base de datos histórica del sitio DOM.\n\n" +
      "Quedo atento(a) a su respuesta.\n\nSaludos."
    );
    window.location.href = `mailto:${DOM_EMAIL}?subject=${asunto}&body=${cuerpo}`;
  }

  /* ── Init ── */
  function init() {
    const inputBusq  = document.getElementById("cn-busqueda");
    const btnBuscar  = document.getElementById("cn-btn-buscar");
    const btnLimpiar = document.getElementById("cn-btn-limpiar");

    if (btnBuscar) {
      btnBuscar.addEventListener("click", () => {
        const termino = inputBusq ? inputBusq.value.trim() : "";
        if (!termino) { setStatus("Ingrese nombre, ROL o dirección para buscar.", "warn"); return; }
        /* Advertir si el término es muy corto para búsqueda por texto (no ROL) */
        const esRolInput = /^\d{1,4}(-\d{0,4})?$/.test(termino);
        if (!esRolInput && termino.replace(/\s+/g, "").length < 3) {
          setStatus("Ingrese al menos 3 caracteres para buscar por nombre o dirección.", "warn");
          return;
        }
        cargarDatos(err => {
          if (err) { setStatus("Error al cargar la base de datos.", "error"); return; }
          const resultados = buscar(termino);
          renderResultados(resultados);
          if (btnLimpiar) btnLimpiar.style.display = "inline-flex";
        });
      });
    }

    if (btnLimpiar) {
      btnLimpiar.addEventListener("click", () => {
        if (inputBusq) inputBusq.value = "";
        setStatus("", "info");
        const contenedor = document.getElementById("cn-resultados");
        if (contenedor) contenedor.innerHTML = "";
        btnLimpiar.style.display = "none";
        if (inputBusq) inputBusq.focus();
      });
    }

    if (inputBusq) {
      inputBusq.addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); if (btnBuscar) btnBuscar.click(); }
      });
    }

    /* Aviso en formulario CIP cuando se elige NUMERO */
    const tipoCert = document.getElementById("tipoCertificado");
    if (tipoCert) {
      tipoCert.addEventListener("change", function () {
        const aviso = document.getElementById("cn-aviso-cip");
        if (!aviso) return;
        aviso.style.display = (this.value === "NUMERO") ? "block" : "none";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

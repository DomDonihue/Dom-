/*
  cn_module.js — Módulo Certificado de Número
  PAGINA DOM OFICIAL — Municipalidad de Doñihue
  Depende de: config.js (window.DOM_CONFIG), historico.json
*/
(function () {
  "use strict";

  /* ── configuración desde config.js ── */
  function cfg(clave, def) {
    if (!window.DOM_CONFIG) return def;
    return window.DOM_CONFIG[clave] !== undefined ? window.DOM_CONFIG[clave] : def;
  }
  const DOM_EMAIL  = (cfg("contacto", {}).email)           || "dom@mdonihue.cl";
  const MUNICIPIO  = cfg("municipalidadCorta", "Doñihue");
  const DIRECTOR   = "Rodrigo Calderón Peralta";
  const CARGO      = "Director de Obras Municipales";

  /* ── datos ── */
  let DATOS = null;
  let cargando = false;

  /* ── utilidades ── */
  function normalizar(s) {
    return String(s || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().trim();
  }

  function normalRol(s) {
    return String(s || "").replace(/\s/g, "").toLowerCase();
  }

  function fechaEnLetras(str) {
    if (!str) return "";
    const meses = ["enero","febrero","marzo","abril","mayo","junio",
                   "julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const partes = String(str).split(/[\/\-]/);
    if (partes.length === 3) {
      const d = parseInt(partes[0], 10);
      const m = parseInt(partes[1], 10) - 1;
      const a = partes[2];
      if (!isNaN(d) && m >= 0 && m < 12) {
        return `${d} de ${meses[m]} de ${a}`;
      }
    }
    return str;
  }

  function hoyEnLetras() {
    const hoy = new Date();
    const d   = hoy.getDate();
    const m   = hoy.getMonth();
    const a   = hoy.getFullYear();
    const meses = ["enero","febrero","marzo","abril","mayo","junio",
                   "julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${d} de ${meses[m]} de ${a}`;
  }

  function genSolicitudN() {
    const t = Date.now().toString(36).toUpperCase();
    return `CN-${t}`;
  }

  function extraerCalleNumero(dir) {
    if (!dir) return { calle: "", numero: "" };
    const m = String(dir).match(/^(.+?)\s+(?:n[°o]?\.?\s*)?(\d+[a-z]?)$/i);
    if (m) return { calle: m[1].trim(), numero: m[2].trim() };
    const m2 = String(dir).match(/n[°o]?\.?\s*(\d+[a-z]?)/i);
    if (m2) {
      const numero = m2[1];
      const calle  = String(dir).replace(m2[0], "").trim();
      return { calle, numero };
    }
    return { calle: dir, numero: "" };
  }

  /* ── carga de datos ── */
  function cargarDatos(cb) {
    if (DATOS) { cb(null); return; }
    if (cargando) { setTimeout(() => cargarDatos(cb), 300); return; }
    cargando = true;
    setStatus("Cargando base de datos...", "info");
    fetch("./historico.json")
      .then(r => r.json())
      .then(json => { DATOS = json; cargando = false; cb(null); })
      .catch(err => { cargando = false; cb(err); });
  }

  /* ── búsqueda ── */
  function buscar(termino) {
    if (!DATOS || !DATOS.registros) return [];
    const t  = normalizar(termino);
    const tr = normalRol(termino);
    return DATOS.registros
      .map(rec => {
        let score = 0;
        const rolN = normalRol(rec.r || "");
        if (rolN && rolN === tr)                        score += 100;
        else if (rolN && rolN.includes(tr))             score += 60;
        if (normalizar(rec.n).includes(t))              score += 40;
        if (normalizar(rec.d || "").includes(t))        score += 30;
        return { rec, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map(x => x.rec);
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
    const map = { H: "Histórico", "2024": "2024", "2025": "2025", "2026": "2026", R2026: "Régimen Tran." };
    const label = map[src] || src;
    return `<span class="cn-chip cn-chip-${src.replace(/\d/g,"x")}">${label}</span>`;
  }

  function renderResultados(resultados) {
    const contenedor = document.getElementById("cn-resultados");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    if (!resultados.length) {
      setStatus("No se encontraron registros. Puede enviar una consulta al equipo DOM.", "warn");
      mostrarBtnCorreo();
      return;
    }
    setStatus(`${resultados.length} resultado(s) encontrado(s). Seleccione un registro para generar el certificado.`, "ok");
    resultados.forEach(rec => {
      const item = document.createElement("div");
      item.className = "cn-resultado-item";
      item.innerHTML = `
        <div class="cn-resultado-header">
          <strong>${rec.n || "(sin nombre)"}</strong>
          ${chipFuente(rec.src)}
        </div>
        <div class="cn-resultado-meta">
          ${rec.r ? `<span class="cn-chip cn-chip-rol">ROL ${rec.r}</span>` : ""}
          ${rec.d ? `<span class="cn-dato"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> ${rec.d}</span>` : ""}
          ${rec.m ? `<span class="cn-dato">${rec.m}</span>` : ""}
          ${rec.f ? `<span class="cn-dato">${rec.f}</span>` : ""}
        </div>
        <button class="btn btn-accent btn-sm cn-btn-seleccionar" data-idx>Seleccionar y generar certificado</button>
      `;
      item.querySelector(".cn-btn-seleccionar").addEventListener("click", () => {
        precargarFormulario(rec);
        document.getElementById("cn-formulario").scrollIntoView({ behavior: "smooth" });
      });
      contenedor.appendChild(item);
    });
  }

  function mostrarBtnCorreo() {
    const cnt = document.getElementById("cn-resultados");
    if (!cnt) return;
    const div = document.createElement("div");
    div.className = "cn-no-encontrado";
    div.innerHTML = `
      <p>Si su propiedad no aparece en el registro histórico, puede solicitar el Certificado de Número directamente al equipo DOM.</p>
      <button class="btn btn-outline" id="cn-btn-correo-nf">Enviar consulta por correo</button>
    `;
    cnt.appendChild(div);
    document.getElementById("cn-btn-correo-nf").addEventListener("click", enviarCorreoConsulta);
  }

  function precargarFormulario(rec) {
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set("cn-nombre",    rec.n);
    set("cn-rol",       rec.r);
    set("cn-direccion", rec.d);
    if (rec.d) {
      const { calle, numero } = extraerCalleNumero(rec.d);
      set("cn-calle",  calle);
      set("cn-numero", numero);
    }
    setStatus("Registro seleccionado. Revise los datos y complete los campos faltantes antes de generar el certificado.", "ok");
  }

  /* ── autocompletar desde formulario CIP principal ── */
  function sincronizarDesdeFormCip() {
    const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
    const set = (id, val) => { const el = document.getElementById(id); if (el && val && !el.value.trim()) el.value = val; };
    set("cn-nombre",    get("nombre"));
    set("cn-telefono",  get("telefono"));
    set("cn-email",     get("email"));
    set("cn-rol",       get("rolSii"));
    set("cn-calle",     get("calle"));
    set("cn-numero",    get("numero"));
    set("cn-manzana",   get("manzana"));
    set("cn-lote",      get("lote"));
    set("cn-localidad", get("localidad"));
  }

  /* ── generación del certificado ── */
  function generarCertificado() {
    const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
    const nombre    = get("cn-nombre");
    const rol       = get("cn-rol");
    const calle     = get("cn-calle");
    const numero    = get("cn-numero");
    const manzana   = get("cn-manzana");
    const lote      = get("cn-lote");
    const localidad = get("cn-localidad");
    const zona      = get("cn-zona");

    if (!nombre || !calle) {
      alert("Por favor complete al menos el nombre del solicitante y la dirección (calle).");
      return;
    }

    const solicitudN = genSolicitudN();
    const fechaHoy   = hoyEnLetras();
    const numOficial = get("cn-numero-oficial") || "_______________";

    const zonaTexto = zona === "rural" ? "RURAL" : "URBANO";
    const localidadTexto = localidad || MUNICIPIO;
    const calleNumeroTexto = numero
      ? `${calle} N° ${numero}`
      : calle;
    const manzanaLoteTexto = (manzana || lote)
      ? ` Manzana ${manzana || "—"}, Lote ${lote || "—"},`
      : "";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Certificado de Número — ${nombre}</title>
  <style>
    @page { size: letter; margin: 2cm 2.5cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #1a1a1a; }
    .cert { max-width: 700px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2.5px solid #0f3c68; padding-bottom: 14px; margin-bottom: 18px; }
    .header h1 { font-size: 13pt; font-weight: bold; color: #0f3c68; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .header h2 { font-size: 10.5pt; font-weight: normal; color: #333; }
    .header .form-id { font-size: 9pt; color: #666; margin-top: 6px; }
    .meta-row { display: flex; justify-content: space-between; font-size: 9pt; color: #555; margin-bottom: 20px; border: 1px solid #ccc; padding: 8px 12px; border-radius: 6px; background: #f8f9fb; }
    .zona-row { display: flex; gap: 40px; margin: 16px 0; font-size: 10.5pt; }
    .zona-check { display: flex; align-items: center; gap: 6px; }
    .check-box { width: 14px; height: 14px; border: 1.5px solid #333; display: inline-flex; align-items: center; justify-content: center; font-size: 9pt; font-weight: bold; }
    .check-box.marcado { background: #0f3c68; color: #fff; border-color: #0f3c68; }
    .cuerpo { margin: 18px 0; line-height: 1.8; text-align: justify; font-size: 11pt; }
    .numero-asignado { font-size: 22pt; font-weight: bold; color: #0f3c68; letter-spacing: 2px; display: inline-block; border-bottom: 2px solid #0f3c68; padding: 0 8px; min-width: 120px; text-align: center; }
    .valido { margin: 18px 0; font-size: 9.5pt; color: #444; border-left: 3px solid #2f76ea; padding-left: 10px; }
    .firma { margin-top: 56px; display: flex; flex-direction: column; align-items: flex-end; }
    .firma-linea { width: 240px; border-top: 1.5px solid #1a1a1a; text-align: center; padding-top: 6px; font-size: 10pt; }
    .firma-linea strong { display: block; font-size: 10.5pt; }
    .aviso { margin-top: 28px; font-size: 8pt; color: #777; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
    .print-btn { position: fixed; bottom: 20px; right: 20px; background: #2f76ea; color: #fff; border: none; padding: 12px 22px; border-radius: 8px; font-size: 13pt; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
<div class="cert">
  <div class="header">
    <h1>Ilustre Municipalidad de ${MUNICIPIO}</h1>
    <h2>Dirección de Obras Municipales</h2>
    <div class="form-id">FORMULARIO 5.5 — CERTIFICADO DE NÚMERO</div>
  </div>

  <div class="meta-row">
    <span><strong>N° Solicitud:</strong> ${solicitudN}</span>
    <span><strong>Solicitante:</strong> ${nombre}</span>
    <span><strong>Fecha:</strong> ${fechaHoy}</span>
  </div>

  <div class="zona-row">
    <div class="zona-check"><span class="check-box ${zonaTexto === "URBANO" ? "marcado" : ""}">X</span> Zona Urbana</div>
    <div class="zona-check"><span class="check-box ${zonaTexto === "RURAL" ? "marcado" : ""}">X</span> Zona Rural</div>
  </div>

  <div class="cuerpo">
    <p>La Dirección de Obras Municipales de ${MUNICIPIO}, certifica que al predio ubicado en
    <strong>${calleNumeroTexto}</strong>,${manzanaLoteTexto}
    ${localidadTexto}${rol ? `, con Rol SII N° <strong>${rol}</strong>` : ""},
    le corresponde el número domiciliario:</p>

    <p style="text-align:center; margin: 24px 0;">
      <span class="numero-asignado">${numOficial}</span>
    </p>

    <p>El presente certificado se otorga para los efectos legales que correspondan.</p>
  </div>

  <div class="valido">
    Vigencia: 12 meses desde la fecha de emisión. Pasado ese plazo deberá solicitarse nuevamente.
  </div>

  <div class="firma">
    <div class="firma-linea">
      <strong>${DIRECTOR}</strong>
      ${CARGO}
    </div>
  </div>

  <div class="aviso">
    Documento de referencia generado electrónicamente. Para tener validez oficial debe ser firmado y timbrado por el Director de Obras Municipales.
  </div>
</div>
<button class="print-btn" onclick="window.print()">Imprimir certificado</button>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    } else {
      alert("El navegador bloqueó la ventana emergente. Permita las ventanas emergentes para este sitio e intente nuevamente.");
    }
  }

  /* ── correo de consulta (sin datos encontrados) ── */
  function enviarCorreoConsulta() {
    const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
    const nombre    = get("cn-nombre")    || "(no indicado)";
    const rol       = get("cn-rol")       || "(no indicado)";
    const calle     = get("cn-calle")     || get("cn-direccion") || "(no indicada)";
    const numero    = get("cn-numero");
    const localidad = get("cn-localidad") || MUNICIPIO;
    const email     = get("cn-email")     || "";
    const telefono  = get("cn-telefono")  || "";

    const dir = numero ? `${calle} N° ${numero}` : calle;

    const asunto = encodeURIComponent("Solicitud Certificado de Número — DOM Doñihue");
    const cuerpo = encodeURIComponent(
      `Estimados,\n\n` +
      `Solicito información para obtener el Certificado de Número del siguiente predio:\n\n` +
      `  Nombre propietario/solicitante: ${nombre}\n` +
      `  Dirección:                      ${dir}, ${localidad}\n` +
      `  Rol SII:                        ${rol}\n` +
      (email    ? `  E-mail de contacto:             ${email}\n` : "") +
      (telefono ? `  Teléfono:                       ${telefono}\n` : "") +
      `\nQuedo atento(a) a su respuesta.\n\nSaludos cordiales.`
    );
    window.location.href = `mailto:${DOM_EMAIL}?subject=${asunto}&body=${cuerpo}`;
  }

  /* ── init ── */
  function init() {
    const inputBusqueda = document.getElementById("cn-busqueda");
    const btnBuscar     = document.getElementById("cn-btn-buscar");
    const btnGenerar    = document.getElementById("cn-btn-generar");
    const btnCorreo     = document.getElementById("cn-btn-correo");
    const tipoCert      = document.getElementById("tipoCertificado");

    if (btnBuscar) {
      btnBuscar.addEventListener("click", () => {
        const termino = inputBusqueda ? inputBusqueda.value.trim() : "";
        if (!termino) { setStatus("Ingrese un nombre, ROL o dirección para buscar.", "warn"); return; }
        cargarDatos(err => {
          if (err) { setStatus("Error al cargar la base de datos. Verifique su conexión.", "error"); return; }
          const res = buscar(termino);
          renderResultados(res);
        });
      });
    }

    if (inputBusqueda) {
      inputBusqueda.addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); if (btnBuscar) btnBuscar.click(); }
      });
    }

    if (btnGenerar) {
      btnGenerar.addEventListener("click", generarCertificado);
    }

    if (btnCorreo) {
      btnCorreo.addEventListener("click", enviarCorreoConsulta);
    }

    /* Cuando el usuario selecciona NUMERO en el formulario principal, mostrar sugerencia */
    if (tipoCert) {
      tipoCert.addEventListener("change", function () {
        const aviso = document.getElementById("cn-aviso-cip");
        if (!aviso) return;
        if (this.value === "NUMERO") {
          aviso.style.display = "block";
          sincronizarDesdeFormCip();
        } else {
          aviso.style.display = "none";
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

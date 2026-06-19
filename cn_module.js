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

  /* Localidades conocidas del municipio — para detección en direcciones */
  const LOCALIDADES = ["Lo Miranda", "Doñihue", "Peumo", "Coinco", "San Pedro", "Los Lirios", "Las Mercedes"];

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

    /* 1. Detectar localidad al final (separada por espacio, guión o coma) */
    for (const loc of LOCALIDADES) {
      const re = new RegExp("[-,]?\\s*" + loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$", "i");
      if (re.test(texto)) {
        localidad = loc;
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
  function buscar(termino) {
    if (!DATOS || !DATOS.registros) return [];
    const t  = normalizar(termino);
    const tr = normalRol(termino);
    return DATOS.registros
      .map(rec => {
        let score = 0;
        const rolN = normalRol(rec.r || "");
        if (rolN && rolN === tr)               score += 100;
        else if (rolN && rolN.includes(tr))    score += 60;
        if (normalizar(rec.n).includes(t))     score += 40;
        if (normalizar(rec.d || "").includes(t)) score += 30;
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

    /* Nombre: solo si el campo está vacío */
    const campNombre = document.getElementById("nombre");
    if (campNombre && !campNombre.value.trim()) set("nombre", rec.n);

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

    /* Ir al formulario CIP */
    const seccion = document.getElementById("preparar-solicitud");
    if (seccion) {
      setTimeout(() => seccion.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
    }

    setStatus(
      `✓ Datos cargados en el formulario: ${calle}${numero ? " " + numero : ""}${localidad ? ", " + localidad : ""}. Complete el mapa y genere el PDF.`,
      "ok"
    );
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

    setStatus(`${resultados.length} resultado(s). Seleccione el predio para cargar los datos en el formulario.`, "info");

    resultados.forEach(rec => {
      const { calle, numero, localidad } = parsearDireccion(rec.d);
      const item = document.createElement("div");
      item.className = "cn-resultado-item";

      const numTexto  = (numero && numero !== "S/N") ? `<span class="cn-tag cn-tag-num">N° ${numero}</span>` : (numero === "S/N" ? `<span class="cn-tag cn-tag-num">S/N</span>` : "");
      const locTexto  = localidad ? `<span class="cn-tag cn-tag-loc">${localidad}</span>` : "";
      const rolLimpio = String(rec.r || "").replace(/[,;\s]+$/, "");
      const rolTexto  = rolLimpio ? `<span class="cn-tag cn-tag-rol">ROL ${rolLimpio}</span>` : "";
      const fuenteChip = chipFuente(rec.src);

      item.innerHTML = `
        <div class="cn-res-header">
          <span class="cn-res-nombre">${rec.n || "(sin nombre)"}</span>
          ${fuenteChip}
        </div>
        <div class="cn-res-dir">
          ${calle ? `<span class="cn-dir-calle">${calle}</span>` : ""}
          ${numTexto}${locTexto}${rolTexto}
        </div>
        ${rec.m ? `<div class="cn-res-materia">${rec.m}${rec.f ? " · " + rec.f : ""}</div>` : ""}
        <button class="btn btn-accent btn-sm cn-btn-sel">Cargar en formulario CIP →</button>
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
    const inputBusq = document.getElementById("cn-busqueda");
    const btnBuscar = document.getElementById("cn-btn-buscar");

    if (btnBuscar) {
      btnBuscar.addEventListener("click", () => {
        const termino = inputBusq ? inputBusq.value.trim() : "";
        if (!termino) { setStatus("Ingrese nombre, ROL o dirección para buscar.", "warn"); return; }
        cargarDatos(err => {
          if (err) { setStatus("Error al cargar la base de datos.", "error"); return; }
          renderResultados(buscar(termino));
        });
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

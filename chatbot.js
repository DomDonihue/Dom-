/* ================================================================
   chatbot.js  —  DOM en Línea
   NO editar. Toda la configuración está en config.js
   ================================================================ */
(function () {
  // Esperar a que el DOM esté completamente listo
  function init() {

  function cfg(k, d) {
    return (window.DOM_CONFIG && window.DOM_CONFIG[k] !== undefined) ? window.DOM_CONFIG[k] : d;
  }
  function cfgContacto(k, d) {
    const c = cfg("contacto", {}); return c[k] !== undefined ? c[k] : d;
  }
  function reemplazar(texto) {
    return texto
      .replace(/{municipalidad}/g, cfg("municipalidadCorta", cfg("municipalidad","Municipalidad")))
      .replace(/{direccion}/g,     cfgContacto("direccion",""))
      .replace(/{telefono}/g,      cfgContacto("telefono",""))
      .replace(/{email}/g,         cfgContacto("email",""))
      .replace(/{horario}/g,       cfgContacto("horario",""));
  }

  /* ── construir árbol de conversación desde config ── */
  function construirFlujo() {
    const certs    = cfg("certificados", []);
    const urlDom   = cfg("urlDomEnLinea","https://domenlinea.minvu.cl/");
    const cbCfg    = cfg("chatbot", {});
    const muni     = cfg("municipalidadCorta", cfg("municipalidad","Municipalidad"));

    const flujo = {

      inicio: {
        mensaje: reemplazar(cbCfg.saludo || "¡Hola! 👋 Soy el asistente virtual de la DOM de {municipalidad}.\n\n¿En qué puedo ayudarte hoy?"),
        opciones: [
          { texto: "🏛️ ¿Qué es DOM en Línea?",       siguiente: "que_es_dom" },
          { texto: "⚙️ ¿Para qué sirve?",             siguiente: "para_que_sirve" },
          { texto: "🖱️ ¿Cómo lo uso?",                siguiente: "como_lo_uso" },
          { texto: "📄 Certificados disponibles",      siguiente: "certificados" },
          { texto: "🗺️ Preparar solicitud (CIP)",      siguiente: "preparar_solicitud" },
          { texto: "⏱ Plazos de tramitación",          siguiente: "plazos" },
          { texto: "📋 Documentos requeridos",          siguiente: "documentos_general" },
          { texto: "📞 Contacto y horarios",            siguiente: "contacto" }
        ]
      },

      certificados: {
        mensaje: "Estos son los certificados disponibles. ¿Sobre cuál quieres saber más?",
        opciones: [
          ...certs.map((c, i) => ({ texto: `📄 ${c.nombre}`, siguiente: `cert_${i}` }))
        ]
      },

      preparar_solicitud: {
        mensaje: "📝 **Preparar solicitud paso a paso**\n\nEn esta misma página puedes preparar tu solicitud del CIP antes de ingresar a DOM en Línea.\n\n1️⃣ Ubica tu predio en el mapa\n2️⃣ Completa tus datos personales\n3️⃣ Descarga el formulario PDF",
        opciones: [
          { texto: "🗺️ Ir al asistente de solicitud", accion: "scroll_a", id: "preparar-solicitud" },
          { texto: "❓ ¿Qué necesito tener listo?",   siguiente: "que_necesito" },
          { texto: "🌐 Ir directamente a DOM en Línea", accion: "abrir_url", url: urlDom }
        ]
      },

      que_necesito: {
        mensaje: reemplazar(cbCfg.mensajeQueNecesito || "✅ **¿Qué necesito tener listo?**\n\n• Rol de avalúo\n• Dirección exacta\n• Croquis o ubicación en mapa\n• Dominio Vigente\n• Copia de escritura\n• ClaveÚnica\n• Documentos digitalizados"),
        opciones: [
          { texto: "🔑 Recuperar ClaveÚnica", accion: "abrir_url", url: "https://claveunica.gob.cl/recuperar" },
          { texto: "🗺️ Preparar solicitud ahora", accion: "scroll_a", id: "preparar-solicitud" }
        ]
      },

      plazos: {
        mensaje: "⏱️ **Plazos de tramitación**\n\nLos plazos son **referenciales** y pueden variar según complejidad del caso, cantidad de solicitudes y antecedentes incompletos.\n\n" +
          certs.map(c => `• **${c.nombre}:** ${c.plazo}`).join("\n"),
        opciones: [
          { texto: "📞 Consultar mi trámite",  siguiente: "contacto" },
          { texto: "🌐 Ver en DOM en Línea",    accion: "abrir_url", url: urlDom }
        ]
      },

      documentos_general: {
        mensaje: "📋 **Documentos generalmente requeridos**\n\n• **Rol de avalúo** — Número SII del predio\n• **Croquis de ubicación** — Boceto del predio\n• **Dominio Vigente** — Conservador de Bienes Raíces\n• **Copia Escritura** — Del inmueble\n\nAlgunos certificados pueden pedir documentos adicionales.",
        opciones: [
          { texto: "📄 Ver documentos por certificado", siguiente: "certificados" },
          { texto: "📝 Preparar solicitud CIP",         siguiente: "preparar_solicitud" }
        ]
      },

      contacto: {
        mensaje: reemplazar(cbCfg.mensajeContacto || "📞 **Contacto DOM de {municipalidad}**\n\n📍 {direccion}\n☎️ {telefono}\n✉️ {email}\n\n⏰ **Horarios:**\n{horario}"),
        opciones: [
          { texto: "🌐 Ir a DOM en Línea", accion: "abrir_url", url: urlDom }
        ]
      },

      que_es_dom: {
        mensaje: reemplazar(cbCfg.mensajeQueEsDom || "🏛️ **¿Qué es DOM en Línea?**\n\nEs la plataforma digital de la Dirección de Obras Municipales que permite gestionar certificados y trámites sin necesidad de acudir presencialmente."),
        opciones: [
          { texto: "⚙️ ¿Para qué sirve?",           siguiente: "para_que_sirve" },
          { texto: "🖱️ ¿Cómo lo uso?",              siguiente: "como_lo_uso" },
          { texto: "🗺️ Preparar solicitud ahora",    accion: "scroll_a", id: "preparar-solicitud" }
        ]
      },

      para_que_sirve: {
        mensaje: reemplazar(cbCfg.mensajeParaQueSirve || "⚙️ **¿Para qué sirve DOM en Línea?**\n\nPermite orientar a los usuarios, agilizar procesos y facilitar la solicitud de certificados municipales."),
        opciones: [
          { texto: "🏛️ ¿Qué es DOM en Línea?",      siguiente: "que_es_dom" },
          { texto: "🖱️ ¿Cómo lo uso?",              siguiente: "como_lo_uso" },
          { texto: "📄 Ver certificados",             siguiente: "certificados" }
        ]
      },

      como_lo_uso: {
        mensaje: reemplazar(cbCfg.mensajeComoLoUso || "🖱️ **¿Cómo se usa DOM en Línea?**\n\n1️⃣ Selecciona el certificado\n2️⃣ Revisa los documentos requeridos\n3️⃣ Ubica tu predio en el mapa\n4️⃣ Descarga el formulario PDF\n5️⃣ Ingresa a domenlinea.minvu.cl con tu ClaveÚnica"),
        opciones: [
          { texto: "🗺️ Ir al asistente de solicitud", accion: "scroll_a", id: "preparar-solicitud" },
          { texto: "❓ ¿Qué necesito tener listo?",   siguiente: "que_necesito" },
          { texto: "🌐 Ir a DOM en Línea",             accion: "abrir_url", url: urlDom }
        ]
      }
    };

    /* nodos dinámicos por cada certificado */
    certs.forEach((c, i) => {
      flujo[`cert_${i}`] = {
        mensaje: `📄 **${c.nombre}**\n\n${c.descripcion}\n\n**Plazo:** ${c.plazo}\n\n**Documentos requeridos:**\n${c.documentos.map(d => `• ${d}`).join("\n")}`,
        opciones: [
          { texto: "🌐 Ir a DOM en Línea",    accion: "abrir_url", url: urlDom },
          { texto: "← Ver otros certificados", siguiente: "certificados" }
        ]
      };
    });

    return flujo;
  }

  /* ── estilos ── */
  const CSS = `
    #cb-burbuja{position:fixed;bottom:28px;right:28px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#2f76ea,#5a9cff);color:#fff;border:none;cursor:pointer;box-shadow:0 6px 24px rgba(47,118,234,.45);display:flex;align-items:center;justify-content:center;font-size:1.5rem;z-index:9999;transition:transform .2s,box-shadow .2s}
    #cb-burbuja:hover{transform:scale(1.08);box-shadow:0 8px 28px rgba(47,118,234,.55)}
    #cb-burbuja .cb-badge{position:absolute;top:-2px;right:-2px;width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid #fff;display:none}
    #cb-ventana{position:fixed;bottom:104px;right:28px;width:370px;max-width:calc(100vw - 32px);max-height:580px;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(15,60,104,.18);display:flex;flex-direction:column;overflow:hidden;z-index:9998;border:1px solid #e3e8f0;transform:scale(.92) translateY(12px);opacity:0;pointer-events:none;transition:transform .22s cubic-bezier(.34,1.56,.64,1),opacity .18s ease}
    #cb-ventana.abierto{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
    .cb-header{background:linear-gradient(135deg,#0f3c68,#1a5ba8);padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}
    .cb-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
    .cb-header-info strong{display:block;color:#fff;font-size:.97rem}
    .cb-header-info span{color:rgba(255,255,255,.75);font-size:.8rem}
    .cb-header-info{flex:1}
    .cb-cerrar{background:none;border:none;color:rgba(255,255,255,.8);font-size:1.4rem;cursor:pointer;padding:4px;border-radius:8px;line-height:1}
    .cb-cerrar:hover{color:#fff;background:rgba(255,255,255,.1)}
    .cb-mensajes{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#f8fafd;scroll-behavior:smooth}
    .cb-mensajes::-webkit-scrollbar{width:4px}
    .cb-mensajes::-webkit-scrollbar-thumb{background:#c8d6e8;border-radius:4px}
    .cb-burbuja-msg{max-width:88%;padding:10px 14px;border-radius:16px;font-size:.88rem;line-height:1.55;animation:cbFade .2s ease}
    .cb-burbuja-msg.bot{background:#fff;color:#1f2d3d;border:1px solid #e3e8f0;border-bottom-left-radius:4px;align-self:flex-start}
    .cb-burbuja-msg.usuario{background:linear-gradient(135deg,#2f76ea,#4a8ff0);color:#fff;border-bottom-right-radius:4px;align-self:flex-end}
    @keyframes cbFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .cb-opciones{padding:10px 14px 14px;display:flex;flex-direction:column;gap:7px;background:#f8fafd;border-top:1px solid #edf1f7;flex-shrink:0}
    .cb-btn{width:100%;text-align:left;background:#fff;border:1.5px solid #dbe7f8;border-radius:10px;padding:9px 13px;font-size:.85rem;color:#0f3c68;font-weight:700;cursor:pointer;transition:background .15s,border-color .15s,transform .1s}
    .cb-btn:hover{background:#eaf2ff;border-color:#2f76ea;transform:translateX(2px)}
    .cb-btn:active{transform:scale(.98)}
    .cb-typing{display:flex;gap:4px;align-items:center;padding:10px 14px;background:#fff;border:1px solid #e3e8f0;border-radius:16px;border-bottom-left-radius:4px;width:fit-content;animation:cbFade .2s ease}
    .cb-typing span{width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:cbDot 1.2s infinite}
    .cb-typing span:nth-child(2){animation-delay:.2s}
    .cb-typing span:nth-child(3){animation-delay:.4s}
    @keyframes cbDot{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
    @media(max-width:420px){#cb-ventana{right:12px;bottom:96px;width:calc(100vw - 24px)}#cb-burbuja{right:16px;bottom:20px}}
    .cb-btn-home{border-color:#e2e8f0;color:#64748b;font-weight:600;margin-top:4px;border-style:dashed}
    .cb-btn-home:hover{background:#f8fafc;border-color:#94a3b8;color:#334155;transform:none}
  `;

  const st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);

  /* ── DOM del chatbot ── */
  const muni = (window.DOM_CONFIG && window.DOM_CONFIG.municipalidadCorta) || (window.DOM_CONFIG && window.DOM_CONFIG.municipalidad) || "Municipalidad";

  const burbuja = document.createElement("button");
  burbuja.id = "cb-burbuja";
  burbuja.setAttribute("aria-label","Abrir asistente virtual");
  burbuja.innerHTML = `<span>💬</span><span class="cb-badge" aria-hidden="true"></span>`;
  document.body.appendChild(burbuja);

  const ventana = document.createElement("div");
  ventana.id = "cb-ventana";
  ventana.setAttribute("role","dialog");
  ventana.setAttribute("aria-label","Asistente DOM");
  ventana.innerHTML = `
    <div class="cb-header">
      <div class="cb-avatar">🏛️</div>
      <div class="cb-header-info">
        <strong>Asistente DOM</strong>
        <span>Municipalidad de ${muni}</span>
      </div>
      <button class="cb-cerrar" id="cb-cerrar" aria-label="Cerrar">✕</button>
    </div>
    <div class="cb-mensajes" id="cb-mensajes"></div>
    <div class="cb-opciones"  id="cb-opciones"></div>`;
  document.body.appendChild(ventana);

  /* ── estado ── */
  let abierto = false;
  let nodoActual = "inicio";
  let FLUJO = {};

  function toggle() {
    abierto = !abierto;
    ventana.classList.toggle("abierto", abierto);
    burbuja.querySelector(".cb-badge").style.display = "none";
    burbuja.querySelector("span:first-child").textContent = abierto ? "✕" : "💬";
    if (abierto && document.getElementById("cb-mensajes").children.length === 0) {
      FLUJO = construirFlujo();
      mostrarNodo("inicio");
    }
  }

  function addMsg(texto, esBot) {
    const el = document.createElement("div");
    el.className = `cb-burbuja-msg ${esBot ? "bot" : "usuario"}`;
    el.innerHTML = texto.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>");
    document.getElementById("cb-mensajes").appendChild(el);
    document.getElementById("cb-mensajes").scrollTop = 9999;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "cb-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    document.getElementById("cb-mensajes").appendChild(el);
    document.getElementById("cb-mensajes").scrollTop = 9999;
    return el;
  }

  function showOpciones(opciones) {
    const c = document.getElementById("cb-opciones");
    c.innerHTML = "";
    opciones.forEach(op => {
      const b = document.createElement("button");
      b.className = "cb-btn"; b.textContent = op.texto;
      b.addEventListener("click", () => handleOpcion(op));
      c.appendChild(b);
    });

    // Botón fijo de inicio — siempre visible excepto en la pantalla de inicio
    if (nodoActual !== "inicio") {
      const btnHome = document.createElement("button");
      btnHome.className = "cb-btn cb-btn-home";
      btnHome.textContent = "🏠 Volver al inicio";
      btnHome.addEventListener("click", () => mostrarNodo("inicio", "🏠 Volver al inicio"));
      c.appendChild(btnHome);
    }
  }

  function mostrarNodo(id, textoUsuario = null) {
    nodoActual = id;
    const nodo = FLUJO[id];
    if (!nodo) return;
    document.getElementById("cb-opciones").innerHTML = "";
    if (textoUsuario) addMsg(textoUsuario, false);
    const typing = showTyping();
    setTimeout(() => {
      typing.remove();
      addMsg(nodo.mensaje, true);
      showOpciones(nodo.opciones);
    }, textoUsuario ? 650 : 380);
  }

  function resetConversacion() {
    document.getElementById("cb-mensajes").innerHTML = "";
    document.getElementById("cb-opciones").innerHTML = "";
    nodoActual = "inicio";
  }

  function volverAlInicio() {
    const typing = showTyping();
    setTimeout(() => {
      typing.remove();
      addMsg("¿Puedo ayudarte en algo más?", true);
      nodoActual = "inicio";
      const nodoInicio = FLUJO["inicio"];
      if (nodoInicio) showOpciones(nodoInicio.opciones);
    }, 650);
  }

  function handleOpcion(op) {
    if (op.accion === "abrir_url") {
      addMsg(op.texto, false);
      document.getElementById("cb-opciones").innerHTML = "";
      setTimeout(() => {
        window.open(op.url, "_blank");
        volverAlInicio();
      }, 300);
      return;
    }
    if (op.accion === "scroll_a") {
      addMsg(op.texto, false);
      document.getElementById("cb-opciones").innerHTML = "";
      const el = document.getElementById(op.id);
      if (el) {
        setTimeout(() => {
          toggle();
          resetConversacion();
          setTimeout(() => el.scrollIntoView({ behavior:"smooth", block:"start" }), 200);
        }, 300);
      }
      return;
    }
    if (op.siguiente) mostrarNodo(op.siguiente, op.texto);
  }

  burbuja.addEventListener("click", toggle);
  document.getElementById("cb-cerrar").addEventListener("click", () => {
    abierto = true;
    toggle();
    setTimeout(resetConversacion, 300);
  });

  // badge de notificación después de 3 segundos
  setTimeout(() => { if (!abierto) burbuja.querySelector(".cb-badge").style.display = "block"; }, 3000);
  } // fin init()

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
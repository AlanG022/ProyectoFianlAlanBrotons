
// ============================================================

// ─── Configuración de colores por tipo de toast ───────────────
const TOAST_COLORES = {
  exito:   "linear-gradient(135deg, #1a3a1a, #2d6a2d)",
  error:   "linear-gradient(135deg, #3a1a1a, #6a2d2d)",
  info:    "linear-gradient(135deg, #3a2e0a, #7a6028)",
  warning: "linear-gradient(135deg, #3a2e0a, #c9a84c)",
};

const TOAST_ICONOS = {
  exito:   "✓",
  error:   "✕",
  info:    "◆",
  warning: "⚠",
};

// ─── Notificaciones (Toastify JS) ─────────────────────────────

/**
 * Muestra una notificación toast usando la librería Toastify JS.
 * Reemplaza el uso de alert() nativo del navegador.
 * @param {string} mensaje - Texto a mostrar
 * @param {"exito"|"error"|"info"|"warning"} tipo - Tipo de notificación
 */
const mostrarToast = (mensaje, tipo = "info") => {
  Toastify({
    text: `${TOAST_ICONOS[tipo] || "◆"}  ${mensaje}`,
    duration: 3500,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
      background:  TOAST_COLORES[tipo] || TOAST_COLORES.info,
      border:      "1px solid rgba(201, 168, 76, 0.3)",
      borderRadius:"0px",
      fontFamily:  "'Montserrat', sans-serif",
      fontSize:    "0.85rem",
      letterSpacing:"0.03em",
      padding:     "1rem 1.4rem",
      boxShadow:   "0 4px 24px rgba(0,0,0,0.5)",
      color:       "#f5f0e8",
      minWidth:    "280px",
    },
  }).showToast();
};

// ─── Confirmaciones (SweetAlert2) ─────────────────────────────

/**
 * Muestra un diálogo de confirmación elegante con SweetAlert2.
 * Reemplaza el uso de confirm() nativo del navegador.
 * @param {string} titulo - Título del diálogo
 * @param {string} texto - Descripción
 * @param {string} textoBoton - Texto del botón de confirmación
 * @returns {Promise<boolean>}
 */
const mostrarConfirmacion = async (titulo, texto, textoBoton = "Confirmar") => {
  const resultado = await Swal.fire({
    title: titulo,
    text: texto,
    icon: "question",
    showCancelButton:   true,
    confirmButtonText:  textoBoton,
    cancelButtonText:   "Cancelar",
    background:         "#0f0f0f",
    color:              "#f5f0e8",
    confirmButtonColor: "#c9a84c",
    cancelButtonColor:  "#3a3020",
    backdrop:           "rgba(0,0,0,0.85)",
  });
  return resultado.isConfirmed;
};

/**
 * Muestra un diálogo de éxito con SweetAlert2.
 * @param {string} titulo
 * @param {string} texto
 */
const mostrarExito = (titulo, texto) => {
  Swal.fire({
    title:             titulo,
    text:              texto,
    icon:              "success",
    confirmButtonText: "Perfecto",
    background:        "#0f0f0f",
    color:             "#f5f0e8",
    confirmButtonColor:"#c9a84c",
    iconColor:         "#c9a84c",
    backdrop:          "rgba(0,0,0,0.85)",
  });
};

/**
 * Muestra un diálogo de error con SweetAlert2.
 * @param {string} titulo
 * @param {string} texto
 */
const mostrarError = (titulo, texto) => {
  Swal.fire({
    title:             titulo,
    text:              texto,
    icon:              "error",
    confirmButtonText: "Entendido",
    background:        "#0f0f0f",
    color:             "#f5f0e8",
    confirmButtonColor:"#c9a84c",
    iconColor:         "#ef4444",
    backdrop:          "rgba(0,0,0,0.85)",
  });
};

// ─── Cursor personalizado ─────────────────────────────────────

/**
 * Inicializa el cursor personalizado con animación suave.
 * Agrega efecto de escala al pasar sobre elementos interactivos.
 */
const inicializarCursor = () => {
  const cursor = document.getElementById("cursor");
  const ring   = document.getElementById("cursor-ring");
  const trail  = document.getElementById("cursor-trail");
  if (!cursor || !ring || !trail) return;

  let mx = 0, my = 0, rx = 0, ry = 0, tx = 0, ty = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx - 5}px,${my - 5}px)`;
  });

  const animar = () => {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    tx += (mx - tx) * 0.06;
    ty += (my - ty) * 0.06;
    ring.style.transform  = `translate(${rx - 22}px,${ry - 22}px)`;
    trail.style.transform = `translate(${tx - 3}px,${ty - 3}px)`;
    requestAnimationFrame(animar);
  };
  animar();

  const selectoresInteractivos = [
    "a", "button",
    ".servicio-card", ".channel-card",
    ".value-item",    ".number-card",
    ".cat-btn",       ".extra-item",
  ].join(", ");

  document.querySelectorAll(selectoresInteractivos).forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.style.width       = "70px";
      ring.style.height      = "70px";
      ring.style.borderColor = "var(--gold2)";
      ring.style.opacity     = "0.5";
    });
    el.addEventListener("mouseleave", () => {
      ring.style.width       = "44px";
      ring.style.height      = "44px";
      ring.style.borderColor = "var(--gold)";
      ring.style.opacity     = "1";
    });
  });
};

// ─── Partículas de fondo ──────────────────────────────────────

/**
 * Genera partículas flotantes decorativas en el fondo de la página.
 * Cada partícula tiene tamaño, posición y duración aleatoria.
 */
const generarParticulas = () => {
  const contenedor = document.getElementById("particles");
  if (!contenedor) return;

  for (let i = 0; i < 30; i++) {
    const p = document.createElement("div");
    p.className               = "particle";
    p.style.left              = Math.random() * 100 + "%";
    p.style.animationDuration = 10 + Math.random() * 20 + "s";
    p.style.animationDelay    = Math.random() * 20 + "s";
    const s = 0.8 + Math.random() * 2 + "px";
    p.style.width = p.style.height = s;
    contenedor.appendChild(p);
  }
};

// ─── Formulario de contacto ───────────────────────────────────

/**
 * Valida y envía el formulario de contacto por WhatsApp.
 * Usa SweetAlert2 para errores de validación en lugar de alert().
 */
function enviarContacto() {
  const nombre   = document.getElementById("contact-nombre").value.trim();
  const servicio = document.getElementById("contact-servicio").value;
  const mensaje  = document.getElementById("contact-msg").value.trim();

  if (!nombre || !servicio) {
    mostrarError("Datos incompletos", "Completá tu nombre y el servicio que necesitás.");
    return;
  }

  const texto = `Hola Alan! Soy ${nombre}. Me interesa: ${servicio}. ${mensaje ? "Detalle: " + mensaje : ""}`;
  window.open(`https://wa.me/541122509964?text=${encodeURIComponent(texto)}`, "_blank");

  document.getElementById("contact-sent").style.display = "block";
  mostrarToast("¡Mensaje enviado! Te respondo pronto.", "exito");
}

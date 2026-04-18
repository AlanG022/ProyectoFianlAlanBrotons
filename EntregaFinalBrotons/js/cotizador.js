
// ============================================================

// ─── Estado global de la aplicación ─────────────────────────
// Objeto central que concentra todos los datos en tiempo real
const estado = {
  servicios:            [],   // Catálogo cargado desde JSON
  extras:               [],   // Extras disponibles desde JSON
  descuentos:           [],   // Códigos de descuento desde JSON
  carrito:              [],   // Servicios seleccionados por el usuario
  extrasSeleccionados:  [],   // IDs de extras elegidos
  codigoDescuento:      null, // Objeto descuento aplicado (o null)
  paso:                 1,    // Paso actual del cotizador (1, 2 o 3)
};

// ─── Utilidades ──────────────────────────────────────────────

/**
 * Formatea un número como precio en pesos argentinos (ARS).
 * @param {number} monto
 * @returns {string} Precio formateado, ej: "$10.000"
 */
const formatearPrecio = (monto) =>
  monto.toLocaleString("es-AR", {
    style:                "currency",
    currency:             "ARS",
    maximumFractionDigits: 0,
  });

/**
 * Genera un ID único para cada cotización usando timestamp en base36.
 * @returns {string} Ej: "COT-LK3F2A"
 */
const generarIdCotizacion = () =>
  "COT-" + Date.now().toString(36).toUpperCase();

// ─── Carga de datos remotos (fetch + JSON) ───────────────────

/**
 * Carga el catálogo de servicios, extras y descuentos
 * desde el archivo data/servicios.json de forma asíncrona.
 * Si el fetch falla, activa el fallback con datos embebidos.
 * @returns {Promise<void>}
 */
const cargarDatos = async () => {
  try {
    const respuesta = await fetch("data/servicios.json");
    if (!respuesta.ok) throw new Error(`HTTP error: ${respuesta.status}`);
    const datos = await respuesta.json();

    estado.servicios  = datos.servicios;
    estado.extras     = datos.extras;
    estado.descuentos = datos.descuentos;

    inicializarApp();
  } catch {
    // Si falla la red o el archivo no existe, usamos datos locales
    cargarDatosFallback();
  }
};

/**
 * Datos de respaldo embebidos para cuando el fetch falla.
 * Permite que el cotizador funcione incluso sin servidor.
 */
const cargarDatosFallback = () => {
  estado.servicios = [
    {
      id: "mant-basico", categoria: "mantenimiento",
      nombre: "Mantenimiento Básico",
      descripcion: "Limpieza y optimización del sistema.",
      precio: 8000, tiempo: "1-2 días",
      incluye: ["Limpieza física", "Optimización", "Revisión general"],
    },
    {
      id: "mant-completo", categoria: "mantenimiento",
      nombre: "Mantenimiento Completo",
      descripcion: "Mantenimiento avanzado con actualización de drivers.",
      precio: 14000, tiempo: "2-3 días",
      incluye: ["Todo el básico", "Drivers actualizados", "Antivirus", "Soporte 30 días"],
    },
    {
      id: "reparacion-software", categoria: "reparacion",
      nombre: "Reparación de Software",
      descripcion: "Reinstalación y recuperación de datos.",
      precio: 10000, tiempo: "1-3 días",
      incluye: ["Reinstalación Windows", "Recuperación de datos", "Antivirus"],
    },
    {
      id: "reparacion-hardware", categoria: "reparacion",
      nombre: "Reparación de Hardware",
      descripcion: "Diagnóstico y reparación de componentes físicos.",
      precio: 15000, tiempo: "3-7 días",
      incluye: ["Diagnóstico completo", "Reemplazo de piezas", "Garantía 90 días"],
    },
    {
      id: "web-landing", categoria: "web",
      nombre: "Landing Page",
      descripcion: "Página de presentación profesional de una sola sección.",
      precio: 35000, tiempo: "3-5 días",
      incluye: ["Diseño personalizado", "Responsive", "Formulario de contacto"],
    },
    {
      id: "web-portfolio", categoria: "web",
      nombre: "Sitio Portfolio",
      descripcion: "Sitio completo con múltiples secciones.",
      precio: 60000, tiempo: "7-10 días",
      incluye: ["5 secciones", "SEO básico", "3 revisiones incluidas"],
    },
    {
      id: "web-ecommerce", categoria: "web",
      nombre: "Tienda Online",
      descripcion: "Ecommerce completo con carrito de compras.",
      precio: 120000, tiempo: "15-20 días",
      incluye: ["Catálogo de productos", "Carrito de compras", "Integración MercadoPago"],
    },
  ];

  estado.extras = [
    { id: "urgente",      nombre: "Urgente (prioridad máxima)", precio: 5000  },
    { id: "domicilio",    nombre: "Visita a domicilio",          precio: 3000  },
    { id: "garantia-ext", nombre: "Garantía extendida",          precio: 4000  },
    { id: "hosting",      nombre: "Hosting + dominio 1 año",     precio: 15000 },
  ];

  estado.descuentos = [
    { codigo: "ALAN10",  porcentaje: 10, descripcion: "10% descuento especial"  },
    { codigo: "PROMO20", porcentaje: 20, descripcion: "20% promoción activa"    },
    { codigo: "PRIMERA", porcentaje: 15, descripcion: "15% primera vez"         },
  ];

  inicializarApp();
};

// ─── Inicialización ───────────────────────────────────────────

/**
 * Punto de entrada de la aplicación luego de cargar los datos.
 * Precarga el formulario y renderiza el primer paso.
 */
const inicializarApp = () => {
  precargarFormulario();
  renderizarPaso1();
  actualizarResumen();
};

/**
 * Precarga datos de ejemplo en los campos del formulario.
 * Requisito explícito del proyecto CoderHouse.
 */
const precargarFormulario = () => {
  const camposDefault = {
    "cotiz-nombre": "Juan García",
    "cotiz-email":  "juan@email.com",
    "cotiz-tel":    "1155667788",
  };

  Object.entries(camposDefault).forEach(([id, valor]) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = valor;
  });
};

// ─── Renderizado — Paso 1: Selección de servicios ─────────────

/**
 * Renderiza los botones de categoría y el grid inicial de servicios.
 */
const renderizarPaso1 = () => {
  const categorias = {
    mantenimiento: { label: "Mantenimiento", icon: "🔧" },
    reparacion:    { label: "Reparación",    icon: "💻" },
    web:           { label: "Diseño Web",    icon: "🌐" },
  };

  const contenedorCats = document.getElementById("categorias-filtro");
  if (!contenedorCats) return;

  // Renderizar botones de filtro por categoría
  contenedorCats.innerHTML = Object.entries(categorias)
    .map(([key, val]) => `
      <button class="cat-btn" data-cat="${key}" onclick="filtrarPorCategoria('${key}')">
        <span class="cat-icon">${val.icon}</span>
        <span>${val.label}</span>
      </button>`)
    .join("");

  // Mostrar todos los servicios al inicio
  renderizarTarjetasServicio(estado.servicios);
};

/**
 * Filtra y renderiza los servicios según la categoría elegida.
 * Actualiza visualmente el botón activo.
 * @param {string} categoria - clave de categoría ("mantenimiento", "reparacion", "web")
 */
const filtrarPorCategoria = (categoria) => {
  // Marcar botón activo
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.classList.toggle("activo", btn.dataset.cat === categoria);
  });

  const serviciosFiltrados = estado.servicios.filter((s) => s.categoria === categoria);
  renderizarTarjetasServicio(serviciosFiltrados);
};

/**
 * Genera el HTML de las tarjetas de servicio y las inyecta en el DOM.
 * Marca como seleccionadas las que ya están en el carrito.
 * @param {Array<Object>} lista - Array de objetos servicio a renderizar
 */
const renderizarTarjetasServicio = (lista) => {
  const contenedor = document.getElementById("servicios-grid");
  if (!contenedor) return;

  contenedor.innerHTML = lista
    .map((servicio) => {
      const estaEnCarrito = estado.carrito.some((c) => c.id === servicio.id);
      return `
        <div class="servicio-card ${estaEnCarrito ? "seleccionado" : ""}"
             id="card-${servicio.id}"
             onclick="toggleServicio('${servicio.id}')">
          <div class="servicio-card-header">
            <span class="servicio-precio">${formatearPrecio(servicio.precio)}</span>
            <span class="servicio-tiempo">⏱ ${servicio.tiempo}</span>
          </div>
          <h4 class="servicio-nombre">${servicio.nombre}</h4>
          <p class="servicio-desc">${servicio.descripcion}</p>
          <ul class="servicio-incluye">
            ${servicio.incluye.map((item) => `<li>◆ ${item}</li>`).join("")}
          </ul>
          <div class="servicio-check">✓ Agregado</div>
        </div>`;
    })
    .join("");
};

// ─── Lógica del Carrito ───────────────────────────────────────

/**
 * Agrega o quita un servicio del carrito al hacer clic en su tarjeta.
 * Actualiza el resumen lateral y el contador del carrito.
 * @param {string} id - ID del servicio a togglear
 */
const toggleServicio = (id) => {
  const servicio = estado.servicios.find((s) => s.id === id);
  if (!servicio) return;

  const indiceEnCarrito = estado.carrito.findIndex((c) => c.id === id);

  if (indiceEnCarrito >= 0) {
    // Ya estaba → quitar del carrito
    estado.carrito.splice(indiceEnCarrito, 1);
    document.getElementById(`card-${id}`)?.classList.remove("seleccionado");
  } else {
    // No estaba → agregar (copia del objeto para evitar mutaciones)
    estado.carrito.push({ ...servicio });
    document.getElementById(`card-${id}`)?.classList.add("seleccionado");
  }

  actualizarResumen();
  actualizarContadorCarrito();
};

/**
 * Actualiza el badge numérico del carrito en el panel resumen.
 * Lo oculta si el carrito está vacío.
 */
const actualizarContadorCarrito = () => {
  const cantidad = estado.carrito.length;
  const badge    = document.getElementById("carrito-contador");
  if (!badge) return;
  badge.textContent  = cantidad;
  badge.style.display = cantidad > 0 ? "flex" : "none";
};

// ─── Renderizado — Paso 2: Extras ─────────────────────────────

/**
 * Renderiza el listado de extras disponibles como checkboxes.
 * Preserva el estado (checked) de los extras ya seleccionados.
 */
const renderizarExtras = () => {
  const contenedor = document.getElementById("extras-lista");
  if (!contenedor) return;

  contenedor.innerHTML = estado.extras
    .map((extra) => {
      const marcado = estado.extrasSeleccionados.includes(extra.id);
      return `
        <label class="extra-item ${marcado ? "activo" : ""}">
          <input type="checkbox" value="${extra.id}"
            ${marcado ? "checked" : ""}
            onchange="toggleExtra('${extra.id}')">
          <span class="extra-nombre">${extra.nombre}</span>
          <span class="extra-precio">+${formatearPrecio(extra.precio)}</span>
        </label>`;
    })
    .join("");
};

/**
 * Agrega o quita un extra de la selección al hacer clic en su checkbox.
 * @param {string} id - ID del extra a togglear
 */
const toggleExtra = (id) => {
  const indice = estado.extrasSeleccionados.indexOf(id);

  if (indice >= 0) {
    estado.extrasSeleccionados.splice(indice, 1);
    document.querySelector(`label:has(input[value="${id}"])`)?.classList.remove("activo");
  } else {
    estado.extrasSeleccionados.push(id);
    document.querySelector(`label:has(input[value="${id}"])`)?.classList.add("activo");
  }

  actualizarResumen();
};

// ─── Descuentos ───────────────────────────────────────────────

/**
 * Valida el código ingresado contra el array de descuentos.
 * Si es válido lo aplica; si no, lo limpia y avisa.
 * Usa Toastify para feedback visual (librería externa).
 */
const aplicarDescuento = () => {
  const input   = document.getElementById("codigo-descuento");
  const codigo  = input?.value?.trim().toUpperCase();
  const encontrado = estado.descuentos.find((d) => d.codigo === codigo);

  if (encontrado) {
    estado.codigoDescuento = encontrado;
    mostrarToast(`✓ ${encontrado.descripcion}`, "exito");
    if (input) input.style.borderColor = "var(--gold)";
  } else {
    estado.codigoDescuento = null;
    mostrarToast("Código no válido. Probá: ALAN10, PROMO20 o PRIMERA", "error");
    if (input) input.style.borderColor = "#ef4444";
  }

  actualizarResumen();
};

// ─── Cálculos de totales ──────────────────────────────────────

/**
 * Suma los precios de todos los servicios en el carrito.
 * @returns {number} Subtotal de servicios
 */
const calcularSubtotalServicios = () =>
  estado.carrito.reduce((acum, s) => acum + s.precio, 0);

/**
 * Suma los precios de todos los extras seleccionados.
 * @returns {number} Subtotal de extras
 */
const calcularSubtotalExtras = () =>
  estado.extrasSeleccionados.reduce((acum, id) => {
    const extra = estado.extras.find((e) => e.id === id);
    return acum + (extra ? extra.precio : 0);
  }, 0);

/**
 * Calcula el monto a descontar según el código aplicado.
 * @param {number} subtotal - Base sobre la que se aplica el porcentaje
 * @returns {number} Monto del descuento (0 si no hay código)
 */
const calcularDescuento = (subtotal) => {
  if (!estado.codigoDescuento) return 0;
  return Math.round((subtotal * estado.codigoDescuento.porcentaje) / 100);
};

/**
 * Recalcula todos los totales y actualiza el panel de resumen lateral.
 * Se llama cada vez que cambia el carrito, los extras o el descuento.
 */
const actualizarResumen = () => {
  const subServicios = calcularSubtotalServicios();
  const subExtras    = calcularSubtotalExtras();
  const subtotal     = subServicios + subExtras;
  const descuento    = calcularDescuento(subtotal);
  const total        = subtotal - descuento;

  // Helper para actualizar texto de un elemento por ID
  const setText = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };

  setText("resumen-servicios-precio", formatearPrecio(subServicios));
  setText("resumen-extras-precio",    formatearPrecio(subExtras));
  setText("resumen-subtotal",         formatearPrecio(subtotal));
  setText("resumen-descuento",        descuento > 0 ? `-${formatearPrecio(descuento)}` : formatearPrecio(0));
  setText("resumen-total",            formatearPrecio(total));

  // Lista de servicios seleccionados
  const listaServEl = document.getElementById("resumen-lista-servicios");
  if (listaServEl) {
    listaServEl.innerHTML = estado.carrito.length > 0
      ? estado.carrito
          .map((s) => `<li>◆ ${s.nombre} <span>${formatearPrecio(s.precio)}</span></li>`)
          .join("")
      : "<li class='vacio'>Ningún servicio seleccionado</li>";
  }

  // Lista de extras seleccionados
  const listaExtEl = document.getElementById("resumen-lista-extras");
  if (listaExtEl) {
    const extrasObjs = estado.extrasSeleccionados
      .map((id) => estado.extras.find((e) => e.id === id))
      .filter(Boolean);

    listaExtEl.innerHTML = extrasObjs.length > 0
      ? extrasObjs
          .map((e) => `<li>◆ ${e.nombre} <span>+${formatearPrecio(e.precio)}</span></li>`)
          .join("")
      : "<li class='vacio'>Sin extras</li>";
  }

  // Mostrar/ocultar fila de descuento
  const filaDescEl = document.getElementById("resumen-descuento-row");
  if (filaDescEl) {
    filaDescEl.style.display = estado.codigoDescuento ? "flex" : "none";
    const labelDesc = document.getElementById("resumen-descuento-label");
    if (labelDesc && estado.codigoDescuento) {
      labelDesc.textContent = `Descuento (${estado.codigoDescuento.porcentaje}%)`;
    }
  }
};

// ─── Navegación entre pasos ───────────────────────────────────

/**
 * Avanza al siguiente paso después de validar las condiciones mínimas.
 * Usa Toastify para mostrar errores de validación.
 */
const siguientePaso = () => {
  // Validación paso 1: debe tener al menos un servicio
  if (estado.paso === 1 && estado.carrito.length === 0) {
    mostrarToast("Seleccioná al menos un servicio para continuar", "error");
    return;
  }

  // Validación paso 2: nombre y email son obligatorios
  if (estado.paso === 2) {
    const nombre = document.getElementById("cotiz-nombre")?.value?.trim();
    const email  = document.getElementById("cotiz-email")?.value?.trim();
    if (!nombre || !email) {
      mostrarToast("Completá tu nombre y email para continuar", "error");
      return;
    }
  }

  if (estado.paso < 3) {
    estado.paso++;
    renderizarPasoActual();
  }
};

/**
 * Retrocede al paso anterior sin perder los datos ingresados.
 */
const pasoAnterior = () => {
  if (estado.paso > 1) {
    estado.paso--;
    renderizarPasoActual();
  }
};

/**
 * Actualiza los indicadores visuales de pasos y muestra el panel activo.
 * Dispara el renderizado específico de cada paso al activarse.
 */
const renderizarPasoActual = () => {
  // Actualizar clases de los indicadores del stepper
  document.querySelectorAll(".paso-indicator").forEach((el, i) => {
    el.classList.toggle("activo",     i + 1 === estado.paso);
    el.classList.toggle("completado", i + 1 <  estado.paso);
  });

  // Mostrar solo el panel del paso actual
  document.querySelectorAll(".paso-contenido").forEach((el) => {
    el.classList.remove("visible");
  });
  document.getElementById(`paso-${estado.paso}`)?.classList.add("visible");

  // Acciones específicas al entrar en cada paso
  if (estado.paso === 2) renderizarExtras();
  if (estado.paso === 3) renderizarConfirmacion();

  actualizarResumen();
};

// ─── Paso 3: Confirmación ─────────────────────────────────────

/**
 * Genera y renderiza el resumen final de la cotización en el paso 3.
 * Incluye datos del cliente, servicios, extras, descuentos y total.
 */
const renderizarConfirmacion = () => {
  const nombre = document.getElementById("cotiz-nombre")?.value?.trim() || "Cliente";
  const email  = document.getElementById("cotiz-email")?.value?.trim()  || "";
  const tel    = document.getElementById("cotiz-tel")?.value?.trim()    || "";
  const notas  = document.getElementById("cotiz-notas")?.value?.trim()  || "";

  const subServicios = calcularSubtotalServicios();
  const subExtras    = calcularSubtotalExtras();
  const subtotal     = subServicios + subExtras;
  const descuento    = calcularDescuento(subtotal);
  const total        = subtotal - descuento;

  const idCotizacion = generarIdCotizacion();
  const fechaHoy = new Date().toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const contenedor = document.getElementById("confirmacion-contenido");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="cotizacion-header">
      <div>
        <span class="cotiz-label">Número de cotización</span>
        <span class="cotiz-num">${idCotizacion}</span>
      </div>
      <div>
        <span class="cotiz-label">Fecha</span>
        <span>${fechaHoy}</span>
      </div>
    </div>

    <div class="cotizacion-cliente">
      <h5 class="conf-seccion-title">Datos del cliente</h5>
      <div class="conf-dato"><span>Nombre:</span><strong>${nombre}</strong></div>
      <div class="conf-dato"><span>Email:</span><strong>${email}</strong></div>
      ${tel   ? `<div class="conf-dato"><span>Teléfono:</span><strong>${tel}</strong></div>`   : ""}
      ${notas ? `<div class="conf-dato"><span>Notas:</span><strong>${notas}</strong></div>`    : ""}
    </div>

    <div class="cotizacion-detalle">
      <h5 class="conf-seccion-title">Servicios solicitados</h5>
      ${estado.carrito.map((s) => `
        <div class="conf-item">
          <div>
            <strong>${s.nombre}</strong>
            <small>⏱ Tiempo estimado: ${s.tiempo}</small>
          </div>
          <span>${formatearPrecio(s.precio)}</span>
        </div>`).join("")}

      ${estado.extrasSeleccionados.length > 0 ? `
        <h5 class="conf-seccion-title" style="margin-top:1.5rem">Extras seleccionados</h5>
        ${estado.extrasSeleccionados.map((id) => {
          const extra = estado.extras.find((e) => e.id === id);
          return extra
            ? `<div class="conf-item">
                 <span>${extra.nombre}</span>
                 <span>+${formatearPrecio(extra.precio)}</span>
               </div>`
            : "";
        }).join("")}` : ""}
    </div>

    <div class="cotizacion-totales">
      <div class="conf-total-row"><span>Subtotal servicios</span><span>${formatearPrecio(subServicios)}</span></div>
      ${subExtras > 0
        ? `<div class="conf-total-row"><span>Extras</span><span>+${formatearPrecio(subExtras)}</span></div>`
        : ""}
      ${descuento > 0
        ? `<div class="conf-total-row descuento-row">
             <span>Descuento (${estado.codigoDescuento.porcentaje}%)</span>
             <span>-${formatearPrecio(descuento)}</span>
           </div>`
        : ""}
      <div class="conf-total-row total-final"><span>TOTAL</span><span>${formatearPrecio(total)}</span></div>
    </div>

    <div class="cotizacion-acciones">
      <button class="btn-gold"
        onclick="confirmarEnvioWhatsApp('${idCotizacion}', '${nombre}', ${total})">
        Confirmar y enviar por WhatsApp
      </button>
      <button class="btn-outline-gold"
        onclick="guardarCotizacion('${idCotizacion}', ${total})">
        Guardar cotización
      </button>
    </div>
  `;
};

// ─── Acciones Finales ─────────────────────────────────────────

/**
 * Pide confirmación con SweetAlert2 antes de abrir WhatsApp.
 * Si el usuario acepta, arma el mensaje y lo envía.
 * @param {string} id     - ID de la cotización
 * @param {string} nombre - Nombre del cliente
 * @param {number} total  - Total calculado
 */
const confirmarEnvioWhatsApp = async (id, nombre, total) => {
  const confirmado = await mostrarConfirmacion(
    "¿Enviar cotización?",
    `Se abrirá WhatsApp con el resumen de la cotización ${id} por ${formatearPrecio(total)}.`,
    "Sí, enviar"
  );

  if (!confirmado) return;

  const serviciosTexto = estado.carrito
    .map((s) => `  • ${s.nombre}`)
    .join("\n");

  const extrasTexto = estado.extrasSeleccionados.length > 0
    ? "\n\nExtras:\n" + estado.extrasSeleccionados
        .map((exId) => {
          const ex = estado.extras.find((e) => e.id === exId);
          return ex ? `  • ${ex.nombre}` : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

  const descTexto = estado.codigoDescuento
    ? `\nDescuento aplicado: ${estado.codigoDescuento.porcentaje}% (${estado.codigoDescuento.codigo})`
    : "";

  const mensaje = `Hola Alan! 👋 Soy ${nombre}.\n\nCotización N° ${id}\n\nServicios:\n${serviciosTexto}${extrasTexto}${descTexto}\n\nTOTAL: ${formatearPrecio(total)}\n\n¿Podemos coordinar?`;

  window.open(`https://wa.me/541122509964?text=${encodeURIComponent(mensaje)}`, "_blank");
  mostrarToast("¡Cotización enviada por WhatsApp!", "exito");
};

/**
 * Guarda la cotización en localStorage y confirma con SweetAlert2.
 * @param {string} id    - ID de la cotización
 * @param {number} total - Total calculado
 */
const guardarCotizacion = (id, total) => {
  const cotizacion = {
    id,
    fecha:     new Date().toISOString(),
    nombre:    document.getElementById("cotiz-nombre")?.value?.trim() || "",
    email:     document.getElementById("cotiz-email")?.value?.trim()  || "",
    servicios: estado.carrito.map((s) => s.nombre),
    extras:    estado.extrasSeleccionados,
    total,
  };

  // Recuperar historial previo, agregar y guardar
  const historial = JSON.parse(localStorage.getItem("cotizaciones") || "[]");
  historial.push(cotizacion);
  localStorage.setItem("cotizaciones", JSON.stringify(historial));

  // Usar SweetAlert2 para la confirmación de guardado
  mostrarExito(
    "¡Cotización guardada!",
    `La cotización ${id} por ${formatearPrecio(total)} fue guardada en este dispositivo.`
  );
};

/**
 * Reinicia completamente el cotizador para una nueva consulta.
 * Limpia el estado global, el formulario y vuelve al paso 1.
 */
const nuevaCotizacion = () => {
  // Resetear estado
  estado.carrito             = [];
  estado.extrasSeleccionados = [];
  estado.codigoDescuento     = null;
  estado.paso                = 1;

  // Limpiar input de descuento
  const inputDescuento = document.getElementById("codigo-descuento");
  if (inputDescuento) {
    inputDescuento.value      = "";
    inputDescuento.style.borderColor = "";
  }

  // Volver a renderizar desde cero
  renderizarPasoActual();
  renderizarTarjetasServicio(estado.servicios);
  actualizarContadorCarrito();
  actualizarResumen();

  mostrarToast("Cotizador reiniciado para una nueva consulta", "info");
};

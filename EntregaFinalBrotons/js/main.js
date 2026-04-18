

// ─── Animaciones de scroll ────────────────────────────────────

/**
 * Configura el IntersectionObserver para las animaciones de aparición.
 * Agrega la clase "visible" a los elementos cuando entran en la pantalla.
 */
const configurarAnimacionesScroll = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.12 }
  );

  document
    .querySelectorAll(".reveal, .reveal-left, .reveal-right")
    .forEach((el) => observer.observe(el));
};

/**
 * Anima los contadores numéricos de estadísticas con easing cuártico.
 * Se activa solo cuando el número entra en el viewport.
 */
const configurarContadores = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el      = entry.target;
        const target  = parseInt(el.dataset.count);
        const suffix  = el.querySelector(".num-suffix")?.textContent || "+";
        const duracion = 2000;
        let inicio    = null;

        const animar = (timestamp) => {
          if (!inicio) inicio = timestamp;
          const progreso = Math.min((timestamp - inicio) / duracion, 1);
          // Easing: ease-out quart
          const ease = 1 - Math.pow(1 - progreso, 4);
          el.innerHTML = Math.floor(ease * target) + `<span class="num-suffix">${suffix}</span>`;
          if (progreso < 1) requestAnimationFrame(animar);
        };

        requestAnimationFrame(animar);
        observer.unobserve(el); // Animar solo una vez
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll("[data-count]").forEach((el) => observer.observe(el));
};

// ─── Smooth Scroll ────────────────────────────────────────────

/**
 * Configura el scroll suave para todos los enlaces internos (#ancla).
 * Previene el comportamiento por defecto del navegador.
 */
const configurarNavegacion = () => {
  document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener("click", (e) => {
      const destino = document.querySelector(enlace.getAttribute("href"));
      if (destino) {
        e.preventDefault();
        destino.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
};

// ─── Parallax en hero ─────────────────────────────────────────

/**
 * Aplica un efecto parallax a los círculos decorativos del hero
 * en función del scroll vertical de la página.
 */
const configurarParallax = () => {
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    document.querySelectorAll(".hero-deco-circle").forEach((circulo, i) => {
      const velocidad = 0.05 + i * 0.02;
      const rotacion  = scrollY * 0.02 * (i + 1);
      circulo.style.transform = `translateY(calc(-50% + ${scrollY * velocidad}px)) rotate(${rotacion}deg)`;
    });
  });
};

// ─── Loader de entrada ────────────────────────────────────────

/**
 * Oculta el loader animado de entrada después de 2 segundos.
 * Usa la clase CSS "hidden" que aplica opacity:0 y visibility:hidden.
 */
const ocultarLoader = () => {
  const loader = document.getElementById("loader");
  if (loader) setTimeout(() => loader.classList.add("hidden"), 2000);
};

// ─── DOMContentLoaded — Punto de entrada ─────────────────────

/**
 * Inicializa todos los módulos de la aplicación una vez que el
 * DOM está completamente cargado y parseado.
 *
 * Orden de inicialización:
 * 1. Ocultar loader
 * 2. Generar partículas de fondo
 * 3. Inicializar cursor personalizado
 * 4. Configurar navegación suave
 * 5. Configurar animaciones de scroll
 * 6. Configurar contadores animados
 * 7. Configurar parallax
 * 8. Cargar datos JSON (async) → inicializar cotizador
 */
document.addEventListener("DOMContentLoaded", () => {
  ocultarLoader();
  generarParticulas();
  inicializarCursor();
  configurarNavegacion();
  configurarAnimacionesScroll();
  configurarContadores();
  configurarParallax();

  // Carga asíncrona de datos desde data/servicios.json
  // Si falla, activa el fallback con datos embebidos en cotizador.js
  cargarDatos();
});

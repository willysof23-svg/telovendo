/**
 * brand.config.js
 * -----------------------------------------------------------------------
 * CONFIGURACIÓN CENTRAL DE MARCA — ÚNICO ARCHIVO QUE SE EDITA PARA CAMBIAR
 * NOMBRE, LOGO, COLORES O DATOS DE CONTACTO DEL SITIO.
 *
 * Regla de oro: nadie debe tocar HTML/CSS/JS del sitio para renombrar el
 * marketplace o cambiar el logo. Todo pasa por este archivo.
 *
 * Cómo se usa: index.html, catalogo.html, producto.html, etc. cargan este
 * script ANTES que styles.css se aplique visualmente, y un pequeño script
 * (ver aplicarMarca() en app.js) inyecta estas variables como CSS custom
 * properties (--color-primario, etc.) y como texto en los elementos con
 * atributo [data-marca="nombre_sitio"], [data-marca="eslogan"], etc.
 * -----------------------------------------------------------------------
 */

const BRAND_CONFIG = {
  // Identidad textual
  nombre_sitio: "TELOVENDO",
  eslogan: "Compra y vende con confianza",

  // Imágenes (rutas o URLs de Google Drive; se recomienda usar el ID
  // público de Drive: https://drive.google.com/uc?id=FILE_ID)
  logo_url: "assets/logo-default.svg",
  logo_alt_url: "assets/logo-alt-default.svg",
  favicon_url: "assets/favicon-default.svg",

  // Paleta (ver docs/README-fase1.md para la justificación de diseño)
  color_primario: "#0E6E5D",      // teal — CTAs, links, confianza
  color_secundario: "#F2A93B",    // ámbar — precios, acentos, urgencia
  color_advertencia: "#C1442D",   // ladrillo — stock bajo, errores
  color_texto: "#14192B",         // tinta — texto principal
  color_fondo: "#FBF7EF",         // papel — fondo general

  // Tipografía (Google Fonts)
  tipografia_display: "Fraunces",
  tipografia_texto: "Public Sans",
  tipografia_datos: "IBM Plex Mono", // precios, montos cripto, SKUs

  // Redes y contacto
  redes_sociales: {
    instagram: "",
    facebook: "",
    tiktok: "",
    x: "",
    whatsapp: ""
  },
  datos_contacto: {
    email: "soporte@telovendo.example",
    telefono: "",
    whatsapp: "",
    direccion: ""
  },

  // SEO por defecto (cada producto puede sobreescribir esto)
  meta_seo: {
    titulo: "TELOVENDO — Marketplace",
    descripcion: "Compra y vende productos con pagos fiat y cripto, de forma segura.",
    keywords: "marketplace, comprar, vender, cripto, bitcoin"
  },

  // Parámetros operativos (sección 5 y 6 del documento maestro)
  archivos: {
    max_imagenes_por_producto: 8,
    peso_max_imagen_mb: 2,
    peso_max_video_mb: 20,
    peso_max_pdf_mb: 5,
    formatos_imagen: ["jpg", "jpeg", "png", "webp"],
    formatos_video: ["mp4", "webm"],
    resolucion_max_imagen_px: 2000
  },
  pagos: {
    pais: "CO",
    moneda_base: "COP",
    cripto_soportadas: ["BTC", "USDT", "USDC"],
    // Marketplace personal, no público: solo modalidad manual (wallet + comprobante).
    // La modalidad "automatica" (Coinbase Commerce) queda deshabilitada por defecto,
    // pero el código en Code.gs no se borra — se puede activar en el futuro solo
    // agregando "automatica" a este arreglo, sin reescribir nada.
    modalidad_cripto: ["manual"],
    validez_cotizacion_minutos: 15,
    // Wallets propias para la modalidad manual (sección 6.1.4). Se muestran como
    // dirección/QR en el checkout. Reemplaza por tus direcciones reales.
    wallets_manuales: {
      BTC: "REEMPLAZAR_CON_TU_DIRECCION_BTC",
      USDT: "REEMPLAZAR_CON_TU_DIRECCION_USDT_TRC20_O_ERC20",
      USDC: "REEMPLAZAR_CON_TU_DIRECCION_USDC"
    }
  }
};

// No modificar debajo de esta línea: conecta la configuración con el navegador
   // y con Node (por si se usa en pruebas). Sin esta línea, "window.BRAND_CONFIG"
   // queda vacío y cualquier página que lo use se detiene con un error silencioso.
   if (typeof window !== "undefined") window.BRAND_CONFIG = BRAND_CONFIG;
   if (typeof module !== "undefined") module.exports = BRAND_CONFIG;

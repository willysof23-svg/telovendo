/**
 * app.js — Lógica compartida del frontend
 * -----------------------------------------------------------------------
 * 1) aplicarMarca(): lee BRAND_CONFIG (brand.config.js) e inyecta colores,
 *    tipografías, nombre y logo en el DOM. Ninguna página necesita
 *    hardcodear "TELOVENDO" ni un color: todo llega desde acá.
 * 2) apiTelovendo: capa delgada para hablar con el backend de Apps Script
 *    (Code.gs). En producción, BASE_URL se reemplaza por la URL de la
 *    Web App publicada (Implementar > Nueva implementación > Aplicación web).
 * 3) formatearPrecio() / cotizarCripto(): utilidades de dinero.
 * -----------------------------------------------------------------------
 */

// Reemplazar por la URL real al publicar el Web App de Apps Script.
const BASE_URL = "https://script.google.com/macros/s/AKfycbzK0TtbzEBgr4-IIYzKFIzr_j_LYS-Gv4huafVfcDe1KzqM0-eYDsvRGv0Va0jsuMW0tw/exec";

/**
 * Aplica BRAND_CONFIG al documento actual.
 * No recibe parámetros. No retorna nada. Se llama una vez, al cargar cada
 * página (ver <script> al final de cada .html).
 */
function aplicarMarca() {
  const cfg = window.BRAND_CONFIG;
  if (!cfg) return;

  const raiz = document.documentElement.style;
  raiz.setProperty("--color-primario", cfg.color_primario);
  raiz.setProperty("--color-secundario", cfg.color_secundario);
  raiz.setProperty("--color-advertencia", cfg.color_advertencia);
  raiz.setProperty("--color-texto", cfg.color_texto);
  raiz.setProperty("--color-fondo", cfg.color_fondo);
  raiz.setProperty("--fuente-display", `'${cfg.tipografia_display}', serif`);
  raiz.setProperty("--fuente-texto", `'${cfg.tipografia_texto}', sans-serif`);
  raiz.setProperty("--fuente-datos", `'${cfg.tipografia_datos}', monospace`);

  document.title = cfg.meta_seo.titulo;
  document.querySelectorAll('[data-marca="nombre_sitio"]').forEach(el => el.textContent = cfg.nombre_sitio);
  document.querySelectorAll('[data-marca="eslogan"]').forEach(el => el.textContent = cfg.eslogan);
  document.querySelectorAll('[data-marca="logo"]').forEach(el => { el.src = cfg.logo_url; el.alt = cfg.nombre_sitio; });

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", cfg.meta_seo.descripcion);

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) favicon.setAttribute("href", cfg.favicon_url);
}

/**
 * Capa de acceso a la API del backend (Apps Script Web App).
 * Cada método retorna una Promise con el JSON ya parseado.
 * Llamada desde: catalogo.html, producto.html, admin-archivos.html.
 */
const apiTelovendo = {
  /**
   * Trae productos del catálogo, con filtros opcionales.
   * @param {Object} filtros - { categoria, precioMin, precioMax, orden }
   * @returns {Promise<Array>} lista de productos
   */
  async listarProductos(filtros = {}) {
    const params = new URLSearchParams({ accion: "listarProductos", ...filtros });
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!res.ok) throw new Error("No se pudo cargar el catálogo.");
    return res.json();
  },

  /**
   * Trae el detalle de un producto por ID, incluyendo su galería de archivos.
   * @param {string} idProducto
   * @returns {Promise<Object>} producto con { imagenes, video, pdf, metodosPago }
   */
  async obtenerProducto(idProducto) {
    const params = new URLSearchParams({ accion: "obtenerProducto", id: idProducto });
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!res.ok) throw new Error("No se pudo cargar el producto.");
    return res.json();
  },

  /**
   * Sube un archivo (imagen/video/PDF) para un producto. Usada por el
   * panel de Mantenimiento de Archivos. El backend valida peso/formato
   * de nuevo (nunca confiar solo en la validación de cliente).
   * @param {string} idProducto
   * @param {File} archivo
   * @param {number} posicion - orden dentro de la galería (0 = portada)
   * @returns {Promise<Object>} { ok, url, error }
   */
  async subirArchivo(idProducto, archivo, posicion) {
    const base64 = await new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result.split(",")[1]);
      lector.onerror = () => reject(new Error("No se pudo leer el archivo."));
      lector.readAsDataURL(archivo);
    });

    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({
        accion: "subirArchivo",
        idProducto,
        posicion,
        nombreArchivo: archivo.name,
        tipoMime: archivo.type,
        pesoBytes: archivo.size,
        contenidoBase64: base64
      })
    });
    return res.json();
  },

  /** Elimina un archivo de la galería sin afectar los demás. */
  async eliminarArchivo(idProducto, idArchivo) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ accion: "eliminarArchivo", idProducto, idArchivo })
    });
    return res.json();
  },

  /** Reordena la galería de un producto (drag & drop en el panel). */
  async reordenarGaleria(idProducto, ordenIds) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ accion: "reordenarGaleria", idProducto, ordenIds })
    });
    return res.json();
  },

  /** Pide la cotización cripto en tiempo real para un monto en la moneda base. */
  async cotizarCripto(montoBase, moneda) {
    const params = new URLSearchParams({ accion: "cotizarCripto", monto: montoBase, moneda });
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    return res.json();
  },

  /**
   * Crea un pedido nuevo (checkout de invitado incluido: idComprador puede
   * ser solo nombre+contacto sin cuenta). Usada por carrito.html.
   * @param {Object} datosPedido - { idProducto, cantidad, metodoPago, comprador:{nombre,contacto,direccion} }
   * @returns {Promise<Object>} { ok, idPedido, error? }
   */
  async crearPedido(datosPedido) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ accion: "crearPedido", ...datosPedido })
    });
    return res.json();
  },

  /**
   * Sube el comprobante (imagen/PDF del voucher + TXID) de un pago cripto
   * manual. El pedido queda "Pago recibido / en verificación" hasta que el
   * admin lo confirme desde panel-admin.html.
   * @param {string} idPedido
   * @param {string} txHash - hash/TXID de la transacción
   * @param {File} archivoComprobante
   * @returns {Promise<Object>} { ok, error? }
   */
  async subirComprobantePago(idPedido, txHash, archivoComprobante) {
    const base64 = await new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result.split(",")[1]);
      lector.onerror = () => reject(new Error("No se pudo leer el comprobante."));
      lector.readAsDataURL(archivoComprobante);
    });
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({
        accion: "subirComprobantePago", idPedido, txHash,
        nombreArchivo: archivoComprobante.name, tipoMime: archivoComprobante.type,
        pesoBytes: archivoComprobante.size, contenidoBase64: base64
      })
    });
    return res.json();
  },

  /** Lista pedidos (usada por panel-admin.html para ver/gestionar ventas). */
  async listarPedidos(filtroEstado = "") {
    const params = new URLSearchParams({ accion: "listarPedidos", estado: filtroEstado });
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    return res.json();
  },

  /** Cambia el estado de un pedido (ej. confirmar pago manual). Solo admin. */
  async actualizarEstadoPedido(idPedido, nuevoEstado) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ accion: "actualizarEstadoPedido", idPedido, nuevoEstado })
    });
    return res.json();
  },

  /** Crea o edita un producto desde panel-admin.html. */
  async guardarProducto(producto) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ accion: "guardarProducto", producto })
    });
    return res.json();
  }
};

/**
 * Formatea un número como precio en la moneda base configurada en
 * brand.config.js (por defecto COP, sin decimales).
 * @param {number} valor
 * @returns {string} ej. "$45.900"
 */
function formatearPrecio(valor) {
  const moneda = (window.BRAND_CONFIG && window.BRAND_CONFIG.pagos.moneda_base) || "COP";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: moneda, maximumFractionDigits: 0 })
    .format(valor);
}

document.addEventListener("DOMContentLoaded", aplicarMarca);

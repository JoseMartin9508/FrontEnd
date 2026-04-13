/**
 * app.js — Lógica principal de la aplicación
 * Supermercado La Economía
 *
 * Tecnología: Vue 3 (Composition via Options API)
 * El objeto createApp define datos reactivos, propiedades computadas y métodos
 * que controlan toda la interacción del usuario con la tienda.
 */

// Extrae createApp de la librería global de Vue cargada desde el CDN
const { createApp } = Vue;

// Crea e inicializa la aplicación Vue y la monta en el elemento con id="app"
createApp({

  /**
   * data() — Estado reactivo de la aplicación.
   * Cada propiedad retornada aquí puede usarse en el HTML con {{ }} o directivas Vue.
   * Cuando cambia un dato, Vue actualiza automáticamente el DOM.
   */
  data() {
    return {

      // Información general de la tienda (nombre y descripción mostrados en el hero)
      tienda: {
        nombre: "Supermercado La Economía",
        descripcion:
          "Encuentra productos frescos, buenos precios y las mejores ofertas para tu hogar.",
      },

      // Texto ingresado en el buscador; filtra productos en tiempo real
      busqueda: "",

      // Categoría actualmente seleccionada en los filtros ("Todos" por defecto)
      categoriaSeleccionada: "Todos",

      /**
       * Lista completa de productos de la tienda.
       * Cada objeto tiene:
       *   - id: identificador único
       *   - nombre, descripcion, categoria: datos descriptivos
       *   - precio: precio actual de venta
       *   - precioAnterior: precio original (usado para calcular el descuento)
       *   - enOferta: booleano que indica si está en promoción
       *   - disponible: booleano que habilita o deshabilita los botones de compra
       *   - imagen: ruta de la imagen del producto
       */
      productos: [
        {
          id: 1,
          nombre: "Arroz Premium",
          precio: 5600.00,
          precioAnterior: 3.0,
          enOferta: true,
          categoria: "Granos",
          disponible: true,
          descripcion:
            "Arroz de excelente calidad, ideal para tus comidas diarias.",
          imagen: "IMAGENES/ARROZ-PREMIUM.PNG",
        },
        {
          id: 2,
          nombre: "Leche Entera",
          precio: 2600.00,
          precioAnterior: 2.2,
          enOferta: true,
          categoria: "Lácteos",
          disponible: true,
          descripcion: "Leche fresca y nutritiva para toda la familia.",
          imagen: "IMAGENES/LECHE.JPEG",
        },
        {
          id: 3,
          nombre: "Pan Artesanal",
          precio: 3000.00,
          precioAnterior: 1.6,
          enOferta: false,
          categoria: "Panadería",
          disponible: true,
          descripcion:
            "Pan suave y recién horneado, perfecto para desayuno o cena.",
          imagen: "IMAGENES/PAN-ARTESANAL.JPG",
        },
        {
          id: 4,
          nombre: "Huevos AA",
          precio: 14000.00,
          precioAnterior: 3.8,
          enOferta: true,
          categoria: "Proteínas",
          disponible: true,
          descripcion:
            "Huevos frescos seleccionados con excelente presentación.",
          imagen: "IMAGENES/HUEVOS-AA.JPG",
        },
        {
          id: 5,
          nombre: "Queso Campesino",
          precio: 9800.00,
          precioAnterior: 4.4,
          enOferta: false,
          categoria: "Lácteos",
          disponible: true,
          descripcion: "Queso fresco con sabor tradicional y textura suave.",
          imagen: "IMAGENES/QUESO-CAMPESINO.PNG",
        },
        {
          id: 6,
          nombre: "Frijoles",
          precio: 5800.00,
          precioAnterior: 2.6,
          enOferta: true,
          categoria: "Granos",
          disponible: false, // Producto agotado: botones deshabilitados en el HTML
          descripcion:
            "Frijoles seleccionados, ideales para una alimentación completa.",
          imagen: "IMAGENES/FRIJOLES-BOLSA.JPG", // Ruta relativa al index.html 
        },
      ],

      // Array que almacena los productos añadidos al carrito
      // Cada item es una copia del producto con una propiedad extra "cantidad"
      carrito: [],

      // Controla la visibilidad del modal de finalizar compra
      mostrarModalCompra: false,

      // Lista de productos que se están comprando en el modal actual
      pedidoActual: [],

      // Mensaje que se muestra al usuario dentro del modal (confirmación o error)
      mensajeCompra: "",

      // Datos del formulario de compra dentro del modal
      formCompra: {
        nombre: "",
        correo: "",
        direccion: "",
        telefono: "",
      },

      // Datos del formulario de la sección de contacto
      contacto: {
        nombre: "",
        correo: "",
        mensaje: "",
      },

      // Mensaje de confirmación que aparece al enviar el formulario de contacto
      mensajeContacto: "",
    };
  },

  /**
   * computed — Propiedades calculadas automáticamente.
   * Vue las recalcula solo cuando cambian los datos de los que dependen.
   * Son de solo lectura y se usan igual que una propiedad de data() en el HTML.
   */
  computed: {

    /**
     * categorias — Lista de categorías únicas extraídas del array de productos.
     * Se usa para generar dinámicamente los botones de filtro en la navbar de filtros.
     * Set elimina duplicados y el spread [...] lo convierte de vuelta en array.
     */
    categorias() {
      return [...new Set(this.productos.map((p) => p.categoria))];
    },

    /**
     * productosEnOferta — Filtra solo los productos con enOferta = true.
     * Alimenta la sección "Ofertas de la semana".
     */
    productosEnOferta() {
      return this.productos.filter((p) => p.enOferta);
    },

    /**
     * productosFiltrados — Aplica búsqueda por nombre y filtro por categoría.
     * Se recalcula cada vez que cambian "busqueda" o "categoriaSeleccionada".
     * Muestra los resultados en la sección "Productos destacados".
     */
    productosFiltrados() {
      return this.productos.filter((producto) => {
        // Verifica si el nombre del producto incluye el texto buscado (sin importar mayúsculas)
        const coincideBusqueda = producto.nombre
          .toLowerCase()
          .includes(this.busqueda.toLowerCase());

        // Verifica si el producto coincide con la categoría seleccionada
        // "Todos": muestra todo | "Ofertas": muestra en oferta | otro: coincidencia exacta
        const coincideCategoria =
          this.categoriaSeleccionada === "Todos" ||
          (this.categoriaSeleccionada === "Ofertas" && producto.enOferta) ||
          producto.categoria === this.categoriaSeleccionada;

        // Solo incluye el producto si cumple ambas condiciones simultáneamente
        return coincideBusqueda && coincideCategoria;
      });
    },

    /**
     * totalCarrito — Suma el subtotal (precio × cantidad) de todos los items del carrito.
     * Se actualiza reactivamente cada vez que cambia el carrito.
     */
    totalCarrito() {
      return this.carrito.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0,
      );
    },

    /**
     * cantidadCarrito — Total de unidades en el carrito (suma de todas las cantidades).
     * Se muestra en el resumen del carrito en la barra superior.
     */
    cantidadCarrito() {
      return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    },

    /**
     * totalPedidoActual — Total del pedido que se está confirmando en el modal.
     * Puede ser un solo producto (comprarAhora) o todos los del carrito (comprarCarrito).
     */
    totalPedidoActual() {
      return this.pedidoActual.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0,
      );
    },
  },

  /**
   * methods — Funciones que responden a eventos del usuario (clicks, submits, etc.).
   * Se llaman desde el HTML usando @click, @submit, etc.
   */
  methods: {

    /**
     * agregarAlCarrito(producto) — Agrega un producto al carrito.
     * Si el producto ya existe, incrementa su cantidad en 1.
     * Si es nuevo, lo añade con cantidad = 1 usando spread para no mutar el original.
     */
    agregarAlCarrito(producto) {
      const existente = this.carrito.find((item) => item.id === producto.id);

      if (existente) {
        // El producto ya está en el carrito: solo suma una unidad más
        existente.cantidad++;
      } else {
        // Producto nuevo: se añade al carrito con cantidad inicial de 1
        this.carrito.push({ ...producto, cantidad: 1 });
      }
    },

    /**
     * sumar(item) — Incrementa en 1 la cantidad de un item del carrito.
     * Se llama al presionar el botón "+" en la fila del carrito.
     */
    sumar(item) {
      item.cantidad++;
    },

    /**
     * restar(item) — Decrementa en 1 la cantidad de un item del carrito.
     * Si la cantidad llega a 1 y se vuelve a restar, elimina el producto del carrito.
     */
    restar(item) {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        // Filtra el array para eliminar el item cuya cantidad llegó a 0
        this.carrito = this.carrito.filter((p) => p.id !== item.id);
      }
    },

    /**
     * calcularDescuento(producto) — Calcula el porcentaje de descuento de un producto.
     * Fórmula: ((precioAnterior - precio) / precioAnterior) * 100, redondeado.
     * Retorna 0 si el producto no está en oferta o no tiene precio anterior válido.
     */
    calcularDescuento(producto) {
      if (
        !producto.enOferta ||
        !producto.precioAnterior ||
        producto.precioAnterior <= producto.precio
      ) {
        return 0;
      }

      return Math.round(
        ((producto.precioAnterior - producto.precio) /
          producto.precioAnterior) *
          100,
      );
    },

    /**
     * comprarAhora(producto) — Inicia el flujo de compra para un solo producto.
     * Prepara el pedidoActual con ese único producto y abre el modal.
     */
    comprarAhora(producto) {
      this.pedidoActual = [{ ...producto, cantidad: 1 }];
      this.mensajeCompra = ""; // Limpia mensajes de compras anteriores
      this.mostrarModalCompra = true;
    },

    /**
     * comprarCarrito() — Inicia el flujo de compra con todos los productos del carrito.
     * Copia el carrito a pedidoActual (para no afectar el carrito original) y abre el modal.
     * No hace nada si el carrito está vacío.
     */
    comprarCarrito() {
      if (this.carrito.length === 0) return;

      // Crea copias independientes de cada item para el resumen del pedido
      this.pedidoActual = this.carrito.map((item) => ({ ...item }));
      this.mensajeCompra = "";
      this.mostrarModalCompra = true;
    },

    /**
     * cerrarModal() — Cierra el modal de compra y limpia el mensaje.
     * Se llama con el botón "×" o al hacer clic fuera del modal (@click.self).
     */
    cerrarModal() {
      this.mostrarModalCompra = false;
      this.mensajeCompra = "";
    },

    /**
     * confirmarCompra() — Valida el formulario del modal y procesa el pedido.
     * Valida que todos los campos estén llenos antes de confirmar.
     * Al confirmar: muestra mensaje de éxito, elimina los productos comprados del carrito
     * y limpia el formulario para futuras compras.
     */
    confirmarCompra() {
      const { nombre, correo, direccion, telefono } = this.formCompra;

      // Validación: todos los campos son obligatorios
      if (!nombre || !correo || !direccion || !telefono) {
        this.mensajeCompra =
          "Por favor completa todos los campos del formulario.";
        return;
      }

      // Confirmación exitosa: muestra mensaje personalizado con el nombre y correo
      this.mensajeCompra = `Gracias ${nombre}, tu pedido fue confirmado correctamente. Te contactaremos al correo ${correo}.`;

      // Elimina del carrito los productos que fueron comprados en este pedido
      const idsPedido = this.pedidoActual.map((item) => item.id);
      this.carrito = this.carrito.filter(
        (item) => !idsPedido.includes(item.id),
      );

      // Resetea el formulario de compra a valores vacíos
      this.formCompra = {
        nombre: "",
        correo: "",
        direccion: "",
        telefono: "",
      };

      // Limpia el pedido actual tras la confirmación
      this.pedidoActual = [];
    },

    /**
     * enviarContacto() — Valida y procesa el formulario de la sección Contacto.
     * Verifica que nombre, correo y mensaje estén completos.
     * Al enviar con éxito: muestra mensaje de confirmación y limpia el formulario.
     */
    enviarContacto() {
      const { nombre, correo, mensaje } = this.contacto;

      // Validación: todos los campos del formulario son requeridos
      if (!nombre || !correo || !mensaje) {
        this.mensajeContacto =
          "Completa todos los campos del formulario de contacto.";
        return;
      }

      // Mensaje de éxito personalizado con el nombre del usuario
      this.mensajeContacto = `Gracias ${nombre}, recibimos tu mensaje y te responderemos pronto.`;

      // Limpia el formulario después del envío exitoso
      this.contacto = {
        nombre: "",
        correo: "",
        mensaje: "",
      };
    },
  },

// Monta la aplicación Vue en el elemento HTML con id="app"
}).mount("#app");

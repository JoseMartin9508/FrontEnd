/**
 * app.js — Lógica principal de la aplicación
 * Supermercado La Economía
 *
 * Tecnología: Vue 3 (Options API)
 * Persistencia: localStorage (clave "supermercado_productos")
 * CRUD: crear, leer, actualizar y eliminar productos con imágenes JPG en Base64
 */

const { createApp } = Vue;

createApp({

  /**
   * data() — Estado reactivo de la aplicación.
   * Cada propiedad retornada aquí puede usarse en el HTML con {{ }} o directivas Vue.
   * Vue actualiza el DOM automáticamente cuando cambia cualquier dato.
   */
  data() {
    return {

      // Información general de la tienda mostrada en el hero
      tienda: {
        nombre: "Supermercado La Economía",
        descripcion:
          "Encuentra productos frescos, buenos precios y las mejores ofertas para tu hogar.",
      },

      // Texto del buscador; filtra productos en tiempo real
      busqueda: "",

      // Categoría activa en los filtros ("Todos" por defecto)
      categoriaSeleccionada: "Todos",

      /**
       * productos — Catálogo inicial que se siembra en localStorage la primera vez.
       * A partir de la segunda visita, mounted() lo sobreescribe con los datos guardados.
       * Estructura de cada producto:
       *   id            → identificador único (número para los originales, string para los nuevos)
       *   nombre        → nombre visible en las tarjetas y tabla
       *   precio        → precio actual de venta (número)
       *   precioAnterior→ precio original antes del descuento (número)
       *   enOferta      → boolean que activa el badge de oferta
       *   disponible    → boolean que habilita/deshabilita los botones de compra
       *   categoria     → texto libre usado para los filtros
       *   descripcion   → texto corto mostrado en las tarjetas
       *   imagen        → ruta relativa o cadena Base64 (imágenes subidas por el admin)
       */
      productos: [
        {
          id: 1,
          nombre: "Arroz Premium",
          precio: 5600,
          precioAnterior: 6200,
          enOferta: true,
          categoria: "Granos",
          disponible: true,
          descripcion: "Arroz de excelente calidad, ideal para tus comidas diarias.",
          imagen: "IMAGENES/ARROZ-PREMIUM.PNG",
        },
        {
          id: 2,
          nombre: "Leche Entera",
          precio: 2600,
          precioAnterior: 3100,
          enOferta: true,
          categoria: "Lácteos",
          disponible: true,
          descripcion: "Leche fresca y nutritiva para toda la familia.",
          imagen: "IMAGENES/LECHE.JPEG",
        },
        {
          id: 3,
          nombre: "Pan Artesanal",
          precio: 3000,
          precioAnterior: 3000,
          enOferta: false,
          categoria: "Panadería",
          disponible: true,
          descripcion: "Pan suave y recién horneado, perfecto para desayuno o cena.",
          imagen: "IMAGENES/PAN-ARTESANAL.JPG",
        },
        {
          id: 4,
          nombre: "Huevos AA",
          precio: 14000,
          precioAnterior: 16000,
          enOferta: true,
          categoria: "Proteínas",
          disponible: true,
          descripcion: "Huevos frescos seleccionados con excelente presentación.",
          imagen: "IMAGENES/HUEVOS-AA.JPG",
        },
        {
          id: 5,
          nombre: "Queso Campesino",
          precio: 9800,
          precioAnterior: 9800,
          enOferta: false,
          categoria: "Lácteos",
          disponible: true,
          descripcion: "Queso fresco con sabor tradicional y textura suave.",
          imagen: "IMAGENES/QUESO-CAMPESINO.PNG",
        },
        {
          id: 6,
          nombre: "Frijoles",
          precio: 5800,
          precioAnterior: 7000,
          enOferta: true,
          categoria: "Granos",
          disponible: false,
          descripcion: "Frijoles seleccionados, ideales para una alimentación completa.",
          imagen: "IMAGENES/FRIJOLES-BOLSA.JPG",
        },
      ],

      // Items en el carrito; cada uno es una copia del producto con propiedad "cantidad"
      carrito: [],

      // Controla la visibilidad del modal de finalizar compra
      mostrarModalCompra: false,

      // Productos del pedido activo dentro del modal
      pedidoActual: [],

      // Mensaje de confirmación o error dentro del modal de compra
      mensajeCompra: "",

      // Datos del formulario de compra (modal)
      formCompra: {
        nombre: "",
        correo: "",
        direccion: "",
        telefono: "",
      },

      // Datos del formulario de contacto
      contacto: {
        nombre: "",
        correo: "",
        mensaje: "",
      },

      // Mensaje de confirmación del formulario de contacto
      mensajeContacto: "",

      // ── PANEL DE ADMINISTRACIÓN (CRUD) ──────────────────────────

      // true = panel expandido y visible en la página
      panelAdminVisible: false,

      // true = formulario en modo editar; false = modo crear
      modoEdicion: false,

      // Cadena Base64 o URL para mostrar la vista previa de la imagen
      imagenPreview: null,

      /**
       * notificacion — Estado del toast que aparece en la esquina inferior derecha.
       * tipo puede ser: 'exito' (verde), 'error' (rojo) o 'advertencia' (amarillo).
       */
      notificacion: {
        mensaje: "",
        tipo: "exito",
        visible: false,
      },

      /**
       * formAdmin — Datos del formulario del panel admin.
       * El mismo objeto se reutiliza para crear y para editar:
       *   - Crear: id = null, resto vacío
       *   - Editar: todos los campos precargados con los datos del producto seleccionado
       */
      formAdmin: {
        id: null,
        nombre: "",
        precio: "",
        precioAnterior: "",
        enOferta: false,
        disponible: true,
        categoria: "",
        descripcion: "",
        imagen: "",
      },
    };
  },

  /**
   * mounted() — Ciclo de vida de Vue: se ejecuta al terminar de montar el componente.
   * Carga los productos desde localStorage para que persistan entre sesiones.
   */
  mounted() {
    this.cargarProductos();
  },

  /**
   * computed — Propiedades derivadas que Vue recalcula solo cuando cambian sus dependencias.
   */
  computed: {

    /**
     * categorias — Extrae las categorías únicas del array de productos.
     * Set elimina duplicados; spread lo convierte a array normal.
     */
    categorias() {
      return [...new Set(this.productos.map((p) => p.categoria))];
    },

    /** productosEnOferta — Solo productos con enOferta = true (sección "Ofertas"). */
    productosEnOferta() {
      return this.productos.filter((p) => p.enOferta);
    },

    /**
     * productosFiltrados — Aplica búsqueda por nombre Y filtro por categoría.
     * Se recalcula cada vez que cambian busqueda o categoriaSeleccionada.
     */
    productosFiltrados() {
      return this.productos.filter((producto) => {
        const coincideBusqueda = producto.nombre
          .toLowerCase()
          .includes(this.busqueda.toLowerCase());

        const coincideCategoria =
          this.categoriaSeleccionada === "Todos" ||
          (this.categoriaSeleccionada === "Ofertas" && producto.enOferta) ||
          producto.categoria === this.categoriaSeleccionada;

        return coincideBusqueda && coincideCategoria;
      });
    },

    /** totalCarrito — Suma de (precio × cantidad) de todos los items del carrito. */
    totalCarrito() {
      return this.carrito.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0
      );
    },

    /** cantidadCarrito — Total de unidades en el carrito (suma de cantidades). */
    cantidadCarrito() {
      return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    },

    /** totalPedidoActual — Total del pedido abierto en el modal de compra. */
    totalPedidoActual() {
      return this.pedidoActual.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0
      );
    },
  },

  methods: {

    // ================================================================
    // TIENDA — carrito, compra y contacto
    // ================================================================

    /**
     * agregarAlCarrito(producto) — Agrega el producto al carrito.
     * Si ya existe, incrementa su cantidad; si es nuevo, lo inserta con cantidad 1.
     */
    agregarAlCarrito(producto) {
      const existente = this.carrito.find((item) => item.id === producto.id);
      if (existente) {
        existente.cantidad++;
      } else {
        this.carrito.push({ ...producto, cantidad: 1 });
      }
    },

    /** sumar(item) — Incrementa en 1 la cantidad de un item del carrito. */
    sumar(item) {
      item.cantidad++;
    },

    /**
     * restar(item) — Decrementa la cantidad del item.
     * Si la cantidad llega a 1 y se resta, elimina el item del carrito.
     */
    restar(item) {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        this.carrito = this.carrito.filter((p) => p.id !== item.id);
      }
    },

    /**
     * calcularDescuento(producto) — Calcula el porcentaje de descuento.
     * Fórmula: ((precioAnterior - precio) / precioAnterior) × 100, redondeado.
     * Retorna 0 si el precio anterior no es mayor al precio actual.
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
        ((producto.precioAnterior - producto.precio) / producto.precioAnterior) * 100
      );
    },

    /** comprarAhora(producto) — Abre el modal de compra para un único producto. */
    comprarAhora(producto) {
      this.pedidoActual = [{ ...producto, cantidad: 1 }];
      this.mensajeCompra = "";
      this.mostrarModalCompra = true;
    },

    /**
     * comprarCarrito() — Abre el modal con todos los productos del carrito.
     * No hace nada si el carrito está vacío.
     */
    comprarCarrito() {
      if (this.carrito.length === 0) return;
      this.pedidoActual = this.carrito.map((item) => ({ ...item }));
      this.mensajeCompra = "";
      this.mostrarModalCompra = true;
    },

    /** cerrarModal() — Cierra el modal de compra y limpia el mensaje interno. */
    cerrarModal() {
      this.mostrarModalCompra = false;
      this.mensajeCompra = "";
    },

    /**
     * confirmarCompra() — Valida el formulario y procesa el pedido.
     * Al confirmar: muestra mensaje de éxito, elimina los productos comprados
     * del carrito y limpia el formulario para futuras compras.
     */
    confirmarCompra() {
      const { nombre, correo, direccion, telefono } = this.formCompra;
      if (!nombre || !correo || !direccion || !telefono) {
        this.mensajeCompra = "Por favor completa todos los campos del formulario.";
        return;
      }
      this.mensajeCompra = `Gracias ${nombre}, tu pedido fue confirmado. Te contactaremos al correo ${correo}.`;
      const idsPedido = this.pedidoActual.map((item) => item.id);
      this.carrito = this.carrito.filter((item) => !idsPedido.includes(item.id));
      this.formCompra = { nombre: "", correo: "", direccion: "", telefono: "" };
      this.pedidoActual = [];
    },

    /**
     * enviarContacto() — Valida y procesa el formulario de contacto.
     * Al enviar con éxito: muestra confirmación y limpia los campos.
     */
    enviarContacto() {
      const { nombre, correo, mensaje } = this.contacto;
      if (!nombre || !correo || !mensaje) {
        this.mensajeContacto = "Completa todos los campos del formulario de contacto.";
        return;
      }
      this.mensajeContacto = `Gracias ${nombre}, recibimos tu mensaje y te responderemos pronto.`;
      this.contacto = { nombre: "", correo: "", mensaje: "" };
    },

    // ================================================================
    // CRUD — localStorage, productos, imágenes y notificaciones
    // ================================================================

    /**
     * generarId() — Crea un ID único combinando timestamp y número aleatorio.
     * @returns {string} Identificador único en formato alfanumérico corto
     */
    generarId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    /**
     * cargarProductos() — Lee el catálogo desde localStorage.
     * Si la clave no existe (primera visita), guarda los productos por defecto
     * definidos en data() para que estén disponibles en visitas futuras.
     */
    cargarProductos() {
      const datosGuardados = localStorage.getItem("supermercado_productos");
      if (datosGuardados) {
        this.productos = JSON.parse(datosGuardados);
      } else {
        // Primera vez: persiste el catálogo inicial como punto de partida
        this.guardarProductos();
      }
    },

    /**
     * guardarProductos() — Serializa el array de productos a JSON y lo escribe
     * en localStorage. Se llama después de cada operación CRUD.
     */
    guardarProductos() {
      localStorage.setItem("supermercado_productos", JSON.stringify(this.productos));
    },

    /**
     * mostrarNotificacion(mensaje, tipo) — Muestra un toast en la esquina inferior
     * derecha durante 3 segundos y luego lo oculta automáticamente.
     * @param {string} mensaje - Texto del toast
     * @param {string} tipo    - 'exito' | 'error' | 'advertencia'
     */
    mostrarNotificacion(mensaje, tipo = "exito") {
      this.notificacion = { mensaje, tipo, visible: true };
      setTimeout(() => {
        this.notificacion.visible = false;
      }, 3000);
    },

    /**
     * abrirFormularioCrear() — Limpia el formulario admin y activa el modo creación.
     * Resetea todos los campos y elimina la vista previa de imagen.
     */
    abrirFormularioCrear() {
      this.formAdmin = {
        id: null,
        nombre: "",
        precio: "",
        precioAnterior: "",
        enOferta: false,
        disponible: true,
        categoria: "",
        descripcion: "",
        imagen: "",
      };
      this.imagenPreview = null;
      this.modoEdicion = false;
    },

    /**
     * abrirFormularioEditar(id) — Precarga el formulario con los datos del producto
     * seleccionado y activa el modo edición. Hace scroll hasta el formulario.
     * @param {string|number} id - ID del producto a editar
     */
    abrirFormularioEditar(id) {
      const producto = this.productos.find((p) => p.id === id);
      if (!producto) return;

      // Copia superficial: evita mutar el objeto original antes de confirmar cambios
      this.formAdmin = { ...producto };
      this.imagenPreview = producto.imagen || null;
      this.modoEdicion = true;

      // Espera a que Vue actualice el DOM y luego hace scroll al formulario
      this.$nextTick(() => {
        document.getElementById("admin-form")?.scrollIntoView({ behavior: "smooth" });
      });
    },

    /**
     * validarFormAdmin() — Verifica que los campos obligatorios del formulario sean válidos.
     * Muestra un toast de error para cada validación que falle.
     * @returns {boolean} true si el formulario es válido
     */
    validarFormAdmin() {
      const { nombre, precio, precioAnterior, categoria } = this.formAdmin;

      if (!nombre || nombre.trim().length < 3) {
        this.mostrarNotificacion("El nombre debe tener al menos 3 caracteres.", "error");
        return false;
      }

      if (!precio || isNaN(precio) || Number(precio) <= 0) {
        this.mostrarNotificacion("El precio debe ser un número mayor a cero.", "error");
        return false;
      }

      // Precio anterior es opcional, pero si se ingresa debe ser >= precio actual
      if (precioAnterior && Number(precioAnterior) < Number(precio)) {
        this.mostrarNotificacion(
          "El precio anterior debe ser mayor o igual al precio actual.",
          "advertencia"
        );
        return false;
      }

      if (!categoria || !categoria.trim()) {
        this.mostrarNotificacion("La categoría es obligatoria.", "error");
        return false;
      }

      return true;
    },

    /**
     * guardarProducto() — Crea un producto nuevo o actualiza uno existente
     * según el valor de this.modoEdicion. Persiste los cambios en localStorage.
     *
     * Flujo:
     *   1. Validar formulario
     *   2. Construir objeto final con tipos correctos
     *   3. Insertar (push) o reemplazar (splice) en el array
     *   4. Guardar en localStorage
     *   5. Limpiar formulario y mostrar notificación
     */
    guardarProducto() {
      if (!this.validarFormAdmin()) return;

      // Construye el objeto con tipos de dato correctos (números en lugar de strings)
      const productoFinal = {
        ...this.formAdmin,
        nombre: this.formAdmin.nombre.trim(),
        precio: Number(this.formAdmin.precio),
        // Si no se ingresó precio anterior, usa el precio actual (sin oferta)
        precioAnterior: this.formAdmin.precioAnterior
          ? Number(this.formAdmin.precioAnterior)
          : Number(this.formAdmin.precio),
        categoria: this.formAdmin.categoria.trim(),
        descripcion: this.formAdmin.descripcion.trim(),
      };

      if (this.modoEdicion) {
        // ACTUALIZAR: reemplaza el elemento en el array (splice mantiene reactividad)
        const indice = this.productos.findIndex((p) => p.id === productoFinal.id);
        if (indice !== -1) {
          this.productos.splice(indice, 1, productoFinal);
        }
        this.mostrarNotificacion(`"${productoFinal.nombre}" actualizado correctamente.`, "exito");
      } else {
        // CREAR: asigna ID único y agrega al final del catálogo
        productoFinal.id = this.generarId();
        this.productos.push(productoFinal);
        this.mostrarNotificacion(`"${productoFinal.nombre}" agregado al catálogo.`, "exito");
      }

      this.guardarProductos();
      this.abrirFormularioCrear(); // Limpia el formulario y vuelve al modo crear
    },

    /**
     * eliminarProducto(id) — Elimina un producto del catálogo tras confirmación nativa.
     * Si el producto eliminado estaba siendo editado, limpia el formulario.
     * @param {string|number} id - ID del producto a eliminar
     */
    eliminarProducto(id) {
      const producto = this.productos.find((p) => p.id === id);
      if (!producto) return;

      if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;

      this.productos = this.productos.filter((p) => p.id !== id);
      this.guardarProductos();
      this.mostrarNotificacion(`"${producto.nombre}" eliminado del catálogo.`, "advertencia");

      // Si el producto eliminado era el que estaba en edición, limpia el formulario
      if (this.formAdmin.id === id) {
        this.abrirFormularioCrear();
      }
    },

    /**
     * manejarImagen(event) — Procesa el archivo JPG seleccionado en el input de imagen.
     *
     * Validaciones:
     *   - Solo acepta MIME type image/jpeg (rechaza PNG, GIF, etc.)
     *   - Emite advertencia si el archivo supera 2 MB (no bloquea el guardado)
     *
     * Conversión:
     *   - FileReader.readAsDataURL convierte el archivo a una cadena Base64
     *   - La cadena se guarda en formAdmin.imagen y en imagenPreview
     *
     * @param {Event} event - Evento 'change' del input[type="file"]
     */
    manejarImagen(event) {
      const archivo = event.target.files[0];
      if (!archivo) return;

      // Rechaza cualquier formato que no sea JPEG
      if (!["image/jpeg", "image/jpg"].includes(archivo.type)) {
        this.mostrarNotificacion(
          "Solo se aceptan imágenes en formato JPG o JPEG.",
          "error"
        );
        event.target.value = ""; // Limpia el input para permitir una nueva selección
        return;
      }

      // Advertencia si el tamaño supera 2 MB (localStorage tiene ~5 MB de límite)
      if (archivo.size > 2 * 1024 * 1024) {
        this.mostrarNotificacion(
          "La imagen supera 2 MB. Puede agotar el espacio de localStorage.",
          "advertencia"
        );
      }

      const lector = new FileReader();

      // Se ejecuta cuando FileReader termina de leer el archivo
      lector.onload = (e) => {
        this.formAdmin.imagen = e.target.result; // Cadena Base64 completa
        this.imagenPreview = e.target.result;    // Actualiza la vista previa
      };

      lector.onerror = () => {
        this.mostrarNotificacion("Error al leer el archivo. Intenta de nuevo.", "error");
      };

      // Inicia la lectura asíncrona del archivo como URL de datos (Base64)
      lector.readAsDataURL(archivo);
    },
  },

}).mount("#app");

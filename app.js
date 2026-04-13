const { createApp } = Vue;

createApp({
  data() {
    return {
      tienda: {
        nombre: "Supermercado La Economía",
        descripcion:
          "Encuentra productos frescos, buenos precios y las mejores ofertas para tu hogar.",
      },

      busqueda: "",
      categoriaSeleccionada: "Todos",

      productos: [
        {
          id: 1,
          nombre: "Arroz Premium",
          precio: 2.5,
          precioAnterior: 3.0,
          enOferta: true,
          categoria: "Granos",
          disponible: true,
          descripcion:
            "Arroz de excelente calidad, ideal para tus comidas diarias.",
          imagen: "image.png",
        },
        {
          id: 2,
          nombre: "Leche Entera",
          precio: 1.8,
          precioAnterior: 2.2,
          enOferta: true,
          categoria: "Lácteos",
          disponible: true,
          descripcion: "Leche fresca y nutritiva para toda la familia.",
          imagen: "image.png",
        },
        {
          id: 3,
          nombre: "Pan Artesanal",
          precio: 1.6,
          precioAnterior: 1.6,
          enOferta: false,
          categoria: "Panadería",
          disponible: true,
          descripcion:
            "Pan suave y recién horneado, perfecto para desayuno o cena.",
          imagen: "image.png",
        },
        {
          id: 4,
          nombre: "Huevos AA",
          precio: 3.2,
          precioAnterior: 3.8,
          enOferta: true,
          categoria: "Proteínas",
          disponible: true,
          descripcion:
            "Huevos frescos seleccionados con excelente presentación.",
          imagen: "image.png",
        },
        {
          id: 5,
          nombre: "Queso Campesino",
          precio: 4.4,
          precioAnterior: 4.4,
          enOferta: false,
          categoria: "Lácteos",
          disponible: true,
          descripcion: "Queso fresco con sabor tradicional y textura suave.",
          imagen: "image.png",
        },
        {
          id: 6,
          nombre: "Frijoles",
          precio: 2.2,
          precioAnterior: 2.6,
          enOferta: true,
          categoria: "Granos",
          disponible: false,
          descripcion:
            "Frijoles seleccionados, ideales para una alimentación completa.",
          imagen: "image.png",
        },
      ],

      carrito: [],

      mostrarModalCompra: false,
      pedidoActual: [],
      mensajeCompra: "",

      formCompra: {
        nombre: "",
        correo: "",
        direccion: "",
        telefono: "",
      },

      contacto: {
        nombre: "",
        correo: "",
        mensaje: "",
      },

      mensajeContacto: "",
    };
  },

  computed: {
    categorias() {
      return [...new Set(this.productos.map((p) => p.categoria))];
    },

    productosEnOferta() {
      return this.productos.filter((p) => p.enOferta);
    },

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

    totalCarrito() {
      return this.carrito.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0,
      );
    },

    cantidadCarrito() {
      return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    },

    totalPedidoActual() {
      return this.pedidoActual.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0,
      );
    },
  },

  methods: {
    agregarAlCarrito(producto) {
      const existente = this.carrito.find((item) => item.id === producto.id);

      if (existente) {
        existente.cantidad++;
      } else {
        this.carrito.push({ ...producto, cantidad: 1 });
      }
    },

    sumar(item) {
      item.cantidad++;
    },

    restar(item) {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        this.carrito = this.carrito.filter((p) => p.id !== item.id);
      }
    },

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

    comprarAhora(producto) {
      this.pedidoActual = [{ ...producto, cantidad: 1 }];
      this.mensajeCompra = "";
      this.mostrarModalCompra = true;
    },

    comprarCarrito() {
      if (this.carrito.length === 0) return;

      this.pedidoActual = this.carrito.map((item) => ({ ...item }));
      this.mensajeCompra = "";
      this.mostrarModalCompra = true;
    },

    cerrarModal() {
      this.mostrarModalCompra = false;
      this.mensajeCompra = "";
    },

    confirmarCompra() {
      const { nombre, correo, direccion, telefono } = this.formCompra;

      if (!nombre || !correo || !direccion || !telefono) {
        this.mensajeCompra =
          "Por favor completa todos los campos del formulario.";
        return;
      }

      this.mensajeCompra = `Gracias ${nombre}, tu pedido fue confirmado correctamente. Te contactaremos al correo ${correo}.`;

      const idsPedido = this.pedidoActual.map((item) => item.id);
      this.carrito = this.carrito.filter(
        (item) => !idsPedido.includes(item.id),
      );

      this.formCompra = {
        nombre: "",
        correo: "",
        direccion: "",
        telefono: "",
      };

      this.pedidoActual = [];
    },

    enviarContacto() {
      const { nombre, correo, mensaje } = this.contacto;

      if (!nombre || !correo || !mensaje) {
        this.mensajeContacto =
          "Completa todos los campos del formulario de contacto.";
        return;
      }

      this.mensajeContacto = `Gracias ${nombre}, recibimos tu mensaje y te responderemos pronto.`;

      this.contacto = {
        nombre: "",
        correo: "",
        mensaje: "",
      };
    },
  },
}).mount("#app");

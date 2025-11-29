// main.js - VERSIÓN FINAL INTEGRADA CON CONTADOR ACTUALIZABLE

// 1. VARIABLES GLOBALES
let productosTienda = []; 
let listaParaOrdenar = []; 
let carrito = [];

// Elementos del DOM
const contenedorProductos = document.getElementById("contenedor-productos");
const contenedorCarrito = document.getElementById("contenedor-carrito");
const barraBusqueda = document.getElementById("barra-busqueda");
const contadorCarrito = document.getElementById("contador-carrito");

// ------------------------------------------------------
// 2. CONEXIÓN CON EL SERVIDOR
// ------------------------------------------------------
async function obtenerProductos() {
    try {
        let respuesta = await fetch("http://localhost:3000/api/products"); 
        let respuestaFormato = await respuesta.json(); 
        let productos = respuestaFormato.payload; 

        productosTienda = productos;
        listaParaOrdenar = productosTienda.slice(); 

        console.log("Productos cargados:", productosTienda);
        mostrarLista(productosTienda); 

    } catch (error) {
        console.error("Error al conectar:", error);
    }
}

// ------------------------------------------------------
// 3. FUNCIONES PRINCIPALES
// ------------------------------------------------------

function mostrarLista(productos) {
    let htmlProductos = "";

    productos.forEach(prod => {
        htmlProductos += `
            <div class="card-producto">
                <img src="${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p>$${prod.precio}</p>
                <button class="boton-agregar" onclick="agregarACarrito('${prod.id}')">Agregar al carrito</button>
            </div>
        `;
    }); 

    if(contenedorProductos) contenedorProductos.innerHTML = htmlProductos;
}

// --- CARRITO ---
function agregarACarrito(idProduc) {
    let productoSeleccionado = productosTienda.find(fruta => producto.id == idProduc);

    if (productoSeleccionado) {
        carrito.push(productoSeleccionado);
        actualizarCarritoStorage();
    }
}

function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    actualizarCarritoStorage();
}

function vaciarCarrito() {
    carrito = []; 
    actualizarCarritoStorage();
}

function actualizarCarritoStorage() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    actualizarContadorCarrito(); // ← ACTUALIZA EL CONTADOR
}

//  FUNCIÓN NUEVA: Actualizo el contador del carrito
function actualizarContadorCarrito() {
    const contadorCarrito = document.getElementById("contador-carrito");
    if (contadorCarrito) {
        const cantidad = carrito.length;
        contadorCarrito.innerHTML = `🛒 Carrito: ${cantidad} productos`;
    }
}

function mostrarCarrito() {
    const contenedorCarrito = document.getElementById('contenedor-carrito');
    
    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <h2>🛒 Carrito de Compras</h2>
            <p>El carrito está vacío</p>
        `;
        return;
    }
    
    let html = '<h2>🛒 Carrito de Compras</h2>';
    
    // Items del carrito
    carrito.forEach((item, index) => {
        html += `
            <div class="bloque-item">
                <span>${item.nombre} - $${item.precio}</span>
                <button class="boton-eliminar" onclick="eliminarDelCarrito(${index})">
                    Eliminar
                </button>
            </div>
        `;
    });
    
    // Total y botón vaciar
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    html += `
        <div class="carrito-acciones">
            <button id="vaciar-carrito" onclick="vaciarCarrito()">
                Vaciar carrito
            </button>
            <div class="total-carrito-interno">
                Total: $${total}
            </div>
        </div>
    `;
    
    contenedorCarrito.innerHTML = html;
}

// --- FILTROS Y ORDENAMIENTO ---
function filtrarProducto() {
    let valorBusqueda = barraBusqueda.value.toLowerCase();
    let productosFiltrados = productosTienda.filter(fruta => 
        producto.nombre.toLowerCase().includes(valorBusqueda)
    );
    mostrarLista(productosFiltrados);
}

if(barraBusqueda) barraBusqueda.addEventListener("input", filtrarProducto);

const btnOrdNombre = document.getElementById("ordenar-nombre");
const btnOrdPrecio = document.getElementById("ordenar-precio");

if(btnOrdNombre) {
    btnOrdNombre.addEventListener("click", () => {
        listaParaOrdenar.sort((a, b) => a.nombre.localeCompare(b.nombre));
        mostrarLista(listaParaOrdenar);
    });
}

if(btnOrdPrecio) {
    btnOrdPrecio.addEventListener("click", () => {
        listaParaOrdenar.sort((a, b) => a.precio - b.precio);
        mostrarLista(listaParaOrdenar);
    });
}

// ------------------------------------------------------
// 4. INICIALIZACIÓN
// ------------------------------------------------------
function init() {
    // Datos alumno
    const navAlumno = document.getElementById("nav-alumno");
    if(navAlumno) navAlumno.innerHTML = "<p>Nicolás Macri</p>";

    // Recuperar carrito del localStorage
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        mostrarCarrito();
    }

    
    // Actualizar contador al inicio
    actualizarContadorCarrito();

    // Llamada al servidor
    obtenerProductos();
}

init();
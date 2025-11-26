// main.js - VERSIÓN FINAL INTEGRADA

// 1. VARIABLES GLOBALES
let frutasTienda = []; 
let listaParaOrdenar = []; 
let carrito = [];

// Elementos del DOM (Verificamos que existan para no tener errores)
const contenedorProductos = document.getElementById("contenedor-productos");
const contenedorCarrito = document.getElementById("contenedor-carrito");
const barraBusqueda = document.getElementById("barra-busqueda");
const contadorCarrito = document.getElementById("contador-carrito");

// ------------------------------------------------------
// 2. CONEXIÓN CON EL SERVIDOR (El código nuevo)
// ------------------------------------------------------
async function obtenerProductos() {
    try {
        // Usamos la ruta correcta del backend
        let respuesta = await fetch("http://localhost:3000/api/products"); 
        
        let respuestaFormato = await respuesta.json(); 
        
        // Sacamos la lista del payload
        let productos = respuestaFormato.payload; 

        // GUARDAMOS EN LAS VARIABLES GLOBALES
        frutasTienda = productos;
        listaParaOrdenar = frutasTienda.slice(); 

        console.log("Productos cargados:", frutasTienda);
        mostrarLista(frutasTienda); 

    } catch (error) {
        console.error("Error al conectar:", error);
    }
}

// ------------------------------------------------------
// 3. TUS FUNCIONES (El cerebro)
// ------------------------------------------------------

function mostrarLista(productos) {
    let htmlProductos = "";

    productos.forEach(prod => {
        // FUSION: Usamos 'prod.imagen' (backend) pero agregamos el botón del carrito
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
function agregarACarrito(idFruta) {
    // Buscamos por ID (comparación flexible == por si uno es string y otro número)
    let frutaSeleccionada = frutasTienda.find(fruta => fruta.id == idFruta);

    if (frutaSeleccionada) {
        carrito.push(frutaSeleccionada);
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
}

function mostrarCarrito() {
    if (!contenedorCarrito) return; 

    let htmlCarrito = "<ul>";
    let total = 0;

    carrito.forEach(function(fruta, index) {
        htmlCarrito += `
            <li>
                ${fruta.nombre} - $${fruta.precio}
                <button class="boton-eliminar" onclick="eliminarDelCarrito(${index})">Eliminar</button>
            </li>
        `;
        total += fruta.precio;
    });

    if (carrito.length > 0) {
        htmlCarrito += "</ul>"; 
        htmlCarrito += `
            <div class="carrito-footer">
                <button id="vaciar-carrito" class="boton-eliminar" onclick="vaciarCarrito()">Vaciar carrito</button>
                <p>Total: $${total}</p>
            </div>
        `;
    } else {
        htmlCarrito = "<p>Carrito vacío</p>";
    }

    contenedorCarrito.innerHTML = htmlCarrito;
    if(contadorCarrito) contadorCarrito.innerText = `Carrito: ${carrito.length} producto${carrito.length !== 1 ? "s" : ""}`;
}

// --- FILTROS Y ORDENAMIENTO ---
function filtrarProducto() {
    let valorBusqueda = barraBusqueda.value.toLowerCase();
    let productosFiltrados = frutasTienda.filter(fruta => 
        fruta.nombre.toLowerCase().includes(valorBusqueda)
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

    // Recuperar carrito
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        mostrarCarrito();
    }

    // Llamada al servidor
    obtenerProductos();
}

init();
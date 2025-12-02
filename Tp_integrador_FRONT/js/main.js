// main.js - VERSIÓN FINAL INTEGRADA CON CONTADOR ACTUALIZABLE
let nombreUsuario = sessionStorage.getItem("nombreUsuario");


saludarclienteStorage();
// 1. VARIABLES GLOBALES
let productosTienda = []; 
let listaParaOrdenar = []; 
let carrito = [];

// Elementos del DOM
const contenedorProductos = document.getElementById("contenedor-productos");
const contenedorCarrito = document.getElementById("contenedor-carrito");
const barraBusqueda = document.getElementById("barra-busqueda");
const contadorCarrito = document.getElementById("contador-carrito");
let boton_imprimir = document.getElementById("btn-imprimir");


function saludarclienteStorage() {
    const nombre = sessionStorage.getItem("nombreUsuario");
    if (!nombre || nombre === "") {
        console.log("No se encontró nombre de usuario. Redirigiendo a bienvenida.");
        window.location.href = "bienvenida.html"; 
        return; 
    }
    document.getElementById("datos-alumno").textContent = " Bienvenido " + nombre;
}

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

async function registrarVenta(precioTotal, idProductos) {
    try {
        // let nombreUsuario = sessionStorage.getItem("nombreUsuario");

        const fecha = new Date();

        // Visualizamos por consola todos los datos que le mandaremos al endpoint /api/sales
        console.log(fecha);         // Mon Dec 01 2025 22:01:57 GMT-0300 (Argentina Standard Time)
        console.log(nombreUsuario); // Gabi
        console.log(precioTotal);   // 1550
        console.log(idProductos);   // [ 13, 12, 11 ]

        // Formato MySQL para timestamp
        // Tenemos que formatear la fecha para que la acepte mysql
        const fechaFormato = fecha.toISOString().slice(0, 19).replace("T", " "); // MySQL no acepta fechas en formato ISO con milisegundos ni con la Z

        console.log(fechaFormato); // 2025-12-02 01:07:10
        

        
        // Preparamos en el objeto data la informacion que le enviaremos al endpoint /api/sales en formato JSON en nuestra peticion POST
        const data = {
            nombreUsuario: nombreUsuario,
            precioTotal: precioTotal,
            fechaEmision: fechaFormato,
            productos: idProductos
        }

        const response = await fetch("http://localhost:3000/api/sales", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if(response.ok) {
            console.log("Venta registrada: ", result);
            alert(result.message);

            // Limpieza y redireccion
            sessionStorage.removeItem("nombreUsuario"); // Eliminamos el nombre de usuario 
            // sessionStorage.removeItem("carrito")
            window.location.href = "cliente.html";

        } else {
            console.error(result);
            alert("Error en la venta: " + result.message)
        }



    } catch (error) {
        console.error("Error al enviar los datos", error);
        alert("Error al registrar la venta");
    }
}



// --- CARRITO ---
function agregarACarrito(idProduc) {
    let productoSeleccionado = productosTienda.find(producto => producto.id == idProduc);

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
    let productosFiltrados = productosTienda.filter(producto => 
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


boton_imprimir.addEventListener("click", imprimirTicket);

    function imprimirTicket(){
        console.table(carrito)

        const idProductos = [];


        const { jsPDF } = window.jspdf;

        const doc = new jsPDF();

        let y = 10;

        doc.setFontSize(18);

        doc.text("ElectroTech-ticket de compra", 10, y);

        y += 10;

        carrito.forEach(prod => {
            idProductos.push(prod.id);

            doc.text(`${prod.nombre} / $${prod.precio}`, 20,y); 

            y += 7
        });

        const precioTotal = carrito.reduce((total, prod) => total + parseInt(prod.precio), 0);

        y += 5;


        doc.text(`Total $${precioTotal}`, 10, y);


        doc.save("ticket.pdf");

        registrarVenta(precioTotal, idProductos)
    }








// ------------------------------------------------------
// 4. INICIALIZACIÓN
// ------------------------------------------------------
function init() {
    // Datos alumno
    saludarclienteStorage();
    

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
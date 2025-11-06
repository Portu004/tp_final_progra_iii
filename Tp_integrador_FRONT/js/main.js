let contenedorProductos = document.getElementById("contenedor-productos");

async function obtenerProductos() {
    try {
        let respuesta = await fetch("http://localhost:3300/products"); 
        
        let respuestaFormato = await respuesta.json(); // Esto es { playload: [...] }
        
        
        let productos = respuestaFormato.payload; 

        console.table(productos);
        mostrarProductos(productos); 

    } catch (error) {
        console.error(error);
    }
}

function mostrarProductos(productos) {
    let htmlProductos = "";

    productos.forEach(prod => {
        htmlProductos += `
            <div class="card-producto">
                <img src="${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p>$${prod.precio}</p>
            </div>
        `;
    }); 


    contenedorProductos.innerHTML = htmlProductos;
}

function init() {
    obtenerProductos();
}

init();
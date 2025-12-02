document.getElementById("form-bienvenida").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita que el navegador recargue

    const nombre = document.getElementById("nombre").value.trim();
    if (nombre === "") return;

    localStorage.setItem("clienteNombre", nombre);

    // Redirige usando el propio formulario 
    this.submit();
});

let formBienvenida = document.getElementById("form-bienvenida");
formBienvenida.addEventListener("submit", event => {
    event.preventDefault();


let nombreUsuario = document.getElementById("nombre").value;

if(nombreUsuario.length > 0) {
    sessionStorage.setItem("nombreUsuario", nombreUsuario);
    window.location.href = "cliente.html"
}
})


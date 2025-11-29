document.getElementById("form-bienvenida").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita que el navegador recargue

    const nombre = document.getElementById("nombre").value.trim();
    if (nombre === "") return;

    localStorage.setItem("clienteNombre", nombre);

    // Redirige usando el propio formulario 
    this.submit();
});

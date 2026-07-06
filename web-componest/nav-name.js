document.addEventListener("DOMContentLoaded", () => {
    const usuarioActivo = localStorage.getItem("usuarioLogueado");
    const contenedorNombre = document.getElementById("nombre-sesion");
    if (contenedorNombre) {
        if (usuarioActivo) {
            contenedorNombre.textContent = usuarioActivo.toUpperCase();
        } else {
            contenedorNombre.textContent = "INVITADO";
        }
    }
});
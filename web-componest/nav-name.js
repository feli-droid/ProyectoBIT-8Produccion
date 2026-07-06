// Este script se ejecutará automáticamente en cualquier página que lo incluya
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Intentamos obtener el usuario guardado desde el localStorage
    const usuarioActivo = localStorage.getItem("usuarioLogueado");
    
    // 2. Buscamos el elemento HTML donde debe ir el nombre
    const contenedorNombre = document.getElementById("nombre-sesion");

    // 3. Si el contenedor existe en la página actual, le metemos el nombre
    if (contenedorNombre) {
        if (usuarioActivo) {
            contenedorNombre.textContent = usuarioActivo.toUpperCase();
        } else {
            contenedorNombre.textContent = "INVITADO";
        }
    }
});
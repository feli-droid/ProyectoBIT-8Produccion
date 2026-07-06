const URL_LOGIN = "https://empresa-bits-8-default-rtdb.firebaseio.com/";

const formulario = document.getElementById("registro");

formulario.addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const formData = new FormData(formulario);
    const ccIngresada = formData.get("CC")?.trim(); 
    const passwordIngresado = formData.get("password")?.trim(); 

    try {
        const respuesta = await fetch(`${URL_LOGIN}/users.json`);
        const listaUsuarios = await respuesta.json();

        if (!listaUsuarios) {
            alert("No hay usuarios registrados.");
            return;
        }

        const usuarioValido = Object.values(listaUsuarios).find(user => {
            if (!user) return false;
            return user.CC === ccIngresada && user.password === passwordIngresado;
        });

        if (usuarioValido) {
            alert(`Bienvenido a la Empresa bit-8, ${usuarioValido.name}`);
            
            localStorage.setItem("usuarioLogueado", usuarioValido.name);
            
            window.location.href = "User management.html"; 
        } else {
            alert("Cédula o contraseña incorrectas. Por favor, verifica tus datos.");
        }

    } catch (error) {
        console.error("Hubo un error en la conexión:", error);
    }
});


















































































































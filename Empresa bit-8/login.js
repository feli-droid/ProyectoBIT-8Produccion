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
            window.location.href = "user.html"; 
        } else {
            alert("Cédula o contraseña incorrectas. Por favor, verifica tus datos.");
        }

    } catch (error) {
        console.error("Hubo un error en la conexión:", error);
    }
});

async function registrarNuevoUsuario() {
    const cedula = document.getElementById('reg-CC');
    const nombreInput = document.getElementById('reg-nombreReal');
    const password = document.getElementById('reg-pass');
    const confirmPassword = document.getElementById('reg-passConfirm'); 
    const puesto = document.getElementById('reg-cargos');

    const CCT = cedula.value.trim();
    const nombre = nombreInput.value.trim();
    const cont = password.value.trim();
    const contConfirm = confirmPassword.value.trim(); 
    const cargos_E = puesto.value.trim();

    if (CCT === "" || nombre === "" || cont === "" || contConfirm === "" || cargos_E === "") {
        alert("Por favor, rellena todos los campos para el registro.");
        return;
    }

    if (cont !== contConfirm) {
        alert("Las contraseñas de registro no coinciden. Por favor, verifícalas.");
        password.focus();
        return;
    }

    const datosUsuario = {
        CC: CCT,
        cargo: cargos_E,
        name: nombre,
        password: cont
    };

    try {
        const respuesta = await fetch(`${URL_LOGIN}/users/${CCT}.json`, {
            method: 'PUT',
            body: JSON.stringify(datosUsuario),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (respuesta.ok) {
            alert("¡Usuario registrado con éxito! Ya puedes iniciar sesión.");
            
            cedula.value = "";
            nombreInput.value = "";
            password.value = "";
            confirmPassword.value = "";
            puesto.value = "";
            
            ocultarFormularioRegistro();
        }
    } catch (error) {
        console.error("Error al registrar usuario:", error);
    }
}

function mostrarFormularioRegistro() {
    document.getElementById('contenedor-registro').style.display = 'block';
}

function ocultarFormularioRegistro() {
    document.getElementById('contenedor-registro').style.display = 'none';
}

















































































































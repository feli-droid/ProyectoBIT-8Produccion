const URL_LOGIN = "https://empresa-bits-8-default-rtdb.firebaseio.com"; // Sin el "/" al final para evitar dobles barras

// Ejecutar al cargar la página para traer los usuarios existentes
document.addEventListener("DOMContentLoaded", obtenerUsuarios);

// ==========================================
// 1. LÓGICA DEL REGISTRO DE NUEVOS USUARIOS
// ==========================================
async function registrarNuevoUsuario() {
    // Capturamos los elementos del DOM
    const cedulaInput = document.getElementById('CC');
    const nombreInput = document.getElementById('nombreReal');
    const passwordInput = document.getElementById('pass');
    const confirmPasswordInput = document.getElementById('passConfirm'); 
    const puestoInput = document.getElementById('cargos');

    // Obtenemos sus valores limpios
    const CCT = cedulaInput.value.trim();
    const nombre = nombreInput.value.trim();
    const cont = passwordInput.value.trim();
    const contConfirm = confirmPasswordInput.value.trim(); 
    const cargos_E = puestoInput.value;

    // 1. Validar campos vacíos
    if (!CCT || !nombre || !cont || !contConfirm || !cargos_E) {
        alert("Por favor, rellena todos los campos para el registro.");
        return;
    }

    // 2. Validar contraseñas idénticas
    if (cont !== contConfirm) {
        alert("Las contraseñas de registro no coinciden. Por favor, verifícalas.");
        passwordInput.focus();
        return;
    }

    // Estructura de datos exacta para Firebase
    const datosUsuario = {
        CC: CCT,
        cargo: cargos_E,
        name: nombre,
        password: cont
    };

    try {
        // Petición PUT a Firebase usando la CC como llave
        const respuesta = await fetch(`${URL_LOGIN}/users/${CCT}.json`, {
            method: 'PUT',
            body: JSON.stringify(datosUsuario),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (respuesta.ok) {
            alert("¡Usuario registrado con éxito!");
            
            // Limpiamos los campos del formulario
            cedulaInput.value = "";
            nombreInput.value = "";
            passwordInput.value = "";
            confirmPasswordInput.value = "";
            puestoInput.value = "";
            
            // Ocultamos el formulario y refrescamos la tabla
            ocultarFormulario();
            obtenerUsuarios(); 
        } else {
            alert("No se pudo guardar en la base de datos. Revisa la consola.");
        }
    } catch (error) {
        console.error("Error al registrar usuario:", error);
    }
}

// ==========================================
// 2. LÓGICA PARA MOSTRAR LOS USUARIOS EN LA TABLA
// ==========================================
async function obtenerUsuarios() {
    const tabla = document.getElementById("tabla-usuarios");
    if (!tabla) return;

    try {
        const respuesta = await fetch(`${URL_LOGIN}/users.json`);
        const listaUsuarios = await respuesta.json();

        tabla.innerHTML = ""; // Limpiar la tabla antes de pintar

        if (!listaUsuarios) {
            tabla.innerHTML = `<tr><td colspan="3" style="text-align:center;">No hay usuarios registrados</td></tr>`;
            return;
        }

        // Recorrer los usuarios de Firebase y agregarlos a la tabla
        Object.values(listaUsuarios).forEach(user => {
            if (user) {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${user.CC || 'N/A'}</td>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.cargo || 'N/A'}</td>
                `;
                tabla.appendChild(fila);
            }
        });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}

// ==========================================
// 3. CONTROL DE VISIBILIDAD DEL FORMULARIO
// ==========================================
function mostrarFormulario() {
    document.getElementById('contenedor-formulario').style.display = 'block';
}

function ocultarFormulario() {
    document.getElementById('contenedor-formulario').style.display = 'none';
}

// Función básica para evitar errores si el buscador ejecuta filtrarUsuarios()
function filtrarUsuarios() {
    const texto = document.getElementById("buscador-cc").value.toLowerCase();
    const filas = document.querySelectorAll("#tabla-usuarios tr");

    filas.forEach(fila => {
        const cedula = fila.cells[0]?.textContent || "";
        if (cedula.toLowerCase().includes(texto)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}
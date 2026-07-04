const BASE_URL = "https://empresa-bits-8-default-rtdb.firebaseio.com/users";

// NUEVO PARA EDICIÓN: Variable global para saber a quién estamos editando. 
// Si es null, significa que estamos creando un usuario nuevo.
let editandoId = null;

async function obtenerUsuarios(filtroCC = "") {
    const tbody = document.getElementById('tabla-usuarios');
    tbody.innerHTML = ""; 

    try {
        const respuesta = await fetch(`${BASE_URL}.json`);
        const data = await respuesta.json();

        if (data !== null) {
            let hayResultados = false; 

            Object.keys(data).forEach(id => {
                const usuario = data[id];
                
                const nombre = usuario.name || usuario.nombre || "Sin nombre";
                const cargo = usuario.cargo || usuario.puestos || "Sin cargo";
                const contrasena = usuario.password || ""; // Guardamos temporalmente para pasarla a la edición
                const cedulaMostrar = usuario.CC || id; 

                const terminoBúsqueda = filtroCC.trim();
                if (terminoBúsqueda !== "" && !cedulaMostrar.includes(terminoBúsqueda)) {
                    return; 
                }

                hayResultados = true; 

                // NUEVO PARA EDICIÓN: Se agregó el botón de Editar pasando todos los parámetros necesarios
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td><strong>${cedulaMostrar}</strong></td>
                    <td>${nombre}</td>
                    <td>${cargo}</td>
                    <td>
                        <button class="btn-edit" onclick="cargarDatosEdicion('${id}', '${cedulaMostrar}', '${nombre}', '${cargo}', '${contrasena}')
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        ccampuccampus2023
                        ">Editar</button>
                        <button class="btn-delete" onclick="eliminarUsuario('${id}', '${nombre}')">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(fila);
            });

            if (!hayResultados) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No se encontró ningún usuario con esa CC.</td></tr>`;
            }

        } else {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay usuarios registrados.</td></tr>`;
        }
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function filtrarUsuarios() {
    const inputBuscador = document.getElementById('buscador-cc');
    const valorBusqueda = inputBuscador.value;
    obtenerUsuarios(valorBusqueda); 
}

// NUEVO PARA EDICIÓN: Función que toma los datos de la fila y los monta en el formulario
function cargarDatosEdicion(id, cc, nombre, cargo, password) {
    editandoId = id; // Guardamos el ID que estamos editando
    
    // Rellenamos el formulario de tu HTML
    document.getElementById('CC').value = cc;
    document.getElementById('CC').disabled = true; // Bloqueamos la CC para que no la cambien (es la llave en Firebase)
    document.getElementById('nombreReal').value = nombre;
    document.getElementById('cargos').value = cargo;
    document.getElementById('pass').value = password;
    document.getElementById('passConfirm').value = password; // Rellenamos la confirmación también

    // Cambiamos el título visual del formulario
    const tituloForm = document.querySelector('#contenedor-formulario h3');
    if(tituloForm) tituloForm.innerText = "Editar Usuario";

    mostrarFormulario();
}

// CAMBIADO DE NOMBRE: Antes se llamaba agregarUsuario, ahora maneja ambos estados (Guardar / Editar)
async function guardarUsuario() {
    const cedula = document.getElementById('CC');
    const nombreInput = document.getElementById('nombreReal');
    const password = document.getElementById('pass');
    const confirmPassword = document.getElementById('passConfirm'); 
    const puesto = document.getElementById('cargos');

    const CCT = cedula.value.trim();
    const nombre = nombreInput.value.trim();
    const cont = password.value.trim();
    const contConfirm = confirmPassword.value.trim(); 
    const cargos_E = puesto.value.trim();

    if (CCT === "" || nombre === "" || cont === "" || contConfirm === "" || cargos_E === "") {
        alert("Por favor, rellena todos los campos.");
        return;
    }

    if (cont !== contConfirm) {
        alert("Las contraseñas no coinciden. Por favor, verifícalas.");
        password.focus();
        return;
    }

    const datosUsuario = {
        CC: CCT,
        cargo: cargos_E,
        name: nombre,
        password: cont
    };

    // NUEVO PARA EDICIÓN: Definimos la ruta. Si estamos editando usamos el 'editandoId', si no, la nueva CC
    const urlDestino = editandoId ? `${BASE_URL}/${editandoId}.json` : `${BASE_URL}/${CCT}.json`;

    try {
        const respuesta = await fetch(urlDestino, {
            method: 'PUT',
            body: JSON.stringify(datosUsuario),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (respuesta.ok) {
            limpiarFormulario();
            ocultarFormulario();
            obtenerUsuarios();
        }
    } catch (error) {
        console.error("Error al guardar usuario:", error);
    }
}

// NUEVAS: Funciones para controlar la vista del formulario
function mostrarFormulario() {
    document.getElementById('contenedor-formulario').style.display = 'block';
}

function ocultarFormulario() {
    document.getElementById('contenedor-formulario').style.display = 'none';
    limpiarFormulario();
}


function limpiarFormulario() {
    editandoId = null; 
    
    document.getElementById('CC').value = "";
    document.getElementById('CC').disabled = false;
    document.getElementById('nombreReal').value = "";
    document.getElementById('pass').value = "";
    document.getElementById('passConfirm').value = ""; 
    document.getElementById('cargos').value = "";
    document.getElementById('buscador-cc').value = "";

    const tituloForm = document.querySelector('#contenedor-formulario h3');
    if(tituloForm) tituloForm.innerText = "Registrar Nuevo Usuario";
}

async function eliminarUsuario(id, nombreUsuario) {
    if (id === "0") {
        alert("El usuario raíz e intocable no puede ser eliminado.");
        return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombreUsuario}"?`)) return;

    try {
        const respuesta = await fetch(`${BASE_URL}/${id}.json`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            const valorBusqueda = document.getElementById('buscador-cc').value;
            obtenerUsuarios(valorBusqueda);
        }
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => obtenerUsuarios());
const URL_LOGIN = "https://empresa-bits-8-default-rtdb.firebaseio.com"; 

document.addEventListener("DOMContentLoaded", () => {
    obtenerUsuarios();

    const formularioComp = document.querySelector('formulario-registro');
    if (formularioComp) {
        formularioComp.addEventListener('usuario-registrado', obtenerUsuarios);
    }
});

async function obtenerUsuarios() {
    const tabla = document.getElementById("tabla-usuarios");
    if (!tabla) return;

    try {
        const respuesta = await fetch(`${URL_LOGIN}/users.json`);
        const listaUsuarios = await respuesta.json();

        tabla.innerHTML = ""; 

        if (!listaUsuarios) {
            tabla.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay usuarios registrados</td></tr>`;
            return;
        }

        Object.entries(listaUsuarios).forEach(([firebaseKey, user]) => {
            if (user) {
                const fila = document.createElement("tr");
                
                const nameEscaped = user.name ? user.name.replace(/'/g, "\\'") : '';
                const passwordEscaped = user.password ? user.password.replace(/'/g, "\\'") : '';

                fila.innerHTML = `
                    <td>${user.CC || 'N/A'}</td>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.cargo || 'N/A'}</td>
                    <td>
                        <button onclick="prepararEdicion('${firebaseKey}', '${user.CC}', '${nameEscaped}', '${user.cargo}', '${passwordEscaped}')">Editar</button>
                        <button onclick="eliminarUsuario('${firebaseKey}', '${user.CC}', '${nameEscaped}')">Eliminar</button>
                    </td>
                `;
                tabla.appendChild(fila);
            }
        });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}

function prepararEdicion(firebaseKey, cc, name, cargo, password) {
    if (firebaseKey === "0" || cc === "0" || name.trim() === "Andres Felipe R.A") {
        alert("No se puede editar porque es el usuario principal.");
        return;
    }

    const comp = document.querySelector('formulario-registro');
    if (!comp) return;

    comp.mostrar();
    
    comp.querySelector('#reg-CC').value = cc;
    comp.querySelector('#reg-CC').disabled = true;
    comp.querySelector('#reg-nombreReal').value = name;
    comp.querySelector('#reg-pass').value = password;
    comp.querySelector('#reg-passConfirm').value = password;
    comp.querySelector('#reg-cargos').value = cargo;
    comp.querySelector('#btn-registrar').innerText = "Actualizar Usuario";
}

async function eliminarUsuario(firebaseKey, cc, name) {
    if (firebaseKey === "0" || cc === "0" || name.trim() === "Andres Felipe R.A") {
        alert("No se puede eliminar este usuario.");
        return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario con CC: ${cc}?`)) {
        return;
    }

    try {
        const respuesta = await fetch(`${URL_LOGIN}/users/${firebaseKey}.json`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            alert("Usuario eliminado correctamente.");
            obtenerUsuarios(); 
        } else {
            alert("No se pudo eliminar al usuario.");
        }
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
    }
}

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
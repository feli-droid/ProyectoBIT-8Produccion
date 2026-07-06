class FormularioRegistro extends HTMLElement {
    constructor() {
        super();
        // Aquí guardamos el HTML que antes tenías duplicado en tus archivos
        this.innerHTML = `
            <div id="contenedor-registro" style="display: none;">
                <h3>Crear Nueva Cuenta</h3>
                
                <div style="margin-bottom: 10px;">
                    <input type="number" id="reg-CC" placeholder="Identificación (CC)">
                </div>
                <div style="margin-bottom: 10px;">
                    <input type="text" id="reg-nombreReal" placeholder="Nombre Completo">
                </div>
                <div style="margin-bottom: 10px;">
                    <select id="reg-cargos" style="width: 100%; padding: 4px;">
                        <option value="" disabled selected>Cuál es tu Cargo</option>
                        <option value="client">Cliente</option>
                        <option value="empleado">Empleado</option>
                        <option value="socio">Socio</option>
                    </select>
                </div>
                <div style="margin-bottom: 10px;">
                    <input type="password" id="reg-pass" placeholder="Contraseña">
                </div>
                <div style="margin-bottom: 15px;">
                    <input type="password" id="reg-passConfirm" placeholder="Repetir Contraseña">
                </div>

                <div>
                    <button type="button" id="btn-registrar">Registrarme</button>
                    <button type="button" id="btn-cancelar" style="margin-left: 10px;">Cancelar</button>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        // Escuchar los clics de los botones internos
        this.querySelector('#btn-registrar').addEventListener('click', () => this.registrarNuevoUsuario());
        this.querySelector('#btn-cancelar').addEventListener('click', () => this.ocultar());
    }

    mostrar() {
        this.querySelector('#contenedor-registro').style.display = 'block';
    }

    ocultar() {
        this.querySelector('#contenedor-registro').style.display = 'none';
        this.limpiar();
    }

    limpiar() {
        this.querySelector('#reg-CC').value = "";
        this.querySelector('#reg-nombreReal').value = "";
        this.querySelector('#reg-cargos').value = "";
        this.querySelector('#reg-pass').value = "";
        this.querySelector('#reg-passConfirm').value = "";
    }

    async registrarNuevoUsuario() {
        const CCT = this.querySelector('#reg-CC').value.trim();
        const nombre = this.querySelector('#reg-nombreReal').value.trim();
        const cont = this.querySelector('#reg-pass').value.trim();
        const contConfirm = this.querySelector('#reg-passConfirm').value.trim(); 
        const cargos_E = this.querySelector('#reg-cargos').value;

        if (CCT === "" || nombre === "" || cont === "" || contConfirm === "" || cargos_E === "") {
            alert("Por favor, rellena todos los campos para el registro.");
            return;
        }

        if (cont !== contConfirm) {
            alert("Las contraseñas de registro no coinciden. Por favor, verifícalas.");
            return;
        }

        const datosUsuario = { CC: CCT, cargo: cargos_E, name: nombre, password: cont };

        try {
            const respuesta = await fetch(`https://empresa-bits-8-default-rtdb.firebaseio.com/users/${CCT}.json`, {
                method: 'PUT',
                body: JSON.stringify(datosUsuario),
                headers: { 'Content-Type': 'application/json' }
            });

            if (respuesta.ok) {
                alert("¡Usuario registrado con éxito!");
                this.ocultar();
                
                this.dispatchEvent(new CustomEvent('usuario-registrado'));
            }
        } catch (error) {
            console.error("Error al registrar usuario:", error);
        }
    }
}

// Registramos el componente en el navegador
customElements.define('formulario-registro', FormularioRegistro);
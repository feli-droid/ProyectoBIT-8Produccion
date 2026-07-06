class FormularioRegistro extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div id="contenedor-registro">
                <h3>Crear Nueva Cuenta</h3>
                
                <div>
                    <input type="number" id="reg-CC" placeholder="Identificación (CC)">
                </div>
                <div>
                    <input type="text" id="reg-nombreReal" placeholder="Nombre Completo">
                </div>
                <div>
                    <select id="reg-cargos">
                        <option value="" disabled selected>Cuál es tu Cargo</option>
                        <option value="client">Cliente</option>
                        <option value="empleado">Empleado</option>
                        <option value="socio">Socio</option>
                    </select>
                </div>
                <div>
                    <input type="password" id="reg-pass" placeholder="Contraseña">
                </div>
                <div>
                    <input type="password" id="reg-passConfirm" placeholder="Repetir Contraseña">
                </div>

                <div>
                    <button type="button" id="btn-registrar">Registrarme</button>
                    <button type="button" id="btn-cancelar">Cancelar</button>
                </div>
            </div>
        `;
        
        this.querySelector('#contenedor-registro').style.display = 'none';
    }

    connectedCallback() {
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

customElements.define('formulario-registro', FormularioRegistro);

// selector-productos.js
class SelectorProductos extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `<select id="dinamico-select"><option value="">Cargando ítems...</option></select>`;
    }

    // Le permite al componente saber si debe listar "receta" o "materia_prima"
    static get observedAttributes() { return ['tipo-filtro']; }

    async actualizarOpciones(inventarioCompleto) {
        const select = this.querySelector('#dinamico-select');
        const tipoBuscado = this.getAttribute('tipo-filtro');
        
        select.innerHTML = '<option value="">-- Selecciona una opción --</option>';
        let contador = 0;

        Object.keys(inventarioCompleto).forEach(id => {
            const prod = inventarioCompleto[id];
            if (!tipoBuscado || prod.tipo === tipoBuscado) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = `[${prod.codigo}] - ${prod.nombre}`;
                select.appendChild(option);
                contador++;
            }
        });

        if (contador === 0) {
            select.innerHTML = '<option value="" disabled>No hay elementos registrados</option>';
        }
    }

    get value() { return this.querySelector('#dinamico-select').value; }
    set value(val) { this.querySelector('#dinamico-select').value = val; }
}
customElements.define('selector-productos', SelectorProductos);
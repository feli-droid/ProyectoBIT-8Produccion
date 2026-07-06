const FIREBASE_URL = "https://empresa-bits-8-default-rtdb.firebaseio.com/productos";
let inventario = {};
let ingredientesTemporales = []; 

const form = document.getElementById('product-form');
const codigoInput = document.getElementById('codigo');
const nombreInput = document.getElementById('nombre');
const tipoSelect = document.getElementById('tipo');
const stockInput = document.getElementById('stock');
const proveedorInput = document.getElementById('proveedor');
const editIdInput = document.getElementById('edit-id');
const btnSubmit = document.getElementById('btn-submit');
const formTitle = document.getElementById('form-title');
const tableBody = document.getElementById('inventory-table-body');
const buscarCodigoInput = document.getElementById('buscar-codigo');

const seccionIngredientes = document.getElementById('seccion-ingredientes');
const ingredienteTipo = document.getElementById('ingrediente-tipo');
const ingredienteSeleccionado = document.getElementById('ingrediente-seleccionado');
const ingredienteCantidad = document.getElementById('ingrediente-cantidad');
const listaIngredientesAgregados = document.getElementById('lista-ingredientes-agregados');

function toggleStock() {
    if (tipoSelect.value === 'receta') {
        stockInput.value = 0;
        stockInput.disabled = true;
        seccionIngredientes.style.display = 'block'; 
        actualizarDesplegableIngredientes();
    } else {
        stockInput.disabled = false;
        seccionIngredientes.style.display = 'none'; 
        ingredientesTemporales = [];
        actualizarListaVisualIngredientes();
    }
}

function actualizarDesplegableIngredientes() {
    // Verificamos que exista el componente y que tenga la función antes de ejecutarla
    if (ingredienteSeleccionado && typeof ingredienteSeleccionado.actualizarOpciones === 'function') {
        ingredienteSeleccionado.setAttribute('tipo-filtro', ingredienteTipo.value);
        ingredienteSeleccionado.actualizarOpciones(inventario, editIdInput.value);
    }
}

function agregarIngredienteLista() {
    const idItem = ingredienteSeleccionado.value;
    const cantidad = parseFloat(ingredienteCantidad.value);

    if (!idItem || isNaN(cantidad) || cantidad <= 0) {
        alert("Selecciona un ítem y asigna una cantidad válida.");
        return;
    }

    const productoOriginal = inventario[idItem];
    if (!productoOriginal) {
        alert("El ítem seleccionado ya no existe en el inventario.");
        return;
    }

    const existe = ingredientesTemporales.some(ing => ing.id === idItem);
    if (existe) {
        alert("Este ingrediente ya está en la lista.");
        return;
    }

    ingredientesTemporales.push({
        id: idItem,
        codigo: productoOriginal.codigo,
        nombre: productoOriginal.nombre,
        tipo: productoOriginal.tipo,
        cantidad: cantidad
    });

    ingredienteCantidad.value = '';
    actualizarListaVisualIngredientes();
}

function actualizarListaVisualIngredientes() {
    listaIngredientesAgregados.innerHTML = '';
    ingredientesTemporales.forEach((ing, index) => {
        const li = document.createElement('li');

        const span = document.createElement('span');
        span.textContent = `[${ing.codigo}] ${ing.nombre} - Cant: ${ing.cantidad}`;

        const btnEliminarIng = document.createElement('button');
        btnEliminarIng.textContent = "X";
        btnEliminarIng.type = "button";
        btnEliminarIng.onclick = () => {
            ingredientesTemporales.splice(index, 1);
            actualizarListaVisualIngredientes();
        };

        li.appendChild(span);
        li.appendChild(btnEliminarIng);
        listaIngredientesAgregados.appendChild(li);
    });
}

async function fetchProductos() {
    try {
        const response = await fetch(`${FIREBASE_URL}.json`);
        const data = await response.json();
        inventario = data || {};
        renderTable();
        if (seccionIngredientes.style.display === 'block') {
            actualizarDesplegableIngredientes();
        }
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="6">Error al conectar con Firebase.</td></tr>`;
    }
}

function renderTable() {
    tableBody.innerHTML = '';
    const keys = Object.keys(inventario);
    const busqueda = buscarCodigoInput.value.trim().toLowerCase();

    if (keys.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6">No hay productos.</td></tr>`;
        return;
    }

    let filasInsertadas = 0;

    keys.forEach((id) => {
        const producto = inventario[id];
        if (!producto) return; 

        const codigo = String(producto.codigo ?? '').toLowerCase();

        if (busqueda && !codigo.includes(busqueda)) {
            return;
        }

        filasInsertadas++;
        const tr = document.createElement('tr');
        const tipoTexto = producto.tipo === 'receta' ? 'Receta' : 'Materia Prima';

        tr.innerHTML = `
            <td>${producto.codigo ?? ''}</td>
            <td>${producto.nombre ?? ''}</td>
            <td>${tipoTexto}</td>
            <td>${producto.proveedor ?? ''}</td>
            <td>${producto.stock ?? 0}</td>
            <td>
                <button onclick="editProduct('${id}')">Editar</button>
                <button onclick="deleteProduct('${id}')">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    if (filasInsertadas === 0 && busqueda) {
        tableBody.innerHTML = `<tr><td colspan="6">No se encontró ningún producto con ese código.</td></tr>`;
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const productoData = {
        codigo: codigoInput.value,
        nombre: nombreInput.value,
        tipo: tipoSelect.value,
        stock: tipoSelect.value === 'receta' ? 0 : parseInt(stockInput.value),
        proveedor: proveedorInput.value
    };

    if (tipoSelect.value === 'receta') {
        productoData.ingredientes = ingredientesTemporales;
    }

    const id = editIdInput.value;

    try {
        if (id === "") {
            await fetch(`${FIREBASE_URL}.json`, {
                method: 'POST',
                body: JSON.stringify(productoData),
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            await fetch(`${FIREBASE_URL}/${id}.json`, {
                method: 'PUT',
                body: JSON.stringify(productoData),
                headers: { 'Content-Type': 'application/json' }
            });

            editIdInput.value = "";
            btnSubmit.textContent = "Guardar Producto";
            formTitle.textContent = "Añadir Nuevo Producto";
        }

        form.reset();
        ingredientesTemporales = [];
        toggleStock(); 
        await fetchProductos();

    } catch (error) {
        alert("Error al guardar");
        console.error(error);
    }
});

window.editProduct = function(id) {
    const prod = inventario[id];
    if (!prod) return;

    codigoInput.value = prod.codigo ?? '';
    nombreInput.value = prod.nombre ?? '';
    tipoSelect.value = prod.tipo ?? 'materia_prima';
    proveedorInput.value = prod.proveedor ?? '';

    toggleStock(); 
    stockInput.value = prod.stock ?? 0; 

    if (prod.tipo === 'receta') {
        ingredientesTemporales = prod.ingredientes ? [...prod.ingredientes] : [];
        actualizarListaVisualIngredientes();
    }

    editIdInput.value = id;
    btnSubmit.textContent = "Actualizar Producto";
    formTitle.textContent = "Editando Producto: " + (prod.nombre ?? '');
};

window.deleteProduct = async function(id) {
    if(confirm('¿Seguro que deseas eliminar este producto?')) {
        try {
            await fetch(`${FIREBASE_URL}/${id}.json`, {
                method: 'DELETE'
            });

            if(editIdInput.value === id) {
                form.reset();
                editIdInput.value = "";
                btnSubmit.textContent = "Guardar Producto";
                formTitle.textContent = "Añadir Nuevo Producto";
                ingredientesTemporales = [];
                toggleStock();
            }

            await fetchProductos();
        } catch (error) {
            alert("Error al eliminar");
            console.error(error);
        }
    }
};

fetchProductos();
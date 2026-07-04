const FIREBASE_URL = "https://empresa-bits-8-default-rtdb.firebaseio.com/productos";
let inventario = {};

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
const buscarCodigoInput = document.getElementById('buscar-codigo'); // Referencia al buscador

// Desactivar stock si se selecciona receta y forzar que sea 0
function toggleStock() {
    if (tipoSelect.value === 'receta') {
        stockInput.value = 0;
        stockInput.disabled = true;
    } else {
        stockInput.disabled = false;
    }
}

// Obtener datos de Firebase
async function fetchProductos() {
    try {
        const response = await fetch(`${FIREBASE_URL}.json`);
        const data = await response.json();
        inventario = data || {};
        renderTable();
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="6">Error al conectar con Firebase.</td></tr>`;
    }
}

// Dibujar las filas de la tabla (Incluye Filtro de Búsqueda)
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
        
        // Filtro: Si hay algo escrito en el buscador, verifica si el código del producto lo incluye
        if (busqueda && !producto.codigo.toLowerCase().includes(busqueda)) {
            return; // Salta este producto si no coincide
        }

        filasInsertadas++;
        const tr = document.createElement('tr');
        
        const tipoTexto = producto.tipo === 'receta' ? 'Receta' : 'Materia Prima';
        const stockTexto = producto.stock; 

        tr.innerHTML = `
            <td>${producto.codigo}</td>
            <td>${producto.nombre}</td>
            <td>${tipoTexto}</td>
            <td>${producto.proveedor}</td>
            <td>${stockTexto}</td>
            <td>
                <button onclick="editProduct('${id}')">Editar</button>
                <button onclick="deleteProduct('${id}')">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    // Si se buscó algo y no hubo coincidencias
    if (filasInsertadas === 0 && busqueda) {
        tableBody.innerHTML = `<tr><td colspan="6">No se encontró ningún producto con ese código.</td></tr>`;
    }
}

// Guardar o Actualizar en Firebase
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const productoData = {
        codigo: codigoInput.value,
        nombre: nombreInput.value,
        tipo: tipoSelect.value,
        stock: tipoSelect.value === 'receta' ? 0 : parseInt(stockInput.value),
        proveedor: proveedorInput.value
    };

    const id = editIdInput.value;

    try {
        if (id === "") {
            // Crear nuevo (POST)
            await fetch(`${FIREBASE_URL}.json`, {
                method: 'POST',
                body: JSON.stringify(productoData),
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // Modificar existente (PUT)
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
        toggleStock();
        await fetchProductos();
        
    } catch (error) {
        alert("Error al guardar");
        console.error(error);
    }
});

// Cargar datos en el formulario para editar
window.editProduct = function(id) {
    const prod = inventario[id];
    
    codigoInput.value = prod.codigo;
    nombreInput.value = prod.nombre;
    tipoSelect.value = prod.tipo;
    proveedorInput.value = prod.proveedor;
    
    toggleStock();
    stockInput.value = prod.stock; 

    editIdInput.value = id;
    btnSubmit.textContent = "Actualizar Producto";
    formTitle.textContent = "Editando Producto: " + prod.nombre;
};

// Eliminar de Firebase
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
                toggleStock();
            }

            await fetchProductos();
        } catch (error) {
            alert("Error al eliminar");
            console.error(error);
        }
    }
};

// Carga inicial
fetchProductos();
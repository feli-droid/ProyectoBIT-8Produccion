const FIREBASE_URL = "https://empresa-bits-8-default-rtdb.firebaseio.com/productos";
let inventario = {};

// Elementos del DOM (Asegúrate de que coincidan con tu HTML de producción)
const recetaSelect = document.getElementById('receta-select');
const cantidadFabricarInput = document.getElementById('cantidad-fabricar');
const detallesRecetaDiv = document.getElementById('detalles-receta');
const btnProducir = document.getElementById('btn-producir');

// 1. Cargar los productos desde Firebase
async function fetchInventario() {
    try {
        const response = await fetch(`${FIREBASE_URL}.json`);
        const data = await response.json();
        inventario = data || {};
        poblarDesplegableRecetas();
    } catch (error) {
        console.error("Error al cargar el inventario:", error);
        alert("No se pudo conectar con el inventario.");
    }
}

// 2. Llenar el select únicamente con los productos tipo 'receta'
function poblarDesplegableRecetas() {
    recetaSelect.innerHTML = '<option value="">-- Selecciona una receta --</option>';
    
    Object.keys(inventario).forEach(id => {
        const prod = inventario[id];
        if (prod.tipo === 'receta') {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `[${prod.codigo}] - ${prod.nombre}`;
            recetaSelect.appendChild(option);
        }
    });
}

// 3. Mostrar los ingredientes requeridos cuando se elija una receta
function mostrarDetallesReceta() {
    detallesRecetaDiv.innerHTML = '';
    const idReceta = recetaSelect.value;
    const cantidadAFabricar = parseFloat(cantidadFabricarInput.value) || 0;

    if (!idReceta) return;

    const receta = inventario[idReceta];
    
    if (!receta.ingredientes || receta.ingredientes.length === 0) {
        detallesRecetaDiv.innerHTML = '<p style="color: red;">Esta receta no tiene ingredientes configurados.</p>';
        return;
    }

    const ul = document.createElement('ul');
    
    receta.ingredientes.forEach(ing => {
        // Buscamos el ingrediente en el inventario actual para saber su stock disponible
        const ingredienteEnInventario = inventario[ing.id];
        const stockActual = ingredienteEnInventario ? ingredienteEnInventario.stock : 0;
        
        // Calculamos cuánto se necesita en total para la producción deseada
        const cantidadTotalRequerida = ing.cantidad * cantidadAFabricar;
        
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${ing.nombre}</strong> (Necesita: ${ing.cantidad} por unidad) <br>
            Total Requerido: <span style="color: blue;">${cantidadTotalRequerida}</span> | 
            Stock Disponible: <span style="${stockActual >= cantidadTotalRequerida ? 'color: green;' : 'color: red; font-weight: bold;'}">${stockActual}</span>
        `;
        ul.appendChild(li);
    });

    detallesRecetaDiv.appendChild(ul);
}

// 4. Procesar la Fabricación / Producción
async function procesarProduccion() {
    const idReceta = recetaSelect.value;
    const cantidadAFabricar = parseInt(cantidadFabricarInput.value);

    if (!idReceta || isNaN(cantidadAFabricar) || cantidadAFabricar <= 0) {
        alert("Por favor, selecciona una receta y una cantidad válida a fabricar.");
        return;
    }

    const receta = inventario[idReceta];
    let stockSuficiente = true;
    const actualizaciones = [];

    // Validar si hay stock suficiente de TODO antes de romper nada
    for (const ing of receta.ingredientes) {
        const ingredienteEnInventario = inventario[ing.id];
        const cantidadTotalRequerida = ing.cantidad * cantidadAFabricar;

        if (!ingredienteEnInventario || ingredienteEnInventario.stock < cantidadTotalRequerida) {
            alert(`No hay suficiente stock de: ${ing.nombre}. Requerido: ${cantidadTotalRequerida}, Disponible: ${ingredienteEnInventario ? ingredienteEnInventario.stock : 0}`);
            stockSuficiente = false;
            break; 
        }

        // Guardamos los datos para actualizar la materia prima más adelante
        actualizaciones.push({
            id: ing.id,
            nuevoStock: ingredienteEnInventario.stock - cantidadTotalRequerida,
            datosOriginales: ingredienteEnInventario
        });
    }

    // Si faltó algún ingrediente, cancelamos todo el proceso
    if (!stockSuficiente) return;

    try {
        btnProducir.disabled = true;
        btnProducir.textContent = "Procesando...";

        // A. Restar stock a las Materias Primas / Ingredientes en Firebase
        for (const update of actualizaciones) {
            const copiaProducto = { ...update.datosOriginales, stock: update.nuevoStock };
            await fetch(`${FIREBASE_URL}/${update.id}.json`, {
                method: 'PUT',
                body: JSON.stringify(copiaProducto),
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // B. Sumar stock a la Receta terminada en Firebase
        const nuevoStockReceta = (parseInt(receta.stock) || 0) + cantidadAFabricar;
        const copiaReceta = { ...receta, stock: nuevoStockReceta };
        
        await fetch(`${FIREBASE_URL}/${idReceta}.json`, {
            method: 'PUT',
            body: JSON.stringify(copiaReceta),
            headers: { 'Content-Type': 'application/json' }
        });

        alert(`¡Producción exitosa! Se fabricaron ${cantidadAFabricar} unidades de ${receta.nombre}.`);
        
        // Resetear formulario y volver a cargar datos actualizados
        cantidadFabricarInput.value = '';
        await fetchInventario(); 
        mostrarDetallesReceta();

    } catch (error) {
        console.error("Error en el proceso de producción:", error);
        alert("Ocurrió un error al procesar la producción en Firebase.");
    } finally {
        btnProducir.disabled = false;
        btnProducir.textContent = "Producir";
    }
}

// Event Listeners
recetaSelect.addEventListener('change', mostrarDetallesReceta);
cantidadFabricarInput.addEventListener('input', mostrarDetallesReceta);
btnProducir.addEventListener('click', procesarProduccion);

// Iniciar cargando los datos
fetchInventario();
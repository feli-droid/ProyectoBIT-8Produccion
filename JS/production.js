const FIREBASE_URL = "https://empresa-bits-8-default-rtdb.firebaseio.com/productos";
// 🟢 LO QUE SE AÑADIÓ: Nueva constante apuntando al nodo de historial en tu Firebase
const HISTORIAL_URL = "https://empresa-bits-8-default-rtdb.firebaseio.com/historial";

let inventario = {};

const recetaSelect = document.getElementById('receta-select'); 
const cantidadFabricarInput = document.getElementById('cantidad-fabricar');
const detallesRecetaDiv = document.getElementById('detalles-receta');
const btnProducir = document.getElementById('btn-producir');

// 🟢 LO QUE SE CAMBIÓ: Referencia al cuerpo de la tabla del historial
const cuerpoHistorial = document.getElementById('cuerpo-historial');
const btnEliminarHistorial = document.getElementById('btn-eliminar-historial');

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

// 2. Se le delega la responsabilidad al componente
function poblarDesplegableRecetas() {
    if (recetaSelect) {
        recetaSelect.actualizarOpciones(inventario);
    }
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
        const ingredienteEnInventario = inventario[ing.id];
        const stockActual = ingredienteEnInventario ? ingredienteEnInventario.stock : 0;
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

    for (const ing of receta.ingredientes) {
        const ingredienteEnInventario = inventario[ing.id];
        const cantidadTotalRequerida = ing.cantidad * cantidadAFabricar;

        if (!ingredienteEnInventario || ingredienteEnInventario.stock < cantidadTotalRequerida) {
            alert(`No hay suficiente stock de: ${ing.nombre}. Requerido: ${cantidadTotalRequerida}, Disponible: ${ingredienteEnInventario ? ingredienteEnInventario.stock : 0}`);
            stockSuficiente = false;
            break; 
        }

        actualizaciones.push({
            id: ing.id,
            nombre: ing.nombre,
            cantidadUsada: cantidadTotalRequerida,
            nuevoStock: ingredienteEnInventario.stock - cantidadTotalRequerida,
            datosOriginales: ingredienteEnInventario
        });
    }

    if (!stockSuficiente) return;

    try {
        btnProducir.disabled = true;
        btnProducir.textContent = "Procesando...";

        for (const update of actualizaciones) {
            const copiaProducto = { ...update.datosOriginales, stock: update.nuevoStock };
            await fetch(`${FIREBASE_URL}/${update.id}.json`, {
                method: 'PUT',
                body: JSON.stringify(copiaProducto),
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const nuevoStockReceta = (parseInt(receta.stock) || 0) + cantidadAFabricar;
        const copiaReceta = { ...receta, stock: nuevoStockReceta };
        
        await fetch(`${FIREBASE_URL}/${idReceta}.json`, {
            method: 'PUT',
            body: JSON.stringify(copiaReceta),
            headers: { 'Content-Type': 'application/json' }
        });

        // 🟢 LO QUE SE CAMBIÓ: Guardar este registro directamente en Firebase Realtime Database
        await guardarEnHistorialFirebase(receta.nombre, cantidadAFabricar, actualizaciones);

        alert(`¡Producción exitosa! Se fabricaron ${cantidadAFabricar} unidades de ${receta.nombre}.`);

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

// 🟢 LO QUE SE CAMBIÓ: Funciones de historial rediseñadas para trabajar con Firebase y Tablas

// Guarda un nuevo registro usando método POST (Firebase le genera un ID único automáticamente)
async function guardarEnHistorialFirebase(nombreProducto, cantidad, ingredientesUsados) {
    const nuevoRegistro = {
        fecha: new Date().toLocaleString(),
        producto: nombreProducto,
        cantidadFabricada: cantidad,
        materiaPrima: ingredientesUsados.map(ing => ({
            nombre: ing.nombre,
            usado: ing.cantidadUsada
        }))
    };

    try {
        await fetch(`${HISTORIAL_URL}.json`, {
            method: 'POST',
            body: JSON.stringify(nuevoRegistro),
            headers: { 'Content-Type': 'application/json' }
        });
        await fetchHistorialFirebase(); // Recargar la tabla tras guardar el dato
    } catch (error) {
        console.error("Error al guardar el historial en Firebase:", error);
    }
}

// Trae los registros guardados del nodo /historial y los pinta en las filas de la tabla (<tr>)
async function fetchHistorialFirebase() {
    cuerpoHistorial.innerHTML = '';
    try {
        const response = await fetch(`${HISTORIAL_URL}.json`);
        const data = await response.json();
        
        if (!data) {
            cuerpoHistorial.innerHTML = '<tr><td colspan="4">No hay registros de producción todavía.</td></tr>';
            return;
        }

        // Firebase devuelve un objeto de objetos; convertimos a array para iterar
        const listaRegistros = Object.values(data);
        
        // Los ordenamos en reversa para que la última producción salga arriba de la tabla
        listaRegistros.reverse().forEach(reg => {
            const tr = document.createElement('tr');
            
            // Generamos la lista de materias primas consumidas para la cuarta columna
            let detalleInsumos = '';
            reg.materiaPrima.forEach(m => {
                detalleInsumos += `${m.nombre}: -${m.usado}<br>`;
            });

            tr.innerHTML = `
                <td>${reg.fecha}</td>
                <td>${reg.producto}</td>
                <td>${reg.cantidadFabricada}</td>
                <td>${detalleInsumos}</td>
            `;
            cuerpoHistorial.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al obtener el historial de Firebase:", error);
    }
}

// Elimina el nodo completo de /historial enviando un método DELETE a Firebase
async function eliminarHistorialFirebase() {
    if (confirm("¿Estás seguro de que deseas eliminar permanentemente todo el historial de Firebase?")) {
        try {
            await fetch(`${HISTORIAL_URL}.json`, {
                method: 'DELETE'
            });
            await fetchHistorialFirebase(); // Actualiza la tabla para mostrar que quedó vacía
        } catch (error) {
            console.error("Error al eliminar el historial de Firebase:", error);
            alert("No se pudo eliminar el historial.");
        }
    }
}

// Eventos
recetaSelect.addEventListener('change', mostrarDetallesReceta);
cantidadFabricarInput.addEventListener('input', mostrarDetallesReceta);
btnProducir.addEventListener('click', procesarProduccion);
btnEliminarHistorial.addEventListener('click', eliminarHistorialFirebase);

// Cargar inventario e historial desde el servidor al iniciar la aplicación
fetchInventario();
fetchHistorialFirebase();
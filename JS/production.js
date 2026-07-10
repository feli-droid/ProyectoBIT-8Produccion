const FIREBASE_URL = "https://empresa-bits-8-default-rtdb.firebaseio.com/productos";
const HISTORIAL_URL = "https://empresa-bits-8-default-rtdb.firebaseio.com/historial";

let inventario = {};

const recetaSelect = document.getElementById('receta-select'); 
const cantidadFabricarInput = document.getElementById('cantidad-fabricar');
const detallesRecetaDiv = document.getElementById('detalles-receta');
const btnProducir = document.getElementById('btn-producir');
const cuerpoHistorial = document.getElementById('cuerpo-historial');
const btnEliminarHistorial = document.getElementById('btn-eliminar-historial');
const btnFiltroFecha = document.getElementById('Fecha')

const filtroAnioSelect = document.getElementById('FiltroAnio');
const filtroMesSelect = document.getElementById('FiltroMes');

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

function poblarDesplegableRecetas() {
    if (recetaSelect && typeof recetaSelect.actualizarOpciones === 'function') {
        recetaSelect.actualizarOpciones(inventario);
    }
}

function mostrarDetallesReceta() {
    detallesRecetaDiv.innerHTML = '';
    const idReceta = recetaSelect.value; 
    const cantidadAFabricar = parseFloat(cantidadFabricarInput.value) || 0;

    if (!idReceta) return;

    const receta = inventario[idReceta];
    
    if (!receta || !receta.ingredientes || receta.ingredientes.length === 0) {
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
        await fetchHistorialFirebase();
    } catch (error) {
        console.error("Error al guardar el historial en Firebase:", error);
    }
}

async function fetchHistorialFirebase() {
    cuerpoHistorial.innerHTML = '';
    try {
        const response = await fetch(`${HISTORIAL_URL}.json`);
        const data = await response.json();
        
        if (!data) {
            cuerpoHistorial.innerHTML = '<tr><td colspan="4">No hay registros de producción todavía.</td></tr>';
            return;
        }

        const listaRegistros = Object.values(data);
        
        listaRegistros.reverse().forEach(reg => {
            const tr = document.createElement('tr');
            
            let detalleInsumos = '';
            const materias = reg.materiaPrima || []; 
            materias.forEach(m => {
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

async function eliminarHistorialFirebase() {
    if (confirm("¿Seguro que quieres eliminar tu historial?")) {
        try {
            await fetch(`${HISTORIAL_URL}.json`, {
                method: 'DELETE'
            });
            await fetchHistorialFirebase();
        } catch (error) {
            console.error("Error al eliminar el historial de Firebase:", error);
            alert("No se pudo eliminar el historial.");
        }
    }
}

recetaSelect.addEventListener('change', mostrarDetallesReceta);
cantidadFabricarInput.addEventListener('input', mostrarDetallesReceta);
btnProducir.addEventListener('click', procesarProduccion);
btnEliminarHistorial.addEventListener('click', eliminarHistorialFirebase);

fetchInventario();
fetchHistorialFirebase();

let historialProduccion = {};

async function fetchHistorialFirebase() {
    try {
        const response = await fetch(`${HISTORIAL_URL}.json`);
        const data = await response.json();
        
        historialProduccion = data || {};
        renderizarHistorialFiltrado();
    } catch (error) {
        console.error("Error al obtener el historial de Firebase:", error);
        if (cuerpoHistorial) {
            cuerpoHistorial.innerHTML = '<tr><td">Error al cargar el historial.</td></tr>';
        }
    }
}

function renderizarHistorialFiltrado() {
    if (!cuerpoHistorial) return;
    cuerpoHistorial.innerHTML = '';
    const fechaSeleccionada = btnFiltroFecha ? btnFiltroFecha.value : ''; 
    const listaRegistros = Object.values(historialProduccion);

    if (listaRegistros.length === 0) {
        cuerpoHistorial.innerHTML = '<tr><td colspan="4">No hay registros de producción todavía.</td></tr>';
        return;
    }

    const registrosFiltrados = listaRegistros.reverse().filter(reg => {
        if (!fechaSeleccionada) return true;

        const anioBuscado = fechaSeleccionada.substring(0, 4);
        const mesTexto = fechaSeleccionada.substring(5, 7);
        const mesBuscado = parseInt(mesTexto).toString();
        const fechaTexto = reg.fecha ? reg.fecha.toString() : ''; 
        const coincideAnio = fechaTexto.includes(anioBuscado);
        const coincideMes = fechaTexto.includes(`/${mesBuscado}/`) || 
                            fechaTexto.includes(`-${mesBuscado}-`) || 
                            fechaTexto.includes(`/${mesTexto}/`);

        return coincideAnio && coincideMes;
    });

    if (registrosFiltrados.length === 0) {
        cuerpoHistorial.innerHTML = '<tr><td colspan="4">No se encontraron registros para este mes y año.</td></tr>';
        return;
    }

    registrosFiltrados.forEach(reg => {
        const tr = document.createElement('tr');
        
        let detalleInsumos = '';
        const materias = reg.materiaPrima || []; 
        materias.forEach(m => {
            detalleInsumos += `${m.nombre}: -${m.usado}<br>`;
        });

        tr.innerHTML = `
            <td>${reg.fecha || ''}</td>
            <td>${reg.producto || ''}</td>
            <td>${reg.cantidadFabricada || 0}</td>
            <td>${detalleInsumos}</td>
        `;
        cuerpoHistorial.appendChild(tr);
    });
}

if (btnFiltroFecha) {
    btnFiltroFecha.addEventListener('change', renderizarHistorialFiltrado);
    btnFiltroFecha.addEventListener('input', renderizarHistorialFiltrado);
}

fetchHistorialFirebase();
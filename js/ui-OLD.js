/* ========================================
   UI.JS - Funciones de compatibilidad
   Este archivo contiene funciones que aún no están 100% modularizadas
   ======================================== */

// ============================================
// ESTACIONAMIENTO
// ============================================

let estacionamientoSortOrder = { espacio: 'asc', inquilino: 'asc' };

function renderEstacionamientoTable() {
    const tbody = document.getElementById('estacionamientoTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    estacionamiento.forEach(esp => {
        const row = tbody.insertRow();
        row.onclick = () => showEditEstacionamientoModal(esp.id);
        row.style.cursor = 'pointer';
        
        const espacioCell = `<span class="estacionamiento-espacio" style="background: ${esp.color_asignado || '#ccc'}">${esp.numero_espacio}</span>`;
        const inquilinoText = esp.inquilino_nombre || '-';
        const despachoText = esp.numero_despacho || '-';
        
        row.innerHTML = `<td>${espacioCell}</td><td>${inquilinoText}</td><td>${despachoText}</td>`;
    });
}

function showEditEstacionamientoModal(espacioId) {
    const espacio = estacionamiento.find(e => e.id === espacioId);
    currentEstacionamientoId = espacioId;
    
    document.getElementById('editEspacioNumero').textContent = espacio.numero_espacio;
    
    const select = document.getElementById('editEspacioInquilino');
    select.innerHTML = '<option value="">-- Seleccione --</option><option value="VISITAS">VISITAS</option>';
    inquilinos.forEach(inq => {
        const option = document.createElement('option');
        option.value = inq.nombre;
        option.textContent = inq.nombre;
        if (inq.nombre === espacio.inquilino_nombre) option.selected = true;
        select.appendChild(option);
    });
    
    document.getElementById('editEspacioDespacho').value = espacio.numero_despacho || '';
    
    select.onchange = function() {
        const selectedInquilino = inquilinos.find(i => i.nombre === this.value);
        document.getElementById('editEspacioDespacho').value = selectedInquilino?.numero_despacho || '';
    };
    
    document.getElementById('editEstacionamientoModal').classList.add('active');
}

function sortEstacionamiento(columna) {
    const tbody = document.getElementById('estacionamientoTable').querySelector('tbody');
    
    let sortedData = [...estacionamiento];
    
    if (columna === 'espacio') {
        sortedData.sort((a, b) => {
            const numA = parseInt(a.numero_espacio);
            const numB = parseInt(b.numero_espacio);
            return estacionamientoSortOrder.espacio === 'asc' ? numA - numB : numB - numA;
        });
        estacionamientoSortOrder.espacio = estacionamientoSortOrder.espacio === 'asc' ? 'desc' : 'asc';
    } else if (columna === 'inquilino') {
        sortedData.sort((a, b) => {
            const nameA = (a.inquilino_nombre || '').toLowerCase();
            const nameB = (b.inquilino_nombre || '').toLowerCase();
            if (estacionamientoSortOrder.inquilino === 'asc') {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });
        estacionamientoSortOrder.inquilino = estacionamientoSortOrder.inquilino === 'asc' ? 'desc' : 'asc';
    }
    
    tbody.innerHTML = '';
    sortedData.forEach(esp => {
        const row = tbody.insertRow();
        row.onclick = () => showEditEstacionamientoModal(esp.id);
        row.style.cursor = 'pointer';
        
        const espacioCell = `<span class="estacionamiento-espacio" style="background: ${esp.color_asignado || '#ccc'}">${esp.numero_espacio}</span>`;
        const inquilinoText = esp.inquilino_nombre || '-';
        const despachoText = esp.numero_despacho || '-';
        
        row.innerHTML = `<td>${espacioCell}</td><td>${inquilinoText}</td><td>${despachoText}</td>`;
    });
}

function saveEstacionamiento() {
    showLoading();
    const inquilinoSeleccionado = document.getElementById('editEspacioInquilino').value;
    const despacho = document.getElementById('editEspacioDespacho').value;
    
    supabaseClient
        .from('estacionamiento')
        .update({
            inquilino_nombre: inquilinoSeleccionado || null,
            numero_despacho: despacho || null
        })
        .eq('id', currentEstacionamientoId)
        .then(({ error }) => {
            if (error) throw error;
            return loadEstacionamiento();
        })
        .then(() => {
            renderEstacionamientoTable();
            closeModal('editEstacionamientoModal');
            hideLoading();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al guardar: ' + error.message);
            hideLoading();
        });
}

// ============================================
// BITÁCORA
// ============================================

let bitacoraSortOrder = 'desc';

function renderBitacoraTable() {
    const tbody = document.getElementById('bitacoraTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const sorted = [...bitacoraSemanal].sort((a, b) => {
        const dateA = new Date(a.semana_inicio);
        const dateB = new Date(b.semana_inicio);
        return bitacoraSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    sorted.forEach(sem => {
        const row = tbody.insertRow();
        row.onclick = () => showEditBitacoraModal(sem.id);
        row.style.cursor = 'pointer';
        
        const notasPreview = sem.notas ? (sem.notas.substring(0, 100) + '...') : 'Sin notas';
        const notasCompletas = sem.notas || 'Sin notas';
        
        const semanaTexto = sem.semana_texto ? sem.semana_texto.replace('Semana del', 'al') : '';
        
        row.innerHTML = `<td><strong>${semanaTexto}</strong></td><td data-fulltext="${notasCompletas.replace(/"/g, '&quot;')}">${notasPreview}</td>`;
    });
    
    const th = document.querySelector('#bitacoraTable th.sortable');
    if (th) {
        th.classList.remove('sorted-asc', 'sorted-desc');
        th.classList.add(bitacoraSortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
}

function sortBitacora() {
    bitacoraSortOrder = bitacoraSortOrder === 'asc' ? 'desc' : 'asc';
    renderBitacoraTable();
}

function filtrarBitacora(query) {
    const tbody = document.getElementById('bitacoraTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filtradas = bitacoraSemanal.filter(sem => {
        const notas = (sem.notas || '').toLowerCase();
        return notas.includes(query);
    });
    
    const sorted = [...filtradas].sort((a, b) => {
        const dateA = new Date(a.semana_inicio);
        const dateB = new Date(b.semana_inicio);
        return bitacoraSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    sorted.forEach(sem => {
        const row = tbody.insertRow();
        row.onclick = () => showEditBitacoraModal(sem.id);
        row.style.cursor = 'pointer';
        
        const notasPreview = sem.notas ? (sem.notas.substring(0, 100) + '...') : 'Sin notas';
        const notasCompletas = sem.notas || 'Sin notas';
        row.innerHTML = `<td><strong>${sem.semana_texto}</strong></td><td data-fulltext="${notasCompletas.replace(/"/g, '&quot;')}">${notasPreview}</td>`;
    });
    
    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron resultados</td></tr>';
    }
}

function showEditBitacoraModal(bitacoraId) {
    const bitacora = bitacoraSemanal.find(b => b.id === bitacoraId);
    currentBitacoraId = bitacoraId;
    
    let fechaBitacora = '';
    if (bitacora.semana_inicio) {
        fechaBitacora = bitacora.semana_inicio;
    }
    
    document.getElementById('editBitacoraFecha').value = fechaBitacora;
    document.getElementById('editBitacoraNotas').value = bitacora.notas || '';
    
    document.getElementById('editBitacoraModal').classList.add('active');
}

function saveBitacora() {
    showLoading();
    const fecha = document.getElementById('editBitacoraFecha').value;
    const notas = document.getElementById('editBitacoraNotas').value;
    
    supabaseClient
        .from('bitacora_semanal')
        .update({
            semana_inicio: fecha,
            notas: notas
        })
        .eq('id', currentBitacoraId)
        .then(({ error }) => {
            if (error) throw error;
            return loadBitacoraSemanal();
        })
        .then(() => {
            renderBitacoraTable();
            closeModal('editBitacoraModal');
            hideLoading();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al guardar bitácora: ' + error.message);
            hideLoading();
        });
}

function updateBitacoraMenu() {
    // Placeholder para menú de bitácora
}

function agregarNuevaSemana() {
    alert('Función agregarNuevaSemana - pendiente de implementar');
}

// ============================================
// FILE LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const inquilinoContrato = document.getElementById('inquilinoContrato');
    if (inquilinoContrato) {
        inquilinoContrato.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('contratoFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    const nuevoDocPDF = document.getElementById('nuevoDocPDF');
    if (nuevoDocPDF) {
        nuevoDocPDF.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('nuevoDocPDFFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    const proveedorDocAdicional = document.getElementById('proveedorDocAdicional');
    if (proveedorDocAdicional) {
        proveedorDocAdicional.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('provDocAdicionalFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
            
            const nombreDocGroup = document.getElementById('nombreProvDocGroup');
            if (fileName) {
                nombreDocGroup.classList.remove('hidden');
                document.getElementById('proveedorNombreDoc').required = true;
            } else {
                nombreDocGroup.classList.add('hidden');
                document.getElementById('proveedorNombreDoc').required = false;
            }
        });
    }
    
    const facturaDocumento = document.getElementById('facturaDocumento');
    if (facturaDocumento) {
        facturaDocumento.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('facturaDocumentoFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    const pagoPDFFactura = document.getElementById('pagoPDFFactura');
    if (pagoPDFFactura) {
        pagoPDFFactura.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('pagoPDFFacturaFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    const activoFotos = document.getElementById('activoFotos');
    if (activoFotos) {
        activoFotos.addEventListener('change', function() {
            const count = this.files.length;
            document.getElementById('activoFotosFileName').textContent = count > 0 ? `${count} foto(s) seleccionada(s)` : '';
        });
    }
    
    const bancoDocumento = document.getElementById('bancoDocumento');
    if (bancoDocumento) {
        bancoDocumento.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('bancoDocumentoFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
});

console.log('✅ UI.JS (compatibilidad) cargado');

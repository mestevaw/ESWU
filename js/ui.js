/* ========================================
   UI.JS - Remaining UI Functions
   ======================================== */

// ============================================
// GLOBAL VARIABLES (declaradas aquí para todos los módulos)
// ============================================

let currentHomeTable = null;

// ============================================
// EDIT FUNCTIONS
// ============================================

function deleteInquilino() {
    if (!confirm('¿Eliminar este inquilino? Esta acción no se puede deshacer.')) return;
    
    showLoading();
    
    supabaseClient
        .from('inquilinos')
        .delete()
        .eq('id', currentInquilinoId)
        .then(({ error }) => {
            if (error) throw error;
            return loadInquilinos();
        })
        .then(() => {
            closeModal('inquilinoDetailModal');
            if (currentSubContext === 'inquilinos-list') {
                renderInquilinosTable();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar inquilino: ' + error.message);
        })
        .finally(() => {
            hideLoading();
        });
}

function deleteProveedor() {
    const prov = proveedores.find(p => p.id === currentProveedorId);
    
    if (prov.facturas && prov.facturas.length > 0) {
        alert('No se puede eliminar este proveedor porque tiene facturas registradas.');
        return;
    }
    
    if (!confirm('¿Eliminar este proveedor? Esta acción no se puede deshacer.')) return;
    
    showLoading();
    
    supabaseClient
        .from('proveedores')
        .delete()
        .eq('id', currentProveedorId)
        .then(({ error }) => {
            if (error) throw error;
            return loadProveedores();
        })
        .then(() => {
            closeModal('proveedorDetailModal');
            if (currentSubContext === 'proveedores-list') {
                renderProveedoresTable();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar proveedor: ' + error.message);
        })
        .finally(() => {
            hideLoading();
        });
}

function editActivo() {
    const act = activos.find(a => a.id === currentActivoId);
    if (!act) return;
    
    isEditMode = true;
    
    document.getElementById('addActivoTitle').textContent = 'Editar Activo';
    document.getElementById('activoNombre').value = act.nombre;
    document.getElementById('activoUltimoMant').value = act.ultimo_mant || '';
    document.getElementById('activoProximoMant').value = act.proximo_mant || '';
    document.getElementById('activoNotas').value = act.notas || '';
    
    populateProveedoresDropdown();
    document.getElementById('activoProveedor').value = act.proveedor || '';
    
    closeModal('activoDetailModal');
    document.getElementById('addActivoModal').classList.add('active');
}

function deleteActivo() {
    if (!confirm('¿Eliminar este activo? Esta acción no se puede deshacer.')) return;
    
    showLoading();
    
    supabaseClient
        .from('activos')
        .delete()
        .eq('id', currentActivoId)
        .then(({ error }) => {
            if (error) throw error;
            return loadActivos();
        })
        .then(() => {
            closeModal('activoDetailModal');
            renderActivosTable();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar activo: ' + error.message);
        })
        .finally(() => {
            hideLoading();
        });
}

// ============================================
// POPULATE PROVEEDORES DROPDOWN
// ============================================

function populateProveedoresDropdown() {
    const select = document.getElementById('activoProveedor');
    select.innerHTML = '<option value="">-- Seleccione un proveedor --</option>';
    
    proveedores.forEach(prov => {
        const option = document.createElement('option');
        option.value = prov.nombre;
        option.textContent = prov.nombre;
        select.appendChild(option);
    });
}

// ============================================
// SELECT CHANGE HANDLERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const editEspacioInquilino = document.getElementById('editEspacioInquilino');
    if (editEspacioInquilino) {
        editEspacioInquilino.addEventListener('change', function() {
            const selectedInquilino = inquilinos.find(i => i.nombre === this.value);
            document.getElementById('editEspacioDespacho').value = selectedInquilino?.numero_despacho || '';
        });
    }
});
// File input listeners - Proveedor documentos
document.addEventListener('DOMContentLoaded', function() {
    const docProveedorPDF = document.getElementById('nuevoDocProveedorPDF');
    if (docProveedorPDF) {
        docProveedorPDF.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('nuevoDocProveedorPDFFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
});
// ============================================
// MODALS PROVEEDOR - DOCUMENTOS Y NOTAS
// ============================================

function showAgregarDocumentoProveedorModal() {
    if (!currentProveedorId) {
        alert('Error: No hay proveedor seleccionado');
        return;
    }
    
    document.getElementById('nuevoDocProveedorNombre').value = '';
    document.getElementById('nuevoDocProveedorPDF').value = '';
    document.getElementById('nuevoDocProveedorPDFFileName').textContent = '';
    document.getElementById('agregarDocumentoProveedorModal').classList.add('active');
}

function showEditarNotasProveedorModal() {
    if (!currentProveedorId) {
        alert('Error: No hay proveedor seleccionado');
        return;
    }
    
    const prov = proveedores.find(p => p.id === currentProveedorId);
    document.getElementById('editNotasProveedor').value = prov?.notas || '';
    document.getElementById('editarNotasProveedorModal').classList.add('active');
}

async function saveDocumentoProveedor(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const nombre = document.getElementById('nuevoDocProveedorNombre').value;
        const file = document.getElementById('nuevoDocProveedorPDF').files[0];
        
        if (!file) {
            throw new Error('Seleccione un archivo PDF');
        }
        
        const pdfBase64 = await fileToBase64(file);
        
        const { error } = await supabaseClient
            .from('proveedores_documentos')
            .insert([{
                proveedor_id: currentProveedorId,
                nombre_documento: nombre,
                archivo_pdf: pdfBase64,
                fecha_guardado: new Date().toISOString().split('T')[0],
                usuario_guardo: currentUser.nombre
            }]);
        
        if (error) throw error;
        
        await ensureProveedoresFullLoaded();
        showProveedorDetail(currentProveedorId);
        closeModal('agregarDocumentoProveedorModal');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar documento: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function saveNotasProveedor(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const notas = document.getElementById('editNotasProveedor').value;
        
        const { error } = await supabaseClient
            .from('proveedores')
            .update({ notas: notas })
            .eq('id', currentProveedorId);
        
        if (error) throw error;
        
        await ensureProveedoresFullLoaded();
        showProveedorDetail(currentProveedorId);
        closeModal('editarNotasProveedorModal');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar notas: ' + error.message);
    } finally {
        hideLoading();
    }
}

// File input listener
document.addEventListener('DOMContentLoaded', function() {
    const docProveedorPDF = document.getElementById('nuevoDocProveedorPDF');
    if (docProveedorPDF) {
        docProveedorPDF.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('nuevoDocProveedorPDFFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
});

console.log('✅ UI.JS cargado (funciones restantes)');

/* ========================================
   MODALS.JS - Modal & UI Component Functions
   ======================================== */

// ============================================
// MODAL FUNCTIONS
// ============================================

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    document.querySelectorAll('.dropdown-content').forEach(dd => {
        if (dd.id !== dropdownId) dd.classList.remove('show');
    });
    dropdown.classList.toggle('show');
}

// Close dropdowns on outside click
window.addEventListener('click', function(e) {
    if (!e.target.matches('.dropdown-toggle')) {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
});

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(type, tabName) {
    if (type === 'inquilino') {
        document.querySelectorAll('#inquilinoDetailModal .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#inquilinoDetailModal .tab-content').forEach(tc => tc.classList.remove('active'));
        
        if (tabName === 'renta') {
            document.querySelector('#inquilinoDetailModal .tab:nth-child(1)').classList.add('active');
            document.getElementById('inquilinoRentaTab').classList.add('active');
        } else if (tabName === 'pagos') {
            document.querySelector('#inquilinoDetailModal .tab:nth-child(2)').classList.add('active');
            document.getElementById('inquilinoPagosTab').classList.add('active');
        } else if (tabName === 'contrato') {
            document.querySelector('#inquilinoDetailModal .tab:nth-child(3)').classList.add('active');
            document.getElementById('inquilinoContratoTab').classList.add('active');
        } else if (tabName === 'docs') {
            document.querySelector('#inquilinoDetailModal .tab:nth-child(4)').classList.add('active');
            document.getElementById('inquilinoDocsTab').classList.add('active');
        } else if (tabName === 'notas') {
            document.querySelector('#inquilinoDetailModal .tab:nth-child(5)').classList.add('active');
            document.getElementById('inquilinoNotasTab').classList.add('active');
        }
    } else if (type === 'proveedor') {
        document.querySelectorAll('#proveedorDetailModal .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#proveedorDetailModal .tab-content').forEach(tc => tc.classList.remove('active'));
        
        if (tabName === 'pagadas') {
            document.querySelector('#proveedorDetailModal .tab:nth-child(1)').classList.add('active');
            document.getElementById('proveedorPagadasTab').classList.add('active');
        } else if (tabName === 'porpagar') {
            document.querySelector('#proveedorDetailModal .tab:nth-child(2)').classList.add('active');
            document.getElementById('proveedorPorPagarTab').classList.add('active');
        } else if (tabName === 'docs') {
            document.querySelector('#proveedorDetailModal .tab:nth-child(3)').classList.add('active');
            document.getElementById('proveedorDocsTab').classList.add('active');
        } else if (tabName === 'notas') {
            document.querySelector('#proveedorDetailModal .tab:nth-child(4)').classList.add('active');
            document.getElementById('proveedorNotasTab').classList.add('active');
        }
    }
}

// ============================================
// SHOW MODAL FUNCTIONS
// ============================================

function showAddInquilinoModal() {
    isEditMode = false;
    currentInquilinoId = null;
    tempInquilinoContactos = [];
    
    document.getElementById('addInquilinoTitle').textContent = 'Agregar Inquilino';
    document.getElementById('inquilinoForm').reset();
    document.getElementById('inquilinoContactosList').innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
    document.getElementById('contratoFileName').textContent = '';
    
    document.getElementById('addInquilinoModal').classList.add('active');
}

function showAddProveedorModal() {
    isEditMode = false;
    currentProveedorId = null;
    tempProveedorContactos = [];
    
    document.getElementById('addProveedorTitle').textContent = 'Agregar Proveedor';
    document.getElementById('proveedorForm').reset();
    document.getElementById('proveedorContactosList').innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
    
    document.getElementById('addProveedorModal').classList.add('active');
}

function showRegistrarPagoModal() {
    document.getElementById('pagoForm').reset();
    document.getElementById('pagoCompleto').value = 'si';
    document.getElementById('pagoMontoGroup').classList.add('hidden');
    document.getElementById('pagoPDFFileName').textContent = '';
    document.getElementById('registrarPagoModal').classList.add('active');
}

function showAgregarDocumentoModal() {
    document.getElementById('documentoForm').reset();
    document.getElementById('nuevoDocNombre').value = '';
    document.getElementById('nuevoDocPDF').value = '';
    document.getElementById('nuevoDocPDFFileName').textContent = '';
    document.getElementById('agregarDocumentoModal').classList.add('active');
}

function showRegistrarFacturaModal() {
    document.getElementById('facturaForm').reset();
    document.getElementById('facturaDocumentoFileName').textContent = '';
    document.getElementById('registrarFacturaModal').classList.add('active');
}

function showAddActivoModal() {
    isEditMode = false;
    currentActivoId = null;
    
    document.getElementById('addActivoTitle').textContent = 'Agregar Activo';
    document.getElementById('activoForm').reset();
    document.getElementById('activoFotosFileName').textContent = '';
    
    populateProveedoresDropdown();
    
    document.getElementById('addActivoModal').classList.add('active');
}

function showAddUsuarioModal() {
    isEditMode = false;
    currentUsuarioId = null;
    
    document.getElementById('addUsuarioTitle').textContent = 'Agregar Usuario';
    document.getElementById('usuarioForm').reset();
    document.getElementById('addUsuarioModal').classList.add('active');
}

function showAddBancoModal() {
    document.getElementById('bancoForm').reset();
    document.getElementById('bancoDocumentoFileName').textContent = '';
    document.getElementById('addBancoModal').classList.add('active');
}

// ============================================
// CONTACTOS RENDERING
// ============================================

function renderContactosList(contactos, containerId, deleteCallback, editCallback) {
    const container = document.getElementById(containerId);
    if (!contactos || contactos.length === 0) {
        container.innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
        return;
    }
    
    container.innerHTML = contactos.map((c, idx) => `
        <div class="contacto-item">
            <div class="contacto-info">
                <strong>${c.nombre}</strong><br>
                <small>Tel: ${c.telefono || '-'} | Email: ${c.email || '-'}</small>
            </div>
            <div style="display:flex;gap:0.5rem">
                <button type="button" class="btn btn-sm btn-secondary" onclick="${editCallback}(${idx})" title="Editar">✏️</button>
                <button type="button" class="btn btn-sm btn-danger" onclick="${deleteCallback}(${idx})" title="Eliminar">×</button>
            </div>
        </div>
    `).join('');
}

// ============================================
// FILE INPUT LISTENERS
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
    
    const facturaDocumento = document.getElementById('facturaDocumento');
    if (facturaDocumento) {
        facturaDocumento.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('facturaDocumentoFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    const pagoPDF = document.getElementById('pagoPDF');
    if (pagoPDF) {
        pagoPDF.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('pagoPDFFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    const pagoPDFFactura = document.getElementById('pagoPDFFactura');
    if (pagoPDFFactura) {
        pagoPDFFactura.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('pagoPDFFacturaFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    const nuevoDocProveedorPDF = document.getElementById('nuevoDocProveedorPDF');
    if (nuevoDocProveedorPDF) {
        nuevoDocProveedorPDF.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('nuevoDocProveedorPDFFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
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

console.log('✅ MODALS.JS cargado');

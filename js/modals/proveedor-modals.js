/* ========================================
   PROVEEDOR-MODALS.JS
   ======================================== */

function showAddContactoProveedorModal() {
    document.getElementById('contactoProveedorForm').reset();
    document.getElementById('addContactoProveedorModal').classList.add('active');
}

function saveContactoProveedor(event) {
    event.preventDefault();
    
    const contacto = {
        nombre: document.getElementById('contactoProveedorNombre').value,
        telefono: document.getElementById('contactoProveedorTelefono').value,
        email: document.getElementById('contactoProveedorEmail').value
    };
    
    if (window.editingContactoProveedorIndex !== undefined) {
        tempProveedorContactos[window.editingContactoProveedorIndex] = contacto;
        delete window.editingContactoProveedorIndex;
    } else {
        tempProveedorContactos.push(contacto);
    }
    
    renderContactosList(tempProveedorContactos, 'proveedorContactosList', 'deleteProveedorContacto', 'showEditContactoProveedorModal');
    
    document.getElementById('contactoProveedorForm').reset();
    closeModal('addContactoProveedorModal');
}

function deleteProveedorContacto(index) {
    tempProveedorContactos.splice(index, 1);
    renderContactosList(tempProveedorContactos, 'proveedorContactosList', 'deleteProveedorContacto', 'showEditContactoProveedorModal');
}

function showEditContactoProveedorModal(index) {
    const contacto = tempProveedorContactos[index];
    
    document.getElementById('contactoProveedorNombre').value = contacto.nombre;
    document.getElementById('contactoProveedorTelefono').value = contacto.telefono || '';
    document.getElementById('contactoProveedorEmail').value = contacto.email || '';
    
    window.editingContactoProveedorIndex = index;
    
    document.getElementById('addContactoProveedorModal').classList.add('active');
}

function showRegistrarFacturaModal() {
    // Modo nueva factura
    window.isEditingFactura = false;
    currentFacturaId = null;
    
    // Limpiar todos los campos
    document.getElementById('facturaNumero').value = '';
    document.getElementById('facturaFecha').value = '';
    document.getElementById('facturaVencimiento').value = '';
    document.getElementById('facturaMonto').value = '';
    document.getElementById('facturaIVA').value = '';
    document.getElementById('facturaDocumento').value = '';
    document.getElementById('facturaDocumentoFileName').textContent = '';
    
    // Título del modal
    document.querySelector('#registrarFacturaModal .modal-title').textContent = 'Registrar Factura';
    
    document.getElementById('registrarFacturaModal').classList.add('active');
}

function showEditFacturaModal(facturaId) {
    // Buscar la factura en el proveedor actual
    const prov = proveedores.find(p => p.id === currentProveedorId);
    if (!prov) return;
    const factura = prov.facturas.find(f => f.id === facturaId);
    if (!factura) return;
    
    // Modo edición
    window.isEditingFactura = true;
    currentFacturaId = facturaId;
    
    // Pre-llenar campos
    document.getElementById('facturaNumero').value = factura.numero || '';
    document.getElementById('facturaFecha').value = factura.fecha || '';
    document.getElementById('facturaVencimiento').value = factura.vencimiento || '';
    document.getElementById('facturaMonto').value = factura.monto || '';
    document.getElementById('facturaIVA').value = factura.iva || '';
    document.getElementById('facturaDocumento').value = '';
    document.getElementById('facturaDocumentoFileName').textContent = factura.documento_file ? '(PDF existente)' : '';
    
    // Título del modal
    document.querySelector('#registrarFacturaModal .modal-title').textContent = 'Modificar Factura';
    
    document.getElementById('registrarFacturaModal').classList.add('active');
}

function calculateIVA() {
    const monto = parseFloat(document.getElementById('facturaMonto').value);
    if (!isNaN(monto) && monto > 0) {
        const iva = monto * 0.16 / 1.16;
        document.getElementById('facturaIVA').value = iva.toFixed(2);
    }
}

function showPagarFacturaModal(facturaId) {
    currentFacturaId = facturaId;
    document.getElementById('pagarFacturaModal').classList.add('active');
}

console.log('✅ PROVEEDOR-MODALS.JS cargado');

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

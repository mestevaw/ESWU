/* ========================================
   ESWU - MAIN.JS COMPLETO
   Todas las funciones de guardado
   ======================================== */

// ============================================
// LOGIN
// ============================================

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    showLoading();
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('nombre', username)
            .eq('password', password)
            .eq('activo', true)
            .single();
        
        if (error || !data) {
            throw new Error('Usuario o contraseña incorrectos');
        }
        
        currentUser = data;
        
        localStorage.setItem('eswu_remembered_user', username);
        localStorage.setItem('eswu_remembered_pass', password);
        
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.add('active');
        document.body.classList.add('logged-in');
        
        await initializeApp();
        
    } catch (error) {
        alert(error.message);
    } finally {
        hideLoading();
    }
});

// ============================================
// AUTO-LOGIN
// ============================================

window.addEventListener('DOMContentLoaded', function() {
    const rememberedUser = localStorage.getItem('eswu_remembered_user');
    const rememberedPass = localStorage.getItem('eswu_remembered_pass');
    
    if (rememberedUser && rememberedPass) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('password').value = rememberedPass;
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    
    setTimeout(() => {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }, 1000);
});

// ============================================
// INITIALIZE APP
// ============================================

async function initializeApp() {
    console.log('🚀 Inicializando app...');
    
    try {
        await Promise.all([
            loadInquilinos(),
            loadProveedores(),
            loadActivos(),
            loadUsuarios(),
            loadBancosDocumentos(),
            loadEstacionamiento(),
            loadBitacoraSemanal()
        ]);
        
        console.log('✅ Datos cargados:', {
            inquilinos: inquilinos.length,
            proveedores: proveedores.length,
            activos: activos.length,
            usuarios: usuarios.length
        });
        
    } catch (error) {
        console.error('❌ Error inicializando app:', error);
        alert('Error cargando datos: ' + error.message);
    }
}

// ============================================
// INQUILINOS - SAVE
// ============================================

async function saveInquilino(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const contratoFile = document.getElementById('inquilinoContrato').files[0];
        let contratoURL = null;
        
        if (contratoFile) {
            contratoURL = await fileToBase64(contratoFile);
        }
        
        const inquilinoData = {
            nombre: document.getElementById('inquilinoNombre').value,
            clabe: document.getElementById('inquilinoClabe').value || null,
            rfc: document.getElementById('inquilinoRFC').value || null,
            m2: document.getElementById('inquilinoM2').value || null,
            numero_despacho: document.getElementById('inquilinoDespacho').value || null,
            renta: parseFloat(document.getElementById('inquilinoRenta').value),
            fecha_inicio: document.getElementById('inquilinoFechaInicio').value,
            fecha_vencimiento: document.getElementById('inquilinoFechaVenc').value,
            contrato_file: contratoURL,
            notas: document.getElementById('inquilinoNotas').value || null
        };
        
        let inquilinoId;
        
        if (isEditMode && currentInquilinoId) {
            if (!contratoURL && inquilinos.find(i => i.id === currentInquilinoId).contrato_file) {
                delete inquilinoData.contrato_file;
            }
            
            const { error } = await supabaseClient
                .from('inquilinos')
                .update(inquilinoData)
                .eq('id', currentInquilinoId);
            
            if (error) throw error;
            
            await supabaseClient
                .from('inquilinos_contactos')
                .delete()
                .eq('inquilino_id', currentInquilinoId);
            
            inquilinoId = currentInquilinoId;
        } else {
            const { data, error } = await supabaseClient
                .from('inquilinos')
                .insert([inquilinoData])
                .select();
            
            if (error) throw error;
            inquilinoId = data[0].id;
        }
        
        if (tempInquilinoContactos.length > 0) {
            const contactosToInsert = tempInquilinoContactos.map(c => ({
                inquilino_id: inquilinoId,
                nombre: c.nombre,
                telefono: c.telefono || null,
                email: c.email || null
            }));
            
            const { error: contactosError } = await supabaseClient
                .from('inquilinos_contactos')
                .insert(contactosToInsert);
            
            if (contactosError) throw contactosError;
        }
        
        await loadInquilinos();
        closeModal('addInquilinoModal');
        
        if (currentSubContext === 'inquilinos-list') {
            renderInquilinosTable();
        }
        
        alert('✅ Inquilino guardado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar inquilino: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// INQUILINOS - CONTACTOS
// ============================================

function showAddContactoInquilinoModal() {
    document.getElementById('contactoInquilinoForm').reset();
    document.getElementById('addContactoInquilinoModal').classList.add('active');
}

function saveContactoInquilino(event) {
    event.preventDefault();
    
    const contacto = {
        nombre: document.getElementById('contactoInquilinoNombre').value,
        telefono: document.getElementById('contactoInquilinoTelefono').value,
        email: document.getElementById('contactoInquilinoEmail').value
    };
    
    tempInquilinoContactos.push(contacto);
    renderContactosList(tempInquilinoContactos, 'inquilinoContactosList', 'deleteInquilinoContacto');
    
    closeModal('addContactoInquilinoModal');
}

function deleteInquilinoContacto(index) {
    tempInquilinoContactos.splice(index, 1);
    renderContactosList(tempInquilinoContactos, 'inquilinoContactosList', 'deleteInquilinoContacto');
}

// ============================================
// INQUILINOS - REGISTRAR PAGO
// ============================================

function showRegistrarPagoModal() {
    closeModal('inquilinoDetailModal');
    document.getElementById('pagoForm').reset();
    document.getElementById('pagoMontoGroup').classList.add('hidden');
    document.getElementById('pagoPDFFileName').textContent = '';
    document.getElementById('registrarPagoModal').classList.add('active');
}

function toggleMontoInput() {
    const completo = document.getElementById('pagoCompleto').value;
    const montoGroup = document.getElementById('pagoMontoGroup');
    
    if (completo === 'no') {
        montoGroup.classList.remove('hidden');
        document.getElementById('pagoMonto').required = true;
    } else {
        montoGroup.classList.add('hidden');
        document.getElementById('pagoMonto').required = false;
    }
}

async function savePagoRenta(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const inquilino = inquilinos.find(i => i.id === currentInquilinoId);
        const completo = document.getElementById('pagoCompleto').value === 'si';
        const monto = completo ? inquilino.renta : parseFloat(document.getElementById('pagoMonto').value);
        
        const pagoFile = document.getElementById('pagoPDF').files[0];
        let pagoURL = null;
        
        if (pagoFile) {
            pagoURL = await fileToBase64(pagoFile);
        }
        
        const pagoData = {
            inquilino_id: currentInquilinoId,
            fecha: document.getElementById('pagoFecha').value,
            monto: monto,
            completo: completo,
            pago_file: pagoURL
        };
        
        const { error } = await supabaseClient
            .from('pagos_inquilinos')
            .insert([pagoData]);
        
        if (error) throw error;
        
        await loadInquilinos();
        closeModal('registrarPagoModal');
        showInquilinoDetailModal(currentInquilinoId);
        
        alert('✅ Pago registrado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar pago: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// INQUILINOS - AGREGAR DOCUMENTO
// ============================================

function showAgregarDocumentoModal() {
    closeModal('inquilinoDetailModal');
    document.getElementById('documentoForm').reset();
    document.getElementById('nuevoDocPDFFileName').textContent = '';
    document.getElementById('agregarDocumentoModal').classList.add('active');
}

async function saveDocumentoAdicional(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const nombre = document.getElementById('nuevoDocNombre').value;
        const file = document.getElementById('nuevoDocPDF').files[0];
        
        if (!file) {
            throw new Error('Seleccione un archivo PDF');
        }
        
        const pdfBase64 = await fileToBase64(file);
        
        const inq = inquilinos.find(i => i.id === currentInquilinoId);
        
        // NUEVO: Verificar si NO tiene contrato original y preguntar
        if (!inq.contrato_file) {
            const esContratoOriginal = confirm('¿Este documento es el CONTRATO ORIGINAL?\n\nSi es así, se guardará como contrato y no necesitas poner nombre.');
            
            if (esContratoOriginal) {
                // Guardar como contrato original en la tabla inquilinos
                const { error: contratoError } = await supabaseClient
                    .from('inquilinos')
                    .update({
                        contrato_file: pdfBase64
                    })
                    .eq('id', currentInquilinoId);
                
                if (contratoError) throw contratoError;
                
                await loadInquilinos();
                closeModal('agregarDocumentoModal');
                showInquilinoDetailModal(currentInquilinoId);
                
                alert('✅ Contrato Original guardado correctamente');
                hideLoading();
                return;
            }
        }
        
        const { error } = await supabaseClient
            .from('inquilinos_documentos')
            .insert([{
                inquilino_id: currentInquilinoId,
                nombre_documento: nombre,
                archivo_pdf: pdfBase64,
                fecha_guardado: new Date().toISOString().split('T')[0],
                usuario_guardo: currentUser.nombre
            }]);
        
        if (error) throw error;
        
        await loadInquilinos();
        closeModal('agregarDocumentoModal');
        showInquilinoDetailModal(currentInquilinoId);
        
        alert('✅ Documento agregado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar documento: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// INQUILINOS - EDITAR
// ============================================

function editInquilino() {
    const inq = inquilinos.find(i => i.id === currentInquilinoId);
    if (!inq) return;
    
    isEditMode = true;
    tempInquilinoContactos = [...(inq.contactos || [])];
    
    document.getElementById('addInquilinoTitle').textContent = 'Editar Inquilino';
    document.getElementById('inquilinoNombre').value = inq.nombre;
    document.getElementById('inquilinoClabe').value = inq.clabe || '';
    document.getElementById('inquilinoRFC').value = inq.rfc || '';
    document.getElementById('inquilinoM2').value = inq.m2 || '';
    document.getElementById('inquilinoDespacho').value = inq.numero_despacho || '';
    document.getElementById('inquilinoRenta').value = inq.renta;
    document.getElementById('inquilinoFechaInicio').value = inq.fecha_inicio;
    document.getElementById('inquilinoFechaVenc').value = inq.fecha_vencimiento;
    document.getElementById('inquilinoNotas').value = inq.notas || '';
    
    renderContactosList(tempInquilinoContactos, 'inquilinoContactosList', 'deleteInquilinoContacto');
    
    closeModal('inquilinoDetailModal');
    document.getElementById('addInquilinoModal').classList.add('active');
}

// ============================================
// INQUILINOS - ELIMINAR
// ============================================

async function deleteInquilino() {
    if (!confirm('¿Está seguro de eliminar este inquilino? Esta acción no se puede deshacer.')) {
        return;
    }
    
    showLoading();
    
    try {
        const { error } = await supabaseClient
            .from('inquilinos')
            .delete()
            .eq('id', currentInquilinoId);
        
        if (error) throw error;
        
        await loadInquilinos();
        closeModal('inquilinoDetailModal');
        
        if (currentSubContext === 'inquilinos-list') {
            renderInquilinosTable();
        }
        
        alert('✅ Inquilino eliminado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar inquilino: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// PROVEEDORES - SAVE
// ============================================

async function saveProveedor(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const proveedorData = {
            nombre: document.getElementById('proveedorNombre').value,
            servicio: document.getElementById('proveedorServicio').value,
            clabe: document.getElementById('proveedorClabe').value || null,
            rfc: document.getElementById('proveedorRFC').value || null,
            notas: document.getElementById('proveedorNotas').value || null
        };
        
        let proveedorId;
        
        if (isEditMode && currentProveedorId) {
            const { error } = await supabaseClient
                .from('proveedores')
                .update(proveedorData)
                .eq('id', currentProveedorId);
            
            if (error) throw error;
            
            await supabaseClient
                .from('proveedores_contactos')
                .delete()
                .eq('proveedor_id', currentProveedorId);
            
            proveedorId = currentProveedorId;
        } else {
            const { data, error } = await supabaseClient
                .from('proveedores')
                .insert([proveedorData])
                .select();
            
            if (error) throw error;
            proveedorId = data[0].id;
        }
        
        if (tempProveedorContactos.length > 0) {
            const contactosToInsert = tempProveedorContactos.map(c => ({
                proveedor_id: proveedorId,
                nombre: c.nombre,
                telefono: c.telefono || null,
                email: c.email || null
            }));
            
            const { error: contactosError } = await supabaseClient
                .from('proveedores_contactos')
                .insert(contactosToInsert);
            
            if (contactosError) throw contactosError;
        }
        
        await loadProveedores();
        closeModal('addProveedorModal');
        
        if (currentSubContext === 'proveedores-list') {
            renderProveedoresTable();
        }
        
        alert('✅ Proveedor guardado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar proveedor: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// PROVEEDORES - CONTACTOS
// ============================================

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
    
    tempProveedorContactos.push(contacto);
    renderContactosList(tempProveedorContactos, 'proveedorContactosList', 'deleteProveedorContacto');
    
    closeModal('addContactoProveedorModal');
}

function deleteProveedorContacto(index) {
    tempProveedorContactos.splice(index, 1);
    renderContactosList(tempProveedorContactos, 'proveedorContactosList', 'deleteProveedorContacto');
}

// ============================================
// PROVEEDORES - REGISTRAR FACTURA
// ============================================

function showRegistrarFacturaModal() {
    closeModal('proveedorDetailModal');
    document.getElementById('facturaForm').reset();
    document.getElementById('facturaDocumentoFileName').textContent = '';
    document.getElementById('registrarFacturaModal').classList.add('active');
}

async function saveFactura(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const facturaFile = document.getElementById('facturaDocumento').files[0];
        let facturaURL = null;
        
        if (facturaFile) {
            facturaURL = await fileToBase64(facturaFile);
        }
        
        const facturaData = {
            proveedor_id: currentProveedorId,
            numero: document.getElementById('facturaNumero').value || null,
            fecha: document.getElementById('facturaFecha').value,
            vencimiento: document.getElementById('facturaVencimiento').value,
            monto: parseFloat(document.getElementById('facturaMonto').value),
            iva: parseFloat(document.getElementById('facturaIVA').value) || 0,
            documento_file: facturaURL
        };
        
        const { error } = await supabaseClient
            .from('facturas')
            .insert([facturaData]);
        
        if (error) throw error;
        
        await loadProveedores();
        closeModal('registrarFacturaModal');
        showProveedorDetailModal(currentProveedorId);
        
        alert('✅ Factura registrada correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar factura: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// PROVEEDORES - EDITAR
// ============================================

function editProveedor() {
    const prov = proveedores.find(p => p.id === currentProveedorId);
    if (!prov) return;
    
    isEditMode = true;
    tempProveedorContactos = [...(prov.contactos || [])];
    
    document.getElementById('addProveedorTitle').textContent = 'Editar Proveedor';
    document.getElementById('proveedorNombre').value = prov.nombre;
    document.getElementById('proveedorServicio').value = prov.servicio;
    document.getElementById('proveedorClabe').value = prov.clabe || '';
    document.getElementById('proveedorRFC').value = prov.rfc || '';
    document.getElementById('proveedorNotas').value = prov.notas || '';
    
    renderContactosList(tempProveedorContactos, 'proveedorContactosList', 'deleteProveedorContacto');
    
    closeModal('proveedorDetailModal');
    document.getElementById('addProveedorModal').classList.add('active');
}

// ============================================
// PROVEEDORES - ELIMINAR
// ============================================

async function deleteProveedor() {
    if (!confirm('¿Está seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) {
        return;
    }
    
    showLoading();
    
    try {
        const { error } = await supabaseClient
            .from('proveedores')
            .delete()
            .eq('id', currentProveedorId);
        
        if (error) throw error;
        
        await loadProveedores();
        closeModal('proveedorDetailModal');
        
        if (currentSubContext === 'proveedores-list') {
            renderProveedoresTable();
        }
        
        alert('✅ Proveedor eliminado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar proveedor: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// FILE INPUT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const inquilinoContrato = document.getElementById('inquilinoContrato');
    if (inquilinoContrato) {
        inquilinoContrato.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            const display = document.getElementById('contratoFileName');
            if (display) display.textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    const nuevoDocPDF = document.getElementById('nuevoDocPDF');
    if (nuevoDocPDF) {
        nuevoDocPDF.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            const display = document.getElementById('nuevoDocPDFFileName');
            if (display) display.textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    const pagoPDF = document.getElementById('pagoPDF');
    if (pagoPDF) {
        pagoPDF.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            const display = document.getElementById('pagoPDFFileName');
            if (display) display.textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    const facturaDocumento = document.getElementById('facturaDocumento');
    if (facturaDocumento) {
        facturaDocumento.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            const display = document.getElementById('facturaDocumentoFileName');
            if (display) display.textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
});

console.log('✅ MAIN.JS COMPLETO cargado correctamente');

// ============================================
// ELIMINAR PROVEEDORES MIGRADOS
// ============================================

async function eliminarProveedoresMigrados() {
    if (!confirm('¿Seguro que quieres eliminar TODOS los proveedores que dicen "migrado desde histórico"?\n\nEsta acción NO se puede deshacer.')) {
        return;
    }
    
    showLoading();
    try {
        const { data: proveedoresMigrados, error: searchError } = await supabaseClient
            .from('proveedores')
            .select('id')
            .ilike('servicio', '%migrado desde histórico%');
        
        if (searchError) throw searchError;
        
        if (!proveedoresMigrados || proveedoresMigrados.length === 0) {
            alert('No se encontraron proveedores con "migrado desde histórico"');
            hideLoading();
            return;
        }
        
        const ids = proveedoresMigrados.map(p => p.id);
        
        const { error: deleteError } = await supabaseClient
            .from('proveedores')
            .delete()
            .in('id', ids);
        
        if (deleteError) throw deleteError;
        
        await loadProveedores();
        renderProveedoresTable();
        
        alert(`✅ Se eliminaron ${ids.length} proveedores migrados correctamente`);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar proveedores: ' + error.message);
    } finally {
        hideLoading();
    }
}

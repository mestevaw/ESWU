/* ========================================
   ESWU - MAIN APP
   Initialization and event handlers
   ======================================== */

// ============================================
// LOGIN & LOGOUT
// ============================================

function login(username) {
    if (!username || username === '') return;
    
    currentUser = username;
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    document.getElementById('appContainer').classList.add('active');
    document.body.classList.add('logged-in');
    
    updateMainMenuForPage();
    setTimeout(() => {
        loadAllData().then(() => {
            populateYearSelect();
            populateInquilinosYearSelects();
            populateProveedoresYearSelects();
            updateHomeView();
        });
    }, 100);
}

function logout() {
    if (!confirm('¿Cerrar sesión?')) return;
    
    currentUser = '';
    document.getElementById('username').value = '';
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('appContainer').classList.remove('active');
    document.body.classList.remove('logged-in');
}

// ============================================
// INQUILINOS - MODALS & ACTIONS
// ============================================

function showAddInquilinoModal() {
    isEditMode = false;
    currentInquilinoId = null;
    currentContratoFile = null;
    currentDocAdicionalFile = null;
    tempInquilinoContactos = [];
    
    document.getElementById('addInquilinoTitle').textContent = 'Agregar Inquilino';
    document.getElementById('inquilinoForm').reset();
    document.getElementById('contratoFileName').textContent = '';
    document.getElementById('docAdicionalFileName').textContent = '';
    document.getElementById('nombreDocGroup').classList.add('hidden');
    renderContactosList([], 'inquilinoContactosList', 'deleteInquilinoContacto');
    document.getElementById('addInquilinoModal').classList.add('active');
}

async function saveInquilino(event) {
    event.preventDefault();
    
    if (tempInquilinoContactos.length === 0) {
        alert('Debes agregar al menos un contacto');
        return;
    }
    
    showLoading();
    try {
        let contratoData = currentContratoFile;
        let contratoName = null;
        const contratoInput = document.getElementById('inquilinoContrato');
        
        if (contratoInput.files.length > 0) {
            contratoData = await fileToBase64(contratoInput.files[0]);
            contratoName = contratoInput.files[0].name;
        }
        
        const inquilinoData = {
            nombre: document.getElementById('inquilinoNombre').value,
            clabe: document.getElementById('inquilinoClabe').value,
            rfc: document.getElementById('inquilinoRFC').value,
            m2: document.getElementById('inquilinoM2').value,
            renta: parseFloat(document.getElementById('inquilinoRenta').value),
            fecha_inicio: document.getElementById('inquilinoFechaInicio').value,
            fecha_vencimiento: document.getElementById('inquilinoFechaVenc').value,
            notas: document.getElementById('inquilinoNotas').value,
            contrato_file: contratoData,
            contrato_filename: contratoName
        };
        
        const inquilinoId = await saveInquilinoData(inquilinoData, isEditMode, currentInquilinoId);
        await saveInquilinoContactos(inquilinoId, tempInquilinoContactos);
        
        const docAdicionalInput = document.getElementById('inquilinoDocAdicional');
        if (docAdicionalInput.files.length > 0) {
            const nombreDoc = document.getElementById('inquilinoNombreDoc').value;
            if (!nombreDoc) {
                alert('Por favor ingrese un nombre para el documento');
                hideLoading();
                return;
            }
            const docData = await fileToBase64(docAdicionalInput.files[0]);
            await saveInquilinoDocumento(inquilinoId, nombreDoc, docData);
        }
        
        await loadInquilinos();
        renderInquilinosTable();
        closeModal('addInquilinoModal');
        
        isEditMode = false;
        currentInquilinoId = null;
        currentContratoFile = null;
        currentDocAdicionalFile = null;
        tempInquilinoContactos = [];
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar: ' + error.message);
    } finally {
        hideLoading();
    }
}

function editInquilino() {
    const inq = inquilinos.find(i => i.id === currentInquilinoId);
    isEditMode = true;
    currentContratoFile = inq.contratoFile;
    tempInquilinoContactos = [...inq.contactos];
    
    document.getElementById('addInquilinoTitle').textContent = 'Editar Inquilino';
    document.getElementById('inquilinoNombre').value = inq.nombre;
    document.getElementById('inquilinoClabe').value = inq.clabe || '';
    document.getElementById('inquilinoRFC').value = inq.rfc || '';
    document.getElementById('inquilinoM2').value = inq.m2 || '';
    document.getElementById('inquilinoRenta').value = inq.renta;
    document.getElementById('inquilinoFechaInicio').value = inq.fechaInicio;
    document.getElementById('inquilinoFechaVenc').value = inq.fechaVencimiento;
    document.getElementById('inquilinoNotas').value = inq.notas || '';
    
    if (inq.contratoFileName) {
        document.getElementById('contratoFileName').textContent = inq.contratoFileName;
    }
    
    renderContactosList(tempInquilinoContactos, 'inquilinoContactosList', 'deleteInquilinoContacto');
    closeModal('inquilinoDetailModal');
    document.getElementById('addInquilinoModal').classList.add('active');
}

async function deleteInquilino() {
    if (!confirm('¿Eliminar este inquilino?')) return;
    
    showLoading();
    try {
        await deleteInquilinoFromDB(currentInquilinoId);
        await loadInquilinos();
        renderInquilinosTable();
        closeModal('inquilinoDetailModal');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

function showRegistrarPagoModal() {
    const inq = inquilinos.find(i => i.id === currentInquilinoId);
    document.getElementById('pagoMonto').value = inq.renta;
    document.getElementById('pagoFecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('pagoCompleto').value = 'si';
    document.getElementById('pagoMontoGroup').classList.add('hidden');
    document.getElementById('registrarPagoModal').classList.add('active');
}

async function savePagoRenta(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const inq = inquilinos.find(i => i.id === currentInquilinoId);
        const completo = document.getElementById('pagoCompleto').value === 'si';
        const monto = completo ? inq.renta : parseFloat(document.getElementById('pagoMonto').value);
        
        const pagoData = {
            inquilino_id: currentInquilinoId,
            fecha: document.getElementById('pagoFecha').value,
            monto: monto,
            completo: completo
        };
        
        await savePagoInquilino(pagoData);
        await loadInquilinos();
        showInquilinoDetail(currentInquilinoId);
        closeModal('registrarPagoModal');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

// ============================================
// PROVEEDORES - MODALS & ACTIONS
// ============================================

function showAddProveedorModal() {
    isEditMode = false;
    currentProveedorId = null;
    currentProvDocAdicionalFile = null;
    tempProveedorContactos = [];
    
    document.getElementById('addProveedorTitle').textContent = 'Agregar Proveedor';
    document.getElementById('proveedorForm').reset();
    document.getElementById('provDocAdicionalFileName').textContent = '';
    document.getElementById('nombreProvDocGroup').classList.add('hidden');
    renderContactosList([], 'proveedorContactosList', 'deleteProveedorContacto');
    document.getElementById('addProveedorModal').classList.add('active');
}

async function saveProveedor(event) {
    event.preventDefault();
    
    if (tempProveedorContactos.length === 0) {
        alert('Debes agregar al menos un contacto');
        return;
    }
    
    showLoading();
    try {
        const provData = {
            nombre: document.getElementById('proveedorNombre').value,
            servicio: document.getElementById('proveedorServicio').value,
            clabe: document.getElementById('proveedorClabe').value,
            rfc: document.getElementById('proveedorRFC').value,
            notas: document.getElementById('proveedorNotas').value
        };
        
        const proveedorId = await saveProveedorData(provData, isEditMode, currentProveedorId);
        await saveProveedorContactos(proveedorId, tempProveedorContactos);
        
        const docAdicionalInput = document.getElementById('proveedorDocAdicional');
        if (docAdicionalInput.files.length > 0) {
            const nombreDoc = document.getElementById('proveedorNombreDoc').value;
            if (!nombreDoc) {
                alert('Por favor ingrese un nombre para el documento');
                hideLoading();
                return;
            }
            const docData = await fileToBase64(docAdicionalInput.files[0]);
            await saveProveedorDocumento(proveedorId, nombreDoc, docData);
        }
        
        await loadProveedores();
        renderProveedoresTable();
        closeModal('addProveedorModal');
        
        isEditMode = false;
        currentProveedorId = null;
        currentProvDocAdicionalFile = null;
        tempProveedorContactos = [];
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar: ' + error.message);
    } finally {
        hideLoading();
    }
}

function editProveedor() {
    const prov = proveedores.find(p => p.id === currentProveedorId);
    isEditMode = true;
    tempProveedorContactos = [...prov.contactos];
    
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

async function deleteProveedor() {
    if (!confirm('¿Eliminar este proveedor?')) return;
    
    showLoading();
    try {
        await deleteProveedorFromDB(currentProveedorId);
        await loadProveedores();
        renderProveedoresTable();
        closeModal('proveedorDetailModal');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

// ============================================
// FACTURAS - MODALS & ACTIONS
// ============================================

function showRegistrarFacturaModal() {
    currentFacturaDocFile = null;
    document.getElementById('facturaNumero').value = '';
    document.getElementById('facturaFecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('facturaVencimiento').value = '';
    document.getElementById('facturaMonto').value = '';
    document.getElementById('facturaIVA').value = '';
    document.getElementById('facturaDocumentoFileName').textContent = '';
    document.getElementById('registrarFacturaModal').classList.add('active');
}

async function saveFactura(event) {
    event.preventDefault();
    showLoading();
    
    try {
        let docData = null;
        let docName = null;
        const docInput = document.getElementById('facturaDocumento');
        
        if (docInput.files.length > 0) {
            docData = await fileToBase64(docInput.files[0]);
            docName = docInput.files[0].name;
        }
        
        const facturaData = {
            proveedor_id: currentProveedorId,
            numero: document.getElementById('facturaNumero').value,
            fecha: document.getElementById('facturaFecha').value,
            vencimiento: document.getElementById('facturaVencimiento').value,
            monto: parseFloat(document.getElementById('facturaMonto').value),
            iva: parseFloat(document.getElementById('facturaIVA').value || 0),
            documento_file: docData,
            documento_filename: docName
        };
        
        await saveFacturaData(facturaData);
        await loadProveedores();
        showProveedorDetail(currentProveedorId);
        closeModal('registrarFacturaModal');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar factura: ' + error.message);
    } finally {
        hideLoading();
    }
}

function showPagarFacturaModal(facturaId) {
    currentFacturaId = facturaId;
    currentPagoFacturaFile = null;
    document.getElementById('fechaPagoFactura').value = new Date().toISOString().split('T')[0];
    document.getElementById('pagoPDFFacturaFileName').textContent = '';
    document.getElementById('pagarFacturaModal').classList.add('active');
}

function showPagarFacturaModalFromDetail() {
    closeModal('facturaDetailModal');
    currentPagoFacturaFile = null;
    document.getElementById('fechaPagoFactura').value = new Date().toISOString().split('T')[0];
    document.getElementById('pagoPDFFacturaFileName').textContent = '';
    document.getElementById('pagarFacturaModal').classList.add('active');
}

async function savePagoFactura(event) {
    event.preventDefault();
    showLoading();
    
    try {
        let pagoData = null;
        let pagoName = null;
        const pagoInput = document.getElementById('pagoPDFFactura');
        
        if (pagoInput.files.length > 0) {
            pagoData = await fileToBase64(pagoInput.files[0]);
            pagoName = pagoInput.files[0].name;
        }
        
        await updateFacturaPago(
            currentFacturaId,
            document.getElementById('fechaPagoFactura').value,
            pagoData,
            pagoName
        );
        
        await loadProveedores();
        
        if (currentProveedorId) {
            showProveedorDetail(currentProveedorId);
        } else {
            renderProveedoresFacturasPorPagar();
        }
        
        closeModal('pagarFacturaModal');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

async function deleteFactura(facturaId) {
    if (!confirm('¿Estás seguro que deseas eliminar esta factura?')) return;
    
    showLoading();
    try {
        await deleteFacturaFromDB(facturaId);
        await loadProveedores();
        showProveedorDetail(currentProveedorId);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar factura: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// ACTIVOS - MODALS & ACTIONS
// ============================================

function showAddActivoModal() {
    isEditMode = false;
    currentActivoId = null;
    currentActivoFotos = [];
    
    document.getElementById('addActivoTitle').textContent = 'Agregar Activo';
    document.getElementById('activoForm').reset();
    document.getElementById('activoFotosFileName').textContent = '';
    populateProveedoresDropdown();
    document.getElementById('addActivoModal').classList.add('active');
}

async function saveActivo(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const actData = {
            nombre: document.getElementById('activoNombre').value,
            ultimo_mant: document.getElementById('activoUltimoMant').value,
            proximo_mant: document.getElementById('activoProximoMant').value,
            proveedor: document.getElementById('activoProveedor').value,
            notas: document.getElementById('activoNotas').value
        };
        
        const activoId = await saveActivoData(actData, isEditMode, currentActivoId);
        
        const fotosInput = document.getElementById('activoFotos');
        if (fotosInput.files.length > 0) {
            const fotos = [];
            for (const file of fotosInput.files) {
                const fotoData = await fileToBase64(file);
                fotos.push({ data: fotoData, name: file.name });
            }
            await saveActivoFotos(activoId, fotos);
        }
        
        await loadActivos();
        renderActivosTable();
        closeModal('addActivoModal');
        
        isEditMode = false;
        currentActivoId = null;
        currentActivoFotos = [];
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

function editActivo() {
    const act = activos.find(a => a.id === currentActivoId);
    isEditMode = true;
    currentActivoFotos = act.fotos;
    
    document.getElementById('addActivoTitle').textContent = 'Editar Activo';
    document.getElementById('activoNombre').value = act.nombre;
    document.getElementById('activoUltimoMant').value = act.ultimoMant || '';
    document.getElementById('activoProximoMant').value = act.proximoMant || '';
    populateProveedoresDropdown();
    document.getElementById('activoProveedor').value = act.proveedor || '';
    document.getElementById('activoNotas').value = act.notas || '';
    
    closeModal('activoDetailModal');
    document.getElementById('addActivoModal').classList.add('active');
}

async function deleteActivo() {
    if (!confirm('¿Eliminar este activo?')) return;
    
    showLoading();
    try {
        await deleteActivoFromDB(currentActivoId);
        await loadActivos();
        renderActivosTable();
        closeModal('activoDetailModal');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

// ============================================
// ADMIN - USUARIOS & BANCOS
// ============================================

async function saveUsuario(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const usuarioData = {
            nombre: document.getElementById('usuarioNombre').value,
            password: document.getElementById('usuarioPassword').value,
            activo: true
        };
        
        await saveUsuarioData(usuarioData, isEditMode, currentUsuarioId);
        await loadUsuarios();
        renderUsuariosTable();
        closeModal('addUsuarioModal');
        
        isEditMode = false;
        currentUsuarioId = null;
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar usuario: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function saveBancoDoc(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const docInput = document.getElementById('bancoDocumento');
        if (docInput.files.length === 0) {
            alert('Por favor seleccione un documento PDF');
            hideLoading();
            return;
        }
        
        const docData = await fileToBase64(docInput.files[0]);
        
        const bancoData = {
            tipo: document.getElementById('bancoTipo').value,
            archivo_pdf: docData,
            usuario_subio: currentUser,
            fecha_subida: new Date().toISOString().split('T')[0]
        };
        
        await saveBancoDocumento(bancoData);
        await loadBancosDocumentos();
        renderBancosTable();
        closeModal('addBancoModal');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar documento: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ESWU iniciado');
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            if (username) login(username);
        });
    }
    
    // File input handlers
    const inquilinoContrato = document.getElementById('inquilinoContrato');
    if (inquilinoContrato) {
        inquilinoContrato.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                document.getElementById('contratoFileName').textContent = e.target.files[0].name;
            }
        });
    }
    
    const inquilinoDocAdicional = document.getElementById('inquilinoDocAdicional');
    if (inquilinoDocAdicional) {
        inquilinoDocAdicional.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                document.getElementById('docAdicionalFileName').textContent = e.target.files[0].name;
                document.getElementById('nombreDocGroup').classList.remove('hidden');
            } else {
                document.getElementById('nombreDocGroup').classList.add('hidden');
            }
        });
    }
    
    const proveedorDocAdicional = document.getElementById('proveedorDocAdicional');
    if (proveedorDocAdicional) {
        proveedorDocAdicional.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                document.getElementById('provDocAdicionalFileName').textContent = e.target.files[0].name;
                document.getElementById('nombreProvDocGroup').classList.remove('hidden');
            } else {
                document.getElementById('nombreProvDocGroup').classList.add('hidden');
            }
        });
    }
    
    const facturaDocumento = document.getElementById('facturaDocumento');
    if (facturaDocumento) {
        facturaDocumento.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                document.getElementById('facturaDocumentoFileName').textContent = e.target.files[0].name;
            }
        });
    }
    
    const pagoPDFFactura = document.getElementById('pagoPDFFactura');
    if (pagoPDFFactura) {
        pagoPDFFactura.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                document.getElementById('pagoPDFFacturaFileName').textContent = e.target.files[0].name;
            }
        });
    }
    
    const activoFotos = document.getElementById('activoFotos');
    if (activoFotos) {
        activoFotos.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                document.getElementById('activoFotosFileName').textContent = `${e.target.files.length} foto(s) seleccionada(s)`;
            }
        });
    }
    
    const bancoDocumento = document.getElementById('bancoDocumento');
    if (bancoDocumento) {
        bancoDocumento.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                document.getElementById('bancoDocumentoFileName').textContent = e.target.files[0].name;
            }
        });
    }
    
    // Hide home icon initially
    document.getElementById('homeIcon').style.display = 'none';
});

// Close dropdowns when clicking outside
window.onclick = function(event) {
    if (!event.target.matches('.dropdown-toggle')) {
        document.querySelectorAll('.dropdown-content').forEach(dd => dd.classList.remove('show'));
        document.querySelectorAll('.main-menu-content').forEach(dd => dd.classList.remove('show'));
    }
}

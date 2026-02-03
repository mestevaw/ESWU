/* ========================================
   ESWU - MAIN APPLICATION
   Database operations and app initialization
   ======================================== */

// ============================================
// GLOBAL STATE VARIABLES
// ============================================

let inquilinos = [];
let proveedores = [];
let activos = [];
let estacionamiento = [];
let bitacoraSemanal = [];
let usuarios = [];
let bancosDocumentos = [];

let currentInquilinoId = null;
let currentProveedorId = null;
let currentActivoId = null;
let currentUsuarioId = null;
let currentEstacionamientoId = null;
let currentBitacoraId = null;
let currentFacturaId = null;

let isEditMode = false;
let tempInquilinoContactos = [];
let tempProveedorContactos = [];

let currentUser = null;

// ============================================
// LOGIN AND AUTHENTICATION
// ============================================

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    showLoading();
    
    try {
        // Buscar usuario en Supabase
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
        
        // Guardar usuario en localStorage para recordarlo
        localStorage.setItem('eswu_remembered_user', username);
        
        // Ocultar login, mostrar app
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.add('active');
        document.body.classList.add('logged-in');
        
        // Cargar datos
        await initializeApp();
        
    } catch (error) {
        alert(error.message);
    } finally {
        hideLoading();
    }
});

// ============================================
// CHECK FOR REMEMBERED USER ON LOAD
// ============================================

window.addEventListener('DOMContentLoaded', function() {
    const rememberedUser = localStorage.getItem('eswu_remembered_user');
    
    if (rememberedUser) {
        // Si hay usuario recordado, pre-seleccionarlo y solo pedir password
        document.getElementById('username').value = rememberedUser;
        document.getElementById('password').focus();
    }
});

// ============================================
// APP INITIALIZATION
// ============================================

async function initializeApp() {
    showLoading();
    try {
        await Promise.all([
            loadInquilinos(),
            loadProveedores(),
            loadActivos(),
            loadEstacionamiento(),
            loadBitacoraSemanal(),
            loadUsuarios(),
            loadBancosDocumentos()
        ]);
        
        // Populate year selects
        populateYearSelect();
        populateInquilinosYearSelects();
        populateProveedoresYearSelects();
        
        // Show main menu
        document.getElementById('mainMenuPage').classList.add('active');
        
    } catch (error) {
        console.error('Error inicializando app:', error);
        alert('Error cargando datos: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// DATA LOADING FUNCTIONS
// ============================================

async function loadInquilinos() {
    try {
        const { data: inquilinosData, error: inquilinosError } = await supabaseClient
            .from('inquilinos')
            .select('*')
            .order('nombre');
        
        if (inquilinosError) throw inquilinosError;
        
        const { data: contactosData, error: contactosError } = await supabaseClient
            .from('inquilinos_contactos')
            .select('*');
        
        if (contactosError) throw contactosError;
        
        const { data: pagosData, error: pagosError } = await supabaseClient
            .from('pagos_inquilinos')
            .select('*')
            .order('fecha', { ascending: false });
        
        if (pagosError) throw pagosError;
        
        const { data: docsData, error: docsError } = await supabaseClient
            .from('inquilinos_documentos')
            .select('*');
        
        if (docsError) throw docsError;
        
        inquilinos = inquilinosData.map(inq => ({
            ...inq,
            contactos: contactosData.filter(c => c.inquilino_id === inq.id),
            pagos: pagosData.filter(p => p.inquilino_id === inq.id),
            documentos: docsData.filter(d => d.inquilino_id === inq.id)
        }));
        
    } catch (error) {
        console.error('Error loading inquilinos:', error);
        throw error;
    }
}

async function loadProveedores() {
    try {
        const { data: proveedoresData, error: proveedoresError } = await supabaseClient
            .from('proveedores')
            .select('*')
            .order('nombre');
        
        if (proveedoresError) throw proveedoresError;
        
        const { data: contactosData, error: contactosError } = await supabaseClient
            .from('proveedores_contactos')
            .select('*');
        
        if (contactosError) throw contactosError;
        
        const { data: facturasData, error: facturasError } = await supabaseClient
            .from('facturas')
            .select('*')
            .order('fecha', { ascending: false });
        
        if (facturasError) throw facturasError;
        
        const { data: docsData, error: docsError } = await supabaseClient
            .from('proveedores_documentos')
            .select('*');
        
        if (docsError) throw docsError;
        
        proveedores = proveedoresData.map(prov => ({
            ...prov,
            contactos: contactosData.filter(c => c.proveedor_id === prov.id),
            facturas: facturasData.filter(f => f.proveedor_id === prov.id),
            documentos: docsData.filter(d => d.proveedor_id === prov.id)
        }));
        
    } catch (error) {
        console.error('Error loading proveedores:', error);
        throw error;
    }
}

async function loadActivos() {
    try {
        const { data: activosData, error: activosError } = await supabaseClient
            .from('activos')
            .select('*')
            .order('nombre');
        
        if (activosError) throw activosError;
        
        const { data: fotosData, error: fotosError } = await supabaseClient
            .from('activos_fotos')
            .select('*');
        
        if (fotosError) throw fotosError;
        
        activos = activosData.map(act => ({
            ...act,
            fotos: fotosData.filter(f => f.activo_id === act.id)
        }));
        
    } catch (error) {
        console.error('Error loading activos:', error);
        throw error;
    }
}

async function loadEstacionamiento() {
    try {
        const { data, error } = await supabaseClient
            .from('estacionamiento')
            .select('*')
            .order('numero_espacio');
        
        if (error) throw error;
        
        estacionamiento = data.map(e => ({
            id: e.id,
            numeroEspacio: e.numero_espacio,
            inquilinoNombre: e.inquilino_nombre,
            numeroDespacho: e.numero_despacho,
            colorAsignado: e.color_asignado
        }));
        
    } catch (error) {
        console.error('Error loading estacionamiento:', error);
        throw error;
    }
}

async function loadBitacoraSemanal() {
    try {
        const { data, error } = await supabaseClient
            .from('bitacora_semanal')
            .select('*')
            .order('semana', { ascending: false });
        
        if (error) throw error;
        
        bitacoraSemanal = data.map(b => {
            const fecha = new Date(b.semana + 'T00:00:00');
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const semanaTexto = `Semana del ${fecha.getDate()} ${months[fecha.getMonth()]} ${fecha.getFullYear()}`;
            
            return {
                id: b.id,
                semana: b.semana,
                semanaTexto: semanaTexto,
                notas: b.notas
            };
        });
        
    } catch (error) {
        console.error('Error loading bitacora:', error);
        throw error;
    }
}

async function loadUsuarios() {
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .order('nombre');
        
        if (error) throw error;
        
        usuarios = data;
        
    } catch (error) {
        console.error('Error loading usuarios:', error);
        throw error;
    }
}

async function loadBancosDocumentos() {
    try {
        const { data, error } = await supabaseClient
            .from('bancos_documentos')
            .select('*')
            .order('fecha_subida', { ascending: false });
        
        if (error) throw error;
        
        bancosDocumentos = data.map(b => ({
            id: b.id,
            tipo: b.tipo,
            archivoPdf: b.archivo_pdf,
            fechaSubida: b.fecha_subida
        }));
        
    } catch (error) {
        console.error('Error loading bancos:', error);
        throw error;
    }
}
// ============================================
// SAVE FUNCTIONS
// ============================================

async function saveInquilino(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const contratoFile = document.getElementById('inquilinoContrato').files[0];
        let contratoURL = null;
        
        if (contratoFile) {
            const contratoBase64 = await fileToBase64(contratoFile);
            contratoURL = contratoBase64;
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
            if (!contratoURL && inquilinos.find(i => i.id === currentInquilinoId).contratoFile) {
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
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar inquilino: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function saveProveedor(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const docFile = document.getElementById('proveedorDocAdicional').files[0];
        let docURL = null;
        let docNombre = null;
        
        if (docFile) {
            docURL = await fileToBase64(docFile);
            docNombre = document.getElementById('proveedorNombreDoc').value;
        }
        
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
        
        if (docURL && docNombre) {
            const { error: docError } = await supabaseClient
                .from('proveedores_documentos')
                .insert([{
                    proveedor_id: proveedorId,
                    nombre: docNombre,
                    archivo: docURL,
                    fecha: new Date().toISOString().split('T')[0],
                    usuario: currentUser.nombre
                }]);
            
            if (docError) throw docError;
        }
        
        await loadProveedores();
        closeModal('addProveedorModal');
        
        if (currentSubContext === 'proveedores-list') {
            renderProveedoresTable();
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar proveedor: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function saveEstacionamiento() {
    showLoading();
    try {
        const inquilinoSeleccionado = document.getElementById('editEspacioInquilino').value;
        const despacho = document.getElementById('editEspacioDespacho').value;
        
        const { error } = await supabaseClient
            .from('estacionamiento')
            .update({
                inquilino_nombre: inquilinoSeleccionado || null,
                numero_despacho: despacho || null
            })
            .eq('id', currentEstacionamientoId);
        
        if (error) throw error;
        
        await loadEstacionamiento();
        renderEstacionamientoTable();
        closeModal('editEstacionamientoModal');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function saveBitacora() {
    showLoading();
    try {
        const fecha = document.getElementById('editBitacoraFecha').value;
        const notas = document.getElementById('editBitacoraNotas').value;
        
        const { error } = await supabaseClient
            .from('bitacora_semanal')
            .update({
                semana: fecha,
                notas: notas
            })
            .eq('id', currentBitacoraId);
        
        if (error) throw error;
        
        await loadBitacoraSemanal();
        renderBitacoraTable();
        closeModal('editBitacoraModal');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar bitácora: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function saveBancoDoc(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const tipo = document.getElementById('bancoTipo').value;
        const file = document.getElementById('bancoDocumento').files[0];
        
        if (!file) {
            throw new Error('Seleccione un archivo PDF');
        }
        
        const pdfBase64 = await fileToBase64(file);
        
        const { error } = await supabaseClient
            .from('bancos_documentos')
            .insert([{
                tipo: tipo,
                archivo_pdf: pdfBase64,
                fecha_subida: new Date().toISOString().split('T')[0]
            }]);
        
        if (error) throw error;
        
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
// ADDITIONAL PLACEHOLDER FUNCTIONS
// ============================================

async function saveActivo(event) {
    event.preventDefault();
    alert('Función saveActivo - pendiente de implementar');
}

async function saveUsuario(event) {
    event.preventDefault();
    alert('Función saveUsuario - pendiente de implementar');
}

async function saveFactura(event) {
    event.preventDefault();
    alert('Función saveFactura - pendiente de implementar');
}

async function savePagoRenta(event) {
    event.preventDefault();
    alert('Función savePagoRenta - pendiente de implementar');
}

async function savePagoFactura(event) {
    event.preventDefault();
    alert('Función savePagoFactura - pendiente de implementar');
}

async function saveDocumentoAdicional(event) {
    event.preventDefault();
    alert('Función saveDocumentoAdicional - pendiente de implementar');
}

function showRegistrarPagoModal() {
    document.getElementById('registrarPagoModal').classList.add('active');
}

function showRegistrarFacturaModal() {
    document.getElementById('registrarFacturaModal').classList.add('active');
}

function showPagarFacturaModal(facturaId) {
    currentFacturaId = facturaId;
    document.getElementById('pagarFacturaModal').classList.add('active');
}

function showPagarFacturaModalFromDetail() {
    closeModal('facturaDetailModal');
    showPagarFacturaModal(currentFacturaId);
}

function editInquilino() {
    alert('Función editInquilino - pendiente de implementar');
}

function deleteInquilino() {
    alert('Función deleteInquilino - pendiente de implementar');
}

function editProveedor() {
    alert('Función editProveedor - pendiente de implementar');
}

function deleteProveedor() {
    alert('Función deleteProveedor - pendiente de implementar');
}

function editActivo() {
    alert('Función editActivo - pendiente de implementar');
}

function deleteActivo() {
    alert('Función deleteActivo - pendiente de implementar');
}

function deleteFactura(facturaId) {
    alert('Función deleteFactura - pendiente de implementar para factura ID: ' + facturaId);
}

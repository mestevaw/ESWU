/* ========================================
   ESWU - MAIN.JS COMPLETO
   Todas las funciones de guardado
   ======================================== */

// ============================================
// LOGIN
// ============================================

// ============================================
// AGREGAR ESTO AL INICIO DE main.js
// (Después de los comentarios, ANTES de document.getElementById)
// ============================================

// Funciones de loading (necesarias para login)

// ============================================
// NOTA: Funciones duplicadas eliminadas.
// Ahora están en sus archivos modulares:
//   showLoading/hideLoading → db-core.js
//   saveInquilino/editInquilino/deleteInquilino → db-inquilinos.js
//   saveProveedor/editProveedor/deleteProveedor → db-proveedores.js
//   saveFactura/savePagoFactura/deleteFactura → db-facturas.js
//   contactos inquilino → inquilino-modals.js
//   contactos proveedor → proveedor-modals.js
//   loadInquilinos → db-inquilinos.js
//   loadProveedores → db-proveedores.js
//   populateInquilinosYearSelects/populateProveedoresYearSelects → tables.js
//   fileToBase64 → db-core.js
// ============================================


// ============================================
// DESPUÉS DE ESTO, CONTINÚA CON:
// document.getElementById('loginForm')...
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
    showLoadingBanner('Cargando datos...');
    
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
        
        populateYearSelect();
        populateInquilinosYearSelects();
        populateProveedoresYearSelects();
        
        console.log('✅ App inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando app:', error);
        alert('Error cargando datos: ' + error.message);
    } finally {
        hideLoadingBanner();
    }
}

// Variables de control de carga
let inquilinosFullLoaded = false;
let proveedoresFullLoaded = false;
let activosLoaded = false;
let usuariosLoaded = false;
let bancosLoaded = false;
let estacionamientoLoaded = false;
let bitacoraLoaded = false;

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
   
   async function terminarContratoInquilino() {
    const fechaTerminacion = prompt('Ingresa la fecha de terminación del contrato (YYYY-MM-DD):');
    
    if (!fechaTerminacion) return;
    
    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaTerminacion)) {
        alert('Formato de fecha inválido. Usa YYYY-MM-DD (ejemplo: 2026-02-15)');
        return;
    }
    
    if (!confirm('¿Está seguro de terminar el contrato de este inquilino?')) {
        return;
    }
    
    showLoading();
    
    try {
        const { error } = await supabaseClient
            .from('inquilinos')
            .update({
                contrato_activo: false,
                fecha_terminacion: fechaTerminacion
            })
            .eq('id', currentInquilinoId);
        
        if (error) throw error;
        
        await loadInquilinos();
        closeModal('inquilinoDetailModal');
        
        if (currentSubContext === 'inquilinos-list') {
            renderInquilinosTable();
        }
        
        alert('✅ Contrato terminado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al terminar contrato: ' + error.message);
    } finally {
        hideLoading();
    }
}
   
   // ============================================
// CARGA BÁSICA (RÁPIDA)
// ============================================

async function loadInquilinosBasico() {
    try {
        const { data, error } = await supabaseClient
            .from('inquilinos')
            .select('id, nombre, renta, fecha_vencimiento, contrato_activo')
            .order('nombre');
        
        if (error) throw error;
        
        inquilinos = data.map(inq => ({
            id: inq.id,
            nombre: inq.nombre,
            renta: parseFloat(inq.renta || 0),
            fecha_vencimiento: inq.fecha_vencimiento,
            contrato_activo: inq.contrato_activo,
            contactos: [],
            pagos: [],
            documentos: []
        }));
        
    } catch (error) {
        console.error('Error loading inquilinos básico:', error);
        throw error;
    }
}

async function loadProveedoresBasico() {
    try {
        const { data, error } = await supabaseClient
            .from('proveedores')
            .select('id, nombre, servicio')
            .order('nombre');
        
        if (error) throw error;
        
        proveedores = data.map(prov => ({
            id: prov.id,
            nombre: prov.nombre,
            servicio: prov.servicio,
            contactos: [],
            facturas: [],
            documentos: []
        }));
        
    } catch (error) {
        console.error('Error loading proveedores básico:', error);
        throw error;
    }
}

// ============================================
// ENSURES (CARGA LAZY)
// ============================================

async function ensureInquilinosFullLoaded() {
    if (inquilinosFullLoaded) return;
    showLoading();
    try {
        await loadInquilinos();
        inquilinosFullLoaded = true;
    } finally {
        hideLoading();
    }
}

async function ensureProveedoresFullLoaded() {
    if (proveedoresFullLoaded) return;
    showLoading();
    try {
        await loadProveedores();
        proveedoresFullLoaded = true;
    } finally {
        hideLoading();
    }
}

async function ensureActivosLoaded() {
    if (activosLoaded) return;
    showLoading();
    try {
        await loadActivos();
        populateProveedoresDropdown();
        activosLoaded = true;
    } finally {
        hideLoading();
    }
}

async function ensureUsuariosLoaded() {
    if (usuariosLoaded) return;
    showLoading();
    try {
        await loadUsuarios();
        usuariosLoaded = true;
    } finally {
        hideLoading();
    }
}

async function ensureBancosLoaded() {
    if (bancosLoaded) return;
    showLoading();
    try {
        await loadBancosDocumentos();
        bancosLoaded = true;
    } finally {
        hideLoading();
    }
}

async function ensureEstacionamientoLoaded() {
    if (estacionamientoLoaded) return;
    showLoading();
    try {
        await loadEstacionamiento();
        estacionamientoLoaded = true;
    } finally {
        hideLoading();
    }
}

async function ensureBitacoraLoaded() {
    if (bitacoraLoaded) return;
    showLoading();
    try {
        await loadBitacoraSemanal();
        bitacoraLoaded = true;
    } finally {
        hideLoading();
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
        
        estacionamiento = data;
        
    } catch (error) {
        console.error('Error loading estacionamiento:', error);
        throw error;
    }
}

async function loadBitacoraSemanal() {
    try {
        const { data, error } = await supabaseClient
            .from('bitacora_semanal')
            .select('id, semana_inicio, semana_texto, notas')
            .order('semana_inicio', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        
        bitacoraSemanal = data || [];
        
    } catch (error) {
        console.error('Error loading bitacora:', error);
        bitacoraSemanal = [];
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
            .select('id, tipo, archivo_pdf, fecha_subida')
            .order('fecha_subida', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        
        bancosDocumentos = data || [];
        
    } catch (error) {
        console.error('Error loading bancos:', error);
        bancosDocumentos = [];
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
                semana_inicio: fecha,
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
// AGREGAR ESTAS FUNCIONES AL FINAL DE main.js
// (Copiar y pegar después de saveBancoDoc)
// ============================================

function populateYearSelect() {
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('homeYear');
    
    if (!yearSelect) return;
    
    yearSelect.innerHTML = '';
    
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

console.log('✅ MAIN.JS LIMPIO cargado correctamente');

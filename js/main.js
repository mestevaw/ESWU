/* ========================================
   ESWU - MAIN.JS (LIMPIO)
   Solo funciones únicas que NO están en otros archivos.
   ======================================== */

// ============================================
// LOGIN
// ============================================

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    
    showLoading();
    
    try {
        var result = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('nombre', username)
            .eq('password', password)
            .eq('activo', true)
            .single();
        
        if (result.error || !result.data) {
            throw new Error('Usuario o contraseña incorrectos');
        }
        
        currentUser = result.data;
        
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
    var rememberedUser = localStorage.getItem('eswu_remembered_user');
    var rememberedPass = localStorage.getItem('eswu_remembered_pass');
    
    if (rememberedUser && rememberedPass) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('password').value = rememberedPass;
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
    
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.modal').forEach(function(m) { m.classList.remove('active'); });
    
    setTimeout(function() {
        document.querySelectorAll('.modal').forEach(function(m) { m.classList.remove('active'); });
    }, 1000);
});

// ============================================
// INITIALIZE APP - Carga secuencial para evitar timeouts
// ============================================

async function initializeApp() {
    showLoadingBanner('Cargando datos...');
    
    try {
        // Primero: inquilinos y proveedores (las más importantes)
        await loadInquilinos();
        console.log('  → Inquilinos OK');
        
        await loadProveedores();
        console.log('  → Proveedores OK');
        
        // Segundo: el resto en paralelo (son queries simples)
        await Promise.all([
            loadActivos(),
            loadUsuarios(),
            loadBancosDocumentos(),
            loadEstacionamiento(),
            loadBitacoraSemanal()
        ]);
        console.log('  → Resto de datos OK');
        
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

// Variables de control de carga lazy
var inquilinosFullLoaded = false;
var proveedoresFullLoaded = false;
var activosLoaded = false;
var usuariosLoaded = false;
var bancosLoaded = false;
var estacionamientoLoaded = false;
var bitacoraLoaded = false;

// ============================================
// FILE INPUT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    var inquilinoContrato = document.getElementById('inquilinoContrato');
    if (inquilinoContrato) {
        inquilinoContrato.addEventListener('change', function() {
            var fileName = this.files[0] ? this.files[0].name : '';
            var display = document.getElementById('contratoFileName');
            if (display) display.textContent = fileName ? 'Seleccionado: ' + fileName : '';
        });
    }
    
    var nuevoDocPDF = document.getElementById('nuevoDocPDF');
    if (nuevoDocPDF) {
        nuevoDocPDF.addEventListener('change', function() {
            var fileName = this.files[0] ? this.files[0].name : '';
            var display = document.getElementById('nuevoDocPDFFileName');
            if (display) display.textContent = fileName ? 'Seleccionado: ' + fileName : '';
        });
    }
    
    var pagoPDF = document.getElementById('pagoPDF');
    if (pagoPDF) {
        pagoPDF.addEventListener('change', function() {
            var fileName = this.files[0] ? this.files[0].name : '';
            var display = document.getElementById('pagoPDFFileName');
            if (display) display.textContent = fileName ? 'Seleccionado: ' + fileName : '';
        });
    }
    
    var facturaDocumento = document.getElementById('facturaDocumento');
    if (facturaDocumento) {
        facturaDocumento.addEventListener('change', function() {
            var fileName = this.files[0] ? this.files[0].name : '';
            var display = document.getElementById('facturaDocumentoFileName');
            if (display) display.textContent = fileName ? 'Seleccionado: ' + fileName : '';
        });
    }
});

// ============================================
// ELIMINAR PROVEEDORES MIGRADOS
// ============================================

async function eliminarProveedoresMigrados() {
    if (!confirm('¿Seguro que quieres eliminar TODOS los proveedores que dicen "migrado desde histórico"?\n\nEsta acción NO se puede deshacer.')) {
        return;
    }
    
    showLoading();
    try {
        var result = await supabaseClient
            .from('proveedores')
            .select('id')
            .ilike('servicio', '%migrado desde histórico%');
        
        if (result.error) throw result.error;
        
        if (!result.data || result.data.length === 0) {
            alert('No se encontraron proveedores con "migrado desde histórico"');
            hideLoading();
            return;
        }
        
        var ids = result.data.map(function(p) { return p.id; });
        
        var delResult = await supabaseClient
            .from('proveedores')
            .delete()
            .in('id', ids);
        
        if (delResult.error) throw delResult.error;
        
        await loadProveedores();
        renderProveedoresTable();
        
        alert('✅ Se eliminaron ' + ids.length + ' proveedores migrados correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar proveedores: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// TERMINAR CONTRATO INQUILINO
// ============================================

async function terminarContratoInquilino() {
    var fechaTerminacion = prompt('Ingresa la fecha de terminación del contrato (YYYY-MM-DD):');
    
    if (!fechaTerminacion) return;
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaTerminacion)) {
        alert('Formato de fecha inválido. Usa YYYY-MM-DD (ejemplo: 2026-02-15)');
        return;
    }
    
    if (!confirm('¿Está seguro de terminar el contrato de este inquilino?')) {
        return;
    }
    
    showLoading();
    
    try {
        var result = await supabaseClient
            .from('inquilinos')
            .update({
                contrato_activo: false,
                fecha_terminacion: fechaTerminacion
            })
            .eq('id', currentInquilinoId);
        
        if (result.error) throw result.error;
        
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
// CARGA BÁSICA (RÁPIDA) - para listados
// ============================================

async function loadInquilinosBasico() {
    try {
        var result = await supabaseClient
            .from('inquilinos')
            .select('id, nombre, renta, fecha_vencimiento, contrato_activo')
            .order('nombre');
        
        if (result.error) throw result.error;
        
        inquilinos = result.data.map(function(inq) {
            return {
                id: inq.id,
                nombre: inq.nombre,
                renta: parseFloat(inq.renta || 0),
                fecha_vencimiento: inq.fecha_vencimiento,
                contrato_activo: inq.contrato_activo,
                contactos: [],
                pagos: [],
                documentos: []
            };
        });
        
    } catch (error) {
        console.error('Error loading inquilinos básico:', error);
        throw error;
    }
}

async function loadProveedoresBasico() {
    try {
        var result = await supabaseClient
            .from('proveedores')
            .select('id, nombre, servicio')
            .order('nombre');
        
        if (result.error) throw result.error;
        
        proveedores = result.data.map(function(prov) {
            return {
                id: prov.id,
                nombre: prov.nombre,
                servicio: prov.servicio,
                contactos: [],
                facturas: [],
                documentos: []
            };
        });
        
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

// ============================================
// LOAD ACTIVOS (con fotos)
// ============================================

async function loadActivos() {
    try {
        var r1 = await supabaseClient
            .from('activos')
            .select('*')
            .order('nombre');
        
        if (r1.error) throw r1.error;
        
        var r2 = await supabaseClient
            .from('activos_fotos')
            .select('*');
        
        if (r2.error) throw r2.error;
        
        var fotosData = r2.data || [];
        
        activos = r1.data.map(function(act) {
            return {
                id: act.id,
                nombre: act.nombre,
                ultimo_mant: act.ultimo_mant,
                proximo_mant: act.proximo_mant,
                proveedor: act.proveedor,
                notas: act.notas,
                fotos: fotosData.filter(function(f) { return f.activo_id === act.id; })
            };
        });
        
    } catch (error) {
        console.error('Error loading activos:', error);
        throw error;
    }
}

// ============================================
// LOAD ESTACIONAMIENTO
// ============================================

async function loadEstacionamiento() {
    try {
        var result = await supabaseClient
            .from('estacionamiento')
            .select('*')
            .order('numero_espacio');
        
        if (result.error) throw result.error;
        
        estacionamiento = result.data;
        
    } catch (error) {
        console.error('Error loading estacionamiento:', error);
        throw error;
    }
}

// ============================================
// LOAD BITÁCORA SEMANAL
// ============================================

async function loadBitacoraSemanal() {
    try {
        var result = await supabaseClient
            .from('bitacora_semanal')
            .select('id, semana_inicio, semana_texto, notas')
            .order('semana_inicio', { ascending: false })
            .limit(100);
        
        if (result.error) throw result.error;
        
        bitacoraSemanal = result.data || [];
        
    } catch (error) {
        console.error('Error loading bitacora:', error);
        bitacoraSemanal = [];
    }
}

// ============================================
// LOAD USUARIOS
// ============================================

async function loadUsuarios() {
    try {
        var result = await supabaseClient
            .from('usuarios')
            .select('*')
            .order('nombre');
        
        if (result.error) throw result.error;
        
        usuarios = result.data;
        
    } catch (error) {
        console.error('Error loading usuarios:', error);
        throw error;
    }
}

// ============================================
// LOAD BANCOS DOCUMENTOS
// ============================================

async function loadBancosDocumentos() {
    try {
        var result = await supabaseClient
            .from('bancos_documentos')
            .select('id, tipo, archivo_pdf, fecha_subida')
            .order('fecha_subida', { ascending: false })
            .limit(100);
        
        if (result.error) throw result.error;
        
        bancosDocumentos = result.data || [];
        
    } catch (error) {
        console.error('Error loading bancos:', error);
        bancosDocumentos = [];
    }
}

// ============================================
// SAVE ESTACIONAMIENTO
// ============================================

async function saveEstacionamiento() {
    showLoading();
    try {
        var inquilinoSeleccionado = document.getElementById('editEspacioInquilino').value;
        var despacho = document.getElementById('editEspacioDespacho').value;
        
        var result = await supabaseClient
            .from('estacionamiento')
            .update({
                inquilino_nombre: inquilinoSeleccionado || null,
                numero_despacho: despacho || null
            })
            .eq('id', currentEstacionamientoId);
        
        if (result.error) throw result.error;
        
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

// ============================================
// SAVE BITÁCORA
// ============================================

async function saveBitacora() {
    showLoading();
    try {
        var fecha = document.getElementById('editBitacoraFecha').value;
        var notas = document.getElementById('editBitacoraNotas').value;
        
        var result = await supabaseClient
            .from('bitacora_semanal')
            .update({
                semana_inicio: fecha,
                notas: notas
            })
            .eq('id', currentBitacoraId);
        
        if (result.error) throw result.error;
        
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

// ============================================
// SAVE BANCO DOCUMENTO
// ============================================

async function saveBancoDoc(event) {
    event.preventDefault();
    showLoading();
    
    try {
        var tipo = document.getElementById('bancoTipo').value;
        var file = document.getElementById('bancoDocumento').files[0];
        
        if (!file) {
            throw new Error('Seleccione un archivo PDF');
        }
        
        var pdfBase64 = await fileToBase64(file);
        
        var result = await supabaseClient
            .from('bancos_documentos')
            .insert([{
                tipo: tipo,
                archivo_pdf: pdfBase64,
                fecha_subida: new Date().toISOString().split('T')[0]
            }]);
        
        if (result.error) throw result.error;
        
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
// POPULATE YEAR SELECT (Números page)
// ============================================

function populateYearSelect() {
    var currentYear = new Date().getFullYear();
    var yearSelect = document.getElementById('homeYear');
    
    if (!yearSelect) return;
    
    yearSelect.innerHTML = '';
    
    for (var year = currentYear - 5; year <= currentYear + 1; year++) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

console.log('✅ MAIN.JS cargado correctamente');

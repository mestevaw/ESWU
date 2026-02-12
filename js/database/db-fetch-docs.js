/* ========================================
   DB-FETCH-DOCS.JS - Carga de documentos bajo demanda
   Obtiene PDFs/fotos base64 solo cuando el usuario los necesita
   Última actualización: 2026-02-12 13:30 CST
   ======================================== */

// ============================================
// VISOR DE PDFs
// ============================================

function openPDFViewer(base64Data) {
    if (!base64Data) {
        alert('No hay documento adjunto');
        return;
    }
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(`<iframe width='100%' height='100%' src='${base64Data}' style='border:none;position:fixed;top:0;left:0;right:0;bottom:0;'></iframe>`);
    } else {
        alert('No se pudo abrir la ventana. Verifica que el navegador no bloquee pop-ups.');
    }
}

// ============================================
// FUNCIÓN GENÉRICA DE FETCH Y VISTA
// ============================================

async function fetchAndViewDoc(table, column, id) {
    showLoading();
    try {
        const { data, error } = await supabaseClient
            .from(table)
            .select(column)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        if (data && data[column]) {
            openPDFViewer(data[column]);
        } else {
            alert('No hay documento adjunto');
        }
    } catch (e) {
        console.error('Error fetching document:', e);
        alert('Error al cargar documento: ' + e.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// INQUILINOS - Documentos bajo demanda
// ============================================

// Llamado desde inquilinos-ui.js: fetchAndViewContrato(inquilinoId)
function fetchAndViewContrato(inquilinoId) {
    const id = inquilinoId || currentInquilinoId;
    if (!id) return;
    fetchAndViewDoc('inquilinos', 'contrato_file', id);
}

// Llamado desde inquilinos-ui.js: fetchAndViewDocInquilino(docId)
function fetchAndViewDocInquilino(docId) {
    fetchAndViewDoc('inquilinos_documentos', 'archivo_pdf', docId);
}

// Para comprobantes de pago de inquilinos
function fetchAndViewPagoInquilino(pagoId) {
    fetchAndViewDoc('pagos_inquilinos', 'pago_file', pagoId);
}

// ============================================
// PROVEEDORES - Documentos bajo demanda
// ============================================

// Llamado desde proveedores-ui.js: fetchAndViewDocProveedor(docId)
function fetchAndViewDocProveedor(docId) {
    fetchAndViewDoc('proveedores_documentos', 'archivo_pdf', docId);
}

// ============================================
// FACTURAS - Documentos bajo demanda
// ============================================

// Llamado desde proveedores-ui.js: fetchAndViewFactura(facturaId, tipo)
// tipo = 'documento' o 'pago'
function fetchAndViewFactura(facturaId, tipo) {
    const column = (tipo === 'pago') ? 'pago_file' : 'documento_file';
    fetchAndViewDoc('facturas', column, facturaId);
}

// ============================================
// BANCOS - Documentos bajo demanda
// ============================================

// Llamado desde admin-ui.js: fetchAndViewBancoDoc(bancoId)
function fetchAndViewBancoDoc(bancoId) {
    fetchAndViewDoc('bancos_documentos', 'archivo_pdf', bancoId);
}

// ============================================
// ACTIVOS - Fotos bajo demanda
// ============================================

async function fetchActivoFotos(activoId) {
    const gallery = document.getElementById('photoGallery');
    gallery.innerHTML = '<p style="color:var(--text-light);text-align:center">Cargando fotos...</p>';
    
    try {
        const { data, error } = await supabaseClient
            .from('activos_fotos')
            .select('id, foto_data, foto_name')
            .eq('activo_id', activoId);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            gallery.innerHTML = data.map(f => `
                <div class="photo-item">
                    <img src="${f.foto_data}" alt="${f.foto_name}">
                </div>
            `).join('');
        } else {
            gallery.innerHTML = '<p style="color:var(--text-light);text-align:center">No hay fotos</p>';
        }
    } catch (e) {
        console.error('Error fetching photos:', e);
        gallery.innerHTML = '<p style="color:var(--danger);text-align:center">Error cargando fotos</p>';
    }
}

console.log('✅ DB-FETCH-DOCS.JS cargado (2026-02-12 13:30 CST)');

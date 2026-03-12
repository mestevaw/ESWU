/* ========================================
   js/database/db-uploads-pendientes.js
   Última actualización: 2026-03-12
   V1 - Cola de uploads temporales en Supabase
       Sincronización en background para nivel 1
   ======================================== */

var STORAGE_BUCKET = 'contabilidad-temp';
var _syncInProgress = false;

// ============================================
// SUBIR ARCHIVO A SUPABASE STORAGE (TEMPORAL)
// ============================================

async function uploadFilePendiente(file, anio, mes, subcarpeta, driveFolderId) {
    try {
        var timestamp = Date.now();
        var safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, '_');
        var safeSubcarpeta = subcarpeta.replace(/[^a-zA-Z0-9._\-]/g, '_');
        var storagePath = anio + '/' + String(mes).padStart(2,'0') + '/' + safeSubcarpeta + '/' + timestamp + '_' + safeName;

        var uploadRes = await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, {
                contentType: file.type || 'application/octet-stream',
                upsert: false
            });

        if (uploadRes.error) throw uploadRes.error;

        var record = {
            nombre: file.name,
            anio: anio,
            mes: mes,
            subcarpeta: subcarpeta,
            drive_folder_id: driveFolderId || null,
            storage_path: storagePath,
            size_bytes: file.size || 0,
            mime_type: file.type || '',
            subido_por: (currentUser && currentUser.nombre) ? currentUser.nombre : 'desconocido',
            sincronizado: false
        };

        var dbRes = await supabaseClient
            .from('uploads_pendientes')
            .insert([record])
            .select()
            .single();

        if (dbRes.error) {
            await supabaseClient.storage.from(STORAGE_BUCKET).remove([storagePath]);
            throw dbRes.error;
        }

        console.log('Pendiente guardado:', file.name);
        return dbRes.data;

    } catch (e) {
        console.error('Error en uploadFilePendiente:', e);
        throw e;
    }
}

// ============================================
// OBTENER PENDIENTES
// ============================================

async function getPendingUploads(anio, mes, subcarpeta) {
    try {
        var res = await supabaseClient
            .from('uploads_pendientes')
            .select('*')
            .eq('anio', anio)
            .eq('mes', mes)
            .eq('subcarpeta', subcarpeta)
            .eq('sincronizado', false)
            .order('created_at', { ascending: false });
        return res.data || [];
    } catch (e) {
        return [];
    }
}

async function getAllPendingUploads() {
    try {
        var res = await supabaseClient
            .from('uploads_pendientes')
            .select('*')
            .eq('sincronizado', false)
            .order('created_at', { ascending: false });
        return res.data || [];
    } catch (e) {
        return [];
    }
}

// ============================================
// VER ARCHIVO PENDIENTE
// ============================================

async function viewPendingFile(storagePath, nombre) {
    showLoading();
    try {
        var res = await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(storagePath, 3600);

        if (res.error) throw res.error;

        var overlay = document.getElementById('pdfViewerOverlay');
        var iframe = document.getElementById('pdfViewerIframe');

        if (overlay && iframe) {
            overlay.dataset.blobUrl = '';
            iframe.src = res.data.signedUrl;
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } else {
            window.open(res.data.signedUrl, '_blank');
        }
    } catch (e) {
        alert('Error al abrir archivo: ' + e.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// SINCRONIZAR UN PENDIENTE A DRIVE
// ============================================

async function syncPendienteAlDrive(record) {
    if (!isGoogleConnected()) throw new Error('Drive no conectado');
    if (!record.drive_folder_id) throw new Error('Sin carpeta Drive destino');

    var downloadRes = await supabaseClient.storage
        .from(STORAGE_BUCKET)
        .download(record.storage_path);

    if (downloadRes.error) throw downloadRes.error;

    var file = new File([downloadRes.data], record.nombre, {
        type: record.mime_type || 'application/octet-stream'
    });

    var driveResult = await uploadFileToDrive(file, record.drive_folder_id);
    if (!driveResult || !driveResult.id) throw new Error('Drive no devolvio ID');

    // Index in contabilidad_documentos (best-effort, non-fatal)
    try {
        await supabaseClient.from('contabilidad_documentos').insert([{
            nombre: record.nombre,
            anio: record.anio,
            mes: record.mes,
            subcarpeta: record.subcarpeta,
            google_drive_file_id: driveResult.id,
            size_bytes: record.size_bytes || 0,
            mime_type: record.mime_type || ''
        }]);
    } catch (e) {}

    // Mark as synced
    await supabaseClient.from('uploads_pendientes').update({
        sincronizado: true,
        sincronizado_at: new Date().toISOString(),
        drive_file_id: driveResult.id
    }).eq('id', record.id);

    // Clean up storage
    await supabaseClient.storage.from(STORAGE_BUCKET).remove([record.storage_path]);

    console.log('Sincronizado a Drive:', record.nombre);
    return driveResult.id;
}

// ============================================
// SYNC EN BACKGROUND (silencioso - nivel 1)
// Se llama al conectar Drive. Sin UI, sin
// interrupciones al usuario. Si el usuario
// cierra la app a medias, el siguiente login
// retoma automaticamente.
// ============================================

async function syncPendientesBackground() {
    if (_syncInProgress || !isGoogleConnected()) return;

    var pending = await getAllPendingUploads();
    if (pending.length === 0) return;

    _syncInProgress = true;
    console.log('Sync background: ' + pending.length + ' pendiente(s)...');

    var synced = 0;
    for (var i = 0; i < pending.length; i++) {
        if (!isGoogleConnected()) break;
        try {
            await syncPendienteAlDrive(pending[i]);
            synced++;
        } catch (e) {
            // Fallo silencioso - queda en cola para el proximo login
            console.warn('Sync fallo:', pending[i].nombre, '-', e.message);
        }
    }

    _syncInProgress = false;
    if (synced > 0) console.log('Sync background: ' + synced + ' archivo(s) subido(s).');
}

// ============================================
// ELIMINAR ARCHIVO PENDIENTE
// ============================================

async function deletePendingFile(id, storagePath, nombre) {
    if (!confirm('Eliminar "' + nombre + '"?\nSe borrara permanentemente.')) return;
    showLoading();
    try {
        await supabaseClient.storage.from(STORAGE_BUCKET).remove([storagePath]);
        var res = await supabaseClient.from('uploads_pendientes').delete().eq('id', id);
        if (res.error) throw res.error;
        if (typeof refreshOfflineSubcarpeta === 'function') refreshOfflineSubcarpeta();
    } catch (e) {
        alert('Error al eliminar: ' + e.message);
    } finally {
        hideLoading();
    }
}

console.log('DB-UPLOADS-PENDIENTES.JS V1 cargado');

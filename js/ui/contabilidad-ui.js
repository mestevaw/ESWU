/* ========================================
   js/ui/contabilidad-ui.js
   Última actualización: 2026-03-12
   V1 - Navegación offline + cola Supabase
       Sin bloqueos por Google Drive
   ======================================== */

var contabilidadCarpetas = [];
var contabilidadAnioSeleccionado = null;
var editingCarpetaId = null;
var contabilidadNavStack = [];
var currentDriveFolderId = null;

// Modo offline (usuarios nivel 4 sin Google Drive)
var contabilidadOfflineMode = false;
var offlineMesInfo = null; // { anio, mes, mesNombre, folderId }
var offlineSubcarpeta = null;

var SUBCARPETAS_MES = [
    'Evidencias para materialidad',
    'Facturas emitidas',
    'Facturas proveedores',
    'Pagos proveedores',
    'Repse empresas',
    'Reportes financieros'
];

var MESES_NOMBRES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
    'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ============================================
// MOSTRAR PÁGINA
// ============================================

function showContabilidadPage() {
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.getElementById('contabilidadPage').classList.add('active');
    currentSubContext = 'admin-contabilidad';
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.add('fullwidth');
    contabilidadNavStack = [];
    currentDriveFolderId = null;
    contabilidadOfflineMode = false;
    offlineMesInfo = null;
    offlineSubcarpeta = null;
    loadContabilidadCarpetas();
}

async function loadContabilidadCarpetas() {
    try {
        var res = await supabaseClient
            .from('contabilidad_carpetas')
            .select('*')
            .order('anio', { ascending: false })
            .order('mes', { ascending: true });
        if (res.error) throw res.error;
        contabilidadCarpetas = res.data || [];
        if (document.getElementById('contabilidadPage').classList.contains('active')) {
            renderContabilidadContent();
        }
        setTimeout(checkAutoCreateNextYear, 2000);
    } catch (e) {
        console.error('Error cargando contabilidad:', e);
    }
}

// ============================================
// RENDER PRINCIPAL
// ============================================

function renderContabilidadContent() {
    var connected = isGoogleConnected();

    // Barra de conexión: solo informativa, nunca bloquea
    var connectBar = document.getElementById('gdriveConnectBar');
    if (!connected) {
        connectBar.style.display = 'flex';
        connectBar.innerHTML = '<span style="font-size:0.85rem; color:var(--text-light);">Google Drive no conectado</span>'
            + (currentUser && currentUser.nivel === 1
                ? ' &mdash; <span onclick="googleSignIn()" style="font-size:0.85rem; color:var(--primary); cursor:pointer; text-decoration:underline;">Conectar</span>'
                : '');
    } else {
        connectBar.style.display = 'none';
    }

    document.getElementById('contabilidadSearchBar').style.display = 'block';

    // Drive mode: navegando dentro de carpeta Drive
    if (connected && !contabilidadOfflineMode && contabilidadNavStack.length > 0) {
        renderBreadcrumb();
        navigateToDriveFolder(currentDriveFolderId);
        return;
    }

    // Offline mode: dentro de un mes
    if (contabilidadOfflineMode && offlineMesInfo) {
        if (offlineSubcarpeta) {
            renderBreadcrumbOffline();
            renderSubcarpetaOffline();
        } else {
            renderBreadcrumbOffline();
            renderSubcarpetasList();
        }
        return;
    }

    // Default: años y meses
    var bcDiv = document.getElementById('contabilidadBreadcrumb');
    if (bcDiv) bcDiv.style.display = 'none';
    document.getElementById('contabilidadUploadBtn').style.display = 'none';
    document.getElementById('contabilidadHomeBtn').style.display = 'none';
    renderContabilidadYearsAndMonths();
}

// ============================================
// AÑOS Y MESES
// ============================================

function renderContabilidadYearsAndMonths() {
    var aniosDiv = document.getElementById('contabilidadAnios');
    var contentDiv = document.getElementById('contabilidadContent');
    var connected = isGoogleConnected();
    var anios = [];
    contabilidadCarpetas.forEach(function(c) {
        if (anios.indexOf(c.anio) < 0) anios.push(c.anio);
    });
    anios.sort(function(a, b) { return b - a; });

    if (anios.length === 0) {
        aniosDiv.innerHTML = '';
        var msg = '<p style="color:var(--text-light);">No hay carpetas registradas.</p>';
        if (connected && currentUser && (currentUser.nivel <= 2 || currentUser.nivel === 4)) {
            msg += '<div style="margin-top:0.5rem;"><span onclick="importarAniosExistentes()" style="font-size:0.85rem;color:var(--primary);cursor:pointer;text-decoration:underline;">Importar a\u00f1os existentes de Google Drive</span></div>';
        }
        contentDiv.innerHTML = msg;
        return;
    }

    if (!contabilidadAnioSeleccionado || anios.indexOf(contabilidadAnioSeleccionado) < 0) {
        contabilidadAnioSeleccionado = anios[0];
    }

    // Botones de año
    aniosDiv.innerHTML = anios.map(function(a) {
        var active = a === contabilidadAnioSeleccionado;
        return '<button onclick="selectContabilidadAnio(' + a + ')" style="padding:0.5rem 1rem;border-radius:6px;border:2px solid ' + (active ? 'var(--primary)' : 'var(--border)') + ';background:' + (active ? 'var(--primary)' : 'white') + ';color:' + (active ? 'white' : 'var(--text)') + ';font-weight:600;font-size:1rem;cursor:pointer;transition:all 0.2s;">' + a + '</button>';
    }).join('');

    var mesesAnio = contabilidadCarpetas.filter(function(c) { return c.anio === contabilidadAnioSeleccionado; });

    if (mesesAnio.length === 0) {
        contentDiv.innerHTML = '<p style="color:var(--text-light);margin-top:1rem;">No hay carpetas para este a\u00f1o.</p>';
        return;
    }

    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.5rem;">';
    mesesAnio.forEach(function(c) {
        var mesNum = String(c.mes).padStart(2, '0');
        var mesNombre = MESES_NOMBRES[c.mes] || ('Mes ' + c.mes);
        var folderId = extractFolderId(c.google_drive_url);
        var clickAction, subLabel;
        if (connected && folderId) {
            clickAction = 'onclick="openMonthFolder(' + c.anio + ',\'' + mesNombre + '\',\'' + folderId + '\')"';
            subLabel = 'Ver contenido';
        } else {
            clickAction = 'onclick="openMonthFolderOffline(' + c.anio + ',' + c.mes + ',\'' + mesNombre + '\',\'' + (folderId || '') + '\')"';
            subLabel = 'Ver carpetas';
        }
        html += '<div ' + clickAction + ' style="background:white;border:1px solid var(--border);border-radius:8px;padding:0.6rem 0.8rem;display:flex;align-items:center;gap:0.5rem;cursor:pointer;transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow=\'0 2px 8px rgba(0,0,0,0.12)\'" onmouseout="this.style.boxShadow=\'none\'">'
            + '<span style="font-size:1.3rem;">&#128193;</span>'
            + '<div><div style="font-weight:600;font-size:0.95rem;">' + mesNum + '. ' + mesNombre + '</div>'
            + '<div style="font-size:0.7rem;color:var(--text-light);">' + subLabel + '</div></div></div>';
    });
    html += '</div>';
    contentDiv.innerHTML = html;

    if (connected && currentUser && (currentUser.nivel <= 2 || currentUser.nivel === 4)) {
        contentDiv.innerHTML += '<div style="margin-top:1rem;text-align:center;display:flex;flex-direction:column;gap:0.4rem;align-items:center;">'
            + '<span onclick="importarAniosExistentes()" style="font-size:0.8rem;color:var(--primary);cursor:pointer;text-decoration:underline;">Importar a\u00f1os existentes de Google Drive</span>'
            + '<span onclick="sincronizarIndiceCompleto()" style="font-size:0.8rem;color:var(--primary);cursor:pointer;text-decoration:underline;">Sincronizar \u00edndice de documentos</span>'
            + '</div>';
    }
}

function selectContabilidadAnio(anio) {
    contabilidadAnioSeleccionado = anio;
    contabilidadNavStack = [];
    currentDriveFolderId = null;
    contabilidadOfflineMode = false;
    offlineMesInfo = null;
    offlineSubcarpeta = null;
    renderContabilidadYearsAndMonths();
}

// ============================================
// MODO OFFLINE — NAVEGACIÓN SIN DRIVE
// ============================================

function openMonthFolderOffline(anio, mes, mesNombre, folderId) {
    contabilidadOfflineMode = true;
    offlineMesInfo = { anio: anio, mes: mes, mesNombre: mesNombre, folderId: folderId };
    offlineSubcarpeta = null;
    document.getElementById('contabilidadHomeBtn').style.display = 'inline';
    renderBreadcrumbOffline();
    renderSubcarpetasList();
}

function renderSubcarpetasList() {
    var contentDiv = document.getElementById('contabilidadContent');
    document.getElementById('contabilidadAnios').style.display = 'none';
    document.getElementById('contabilidadUploadBtn').style.display = 'none';
    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.5rem;">';
    SUBCARPETAS_MES.forEach(function(sub) {
        var s = sub.replace(/'/g, "\\'");
        html += '<div onclick="openSubcarpetaOffline(\'' + s + '\')" style="background:white;border:1px solid var(--border);border-radius:8px;padding:0.6rem 0.8rem;display:flex;align-items:center;gap:0.5rem;cursor:pointer;transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow=\'0 2px 8px rgba(0,0,0,0.12)\'" onmouseout="this.style.boxShadow=\'none\'"><span style="font-size:1.3rem;">&#128193;</span><div style="font-weight:600;font-size:0.9rem;">' + sub + '</div></div>';
    });
    html += '</div>';
    contentDiv.innerHTML = html;
}

function openSubcarpetaOffline(subcarpeta) {
    offlineSubcarpeta = subcarpeta;
    renderBreadcrumbOffline();
    renderSubcarpetaOffline();
}

async function renderSubcarpetaOffline() {
    var contentDiv = document.getElementById('contabilidadContent');
    var anio = offlineMesInfo.anio;
    var mes = offlineMesInfo.mes;
    var subcarpeta = offlineSubcarpeta;
    document.getElementById('contabilidadUploadBtn').style.display = 'inline';
    document.getElementById('contabilidadAnios').style.display = 'none';
    contentDiv.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem;">Cargando...</p>';
    try {
        var driveRes = await supabaseClient.from('contabilidad_documentos').select('*')
            .eq('anio', anio).eq('mes', mes).eq('subcarpeta', subcarpeta).order('nombre', { ascending: true });
        var driveFiles = driveRes.data || [];
        var pendingFiles = await getPendingUploads(anio, mes, subcarpeta);
        var connected = isGoogleConnected();
        var html = '';

        if (pendingFiles.length > 0) {
            html += '<div style="margin-bottom:0.75rem;">';
            html += '<div style="font-size:0.78rem;font-weight:600;color:#92400e;margin-bottom:0.35rem;padding:0.2rem 0.5rem;background:#fffbeb;border-radius:4px;display:inline-block;">&#9203; Pendientes (' + pendingFiles.length + ')</div>';
            html += '<div style="border:1px solid #fde68a;border-radius:8px;overflow:hidden;">';
            pendingFiles.forEach(function(f, i) {
                var icon = getFileIconContab(f.nombre, f.mime_type);
                var size = formatFileSize(f.size_bytes);
                var safePath = f.storage_path.replace(/'/g, "\\'");
                var safeName = f.nombre.replace(/'/g, "\\'");
                var bg = i % 2 === 0 ? 'white' : '#fffdf5';
                html += '<div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.8rem;background:' + bg + ';border-bottom:1px solid #fde68a;flex-wrap:wrap;">'
                    + '<span style="font-size:1.1rem;">' + icon + '</span>'
                    + '<div style="flex:1;min-width:120px;"><div style="font-size:0.88rem;font-weight:500;word-break:break-word;">' + f.nombre + '</div>'
                    + '<div style="font-size:0.72rem;color:#92400e;">por ' + (f.subido_por || '&#8212;') + '</div></div>'
                    + '<span style="font-size:0.75rem;color:var(--text-light);white-space:nowrap;">' + size + '</span>'
                    + '<div style="display:flex;gap:0.3rem;flex-shrink:0;">'
                    + '<button onclick="viewPendingFile(\'' + safePath + '\',\'' + safeName + '\')" style="padding:0.2rem 0.5rem;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.78rem;">Ver</button>'
                    + '<button onclick="deletePendingFile(\'' + f.id + '\',\'' + safePath + '\',\'' + safeName + '\')" style="padding:0.2rem 0.4rem;background:#fee2e2;color:var(--danger);border:none;border-radius:4px;cursor:pointer;font-size:0.78rem;">&#x2715;</button>'
                    + '</div></div>';
            });
            html += '</div></div>';
        }

        if (driveFiles.length > 0) {
            if (pendingFiles.length > 0) {
                html += '<div style="font-size:0.78rem;font-weight:600;color:var(--text-light);margin-bottom:0.35rem;padding:0.2rem 0.5rem;background:var(--bg);border-radius:4px;display:inline-block;">En Google Drive (' + driveFiles.length + ')</div>';
            }
            html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
            driveFiles.forEach(function(f, i) {
                var icon = getFileIconContab(f.nombre, f.mime_type);
                var size = formatFileSize(f.size_bytes);
                var bg = i % 2 === 0 ? 'white' : 'var(--bg)';
                var safeName = f.nombre.replace(/'/g, "\\'");
                var display = f.nombre.length > 60 ? f.nombre.substring(0, 57) + '...' : f.nombre;
                var click = connected && f.google_drive_file_id
                    ? 'onclick="viewDriveFileInline(\'' + f.google_drive_file_id + '\',\'' + safeName + '\')"'
                    : 'onclick="window.open(\'https://drive.google.com/file/d/' + f.google_drive_file_id + '/view\',\'_blank\')"';
                html += '<div ' + click + ' style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.8rem;background:' + bg + ';cursor:pointer;border-bottom:1px solid var(--border);transition:background 0.15s;flex-wrap:wrap;" onmouseover="this.style.background=\'#f0f9ff\'" onmouseout="this.style.background=\'' + bg + '\'">'
                    + '<span style="font-size:1.1rem;">' + icon + '</span>'
                    + '<div style="flex:1;min-width:120px;"><div style="font-size:0.88rem;font-weight:500;word-break:break-word;" title="' + f.nombre + '">' + display + '</div></div>'
                    + '<span style="font-size:0.75rem;color:var(--text-light);white-space:nowrap;">' + size + '</span></div>';
            });
            html += '</div>';
        }

        if (pendingFiles.length === 0 && driveFiles.length === 0) {
            html = '<p style="text-align:center;color:var(--text-light);padding:2rem;">Carpeta vac\u00eda &mdash; usa el <strong>+</strong> para subir documentos</p>';
        }

        contentDiv.innerHTML = html;
    } catch (e) {
        contentDiv.innerHTML = '<p style="text-align:center;color:var(--danger);padding:2rem;">Error: ' + e.message + '</p>';
    }
}

function refreshOfflineSubcarpeta() {
    if (offlineSubcarpeta) renderSubcarpetaOffline();
}

// ============================================
// BREADCRUMB OFFLINE
// ============================================

function renderBreadcrumbOffline() {
    var bcDiv = document.getElementById('contabilidadBreadcrumb');
    if (!bcDiv) return;
    bcDiv.style.display = 'block';
    document.getElementById('contabilidadAnios').style.display = 'none';
    var anio = offlineMesInfo.anio;
    var mesNombre = offlineMesInfo.mesNombre || MESES_NOMBRES[offlineMesInfo.mes] || '';
    var html = '<span onclick="contabilidadGoHome()" style="cursor:pointer;color:var(--primary);font-weight:600;"><span style="background:#fed7d7;padding:0.1rem 0.25rem;border-radius:3px;">&#128193;</span> Contabilidad</span>';
    html += ' <span style="color:var(--text-light);">&rsaquo;</span> ';
    if (offlineSubcarpeta) {
        html += '<span onclick="backToSubcarpetasList()" style="cursor:pointer;color:var(--primary);">' + anio + ' &rsaquo; ' + mesNombre + '</span>';
        html += ' <span style="color:var(--text-light);">&rsaquo;</span> <span style="font-weight:600;color:var(--text);">' + offlineSubcarpeta + '</span>';
    } else {
        html += '<span style="font-weight:600;color:var(--text);">' + anio + ' &rsaquo; ' + mesNombre + '</span>';
    }
    bcDiv.innerHTML = html;
}

function backToSubcarpetasList() {
    offlineSubcarpeta = null;
    document.getElementById('contabilidadUploadBtn').style.display = 'none';
    renderBreadcrumbOffline();
    renderSubcarpetasList();
}

// ============================================
// DRIVE FOLDER NAVIGATION (modo conectado)
// ============================================

function openMonthFolder(anio, mesNombre, folderId) {
    contabilidadOfflineMode = false;
    contabilidadNavStack = [{ label: anio + ' > ' + mesNombre, folderId: null }];
    currentDriveFolderId = folderId;
    renderBreadcrumb();
    navigateToDriveFolder(folderId);
}

function openDriveSubfolder(name, folderId) {
    contabilidadNavStack.push({ label: name, folderId: currentDriveFolderId });
    currentDriveFolderId = folderId;
    renderBreadcrumb();
    navigateToDriveFolder(folderId);
}

function contabilidadGoHome() {
    contabilidadOfflineMode = false;
    offlineMesInfo = null;
    offlineSubcarpeta = null;
    navigateBackTo(-1);
}

function navigateBackTo(index) {
    if (index < 0) {
        contabilidadNavStack = [];
        currentDriveFolderId = null;
        contabilidadOfflineMode = false;
        offlineMesInfo = null;
        offlineSubcarpeta = null;
        var bcDiv = document.getElementById('contabilidadBreadcrumb');
        if (bcDiv) bcDiv.style.display = 'none';
        document.getElementById('contabilidadUploadBtn').style.display = 'none';
        document.getElementById('contabilidadHomeBtn').style.display = 'none';
        document.getElementById('contabilidadAnios').style.display = 'flex';
        document.getElementById('contabilidadSearchInput').value = '';
        renderContabilidadYearsAndMonths();
        return;
    }
    var target = contabilidadNavStack[index];
    contabilidadNavStack = contabilidadNavStack.slice(0, index + 1);
    if (index === 0) {
        var found = null;
        for (var i = 0; i < contabilidadCarpetas.length; i++) {
            var c = contabilidadCarpetas[i];
            var label = c.anio + ' > ' + (MESES_NOMBRES[c.mes] || '');
            if (label === target.label) { found = c; break; }
        }
        currentDriveFolderId = found ? extractFolderId(found.google_drive_url) : currentDriveFolderId;
    } else {
        currentDriveFolderId = contabilidadNavStack[index - 1] ? contabilidadNavStack[index - 1].folderId : currentDriveFolderId;
    }
    renderBreadcrumb();
    navigateToDriveFolder(currentDriveFolderId);
}

function renderBreadcrumb() {
    var bcDiv = document.getElementById('contabilidadBreadcrumb');
    if (!bcDiv) return;
    bcDiv.style.display = 'block';
    document.getElementById('contabilidadAnios').style.display = 'none';
    var html = '<span onclick="navigateBackTo(-1)" style="cursor:pointer;color:var(--primary);font-weight:600;"><span style="background:#fed7d7;padding:0.1rem 0.25rem;border-radius:3px;">&#128193;</span> Contabilidad</span>';
    contabilidadNavStack.forEach(function(item, i) {
        html += ' <span style="color:var(--text-light);">&rsaquo;</span> ';
        if (i < contabilidadNavStack.length - 1) {
            html += '<span onclick="navigateBackTo(' + i + ')" style="cursor:pointer;color:var(--primary);">' + item.label + '</span>';
        } else {
            html += '<span style="font-weight:600;color:var(--text);">' + item.label + '</span>';
        }
    });
    bcDiv.innerHTML = html;
}

async function navigateToDriveFolder(folderId) {
    var contentDiv = document.getElementById('contabilidadContent');
    contentDiv.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem;">Cargando...</p>';
    document.getElementById('contabilidadHomeBtn').style.display = 'inline';
    try {
        var result = await listDriveFolder(folderId);
        var folders = result.folders;
        var files = result.files;
        document.getElementById('contabilidadUploadBtn').style.display = folders.length === 0 ? 'inline' : 'none';
        var html = '';
        if (folders.length > 0) {
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.5rem;margin-bottom:1rem;">';
            folders.forEach(function(f) {
                html += '<div onclick="openDriveSubfolder(\'' + f.name.replace(/'/g, "\\'") + '\',\'' + f.id + '\')" style="background:white;border:1px solid var(--border);border-radius:8px;padding:0.6rem 0.8rem;display:flex;align-items:center;gap:0.5rem;cursor:pointer;transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow=\'0 2px 8px rgba(0,0,0,0.12)\'" onmouseout="this.style.boxShadow=\'none\'"><span style="font-size:1.3rem;">&#128193;</span><div style="font-weight:600;font-size:0.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + f.name + '</div></div>';
            });
            html += '</div>';
        }
        if (files.length > 0) {
            html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
            files.forEach(function(f, i) {
                var icon = getFileIconContab(f.name, f.mimeType);
                var size = formatFileSize(f.size);
                var bg = i % 2 === 0 ? 'white' : 'var(--bg)';
                html += '<div onclick="viewDriveFileInline(\'' + f.id + '\',\'' + f.name.replace(/'/g, "\\'") + '\')" style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.8rem;background:' + bg + ';cursor:pointer;border-bottom:1px solid var(--border);transition:background 0.15s;flex-wrap:wrap;" onmouseover="this.style.background=\'#f0f9ff\'" onmouseout="this.style.background=\'' + bg + '\'">'
                    + '<span style="font-size:1.1rem;">' + icon + '</span>'
                    + '<div style="flex:1;min-width:150px;"><div style="font-size:0.88rem;font-weight:500;word-break:break-word;">' + f.name + '</div></div>'
                    + '<span style="font-size:0.75rem;color:var(--text-light);white-space:nowrap;">' + size + '</span></div>';
            });
            html += '</div>';
        }
        if (folders.length === 0 && files.length === 0) {
            html = '<p style="text-align:center;color:var(--text-light);padding:2rem;">Carpeta vac\u00eda</p>';
        }
        contentDiv.innerHTML = html;
        if (files.length > 0 && contabilidadNavStack.length >= 2) indexFilesToSupabase(files);
    } catch (e) {
        contentDiv.innerHTML = '<p style="text-align:center;color:var(--danger);padding:2rem;">Error: ' + e.message + '</p>';
    }
}

function getFileIconContab(name, mimeType) {
    var ext = (name || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return '&#128196;';
    if (['xls','xlsx','csv'].indexOf(ext) >= 0) return '&#128202;';
    if (['doc','docx'].indexOf(ext) >= 0) return '&#128221;';
    if (['jpg','jpeg','png','gif'].indexOf(ext) >= 0) return '&#128444;&#65039;';
    if (mimeType && mimeType.includes('spreadsheet')) return '&#128202;';
    if (mimeType && mimeType.includes('document')) return '&#128221;';
    return '&#128206;';
}

// ============================================
// SUBIR ARCHIVO
// ============================================

function uploadToCurrentFolder() {
    var connected = isGoogleConnected();

    // Sin Drive (offline) o modo offline activo → Supabase Storage
    if (!connected || contabilidadOfflineMode) {
        if (!offlineSubcarpeta || !offlineMesInfo) {
            alert('Navega a una subcarpeta primero para subir documentos.');
            return;
        }
        _uploadOfflineFiles();
        return;
    }

    // Drive conectado → subir directo a Drive
    if (!currentDriveFolderId) { alert('Navega a una carpeta primero'); return; }

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.xlsx,.xls,.doc,.docx,.csv,.jpg,.jpeg,.png';
    input.multiple = true;
    input.onchange = async function() {
        if (!input.files.length) return;
        showLoading();
        try {
            var pathLabel = contabilidadNavStack[0] ? contabilidadNavStack[0].label : '';
            var parts = pathLabel.split(' > ');
            var anio = parseInt(parts[0]) || 0;
            var mesNombre = (parts[1] || '').trim();
            var mesNum = MESES_NOMBRES.indexOf(mesNombre);
            var subcarpeta = contabilidadNavStack.length >= 2 ? contabilidadNavStack[1].label : '';
            for (var i = 0; i < input.files.length; i++) {
                var file = input.files[i];
                var result = await uploadFileToDrive(file, currentDriveFolderId);
                if (result && result.id && anio && mesNum > 0 && subcarpeta) {
                    await supabaseClient.from('contabilidad_documentos').insert([{
                        nombre: file.name, anio: anio, mes: mesNum, subcarpeta: subcarpeta,
                        google_drive_file_id: result.id, size_bytes: file.size || 0, mime_type: file.type || ''
                    }]);
                }
            }
            await navigateToDriveFolder(currentDriveFolderId);
        } catch (e) {
            alert('Error al subir: ' + e.message);
        } finally {
            hideLoading();
        }
    };
    input.click();
}

function _uploadOfflineFiles() {
    var anio = offlineMesInfo.anio;
    var mes = offlineMesInfo.mes;
    var folderId = offlineMesInfo.folderId;
    var subcarpeta = offlineSubcarpeta;
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.xlsx,.xls,.doc,.docx,.csv,.jpg,.jpeg,.png';
    input.multiple = true;
    input.onchange = async function() {
        if (!input.files.length) return;
        showLoading();
        var errors = [];
        try {
            for (var i = 0; i < input.files.length; i++) {
                try {
                    await uploadFilePendiente(input.files[i], anio, mes, subcarpeta, folderId);
                } catch (e) {
                    errors.push(input.files[i].name + ': ' + e.message);
                }
            }
            if (errors.length > 0) alert('Algunos archivos no se pudieron guardar:\n' + errors.join('\n'));
            await renderSubcarpetaOffline();
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            hideLoading();
        }
    };
    input.click();
}

// ============================================
// BÚSQUEDA
// ============================================

async function searchContabilidadDocs() {
    var term = document.getElementById('contabilidadSearchInput').value.trim();
    if (!term) return;
    var contentDiv = document.getElementById('contabilidadContent');
    contentDiv.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem;">Buscando...</p>';
    document.getElementById('contabilidadAnios').style.display = 'none';
    var bcDiv = document.getElementById('contabilidadBreadcrumb');
    if (bcDiv) {
        bcDiv.style.display = 'block';
        bcDiv.innerHTML = '<span onclick="navigateBackTo(-1)" style="cursor:pointer;color:var(--primary);font-weight:600;"><span style="background:#fed7d7;padding:0.1rem 0.25rem;border-radius:3px;">&#128193;</span> Contabilidad</span> <span style="color:var(--text-light);">&rsaquo;</span> <span style="font-weight:600;">B\u00fasqueda: &ldquo;' + term + '&rdquo;</span>';
    }
    document.getElementById('contabilidadUploadBtn').style.display = 'none';
    document.getElementById('contabilidadHomeBtn').style.display = 'inline';

    try {
        var connected = isGoogleConnected();
        var driveRes = await supabaseClient.from('contabilidad_documentos').select('*').ilike('nombre', '%' + term + '%').order('anio', { ascending: false }).order('mes', { ascending: true }).limit(50);
        var results = driveRes.data || [];
        var pendingRes = await supabaseClient.from('uploads_pendientes').select('*').ilike('nombre', '%' + term + '%').eq('sincronizado', false).order('created_at', { ascending: false }).limit(20);
        var pending = pendingRes.data || [];

        if (results.length === 0 && pending.length === 0) {
            contentDiv.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem;">No se encontraron documentos con &ldquo;' + term + '&rdquo;</p>';
            return;
        }

        var html = '';
        if (pending.length > 0) {
            html += '<div style="margin-bottom:0.75rem;"><div style="font-size:0.78rem;font-weight:600;color:#92400e;margin-bottom:0.35rem;">&#9203; Pendientes (' + pending.length + ')</div><div style="border:1px solid #fde68a;border-radius:8px;overflow:hidden;">';
            pending.forEach(function(f, i) {
                var safePath = f.storage_path.replace(/'/g, "\\'");
                var safeName = f.nombre.replace(/'/g, "\\'");
                var bg = i % 2 === 0 ? 'white' : '#fffdf5';
                html += '<div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.8rem;background:' + bg + ';border-bottom:1px solid #fde68a;flex-wrap:wrap;">'
                    + '<span style="font-size:1.1rem;">' + getFileIconContab(f.nombre, f.mime_type) + '</span>'
                    + '<div style="flex:1;min-width:120px;"><div style="font-size:0.88rem;font-weight:500;">' + f.nombre + '</div>'
                    + '<span style="font-size:0.72rem;color:#92400e;">' + (MESES_NOMBRES[f.mes] || '') + ' ' + f.anio + ' &rsaquo; ' + f.subcarpeta + '</span></div>'
                    + '<span style="font-size:0.75rem;color:var(--text-light);">' + formatFileSize(f.size_bytes) + '</span>'
                    + '<button onclick="viewPendingFile(\'' + safePath + '\',\'' + safeName + '\')" style="padding:0.2rem 0.5rem;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.78rem;">Ver</button></div>';
            });
            html += '</div></div>';
        }

        if (results.length > 0) {
            if (pending.length > 0) html += '<div style="font-size:0.78rem;font-weight:600;color:var(--text-light);margin-bottom:0.35rem;">En Drive (' + results.length + ')</div>';
            html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
            results.forEach(function(doc, i) {
                var bg = i % 2 === 0 ? 'white' : 'var(--bg)';
                var display = doc.nombre.length > 60 ? doc.nombre.substring(0, 57) + '...' : doc.nombre;
                var safeName = doc.nombre.replace(/'/g, "\\'");
                var click = connected && doc.google_drive_file_id
                    ? 'onclick="viewDriveFileInline(\'' + doc.google_drive_file_id + '\',\'' + safeName + '\')"'
                    : 'onclick="window.open(\'https://drive.google.com/file/d/' + doc.google_drive_file_id + '/view\',\'_blank\')"';
                html += '<div ' + click + ' style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.8rem;background:' + bg + ';cursor:pointer;border-bottom:1px solid var(--border);transition:background 0.15s;flex-wrap:wrap;" onmouseover="this.style.background=\'#f0f9ff\'" onmouseout="this.style.background=\'' + bg + '\'">'
                    + '<span style="font-size:1.1rem;">' + getFileIconContab(doc.nombre, doc.mime_type) + '</span>'
                    + '<div style="flex:1;min-width:120px;"><div style="font-size:0.88rem;font-weight:500;word-break:break-word;" title="' + doc.nombre + '">' + display + '</div></div>'
                    + '<div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">'
                    + '<span style="font-size:0.72rem;color:var(--primary);white-space:nowrap;">' + (MESES_NOMBRES[doc.mes] || '') + ' ' + doc.anio + '</span>'
                    + '<span style="font-size:0.72rem;color:var(--text-light);white-space:nowrap;">' + doc.subcarpeta + '</span>'
                    + '<span style="font-size:0.72rem;color:var(--text-light);white-space:nowrap;">' + formatFileSize(doc.size_bytes) + '</span>'
                    + '</div></div>';
            });
            html += '</div>';
        }
        contentDiv.innerHTML = html;
    } catch (e) {
        contentDiv.innerHTML = '<p style="text-align:center;color:var(--danger);padding:2rem;">Error: ' + e.message + '</p>';
    }
}

// ============================================
// INDEX FILES EN SUPABASE (background)
// ============================================

async function indexFilesToSupabase(files) {
    var pathLabel = contabilidadNavStack[0] ? contabilidadNavStack[0].label : '';
    var parts = pathLabel.split(' > ');
    var anio = parseInt(parts[0]) || 0;
    var mesNombre = (parts[1] || '').trim();
    var mesNum = MESES_NOMBRES.indexOf(mesNombre);
    if (mesNum < 1) mesNum = 0;
    var subcarpeta = contabilidadNavStack.length >= 2 ? contabilidadNavStack[1].label : '';
    if (!anio || !mesNum || !subcarpeta) return;
    for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (f.mimeType === 'application/vnd.google-apps.folder') continue;
        try {
            var existing = await supabaseClient.from('contabilidad_documentos').select('id').eq('google_drive_file_id', f.id).limit(1);
            if (existing.data && existing.data.length > 0) continue;
            await supabaseClient.from('contabilidad_documentos').insert([{
                nombre: f.name, anio: anio, mes: mesNum, subcarpeta: subcarpeta,
                google_drive_file_id: f.id, size_bytes: parseInt(f.size) || 0, mime_type: f.mimeType || ''
            }]);
        } catch (e) { /* silent */ }
    }
}

// ============================================
// CREAR ESTRUCTURA AÑO EN DRIVE
// ============================================

function showCrearEstructuraAnio() {
    if (!isGoogleConnected()) { alert('Conecta con Google Drive primero'); return; }
    if (!contabilidadCarpetas[0]) { alert('Primero agrega al menos un mes manualmente.'); return; }
    var anioSig = new Date().getFullYear() + 1;
    var anio = prompt('Qué año quieres crear?', anioSig);
    if (!anio || isNaN(anio)) return;
    if (contabilidadCarpetas.some(function(c) { return c.anio === parseInt(anio); })) {
        if (!confirm('Ya existen carpetas para ' + anio + '. Crear meses faltantes?')) return;
    }
    crearEstructuraAnio(parseInt(anio));
}

async function crearEstructuraAnio(anio) {
    if (!isGoogleConnected()) { alert('Conecta con Google Drive primero'); return; }
    showLoading();
    try {
        var existingFolderId = extractFolderId(contabilidadCarpetas[0].google_drive_url);
        var r1 = await (await fetch('https://www.googleapis.com/drive/v3/files/' + existingFolderId + '?fields=parents&key=' + GOOGLE_API_KEY, { headers: { 'Authorization': 'Bearer ' + gdriveAccessToken } })).json();
        var yearFolderParent = r1.parents ? r1.parents[0] : null;
        if (!yearFolderParent) throw new Error('No se pudo encontrar la carpeta padre');
        var r2 = await (await fetch('https://www.googleapis.com/drive/v3/files/' + yearFolderParent + '?fields=parents&key=' + GOOGLE_API_KEY, { headers: { 'Authorization': 'Bearer ' + gdriveAccessToken } })).json();
        var rootFolderId = r2.parents ? r2.parents[0] : yearFolderParent;
        var q = "name = '" + anio + "' and '" + rootFolderId + "' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
        var r3 = await (await fetch('https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent(q) + '&fields=files(id,name)&key=' + GOOGLE_API_KEY, { headers: { 'Authorization': 'Bearer ' + gdriveAccessToken } })).json();
        var yearFolder = (r3.files && r3.files.length > 0) ? r3.files[0] : await createDriveFolder(String(anio), rootFolderId);
        var existingMeses = contabilidadCarpetas.filter(function(c) { return c.anio === anio; }).map(function(c) { return c.mes; });
        for (var mes = 1; mes <= 12; mes++) {
            if (existingMeses.indexOf(mes) >= 0) continue;
            var mf = await createDriveFolder(String(mes).padStart(2,'0') + '. ' + MESES_NOMBRES[mes].toUpperCase(), yearFolder.id);
            for (var s = 0; s < SUBCARPETAS_MES.length; s++) await createDriveFolder(SUBCARPETAS_MES[s], mf.id);
            await supabaseClient.from('contabilidad_carpetas').insert([{
                anio: anio, mes: mes, nombre_mes: MESES_NOMBRES[mes],
                google_drive_url: 'https://drive.google.com/drive/folders/' + mf.id
            }]);
        }
        alert('Estructura de ' + anio + ' creada exitosamente');
        await loadContabilidadCarpetas();
    } catch (e) {
        alert('Error: ' + e.message);
    } finally {
        hideLoading();
    }
}

function checkAutoCreateNextYear() {
    if (new Date().getMonth() >= 10) {
        var nextYear = new Date().getFullYear() + 1;
        if (!contabilidadCarpetas.some(function(c) { return c.anio === nextYear; }) && isGoogleConnected()) {
            crearEstructuraAnio(nextYear);
        }
    }
}

async function importarAniosExistentes() {
    if (!isGoogleConnected()) { alert('Conecta con Google Drive primero'); return; }
    if (!contabilidadCarpetas.length) { alert('Primero agrega al menos un mes manualmente.'); return; }
    if (!confirm('Esto escaneará tu Google Drive y registrará todos los años/meses. ¿Continuar?')) return;
    showLoading();
    try {
        var monthFolderId = extractFolderId(contabilidadCarpetas[0].google_drive_url);
        var mi = await (await fetch('https://www.googleapis.com/drive/v3/files/' + monthFolderId + '?fields=parents&key=' + GOOGLE_API_KEY, { headers: { 'Authorization': 'Bearer ' + gdriveAccessToken } })).json();
        var yearFolderId = mi.parents ? mi.parents[0] : null;
        if (!yearFolderId) throw new Error('No se pudo encontrar la carpeta del año');
        var yi = await (await fetch('https://www.googleapis.com/drive/v3/files/' + yearFolderId + '?fields=parents&key=' + GOOGLE_API_KEY, { headers: { 'Authorization': 'Bearer ' + gdriveAccessToken } })).json();
        var rootFolderId = yi.parents ? yi.parents[0] : null;
        if (!rootFolderId) throw new Error('No se pudo encontrar la carpeta raiz');
        var yearFolders = (await listDriveFolder(rootFolderId)).folders.filter(function(f) { return /^\d{4}$/.test(f.name); });
        var totalImported = 0, totalSkipped = 0;
        for (var y = 0; y < yearFolders.length; y++) {
            var yf = yearFolders[y];
            var anio = parseInt(yf.name);
            var monthFolders = (await listDriveFolder(yf.id)).folders;
            for (var m = 0; m < monthFolders.length; m++) {
                var mf = monthFolders[m];
                var mm = mf.name.match(/^(\d{1,2})/);
                if (!mm) continue;
                var mesNum = parseInt(mm[1]);
                if (mesNum < 1 || mesNum > 12) continue;
                if (contabilidadCarpetas.some(function(c) { return c.anio === anio && c.mes === mesNum; })) { totalSkipped++; continue; }
                var r = await supabaseClient.from('contabilidad_carpetas').insert([{
                    anio: anio, mes: mesNum, nombre_mes: MESES_NOMBRES[mesNum],
                    google_drive_url: 'https://drive.google.com/drive/folders/' + mf.id
                }]);
                if (!r.error) totalImported++;
            }
        }
        alert('Importacion completada!\n\n' + totalImported + ' meses importados\n' + totalSkipped + ' ya existian');
        await loadContabilidadCarpetas();
    } catch (e) {
        alert('Error: ' + e.message);
    } finally {
        hideLoading();
    }
}

async function sincronizarIndiceCompleto() {
    if (!isGoogleConnected()) { alert('Conecta con Google Drive primero'); return; }
    if (!confirm('Esto escaneará todas las carpetas en Drive. ¿Continuar?')) return;
    showLoading();
    var totalIndexed = 0, totalSkipped = 0;
    try {
        for (var c = 0; c < contabilidadCarpetas.length; c++) {
            var carpeta = contabilidadCarpetas[c];
            var mfId = extractFolderId(carpeta.google_drive_url);
            if (!mfId) continue;
            var subs = (await listDriveFolder(mfId)).folders;
            for (var s = 0; s < subs.length; s++) {
                var filesList = (await listDriveFolder(subs[s].id)).files;
                for (var f = 0; f < filesList.length; f++) {
                    var file = filesList[f];
                    if (file.mimeType === 'application/vnd.google-apps.folder') continue;
                    var ex = await supabaseClient.from('contabilidad_documentos').select('id').eq('google_drive_file_id', file.id).limit(1);
                    if (ex.data && ex.data.length > 0) { totalSkipped++; continue; }
                    var ins = await supabaseClient.from('contabilidad_documentos').insert([{
                        nombre: file.name, anio: carpeta.anio, mes: carpeta.mes, subcarpeta: subs[s].name,
                        google_drive_file_id: file.id, size_bytes: parseInt(file.size) || 0, mime_type: file.mimeType || ''
                    }]);
                    if (!ins.error) totalIndexed++;
                }
            }
        }
        alert('Sincronizacion completada!\n\n' + totalIndexed + ' indexados\n' + totalSkipped + ' ya existian');
    } catch (e) {
        alert('Error: ' + e.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// CARPETA CRUD
// ============================================

function showAddCarpetaModal() {
    editingCarpetaId = null;
    document.getElementById('addCarpetaTitle').textContent = 'Agregar Carpeta';
    document.getElementById('carpetaAnio').value = new Date().getFullYear();
    document.getElementById('carpetaMes').value = '';
    document.getElementById('carpetaURL').value = '';
    document.getElementById('addCarpetaModal').classList.add('active');
}

function editCarpetaContabilidad(id) {
    var c = contabilidadCarpetas.find(function(x) { return x.id === id; });
    if (!c) return;
    editingCarpetaId = id;
    document.getElementById('addCarpetaTitle').textContent = 'Editar Carpeta';
    document.getElementById('carpetaAnio').value = c.anio;
    document.getElementById('carpetaMes').value = c.mes;
    document.getElementById('carpetaURL').value = c.google_drive_url;
    document.getElementById('addCarpetaModal').classList.add('active');
}

async function saveCarpetaContabilidad(event) {
    event.preventDefault();
    showLoading();
    var mes = parseInt(document.getElementById('carpetaMes').value);
    var data = {
        anio: parseInt(document.getElementById('carpetaAnio').value),
        mes: mes, nombre_mes: MESES_NOMBRES[mes] || '',
        google_drive_url: document.getElementById('carpetaURL').value.trim()
    };
    try {
        var r = editingCarpetaId
            ? await supabaseClient.from('contabilidad_carpetas').update(data).eq('id', editingCarpetaId)
            : await supabaseClient.from('contabilidad_carpetas').insert([data]);
        if (r.error) throw r.error;
        closeModal('addCarpetaModal');
        contabilidadAnioSeleccionado = data.anio;
        await loadContabilidadCarpetas();
    } catch (e) {
        alert('Error: ' + e.message);
    } finally {
        hideLoading();
    }
}

async function deleteCarpetaContabilidad(id, label) {
    if (!confirm('Eliminar carpeta ' + label + '?')) return;
    showLoading();
    try {
        var r = await supabaseClient.from('contabilidad_carpetas').delete().eq('id', id);
        if (r.error) throw r.error;
        await loadContabilidadCarpetas();
    } catch (e) {
        alert('Error: ' + e.message);
    } finally {
        hideLoading();
    }
}

console.log('CONTABILIDAD-UI.JS V1 cargado');

/* ========================================
   ADMIN-UI.JS - Admin Interface Functions
   ======================================== */

// ============================================
// ADMIN - VIEWS
// ============================================

function showAdminView(view) {
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    currentSubContext = 'admin-' + view;
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
    
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    if (view === 'usuarios') {
        document.getElementById('adminUsuariosPage').classList.add('active');
        ensureUsuariosLoaded().then(() => renderUsuariosTable());
    } else if (view === 'bancos') {
        document.getElementById('adminBancosPage').classList.add('active');
        ensureBancosLoaded().then(() => renderBancosTable());
    }
}

function showActivosPage() {
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('activosPage').classList.add('active');
    
    currentSubContext = 'admin-activos';
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
    
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    ensureActivosLoaded().then(() => renderActivosTable());
}

function showNumerosPage() {
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('numerosPage').classList.add('active');
    
    currentSubContext = 'admin-numeros';
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
    
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    ensureInquilinosFullLoaded().then(() => {
        ensureProveedoresFullLoaded().then(() => {
            updateHomeView();
        });
    });
}

// ============================================
// NÚMEROS PAGE (HOME)
// ============================================

function toggleHomeTable(tableName) {
    const ingresosContainer = document.getElementById('homeIngresosContainer');
    const pagosContainer = document.getElementById('homePagosContainer');
    
    if (currentHomeTable === tableName) {
        ingresosContainer.classList.add('hidden');
        pagosContainer.classList.add('hidden');
        currentHomeTable = null;
    } else {
        if (tableName === 'ingresos') {
            ingresosContainer.classList.remove('hidden');
            pagosContainer.classList.add('hidden');
            renderHomeIngresos();
        } else if (tableName === 'pagos') {
            ingresosContainer.classList.add('hidden');
            pagosContainer.classList.remove('hidden');
            renderHomePagosDetalle();
        }
        currentHomeTable = tableName;
    }
}

function updateHomeView() {
    const filterType = document.getElementById('homeFilter').value;
    const year = parseInt(document.getElementById('homeYear').value);
    const monthSelect = document.getElementById('homeMonth');
    
    if (filterType === 'mensual') {
        monthSelect.classList.remove('hidden');
    } else {
        monthSelect.classList.add('hidden');
    }
    
    const month = filterType === 'mensual' ? parseInt(monthSelect.value) : null;
    let totalIngresos = 0;
    let totalGastos = 0;
    
    inquilinos.forEach(inq => {
        if (inq.pagos) {
            inq.pagos.forEach(pago => {
                const pd = new Date(pago.fecha + 'T00:00:00');
                if (pd.getFullYear() === year && (month === null || pd.getMonth() === month)) {
                    totalIngresos += pago.monto;
                }
            });
        }
    });
    
    proveedores.forEach(prov => {
        if (prov.facturas) {
            prov.facturas.forEach(fact => {
                if (fact.fecha_pago) {
                    const pd = new Date(fact.fecha_pago + 'T00:00:00');
                    if (pd.getFullYear() === year && (month === null || pd.getMonth() === month)) {
                        totalGastos += fact.monto;
                    }
                }
            });
        }
    });
    
    document.getElementById('summaryIngresos').textContent = formatCurrency(totalIngresos);
    document.getElementById('summaryGastos').textContent = formatCurrency(totalGastos);
    document.getElementById('summaryNeto').textContent = formatCurrency(totalIngresos - totalGastos);
    
    if (currentHomeTable === 'ingresos') {
        renderHomeIngresos();
    } else if (currentHomeTable === 'pagos') {
        renderHomePagosDetalle();
    }
}

function renderHomeIngresos() {
    const filterType = document.getElementById('homeFilter').value;
    const year = parseInt(document.getElementById('homeYear').value);
    const month = filterType === 'mensual' ? parseInt(document.getElementById('homeMonth').value) : null;
    
    const tbody = document.getElementById('homeIngresosTable').querySelector('tbody');
    tbody.innerHTML = '';
    const pagos = [];
    let total = 0;
    
    inquilinos.forEach(inq => {
        if (inq.pagos) {
            inq.pagos.forEach(pago => {
                const pd = new Date(pago.fecha + 'T00:00:00');
                if (pd.getFullYear() === year && (month === null || pd.getMonth() === month)) {
                    pagos.push({
                        inquilino: inq.nombre,
                        inquilinoId: inq.id,
                        fecha: pago.fecha,
                        monto: pago.monto
                    });
                    total += pago.monto;
                }
            });
        }
    });
    
    pagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    pagos.forEach(p => {
        tbody.innerHTML += `
            <tr class="clickable" style="cursor: pointer;" onclick="showInquilinoDetail(${p.inquilinoId})">
                <td>${p.inquilino}</td>
                <td>${formatDate(p.fecha)}</td>
                <td class="currency">${formatCurrency(p.monto)}</td>
            </tr>
        `;
    });
    
    if (pagos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay ingresos</td></tr>';
    } else {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        if (filterType === 'mensual') {
            tbody.innerHTML += `<tr style="font-weight:bold;background:#e6f2ff"><td colspan="2" style="text-align:right;padding:1rem;font-size:1.1rem">TOTAL ${monthNames[month].toUpperCase()} ${year}:</td><td class="currency" style="color:var(--primary);font-size:1.2rem">${formatCurrency(total)}</td></tr>`;
        }
        
        let totalAnual = 0;
        inquilinos.forEach(inq => {
            if (inq.pagos) {
                inq.pagos.forEach(pago => {
                    const pd = new Date(pago.fecha + 'T00:00:00');
                    if (pd.getFullYear() === year) {
                        totalAnual += pago.monto;
                    }
                });
            }
        });
        
        tbody.innerHTML += `<tr style="font-weight:bold;background:#d4edda"><td colspan="2" style="text-align:right;padding:1rem;font-size:1.1rem">TOTAL ${year}:</td><td class="currency" style="color:var(--success);font-size:1.2rem">${formatCurrency(totalAnual)}</td></tr>`;
    }
}

function renderHomePagosDetalle() {
    const filterType = document.getElementById('homeFilter').value;
    const year = parseInt(document.getElementById('homeYear').value);
    const month = filterType === 'mensual' ? parseInt(document.getElementById('homeMonth').value) : null;
    
    const tbody = document.getElementById('homePagosTable').querySelector('tbody');
    tbody.innerHTML = '';
    const pagos = [];
    let total = 0;
    
    proveedores.forEach(prov => {
        if (prov.facturas) {
            prov.facturas.forEach(fact => {
                if (fact.fecha_pago) {
                    const pd = new Date(fact.fecha_pago + 'T00:00:00');
                    if (pd.getFullYear() === year && (month === null || pd.getMonth() === month)) {
                        pagos.push({
                            proveedor: prov.nombre,
                            proveedorId: prov.id,
                            fecha: fact.fecha_pago,
                            monto: fact.monto
                        });
                        total += fact.monto;
                    }
                }
            });
        }
    });
    
    pagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const isMobile = window.innerWidth <= 768;
    pagos.forEach(p => {
        const proveedorText = isMobile && p.proveedor.length > 22 ? p.proveedor.substring(0, 22) + '...' : p.proveedor;
        tbody.innerHTML += `
            <tr class="clickable" style="cursor: pointer;" onclick="showProveedorDetail(${p.proveedorId})">
                <td class="proveedor-truncate">${proveedorText}</td>
                <td>${formatDate(p.fecha)}</td>
                <td class="currency">${formatCurrency(p.monto)}</td>
            </tr>
        `;
    });
    
    if (pagos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay pagos</td></tr>';
    } else {
        tbody.innerHTML += `<tr class="total-row"><td colspan="2" style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(total)}</strong></td></tr>`;
    }
}

// ============================================
// USUARIOS
// ============================================

function renderUsuariosTable() {
    const tbody = document.getElementById('usuariosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    usuarios.forEach(u => {
        const estadoBadge = u.activo 
            ? '<span class="badge badge-success">Activo</span>' 
            : '<span class="badge badge-danger">Inactivo</span>';
        tbody.innerHTML += `
            <tr style="cursor: pointer;" onclick="showUsuarioDetail(${u.id})">
                <td>${u.nombre}</td>
                <td>••••••••</td>
                <td>${estadoBadge}</td>
            </tr>
        `;
    });
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay usuarios</td></tr>';
    }
}

function showUsuarioDetail(id) {
    const usuario = usuarios.find(u => u.id === id);
    currentUsuarioId = id;
    isEditMode = true;
    
    document.getElementById('addUsuarioTitle').textContent = 'Editar Usuario';
    document.getElementById('usuarioNombre').value = usuario.nombre;
    document.getElementById('usuarioPassword').value = usuario.password;
    document.getElementById('addUsuarioModal').classList.add('active');
}

// ============================================
// BANCOS
// ============================================

function renderBancosTable() {
    const tbody = document.getElementById('bancosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    bancosDocumentos.forEach(b => {
        tbody.innerHTML += `
            <tr class="banco-clickable" onclick="viewDocumento('${b.archivo_pdf}')">
                <td>${b.tipo || 'Documento'}</td>
                <td>${formatDate(b.fecha_subida)}</td>
            </tr>
        `;
    });
    
    if (bancosDocumentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--text-light)">No hay documentos</td></tr>';
    }
}

// ============================================
// ACTIVOS
// ============================================

function renderActivosTable() {
    const tbody = document.getElementById('activosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    activos.forEach(act => {
        tbody.innerHTML += `
            <tr style="cursor: pointer;" onclick="showActivoDetail(${act.id})">
                <td>${act.nombre}</td>
                <td>${formatDate(act.ultimo_mant)}</td>
                <td>${formatDate(act.proximo_mant)}</td>
                <td>${act.proveedor || '-'}</td>
            </tr>
        `;
    });
    
    if (activos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light)">No hay activos</td></tr>';
    }
}

function showActivoDetail(id) {
    const act = activos.find(a => a.id === id);
    currentActivoId = id;
    
    document.getElementById('activoDetailNombre').textContent = act.nombre;
    document.getElementById('detailUltimoMant').textContent = formatDate(act.ultimo_mant);
    document.getElementById('detailProximoMant').textContent = formatDate(act.proximo_mant);
    document.getElementById('detailActivoProveedor').textContent = act.proveedor || '-';
    document.getElementById('detailActivoNotas').textContent = act.notas || '-';
    
    const gallery = document.getElementById('photoGallery');
    if (act.fotos && act.fotos.length > 0) {
        gallery.innerHTML = act.fotos.map(f => `
            <div class="photo-item">
                <img src="${f.data}" alt="${f.name}">
            </div>
        `).join('');
    } else {
        gallery.innerHTML = '<p style="color:var(--text-light);text-align:center">No hay fotos</p>';
    }
    
    document.getElementById('activoDetailModal').classList.add('active');
}

// ============================================
// ESTACIONAMIENTO
// ============================================

function renderEstacionamientoTable() {
    const tbody = document.getElementById('estacionamientoTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    estacionamiento.forEach(esp => {
        const espacioCell = `<span class="estacionamiento-espacio" style="background: ${esp.color_asignado}">${esp.numero_espacio}</span>`;
        const inquilinoText = esp.inquilino_nombre || '-';
        const despachoText = esp.numero_despacho || '-';
        
        tbody.innerHTML += `
            <tr onclick="showEditEstacionamientoModal(${esp.id})" style="cursor:pointer">
                <td>${espacioCell}</td>
                <td>${inquilinoText}</td>
                <td>${despachoText}</td>
            </tr>
        `;
    });
}

function showEditEstacionamientoModal(espacioId) {
    const espacio = estacionamiento.find(e => e.id === espacioId);
    currentEstacionamientoId = espacioId;
    
    document.getElementById('editEspacioNumero').textContent = espacio.numero_espacio;
    
    const select = document.getElementById('editEspacioInquilino');
    select.innerHTML = '<option value="">-- Seleccione --</option><option value="VISITAS">VISITAS</option>';
    inquilinos.forEach(inq => {
        const option = document.createElement('option');
        option.value = inq.nombre;
        option.textContent = inq.nombre;
        if (inq.nombre === espacio.inquilino_nombre) option.selected = true;
        select.appendChild(option);
    });
    
    document.getElementById('editEspacioDespacho').value = espacio.numero_despacho || '';
    
    document.getElementById('editEstacionamientoModal').classList.add('active');
}

let estacionamientoSortOrder = { espacio: 'asc', inquilino: 'asc' };

function sortEstacionamiento(columna) {
    const tbody = document.getElementById('estacionamientoTable').querySelector('tbody');
    
    let sortedData = [...estacionamiento];
    
    if (columna === 'espacio') {
        sortedData.sort((a, b) => {
            const numA = parseInt(a.numero_espacio);
            const numB = parseInt(b.numero_espacio);
            return estacionamientoSortOrder.espacio === 'asc' ? numA - numB : numB - numA;
        });
        estacionamientoSortOrder.espacio = estacionamientoSortOrder.espacio === 'asc' ? 'desc' : 'asc';
    } else if (columna === 'inquilino') {
        sortedData.sort((a, b) => {
            const nameA = (a.inquilino_nombre || '').toLowerCase();
            const nameB = (b.inquilino_nombre || '').toLowerCase();
            if (estacionamientoSortOrder.inquilino === 'asc') {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });
        estacionamientoSortOrder.inquilino = estacionamientoSortOrder.inquilino === 'asc' ? 'desc' : 'asc';
    }
    
    tbody.innerHTML = '';
    sortedData.forEach(esp => {
        const espacioCell = `<span class="estacionamiento-espacio" style="background: ${esp.color_asignado}">${esp.numero_espacio}</span>`;
        const inquilinoText = esp.inquilino_nombre || '-';
        const despachoText = esp.numero_despacho || '-';
        
        tbody.innerHTML += `
            <tr onclick="showEditEstacionamientoModal(${esp.id})" style="cursor:pointer">
                <td>${espacioCell}</td>
                <td>${inquilinoText}</td>
                <td>${despachoText}</td>
            </tr>
        `;
    });
}

// ============================================
// BITÁCORA
// ============================================

let bitacoraSortOrder = 'desc';

function renderBitacoraTable() {
    const tbody = document.getElementById('bitacoraTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    // Ordenar según bitacoraSortOrder
    const sorted = [...bitacoraSemanal].sort((a, b) => {
        const dateA = new Date(a.semana_inicio);
        const dateB = new Date(b.semana_inicio);
        return bitacoraSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    sorted.forEach((sem, index) => {
        const row = tbody.insertRow();
        
        // Solo las 2 primeras son editables (más recientes)
        const esEditable = index < 2;
        
        if (esEditable) {
            row.onclick = () => showEditBitacoraModal(sem.id);
            row.style.cursor = 'pointer';
        } else {
            row.style.cursor = 'default';
            row.style.opacity = '0.7';
        }
        
        const notasPreview = sem.notas ? (sem.notas.substring(0, 100) + '...') : 'Sin notas';
        const notasCompletas = sem.notas || 'Sin notas';
        
        // Cambiar "Semana del" por "al"
        const semanaTexto = sem.semana_texto ? sem.semana_texto.replace('Semana del', 'al') : '';
        
        row.innerHTML = `
            <td><strong>${semanaTexto}</strong></td>
            <td class="bitacora-notas-cell" data-fulltext="${notasCompletas.replace(/"/g, '&quot;')}">${notasPreview}</td>
        `;
    });
    
    // Actualizar indicador de ordenamiento
    const th = document.querySelector('#bitacoraTable th.sortable');
    th.classList.remove('sorted-asc', 'sorted-desc');
    th.classList.add(bitacoraSortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');
}

function sortBitacora() {
    bitacoraSortOrder = bitacoraSortOrder === 'asc' ? 'desc' : 'asc';
    renderBitacoraTable();
}

function filtrarBitacora(query) {
    const tbody = document.getElementById('bitacoraTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filtradas = bitacoraSemanal.filter(sem => {
        const notas = (sem.notas || '').toLowerCase();
        return notas.includes(query);
    });
    
    const sorted = [...filtradas].sort((a, b) => {
        const dateA = new Date(a.semana_inicio);
        const dateB = new Date(b.semana_inicio);
        return bitacoraSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    sorted.forEach(sem => {
        const notasPreview = sem.notas ? (sem.notas.substring(0, 100) + '...') : 'Sin notas';
        const notasCompletas = sem.notas || 'Sin notas';
        tbody.innerHTML += `
            <tr onclick="showEditBitacoraModal(${sem.id})" style="cursor:pointer">
                <td><strong>${sem.semana_texto}</strong></td>
                <td data-fulltext="${notasCompletas.replace(/"/g, '&quot;')}">${notasPreview}</td>
            </tr>
        `;
    });
    
    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron resultados</td></tr>';
    }
}

function showEditBitacoraModal(bitacoraId) {
    const bitacora = bitacoraSemanal.find(b => b.id === bitacoraId);
    currentBitacoraId = bitacoraId;
    
    let fechaBitacora = '';
    if (bitacora.semana_inicio) {
        fechaBitacora = bitacora.semana_inicio;
    } else if (bitacora.semana_texto) {
        const match = bitacora.semana_texto.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
        if (match) {
            const meses = {
                'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04', 'May': '05', 'Jun': '06',
                'Jul': '07', 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'
            };
            const dia = match[1].padStart(2, '0');
            const mes = meses[match[2]];
            const anio = match[3];
            fechaBitacora = `${anio}-${mes}-${dia}`;
        }
    }
    
    document.getElementById('editBitacoraFecha').value = fechaBitacora;
    document.getElementById('editBitacoraNotas').value = bitacora.notas || '';
    
    document.getElementById('editBitacoraModal').classList.add('active');
}

function updateBitacoraMenu() {
    // Esta función se llama cuando se abre el dropdown
    // No necesita hacer nada especial por ahora
}

function agregarNuevaSemana() {
    agregarSemanaBitacora();
}

console.log('✅ ADMIN-UI.JS cargado');

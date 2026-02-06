/* ========================================
   ESWU - UI.JS FINAL COMPLETO
   Todas las funciones de interfaz
   ======================================== */

let currentMenuContext = 'main';
let currentSubContext = null;
let currentSearchContext = null;
let bitacoraSortOrder = 'desc';
let estacionamientoSortOrder = { espacio: 'asc', inquilino: 'asc' };
let currentHomeTable = null;

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN' 
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateVencimiento(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    const formatted = formatDate(dateString);
    
    if (diffDays <= 7 && diffDays >= 0) {
        return `<span class="vencimiento-proximo">${formatted}</span>`;
    }
    return formatted;
}

// ============================================
// NAVIGATION
// ============================================

function showSubMenu(menu) {
    document.getElementById('menuInquilinos').classList.remove('active');
    document.getElementById('menuProveedores').classList.remove('active');
    document.getElementById('menuAdmin').classList.remove('active');
    
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    document.getElementById('adminSubMenu').classList.remove('active');
    
    if (menu === 'inquilinos') {
        document.getElementById('inquilinosSubMenu').classList.add('active');
        document.getElementById('menuInquilinos').classList.add('active');
        currentMenuContext = 'inquilinos';
    } else if (menu === 'proveedores') {
        document.getElementById('proveedoresSubMenu').classList.add('active');
        document.getElementById('menuProveedores').classList.add('active');
        currentMenuContext = 'proveedores';
    } else if (menu === 'admin') {
        document.getElementById('adminSubMenu').classList.add('active');
        document.getElementById('menuAdmin').classList.add('active');
        currentMenuContext = 'admin';
    }
    
    document.getElementById('contentArea').classList.add('with-submenu');
    document.getElementById('btnRegresa').classList.add('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
}

function handleRegresa() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    if (currentMenuContext === 'inquilinos') {
        document.getElementById('inquilinosSubMenu').classList.add('active');
    } else if (currentMenuContext === 'proveedores') {
        document.getElementById('proveedoresSubMenu').classList.add('active');
    } else if (currentMenuContext === 'admin') {
        document.getElementById('adminSubMenu').classList.add('active');
    }
    
    currentSubContext = null;
    currentSearchContext = null;
    document.getElementById('btnRegresa').classList.add('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
    document.getElementById('headerSearchBar').classList.remove('active');
    document.getElementById('menuSidebar').classList.remove('hidden');
    document.getElementById('contentArea').classList.remove('fullwidth');
    document.getElementById('contentArea').classList.add('with-submenu');
}

// ============================================
// BÚSQUEDA
// ============================================

function toggleSearch() {
    const searchBar = document.getElementById('headerSearchBar');
    const btnSearch = document.getElementById('btnSearch');
    
    searchBar.classList.toggle('active');
    
    if (searchBar.classList.contains('active')) {
        btnSearch.classList.add('hidden');
        document.getElementById('searchInput').focus();
    } else {
        btnSearch.classList.remove('hidden');
    }
}

function executeSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!query) {
        alert('Por favor ingresa un término de búsqueda');
        return;
    }
    
    if (currentSearchContext === 'inquilinos') {
        filtrarInquilinos(query);
    } else if (currentSearchContext === 'proveedores') {
        filtrarProveedores(query);
    } else if (currentSearchContext === 'bitacora') {
        filtrarBitacora(query);
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    
    if (currentSearchContext === 'inquilinos') {
        renderInquilinosTable();
    } else if (currentSearchContext === 'proveedores') {
        renderProveedoresTable();
    } else if (currentSearchContext === 'bitacora') {
        renderBitacoraTable();
    }
}

function filtrarInquilinos(query) {
    const tbody = document.getElementById('inquilinosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filtrados = inquilinos.filter(inq => 
        inq.nombre.toLowerCase().includes(query) ||
        (inq.numero_despacho && inq.numero_despacho.toLowerCase().includes(query))
    );
    
    filtrados.forEach(inq => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showInquilinoDetailModal(inq.id);
        row.innerHTML = `<td>${inq.nombre}</td><td class="currency">${formatCurrency(inq.renta)}</td><td>${formatDateVencimiento(inq.fecha_vencimiento)}</td>`;
    });
    
    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron resultados</td></tr>';
    }
}

function filtrarProveedores(query) {
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filtrados = proveedores.filter(prov => 
        prov.nombre.toLowerCase().includes(query) ||
        (prov.servicio && prov.servicio.toLowerCase().includes(query))
    );
    
    filtrados.forEach(prov => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showProveedorDetailModal(prov.id);
        const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
        row.innerHTML = `<td>${prov.nombre}</td><td>${prov.servicio || '-'}</td><td>${primerContacto.nombre || '-'}</td><td>${primerContacto.telefono || '-'}</td><td>${primerContacto.email || '-'}</td>`;
    });
    
    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron resultados</td></tr>';
    }
}

function filtrarBitacora(query) {
    const tbody = document.getElementById('bitacoraTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filtradas = bitacoraSemanal.filter(sem => {
        const notas = (sem.notas || '').toLowerCase();
        const semanaTexto = (sem.semana_texto || '').toLowerCase();
        return notas.includes(query) || semanaTexto.includes(query);
    });
    
    const sorted = [...filtradas].sort((a, b) => {
        const dateA = new Date(a.semana_inicio);
        const dateB = new Date(b.semana_inicio);
        return bitacoraSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    sorted.forEach(sem => {
        const row = tbody.insertRow();
        row.onclick = () => showEditBitacoraModal(sem.id);
        row.style.cursor = 'pointer';
        
        const notasPreview = sem.notas ? (sem.notas.substring(0, 100) + '...') : 'Sin notas';
        const notasCompletas = sem.notas || 'Sin notas';
        const semanaTexto = sem.semana_texto ? sem.semana_texto.replace('Semana del', 'al') : '';
        
        row.innerHTML = `<td><strong>${semanaTexto}</strong></td><td data-fulltext="${notasCompletas.replace(/"/g, '&quot;')}">${notasPreview}</td>`;
    });
    
    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron resultados</td></tr>';
    }
}

// ============================================
// INQUILINOS - VIEWS
// ============================================

function showInquilinosView(view) {
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('inquilinosPage').classList.add('active');
    
    document.getElementById('inquilinosListView').classList.add('hidden');
    document.getElementById('inquilinosRentasRecibidasView').classList.add('hidden');
    document.getElementById('inquilinosVencimientoContratosView').classList.add('hidden');
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    currentSubContext = 'inquilinos-' + view;
    
    if (view === 'list') {
        document.getElementById('inquilinosListView').classList.remove('hidden');
        document.getElementById('btnSearch').classList.remove('hidden');
        currentSearchContext = 'inquilinos';
        renderInquilinosTable();
    } else if (view === 'rentasRecibidas') {
        document.getElementById('inquilinosRentasRecibidasView').classList.remove('hidden');
        document.getElementById('btnSearch').classList.add('hidden');
        currentSearchContext = null;
        populateInquilinosYearSelects();
        renderInquilinosRentasRecibidas();
    } else if (view === 'vencimientoContratos') {
        document.getElementById('inquilinosVencimientoContratosView').classList.remove('hidden');
        document.getElementById('btnSearch').classList.add('hidden');
        currentSearchContext = null;
        renderInquilinosVencimientoContratos();
    }
}

function renderInquilinosTable() {
    const tbody = document.getElementById('inquilinosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (!inquilinos || inquilinos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem;color:#718096">No hay inquilinos registrados</td></tr>';
        return;
    }
    
    inquilinos.forEach(inq => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showInquilinoDetailModal(inq.id);
        row.innerHTML = `<td>${inq.nombre}</td><td class="currency">${formatCurrency(inq.renta)}</td><td>${formatDateVencimiento(inq.fecha_vencimiento)}</td>`;
    });
}

function renderInquilinosRentasRecibidas() {
    const tbody = document.getElementById('inquilinosRentasRecibidasTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filterType = document.getElementById('inquilinosRentasFilter').value;
    const year = parseInt(document.getElementById('inquilinosRentasYear').value);
    const monthSelect = document.getElementById('inquilinosRentasMonth');
    
    if (filterType === 'mensual') {
        monthSelect.classList.remove('hidden');
    } else {
        monthSelect.classList.add('hidden');
    }
    
    const month = filterType === 'mensual' ? parseInt(monthSelect.value) : null;
    const rentas = [];
    let totalPeriodo = 0;
    
    inquilinos.forEach(inq => {
        if (inq.pagos && inq.pagos.length > 0) {
            inq.pagos.forEach(pago => {
                const fechaPago = new Date(pago.fecha + 'T00:00:00');
                if (fechaPago.getFullYear() === year && (month === null || fechaPago.getMonth() === month)) {
                    rentas.push({
                        empresa: inq.nombre,
                        monto: pago.monto,
                        fecha: pago.fecha,
                        inquilinoId: inq.id
                    });
                    totalPeriodo += pago.monto;
                }
            });
        }
    });
    
    rentas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    rentas.forEach(r => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showInquilinoDetailModal(r.inquilinoId);
        row.innerHTML = `<td>${r.empresa}</td><td class="currency">${formatCurrency(r.monto)}</td><td>${formatDate(r.fecha)}</td>`;
    });
    
    if (rentas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light);padding:2rem">No hay rentas en este periodo</td></tr>';
    } else {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        if (filterType === 'mensual') {
            const rowTotal = tbody.insertRow();
            rowTotal.style.fontWeight = 'bold';
            rowTotal.style.backgroundColor = '#e6f2ff';
            rowTotal.innerHTML = `<td style="text-align:right;padding:1rem;font-size:1.1rem">TOTAL ${monthNames[month].toUpperCase()} ${year}:</td><td class="currency" style="color:var(--primary);font-size:1.2rem">${formatCurrency(totalPeriodo)}</td><td></td>`;
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
        
        const rowAnual = tbody.insertRow();
        rowAnual.style.fontWeight = 'bold';
        rowAnual.style.backgroundColor = '#d4edda';
        rowAnual.innerHTML = `<td style="text-align:right;padding:1rem;font-size:1.1rem">TOTAL ${year}:</td><td class="currency" style="color:var(--success);font-size:1.2rem">${formatCurrency(totalAnual)}</td><td></td>`;
    }
}

function renderInquilinosVencimientoContratos() {
    const tbody = document.getElementById('inquilinosVencimientoContratosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    inquilinos.forEach(inq => {
        const venc = new Date(inq.fecha_vencimiento + 'T00:00:00');
        const diffDays = Math.ceil((venc - today) / (1000 * 60 * 60 * 24));
        
        let estado = '';
        let badgeClass = '';
        
        if (diffDays < 0) {
            estado = 'Vencido';
            badgeClass = 'badge-danger';
        } else if (diffDays <= 30) {
            estado = 'Próximo a vencer';
            badgeClass = 'badge-warning';
        } else {
            estado = 'Vigente';
            badgeClass = 'badge-success';
        }
        
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showInquilinoDetailModal(inq.id);
        row.innerHTML = `<td>${inq.nombre}</td><td>${formatDate(inq.fecha_inicio)}</td><td>${formatDate(inq.fecha_vencimiento)}</td><td style="text-align:center">${diffDays}</td><td><span class="badge ${badgeClass}">${estado}</span></td>`;
    });
    
    if (inquilinos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:2rem">No hay contratos</td></tr>';
    }
}

function populateInquilinosYearSelects() {
    const currentYear = new Date().getFullYear();
    const select = document.getElementById('inquilinosRentasYear');
    
    if (!select) return;
    
    select.innerHTML = '';
    
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        select.appendChild(option);
    }
}

// ============================================
// INQUILINO DETAIL MODAL
// ============================================

function showInquilinoDetailModal(id) {
    const inq = inquilinos.find(i => i.id === id);
    
    if (!inq) {
        alert('ERROR: Inquilino no encontrado');
        return;
    }
    
    currentInquilinoId = id;
    
    document.getElementById('inquilinoDetailNombre').textContent = inq.nombre;
    
    const contactosList = document.getElementById('detailContactosList');
    if (inq.contactos && inq.contactos.length > 0) {
        contactosList.innerHTML = inq.contactos.map(c => `
            <div style="margin-bottom:0.5rem;padding:0.5rem;background:white;border-radius:4px">
                <strong>${c.nombre}</strong><br>
                <small><strong>Tel:</strong> ${c.telefono || '-'} | <strong>Email:</strong> ${c.email || '-'}</small>
            </div>
        `).join('');
    } else {
        contactosList.innerHTML = '<p style="color:var(--text-light)">No hay contactos</p>';
    }
    
    document.getElementById('detailRFC').textContent = inq.rfc || '-';
    document.getElementById('detailClabe').textContent = inq.clabe || '-';
    document.getElementById('detailRenta').textContent = formatCurrency(inq.renta);
    document.getElementById('detailM2').textContent = inq.m2 || '-';
    document.getElementById('detailDespacho').textContent = inq.numero_despacho || '-';
    document.getElementById('detailFechaInicio').textContent = formatDate(inq.fecha_inicio);
    document.getElementById('detailFechaVenc').innerHTML = formatDateVencimiento(inq.fecha_vencimiento);
    
    const historialDiv = document.getElementById('historialPagos');
    if (inq.pagos && inq.pagos.length > 0) {
        historialDiv.innerHTML = inq.pagos.map(p => `
            <div class="payment-item">
                <div><strong>${formatDate(p.fecha)}</strong><br>${formatCurrency(p.monto)}</div>
                <div><span class="badge badge-success">Pagado</span></div>
            </div>
        `).join('');
    } else {
        historialDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay pagos</p>';
    }
    
    const contratoSection = document.getElementById('contratoOriginalSection');
    if (inq.contrato_file) {
        contratoSection.innerHTML = '<a href="#" onclick="event.preventDefault(); viewPDF(\'' + inq.contrato_file + '\');" class="btn btn-primary">📄 Ver Contrato</a>';
    } else {
        contratoSection.innerHTML = '<p style="color:var(--text-light)">No hay contrato cargado</p>';
    }
    
    const docsDiv = document.getElementById('documentosAdicionales');
    if (inq.documentos && inq.documentos.length > 0) {
        docsDiv.innerHTML = inq.documentos.map(d => `
            <div class="doc-item" onclick="viewPDF('${d.archivo}')">
                <span>${d.nombre}</span>
                <small style="color:var(--text-light);display:block">${formatDate(d.fecha)} - ${d.usuario}</small>
            </div>
        `).join('');
    } else {
        docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay documentos adicionales</p>';
    }
    
    document.getElementById('notasInquilino').textContent = inq.notas || 'No hay notas para este inquilino.';
    
    document.getElementById('inquilinoDetailModal').classList.add('active');
    switchTab('inquilino', 'renta');
}

function viewPDF(base64Data) {
    const newWindow = window.open();
    newWindow.document.write(`<iframe width='100%' height='100%' src='${base64Data}'></iframe>`);
}

// CONTINÚA EN LA SIGUIENTE PARTE...
console.log('✅ UI.JS FINAL COMPLETO - Parte 1/3 cargada');

// ============================================
// PROVEEDORES - VIEWS
// ============================================

function showProveedoresView(view) {
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('proveedoresPage').classList.add('active');
    
    document.getElementById('proveedoresListView').classList.add('hidden');
    document.getElementById('proveedoresFacturasPagadasView').classList.add('hidden');
    document.getElementById('proveedoresFacturasPorPagarView').classList.add('hidden');
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    currentSubContext = 'proveedores-' + view;
    
    if (view === 'list') {
        document.getElementById('proveedoresListView').classList.remove('hidden');
        document.getElementById('btnSearch').classList.remove('hidden');
        currentSearchContext = 'proveedores';
        renderProveedoresTable();
    } else if (view === 'facturasPagadas') {
        document.getElementById('proveedoresFacturasPagadasView').classList.remove('hidden');
        document.getElementById('btnSearch').classList.add('hidden');
        currentSearchContext = null;
        populateProveedoresYearSelects();
        renderProveedoresFacturasPagadas();
    } else if (view === 'facturasPorPagar') {
        document.getElementById('proveedoresFacturasPorPagarView').classList.remove('hidden');
        document.getElementById('btnSearch').classList.add('hidden');
        currentSearchContext = null;
        populateProveedoresYearSelects();
        renderProveedoresFacturasPorPagar();
    }
}

function renderProveedoresTable() {
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (!proveedores || proveedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#718096">No hay proveedores</td></tr>';
        return;
    }
    
    proveedores.forEach(prov => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showProveedorDetailModal(prov.id);
        const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
        row.innerHTML = `<td>${prov.nombre}</td><td>${prov.servicio || '-'}</td><td>${primerContacto.nombre || '-'}</td><td>${primerContacto.telefono || '-'}</td><td>${primerContacto.email || '-'}</td>`;
    });
}

function renderProveedoresFacturasPagadas() {
    const tbody = document.getElementById('proveedoresFacturasPagadasTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filterType = document.getElementById('provFactPagFilter').value;
    const year = parseInt(document.getElementById('provFactPagYear').value);
    const monthSelect = document.getElementById('provFactPagMonth');
    
    if (filterType === 'mensual') {
        monthSelect.classList.remove('hidden');
    } else {
        monthSelect.classList.add('hidden');
    }
    
    const month = filterType === 'mensual' ? parseInt(monthSelect.value) : null;
    const pagadas = [];
    let totalPagadas = 0;
    
    proveedores.forEach(prov => {
        if (prov.facturas) {
            prov.facturas.forEach(f => {
                if (f.fecha_pago) {
                    const pd = new Date(f.fecha_pago + 'T00:00:00');
                    if (pd.getFullYear() === year && (month === null || pd.getMonth() === month)) {
                        pagadas.push({
                            proveedor: prov.nombre,
                            numero: f.numero || 'S/N',
                            monto: f.monto,
                            fecha: f.fecha_pago,
                            documento_file: f.documento_file,
                            pago_file: f.pago_file
                        });
                        totalPagadas += f.monto;
                    }
                }
            });
        }
    });
    
    pagadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    pagadas.forEach(f => {
        const row = tbody.insertRow();
        const facturaCell = f.documento_file 
            ? `<td style="cursor:pointer;color:var(--primary)" onclick="viewPDF('${f.documento_file}')">${f.numero}</td>`
            : `<td>${f.numero}</td>`;
        const fechaCell = f.pago_file
            ? `<td style="cursor:pointer;color:var(--primary)" onclick="viewPDF('${f.pago_file}')">${formatDate(f.fecha)}</td>`
            : `<td>${formatDate(f.fecha)}</td>`;
        row.innerHTML = `<td>${f.proveedor}</td>${facturaCell}<td class="currency">${formatCurrency(f.monto)}</td>${fechaCell}`;
    });
    
    if (pagadas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light)">No hay facturas pagadas</td></tr>';
    } else {
        const row = tbody.insertRow();
        row.className = 'total-row';
        row.innerHTML = `<td colspan="2" style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(totalPagadas)}</strong></td><td></td>`;
    }
}

function renderProveedoresFacturasPorPagar() {
    const tbody = document.getElementById('proveedoresFacturasPorPagarTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filterType = document.getElementById('provFactPorPagFilter').value;
    const year = parseInt(document.getElementById('provFactPorPagYear').value);
    const monthSelect = document.getElementById('provFactPorPagMonth');
    
    if (filterType === 'mensual') {
        monthSelect.classList.remove('hidden');
    } else {
        monthSelect.classList.add('hidden');
    }
    
    const month = filterType === 'mensual' ? parseInt(monthSelect.value) : null;
    const porPagar = [];
    let totalPorPagar = 0;
    
    proveedores.forEach(prov => {
        if (prov.facturas) {
            prov.facturas.forEach(f => {
                if (!f.fecha_pago) {
                    const vd = new Date(f.vencimiento + 'T00:00:00');
                    if (vd.getFullYear() === year && (month === null || month === vd.getMonth())) {
                        porPagar.push({
                            provId: prov.id,
                            factId: f.id,
                            proveedor: prov.nombre,
                            numero: f.numero || 'S/N',
                            monto: f.monto,
                            vencimiento: f.vencimiento,
                            documento_file: f.documento_file
                        });
                        totalPorPagar += f.monto;
                    }
                }
            });
        }
    });
    
    porPagar.sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento));
    
    porPagar.forEach(f => {
        const row = tbody.insertRow();
        if (f.documento_file) {
            row.style.cursor = 'pointer';
            row.onclick = () => viewPDF(f.documento_file);
        }
        row.innerHTML = `<td>${f.proveedor}</td><td>${f.numero}</td><td class="currency">${formatCurrency(f.monto)}</td><td>${formatDateVencimiento(f.vencimiento)}</td>`;
    });
    
    if (porPagar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light)">No hay facturas por pagar</td></tr>';
    } else {
        const row = tbody.insertRow();
        row.className = 'total-row';
        row.innerHTML = `<td colspan="2" style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(totalPorPagar)}</strong></td><td></td>`;
    }
}

function populateProveedoresYearSelects() {
    const currentYear = new Date().getFullYear();
    ['provFactPagYear', 'provFactPorPagYear'].forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '';
            for (let year = currentYear - 5; year <= currentYear + 1; year++) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                if (year === currentYear) option.selected = true;
                select.appendChild(option);
            }
        }
    });
}

function showProveedorDetailModal(id) {
    const prov = proveedores.find(p => p.id === id);
    
    if (!prov) {
        alert('ERROR: Proveedor no encontrado');
        return;
    }
    
    currentProveedorId = id;
    
    document.getElementById('proveedorDetailNombre').textContent = prov.nombre;
    document.getElementById('detailServicio').textContent = prov.servicio || '-';
    
    const contactosList = document.getElementById('detailProvContactosList');
    if (prov.contactos && prov.contactos.length > 0) {
        contactosList.innerHTML = prov.contactos.map(c => `
            <div style="margin-bottom:0.5rem;padding:0.5rem;background:white;border-radius:4px">
                <strong>${c.nombre}</strong><br>
                <small><strong>Tel:</strong> ${c.telefono || '-'} | <strong>Email:</strong> ${c.email || '-'}</small>
            </div>
        `).join('');
    } else {
        contactosList.innerHTML = '<p style="color:var(--text-light)">No hay contactos</p>';
    }
    
    document.getElementById('detailProvRFC').textContent = prov.rfc || '-';
    document.getElementById('detailProvClabe').textContent = prov.clabe || '-';
    
    // Facturas Pagadas
    const facturasPagadasDiv = document.getElementById('facturasPagadas');
    const facturasPagadas = prov.facturas ? prov.facturas.filter(f => f.fecha_pago) : [];
    let totalPagadas = 0;
    
    if (facturasPagadas.length > 0) {
        facturasPagadasDiv.innerHTML = facturasPagadas.map(f => {
            totalPagadas += f.monto;
            const facturaLink = f.documento_file ? `<a href="#" class="pdf-link" onclick="event.preventDefault(); viewPDF('${f.documento_file}')">Factura</a>` : '';
            const pagoLink = f.pago_file ? `<a href="#" class="pdf-link" onclick="event.preventDefault(); viewPDF('${f.pago_file}')">Pago</a>` : '';
            return `
                <div class="payment-item">
                    <div class="payment-item-content">
                        <div><strong>Factura ${f.numero || 'S/N'}</strong> del <strong>${formatDate(f.fecha)}</strong> pagada el <strong>${formatDate(f.fecha_pago)}</strong></div>
                        <div style="margin-top:0.5rem">${facturaLink} ${pagoLink}</div>
                    </div>
                    <div style="text-align:right"><strong>${formatCurrency(f.monto)}</strong></div>
                </div>
            `;
        }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem">TOTAL: <strong>${formatCurrency(totalPagadas)}</strong></div>`;
    } else {
        facturasPagadasDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas pagadas</p>';
    }
    
    // Facturas Por Pagar
    const facturasPorPagarDiv = document.getElementById('facturasPorPagar');
    const facturasPorPagar = prov.facturas ? prov.facturas.filter(f => !f.fecha_pago) : [];
    let totalPorPagar = 0;
    
    if (facturasPorPagar.length > 0) {
        facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
            totalPorPagar += f.monto;
            const verLink = f.documento_file ? `<button class="btn btn-sm btn-secondary" onclick="viewPDF('${f.documento_file}')">Ver</button>` : '';
            return `
                <div class="payment-item">
                    <div class="payment-item-content">
                        <div><strong>Factura ${f.numero || 'S/N'}</strong> del <strong>${formatDate(f.fecha)}</strong></div>
                        <div>Vence: ${formatDateVencimiento(f.vencimiento)}</div>
                        <div style="margin-top:0.5rem"><strong>${formatCurrency(f.monto)}</strong></div>
                    </div>
                    <div class="payment-item-actions">
                        ${verLink}
                        <button class="btn btn-sm btn-primary" onclick="alert('Pagar factura - En desarrollo')">Dar X Pagada</button>
                    </div>
                </div>
            `;
        }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem">TOTAL: <strong>${formatCurrency(totalPorPagar)}</strong></div>`;
    } else {
        facturasPorPagarDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas por pagar</p>';
    }
    
    // Documentos Adicionales
    const docsDiv = document.getElementById('proveedorDocumentosAdicionales');
    if (prov.documentos && prov.documentos.length > 0) {
        docsDiv.innerHTML = prov.documentos.map(d => `
            <div class="doc-item" onclick="viewPDF('${d.archivo}')">
                <span>${d.nombre}</span>
                <small style="color:var(--text-light);display:block">${formatDate(d.fecha)} - ${d.usuario}</small>
            </div>
        `).join('');
    } else {
        docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay documentos adicionales</p>';
    }
    
    document.getElementById('notasProveedor').textContent = prov.notas || 'No hay notas para este proveedor.';
    
    document.getElementById('proveedorDetailModal').classList.add('active');
    switchTab('proveedor', 'pagadas');
}

console.log('✅ UI.JS FINAL COMPLETO - Parte 2/3 cargada');

// ============================================
// ADMIN - PÁGINAS
// ============================================

function showPageFromMenu(pageName) {
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageName + 'Page').classList.add('active');
    
    currentSubContext = pageName;
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    if (pageName === 'bitacora') {
        document.getElementById('btnSearch').classList.remove('hidden');
        currentSearchContext = 'bitacora';
        renderBitacoraTable();
    } else if (pageName === 'estacionamiento') {
        document.getElementById('btnSearch').classList.add('hidden');
        currentSearchContext = null;
        renderEstacionamientoTable();
    }
}

function showAdminView(view) {
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    currentSubContext = 'admin-' + view;
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    if (view === 'usuarios') {
        document.getElementById('adminUsuariosPage').classList.add('active');
        renderUsuariosTable();
    } else if (view === 'bancos') {
        document.getElementById('adminBancosPage').classList.add('active');
        renderBancosTable();
    }
}

function showActivosPage() {
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('activosPage').classList.add('active');
    
    currentSubContext = 'admin-activos';
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    renderActivosTable();
}

function showNumerosPage() {
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('numerosPage').classList.add('active');
    
    currentSubContext = 'admin-numeros';
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    populateYearSelect();
    updateHomeView();
}

// ============================================
// ADMIN - RENDERS
// ============================================

function renderActivosTable() {
    const tbody = document.getElementById('activosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (!activos || activos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:#718096">No hay activos</td></tr>';
        return;
    }
    
    activos.forEach(act => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => alert('Ver detalles de activo - En desarrollo');
        row.innerHTML = `<td>${act.nombre}</td><td>${formatDate(act.ultimo_mant)}</td><td>${formatDate(act.proximo_mant)}</td><td>${act.proveedor || '-'}</td>`;
    });
}

function renderUsuariosTable() {
    const tbody = document.getElementById('usuariosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem;color:#718096">No hay usuarios</td></tr>';
        return;
    }
    
    usuarios.forEach(u => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => alert('Ver detalles de usuario - En desarrollo');
        const estadoBadge = u.activo 
            ? '<span class="badge badge-success">Activo</span>' 
            : '<span class="badge badge-danger">Inactivo</span>';
        row.innerHTML = `<td>${u.nombre}</td><td>••••••••</td><td>${estadoBadge}</td>`;
    });
}

function renderBancosTable() {
    const tbody = document.getElementById('bancosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (!bancosDocumentos || bancosDocumentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:2rem;color:#718096">No hay documentos</td></tr>';
        return;
    }
    
    bancosDocumentos.forEach(b => {
        const row = tbody.insertRow();
        row.className = 'banco-clickable';
        row.onclick = () => viewPDF(b.archivo_pdf);
        row.innerHTML = `<td>${b.tipo || 'Documento'}</td><td>${formatDate(b.fecha_subida)}</td>`;
    });
}

function renderEstacionamientoTable() {
    const tbody = document.getElementById('estacionamientoTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (!estacionamiento || estacionamiento.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem;color:#718096">No hay espacios</td></tr>';
        return;
    }
    
    estacionamiento.forEach(esp => {
        const row = tbody.insertRow();
        row.onclick = () => showEditEstacionamientoModal(esp.id);
        row.style.cursor = 'pointer';
        
        const espacioCell = `<span class="estacionamiento-espacio" style="background: ${esp.color_asignado || '#ccc'}">${esp.numero_espacio}</span>`;
        const inquilinoText = esp.inquilino_nombre || '-';
        const despachoText = esp.numero_despacho || '-';
        
        row.innerHTML = `<td>${espacioCell}</td><td>${inquilinoText}</td><td>${despachoText}</td>`;
    });
}

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
        const row = tbody.insertRow();
        row.onclick = () => showEditEstacionamientoModal(esp.id);
        row.style.cursor = 'pointer';
        
        const espacioCell = `<span class="estacionamiento-espacio" style="background: ${esp.color_asignado || '#ccc'}">${esp.numero_espacio}</span>`;
        const inquilinoText = esp.inquilino_nombre || '-';
        const despachoText = esp.numero_despacho || '-';
        
        row.innerHTML = `<td>${espacioCell}</td><td>${inquilinoText}</td><td>${despachoText}</td>`;
    });
}

function showEditEstacionamientoModal(espacioId) {
    const espacio = estacionamiento.find(e => e.id === espacioId);
    currentEstacionamientoId = espacioId;
    
    document.getElementById('editEspacioNumero').textContent = espacio.numero_espacio;
    
    const select = document.getElementById('editEspacioInquilino');
    select.innerHTML = '<option value="">-- Sin asignar --</option>';
    
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

function updateDespachoField() {
    const selectedNombre = document.getElementById('editEspacioInquilino').value;
    const selectedInquilino = inquilinos.find(i => i.nombre === selectedNombre);
    document.getElementById('editEspacioDespacho').value = selectedInquilino?.numero_despacho || '';
}

function renderBitacoraTable() {
    const tbody = document.getElementById('bitacoraTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (!bitacoraSemanal || bitacoraSemanal.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:2rem;color:#718096">No hay bitácora</td></tr>';
        return;
    }
    
    const sorted = [...bitacoraSemanal].sort((a, b) => {
        const dateA = new Date(a.semana_inicio);
        const dateB = new Date(b.semana_inicio);
        return bitacoraSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    sorted.forEach(sem => {
        const row = tbody.insertRow();
        row.onclick = () => showEditBitacoraModal(sem.id);
        row.style.cursor = 'pointer';
        
        const notasPreview = sem.notas ? (sem.notas.substring(0, 100) + '...') : 'Sin notas';
        const notasCompletas = sem.notas || 'Sin notas';
        const semanaTexto = sem.semana_texto ? sem.semana_texto.replace('Semana del', 'al') : '';
        
        row.innerHTML = `<td><strong>${semanaTexto}</strong></td><td data-fulltext="${notasCompletas.replace(/"/g, '&quot;')}">${notasPreview}</td>`;
    });
}

function sortBitacora() {
    bitacoraSortOrder = bitacoraSortOrder === 'asc' ? 'desc' : 'asc';
    renderBitacoraTable();
}

function showEditBitacoraModal(bitacoraId) {
    const bitacora = bitacoraSemanal.find(b => b.id === bitacoraId);
    currentBitacoraId = bitacoraId;
    
    document.getElementById('editBitacoraFecha').value = bitacora.semana_inicio || '';
    document.getElementById('editBitacoraNotas').value = bitacora.notas || '';
    
    document.getElementById('editBitacoraModal').classList.add('active');
}

// ============================================
// NÚMEROS (HOME)
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
            renderHomePagos();
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
        renderHomePagos();
    }
}

function renderHomeIngresos() {
    const tbody = document.getElementById('homeIngresosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filterType = document.getElementById('homeFilter').value;
    const year = parseInt(document.getElementById('homeYear').value);
    const month = filterType === 'mensual' ? parseInt(document.getElementById('homeMonth').value) : null;
    
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
        const row = tbody.insertRow();
        row.className = 'clickable';
        row.onclick = () => showInquilinoDetailModal(p.inquilinoId);
        row.innerHTML = `<td>${p.inquilino}</td><td>${formatDate(p.fecha)}</td><td class="currency">${formatCurrency(p.monto)}</td>`;
    });
    
    if (pagos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay ingresos</td></tr>';
    } else {
        const row = tbody.insertRow();
        row.style.fontWeight = 'bold';
        row.style.backgroundColor = '#d4edda';
        row.innerHTML = `<td colspan="2" style="text-align:right;padding:1rem">TOTAL:</td><td class="currency" style="color:var(--success);font-size:1.1rem"><strong>${formatCurrency(total)}</strong></td>`;
    }
}

function renderHomePagos() {
    const tbody = document.getElementById('homePagosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filterType = document.getElementById('homeFilter').value;
    const year = parseInt(document.getElementById('homeYear').value);
    const month = filterType === 'mensual' ? parseInt(document.getElementById('homeMonth').value) : null;
    
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
    
    pagos.forEach(p => {
        const row = tbody.insertRow();
        row.className = 'clickable';
        row.onclick = () => showProveedorDetailModal(p.proveedorId);
        row.innerHTML = `<td>${p.proveedor}</td><td>${formatDate(p.fecha)}</td><td class="currency">${formatCurrency(p.monto)}</td>`;
    });
    
    if (pagos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay pagos</td></tr>';
    } else {
        const row = tbody.insertRow();
        row.style.fontWeight = 'bold';
        row.style.backgroundColor = '#e6f2ff';
        row.innerHTML = `<td colspan="2" style="text-align:right;padding:1rem">TOTAL:</td><td class="currency" style="color:var(--primary);font-size:1.1rem"><strong>${formatCurrency(total)}</strong></td>`;
    }
}

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(type, tabName) {
    if (type === 'inquilino') {
        document.querySelectorAll('#inquilinoDetailModal .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#inquilinoDetailModal .tab-content').forEach(tc => tc.classList.remove('active'));
        
        if (tabName === 'renta') {
            document.querySelector('#inquilinoDetailModal .tab:nth-child(1)').classList.add('active');
            document.getElementById('inquilinoRentaTab').classList.add('active');
        } else if (tabName === 'pagos') {
            document.querySelector('#inquilinoDetailModal .tab:nth-child(2)').classList.add('active');
            document.getElementById('inquilinoPagosTab').classList.add('active');
        } else if (tabName === 'contrato') {
            document.querySelector('#inquilinoDetailModal .tab:nth-child(3)').classList.add('active');
            document.getElementById('inquilinoContratoTab').classList.add('active');
        } else if (tabName === 'docs') {
            document.querySelector('#inquilinoDetailModal .tab:nth-child(4)').classList.add('active');
            document.getElementById('inquilinoDocsTab').classList.add('active');
        } else if (tabName === 'notas') {
            document.querySelector('#inquilinoDetailModal .tab:nth-child(5)').classList.add('active');
            document.getElementById('inquilinoNotasTab').classList.add('active');
        }
    } else if (type === 'proveedor') {
        document.querySelectorAll('#proveedorDetailModal .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#proveedorDetailModal .tab-content').forEach(tc => tc.classList.remove('active'));
        
        if (tabName === 'pagadas') {
            document.querySelector('#proveedorDetailModal .tab:nth-child(1)').classList.add('active');
            document.getElementById('proveedorPagadasTab').classList.add('active');
        } else if (tabName === 'porpagar') {
            document.querySelector('#proveedorDetailModal .tab:nth-child(2)').classList.add('active');
            document.getElementById('proveedorPorPagarTab').classList.add('active');
        } else if (tabName === 'docs') {
            document.querySelector('#proveedorDetailModal .tab:nth-child(3)').classList.add('active');
            document.getElementById('proveedorDocsTab').classList.add('active');
        } else if (tabName === 'notas') {
            document.querySelector('#proveedorDetailModal .tab:nth-child(4)').classList.add('active');
            document.getElementById('proveedorNotasTab').classList.add('active');
        }
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    document.querySelectorAll('.dropdown-content').forEach(dd => {
        if (dd.id !== dropdownId) dd.classList.remove('show');
    });
    dropdown.classList.toggle('show');
}

window.addEventListener('click', function(e) {
    if (!e.target.matches('.dropdown-toggle')) {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
});

function showAddInquilinoModal() {
    isEditMode = false;
    currentInquilinoId = null;
    tempInquilinoContactos = [];
    
    document.getElementById('addInquilinoTitle').textContent = 'Agregar Inquilino';
    document.getElementById('inquilinoForm').reset();
    document.getElementById('inquilinoContactosList').innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
    document.getElementById('contratoFileName').textContent = '';
    
    document.getElementById('addInquilinoModal').classList.add('active');
}

function showAddProveedorModal() {
    isEditMode = false;
    currentProveedorId = null;
    tempProveedorContactos = [];
    
    document.getElementById('addProveedorTitle').textContent = 'Agregar Proveedor';
    document.getElementById('proveedorForm').reset();
    document.getElementById('proveedorContactosList').innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
    
    document.getElementById('addProveedorModal').classList.add('active');
}

function showAddActivoModal() {
    alert('Modal de Activos - En desarrollo');
}

function showAddUsuarioModal() {
    alert('Modal de Usuarios - En desarrollo');
}

function showAddBancoModal() {
    document.getElementById('bancoForm').reset();
    document.getElementById('bancoDocumentoFileName').textContent = '';
    document.getElementById('addBancoModal').classList.add('active');
}

function showAddContactoInquilinoModal() {
    document.getElementById('contactoInquilinoForm').reset();
    document.getElementById('addContactoInquilinoModal').classList.add('active');
}

function showAddContactoProveedorModal() {
    document.getElementById('contactoProveedorForm').reset();
    document.getElementById('addContactoProveedorModal').classList.add('active');
}

function showRegistrarPagoModal() {
    document.getElementById('pagoForm').reset();
    document.getElementById('pagoMontoGroup').classList.add('hidden');
    document.getElementById('pagoPDFFileName').textContent = '';
    document.getElementById('registrarPagoModal').classList.add('active');
}

function showAgregarDocumentoModal() {
    document.getElementById('documentoForm').reset();
    document.getElementById('nuevoDocPDFFileName').textContent = '';
    document.getElementById('agregarDocumentoModal').classList.add('active');
}

function showRegistrarFacturaModal() {
    document.getElementById('facturaForm').reset();
    document.getElementById('facturaDocumentoFileName').textContent = '';
    document.getElementById('registrarFacturaModal').classList.add('active');
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

function renderContactosList(contactos, containerId, deleteCallback) {
    const container = document.getElementById(containerId);
    if (!contactos || contactos.length === 0) {
        container.innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
        return;
    }
    
    container.innerHTML = contactos.map((c, idx) => `
        <div class="contacto-item">
            <div class="contacto-info">
                <strong>${c.nombre}</strong><br>
                <small>Tel: ${c.telefono || '-'} | Email: ${c.email || '-'}</small>
            </div>
            <button type="button" class="btn btn-sm btn-danger" onclick="${deleteCallback}(${idx})">×</button>
        </div>
    `).join('');
}

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('eswu_remembered_user');
        localStorage.removeItem('eswu_remembered_pass');
        document.getElementById('appContainer').classList.remove('active');
        document.getElementById('loginContainer').classList.remove('hidden');
        document.body.classList.remove('logged-in');
    }
}

function editInquilino() {
    alert('Editar inquilino - Función conectada en main.js');
}

function deleteInquilino() {
    alert('Eliminar inquilino - Función conectada en main.js');
}

function editProveedor() {
    alert('Editar proveedor - Función conectada en main.js');
}

function deleteProveedor() {
    alert('Eliminar proveedor - Función conectada en main.js');
}

console.log('✅ UI.JS FINAL COMPLETO - Todas las partes cargadas');

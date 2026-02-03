/* ========================================
   ESWU - UI FUNCTIONS
   All user interface and rendering functions
   ======================================== */

// ============================================
// GLOBAL NAVIGATION STATE
// ============================================

let currentMenuContext = 'main'; // 'main', 'inquilinos', 'proveedores', 'admin'
let currentSubContext = null; // Para rastrear qué vista secundaria está activa

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

function showSubMenu(menu) {
    // NO ocultar menú principal - mantenerlo visible
    // El menú principal permanece en pantalla
    
    // Quitar clase active de todos los botones del menú
    document.getElementById('menuInquilinos').classList.remove('active');
    document.getElementById('menuProveedores').classList.remove('active');
    document.getElementById('menuAdmin').classList.remove('active');
    
    // Ocultar todos los submenús
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    document.getElementById('adminSubMenu').classList.remove('active');
    
    // Mostrar submenú correspondiente y marcar botón activo
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
    
    // Ocultar botón Regresa en header
    document.getElementById('btnRegresa').classList.add('hidden');
}

function regresaMainMenu() {
    // Ocultar todos los submenús
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    document.getElementById('adminSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas de contenido
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar menú principal
    document.getElementById('mainMenuPage').classList.add('active');
    
    // Quitar clase active de todos los botones
    document.getElementById('menuInquilinos').classList.remove('active');
    document.getElementById('menuProveedores').classList.remove('active');
    document.getElementById('menuAdmin').classList.remove('active');
    
    currentMenuContext = 'main';
    currentSubContext = null;
    
    // Ocultar botón Regresa
    document.getElementById('btnRegresa').classList.add('hidden');
}

function handleRegresa() {
    // Si estamos en una vista de contenido, regresar al submenú correspondiente
    if (currentSubContext) {
        // Ocultar todas las páginas
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Mostrar el submenú correspondiente
        if (currentMenuContext === 'inquilinos') {
            document.getElementById('inquilinosSubMenu').classList.add('active');
        } else if (currentMenuContext === 'proveedores') {
            document.getElementById('proveedoresSubMenu').classList.add('active');
        } else if (currentMenuContext === 'admin') {
            document.getElementById('adminSubMenu').classList.add('active');
        }
        
        // Mantener el menú principal visible
        document.getElementById('mainMenuPage').classList.add('active');
        
        currentSubContext = null;
        document.getElementById('btnRegresa').classList.add('hidden');
    }
}

function showPageFromMenu(pageName) {
    // Ocultar submenú
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    document.getElementById('adminSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mantener menú principal visible
    document.getElementById('mainMenuPage').classList.add('active');
    
    // Mostrar página solicitada
    document.getElementById(pageName + 'Page').classList.add('active');
    
    currentSubContext = pageName;
    
    // Mostrar botón Regresa
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    // Cargar contenido según la página
    if (pageName === 'estacionamiento') renderEstacionamientoTable();
    if (pageName === 'bitacora') renderBitacoraTable();
}

// ============================================
// FORMAT FUNCTIONS
// ============================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN' 
    }).format(amount);
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

// ============================================
// INQUILINOS - VIEWS
// ============================================

function showInquilinosView(view) {
    // Ocultar submenú inquilinos
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mantener menú principal visible
    document.getElementById('mainMenuPage').classList.add('active');
    
    // Mostrar página de inquilinos
    document.getElementById('inquilinosPage').classList.add('active');
    
    // Ocultar todas las vistas de inquilinos
    document.getElementById('inquilinosListView').classList.add('hidden');
    document.getElementById('inquilinosRentasRecibidasView').classList.add('hidden');
    document.getElementById('inquilinosVencimientoContratosView').classList.add('hidden');
    
    currentSubContext = 'inquilinos-' + view;
    
    // Mostrar botón Regresa
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    if (view === 'list') {
        document.getElementById('inquilinosListView').classList.remove('hidden');
        renderInquilinosTable();
    } else if (view === 'rentasRecibidas') {
        document.getElementById('inquilinosRentasRecibidasView').classList.remove('hidden');
        renderInquilinosRentasRecibidas();
    } else if (view === 'vencimientoContratos') {
        document.getElementById('inquilinosVencimientoContratosView').classList.remove('hidden');
        renderInquilinosVencimientoContratos();
    }
}

function renderInquilinosTable() {
    const tbody = document.getElementById('inquilinosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    inquilinos.forEach(inq => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showInquilinoDetail(inq.id);
        
        const nombreCorto = inq.nombre.length > 25 ? inq.nombre.substring(0, 25) + '...' : inq.nombre;
        
        row.innerHTML = `<td style="font-size:0.9rem">${nombreCorto}</td><td class="currency">${formatCurrency(inq.renta)}</td><td>${formatDateVencimiento(inq.fecha_vencimiento)}</td>`;
    });
    
    if (inquilinos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay inquilinos</td></tr>';
    }
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
        if (inq.pagos) {
            inq.pagos.forEach(pago => {
                const pd = new Date(pago.fecha + 'T00:00:00');
                if (pd.getFullYear() === year && (month === null || pd.getMonth() === month)) {
                    rentas.push({
                        empresa: inq.nombre,
                        monto: pago.monto,
                        fecha: pago.fecha
                    });
                    totalPeriodo += pago.monto;
                }
            });
        }
    });
    
    rentas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    rentas.forEach(r => {
        const row = tbody.insertRow();
        row.innerHTML = `<td>${r.empresa}</td><td class="currency">${formatCurrency(r.monto)}</td><td>${formatDate(r.fecha)}</td>`;
    });
    
    if (rentas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay rentas</td></tr>';
    } else {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        if (filterType === 'mensual') {
            const row = tbody.insertRow();
            row.style.fontWeight = 'bold';
            row.style.backgroundColor = '#e6f2ff';
            row.innerHTML = `<td style="text-align:right;padding:1rem;font-size:1.1rem">TOTAL ${monthNames[month].toUpperCase()} ${year}:</td><td class="currency" style="color:var(--primary);font-size:1.2rem">${formatCurrency(totalPeriodo)}</td><td></td>`;
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
        row.innerHTML = `<td>${inq.nombre}</td><td>${formatDate(inq.fecha_inicio)}</td><td>${formatDateVencimiento(inq.fecha_vencimiento)}</td><td>${diffDays}</td><td><span class="badge ${badgeClass}">${estado}</span></td>`;
    });
    
    if (inquilinos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light)">No hay contratos</td></tr>';
    }
}
function showInquilinoDetail(id) {
    const inq = inquilinos.find(i => i.id === id);
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
    
    const contratoSection = document.getElementById('contratoOriginalSection');
    if (inq.contrato_file) {
        contratoSection.innerHTML = '<a href="#" onclick="event.preventDefault(); viewContrato();" style="color:var(--primary);text-decoration:underline;">Contrato de Renta Original</a>';
    } else {
        contratoSection.innerHTML = '<p style="color:var(--text-light)">No hay contrato cargado</p>';
    }
    
    const historialDiv = document.getElementById('historialPagos');
    if (inq.pagos && inq.pagos.length > 0) {
        historialDiv.innerHTML = inq.pagos.map(p => `
            <div class="payment-item">
                <div><strong>${formatDate(p.fecha)}</strong><br>${formatCurrency(p.monto)}</div>
                <div><span class="badge badge-success">Pagado</span><br><small style="color:var(--text-light)">${formatDate(p.fecha)}</small></div>
            </div>
        `).join('');
    } else {
        historialDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay pagos</p>';
    }
    
    const docsDiv = document.getElementById('documentosAdicionales');
    if (inq.documentos && inq.documentos.length > 0) {
        docsDiv.innerHTML = '<table style="width:100%"><thead><tr><th>Nombre</th><th>Fecha</th><th>Usuario</th><th style="width:50px;"></th></tr></thead><tbody>' +
            inq.documentos.map(d => `
                <tr class="doc-item">
                    <td onclick="viewDocumento('${d.archivo}')" style="cursor:pointer;">${d.nombre}</td>
                    <td onclick="viewDocumento('${d.archivo}')" style="cursor:pointer;">${formatDate(d.fecha)}</td>
                    <td onclick="viewDocumento('${d.archivo}')" style="cursor:pointer;">${d.usuario}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteDocumentoAdicional(${d.id})">×</button></td>
                </tr>
            `).join('') + '</tbody></table>';
    } else {
        docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay documentos adicionales</p>';
    }
    
    document.getElementById('notasInquilino').textContent = inq.notas || 'No hay notas para este inquilino.';
    
    document.getElementById('inquilinoDetailModal').classList.add('active');
    switchTab('inquilino', 'renta');
}

// ============================================
// PROVEEDORES - VIEWS
// ============================================

function showProveedoresView(view) {
    // Ocultar submenú proveedores
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mantener menú principal visible
    document.getElementById('mainMenuPage').classList.add('active');
    
    // Mostrar página de proveedores
    document.getElementById('proveedoresPage').classList.add('active');
    
    // Ocultar todas las vistas de proveedores
    document.getElementById('proveedoresListView').classList.add('hidden');
    document.getElementById('proveedoresFacturasPagadasView').classList.add('hidden');
    document.getElementById('proveedoresFacturasPorPagarView').classList.add('hidden');
    
    currentSubContext = 'proveedores-' + view;
    
    // Mostrar botón Regresa
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    if (view === 'list') {
        document.getElementById('proveedoresListView').classList.remove('hidden');
        renderProveedoresTable();
    } else if (view === 'facturasPagadas') {
        document.getElementById('proveedoresFacturasPagadasView').classList.remove('hidden');
        renderProveedoresFacturasPagadas();
    } else if (view === 'facturasPorPagar') {
        document.getElementById('proveedoresFacturasPorPagarView').classList.remove('hidden');
        renderProveedoresFacturasPorPagar();
    }
}

function renderProveedoresTable() {
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    proveedores.forEach(prov => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showProveedorDetail(prov.id);
        const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
        row.innerHTML = `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${prov.nombre}</td><td>${prov.servicio}</td><td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${primerContacto.nombre || '-'}</td><td>${primerContacto.telefono || '-'}</td><td>${primerContacto.email || '-'}</td>`;
    });
    
    if (proveedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light)">No hay proveedores</td></tr>';
    }
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
            ? `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;cursor:pointer;color:var(--primary)" onclick="viewFacturaDoc('${f.documento_file}')">${f.numero}</td>`
            : `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${f.numero}</td>`;
        const fechaCell = f.pago_file
            ? `<td style="cursor:pointer;color:var(--primary)" onclick="viewFacturaDoc('${f.pago_file}')">${formatDate(f.fecha)}</td>`
            : `<td>${formatDate(f.fecha)}</td>`;
        row.innerHTML = `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${f.proveedor}</td>${facturaCell}<td class="currency">${formatCurrency(f.monto)}</td>${fechaCell}`;
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
        row.style.cursor = 'pointer';
        if (f.documento_file) {
            row.onclick = () => viewFacturaDoc(f.documento_file);
        }
        row.innerHTML = `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${f.proveedor}</td><td>${f.numero}</td><td class="currency">${formatCurrency(f.monto)}</td><td>${formatDateVencimiento(f.vencimiento)}</td>`;
    });
    
    if (porPagar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light)">No hay facturas por pagar</td></tr>';
    } else {
        const row = tbody.insertRow();
        row.className = 'total-row';
        row.innerHTML = `<td colspan="2" style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(totalPorPagar)}</strong></td><td></td>`;
    }
}
function showProveedorDetail(id) {
    const prov = proveedores.find(p => p.id === id);
    currentProveedorId = id;
    
    document.getElementById('proveedorDetailNombre').textContent = prov.nombre;
    document.getElementById('detailServicio').textContent = prov.servicio;
    
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
    
    document.getElementById('detailProvClabe').textContent = prov.clabe || '-';
    document.getElementById('detailProvRFC').textContent = prov.rfc || '-';
    
    const facturasPagadasDiv = document.getElementById('facturasPagadas');
    const facturasPagadas = prov.facturas.filter(f => f.fecha_pago);
    let totalPagadas = 0;
    
    if (facturasPagadas.length > 0) {
        facturasPagadasDiv.innerHTML = facturasPagadas.map(f => {
            totalPagadas += f.monto;
            const facturaLink = f.documento_file 
                ? `<a href="#" class="pdf-link" onclick="event.preventDefault(); viewFacturaDoc('${f.documento_file}')">Factura</a>` 
                : '';
            const pagoLink = f.pago_file 
                ? `<a href="#" class="pdf-link" onclick="event.preventDefault(); viewFacturaDoc('${f.pago_file}')">Pago</a>` 
                : '';
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
    
    const facturasPorPagarDiv = document.getElementById('facturasPorPagar');
    const facturasPorPagar = prov.facturas.filter(f => !f.fecha_pago);
    let totalPorPagar = 0;
    const isMobile = window.innerWidth <= 768;
    
    if (facturasPorPagar.length > 0) {
        if (isMobile) {
            facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
                totalPorPagar += f.monto;
                const clickAction = f.documento_file ? `onclick="viewFacturaDoc('${f.documento_file}')"` : '';
                const cursorStyle = f.documento_file ? 'cursor:pointer;' : '';
                return `
                    <div class="factura-box" ${clickAction} style="border: 2px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: white; ${cursorStyle}">
                        <div style="margin-bottom: 0.5rem;">
                            <strong>Factura ${f.numero || 'S/N'}</strong> del <strong>${formatDate(f.fecha)}</strong>
                        </div>
                        <div style="margin-bottom: 0.5rem;">
                            Vence: <strong>${formatDate(f.vencimiento)}</strong>
                        </div>
                        <div style="text-align:right; font-size: 1.1rem; color: var(--primary);">
                            <strong>${formatCurrency(f.monto)}</strong>
                        </div>
                        <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;" onclick="event.stopPropagation()">
                            <button class="btn btn-sm btn-primary" onclick="showPagarFacturaModal(${f.id})">Dar X Pagada</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteFactura(${f.id})">Eliminar</button>
                        </div>
                    </div>
                `;
            }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem">TOTAL: <strong>${formatCurrency(totalPorPagar)}</strong></div>`;
        } else {
            facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
                totalPorPagar += f.monto;
                const verLink = f.documento_file 
                    ? `<button class="btn btn-sm btn-secondary" onclick="viewFacturaDoc('${f.documento_file}')">Ver</button>` 
                    : '';
                return `
                    <div class="payment-item">
                        <div class="payment-item-content">
                            <div><strong>Factura ${f.numero || 'S/N'}</strong> del <strong>${formatDate(f.fecha)}</strong></div>
                            <div>Vence: ${formatDateVencimiento(f.vencimiento)}</div>
                            <div style="margin-top:0.5rem"><strong>${formatCurrency(f.monto)}</strong></div>
                        </div>
                        <div class="payment-item-actions">
                            ${verLink}
                            <button class="btn btn-sm btn-primary" onclick="showPagarFacturaModal(${f.id})">Dar X Pagada</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteFactura(${f.id})">Eliminar</button>
                        </div>
                    </div>
                `;
            }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem">TOTAL: <strong>${formatCurrency(totalPorPagar)}</strong></div>`;
        }
    } else {
        facturasPorPagarDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas por pagar</p>';
    }
    
    const docsDiv = document.getElementById('proveedorDocumentosAdicionales');
    if (prov.documentos && prov.documentos.length > 0) {
        docsDiv.innerHTML = '<table style="width:100%;table-layout:fixed"><thead><tr><th style="width:50%">Nombre</th><th style="width:25%">Fecha</th><th style="width:25%">Usuario</th></tr></thead><tbody>' +
            prov.documentos.map(d => `
                <tr class="doc-item" onclick="viewDocumento('${d.archivo}')">
                    <td style="word-wrap:break-word">${d.nombre}</td>
                    <td>${formatDate(d.fecha)}</td>
                    <td>${d.usuario}</td>
                </tr>
            `).join('') + '</tbody></table>';
    } else {
        docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay documentos adicionales</p>';
    }
    
    document.getElementById('proveedorDetailModal').classList.add('active');
    switchTab('proveedor', 'pagadas');
}

// ============================================
// ADMIN - VIEWS
// ============================================

function showAdminView(view) {
    // Ocultar submenú admin
    document.getElementById('adminSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mantener menú principal visible
    document.getElementById('mainMenuPage').classList.add('active');
    
    currentSubContext = 'admin-' + view;
    
    // Mostrar botón Regresa
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    if (view === 'usuarios') {
        document.getElementById('adminUsuariosPage').classList.add('active');
        renderUsuariosTable();
    } else if (view === 'bancos') {
        document.getElementById('adminBancosPage').classList.add('active');
        renderBancosTable();
    }
}

function showActivosPage() {
    // Ocultar submenú admin
    document.getElementById('adminSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mantener menú principal visible
    document.getElementById('mainMenuPage').classList.add('active');
    
    // Mostrar página de activos
    document.getElementById('activosPage').classList.add('active');
    
    currentSubContext = 'admin-activos';
    
    // Mostrar botón Regresa
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    renderActivosTable();
}

function showNumerosPage() {
    // Ocultar submenú admin
    document.getElementById('adminSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mantener menú principal visible
    document.getElementById('mainMenuPage').classList.add('active');
    
    // Mostrar página de números
    document.getElementById('numerosPage').classList.add('active');
    
    currentSubContext = 'admin-numeros';
    
    // Mostrar botón Regresa
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    updateHomeView();
}

function renderUsuariosTable() {
    const tbody = document.getElementById('usuariosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    usuarios.forEach(u => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showUsuarioDetail(u.id);
        const estadoBadge = u.activo 
            ? '<span class="badge badge-success">Activo</span>' 
            : '<span class="badge badge-danger">Inactivo</span>';
        row.innerHTML = `<td>${u.nombre}</td><td>••••••••</td><td>${estadoBadge}</td>`;
    });
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay usuarios</td></tr>';
    }
}

function renderBancosTable() {
    const tbody = document.getElementById('bancosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    bancosDocumentos.forEach(b => {
        const row = tbody.insertRow();
        row.className = 'banco-clickable';
        row.onclick = () => viewDocumento(b.archivo_pdf);
        row.innerHTML = `<td>${b.tipo}</td><td>${formatDate(b.fecha_subida)}</td>`;
    });
    
    if (bancosDocumentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--text-light)">No hay documentos</td></tr>';
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

function showAddBancoModal() {
    document.getElementById('bancoForm').reset();
    document.getElementById('bancoDocumentoFileName').textContent = '';
    document.getElementById('addBancoModal').classList.add('active');
}

// ============================================
// ACTIVOS
// ============================================

function renderActivosTable() {
    const tbody = document.getElementById('activosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    activos.forEach(act => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showActivoDetail(act.id);
        row.innerHTML = `<td>${act.nombre}</td><td>${formatDate(act.ultimo_mant)}</td><td>${formatDate(act.proximo_mant)}</td><td>${act.proveedor || '-'}</td>`;
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
        const row = tbody.insertRow();
        row.onclick = () => showEditEstacionamientoModal(esp.id);
        row.style.cursor = 'pointer';
        
        const espacioCell = `<span class="estacionamiento-espacio" style="background: ${esp.color_asignado}">${esp.numero_espacio}</span>`;
        const inquilinoText = esp.inquilino_nombre || '-';
        const despachoText = esp.numero_despacho || '-';
        
        row.innerHTML = `<td>${espacioCell}</td><td>${inquilinoText}</td><td>${despachoText}</td>`;
    });
}

function showEditEstacionamientoModal(espacioId) {
    const espacio = estacionamiento.find(e => e.id === espacioId);
    currentEstacionamientoId = espacioId;
    
    document.getElementById('editEspacioNumero').textContent = espacio.numero_espacio;
    
    // Poblar dropdown con inquilinos
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
    
    // Actualizar despacho al cambiar inquilino
    select.onchange = function() {
        const selectedInquilino = inquilinos.find(i => i.nombre === this.value);
        document.getElementById('editEspacioDespacho').value = selectedInquilino?.numero_despacho || '';
    };
    
    document.getElementById('editEstacionamientoModal').classList.add('active');
}

// ============================================
// BITÁCORA SEMANAL
// ============================================

function renderBitacoraTable() {
    const tbody = document.getElementById('bitacoraTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    // Ya viene ordenado de la BD, solo renderizamos
    bitacoraSemanal.forEach(sem => {
        const row = tbody.insertRow();
        row.onclick = () => showEditBitacoraModal(sem.id);
        row.style.cursor = 'pointer';
        
        const notasPreview = sem.notas ? (sem.notas.substring(0, 100) + '...') : 'Sin notas';
        const notasCompletas = sem.notas || 'Sin notas';
        
        // Agregar atributo data para hover (desktop)
        row.innerHTML = `<td><strong>${sem.semana_texto}</strong></td><td data-fulltext="${notasCompletas.replace(/"/g, '&quot;')}">${notasPreview}</td>`;
    });
}

function showEditBitacoraModal(bitacoraId) {
    const bitacora = bitacoraSemanal.find(b => b.id === bitacoraId);
    currentBitacoraId = bitacoraId;
    
    // Convertir semana_texto a fecha (formato: "Semana del DD MMM YYYY")
    let fechaBitacora = '';
    if (bitacora.semana) {
        fechaBitacora = bitacora.semana;
    } else if (bitacora.semana_texto) {
        // Extraer fecha del texto "Semana del 15 Ene 2024"
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

// ============================================
// BÚSQUEDA Y FILTROS
// ============================================

let estacionamientoSortOrder = { espacio: 'asc', inquilino: 'asc' };

function filtrarBitacora() {
    const busqueda = document.getElementById('bitacoraBusqueda').value.toLowerCase().trim();
    const tbody = document.getElementById('bitacoraTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (!busqueda) {
        renderBitacoraTable();
        return;
    }
    
    const filtradas = bitacoraSemanal.filter(sem => {
        const notas = (sem.notas || '').toLowerCase();
        return notas.includes(busqueda);
    });
    
    filtradas.forEach(sem => {
        const row = tbody.insertRow();
        row.onclick = () => showEditBitacoraModal(sem.id);
        row.style.cursor = 'pointer';
        
        const notasPreview = sem.notas ? (sem.notas.substring(0, 100) + '...') : 'Sin notas';
        const notasCompletas = sem.notas || 'Sin notas';
        row.innerHTML = `<td><strong>${sem.semana_texto}</strong></td><td data-fulltext="${notasCompletas.replace(/"/g, '&quot;')}">${notasPreview}</td>`;
    });
    
    if (filtradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron resultados</td></tr>';
    }
}

function limpiarBusquedaBitacora() {
    document.getElementById('bitacoraBusqueda').value = '';
    renderBitacoraTable();
}

function filtrarProveedores() {
    const busqueda = document.getElementById('proveedorBusqueda').value.toLowerCase().trim();
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (!busqueda) {
        renderProveedoresTable();
        return;
    }
    
    const filtrados = proveedores.filter(prov => {
        const nombre = prov.nombre.toLowerCase();
        return nombre.includes(busqueda);
    });
    
    filtrados.forEach(prov => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showProveedorDetail(prov.id);
        const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
        row.innerHTML = `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${prov.nombre}</td><td>${prov.servicio}</td><td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${primerContacto.nombre || '-'}</td><td>${primerContacto.telefono || '-'}</td><td>${primerContacto.email || '-'}</td>`;
    });
    
    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron proveedores</td></tr>';
    }
}

function limpiarBusquedaProveedores() {
    document.getElementById('proveedorBusqueda').value = '';
    renderProveedoresTable();
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
        
        const espacioCell = `<span class="estacionamiento-espacio" style="background: ${esp.color_asignado}">${esp.numero_espacio}</span>`;
        const inquilinoText = esp.inquilino_nombre || '-';
        const despachoText = esp.numero_despacho || '-';
        
        row.innerHTML = `<td>${espacioCell}</td><td>${inquilinoText}</td><td>${despachoText}</td>`;
    });
}

// ============================================
// NÚMEROS PAGE (antigua Home)
// ============================================

function populateYearSelect() {
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('homeYear');
    yearSelect.innerHTML = '';
    
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

let currentHomeTable = null;

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
        const row = tbody.insertRow();
        row.className = 'clickable';
        row.onclick = () => showInquilinoDetail(p.inquilinoId);
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

function renderHomePagosDetalle() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const tbodyPorPagar = document.getElementById('homeFacturasPorPagarTable').querySelector('tbody');
    const tbodyPagadas = document.getElementById('homeFacturasPagadasTable').querySelector('tbody');
    tbodyPorPagar.innerHTML = '';
    tbodyPagadas.innerHTML = '';
    
    const porPagar = [];
    const pagadas = [];
    let totalPorPagar = 0;
    let totalPagadas = 0;
    
    proveedores.forEach(prov => {
        if (prov.facturas) {
            prov.facturas.forEach(f => {
                if (!f.fecha_pago) {
                    porPagar.push({
                        proveedor: prov.nombre,
                        proveedorId: prov.id,
                        monto: f.monto,
                        vencimiento: f.vencimiento
                    });
                    totalPorPagar += f.monto;
                } else {
                    const pd = new Date(f.fecha_pago + 'T00:00:00');
                    if (pd.getMonth() === currentMonth && pd.getFullYear() === currentYear) {
                        pagadas.push({
                            proveedor: prov.nombre,
                            proveedorId: prov.id,
                            monto: f.monto,
                            fecha: f.fecha_pago
                        });
                        totalPagadas += f.monto;
                    }
                }
            });
        }
    });
    
    porPagar.sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento));
    const isMobile = window.innerWidth <= 768;
    porPagar.forEach(f => {
        const row = tbodyPorPagar.insertRow();
        row.className = 'clickable';
        row.onclick = () => showProveedorDetail(f.proveedorId);
        const proveedorText = isMobile && f.proveedor.length > 22 ? f.proveedor.substring(0, 22) + '...' : f.proveedor;
        row.innerHTML = `<td class="proveedor-truncate">${proveedorText}</td><td class="currency">${formatCurrency(f.monto)}</td><td>${formatDateVencimiento(f.vencimiento)}</td>`;
    });
    
    if (porPagar.length === 0) {
        tbodyPorPagar.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay facturas por pagar</td></tr>';
    } else {
        const row = tbodyPorPagar.insertRow();
        row.className = 'total-row';
        row.innerHTML = `<td style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(totalPorPagar)}</strong></td><td></td>`;
    }
    
    pagadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    pagadas.forEach(f => {
        const row = tbodyPagadas.insertRow();
        row.className = 'clickable';
        row.onclick = () => showProveedorDetail(f.proveedorId);
        const proveedorText = isMobile && f.proveedor.length > 22 ? f.proveedor.substring(0, 22) + '...' : f.proveedor;
        row.innerHTML = `<td class="proveedor-truncate">${proveedorText}</td><td class="currency">${formatCurrency(f.monto)}</td><td>${formatDate(f.fecha)}</td>`;
    });
    
    if (pagadas.length === 0) {
        tbodyPagadas.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay facturas pagadas este mes</td></tr>';
    } else {
        const row = tbodyPagadas.insertRow();
        row.className = 'total-row';
        row.innerHTML = `<td style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(totalPagadas)}</strong></td><td></td>`;
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
        }
    }
}

// ============================================
// CONTACTOS RENDERING
// ============================================

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

// ============================================
// YEAR SELECTS
// ============================================

function populateInquilinosYearSelects() {
    const currentYear = new Date().getFullYear();
    const select = document.getElementById('inquilinosRentasYear');
    select.innerHTML = '';
    
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        select.appendChild(option);
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

// ============================================
// VIEW DOCUMENTS
// ============================================

function viewContrato() {
    const inq = inquilinos.find(i => i.id === currentInquilinoId);
    if (inq.contrato_file) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe width='100%' height='100%' src='${inq.contrato_file}'></iframe>`);
    }
}

function viewContratoDirect(id) {
    const inq = inquilinos.find(i => i.id === id);
    if (inq.contrato_file) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe width='100%' height='100%' src='${inq.contrato_file}'></iframe>`);
    }
}

function viewDocumento(archivo) {
    if (archivo) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe width='100%' height='100%' src='${archivo}'></iframe>`);
    }
}

function viewFacturaDoc(archivo) {
    if (archivo) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe width='100%' height='100%' src='${archivo}'></iframe>`);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateIVA() {
    const monto = parseFloat(document.getElementById('facturaMonto').value);
    if (!isNaN(monto) && monto > 0) {
        const iva = monto * 0.16 / 1.16;
        document.getElementById('facturaIVA').value = iva.toFixed(2);
    }
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

function populateProveedoresDropdown() {
    const select = document.getElementById('activoProveedor');
    select.innerHTML = '<option value="">-- Seleccione un proveedor --</option>';
    
    proveedores.forEach(prov => {
        const option = document.createElement('option');
        option.value = prov.nombre;
        option.textContent = prov.nombre;
        select.appendChild(option);
    });
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
// ADICIONALES
// ============================================

function showAgregarDocumentoModal() {
    document.getElementById('nuevoDocNombre').value = '';
    document.getElementById('nuevoDocPDF').value = '';
    document.getElementById('nuevoDocPDFFileName').textContent = '';
    document.getElementById('agregarDocumentoModal').classList.add('active');
}

async function deleteDocumentoAdicional(docId) {
    if (!confirm('¿Eliminar este documento?')) return;
    
    showLoading();
    try {
        const { error } = await supabaseClient
            .from('inquilinos_documentos')
            .delete()
            .eq('id', docId);
        
        if (error) throw error;
        
        await loadInquilinos();
        showInquilinoDetail(currentInquilinoId);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar documento: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ============================================
// MODALS - PROVEEDORES Y ACTIVOS
// ============================================

function showAddProveedorModal() {
    isEditMode = false;
    currentProveedorId = null;
    tempProveedorContactos = [];
    
    document.getElementById('addProveedorTitle').textContent = 'Agregar Proveedor';
    document.getElementById('proveedorForm').reset();
    document.getElementById('proveedorContactosList').innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
    document.getElementById('provDocAdicionalFileName').textContent = '';
    document.getElementById('nombreProvDocGroup').classList.add('hidden');
    
    document.getElementById('addProveedorModal').classList.add('active');
}

function showAddActivoModal() {
    isEditMode = false;
    currentActivoId = null;
    
    document.getElementById('addActivoTitle').textContent = 'Agregar Activo';
    document.getElementById('activoForm').reset();
    document.getElementById('activoFotosFileName').textContent = '';
    
    populateProveedoresDropdown();
    
    document.getElementById('addActivoModal').classList.add('active');
}

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

function showAddUsuarioModal() {
    isEditMode = false;
    currentUsuarioId = null;
    
    document.getElementById('addUsuarioTitle').textContent = 'Agregar Usuario';
    document.getElementById('usuarioForm').reset();
    document.getElementById('addUsuarioModal').classList.add('active');
}

// ============================================
// LOADING FUNCTIONS
// ============================================

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// ============================================
// FILE CONVERSION
// ============================================

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
// ============================================
// FILE INPUT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Inquilino Contrato
    const inquilinoContrato = document.getElementById('inquilinoContrato');
    if (inquilinoContrato) {
        inquilinoContrato.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('contratoFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    // Nuevo Doc PDF
    const nuevoDocPDF = document.getElementById('nuevoDocPDF');
    if (nuevoDocPDF) {
        nuevoDocPDF.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('nuevoDocPDFFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    // Proveedor Doc Adicional
    const proveedorDocAdicional = document.getElementById('proveedorDocAdicional');
    if (proveedorDocAdicional) {
        proveedorDocAdicional.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('provDocAdicionalFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
            
            const nombreDocGroup = document.getElementById('nombreProvDocGroup');
            if (fileName) {
                nombreDocGroup.classList.remove('hidden');
                document.getElementById('proveedorNombreDoc').required = true;
            } else {
                nombreDocGroup.classList.add('hidden');
                document.getElementById('proveedorNombreDoc').required = false;
            }
        });
    }
    
    // Factura Documento
    const facturaDocumento = document.getElementById('facturaDocumento');
    if (facturaDocumento) {
        facturaDocumento.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('facturaDocumentoFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    // Pago PDF Factura
    const pagoPDFFactura = document.getElementById('pagoPDFFactura');
    if (pagoPDFFactura) {
        pagoPDFFactura.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('pagoPDFFacturaFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
    
    // Activo Fotos
    const activoFotos = document.getElementById('activoFotos');
    if (activoFotos) {
        activoFotos.addEventListener('change', function() {
            const count = this.files.length;
            document.getElementById('activoFotosFileName').textContent = count > 0 ? `${count} foto(s) seleccionada(s)` : '';
        });
    }
    
    // Banco Documento
    const bancoDocumento = document.getElementById('bancoDocumento');
    if (bancoDocumento) {
        bancoDocumento.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '';
            document.getElementById('bancoDocumentoFileName').textContent = fileName ? `Seleccionado: ${fileName}` : '';
        });
    }
});

// ============================================
// CLOSE DROPDOWNS ON OUTSIDE CLICK
// ============================================

window.addEventListener('click', function(e) {
    if (!e.target.matches('.dropdown-toggle')) {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
});

// ============================================
// LOGOUT FUNCTION
// ============================================

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        // No borrar el usuario recordado, solo cerrar sesión
        document.getElementById('appContainer').classList.remove('active');
        document.getElementById('loginContainer').classList.remove('hidden');
        document.body.classList.remove('logged-in');
        
        // Resetear al menú principal
        regresaMainMenu();
    }
}

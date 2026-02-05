/* ========================================
   ESWU - UI FUNCTIONS COMPLETO
   ======================================== */

// ============================================
// VARIABLES DE ESTADO
// ============================================

let currentMenuContext = 'main';
let currentSubContext = null;
let currentSearchContext = null;

// ============================================
// LOADING FUNCTIONS
// ============================================

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// ============================================
// FORMAT FUNCTIONS
// ============================================

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
// NAVIGATION FUNCTIONS
// ============================================

function showSubMenu(menu) {
    console.log('📂 Mostrando submenú:', menu);
    
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
}

function handleRegresa() {
    console.log('⬅️ Regresando al menú');
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    if (currentMenuContext === 'inquilinos') {
        document.getElementById('inquilinosSubMenu').classList.add('active');
    } else if (currentMenuContext === 'proveedores') {
        document.getElementById('proveedoresSubMenu').classList.add('active');
    } else if (currentMenuContext === 'admin') {
        document.getElementById('adminSubMenu').classList.add('active');
    }
    
    currentSubContext = null;
    document.getElementById('btnRegresa').classList.add('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
    document.getElementById('menuSidebar').classList.remove('hidden');
    document.getElementById('contentArea').classList.remove('fullwidth');
    document.getElementById('contentArea').classList.add('with-submenu');
}

// ============================================
// INQUILINOS - VIEWS
// ============================================

function showInquilinosView(view) {
    console.log('📋 Mostrando vista de inquilinos:', view);
    
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
        renderInquilinosTable();
    } else if (view === 'rentasRecibidas') {
        document.getElementById('inquilinosRentasRecibidasView').classList.remove('hidden');
        populateInquilinosYearSelects();
        renderInquilinosRentasRecibidas();
    } else if (view === 'vencimientoContratos') {
        document.getElementById('inquilinosVencimientoContratosView').classList.remove('hidden');
        renderInquilinosVencimientoContratos();
    }
}

function renderInquilinosTable() {
    console.log('🔄 Renderizando tabla de inquilinos...', inquilinos.length, 'registros');
    
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
        
        row.innerHTML = `
            <td>${inq.nombre}</td>
            <td class="currency">${formatCurrency(inq.renta)}</td>
            <td>${formatDateVencimiento(inq.fecha_vencimiento)}</td>
        `;
    });
    
    console.log('✅ Tabla de inquilinos renderizada');
}

function renderInquilinosRentasRecibidas() {
    console.log('💰 Renderizando rentas recibidas...');
    
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
        row.innerHTML = `
            <td>${r.empresa}</td>
            <td class="currency">${formatCurrency(r.monto)}</td>
            <td>${formatDate(r.fecha)}</td>
        `;
    });
    
    if (rentas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light);padding:2rem">No hay rentas en este periodo</td></tr>';
    } else {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        if (filterType === 'mensual') {
            const rowTotal = tbody.insertRow();
            rowTotal.style.fontWeight = 'bold';
            rowTotal.style.backgroundColor = '#e6f2ff';
            rowTotal.innerHTML = `
                <td style="text-align:right;padding:1rem;font-size:1.1rem">TOTAL ${monthNames[month].toUpperCase()} ${year}:</td>
                <td class="currency" style="color:var(--primary);font-size:1.2rem">${formatCurrency(totalPeriodo)}</td>
                <td></td>
            `;
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
        rowAnual.innerHTML = `
            <td style="text-align:right;padding:1rem;font-size:1.1rem">TOTAL ${year}:</td>
            <td class="currency" style="color:var(--success);font-size:1.2rem">${formatCurrency(totalAnual)}</td>
            <td></td>
        `;
    }
    
    console.log('✅ Rentas renderizadas:', rentas.length);
}

function renderInquilinosVencimientoContratos() {
    console.log('📅 Renderizando vencimiento de contratos...');
    
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
        row.innerHTML = `
            <td>${inq.nombre}</td>
            <td>${formatDate(inq.fecha_inicio)}</td>
            <td>${formatDate(inq.fecha_vencimiento)}</td>
            <td style="text-align:center">${diffDays}</td>
            <td><span class="badge ${badgeClass}">${estado}</span></td>
        `;
    });
    
    if (inquilinos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:2rem">No hay contratos</td></tr>';
    }
    
    console.log('✅ Contratos renderizados:', inquilinos.length);
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
    
    console.log('✅ Selectores de año inicializados');
}

// ============================================
// INQUILINO DETAIL MODAL CON TABS
// ============================================

function showInquilinoDetailModal(id) {
    const inq = inquilinos.find(i => i.id === id);
    
    if (!inq) {
        alert('ERROR: Inquilino no encontrado');
        return;
    }
    
    currentInquilinoId = id;
    
    // Llenar datos básicos
    document.getElementById('inquilinoDetailNombre').textContent = inq.nombre;
    
    // Contactos
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
    
    // RFC y CLABE
    document.getElementById('detailRFC').textContent = inq.rfc || '-';
    document.getElementById('detailClabe').textContent = inq.clabe || '-';
    
    // Datos de renta
    document.getElementById('detailRenta').textContent = formatCurrency(inq.renta);
    document.getElementById('detailM2').textContent = inq.m2 || '-';
    document.getElementById('detailDespacho').textContent = inq.numero_despacho || '-';
    document.getElementById('detailFechaInicio').textContent = formatDate(inq.fecha_inicio);
    document.getElementById('detailFechaVenc').innerHTML = formatDateVencimiento(inq.fecha_vencimiento);
    
    // Historial de pagos
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
    
    // Contrato original
    const contratoSection = document.getElementById('contratoOriginalSection');
    if (inq.contrato_file) {
        contratoSection.innerHTML = '<a href="#" onclick="event.preventDefault(); viewPDF(\'' + inq.contrato_file + '\');" class="btn btn-primary">📄 Ver Contrato</a>';
    } else {
        contratoSection.innerHTML = '<p style="color:var(--text-light)">No hay contrato cargado</p>';
    }
    
    // Documentos adicionales
    const docsDiv = document.getElementById('documentosAdicionales');
    if (inq.documentos && inq.documentos.length > 0) {
        docsDiv.innerHTML = inq.documentos.map(d => `
            <div class="doc-item">
                <span onclick="viewPDF('${d.archivo}')" style="cursor:pointer;color:var(--primary)">${d.nombre}</span>
                <small style="color:var(--text-light)">${formatDate(d.fecha)} - ${d.usuario}</small>
            </div>
        `).join('');
    } else {
        docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay documentos adicionales</p>';
    }
    
    // Notas
    document.getElementById('notasInquilino').textContent = inq.notas || 'No hay notas para este inquilino.';
    
    // Mostrar modal y activar primera tab
    document.getElementById('inquilinoDetailModal').classList.add('active');
    switchTab('inquilino', 'renta');
    
    console.log('📋 Modal de detalle abierto para:', inq.nombre);
}

function viewPDF(base64Data) {
    const newWindow = window.open();
    newWindow.document.write(`<iframe width='100%' height='100%' src='${base64Data}'></iframe>`);
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
// PROVEEDORES - VIEWS
// ============================================

function showProveedoresView(view) {
    console.log('📋 Mostrando vista de proveedores:', view);
    
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
        renderProveedoresTable();
    } else if (view === 'facturasPagadas') {
        document.getElementById('proveedoresFacturasPagadasView').classList.remove('hidden');
    } else if (view === 'facturasPorPagar') {
        document.getElementById('proveedoresFacturasPorPagarView').classList.remove('hidden');
    }
}

function renderProveedoresTable() {
    console.log('🔄 Renderizando tabla de proveedores...', proveedores.length, 'registros');
    
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (!proveedores || proveedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#718096">No hay proveedores registrados</td></tr>';
        return;
    }
    
    proveedores.forEach(prov => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showProveedorDetail(prov.id);
        
        const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
        
        row.innerHTML = `
            <td>${prov.nombre}</td>
            <td>${prov.servicio || '-'}</td>
            <td>${primerContacto.nombre || '-'}</td>
            <td>${primerContacto.telefono || '-'}</td>
            <td>${primerContacto.email || '-'}</td>
        `;
    });
    
    console.log('✅ Tabla de proveedores renderizada');
}

function showProveedorDetail(id) {
    const prov = proveedores.find(p => p.id === id);
    
    if (!prov) {
        alert('ERROR: Proveedor no encontrado');
        return;
    }
    
    let contactosTexto = 'Sin contactos';
    if (prov.contactos && prov.contactos.length > 0) {
        contactosTexto = prov.contactos.map(c => 
            `  • ${c.nombre} - ${c.telefono || 'Sin tel'} - ${c.email || 'Sin email'}`
        ).join('\n');
    }
    
    let detalle = `📋 DETALLE DE PROVEEDOR

Nombre: ${prov.nombre}
Servicio: ${prov.servicio || 'N/A'}
RFC: ${prov.rfc || 'N/A'}
CLABE: ${prov.clabe || 'N/A'}

Contactos:
${contactosTexto}

Facturas: ${prov.facturas && prov.facturas.length > 0 ? prov.facturas.length + ' factura(s)' : 'Sin facturas'}

Notas: ${prov.notas || 'Sin notas'}`;
    
    alert(detalle);
    console.log('🏢 Detalle de proveedor:', prov);
}

// ============================================
// ADMIN VIEWS
// ============================================

function showAdminView(view) {
    console.log('⚙️ Mostrando vista admin:', view);
    
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    currentSubContext = 'admin-' + view;
    
    if (view === 'usuarios') {
        document.getElementById('adminUsuariosPage').classList.add('active');
    } else if (view === 'bancos') {
        document.getElementById('adminBancosPage').classList.add('active');
    }
}

function showActivosPage() {
    console.log('📦 Mostrando página de activos');
    
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('activosPage').classList.add('active');
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    currentSubContext = 'admin-activos';
}

function showNumerosPage() {
    console.log('🔢 Mostrando página de números');
    
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('numerosPage').classList.add('active');
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    currentSubContext = 'admin-numeros';
}

function showPageFromMenu(page) {
    console.log('📄 Mostrando página:', page);
    
    document.getElementById('adminSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + 'Page').classList.add('active');
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    currentSubContext = page;
}

// ============================================
// MODALS - AGREGAR INQUILINO
// ============================================

function showAddInquilinoModal() {
    isEditMode = false;
    currentInquilinoId = null;
    tempInquilinoContactos = [];
    
    document.getElementById('addInquilinoTitle').textContent = 'Agregar Inquilino';
    document.getElementById('inquilinoForm').reset();
    document.getElementById('inquilinoContactosList').innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
    document.getElementById('contratoFileName').textContent = '';
    
    document.getElementById('addInquilinoModal').classList.add('active');
    
    console.log('📝 Modal de agregar inquilino abierto');
}

function showAddProveedorModal() {
    isEditMode = false;
    currentProveedorId = null;
    tempProveedorContactos = [];
    
    document.getElementById('addProveedorTitle').textContent = 'Agregar Proveedor';
    document.getElementById('proveedorForm').reset();
    document.getElementById('proveedorContactosList').innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
    
    document.getElementById('addProveedorModal').classList.add('active');
    
    console.log('📝 Modal de agregar proveedor abierto');
}

function showAddActivoModal() {
    alert('Modal de agregar activo - En desarrollo');
}

function showAddUsuarioModal() {
    alert('Modal de agregar usuario - En desarrollo');
}

function showAddBancoModal() {
    alert('Modal de subir documento banco - En desarrollo');
}

// ============================================
// RENDER CONTACTOS LIST
// ============================================

function renderContactosList(contactos, containerId, deleteCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
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
// MODAL CLOSE
// ============================================

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

function toggleSearch() {
    alert('Búsqueda - En desarrollo');
}

function executeSearch() {
    alert('Ejecutar búsqueda - En desarrollo');
}

function clearSearch() {
    alert('Limpiar búsqueda - En desarrollo');
}

// ============================================
// LOGOUT
// ============================================

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        document.getElementById('appContainer').classList.remove('active');
        document.getElementById('loginContainer').classList.remove('hidden');
        document.body.classList.remove('logged-in');
        localStorage.removeItem('eswu_remembered_user');
        localStorage.removeItem('eswu_remembered_pass');
        
        currentMenuContext = 'main';
        currentSubContext = null;
        
        console.log('👋 Sesión cerrada');
    }
}

console.log('✅ UI.js cargado correctamente');

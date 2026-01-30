/* ========================================
   ESWU - UI FUNCTIONS
   All user interface and rendering functions
   ======================================== */

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
// NAVIGATION FUNCTIONS
// ============================================

function showPageFromMenu(pageName) {
    currentPageContext = pageName;
    document.getElementById('mainMenuDropdown').classList.remove('show');
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageName + 'Page').classList.add('active');
    
    const titleMap = {
        'home': 'ESWU',
        'inquilinos': 'ESWU - Inquilinos',
        'proveedores': 'ESWU - Proveedores',
        'activos': 'ESWU - Activos',
        'admin': 'ESWU - Administración',
        'estacionamiento': 'ESWU - Estacionamiento',
        'bitacora': 'ESWU - Bitácora Semanal'
    };
    document.getElementById('headerTitle').textContent = titleMap[pageName];
    
    const homeIcon = document.getElementById('homeIcon');
    homeIcon.style.display = pageName === 'home' ? 'none' : 'block';
    
    if (pageName === 'home') updateHomeView();
    if (pageName === 'inquilinos') showInquilinosView('list');
    if (pageName === 'proveedores') showProveedoresView('list');
    if (pageName === 'activos') renderActivosTable();
    if (pageName === 'estacionamiento') renderEstacionamientoTable();
    if (pageName === 'bitacora') renderBitacoraTable();
    // Admin se queda en blanco hasta que seleccionen una opción del menú
    
    updateMainMenuForPage();
}

function toggleMainMenu() {
    const dropdown = document.getElementById('mainMenuDropdown');
    dropdown.classList.toggle('show');
}

function updateMainMenuForPage() {
    const mainMenu = document.getElementById('mainMenuDropdown');
    mainMenu.innerHTML = '';
    mainMenu.className = 'main-menu-content';
    
    if (currentPageContext === 'inquilinos') {
        mainMenu.classList.add('inquilinos-menu');
        const links = [
            { text: 'Listado Inquilinos', action: () => showInquilinosView('list') },
            { text: 'Agregar Inquilino', action: () => showAddInquilinoModal() },
            { text: 'Rentas Recibidas', action: () => showInquilinosView('rentasRecibidas') },
            { text: 'Vencimiento Contratos', action: () => showInquilinosView('vencimientoContratos') }
        ];
        links.forEach(link => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = link.text;
            a.onclick = (e) => {
                e.preventDefault();
                document.getElementById('mainMenuDropdown').classList.remove('show');
                link.action();
            };
            mainMenu.appendChild(a);
        });
    } else if (currentPageContext === 'proveedores') {
        mainMenu.classList.add('proveedores-menu');
        const links = [
            { text: 'Listado Proveedores', action: () => showProveedoresView('list') },
            { text: 'Agregar Proveedor', action: () => showAddProveedorModal() },
            { text: 'Facturas Pagadas', action: () => showProveedoresView('facturasPagadas') },
            { text: 'Facturas Por Pagar', action: () => showProveedoresView('facturasPorPagar') }
        ];
        links.forEach(link => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = link.text;
            a.onclick = (e) => {
                e.preventDefault();
                document.getElementById('mainMenuDropdown').classList.remove('show');
                link.action();
            };
            mainMenu.appendChild(a);
        });
    } else if (currentPageContext === 'activos') {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Agregar Activo';
        a.onclick = (e) => {
            e.preventDefault();
            document.getElementById('mainMenuDropdown').classList.remove('show');
            showAddActivoModal();
        };
        mainMenu.appendChild(a);
    } else if (currentPageContext === 'admin') {
        mainMenu.classList.add('admin-menu');
        const links = [
            { text: 'Usuarios', action: () => showAdminView('usuarios') },
            { text: 'Bancos', action: () => showAdminView('bancos') },
            { text: 'Estacionamiento', action: () => showPageFromMenu('estacionamiento') },
            { text: 'Bitácora Semanal', action: () => showPageFromMenu('bitacora') }
        ];
        links.forEach(link => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = link.text;
            a.onclick = (e) => {
                e.preventDefault();
                document.getElementById('mainMenuDropdown').classList.remove('show');
                link.action();
            };
            mainMenu.appendChild(a);
        });
    } else {
        const pages = [
            { id: 'inquilinos', name: 'Inquilinos' },
            { id: 'proveedores', name: 'Proveedores' },
            { id: 'activos', name: 'Activos' },
            { id: 'admin', name: 'Administración' }
        ];
        pages.forEach(page => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = page.name;
            a.onclick = (e) => {
                e.preventDefault();
                showPageFromMenu(page.id);
            };
            mainMenu.appendChild(a);
        });
        
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Salir';
        logoutLink.onclick = (e) => {
            e.preventDefault();
            logout();
        };
        mainMenu.appendChild(logoutLink);
    }
}

// ============================================
// HOME PAGE
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
                if (fact.fechaPago) {
                    const pd = new Date(fact.fechaPago + 'T00:00:00');
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
                if (!f.fechaPago) {
                    porPagar.push({
                        proveedor: prov.nombre,
                        proveedorId: prov.id,
                        monto: f.monto,
                        vencimiento: f.vencimiento
                    });
                    totalPorPagar += f.monto;
                } else {
                    const pd = new Date(f.fechaPago + 'T00:00:00');
                    if (pd.getMonth() === currentMonth && pd.getFullYear() === currentYear) {
                        pagadas.push({
                            proveedor: prov.nombre,
                            proveedorId: prov.id,
                            monto: f.monto,
                            fecha: f.fechaPago
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
    if (inq.contratoFile) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe width='100%' height='100%' src='${inq.contratoFile}'></iframe>`);
    }
}

function viewContratoDirect(id) {
    const inq = inquilinos.find(i => i.id === id);
    if (inq.contratoFile) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe width='100%' height='100%' src='${inq.contratoFile}'></iframe>`);
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
// INQUILINOS - VIEWS
// ============================================

function showInquilinosView(view) {
    document.getElementById('inquilinosListView').classList.add('hidden');
    document.getElementById('inquilinosRentasRecibidasView').classList.add('hidden');
    document.getElementById('inquilinosVencimientoContratosView').classList.add('hidden');
    
    const titulo = document.getElementById('inquilinosTitulo');
    if (view === 'list') {
        titulo.textContent = 'Inquilinos - Listado';
        document.getElementById('inquilinosListView').classList.remove('hidden');
        renderInquilinosTable();
    } else if (view === 'rentasRecibidas') {
        titulo.textContent = 'Inquilinos - Rentas Recibidas';
        document.getElementById('inquilinosRentasRecibidasView').classList.remove('hidden');
        renderInquilinosRentasRecibidas();
    } else if (view === 'vencimientoContratos') {
        titulo.textContent = 'Inquilinos - Vencimiento Contratos';
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
        
        // Limitar nombre a 25 caracteres
        const nombreCorto = inq.nombre.length > 25 ? inq.nombre.substring(0, 25) + '...' : inq.nombre;
        
        row.innerHTML = `<td style="font-size:0.9rem">${nombreCorto}</td><td class="currency">${formatCurrency(inq.renta)}</td><td>${formatDateVencimiento(inq.fechaVencimiento)}</td>`;
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
        const venc = new Date(inq.fechaVencimiento + 'T00:00:00');
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
        row.innerHTML = `<td>${inq.nombre}</td><td>${formatDate(inq.fechaInicio)}</td><td>${formatDateVencimiento(inq.fechaVencimiento)}</td><td>${diffDays}</td><td><span class="badge ${badgeClass}">${estado}</span></td>`;
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
    document.getElementById('detailDespacho').textContent = inq.numeroDespacho || '-';
    document.getElementById('detailFechaInicio').textContent = formatDate(inq.fechaInicio);
    document.getElementById('detailFechaVenc').innerHTML = formatDateVencimiento(inq.fechaVencimiento);
    
    // Ajuste 4: Contrato como link simple
    const contratoSection = document.getElementById('contratoOriginalSection');
    if (inq.contratoFile) {
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
    
    // Ajuste 6: Agregar botón X para eliminar documentos
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
    
    // Ajuste 8: Mostrar notas
    document.getElementById('notasInquilino').textContent = inq.notas || 'No hay notas para este inquilino.';
    
    document.getElementById('inquilinoDetailModal').classList.add('active');
    switchTab('inquilino', 'renta');
}

// ============================================
// PROVEEDORES - VIEWS
// ============================================

function showProveedoresView(view) {
    document.getElementById('proveedoresListView').classList.add('hidden');
    document.getElementById('proveedoresFacturasPagadasView').classList.add('hidden');
    document.getElementById('proveedoresFacturasPorPagarView').classList.add('hidden');
    
    const titulo = document.getElementById('proveedoresTitulo');
    if (view === 'list') {
        titulo.textContent = 'Proveedores - Listado';
        document.getElementById('proveedoresListView').classList.remove('hidden');
        renderProveedoresTable();
    } else if (view === 'facturasPagadas') {
        titulo.textContent = 'Proveedores - Facturas Pagadas';
        document.getElementById('proveedoresFacturasPagadasView').classList.remove('hidden');
        renderProveedoresFacturasPagadas();
    } else if (view === 'facturasPorPagar') {
        titulo.textContent = 'Proveedores - Facturas X Pagar';
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
                if (f.fechaPago) {
                    const pd = new Date(f.fechaPago + 'T00:00:00');
                    if (pd.getFullYear() === year && (month === null || pd.getMonth() === month)) {
                        pagadas.push({
                            proveedor: prov.nombre,
                            numero: f.numero || 'S/N',
                            monto: f.monto,
                            fecha: f.fechaPago,
                            documentoFile: f.documentoFile,
                            pagoFile: f.pagoFile
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
        const facturaCell = f.documentoFile 
            ? `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;cursor:pointer;color:var(--primary)" onclick="viewFacturaDoc('${f.documentoFile}')">${f.numero}</td>`
            : `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${f.numero}</td>`;
        const fechaCell = f.pagoFile
            ? `<td style="cursor:pointer;color:var(--primary)" onclick="viewFacturaDoc('${f.pagoFile}')">${formatDate(f.fecha)}</td>`
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
                if (!f.fechaPago) {
                    const vd = new Date(f.vencimiento + 'T00:00:00');
                    if (vd.getFullYear() === year && (month === null || month === vd.getMonth())) {
                        porPagar.push({
                            provId: prov.id,
                            factId: f.id,
                            proveedor: prov.nombre,
                            numero: f.numero || 'S/N',
                            monto: f.monto,
                            vencimiento: f.vencimiento,
                            documentoFile: f.documentoFile
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
        if (f.documentoFile) {
            row.onclick = () => viewFacturaDoc(f.documentoFile);
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
    const facturasPagadas = prov.facturas.filter(f => f.fechaPago);
    let totalPagadas = 0;
    
    if (facturasPagadas.length > 0) {
        facturasPagadasDiv.innerHTML = facturasPagadas.map(f => {
            totalPagadas += f.monto;
            const facturaLink = f.documentoFile 
                ? `<a href="#" class="pdf-link" onclick="event.preventDefault(); viewFacturaDoc('${f.documentoFile}')">Factura</a>` 
                : '';
            const pagoLink = f.pagoFile 
                ? `<a href="#" class="pdf-link" onclick="event.preventDefault(); viewFacturaDoc('${f.pagoFile}')">Pago</a>` 
                : '';
            return `
                <div class="payment-item">
                    <div class="payment-item-content">
                        <div><strong>Factura ${f.numero || 'S/N'}</strong> del <strong>${formatDate(f.fecha)}</strong> pagada el <strong>${formatDate(f.fechaPago)}</strong></div>
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
    const facturasPorPagar = prov.facturas.filter(f => !f.fechaPago);
    let totalPorPagar = 0;
    const isMobile = window.innerWidth <= 768;
    
    if (facturasPorPagar.length > 0) {
        if (isMobile) {
            facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
                totalPorPagar += f.monto;
                const verLink = f.documentoFile 
                    ? `<button class="btn btn-sm btn-secondary" onclick="viewFacturaDoc('${f.documentoFile}')">Ver</button>` 
                    : '';
                return `
                    <div class="payment-item">
                        <div class="payment-item-content" style="width:100%">
                            <div><strong>Factura ${f.numero || 'S/N'}</strong> del <strong>${formatDate(f.fecha)}</strong>, vence el <strong>${formatDate(f.vencimiento)}</strong></div>
                            <div style="margin-top:0.5rem;display:flex;gap:0.5rem;flex-wrap:wrap">
                                ${verLink}
                                <button class="btn btn-sm btn-primary" onclick="showPagarFacturaModal(${f.id})">Dar X Pagada</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteFactura(${f.id})">Eliminar</button>
                            </div>
                            <div style="margin-top:0.5rem;text-align:right"><strong>${formatCurrency(f.monto)}</strong></div>
                        </div>
                    </div>
                `;
            }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem">TOTAL: <strong>${formatCurrency(totalPorPagar)}</strong></div>`;
        } else {
            facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
                totalPorPagar += f.monto;
                const verLink = f.documentoFile 
                    ? `<button class="btn btn-sm btn-secondary" onclick="viewFacturaDoc('${f.documentoFile}')">Ver</button>` 
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
// ACTIVOS
// ============================================

function renderActivosTable() {
    const tbody = document.getElementById('activosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    activos.forEach(act => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => showActivoDetail(act.id);
        row.innerHTML = `<td>${act.nombre}</td><td>${formatDate(act.ultimoMant)}</td><td>${formatDate(act.proximoMant)}</td><td>${act.proveedor || '-'}</td>`;
    });
    
    if (activos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light)">No hay activos</td></tr>';
    }
}

function showActivoDetail(id) {
    const act = activos.find(a => a.id === id);
    currentActivoId = id;
    
    document.getElementById('activoDetailNombre').textContent = act.nombre;
    document.getElementById('detailUltimoMant').textContent = formatDate(act.ultimoMant);
    document.getElementById('detailProximoMant').textContent = formatDate(act.proximoMant);
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
// ADMIN
// ============================================

function showAdminView(view) {
    document.getElementById('adminUsuariosView').classList.add('hidden');
    document.getElementById('adminBancosView').classList.add('hidden');
    
    const titulo = document.getElementById('adminTitulo');
    if (view === 'usuarios') {
        titulo.textContent = 'Administración - Usuarios';
        document.getElementById('adminUsuariosView').classList.remove('hidden');
        renderUsuariosTable();
    } else if (view === 'bancos') {
        titulo.textContent = 'Administración - Bancos';
        document.getElementById('adminBancosView').classList.remove('hidden');
        renderBancosTable();
    }
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
        row.onclick = () => viewDocumento(b.archivoPdf);
        row.innerHTML = `<td>${b.tipo}</td><td>${formatDate(b.fechaSubida)}</td>`;
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
// FUNCIONES ADICIONALES - AJUSTES
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
// ESTACIONAMIENTO
// ============================================

function renderEstacionamientoTable() {
    const tbody = document.getElementById('estacionamientoTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    estacionamiento.forEach(esp => {
        const row = tbody.insertRow();
        row.onclick = () => showEditEstacionamientoModal(esp.id);
        row.style.cursor = 'pointer';
        
        const espacioCell = `<span class="estacionamiento-espacio" style="background: ${esp.colorAsignado}">${esp.numeroEspacio}</span>`;
        const inquilinoText = esp.inquilinoNombre || '-';
        const despachoText = esp.numeroDespacho || '-';
        
        row.innerHTML = `<td>${espacioCell}</td><td>${inquilinoText}</td><td>${despachoText}</td>`;
    });
}

function showEditEstacionamientoModal(espacioId) {
    const espacio = estacionamiento.find(e => e.id === espacioId);
    currentEstacionamientoId = espacioId;
    
    document.getElementById('editEspacioNumero').textContent = espacio.numeroEspacio;
    
    // Poblar dropdown con inquilinos
    const select = document.getElementById('editEspacioInquilino');
    select.innerHTML = '<option value="">-- Seleccione --</option><option value="VISITAS">VISITAS</option>';
    inquilinos.forEach(inq => {
        const option = document.createElement('option');
        option.value = inq.nombre;
        option.textContent = inq.nombre;
        if (inq.nombre === espacio.inquilinoNombre) option.selected = true;
        select.appendChild(option);
    });
    
    document.getElementById('editEspacioDespacho').value = espacio.numeroDespacho || '';
    
    // Actualizar despacho al cambiar inquilino
    select.onchange = function() {
        const selectedInquilino = inquilinos.find(i => i.nombre === this.value);
        document.getElementById('editEspacioDespacho').value = selectedInquilino?.numeroDespacho || '';
    };
    
    document.getElementById('editEstacionamientoModal').classList.add('active');
}

// ============================================
// BITÁCORA SEMANAL
// ============================================

function renderBitacoraTable() {
    const tbody = document.getElementById('bitacoraTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    bitacoraSemanal.forEach(sem => {
        const row = tbody.insertRow();
        row.onclick = () => showEditBitacoraModal(sem.id);
        row.style.cursor = 'pointer';
        
        const notasPreview = sem.notas ? (sem.notas.substring(0, 100) + '...') : 'Sin notas';
        row.innerHTML = `<td><strong>${sem.semanaTexto}</strong></td><td>${notasPreview}</td>`;
    });
}

function showEditBitacoraModal(bitacoraId) {
    const bitacora = bitacoraSemanal.find(b => b.id === bitacoraId);
    currentBitacoraId = bitacoraId;
    
    document.getElementById('editBitacoraSemana').textContent = bitacora.semanaTexto;
    document.getElementById('editBitacoraNotas').value = bitacora.notas || '';
    
    document.getElementById('editBitacoraModal').classList.add('active');
}

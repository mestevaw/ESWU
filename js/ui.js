/* ESWU - UI FUNCTIONS COMPLETO */

let currentMenuContext = 'main';
let currentSubContext = null;
let currentSearchContext = null;

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

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

function showSubMenu(menu) {
    // Quitar active de todos los botones
    document.getElementById('menuInquilinos').classList.remove('active');
    document.getElementById('menuProveedores').classList.remove('active');
    document.getElementById('menuAdmin').classList.remove('active');
    
    // Ocultar todos los submenús
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    document.getElementById('adminSubMenu').classList.remove('active');
    
    // Mostrar submenú correspondiente
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
    
    // Ajustar content-area
    document.getElementById('contentArea').classList.add('with-submenu');
    document.getElementById('btnRegresa').classList.add('hidden');
}

function handleRegresa() {
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar submenú correspondiente
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
// INQUILINOS VIEWS
// ============================================

function showInquilinosView(view) {
    console.log('📋 Mostrando vista de inquilinos:', view);
    
    // Ocultar submenú
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar página de inquilinos
    document.getElementById('inquilinosPage').classList.add('active');
    
    // Ocultar todas las vistas de inquilinos
    document.getElementById('inquilinosListView').classList.add('hidden');
    document.getElementById('inquilinosRentasRecibidasView').classList.add('hidden');
    document.getElementById('inquilinosVencimientoContratosView').classList.add('hidden');
    
    // Mostrar botón regresa
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    // Ocultar menú lateral y ajustar contenido
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    currentSubContext = 'inquilinos-' + view;
    
    // Mostrar vista específica
    if (view === 'list') {
        document.getElementById('inquilinosListView').classList.remove('hidden');
        document.getElementById('btnSearch').classList.remove('hidden');
        renderInquilinosTable();
    } else if (view === 'rentasRecibidas') {
        document.getElementById('inquilinosRentasRecibidasView').classList.remove('hidden');
        console.log('📊 Vista de rentas recibidas');
    } else if (view === 'vencimientoContratos') {
        document.getElementById('inquilinosVencimientoContratosView').classList.remove('hidden');
        console.log('📅 Vista de vencimiento de contratos');
    }
}

function renderInquilinosTable() {
    console.log('🔄 Renderizando tabla de inquilinos...');
    const tbody = document.getElementById('inquilinosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (inquilinos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem;color:#718096">No hay inquilinos registrados</td></tr>';
        console.log('⚠️ No hay inquilinos');
        return;
    }
    
    inquilinos.forEach(inq => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => alert('Ver detalle de: ' + inq.nombre);
        
        row.innerHTML = `
            <td>${inq.nombre}</td>
            <td class="currency">${formatCurrency(inq.renta || 0)}</td>
            <td>${formatDate(inq.fecha_vencimiento)}</td>
        `;
    });
    
    console.log('✅ Tabla renderizada con', inquilinos.length, 'inquilinos');
}

// ============================================
// PROVEEDORES VIEWS
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
        console.log('💰 Vista de facturas pagadas');
    } else if (view === 'facturasPorPagar') {
        document.getElementById('proveedoresFacturasPorPagarView').classList.remove('hidden');
        console.log('📄 Vista de facturas por pagar');
    }
}

function renderProveedoresTable() {
    console.log('🔄 Renderizando tabla de proveedores...');
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (proveedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#718096">No hay proveedores registrados</td></tr>';
        console.log('⚠️ No hay proveedores');
        return;
    }
    
    proveedores.forEach(prov => {
        const row = tbody.insertRow();
        row.style.cursor = 'pointer';
        row.onclick = () => alert('Ver detalle de: ' + prov.nombre);
        
        const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
        
        row.innerHTML = `
            <td>${prov.nombre}</td>
            <td>${prov.servicio || '-'}</td>
            <td>${primerContacto.nombre || '-'}</td>
            <td>${primerContacto.telefono || '-'}</td>
            <td>${primerContacto.email || '-'}</td>
        `;
    });
    
    console.log('✅ Tabla renderizada con', proveedores.length, 'proveedores');
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
        console.log('👥 Vista de usuarios');
    } else if (view === 'bancos') {
        document.getElementById('adminBancosPage').classList.add('active');
        console.log('🏦 Vista de bancos');
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
// MODAL FUNCTIONS (temporales)
// ============================================

function showAddInquilinoModal() {
    alert('Modal de agregar inquilino - En desarrollo');
}

function showAddProveedorModal() {
    alert('Modal de agregar proveedor - En desarrollo');
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
        
        // Reset estado
        currentMenuContext = 'main';
        currentSubContext = null;
        
        console.log('👋 Sesión cerrada');
    }
}

console.log('✅ UI.js COMPLETO cargado correctamente');

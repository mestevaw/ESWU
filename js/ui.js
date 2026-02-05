/* ========================================
   ESWU - UI FUNCTIONS
   ======================================== */

// ============================================
// NAVIGATION
// ============================================

function showSubMenu(menu) {
    console.log('Mostrando submenú:', menu);
    
    // Remover active de todos los botones
    document.getElementById('menuInquilinos').classList.remove('active');
    document.getElementById('menuProveedores').classList.remove('active');
    document.getElementById('menuAdmin').classList.remove('active');
    
    // Ocultar todos los submenús
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    document.getElementById('adminSubMenu').classList.remove('active');
    
    // Mostrar el submenú correcto
    if (menu === 'inquilinos') {
        document.getElementById('inquilinosSubMenu').classList.add('active');
        document.getElementById('menuInquilinos').classList.add('active');
    } else if (menu === 'proveedores') {
        document.getElementById('proveedoresSubMenu').classList.add('active');
        document.getElementById('menuProveedores').classList.add('active');
    } else if (menu === 'admin') {
        document.getElementById('adminSubMenu').classList.add('active');
        document.getElementById('menuAdmin').classList.add('active');
    }
    
    // Ocultar botón regresa
    document.getElementById('btnRegresa').classList.add('hidden');
    
    // Ajustar content area
    document.getElementById('contentArea').classList.add('with-submenu');
}

function handleRegresa() {
    console.log('Regresando...');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar el submenú que estaba activo
    const inquilinosActive = document.getElementById('menuInquilinos').classList.contains('active');
    const proveedoresActive = document.getElementById('menuProveedores').classList.contains('active');
    const adminActive = document.getElementById('menuAdmin').classList.contains('active');
    
    if (inquilinosActive) {
        document.getElementById('inquilinosSubMenu').classList.add('active');
    } else if (proveedoresActive) {
        document.getElementById('proveedoresSubMenu').classList.add('active');
    } else if (adminActive) {
        document.getElementById('adminSubMenu').classList.add('active');
    }
    
    // Ocultar botón regresa
    document.getElementById('btnRegresa').classList.add('hidden');
    
    // Ajustar content area
    document.getElementById('contentArea').classList.add('with-submenu');
}

// ============================================
// INQUILINOS VIEWS
// ============================================

function showInquilinosView(view) {
    console.log('Mostrando vista inquilinos:', view);
    
    // Ocultar submenú
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar página de inquilinos
    document.getElementById('inquilinosPage').classList.add('active');
    
    // Mostrar botón regresa
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    // Ajustar content area
    document.getElementById('contentArea').classList.remove('with-submenu');
    
    // Cambiar título según la vista
    if (view === 'list') {
        document.getElementById('inquilinosTitle').textContent = 'Listado de Inquilinos';
        renderInquilinosTable();
    } else if (view === 'rentas') {
        document.getElementById('inquilinosTitle').textContent = 'Rentas Recibidas';
        renderInquilinosRentas();
    } else if (view === 'contratos') {
        document.getElementById('inquilinosTitle').textContent = 'Vencimiento de Contratos';
        renderInquilinosContratos();
    }
}

function renderInquilinosTable() {
    const tbody = document.getElementById('inquilinosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (inquilinos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem;color:var(--text-light)">No hay inquilinos registrados</td></tr>';
        return;
    }
    
    inquilinos.forEach(inq => {
        const row = tbody.insertRow();
        row.className = 'clickable';
        row.onclick = () => alert('Click en: ' + inq.nombre);
        
        row.innerHTML = `
            <td>${inq.nombre}</td>
            <td class="currency">$${Number(inq.renta || 0).toLocaleString('es-MX')}</td>
            <td>${formatDate(inq.fecha_vencimiento)}</td>
        `;
    });
    
    console.log('✅ Tabla inquilinos renderizada');
}

function renderInquilinosRentas() {
    const tbody = document.getElementById('inquilinosTable').querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem">Vista de Rentas - Por implementar</td></tr>';
}

function renderInquilinosContratos() {
    const tbody = document.getElementById('inquilinosTable').querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem">Vista de Contratos - Por implementar</td></tr>';
}

// ============================================
// PROVEEDORES VIEWS
// ============================================

function showProveedoresView(view) {
    console.log('Mostrando vista proveedores:', view);
    
    // Ocultar submenú
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar página de proveedores
    document.getElementById('proveedoresPage').classList.add('active');
    
    // Mostrar botón regresa
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    // Ajustar content area
    document.getElementById('contentArea').classList.remove('with-submenu');
    
    // Cambiar título según la vista
    if (view === 'list') {
        document.getElementById('proveedoresTitle').textContent = 'Listado de Proveedores';
        renderProveedoresTable();
    } else if (view === 'pagadas') {
        document.getElementById('proveedoresTitle').textContent = 'Facturas Pagadas';
        renderProveedoresPagadas();
    } else if (view === 'porpagar') {
        document.getElementById('proveedoresTitle').textContent = 'Facturas Por Pagar';
        renderProveedoresPorPagar();
    }
}

function renderProveedoresTable() {
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    if (proveedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem;color:var(--text-light)">No hay proveedores registrados</td></tr>';
        return;
    }
    
    proveedores.forEach(prov => {
        const row = tbody.insertRow();
        row.className = 'clickable';
        row.onclick = () => alert('Click en: ' + prov.nombre);
        
        row.innerHTML = `
            <td>${prov.nombre}</td>
            <td>${prov.servicio || '-'}</td>
            <td>-</td>
        `;
    });
    
    console.log('✅ Tabla proveedores renderizada');
}

function renderProveedoresPagadas() {
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem">Vista de Facturas Pagadas - Por implementar</td></tr>';
}

function renderProveedoresPorPagar() {
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem">Vista de Facturas Por Pagar - Por implementar</td></tr>';
}

// ============================================
// ADMIN VIEWS
// ============================================

function showAdminView(section) {
    console.log('Mostrando vista admin:', section);
    
    // Ocultar submenú
    document.getElementById('adminSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar página de admin
    document.getElementById('adminPage').classList.add('active');
    
    // Mostrar botón regresa
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    // Ajustar content area
    document.getElementById('contentArea').classList.remove('with-submenu');
    
    // Renderizar según sección
    if (section === 'activos') {
        document.getElementById('adminTitle').textContent = 'Activos';
        renderActivos();
    } else if (section === 'bancos') {
        document.getElementById('adminTitle').textContent = 'Bancos';
        renderBancos();
    } else if (section === 'bitacora') {
        document.getElementById('adminTitle').textContent = 'Bitácora';
        renderBitacora();
    } else if (section === 'estacionamiento') {
        document.getElementById('adminTitle').textContent = 'Estacionamiento';
        renderEstacionamiento();
    } else if (section === 'numeros') {
        document.getElementById('adminTitle').textContent = 'Números';
        renderNumeros();
    } else if (section === 'usuarios') {
        document.getElementById('adminTitle').textContent = 'Usuarios';
        renderUsuarios();
    }
}

function renderActivos() {
    const tbody = document.getElementById('adminTable').querySelector('tbody');
    tbody.innerHTML = '<tr><td style="text-align:center;padding:2rem">Vista Activos - Por implementar</td></tr>';
}

function renderBancos() {
    const tbody = document.getElementById('adminTable').querySelector('tbody');
    tbody.innerHTML = '<tr><td style="text-align:center;padding:2rem">Vista Bancos - Por implementar</td></tr>';
}

function renderBitacora() {
    const tbody = document.getElementById('adminTable').querySelector('tbody');
    tbody.innerHTML = '<tr><td style="text-align:center;padding:2rem">Vista Bitácora - Por implementar</td></tr>';
}

function renderEstacionamiento() {
    const tbody = document.getElementById('adminTable').querySelector('tbody');
    tbody.innerHTML = '<tr><td style="text-align:center;padding:2rem">Vista Estacionamiento - Por implementar</td></tr>';
}

function renderNumeros() {
    const tbody = document.getElementById('adminTable').querySelector('tbody');
    tbody.innerHTML = '<tr><td style="text-align:center;padding:2rem">Vista Números - Por implementar</td></tr>';
}

function renderUsuarios() {
    const tbody = document.getElementById('adminTable').querySelector('tbody');
    const thead = document.getElementById('adminTableHeader');
    
    thead.innerHTML = '<th>Nombre</th><th>Estado</th>';
    tbody.innerHTML = '';
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:2rem;color:var(--text-light)">No hay usuarios</td></tr>';
        return;
    }
    
    usuarios.forEach(u => {
        const row = tbody.insertRow();
        const badge = u.activo ? '<span style="color:var(--success)">✓ Activo</span>' : '<span style="color:var(--danger)">✗ Inactivo</span>';
        row.innerHTML = `<td>${u.nombre}</td><td>${badge}</td>`;
    });
    
    console.log('✅ Tabla usuarios renderizada');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

console.log('✅ UI.js cargado');

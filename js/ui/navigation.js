/* ========================================
   NAVIGATION.JS - Menu & Navigation Functions
   ======================================== */

// ============================================
// GLOBAL NAVIGATION STATE
// ============================================

let currentMenuContext = 'main';
let currentSubContext = null;
let currentSearchContext = null;

// ============================================
// MAIN MENU NAVIGATION
// ============================================

function showSubMenu(menu) {
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
    
    // Ocultar botón Regresa y búsqueda
    document.getElementById('btnRegresa').classList.add('hidden');
    document.getElementById('btnSearch').classList.add('hidden');
    
    // Ajustar content-area
    document.getElementById('contentArea').classList.add('with-submenu');
}

function handleRegresa() {
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
        
        currentSubContext = null;
        currentSearchContext = null;
        document.getElementById('btnRegresa').classList.add('hidden');
        document.getElementById('btnSearch').classList.add('hidden');
        document.getElementById('menuSidebar').classList.remove('hidden');
        
        document.getElementById('contentArea').classList.remove('fullwidth');
        document.getElementById('contentArea').classList.add('with-submenu');
    }
}

function showPageFromMenu(pageName) {
    // Ocultar submenús
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    document.getElementById('adminSubMenu').classList.remove('active');
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar página solicitada
    document.getElementById(pageName + 'Page').classList.add('active');
    
    currentSubContext = pageName;
    
    // Mostrar botones header
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    // Mostrar búsqueda solo en páginas que la necesitan
    if (pageName === 'bitacora') {
        document.getElementById('btnSearch').classList.remove('hidden');
        currentSearchContext = 'bitacora';
    }
    
    // Content-area a pantalla completa
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    // Cargar contenido
    if (pageName === 'estacionamiento') renderEstacionamientoTable();
    if (pageName === 'bitacora') renderBitacoraTable();
}

// ============================================
// SEARCH FUNCTIONS
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
    
    if (currentSearchContext === 'bitacora') {
        filtrarBitacora(query);
    } else if (currentSearchContext === 'proveedores') {
        filtrarProveedores(query);
    } else if (currentSearchContext === 'inquilinos') {
        filtrarInquilinos(query);
    }
    
    // Ocultar barra de búsqueda después de buscar
    document.getElementById('headerSearchBar').classList.remove('active');
    document.getElementById('btnSearch').classList.remove('hidden');
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    
    if (currentSearchContext === 'bitacora') {
        renderBitacoraTable();
    } else if (currentSearchContext === 'proveedores') {
        renderProveedoresTable();
    } else if (currentSearchContext === 'inquilinos') {
        renderInquilinosTable();
    }
    
    // Ocultar barra de búsqueda
    document.getElementById('headerSearchBar').classList.remove('active');
    document.getElementById('btnSearch').classList.remove('hidden');
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

console.log('✅ NAVIGATION.JS cargado');

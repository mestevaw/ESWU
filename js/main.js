/* ========================================
   ESWU - MAIN APPLICATION
   ======================================== */

// ============================================
// LOGIN
// ============================================

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('🔐 Intentando login...');
    
    showLoading();
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('nombre', username)
            .eq('password', password)
            .eq('activo', true)
            .single();
        
        if (error || !data) {
            throw new Error('Usuario o contraseña incorrectos');
        }
        
        currentUser = data;
        console.log('✅ Login exitoso:', currentUser.nombre);
        
        localStorage.setItem('eswu_remembered_user', username);
        localStorage.setItem('eswu_remembered_pass', password);
        
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.add('active');
        document.body.classList.add('logged-in');
        
        await initializeApp();
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        alert(error.message);
    } finally {
        hideLoading();
    }
});

// ============================================
// APP INITIALIZATION
// ============================================

async function initializeApp() {
    console.log('🚀 Iniciando aplicación...');
    
    try {
        await Promise.all([
            loadInquilinos(),
            loadProveedores(),
            loadActivos(),
            loadUsuarios(),
            loadBancosDocumentos(),
            loadEstacionamiento(),
            loadBitacoraSemanal()
        ]);
        
        populateYearSelect();
        populateInquilinosYearSelects();
        populateProveedoresYearSelects();
        
        console.log('✅ Aplicación iniciada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando app:', error);
        alert('Error cargando datos: ' + error.message);
    }
}

// ============================================
// YEAR SELECTS
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
// CONTACTOS - INQUILINOS
// ============================================

function showAddContactoInquilinoModal() {
    document.getElementById('contactoInquilinoForm').reset();
    document.getElementById('addContactoInquilinoModal').classList.add('active');
}

function saveContactoInquilino(event) {
    event.preventDefault();
    
    const contacto = {
        nombre: document.getElementById('contactoInquilinoNombre').value,
        telefono: document.getElementById('contactoInquilinoTelefono').value || '',
        email: document.getElementById('contactoInquilinoEmail').value || ''
    };
    
    tempInquilinoContactos.push(contacto);
    renderContactosList(tempInquilinoContactos, 'inquilinoContactosList', 'deleteInquilinoContacto');
    
    document.getElementById('contactoInquilinoForm').reset();
    closeModal('addContactoInquilinoModal');
    
    console.log('✅ Contacto agregado:', contacto);
}

function deleteInquilinoContacto(index) {
    tempInquilinoContactos.splice(index, 1);
    renderContactosList(tempInquilinoContactos, 'inquilinoContactosList', 'deleteInquilinoContacto');
}

// ============================================
// CONTACTOS - PROVEEDORES
// ============================================

function showAddContactoProveedorModal() {
    document.getElementById('contactoProveedorForm').reset();
    document.getElementById('addContactoProveedorModal').classList.add('active');
}

function saveContactoProveedor(event) {
    event.preventDefault();
    
    const contacto = {
        nombre: document.getElementById('contactoProveedorNombre').value,
        telefono: document.getElementById('contactoProveedorTelefono').value || '',
        email: document.getElementById('contactoProveedorEmail').value || ''
    };
    
    tempProveedorContactos.push(contacto);
    renderContactosList(tempProveedorContactos, 'proveedorContactosList', 'deleteProveedorContacto');
    
    document.getElementById('contactoProveedorForm').reset();
    closeModal('addContactoProveedorModal');
    
    console.log('✅ Contacto proveedor agregado:', contacto);
}

function deleteProveedorContacto(index) {
    tempProveedorContactos.splice(index, 1);
    renderContactosList(tempProveedorContactos, 'proveedorContactosList', 'deleteProveedorContacto');
}

// ============================================
// SAVE INQUILINO (pendiente implementación completa)
// ============================================

async function saveInquilino(event) {
    event.preventDefault();
    alert('Guardado de inquilino - En desarrollo completo');
}

// ============================================
// SAVE PROVEEDOR (pendiente implementación completa)
// ============================================

async function saveProveedor(event) {
    event.preventDefault();
    alert('Guardado de proveedor - En desarrollo completo');
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

console.log('✅ Main.js cargado correctamente');

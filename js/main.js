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
        
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.add('active');
        document.body.classList.add('logged-in');
        
        await initializeApp();
        
    } catch (error) {
        alert(error.message);
    } finally {
        hideLoading();
    }
});

// ============================================
// INITIALIZE APP
// ============================================

async function initializeApp() {
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
        
        console.log('✅ Datos cargados');
        console.log('Inquilinos:', inquilinos.length);
        console.log('Proveedores:', proveedores.length);
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error cargando datos: ' + error.message);
    }
}

// ============================================
// LOAD DATA FUNCTIONS
// ============================================

async function loadInquilinos() {
    try {
        const { data, error } = await supabaseClient
            .from('inquilinos')
            .select('*')
            .order('nombre');
        
        if (error) throw error;
        
        inquilinos = data || [];
        console.log('✅ Inquilinos cargados:', inquilinos.length);
        
    } catch (error) {
        console.error('Error loading inquilinos:', error);
        throw error;
    }
}

async function loadProveedores() {
    try {
        const { data, error } = await supabaseClient
            .from('proveedores')
            .select('*')
            .order('nombre');
        
        if (error) throw error;
        
        proveedores = data || [];
        console.log('✅ Proveedores cargados:', proveedores.length);
        
    } catch (error) {
        console.error('Error loading proveedores:', error);
        throw error;
    }
}

async function loadActivos() {
    try {
        const { data, error } = await supabaseClient
            .from('activos')
            .select('*')
            .order('nombre');
        
        if (error) throw error;
        
        activos = data || [];
        console.log('✅ Activos cargados:', activos.length);
        
    } catch (error) {
        console.error('Error loading activos:', error);
        activos = [];
    }
}

async function loadUsuarios() {
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .order('nombre');
        
        if (error) throw error;
        
        usuarios = data || [];
        console.log('✅ Usuarios cargados:', usuarios.length);
        
    } catch (error) {
        console.error('Error loading usuarios:', error);
        throw error;
    }
}

async function loadBancosDocumentos() {
    try {
        const { data, error } = await supabaseClient
            .from('bancos_documentos')
            .select('*')
            .order('fecha_subida', { ascending: false });
        
        if (error) throw error;
        
        bancosDocumentos = data || [];
        console.log('✅ Bancos cargados:', bancosDocumentos.length);
        
    } catch (error) {
        console.error('Error loading bancos:', error);
        bancosDocumentos = [];
    }
}

async function loadEstacionamiento() {
    try {
        const { data, error } = await supabaseClient
            .from('estacionamiento')
            .select('*')
            .order('numero_espacio');
        
        if (error) throw error;
        
        estacionamiento = data || [];
        console.log('✅ Estacionamiento cargado:', estacionamiento.length);
        
    } catch (error) {
        console.error('Error loading estacionamiento:', error);
        estacionamiento = [];
    }
}

async function loadBitacoraSemanal() {
    try {
        const { data, error } = await supabaseClient
            .from('bitacora_semanal')
            .select('*')
            .order('semana_inicio', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        
        bitacoraSemanal = data || [];
        console.log('✅ Bitácora cargada:', bitacoraSemanal.length);
        
    } catch (error) {
        console.error('Error loading bitacora:', error);
        bitacoraSemanal = [];
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        document.getElementById('appContainer').classList.remove('active');
        document.getElementById('loginContainer').classList.remove('hidden');
        document.body.classList.remove('logged-in');
        
        // Limpiar datos
        currentUser = null;
        inquilinos = [];
        proveedores = [];
        
        // Reset UI
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.submenu-container').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    }
}

console.log('✅ Main.js cargado');

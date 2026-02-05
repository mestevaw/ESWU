/* ESWU - MAIN APPLICATION (SIN AUTO-LOGIN) */

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('🔐 Intentando login con:', username);
    
    showLoading();
    
    try {
        console.log('📡 Consultando Supabase...');
        
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('nombre', username)
            .eq('password', password)
            .eq('activo', true)
            .single();
        
        console.log('📊 Respuesta Supabase:', { data, error });
        
        if (error || !data) {
            throw new Error('Usuario o contraseña incorrectos');
        }
        
        currentUser = data;
        
        // Guardar credenciales
        localStorage.setItem('eswu_remembered_user', username);
        localStorage.setItem('eswu_remembered_pass', password);
        
        console.log('✅ Credenciales correctas, cambiando vista...');
        
        // Ocultar login y mostrar app
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.add('active');
        document.body.classList.add('logged-in');
        
        console.log('🔄 Inicializando aplicación...');
        
        await initializeApp();
        
        console.log('✅ Login completado exitosamente');
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        alert('Error: ' + error.message);
    } finally {
        hideLoading();
    }
});

async function initializeApp() {
    try {
        console.log('📥 Cargando datos desde Supabase...');
        
        await Promise.all([
            loadInquilinos(),
            loadProveedores(),
            loadActivos(),
            loadUsuarios(),
            loadBancosDocumentos(),
            loadEstacionamiento(),
            loadBitacoraSemanal()
        ]);
        
        console.log('✅ Aplicación inicializada correctamente');
        console.log('📊 Resumen de datos cargados:');
        console.log('   - Inquilinos:', inquilinos.length);
        console.log('   - Proveedores:', proveedores.length);
        console.log('   - Activos:', activos.length);
        console.log('   - Usuarios:', usuarios.length);
        
    } catch (error) {
        console.error('❌ Error inicializando app:', error);
        alert('Error cargando datos: ' + error.message);
    }
}

window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página cargada, inicializando...');
    
    // DESACTIVADO: Auto-login automático
    // const rememberedUser = localStorage.getItem('eswu_remembered_user');
    // const rememberedPass = localStorage.getItem('eswu_remembered_pass');
    
    // Pre-seleccionar último usuario (opcional)
    const rememberedUser = localStorage.getItem('eswu_remembered_user');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        console.log('ℹ️ Usuario recordado:', rememberedUser);
    }
    
    // Asegurar que todas las páginas estén ocultas al inicio
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    console.log('✅ Listo para iniciar sesión');
});

console.log('✅ Main.js cargado correctamente');

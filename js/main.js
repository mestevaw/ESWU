/* ESWU - MAIN APPLICATION */

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
        
        localStorage.setItem('eswu_remembered_user', username);
        localStorage.setItem('eswu_remembered_pass', password);
        
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.add('active');
        document.body.classList.add('logged-in');
        
        await initializeApp();
        
        console.log('✅ Login exitoso:', username);
        
    } catch (error) {
        alert(error.message);
        console.error('❌ Error en login:', error);
    } finally {
        hideLoading();
    }
});

async function initializeApp() {
    try {
        console.log('🔄 Cargando datos...');
        
        await Promise.all([
            loadInquilinos(),
            loadProveedores(),
            loadActivos(),
            loadUsuarios(),
            loadBancosDocumentos(),
            loadEstacionamiento(),
            loadBitacoraSemanal()
        ]);
        
        console.log('✅ Aplicación inicializada');
        console.log('📊 Datos cargados:');
        console.log('   - Inquilinos:', inquilinos.length);
        console.log('   - Proveedores:', proveedores.length);
        console.log('   - Activos:', activos.length);
        
    } catch (error) {
        console.error('❌ Error inicializando app:', error);
        alert('Error cargando datos: ' + error.message);
    }
}

window.addEventListener('DOMContentLoaded', function() {
    const rememberedUser = localStorage.getItem('eswu_remembered_user');
    const rememberedPass = localStorage.getItem('eswu_remembered_pass');
    
    if (rememberedUser && rememberedPass) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('password').value = rememberedPass;
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
});

console.log('✅ Main.js cargado correctamente');

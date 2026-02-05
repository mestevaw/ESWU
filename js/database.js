/* ESWU - DATABASE FUNCTIONS */

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
        console.error('❌ Error cargando inquilinos:', error);
        inquilinos = [];
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
        console.error('❌ Error cargando proveedores:', error);
        proveedores = [];
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
        console.error('❌ Error cargando activos:', error);
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
        console.error('❌ Error cargando usuarios:', error);
        usuarios = [];
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
        console.error('❌ Error cargando estacionamiento:', error);
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
        console.error('❌ Error cargando bitácora:', error);
        bitacoraSemanal = [];
    }
}

async function loadBancosDocumentos() {
    try {
        const { data, error } = await supabaseClient
            .from('bancos_documentos')
            .select('*')
            .order('fecha_subida', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        
        bancosDocumentos = data || [];
        console.log('✅ Bancos documentos cargados:', bancosDocumentos.length);
    } catch (error) {
        console.error('❌ Error cargando bancos:', error);
        bancosDocumentos = [];
    }
}

console.log('✅ Database.js cargado correctamente');

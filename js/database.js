/* ========================================
   ESWU - DATABASE FUNCTIONS
   All Supabase database operations
   ======================================== */

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
// INQUILINOS - CARGA COMPLETA
// ============================================

async function loadInquilinos() {
    try {
        console.log('📥 Cargando inquilinos desde Supabase...');
        
        // Cargar inquilinos
        const { data: inquilinosData, error: inquilinosError } = await supabaseClient
            .from('inquilinos')
            .select('*')
            .order('nombre');
        
        if (inquilinosError) throw inquilinosError;
        
        console.log('✅ Inquilinos cargados:', inquilinosData.length);
        
        // Cargar contactos
        const { data: contactosData, error: contactosError } = await supabaseClient
            .from('inquilinos_contactos')
            .select('*');
        
        if (contactosError) throw contactosError;
        console.log('✅ Contactos cargados:', contactosData?.length || 0);
        
        // Cargar pagos
        const { data: pagosData, error: pagosError } = await supabaseClient
            .from('pagos_inquilinos')
            .select('*')
            .order('fecha', { ascending: false });
        
        if (pagosError) throw pagosError;
        console.log('✅ Pagos cargados:', pagosData?.length || 0);
        
        // Cargar documentos
        const { data: docsData, error: docsError } = await supabaseClient
            .from('inquilinos_documentos')
            .select('*');
        
        if (docsError) throw docsError;
        console.log('✅ Documentos cargados:', docsData?.length || 0);
        
        // Combinar todo
        inquilinos = inquilinosData.map(inq => ({
            ...inq,
            contactos: contactosData ? contactosData.filter(c => c.inquilino_id === inq.id) : [],
            pagos: pagosData ? pagosData.filter(p => p.inquilino_id === inq.id) : [],
            documentos: docsData ? docsData.filter(d => d.inquilino_id === inq.id) : []
        }));
        
        console.log('✅ Inquilinos procesados:', inquilinos.length);
        if (inquilinos.length > 0) {
            console.log('📋 Primer inquilino con pagos:', inquilinos[0].pagos?.length || 0);
        }
        
    } catch (error) {
        console.error('❌ Error loading inquilinos:', error);
        throw error;
    }
}

// ============================================
// PROVEEDORES - CARGA COMPLETA
// ============================================

async function loadProveedores() {
    try {
        console.log('📥 Cargando proveedores desde Supabase...');
        
        const { data: proveedoresData, error: proveedoresError } = await supabaseClient
            .from('proveedores')
            .select('*')
            .order('nombre');
        
        if (proveedoresError) throw proveedoresError;
        
        const { data: contactosData, error: contactosError } = await supabaseClient
            .from('proveedores_contactos')
            .select('*');
        
        if (contactosError) throw contactosError;
        
        const { data: facturasData, error: facturasError } = await supabaseClient
            .from('facturas')
            .select('*')
            .order('fecha', { ascending: false });
        
        if (facturasError) throw facturasError;
        
        const { data: docsData, error: docsError } = await supabaseClient
            .from('proveedores_documentos')
            .select('*');
        
        if (docsError) throw docsError;
        
        proveedores = proveedoresData.map(prov => ({
            ...prov,
            contactos: contactosData ? contactosData.filter(c => c.proveedor_id === prov.id) : [],
            facturas: facturasData ? facturasData.filter(f => f.proveedor_id === prov.id) : [],
            documentos: docsData ? docsData.filter(d => d.proveedor_id === prov.id) : []
        }));
        
        console.log('✅ Proveedores cargados:', proveedores.length);
        
    } catch (error) {
        console.error('❌ Error loading proveedores:', error);
        throw error;
    }
}

// ============================================
// OTROS - CARGAS BÁSICAS
// ============================================

async function loadActivos() {
    try {
        const { data: activosData, error: activosError } = await supabaseClient
            .from('activos')
            .select('*')
            .order('nombre');
        
        if (activosError) throw activosError;
        
        const { data: fotosData, error: fotosError } = await supabaseClient
            .from('activos_fotos')
            .select('*');
        
        if (fotosError) throw fotosError;
        
        activos = activosData.map(act => ({
            ...act,
            fotos: fotosData ? fotosData.filter(f => f.activo_id === act.id) : []
        }));
        
        console.log('✅ Activos cargados:', activos.length);
        
    } catch (error) {
        console.error('❌ Error loading activos:', error);
        throw error;
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
        console.error('❌ Error loading estacionamiento:', error);
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
        console.error('❌ Error loading bitacora:', error);
        bitacoraSemanal = [];
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
        console.error('❌ Error loading usuarios:', error);
        throw error;
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
        console.log('✅ Bancos cargados:', bancosDocumentos.length);
        
    } catch (error) {
        console.error('❌ Error loading bancos:', error);
        bancosDocumentos = [];
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

console.log('✅ Database.js cargado correctamente');

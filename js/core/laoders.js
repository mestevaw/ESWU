/* ========================================
   LOADERS.JS - Data Loading Functions
   ======================================== */

// ============================================
// LOAD INQUILINOS
// ============================================

async function loadInquilinos() {
    try {
        const { data: inquilinosData, error: inquilinosError } = await supabaseClient
            .from('inquilinos')
            .select('*')
            .order('nombre');
        
        if (inquilinosError) throw inquilinosError;
        
        const { data: contactosData, error: contactosError } = await supabaseClient
            .from('inquilinos_contactos')
            .select('*');
        
        if (contactosError) throw contactosError;
        
        const { data: pagosData, error: pagosError } = await supabaseClient
            .from('pagos_inquilinos')
            .select('*')
            .order('fecha', { ascending: false });
        
        if (pagosError) throw pagosError;
        
        const { data: docsData, error: docsError } = await supabaseClient
            .from('inquilinos_documentos')
            .select('*');
        
        if (docsError) throw docsError;
        
        inquilinos = inquilinosData.map(inq => ({
            ...inq,
            contactos: contactosData.filter(c => c.inquilino_id === inq.id),
            pagos: pagosData.filter(p => p.inquilino_id === inq.id),
            documentos: docsData.filter(d => d.inquilino_id === inq.id)
        }));
        
    } catch (error) {
        console.error('Error loading inquilinos:', error);
        throw error;
    }
}

// ============================================
// LOAD PROVEEDORES
// ============================================

async function loadProveedores() {
    try {
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
            contactos: contactosData.filter(c => c.proveedor_id === prov.id),
            facturas: facturasData.filter(f => f.proveedor_id === prov.id),
            documentos: docsData.filter(d => d.proveedor_id === prov.id)
        }));
        
    } catch (error) {
        console.error('Error loading proveedores:', error);
        throw error;
    }
}

// ============================================
// LOAD ACTIVOS
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
            fotos: fotosData.filter(f => f.activo_id === act.id)
        }));
        
    } catch (error) {
        console.error('Error loading activos:', error);
        throw error;
    }
}

// ============================================
// LOAD ESTACIONAMIENTO
// ============================================

async function loadEstacionamiento() {
    try {
        const { data, error } = await supabaseClient
            .from('estacionamiento')
            .select('*')
            .order('numero_espacio');
        
        if (error) throw error;
        
        estacionamiento = data;
        
    } catch (error) {
        console.error('Error loading estacionamiento:', error);
        throw error;
    }
}

// ============================================
// LOAD BITACORA SEMANAL
// ============================================

async function loadBitacoraSemanal() {
    try {
        const { data, error } = await supabaseClient
            .from('bitacora_semanal')
            .select('id, semana_inicio, semana_texto, notas')
            .order('semana_inicio', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        
        bitacoraSemanal = data || [];
        
    } catch (error) {
        console.error('Error loading bitacora:', error);
        bitacoraSemanal = [];
    }
}

// ============================================
// LOAD USUARIOS
// ============================================

async function loadUsuarios() {
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .order('nombre');
        
        if (error) throw error;
        
        usuarios = data;
        
    } catch (error) {
        console.error('Error loading usuarios:', error);
        throw error;
    }
}

// ============================================
// LOAD BANCOS DOCUMENTOS
// ============================================

async function loadBancosDocumentos() {
    try {
        const { data, error } = await supabaseClient
            .from('bancos_documentos')
            .select('id, tipo, archivo_pdf, fecha_subida')
            .order('fecha_subida', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        
        bancosDocumentos = data || [];
        
    } catch (error) {
        console.error('Error loading bancos:', error);
        bancosDocumentos = [];
    }
}

// ============================================
// ENSURE FUNCTIONS (LAZY LOADING)
// ============================================

async function ensureInquilinosLoaded() {
    if (inquilinos.length === 0) {
        await loadInquilinos();
    }
}

async function ensureProveedoresLoaded() {
    if (proveedores.length === 0) {
        await loadProveedores();
    }
}

async function ensureActivosLoaded() {
    if (activos.length === 0) {
        await loadActivos();
    }
}

async function ensureEstacionamientoLoaded() {
    if (estacionamiento.length === 0) {
        await loadEstacionamiento();
    }
}

async function ensureBitacoraLoaded() {
    if (bitacoraSemanal.length === 0) {
        await loadBitacoraSemanal();
    }
}

async function ensureUsuariosLoaded() {
    if (usuarios.length === 0) {
        await loadUsuarios();
    }
}

async function ensureBancosLoaded() {
    if (bancosDocumentos.length === 0) {
        await loadBancosDocumentos();
    }
}

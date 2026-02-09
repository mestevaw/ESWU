/* ========================================
   LOADERS.JS - Data Loading Functions
   ======================================== */

// ============================================
// INQUILINOS
// ============================================

let inquilinosFullLoaded = false;

async function loadInquilinos() {
    try {
        // Solo cargar datos básicos primero
        const { data, error } = await supabaseClient
            .from('inquilinos')
            .select('id, nombre, renta, fecha_vencimiento, activo')
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        
        inquilinos = data.map(inq => ({
            id: inq.id,
            nombre: inq.nombre,
            renta: parseFloat(inq.renta || 0),
            fecha_vencimiento: inq.fecha_vencimiento,
            activo: inq.activo,
            // Datos que se cargarán después
            contactos: [],
            pagos: [],
            documentos: []
        }));
        
        console.log(`✅ ${inquilinos.length} inquilinos cargados (básico)`);
        
    } catch (error) {
        console.error('Error loading inquilinos:', error);
        throw error;
    }
}

async function ensureInquilinosFullLoaded() {
    if (inquilinosFullLoaded) return;
    
    try {
        // Cargar todos los datos completos
        const { data, error } = await supabaseClient
            .from('inquilinos')
            .select(`
                *,
                inquilinos_contactos (*),
                pagos_inquilinos (*),
                inquilinos_documentos (*)
            `)
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        
        inquilinos = data.map(inq => ({
            id: inq.id,
            nombre: inq.nombre,
            clabe: inq.clabe,
            rfc: inq.rfc,
            m2: inq.m2,
            renta: parseFloat(inq.renta || 0),
            fecha_inicio: inq.fecha_inicio,
            fecha_vencimiento: inq.fecha_vencimiento,
            notas: inq.notas,
            numero_despacho: inq.numero_despacho,
            contrato_file: inq.contrato_file,
            activo: inq.activo,
            contactos: (inq.inquilinos_contactos || []).map(c => ({
                id: c.id,
                nombre: c.nombre,
                telefono: c.telefono,
                email: c.email
            })),
            pagos: (inq.pagos_inquilinos || []).map(p => ({
                id: p.id,
                fecha: p.fecha,
                monto: parseFloat(p.monto),
                completo: p.completo,
                pago_file: p.pago_file
            })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
            documentos: (inq.inquilinos_documentos || []).map(d => ({
                id: d.id,
                nombre: d.nombre_documento,
                archivo: d.archivo_pdf,
                fecha: d.fecha_guardado,
                usuario: d.usuario_guardo
            })).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
        }));
        
        inquilinosFullLoaded = true;
        console.log(`✅ ${inquilinos.length} inquilinos cargados (completo)`);
        
    } catch (error) {
        console.error('Error loading inquilinos full:', error);
        throw error;
    }
}

// ============================================
// PROVEEDORES
// ============================================

let proveedoresFullLoaded = false;

async function loadProveedores() {
    try {
        // Solo datos básicos
        const { data, error } = await supabaseClient
            .from('proveedores')
            .select('id, nombre, servicio')
            .order('nombre');
        
        if (error) throw error;
        
        proveedores = data.map(prov => ({
            id: prov.id,
            nombre: prov.nombre,
            servicio: prov.servicio,
            // Datos que se cargarán después
            contactos: [],
            facturas: [],
            documentos: []
        }));
        
        console.log(`✅ ${proveedores.length} proveedores cargados (básico)`);
        
    } catch (error) {
        console.error('Error loading proveedores:', error);
        throw error;
    }
}

async function ensureProveedoresFullLoaded() {
    if (proveedoresFullLoaded) return;
    
    try {
        // Cargar todos los datos completos
        const { data, error } = await supabaseClient
            .from('proveedores')
            .select(`
                *,
                proveedores_contactos (*),
                facturas (*),
                proveedores_documentos (*)
            `)
            .order('nombre');
        
        if (error) throw error;
        
        proveedores = data.map(prov => ({
            id: prov.id,
            nombre: prov.nombre,
            servicio: prov.servicio,
            clabe: prov.clabe,
            rfc: prov.rfc,
            notas: prov.notas,
            contactos: (prov.proveedores_contactos || []).map(c => ({
                id: c.id,
                nombre: c.nombre,
                telefono: c.telefono,
                email: c.email
            })),
            facturas: (prov.facturas || []).map(f => ({
                id: f.id,
                numero: f.numero,
                fecha: f.fecha,
                vencimiento: f.vencimiento,
                monto: parseFloat(f.monto),
                iva: parseFloat(f.iva || 0),
                fecha_pago: f.fecha_pago,
                documento_file: f.documento_file,
                pago_file: f.pago_file
            })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
            documentos: (prov.proveedores_documentos || []).map(d => ({
                id: d.id,
                nombre: d.nombre_documento,
                archivo: d.archivo_pdf,
                fecha: d.fecha_guardado,
                usuario: d.usuario_guardo
            })).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
        }));
        
        proveedoresFullLoaded = true;
        console.log(`✅ ${proveedores.length} proveedores cargados (completo)`);
        
    } catch (error) {
        console.error('Error loading proveedores full:', error);
        throw error;
    }
}

// ============================================
// ACTIVOS
// ============================================

async function loadActivos() {
    try {
        const { data, error } = await supabaseClient
            .from('activos')
            .select('id, nombre, ultimo_mant, proximo_mant, proveedor')
            .order('nombre');
        
        if (error) throw error;
        
        activos = data.map(act => ({
            id: act.id,
            nombre: act.nombre,
            ultimo_mant: act.ultimo_mant,
            proximo_mant: act.proximo_mant,
            proveedor: act.proveedor,
            notas: act.notas,
            fotos: []
        }));
        
        console.log(`✅ ${activos.length} activos cargados`);
        
    } catch (error) {
        console.error('Error loading activos:', error);
        throw error;
    }
}

async function ensureActivosLoaded() {
    if (activos.length > 0 && activos[0].fotos && activos[0].fotos.length >= 0) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('activos')
            .select('*, activos_fotos (*)')
            .order('nombre');
        
        if (error) throw error;
        
        activos = data.map(act => ({
            id: act.id,
            nombre: act.nombre,
            ultimo_mant: act.ultimo_mant,
            proximo_mant: act.proximo_mant,
            proveedor: act.proveedor,
            notas: act.notas,
            fotos: (act.activos_fotos || []).map(f => ({
                id: f.id,
                data: f.foto_data,
                name: f.foto_name
            }))
        }));
        
        console.log(`✅ ${activos.length} activos cargados (completo)`);
        
    } catch (error) {
        console.error('Error loading activos full:', error);
        throw error;
    }
}

// ============================================
// ESTACIONAMIENTO
// ============================================

async function loadEstacionamiento() {
    try {
        const { data, error } = await supabaseClient
            .from('estacionamiento')
            .select('*')
            .order('numero_espacio');
        
        if (error) throw error;
        
        estacionamiento = data.map(e => ({
            id: e.id,
            numero_espacio: e.numero_espacio,
            inquilino_nombre: e.inquilino_nombre,
            numero_despacho: e.numero_despacho,
            color_asignado: e.color_asignado
        }));
        
        console.log(`✅ ${estacionamiento.length} espacios cargados`);
        
    } catch (error) {
        console.error('Error loading estacionamiento:', error);
        throw error;
    }
}

// ============================================
// BITÁCORA
// ============================================

async function loadBitacoraSemanal() {
    try {
        const { data, error } = await supabaseClient
            .from('bitacora_semanal')
            .select('id, semana_inicio, semana_texto, notas')
            .order('semana_inicio', { ascending: false })
            .limit(52);
        
        if (error) throw error;
        
        bitacoraSemanal = data.map(b => ({
            id: b.id,
            semana_inicio: b.semana_inicio,
            semana_texto: b.semana_texto,
            notas: b.notas
        }));
        
        console.log(`✅ ${bitacoraSemanal.length} semanas cargadas`);
        
    } catch (error) {
        console.error('Error loading bitacora:', error);
        bitacoraSemanal = [];
    }
}

// ============================================
// USUARIOS
// ============================================

async function loadUsuarios() {
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .order('nombre');
        
        if (error) throw error;
        
        usuarios = data.map(u => ({
            id: u.id,
            nombre: u.nombre,
            password: u.password,
            activo: u.activo
        }));
        
        console.log(`✅ ${usuarios.length} usuarios cargados`);
        
    } catch (error) {
        console.error('Error loading usuarios:', error);
        throw error;
    }
}

async function ensureUsuariosLoaded() {
    if (usuarios.length > 0) return;
    await loadUsuarios();
}

// ============================================
// BANCOS
// ============================================

async function loadBancosDocumentos() {
    try {
        const { data, error } = await supabaseClient
            .from('bancos_documentos')
            .select('id, tipo, archivo_pdf, fecha_subida')
            .order('fecha_subida', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        
        bancosDocumentos = data.map(b => ({
            id: b.id,
            tipo: b.tipo,
            archivo_pdf: b.archivo_pdf,
            fecha_subida: b.fecha_subida
        }));
        
        console.log(`✅ ${bancosDocumentos.length} documentos bancarios cargados`);
        
    } catch (error) {
        console.error('Error loading bancos:', error);
        bancosDocumentos = [];
    }
}

async function ensureBancosLoaded() {
    if (bancosDocumentos.length > 0) return;
    await loadBancosDocumentos();
}

console.log('✅ LOADERS.JS cargado');

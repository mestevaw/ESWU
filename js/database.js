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
// LOAD ALL DATA
// ============================================

async function loadAllData() {
    showLoading();
    try {
        await Promise.all([
            loadInquilinos(),
            loadProveedores(),
            loadActivos(),
            loadUsuarios(),
            loadBancosDocumentos()
        ]);
        console.log('✅ Datos cargados');
    } catch (error) {
        console.error('Error cargando datos:', error);
        alert('Error al cargar datos. Por favor recarga la página.');
    } finally {
        hideLoading();
    }
}

// ============================================
// INQUILINOS
// ============================================

async function loadInquilinos() {
    try {
        const { data, error } = await supabaseClient
            .from('inquilinos')
            .select('*, pagos_inquilinos(*), inquilinos_documentos(*), inquilinos_contactos(*)')
            .order('nombre');
        
        if (error) throw error;
        
        inquilinos = data.map(inq => ({
            id: inq.id,
            nombre: inq.nombre,
            clabe: inq.clabe,
            rfc: inq.rfc,
            m2: inq.m2,
            renta: parseFloat(inq.renta || 0),
            fechaInicio: inq.fecha_inicio,
            fechaVencimiento: inq.fecha_vencimiento,
            notas: inq.notas,
            contratoFile: inq.contrato_file,
            contratoFileName: inq.contrato_filename,
            contactos: inq.inquilinos_contactos ? inq.inquilinos_contactos.map(c => ({
                id: c.id,
                nombre: c.nombre,
                telefono: c.telefono,
                email: c.email
            })) : [],
            pagos: inq.pagos_inquilinos ? inq.pagos_inquilinos.map(p => ({
                id: p.id,
                fecha: p.fecha,
                monto: parseFloat(p.monto),
                completo: p.completo,
                pagoFile: p.pago_file,
                pagoFileName: p.pago_filename
            })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : [],
            documentos: inq.inquilinos_documentos ? inq.inquilinos_documentos.map(d => ({
                id: d.id,
                nombre: d.nombre_documento,
                archivo: d.archivo_pdf,
                fecha: d.fecha_guardado,
                usuario: d.usuario_guardo
            })).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')) : []
        }));
    } catch (error) {
        console.error('Error loading inquilinos:', error);
        throw error;
    }
}

async function saveInquilinoData(inquilinoData, isEdit, inquilinoId) {
    if (isEdit) {
        const { error } = await supabaseClient
            .from('inquilinos')
            .update(inquilinoData)
            .eq('id', inquilinoId);
        if (error) throw error;
        
        // Borrar contactos existentes
        await supabaseClient
            .from('inquilinos_contactos')
            .delete()
            .eq('inquilino_id', inquilinoId);
        
        return inquilinoId;
    } else {
        const { data, error } = await supabaseClient
            .from('inquilinos')
            .insert([inquilinoData])
            .select()
            .single();
        if (error) throw error;
        return data.id;
    }
}

async function saveInquilinoContactos(inquilinoId, contactos) {
    for (const contacto of contactos) {
        const { error } = await supabaseClient
            .from('inquilinos_contactos')
            .insert([{
                inquilino_id: inquilinoId,
                nombre: contacto.nombre,
                telefono: contacto.telefono,
                email: contacto.email
            }]);
        if (error) throw error;
    }
}

async function saveInquilinoDocumento(inquilinoId, nombreDoc, docData) {
    const { error } = await supabaseClient
        .from('inquilinos_documentos')
        .insert([{
            inquilino_id: inquilinoId,
            nombre_documento: nombreDoc,
            archivo_pdf: docData,
            usuario_guardo: currentUser,
            fecha_guardado: new Date().toISOString().split('T')[0]
        }]);
    if (error) throw error;
}

async function deleteInquilinoFromDB(inquilinoId) {
    const { error } = await supabaseClient
        .from('inquilinos')
        .delete()
        .eq('id', inquilinoId);
    if (error) throw error;
}

async function savePagoInquilino(pagoData) {
    const { error } = await supabaseClient
        .from('pagos_inquilinos')
        .insert([pagoData]);
    if (error) throw error;
}

// ============================================
// PROVEEDORES
// ============================================

async function loadProveedores() {
    try {
        const { data, error } = await supabaseClient
            .from('proveedores')
            .select('*, facturas(*), proveedores_documentos(*), proveedores_contactos(*)')
            .order('nombre');
        
        if (error) throw error;
        
        proveedores = data.map(prov => ({
            id: prov.id,
            nombre: prov.nombre,
            servicio: prov.servicio,
            clabe: prov.clabe,
            rfc: prov.rfc,
            notas: prov.notas,
            contactos: prov.proveedores_contactos ? prov.proveedores_contactos.map(c => ({
                id: c.id,
                nombre: c.nombre,
                telefono: c.telefono,
                email: c.email
            })) : [],
            facturas: prov.facturas ? prov.facturas.map(f => ({
                id: f.id,
                numero: f.numero,
                fecha: f.fecha,
                vencimiento: f.vencimiento,
                monto: parseFloat(f.monto),
                iva: parseFloat(f.iva || 0),
                fechaPago: f.fecha_pago,
                documentoFile: f.documento_file,
                documentoFileName: f.documento_filename,
                pagoFile: f.pago_file,
                pagoFileName: f.pago_filename
            })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : [],
            documentos: prov.proveedores_documentos ? prov.proveedores_documentos.map(d => ({
                id: d.id,
                nombre: d.nombre_documento,
                archivo: d.archivo_pdf,
                fecha: d.fecha_guardado,
                usuario: d.usuario_guardo
            })).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')) : []
        }));
    } catch (error) {
        console.error('Error loading proveedores:', error);
        throw error;
    }
}

async function saveProveedorData(proveedorData, isEdit, proveedorId) {
    if (isEdit) {
        const { error } = await supabaseClient
            .from('proveedores')
            .update(proveedorData)
            .eq('id', proveedorId);
        if (error) throw error;
        
        // Borrar contactos existentes
        await supabaseClient
            .from('proveedores_contactos')
            .delete()
            .eq('proveedor_id', proveedorId);
        
        return proveedorId;
    } else {
        const { data, error } = await supabaseClient
            .from('proveedores')
            .insert([proveedorData])
            .select()
            .single();
        if (error) throw error;
        return data.id;
    }
}

async function saveProveedorContactos(proveedorId, contactos) {
    for (const contacto of contactos) {
        const { error } = await supabaseClient
            .from('proveedores_contactos')
            .insert([{
                proveedor_id: proveedorId,
                nombre: contacto.nombre,
                telefono: contacto.telefono,
                email: contacto.email
            }]);
        if (error) throw error;
    }
}

async function saveProveedorDocumento(proveedorId, nombreDoc, docData) {
    const { error } = await supabaseClient
        .from('proveedores_documentos')
        .insert([{
            proveedor_id: proveedorId,
            nombre_documento: nombreDoc,
            archivo_pdf: docData,
            usuario_guardo: currentUser,
            fecha_guardado: new Date().toISOString().split('T')[0]
        }]);
    if (error) throw error;
}

async function deleteProveedorFromDB(proveedorId) {
    const { error } = await supabaseClient
        .from('proveedores')
        .delete()
        .eq('id', proveedorId);
    if (error) throw error;
}

// ============================================
// FACTURAS
// ============================================

async function saveFacturaData(facturaData) {
    const { error } = await supabaseClient
        .from('facturas')
        .insert([facturaData]);
    if (error) throw error;
}

async function updateFacturaPago(facturaId, fechaPago, pagoFile, pagoFileName) {
    const { error } = await supabaseClient
        .from('facturas')
        .update({
            fecha_pago: fechaPago,
            pago_file: pagoFile,
            pago_filename: pagoFileName
        })
        .eq('id', facturaId);
    if (error) throw error;
}

async function deleteFacturaFromDB(facturaId) {
    const { error } = await supabaseClient
        .from('facturas')
        .delete()
        .eq('id', facturaId);
    if (error) throw error;
}

// ============================================
// ACTIVOS
// ============================================

async function loadActivos() {
    try {
        const { data, error } = await supabaseClient
            .from('activos')
            .select('*, activos_fotos(*)')
            .order('nombre');
        
        if (error) throw error;
        
        activos = data.map(act => ({
            id: act.id,
            nombre: act.nombre,
            ultimoMant: act.ultimo_mant,
            proximoMant: act.proximo_mant,
            proveedor: act.proveedor,
            notas: act.notas,
            fotos: act.activos_fotos ? act.activos_fotos.map(f => ({
                id: f.id,
                data: f.foto_data,
                name: f.foto_name
            })) : []
        }));
    } catch (error) {
        console.error('Error loading activos:', error);
        throw error;
    }
}

async function saveActivoData(activoData, isEdit, activoId) {
    if (isEdit) {
        const { error } = await supabaseClient
            .from('activos')
            .update(activoData)
            .eq('id', activoId);
        if (error) throw error;
        return activoId;
    } else {
        const { data, error } = await supabaseClient
            .from('activos')
            .insert([activoData])
            .select()
            .single();
        if (error) throw error;
        return data.id;
    }
}

async function saveActivoFotos(activoId, fotos) {
    for (const foto of fotos) {
        const { error } = await supabaseClient
            .from('activos_fotos')
            .insert([{
                activo_id: activoId,
                foto_data: foto.data,
                foto_name: foto.name
            }]);
        if (error) throw error;
    }
}

async function deleteActivoFromDB(activoId) {
    const { error } = await supabaseClient
        .from('activos')
        .delete()
        .eq('id', activoId);
    if (error) throw error;
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
    } catch (error) {
        console.error('Error loading usuarios:', error);
        throw error;
    }
}

async function saveUsuarioData(usuarioData, isEdit, usuarioId) {
    if (isEdit) {
        const { error } = await supabaseClient
            .from('usuarios')
            .update(usuarioData)
            .eq('id', usuarioId);
        if (error) throw error;
    } else {
        const { error } = await supabaseClient
            .from('usuarios')
            .insert([usuarioData]);
        if (error) throw error;
    }
}

// ============================================
// BANCOS
// ============================================

async function loadBancosDocumentos() {
    try {
        const { data, error } = await supabaseClient
            .from('bancos_documentos')
            .select('*')
            .order('fecha_subida', { ascending: false });
        
        if (error) throw error;
        
        bancosDocumentos = data.map(b => ({
            id: b.id,
            tipo: b.tipo,
            archivoPdf: b.archivo_pdf,
            fechaSubida: b.fecha_subida,
            usuarioSubio: b.usuario_subio
        }));
    } catch (error) {
        console.error('Error loading bancos:', error);
        throw error;
    }
}

async function saveBancoDocumento(bancoData) {
    const { error } = await supabaseClient
        .from('bancos_documentos')
        .insert([bancoData]);
    if (error) throw error;
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

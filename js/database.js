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
            loadBancosDocumentos(),
            loadEstacionamiento(),
            loadBitacoraSemanal()
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
            numeroDespacho: inq.numero_despacho,
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
            numeroEspacio: e.numero_espacio,
            inquilinoNombre: e.inquilino_nombre,
            numeroDespacho: e.numero_despacho,
            colorAsignado: e.color_asignado
        }));
    } catch (error) {
        console.error('Error loading estacionamiento:', error);
        throw error;
    }
}

async function updateEstacionamiento(espacioId, inquilinoNombre) {
    try {
        // Buscar el inquilino para obtener su número de despacho
        const { data: inquilinoData } = await supabaseClient
            .from('inquilinos')
            .select('numero_despacho')
            .eq('nombre', inquilinoNombre)
            .single();
        
        const numeroDespacho = inquilinoData?.numero_despacho || null;
        
        const { error } = await supabaseClient
            .from('estacionamiento')
            .update({
                inquilino_nombre: inquilinoNombre,
                numero_despacho: numeroDespacho
            })
            .eq('id', espacioId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Error updating estacionamiento:', error);
        throw error;
    }
}

// ============================================
// BITÁCORA SEMANAL
// ============================================

async function loadBitacoraSemanal() {
    try {
        const { data, error } = await supabaseClient
            .from('bitacora_semanal')
            .select('*')
            .order('semana_inicio', { ascending: false });
        
        if (error) throw error;
        
        bitacoraSemanal = data.map(b => ({
            id: b.id,
            semanaInicio: b.semana_inicio,
            semanaFin: b.semana_fin,
            semanaTexto: b.semana_texto,
            notas: b.notas,
            usuarioModifico: b.usuario_modifico,
            fechaModificacion: b.fecha_modificacion
        }));
    } catch (error) {
        console.error('Error loading bitacora:', error);
        throw error;
    }
}

async function updateBitacoraSemanal(bitacoraId, notas) {
    try {
        const { error } = await supabaseClient
            .from('bitacora_semanal')
            .update({
                notas: notas,
                usuario_modifico: currentUser,
                fecha_modificacion: new Date().toISOString()
            })
            .eq('id', bitacoraId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Error updating bitacora:', error);
        throw error;
    }
}

async function createNextWeekBitacora() {
    try {
        // Obtener la última semana registrada
        const { data: lastWeek } = await supabaseClient
            .from('bitacora_semanal')
            .select('semana_inicio, semana_fin')
            .order('semana_inicio', { ascending: false })
            .limit(1)
            .single();
        
        if (lastWeek) {
            // Calcular la siguiente semana
            const nextInicio = new Date(lastWeek.semana_fin);
            nextInicio.setDate(nextInicio.getDate() + 1); // Día después del último sábado
            
            const nextFin = new Date(nextInicio);
            nextFin.setDate(nextFin.getDate() + 6); // 6 días después = sábado
            
            // Formato de texto
            const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            const textoSemana = `${nextInicio.getDate()} al ${nextFin.getDate()} ${meses[nextFin.getMonth()]} ${nextFin.getFullYear()}`;
            
            const { error } = await supabaseClient
                .from('bitacora_semanal')
                .insert([{
                    semana_inicio: nextInicio.toISOString().split('T')[0],
                    semana_fin: nextFin.toISOString().split('T')[0],
                    semana_texto: textoSemana,
                    notas: ''
                }]);
            
            if (error) throw error;
        }
    } catch (error) {
        console.error('Error creating next week:', error);
        throw error;
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

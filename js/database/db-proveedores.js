/* ========================================
   DB-PROVEEDORES.JS - Database operations for proveedores
   CORREGIDO: queries separadas (no nested selects)
   ======================================== */

async function loadProveedores() {
    try {
        // Queries separadas - nested selects dan error 500
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
            id: prov.id,
            nombre: prov.nombre,
            servicio: prov.servicio,
            clabe: prov.clabe,
            rfc: prov.rfc,
            notas: prov.notas,
            contactos: (contactosData || []).filter(c => c.proveedor_id === prov.id).map(c => ({
                id: c.id,
                nombre: c.nombre,
                telefono: c.telefono,
                email: c.email
            })),
            facturas: (facturasData || []).filter(f => f.proveedor_id === prov.id).map(f => ({
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
            documentos: (docsData || []).filter(d => d.proveedor_id === prov.id).map(d => ({
                id: d.id,
                nombre: d.nombre_documento,
                archivo: d.archivo_pdf,
                fecha: d.fecha_guardado,
                usuario: d.usuario_guardo
            })).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
        }));
        
        console.log('✅ Proveedores cargados:', proveedores.length);
    } catch (error) {
        console.error('❌ Error loading proveedores:', error);
        throw error;
    }
}

async function saveProveedor(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const docFile = document.getElementById('proveedorDocAdicional').files[0];
        let docURL = null;
        let docNombre = null;
        
        if (docFile) {
            docURL = await fileToBase64(docFile);
            docNombre = document.getElementById('proveedorNombreDoc').value;
        }
        
        const proveedorData = {
            nombre: document.getElementById('proveedorNombre').value,
            servicio: document.getElementById('proveedorServicio').value,
            clabe: document.getElementById('proveedorClabe').value || null,
            rfc: document.getElementById('proveedorRFC').value || null,
            notas: document.getElementById('proveedorNotas').value || null
        };
        
        let proveedorId;
        
        if (isEditMode && currentProveedorId) {
            const { error } = await supabaseClient
                .from('proveedores')
                .update(proveedorData)
                .eq('id', currentProveedorId);
            
            if (error) throw error;
            
            await supabaseClient
                .from('proveedores_contactos')
                .delete()
                .eq('proveedor_id', currentProveedorId);
            
            proveedorId = currentProveedorId;
        } else {
            const { data, error } = await supabaseClient
                .from('proveedores')
                .insert([proveedorData])
                .select();
            
            if (error) throw error;
            proveedorId = data[0].id;
        }
        
        if (tempProveedorContactos.length > 0) {
            const contactosToInsert = tempProveedorContactos.map(c => ({
                proveedor_id: proveedorId,
                nombre: c.nombre,
                telefono: c.telefono || null,
                email: c.email || null
            }));
            
            const { error: contactosError } = await supabaseClient
                .from('proveedores_contactos')
                .insert(contactosToInsert);
            
            if (contactosError) throw contactosError;
        }
        
        if (docURL && docNombre) {
            const { error: docError } = await supabaseClient
                .from('proveedores_documentos')
                .insert([{
                    proveedor_id: proveedorId,
                    nombre_documento: docNombre,
                    archivo_pdf: docURL,
                    fecha_guardado: new Date().toISOString().split('T')[0],
                    usuario_guardo: currentUser.nombre
                }]);
            
            if (docError) throw docError;
        }
        
        await loadProveedores();
        closeModal('addProveedorModal');
        
        if (currentSubContext === 'proveedores-list') {
            renderProveedoresTable();
        }
        
        alert('✅ Proveedor guardado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar proveedor: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function deleteProveedor() {
    if (!confirm('¿Está seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) {
        return;
    }
    
    showLoading();
    
    try {
        const { error } = await supabaseClient
            .from('proveedores')
            .delete()
            .eq('id', currentProveedorId);
        
        if (error) throw error;
        
        await loadProveedores();
        closeModal('proveedorDetailModal');
        renderProveedoresTable();
        
        alert('✅ Proveedor eliminado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar proveedor: ' + error.message);
    } finally {
        hideLoading();
    }
}

function editProveedor() {
    const prov = proveedores.find(p => p.id === currentProveedorId);
    if (!prov) return;
    
    isEditMode = true;
    tempProveedorContactos = [...(prov.contactos || [])];
    
    document.getElementById('addProveedorTitle').textContent = 'Editar Proveedor';
    document.getElementById('proveedorNombre').value = prov.nombre;
    document.getElementById('proveedorServicio').value = prov.servicio;
    document.getElementById('proveedorClabe').value = prov.clabe || '';
    document.getElementById('proveedorRFC').value = prov.rfc || '';
    document.getElementById('proveedorNotas').value = prov.notas || '';
    
    renderContactosList(tempProveedorContactos, 'proveedorContactosList', 'deleteProveedorContacto', 'showEditContactoProveedorModal');
    
    closeModal('proveedorDetailModal');
    document.getElementById('addProveedorModal').classList.add('active');
}

console.log('✅ DB-PROVEEDORES.JS cargado');

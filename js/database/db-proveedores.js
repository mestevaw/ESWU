/* ========================================
   DB-PROVEEDORES.JS - Database operations for proveedores
   Usa queries separadas (NO nested selects)
   ======================================== */

async function loadProveedores() {
    try {
        // Query 1: Solo proveedores
        var r1 = await supabaseClient
            .from('proveedores')
            .select('*')
            .order('nombre');
        
        if (r1.error) throw r1.error;
        
        // Query 2: Todos los contactos
        var r2 = await supabaseClient
            .from('proveedores_contactos')
            .select('*');
        
        if (r2.error) throw r2.error;
        
        // Query 3: Todas las facturas
        var r3 = await supabaseClient
            .from('facturas')
            .select('*');
        
        if (r3.error) throw r3.error;
        
        // Query 4: Todos los documentos
        var r4 = await supabaseClient
            .from('proveedores_documentos')
            .select('*');
        
        if (r4.error) throw r4.error;
        
        var contactosData = r2.data || [];
        var facturasData = r3.data || [];
        var docsData = r4.data || [];
        
        // Combinar en JavaScript
        proveedores = r1.data.map(function(prov) {
            return {
                id: prov.id,
                nombre: prov.nombre,
                servicio: prov.servicio,
                clabe: prov.clabe,
                rfc: prov.rfc,
                notas: prov.notas,
                contactos: contactosData.filter(function(c) { return c.proveedor_id === prov.id; }).map(function(c) {
                    return { id: c.id, nombre: c.nombre, telefono: c.telefono, email: c.email };
                }),
                facturas: facturasData.filter(function(f) { return f.proveedor_id === prov.id; }).map(function(f) {
                    return {
                        id: f.id,
                        numero: f.numero,
                        fecha: f.fecha,
                        vencimiento: f.vencimiento,
                        monto: parseFloat(f.monto),
                        iva: parseFloat(f.iva || 0),
                        fecha_pago: f.fecha_pago,
                        documento_file: f.documento_file,
                        pago_file: f.pago_file
                    };
                }).sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); }),
                documentos: docsData.filter(function(d) { return d.proveedor_id === prov.id; }).map(function(d) {
                    return { id: d.id, nombre: d.nombre_documento, archivo: d.archivo_pdf, fecha: d.fecha_guardado, usuario: d.usuario_guardo };
                }).sort(function(a, b) { return (a.nombre || '').localeCompare(b.nombre || ''); })
            };
        });
        
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
        var docFile = document.getElementById('proveedorDocAdicional').files[0];
        var docURL = null;
        var docNombre = null;
        
        if (docFile) {
            docURL = await fileToBase64(docFile);
            docNombre = document.getElementById('proveedorNombreDoc').value;
        }
        
        var proveedorData = {
            nombre: document.getElementById('proveedorNombre').value,
            servicio: document.getElementById('proveedorServicio').value,
            clabe: document.getElementById('proveedorClabe').value || null,
            rfc: document.getElementById('proveedorRFC').value || null,
            notas: document.getElementById('proveedorNotas').value || null
        };
        
        var proveedorId;
        
        if (isEditMode && currentProveedorId) {
            var result1 = await supabaseClient
                .from('proveedores')
                .update(proveedorData)
                .eq('id', currentProveedorId);
            
            if (result1.error) throw result1.error;
            
            await supabaseClient
                .from('proveedores_contactos')
                .delete()
                .eq('proveedor_id', currentProveedorId);
            
            proveedorId = currentProveedorId;
        } else {
            var result2 = await supabaseClient
                .from('proveedores')
                .insert([proveedorData])
                .select();
            
            if (result2.error) throw result2.error;
            proveedorId = result2.data[0].id;
        }
        
        if (tempProveedorContactos.length > 0) {
            var contactosToInsert = tempProveedorContactos.map(function(c) {
                return {
                    proveedor_id: proveedorId,
                    nombre: c.nombre,
                    telefono: c.telefono || null,
                    email: c.email || null
                };
            });
            
            var result3 = await supabaseClient
                .from('proveedores_contactos')
                .insert(contactosToInsert);
            
            if (result3.error) throw result3.error;
        }
        
        if (docURL && docNombre) {
            var result4 = await supabaseClient
                .from('proveedores_documentos')
                .insert([{
                    proveedor_id: proveedorId,
                    nombre_documento: docNombre,
                    archivo_pdf: docURL,
                    fecha_guardado: new Date().toISOString().split('T')[0],
                    usuario_guardo: currentUser.nombre
                }]);
            
            if (result4.error) throw result4.error;
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
        var result = await supabaseClient
            .from('proveedores')
            .delete()
            .eq('id', currentProveedorId);
        
        if (result.error) throw result.error;
        
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
    var prov = proveedores.find(function(p) { return p.id === currentProveedorId; });
    if (!prov) return;
    
    isEditMode = true;
    tempProveedorContactos = [].concat(prov.contactos || []);
    
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

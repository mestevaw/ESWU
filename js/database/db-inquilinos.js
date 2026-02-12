/* ========================================
   DB-INQUILINOS.JS - Database operations for inquilinos
   Usa queries separadas (NO nested selects)
   ======================================== */

async function loadInquilinos() {
    try {
        // Query 1: Solo inquilinos
        var r1 = await supabaseClient
            .from('inquilinos')
            .select('*')
            .order('nombre');
        
        if (r1.error) throw r1.error;
        
        // Query 2: Todos los contactos
        var r2 = await supabaseClient
            .from('inquilinos_contactos')
            .select('*');
        
        if (r2.error) throw r2.error;
        
        // Query 3: Todos los pagos
        var r3 = await supabaseClient
            .from('pagos_inquilinos')
            .select('*');
        
        if (r3.error) throw r3.error;
        
        // Query 4: Todos los documentos
        var r4 = await supabaseClient
            .from('inquilinos_documentos')
            .select('*');
        
        if (r4.error) throw r4.error;
        
        var contactosData = r2.data || [];
        var pagosData = r3.data || [];
        var docsData = r4.data || [];
        
        // Combinar en JavaScript
        inquilinos = r1.data.map(function(inq) {
            return {
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
                contrato_activo: inq.contrato_activo,
                contactos: contactosData.filter(function(c) { return c.inquilino_id === inq.id; }).map(function(c) {
                    return { id: c.id, nombre: c.nombre, telefono: c.telefono, email: c.email };
                }),
                pagos: pagosData.filter(function(p) { return p.inquilino_id === inq.id; }).map(function(p) {
                    return { id: p.id, fecha: p.fecha, monto: parseFloat(p.monto), completo: p.completo, pago_file: p.pago_file };
                }).sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); }),
                documentos: docsData.filter(function(d) { return d.inquilino_id === inq.id; }).map(function(d) {
                    return { id: d.id, nombre: d.nombre_documento, archivo: d.archivo_pdf, fecha: d.fecha_guardado, usuario: d.usuario_guardo };
                }).sort(function(a, b) { return (a.nombre || '').localeCompare(b.nombre || ''); })
            };
        });
        
        console.log('✅ Inquilinos cargados:', inquilinos.length);
    } catch (error) {
        console.error('❌ Error loading inquilinos:', error);
        throw error;
    }
}

async function saveInquilino(event) {
    event.preventDefault();
    showLoading();
    
    try {
        var contratoFile = document.getElementById('inquilinoContrato').files[0];
        var contratoURL = null;
        
        if (contratoFile) {
            contratoURL = await fileToBase64(contratoFile);
        }
        
        var inquilinoData = {
            nombre: document.getElementById('inquilinoNombre').value,
            clabe: document.getElementById('inquilinoClabe').value || null,
            rfc: document.getElementById('inquilinoRFC').value || null,
            m2: document.getElementById('inquilinoM2').value || null,
            numero_despacho: document.getElementById('inquilinoDespacho').value || null,
            renta: parseFloat(document.getElementById('inquilinoRenta').value),
            fecha_inicio: document.getElementById('inquilinoFechaInicio').value,
            fecha_vencimiento: document.getElementById('inquilinoFechaVenc').value,
            notas: document.getElementById('inquilinoNotas').value || null
        };
        
        if (contratoURL) {
            inquilinoData.contrato_file = contratoURL;
        }
        
        var inquilinoId;
        
        if (isEditMode && currentInquilinoId) {
            var result1 = await supabaseClient
                .from('inquilinos')
                .update(inquilinoData)
                .eq('id', currentInquilinoId);
            
            if (result1.error) throw result1.error;
            
            await supabaseClient
                .from('inquilinos_contactos')
                .delete()
                .eq('inquilino_id', currentInquilinoId);
            
            inquilinoId = currentInquilinoId;
        } else {
            var result2 = await supabaseClient
                .from('inquilinos')
                .insert([inquilinoData])
                .select();
            
            if (result2.error) throw result2.error;
            inquilinoId = result2.data[0].id;
        }
        
        if (tempInquilinoContactos.length > 0) {
            var contactosToInsert = tempInquilinoContactos.map(function(c) {
                return {
                    inquilino_id: inquilinoId,
                    nombre: c.nombre,
                    telefono: c.telefono || null,
                    email: c.email || null
                };
            });
            
            var result3 = await supabaseClient
                .from('inquilinos_contactos')
                .insert(contactosToInsert);
            
            if (result3.error) throw result3.error;
        }
        
        await loadInquilinos();
        closeModal('addInquilinoModal');
        
        if (currentSubContext === 'inquilinos-list') {
            renderInquilinosTable();
        }
        
        alert('✅ Inquilino guardado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar inquilino: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function savePagoRenta(event) {
    event.preventDefault();
    showLoading();
    
    try {
        var inq = inquilinos.find(function(i) { return i.id === currentInquilinoId; });
        if (!inq) throw new Error('Inquilino no encontrado');
        
        var pagoCompleto = document.getElementById('pagoCompleto').value === 'si';
        var monto = pagoCompleto ? inq.renta : parseFloat(document.getElementById('pagoMonto').value);
        
        var pagoFile = document.getElementById('pagoPDF').files[0];
        var pagoURL = null;
        
        if (pagoFile) {
            pagoURL = await fileToBase64(pagoFile);
        }
        
        var pagoData = {
            inquilino_id: currentInquilinoId,
            fecha: document.getElementById('pagoFecha').value,
            monto: monto,
            completo: pagoCompleto,
            pago_file: pagoURL
        };
        
        var result = await supabaseClient
            .from('pagos_inquilinos')
            .insert([pagoData]);
        
        if (result.error) throw result.error;
        
        await loadInquilinos();
        showInquilinoDetail(currentInquilinoId);
        closeModal('registrarPagoModal');
        
        alert('✅ Pago registrado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al registrar pago: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function saveDocumentoAdicional(event) {
    event.preventDefault();
    showLoading();
    
    try {
        var nombre = document.getElementById('nuevoDocNombre').value;
        var file = document.getElementById('nuevoDocPDF').files[0];
        
        if (!file) {
            throw new Error('Seleccione un archivo PDF');
        }
        
        var pdfBase64 = await fileToBase64(file);
        
        var result = await supabaseClient
            .from('inquilinos_documentos')
            .insert([{
                inquilino_id: currentInquilinoId,
                nombre_documento: nombre,
                archivo_pdf: pdfBase64,
                fecha_guardado: new Date().toISOString().split('T')[0],
                usuario_guardo: currentUser.nombre
            }]);
        
        if (result.error) throw result.error;
        
        await loadInquilinos();
        showInquilinoDetail(currentInquilinoId);
        closeModal('agregarDocumentoModal');
        
        alert('✅ Documento agregado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar documento: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function deleteInquilino() {
    if (!confirm('¿Está seguro de eliminar este inquilino? Esta acción no se puede deshacer.')) {
        return;
    }
    
    showLoading();
    
    try {
        var result = await supabaseClient
            .from('inquilinos')
            .delete()
            .eq('id', currentInquilinoId);
        
        if (result.error) throw result.error;
        
        await loadInquilinos();
        closeModal('inquilinoDetailModal');
        renderInquilinosTable();
        
        alert('✅ Inquilino eliminado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar inquilino: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function deleteDocumentoAdicional(docId) {
    if (!confirm('¿Eliminar este documento?')) return;
    
    showLoading();
    try {
        var result = await supabaseClient
            .from('inquilinos_documentos')
            .delete()
            .eq('id', docId);
        
        if (result.error) throw result.error;
        
        await loadInquilinos();
        showInquilinoDetail(currentInquilinoId);
        
        alert('✅ Documento eliminado');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar documento: ' + error.message);
    } finally {
        hideLoading();
    }
}

function editInquilino() {
    var inq = inquilinos.find(function(i) { return i.id === currentInquilinoId; });
    if (!inq) return;
    
    isEditMode = true;
    tempInquilinoContactos = [].concat(inq.contactos || []);
    
    document.getElementById('addInquilinoTitle').textContent = 'Editar Inquilino';
    document.getElementById('inquilinoNombre').value = inq.nombre;
    document.getElementById('inquilinoClabe').value = inq.clabe || '';
    document.getElementById('inquilinoRFC').value = inq.rfc || '';
    document.getElementById('inquilinoM2').value = inq.m2 || '';
    document.getElementById('inquilinoDespacho').value = inq.numero_despacho || '';
    document.getElementById('inquilinoRenta').value = inq.renta;
    document.getElementById('inquilinoFechaInicio').value = inq.fecha_inicio;
    document.getElementById('inquilinoFechaVenc').value = inq.fecha_vencimiento;
    document.getElementById('inquilinoNotas').value = inq.notas || '';
    
    renderContactosList(tempInquilinoContactos, 'inquilinoContactosList', 'deleteInquilinoContacto', 'showEditContactoInquilinoModal');
    
    closeModal('inquilinoDetailModal');
    document.getElementById('addInquilinoModal').classList.add('active');
}

console.log('✅ DB-INQUILINOS.JS cargado');

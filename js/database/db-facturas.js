/* ========================================
   DB-FACTURAS.JS - Database operations for facturas
   ======================================== */

async function saveFactura(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const docFile = document.getElementById('facturaDocumento').files[0];
        let docURL = null;
        
        if (docFile) {
            docURL = await fileToBase64(docFile);
        }
        
        const facturaData = {
            proveedor_id: currentProveedorId,
            numero: document.getElementById('facturaNumero').value || null,
            fecha: document.getElementById('facturaFecha').value,
            vencimiento: document.getElementById('facturaVencimiento').value,
            monto: parseFloat(document.getElementById('facturaMonto').value),
            iva: parseFloat(document.getElementById('facturaIVA').value) || 0,
            documento_file: docURL
        };
        
        const { error } = await supabaseClient
            .from('facturas')
            .insert([facturaData]);
        
        if (error) throw error;
        
        await loadProveedores();
        showProveedorDetail(currentProveedorId);
        closeModal('registrarFacturaModal');
        
        alert('✅ Factura registrada correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar factura: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function savePagoFactura(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const pagoFile = document.getElementById('pagoPDFFactura').files[0];
        let pagoURL = null;
        
        if (pagoFile) {
            pagoURL = await fileToBase64(pagoFile);
        }
        
        const fechaPago = document.getElementById('fechaPagoFactura').value;
        
        const { error } = await supabaseClient
            .from('facturas')
            .update({
                fecha_pago: fechaPago,
                pago_file: pagoURL
            })
            .eq('id', currentFacturaId);
        
        if (error) throw error;
        
        await loadProveedores();
        showProveedorDetail(currentProveedorId);
        closeModal('pagarFacturaModal');
        
        alert('✅ Factura marcada como pagada');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al registrar pago: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function deleteFactura(facturaId) {
    if (!confirm('¿Está seguro de eliminar esta factura? Esta acción no se puede deshacer.')) {
        return;
    }
    
    showLoading();
    
    try {
        const { error } = await supabaseClient
            .from('facturas')
            .delete()
            .eq('id', facturaId);
        
        if (error) throw error;
        
        await loadProveedores();
        showProveedorDetail(currentProveedorId);
        
        alert('✅ Factura eliminada correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar factura: ' + error.message);
    } finally {
        hideLoading();
    }
}

console.log('✅ DB-FACTURAS.JS cargado');

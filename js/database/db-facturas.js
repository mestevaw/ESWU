/* ========================================
   DB-FACTURAS.JS - Database operations for facturas
   Última actualización: 2026-02-12 18:00 CST
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
            iva: parseFloat(document.getElementById('facturaIVA').value) || 0
        };
        
        // Solo incluir documento_file si se subió uno nuevo
        if (docURL) {
            facturaData.documento_file = docURL;
        }
        
        if (window.isEditingFactura && currentFacturaId) {
            // Modo edición: UPDATE (no incluir proveedor_id)
            delete facturaData.proveedor_id;
            const { error } = await supabaseClient
                .from('facturas')
                .update(facturaData)
                .eq('id', currentFacturaId);
            
            if (error) throw error;
        } else {
            // Modo nuevo: INSERT
            if (!docURL) facturaData.documento_file = null;
            
            const { error } = await supabaseClient
                .from('facturas')
                .insert([facturaData]);
            
            if (error) throw error;
        }
        
        await loadProveedores();
        closeModal('registrarFacturaModal');
        showProveedorDetail(currentProveedorId);
        setTimeout(() => switchTab('proveedor', 'porpagar'), 100);
        
        window.isEditingFactura = false;
        currentFacturaId = null;
        
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
        const fechaPago = document.getElementById('fechaPagoFactura').value;
        
        // Construir update solo con lo necesario
        const updateData = { fecha_pago: fechaPago };
        
        // Solo incluir pago_file si se subió un PDF
        if (pagoFile) {
            updateData.pago_file = await fileToBase64(pagoFile);
        }
        
        const { error } = await supabaseClient
            .from('facturas')
            .update(updateData)
            .eq('id', currentFacturaId);
        
        if (error) throw error;
        
        await loadProveedores();
        closeModal('pagarFacturaModal');
        showProveedorDetail(currentProveedorId);
        setTimeout(() => switchTab('proveedor', 'pagadas'), 100);
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al registrar pago: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function deleteFactura(facturaId) {
    showLoading();
    
    try {
        const { error } = await supabaseClient
            .from('facturas')
            .delete()
            .eq('id', facturaId);
        
        if (error) throw error;
        
        await loadProveedores();
        showProveedorDetail(currentProveedorId);
        setTimeout(() => switchTab('proveedor', 'porpagar'), 100);
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar factura: ' + error.message);
    } finally {
        hideLoading();
    }
}

console.log('✅ DB-FACTURAS.JS cargado (2026-02-12 18:00 CST)');

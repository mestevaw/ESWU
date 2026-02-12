/* ========================================
   PROVEEDORES UI - TODAS LAS FUNCIONES
   Última actualización: 2026-02-12 15:00 CST
   ======================================== */

// ============================================
// FUNCIONES AUXILIARES PARA VER DOCUMENTOS
// ============================================

function viewFacturaDoc(facturaIdOrArchivo, tipo) {
    if (typeof facturaIdOrArchivo === 'number') {
        fetchAndViewFactura(facturaIdOrArchivo, tipo || 'documento');
    } else if (facturaIdOrArchivo) {
        openPDFViewer(facturaIdOrArchivo);
    }
}

function viewDocumento(docIdOrArchivo) {
    if (typeof docIdOrArchivo === 'number') {
        fetchAndViewDocProveedor(docIdOrArchivo);
    } else if (docIdOrArchivo) {
        openPDFViewer(docIdOrArchivo);
    }
}

// ============================================
// NAVEGACIÓN Y VISTAS
// ============================================

function showProveedoresView(view) {
    document.getElementById('proveedoresSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('proveedoresPage').classList.add('active');
    
    document.getElementById('proveedoresListView').classList.add('hidden');
    document.getElementById('proveedoresFacturasPagadasView').classList.add('hidden');
    document.getElementById('proveedoresFacturasPorPagarView').classList.add('hidden');
    
    currentSubContext = 'proveedores-' + view;
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    if (view === 'list') {
        document.getElementById('btnSearch').classList.remove('hidden');
        currentSearchContext = 'proveedores';
    } else {
        document.getElementById('btnSearch').classList.add('hidden');
        currentSearchContext = null;
    }
    
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    if (view === 'list') {
        document.getElementById('proveedoresListView').classList.remove('hidden');
        renderProveedoresTable();
    } else if (view === 'facturasPagadas') {
        document.getElementById('proveedoresFacturasPagadasView').classList.remove('hidden');
        renderProveedoresFacturasPagadas();
    } else if (view === 'facturasPorPagar') {
        document.getElementById('proveedoresFacturasPorPagarView').classList.remove('hidden');
        renderProveedoresFacturasPorPagar();
    }
}

// ============================================
// RENDERIZADO DE TABLAS
// ============================================

function renderProveedoresTable() {
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    proveedores.forEach(prov => {
        const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
        const row = tbody.insertRow();
        row.innerHTML = `
            <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${prov.nombre}</td>
            <td>${prov.servicio}</td>
            <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${primerContacto.nombre || '-'}</td>
            <td>${primerContacto.telefono || '-'}</td>
            <td>${primerContacto.email || '-'}</td>
        `;
        row.style.cursor = 'pointer';
        row.onclick = () => showProveedorDetail(prov.id);
    });
    
    if (proveedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light)">No hay proveedores</td></tr>';
    }
}

function filtrarProveedores(query) {
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filtrados = proveedores.filter(prov => prov.nombre.toLowerCase().includes(query));
    
    filtrados.forEach(prov => {
        const row = tbody.insertRow();
        const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
        row.innerHTML = `
            <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${prov.nombre}</td>
            <td>${prov.servicio}</td>
            <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${primerContacto.nombre || '-'}</td>
            <td>${primerContacto.telefono || '-'}</td>
            <td>${primerContacto.email || '-'}</td>
        `;
        row.style.cursor = 'pointer';
        row.onclick = () => showProveedorDetail(prov.id);
    });
    
    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron proveedores</td></tr>';
    }
}

function renderProveedoresFacturasPagadas() {
    const tbody = document.getElementById('proveedoresFacturasPagadasTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filterType = document.getElementById('provFactPagFilter').value;
    const year = parseInt(document.getElementById('provFactPagYear').value);
    const monthSelect = document.getElementById('provFactPagMonth');
    
    if (filterType === 'mensual') {
        monthSelect.classList.remove('hidden');
    } else {
        monthSelect.classList.add('hidden');
    }
    
    const month = filterType === 'mensual' ? parseInt(monthSelect.value) : null;
    const pagadas = [];
    let totalPagadas = 0;
    
    proveedores.forEach(prov => {
        if (prov.facturas) {
            prov.facturas.forEach(f => {
                if (f.fecha_pago) {
                    const pd = new Date(f.fecha_pago + 'T00:00:00');
                    if (pd.getFullYear() === year && (month === null || pd.getMonth() === month)) {
                        pagadas.push({
                            proveedor: prov.nombre,
                            proveedorId: prov.id,
                            facturaId: f.id,
                            numero: f.numero || 'S/N',
                            monto: f.monto,
                            fecha: f.fecha_pago,
                            has_documento: f.has_documento,
                            has_pago: f.has_pago
                        });
                        totalPagadas += f.monto;
                    }
                }
            });
        }
    });
    
    pagadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    pagadas.forEach(f => {
        const row = tbody.insertRow();
        
        const facturaCell = f.has_documento 
            ? `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;cursor:pointer;color:var(--primary)" onclick="event.stopPropagation(); viewFacturaDoc(${f.facturaId}, 'documento')">${f.numero}</td>`
            : `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${f.numero}</td>`;
        const fechaCell = f.has_pago
            ? `<td style="cursor:pointer;color:var(--primary)" onclick="event.stopPropagation(); viewFacturaDoc(${f.facturaId}, 'pago')">${formatDate(f.fecha)}</td>`
            : `<td>${formatDate(f.fecha)}</td>`;
        
        row.innerHTML = `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${f.proveedor}</td>${facturaCell}<td class="currency">${formatCurrency(f.monto)}</td>${fechaCell}`;
        
        row.style.cursor = 'pointer';
        row.onclick = () => showProveedorDetail(f.proveedorId);
    });
    
    if (pagadas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light)">No hay facturas pagadas</td></tr>';
    } else {
        const row = tbody.insertRow();
        row.className = 'total-row';
        row.innerHTML = `<td colspan="2" style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(totalPagadas)}</strong></td><td></td>`;
    }
}

// ============================================
// STANDALONE: FACTURAS POR PAGAR (con botones de acción)
// ============================================

function renderProveedoresFacturasPorPagar() {
    const tbody = document.getElementById('proveedoresFacturasPorPagarTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filterType = document.getElementById('provFactPorPagFilter').value;
    const year = parseInt(document.getElementById('provFactPorPagYear').value);
    const monthSelect = document.getElementById('provFactPorPagMonth');
    
    if (filterType === 'mensual') {
        monthSelect.classList.remove('hidden');
    } else {
        monthSelect.classList.add('hidden');
    }
    
    const month = filterType === 'mensual' ? parseInt(monthSelect.value) : null;
    const porPagar = [];
    let totalPorPagar = 0;
    
    proveedores.forEach(prov => {
        if (prov.facturas) {
            prov.facturas.forEach(f => {
                if (!f.fecha_pago) {
                    const vd = new Date(f.vencimiento + 'T00:00:00');
                    if (vd.getFullYear() === year && (month === null || month === vd.getMonth())) {
                        porPagar.push({
                            provId: prov.id,
                            factId: f.id,
                            proveedor: prov.nombre,
                            numero: f.numero || 'S/N',
                            monto: f.monto,
                            vencimiento: f.vencimiento,
                            has_documento: f.has_documento
                        });
                        totalPorPagar += f.monto;
                    }
                }
            });
        }
    });
    
    porPagar.sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento));
    porPagar.forEach(f => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${f.proveedor}</td>
            <td>${f.numero}</td>
            <td class="currency">${formatCurrency(f.monto)}</td>
            <td>${formatDateVencimiento(f.vencimiento)}</td>
            <td style="white-space:nowrap;" onclick="event.stopPropagation()">
                <span onclick="showPagarFacturaModal(${f.factId})" title="Dar factura x pagada" style="cursor:pointer; font-size:1.1rem; padding:0.15rem 0.3rem; border-radius:4px;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">🏦</span>
                <span onclick="deleteFacturaConConfirm(${f.factId}, '${(f.numero).replace(/'/g, "\\'")}')" title="Eliminar factura" style="cursor:pointer; color:var(--danger); font-size:1.1rem; font-weight:700; padding:0.15rem 0.3rem; border-radius:4px;" onmouseover="this.style.background='#fed7d7'" onmouseout="this.style.background='transparent'">✕</span>
            </td>
        `;
        
        row.style.cursor = 'pointer';
        if (f.has_documento) {
            row.onclick = () => viewFacturaDoc(f.factId, 'documento');
        }
    });
    
    if (porPagar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light)">No hay facturas por pagar</td></tr>';
    } else {
        const row = tbody.insertRow();
        row.className = 'total-row';
        row.innerHTML = `<td colspan="2" style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(totalPorPagar)}</strong></td><td colspan="2"></td>`;
    }
}

// ============================================
// MODAL DE DETALLE (diseño restaurado sesiones 3-6)
// ============================================

function showProveedorDetail(id) {
    const prov = proveedores.find(p => p.id === id);
    if (!prov) {
        alert('ERROR: Proveedor no encontrado');
        return;
    }
    
    currentProveedorId = id;
    
    document.getElementById('proveedorDetailNombre').textContent = prov.nombre;
    document.getElementById('proveedorDetailServicio').textContent = prov.servicio || '';
    
    // Contactos
    const primaryDiv = document.getElementById('provDetailContactPrimary');
    const additionalDiv = document.getElementById('provDetailAdditionalContacts');
    
    if (prov.contactos && prov.contactos.length > 0) {
        const first = prov.contactos[0];
        primaryDiv.innerHTML = `
            <div style="margin-bottom:0.5rem;padding:0.5rem;background:white;border-radius:4px">
                <strong>${first.nombre}</strong><br>
                <small><strong>Tel:</strong> ${first.telefono || '-'} | <strong>Email:</strong> ${first.email || '-'}</small>
            </div>
        `;
        
        if (prov.contactos.length > 1) {
            additionalDiv.innerHTML = prov.contactos.slice(1).map(c => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:var(--bg);border-radius:4px">
                    <strong>${c.nombre}</strong><br>
                    <small><strong>Tel:</strong> ${c.telefono || '-'} | <strong>Email:</strong> ${c.email || '-'}</small>
                </div>
            `).join('');
        } else {
            additionalDiv.innerHTML = '';
        }
    } else {
        primaryDiv.innerHTML = '<p style="color:var(--text-light)">No hay contactos</p>';
        additionalDiv.innerHTML = '';
    }
    
    document.getElementById('detailProvClabe').textContent = prov.clabe || '-';
    document.getElementById('detailProvRFC').textContent = prov.rfc || '-';
    
    // Notas
    const notasDiv = document.getElementById('proveedorNotasContent');
    if (notasDiv) {
        notasDiv.textContent = prov.notas || 'Sin notas';
    }
    
    // ── Pestaña: Facturas Pagadas (diseño con 2 recuadros) ──
    const facturasPagadasDiv = document.getElementById('facturasPagadas');
    const facturasPagadas = prov.facturas.filter(f => f.fecha_pago);
    let totalPagadas = 0;
    
    if (facturasPagadas.length > 0) {
        facturasPagadasDiv.innerHTML = facturasPagadas.map(f => {
            totalPagadas += f.monto;
            
            // Recuadro 1: "Factura X del fecha" — clickeable si hay PDF
            const facturaBox = f.has_documento
                ? `<div onclick="fetchAndViewFactura(${f.id}, 'documento')" style="background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='var(--bg)'">
                       <strong>Factura ${f.numero || 'S/N'}</strong> del ${formatDate(f.fecha)}
                   </div>`
                : `<div style="background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; color:var(--text-light);">
                       <strong>Factura ${f.numero || 'S/N'}</strong> del ${formatDate(f.fecha)}
                   </div>`;
            
            // Recuadro 2: "Pago del: fecha" — clickeable si hay comprobante PDF
            const pagoBox = f.has_pago
                ? `<div onclick="fetchAndViewFactura(${f.id}, 'pago')" style="background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='var(--bg)'">
                       <strong>Pago del:</strong> ${formatDate(f.fecha_pago)}
                   </div>`
                : `<div style="background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; color:var(--text-light);">
                       <strong>Pago del:</strong> ${formatDate(f.fecha_pago)}
                   </div>`;
            
            return `
                <div style="border:1px solid var(--border); border-radius:6px; padding:0.75rem; margin-bottom:0.5rem; background:white;">
                    <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
                        ${facturaBox}
                        ${pagoBox}
                        <div style="margin-left:auto; font-weight:700; color:var(--primary); white-space:nowrap;">${formatCurrency(f.monto)}</div>
                    </div>
                </div>
            `;
        }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem">TOTAL: <strong>${formatCurrency(totalPagadas)}</strong></div>`;
    } else {
        facturasPagadasDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas pagadas</p>';
    }
    
    // ── Pestaña: Facturas Por Pagar (diseño con iconos 🏦 y ✕) ──
    const facturasPorPagarDiv = document.getElementById('facturasPorPagar');
    const facturasPorPagar = prov.facturas.filter(f => !f.fecha_pago);
    let totalPorPagar = 0;
    
    if (facturasPorPagar.length > 0) {
        facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
            totalPorPagar += f.monto;
            const clickPDF = f.has_documento ? `onclick="fetchAndViewFactura(${f.id}, 'documento')"` : '';
            const cursorPDF = f.has_documento ? 'cursor:pointer;' : '';
            const escapedNumero = (f.numero || 'S/N').replace(/'/g, "\\'");
            
            return `
                <div style="border:1px solid var(--border); border-radius:6px; padding:0; margin-bottom:0.5rem; background:white; position:relative;">
                    <!-- Iconos esquina superior derecha -->
                    <div style="position:absolute; top:0.5rem; right:0.5rem; display:flex; gap:0.25rem; z-index:2;">
                        <span onclick="event.stopPropagation(); showPagarFacturaModal(${f.id})" title="Dar factura x pagada" style="cursor:pointer; font-size:1.1rem; padding:0.15rem 0.3rem; border-radius:4px; transition:background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">🏦</span>
                        <span onclick="event.stopPropagation(); deleteFacturaConConfirm(${f.id}, '${escapedNumero}')" title="Eliminar factura" style="cursor:pointer; color:var(--danger); font-size:1.1rem; font-weight:700; padding:0.15rem 0.3rem; border-radius:4px; transition:background 0.2s;" onmouseover="this.style.background='#fed7d7'" onmouseout="this.style.background='transparent'">✕</span>
                    </div>
                    <!-- Contenido clickeable -->
                    <div style="display:flex; align-items:stretch;">
                        <div ${clickPDF} style="flex:1; background:var(--bg); border-radius:6px 0 0 6px; padding:0.75rem; ${cursorPDF} transition:background 0.2s;" onmouseover="if(this.getAttribute('onclick'))this.style.background='#dbeafe'" onmouseout="this.style.background='var(--bg)'">
                            <div><strong>Factura ${f.numero || 'S/N'}</strong> del ${formatDate(f.fecha)}</div>
                            <div style="margin-top:0.25rem; color:var(--text-light);">A ser pagada el <strong>${formatDate(f.vencimiento)}</strong></div>
                        </div>
                        <div style="display:flex; align-items:flex-end; padding:0.75rem; min-width:120px; justify-content:flex-end;">
                            <span style="font-weight:700; color:var(--primary); font-size:1.05rem;">${formatCurrency(f.monto)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem">TOTAL: <strong>${formatCurrency(totalPorPagar)}</strong></div>`;
    } else {
        facturasPorPagarDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas por pagar</p>';
    }
    
    // ── Pestaña: Documentos Adicionales ──
    const docsDiv = document.getElementById('proveedorDocumentosAdicionales');
    if (prov.documentos && prov.documentos.length > 0) {
        docsDiv.innerHTML = '<table style="width:100%;table-layout:fixed"><thead><tr><th style="width:50%">Nombre</th><th style="width:25%">Fecha</th><th style="width:25%">Usuario</th></tr></thead><tbody>' +
            prov.documentos.map(d => `
                <tr class="doc-item" onclick="fetchAndViewDocProveedor(${d.id})">
                    <td style="word-wrap:break-word">${d.nombre}</td>
                    <td>${formatDate(d.fecha)}</td>
                    <td>${d.usuario}</td>
                </tr>
            `).join('') + '</tbody></table>';
    } else {
        docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay documentos adicionales</p>';
    }
    
    // ── Abrir modal y activar primera pestaña ──
    document.getElementById('proveedorDetailModal').classList.add('active');
    switchTab('proveedor', 'pagadas');
}

// ============================================
// DELETE FACTURA WITH CUSTOM CONFIRM
// ============================================

function deleteFacturaConConfirm(facturaId, numeroFactura) {
    if (confirm('¿Seguro quiere eliminar la factura ' + numeroFactura + '?')) {
        deleteFactura(facturaId);
    }
}

console.log('✅ PROVEEDORES-UI.JS cargado (2026-02-12 15:00 CST)');

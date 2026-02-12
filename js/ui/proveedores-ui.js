/* ========================================
   PROVEEDORES UI - TODAS LAS FUNCIONES
   ======================================== */

// ============================================
// FUNCIONES AUXILIARES PARA VER DOCUMENTOS
// ============================================

function viewFacturaDoc(archivo) {
    if (archivo) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe width='100%' height='100%' src='${archivo}'></iframe>`);
    }
}

function viewDocumento(archivo) {
    if (archivo) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe width='100%' height='100%' src='${archivo}'></iframe>`);
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
                            numero: f.numero || 'S/N',
                            monto: f.monto,
                            fecha: f.fecha_pago,
                            documento_file: f.documento_file,
                            pago_file: f.pago_file
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
        
        // Click en la fila → abre PDF de la factura (no ficha del proveedor)
        if (f.documento_file) {
            row.style.cursor = 'pointer';
            row.onclick = () => viewFacturaDoc(f.documento_file);
        }
        
        // Orden: Proveedor | No. Factura | Pagada en | Monto
        row.innerHTML = `
            <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${f.proveedor}</td>
            <td>${f.numero}</td>
            <td>${formatDate(f.fecha)}</td>
            <td class="currency">${formatCurrency(f.monto)}</td>
        `;
    });
    
    if (pagadas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light)">No hay facturas pagadas</td></tr>';
    } else {
        const row = tbody.insertRow();
        row.className = 'total-row';
        row.innerHTML = `<td colspan="3" style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(totalPagadas)}</strong></td>`;
    }
}

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
                            clabe: prov.clabe || '-',
                            monto: f.monto,
                            vencimiento: f.vencimiento,
                            documento_file: f.documento_file
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
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.proveedor}</td>
            <td style="white-space:nowrap">${f.numero}</td>
            <td style="white-space:nowrap; font-size:0.85rem;">${f.clabe}</td>
            <td style="white-space:nowrap">${formatDateVencimiento(f.vencimiento)}</td>
            <td class="currency" style="white-space:nowrap">${formatCurrency(f.monto)}</td>
        `;
        
        row.style.cursor = 'pointer';
        if (f.documento_file) {
            row.onclick = () => viewFacturaDoc(f.documento_file);
        }
    });
    
    if (porPagar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light)">No hay facturas por pagar</td></tr>';
    } else {
        const row = tbody.insertRow();
        row.className = 'total-row';
        row.innerHTML = `<td colspan="4" style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(totalPorPagar)}</strong></td>`;
    }
}

// ============================================
// MODAL DE DETALLE
// ============================================

function showProveedorDetail(id) {
    const prov = proveedores.find(p => p.id === id);
    if (!prov) {
        alert('ERROR: Proveedor no encontrado');
        return;
    }
    
    currentProveedorId = id;
    
    // ── 1. Nombre con auto-sizing ──
    const nombreEl = document.getElementById('proveedorDetailNombre');
    nombreEl.textContent = prov.nombre;
    if (prov.nombre.length > 40) {
        nombreEl.style.fontSize = '1rem';
    } else if (prov.nombre.length > 25) {
        nombreEl.style.fontSize = '1.2rem';
    } else {
        nombreEl.style.fontSize = '1.5rem';
    }
    
    // ── 2. Servicio debajo del nombre ──
    document.getElementById('detailServicio').textContent = prov.servicio;
    
    // ── 3. Teléfono y Email del contacto principal ──
    const contactInfo = document.getElementById('provDetailContactInfo');
    const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : null;
    
    const telefono = primerContacto?.telefono || '-';
    const email = primerContacto?.email || '-';
    const emailContent = email !== '-' 
        ? `<a href="mailto:${email}" style="color:var(--primary); text-decoration:none;">${email}</a>` 
        : '-';
    
    contactInfo.innerHTML = `
        <div style="background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0.75rem; display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.1rem;">📞</span> <span>${telefono}</span>
        </div>
        <div style="background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0.75rem; display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.1rem;">✉️</span> <span>${emailContent}</span>
        </div>
    `;
    
    // ── 4. RFC y CLABE (se llenan vía IDs en el HTML) ──
    document.getElementById('detailProvRFC').textContent = prov.rfc || '-';
    document.getElementById('detailProvClabe').textContent = prov.clabe || '-';
    
    // ── 5. Contactos adicionales en dropdown ──
    const additionalSection = document.getElementById('provAdditionalContactsSection');
    if (prov.contactos && prov.contactos.length > 1) {
        const additional = prov.contactos.slice(1);
        document.getElementById('provAdditionalContactsCount').textContent = additional.length;
        document.getElementById('provAdditionalContactsList').innerHTML = additional.map(c => {
            const cEmail = c.email 
                ? `<a href="mailto:${c.email}" style="color:var(--primary);text-decoration:none;">✉️ ${c.email}</a>` 
                : '✉️ -';
            return `
                <div style="margin-bottom:0.5rem; padding:0.75rem; background:white; border:1px solid var(--border); border-radius:4px;">
                    <strong>${c.nombre}</strong><br>
                    <small>📞 ${c.telefono || '-'} &nbsp;|&nbsp; ${cEmail}</small>
                </div>
            `;
        }).join('');
        additionalSection.style.display = 'block';
    } else {
        additionalSection.style.display = 'none';
    }
    
    // ── Pestaña: Facturas Pagadas ──
    const facturasPagadasDiv = document.getElementById('facturasPagadas');
    const facturasPagadas = prov.facturas.filter(f => f.fecha_pago);
    let totalPagadas = 0;
    
    if (facturasPagadas.length > 0) {
        facturasPagadasDiv.innerHTML = facturasPagadas.map(f => {
            totalPagadas += f.monto;
            
            // Recuadro 1: "Factura X del fecha" — clickeable si hay PDF
            const facturaBox = f.documento_file
                ? `<div onclick="viewFacturaDoc('${f.documento_file}')" style="background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='var(--bg)'">
                       <strong>Factura ${f.numero || 'S/N'}</strong> del ${formatDate(f.fecha)}
                   </div>`
                : `<div style="background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; color:var(--text-light);">
                       <strong>Factura ${f.numero || 'S/N'}</strong> del ${formatDate(f.fecha)}
                   </div>`;
            
            // Recuadro 2: "Pago del: fecha" — clickeable si hay comprobante PDF
            const pagoBox = f.pago_file
                ? `<div onclick="viewFacturaDoc('${f.pago_file}')" style="background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='var(--bg)'">
                       <strong>Pago del:</strong> ${formatDate(f.fecha_pago)}
                   </div>`
                : `<div style="background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; color:var(--text-light);">
                       <strong>Pago del:</strong> ${formatDate(f.fecha_pago)}
                   </div>`;
            
            return `
                <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem; flex-wrap:wrap;">
                    ${facturaBox}
                    ${pagoBox}
                    <div style="margin-left:auto; font-weight:700; color:var(--primary); white-space:nowrap;">${formatCurrency(f.monto)}</div>
                </div>
            `;
        }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem">TOTAL: <strong>${formatCurrency(totalPagadas)}</strong></div>`;
    } else {
        facturasPagadasDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas pagadas</p>';
    }
    
    // ── Pestaña: Facturas Por Pagar ──
    const facturasPorPagarDiv = document.getElementById('facturasPorPagar');
    const facturasPorPagar = prov.facturas.filter(f => !f.fecha_pago);
    let totalPorPagar = 0;
    const isMobile = window.innerWidth <= 768;
    
    if (facturasPorPagar.length > 0) {
        if (isMobile) {
            facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
                totalPorPagar += f.monto;
                const clickAction = f.documento_file ? `onclick="viewFacturaDoc('${f.documento_file}')"` : '';
                const cursorStyle = f.documento_file ? 'cursor:pointer;' : '';
                return `
                    <div class="factura-box" ${clickAction} style="border: 2px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: white; ${cursorStyle}">
                        <div style="margin-bottom: 0.5rem;">
                            <strong>Factura ${f.numero || 'S/N'}</strong> del <strong>${formatDate(f.fecha)}</strong>
                        </div>
                        <div style="margin-bottom: 0.5rem;">
                            Vence: <strong>${formatDate(f.vencimiento)}</strong>
                        </div>
                        <div style="text-align:right; font-size: 1.1rem; color: var(--primary);">
                            <strong>${formatCurrency(f.monto)}</strong>
                        </div>
                        <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;" onclick="event.stopPropagation()">
                            <button class="btn btn-sm btn-primary" onclick="showPagarFacturaModal(${f.id})">Dar X Pagada</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteFactura(${f.id})">Eliminar</button>
                        </div>
                    </div>
                `;
            }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem">TOTAL: <strong>${formatCurrency(totalPorPagar)}</strong></div>`;
        } else {
            facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
                totalPorPagar += f.monto;
                const verLink = f.documento_file 
                    ? `<button class="btn btn-sm btn-secondary" onclick="viewFacturaDoc('${f.documento_file}')">Ver</button>` 
                    : '';
                return `
                    <div class="payment-item">
                        <div class="payment-item-content">
                            <div><strong>Factura ${f.numero || 'S/N'}</strong> del <strong>${formatDate(f.fecha)}</strong></div>
                            <div>Vence: ${formatDateVencimiento(f.vencimiento)}</div>
                            <div style="margin-top:0.5rem"><strong>${formatCurrency(f.monto)}</strong></div>
                        </div>
                        <div class="payment-item-actions">
                            ${verLink}
                            <button class="btn btn-sm btn-primary" onclick="showPagarFacturaModal(${f.id})">Dar X Pagada</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteFactura(${f.id})">Eliminar</button>
                        </div>
                    </div>
                `;
            }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem">TOTAL: <strong>${formatCurrency(totalPorPagar)}</strong></div>`;
        }
    } else {
        facturasPorPagarDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas por pagar</p>';
    }
    
    // ── Pestaña: Documentos Adicionales ──
    const docsDiv = document.getElementById('proveedorDocumentosAdicionales');
    if (prov.documentos && prov.documentos.length > 0) {
        docsDiv.innerHTML = '<table style="width:100%;table-layout:fixed"><thead><tr><th style="width:50%">Nombre</th><th style="width:25%">Fecha</th><th style="width:25%">Usuario</th></tr></thead><tbody>' +
            prov.documentos.map(d => `
                <tr class="doc-item" onclick="viewDocumento('${d.archivo}')">
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

console.log('✅ PROVEEDORES-UI.JS cargado');

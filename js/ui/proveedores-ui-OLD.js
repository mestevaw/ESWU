/* ========================================
   PROVEEDORES-UI.JS - VERSIÓN CORREGIDA
   Todas las funciones de proveedores
   ======================================== */

// ============================================
// FUNCIONES AUXILIARES LOCALES
// ============================================

function ensureCloseModal() {
    if (typeof closeModal === 'undefined') {
        window.closeModal = function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.remove('active');
        };
    }
}

function ensureShowLoading() {
    if (typeof showLoading === 'undefined') {
        window.showLoading = function() {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) overlay.classList.remove('hidden');
        };
    }
    if (typeof hideLoading === 'undefined') {
        window.hideLoading = function() {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) overlay.classList.add('hidden');
        };
    }
}

function ensureLoadingBanner() {
    if (typeof showLoadingBanner === 'undefined') {
        window.showLoadingBanner = function(text) {
            const banner = document.getElementById('loadingBanner');
            if (banner) {
                const textEl = banner.querySelector('.loading-text');
                if (textEl && text) textEl.textContent = text;
                banner.classList.remove('hidden');
            }
        };
    }
    if (typeof hideLoadingBanner === 'undefined') {
        window.hideLoadingBanner = function() {
            const banner = document.getElementById('loadingBanner');
            if (banner) banner.classList.add('hidden');
        };
    }
}

// Ejecutar al cargar
ensureCloseModal();
ensureShowLoading();
ensureLoadingBanner();

// ============================================
// NAVIGATION - PROVEEDORES VIEWS
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
// RENDER PROVEEDORES TABLE
// ============================================

function renderProveedoresTable() {
    const tbody = document.getElementById('proveedoresTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    proveedores.forEach(prov => {
        const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
        
        tbody.innerHTML += `
            <tr style="cursor: pointer;" onclick="showProveedorDetail(${prov.id})">
                <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${prov.nombre}</td>
                <td>${prov.servicio}</td>
                <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${primerContacto.nombre || '-'}</td>
                <td>${primerContacto.telefono || '-'}</td>
                <td>${primerContacto.email || '-'}</td>
            </tr>
        `;
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
        row.style.cursor = 'pointer';
        row.onclick = () => showProveedorDetail(prov.id);
        const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
        row.innerHTML = `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${prov.nombre}</td><td>${prov.servicio}</td><td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${primerContacto.nombre || '-'}</td><td>${primerContacto.telefono || '-'}</td><td>${primerContacto.email || '-'}</td>`;
    });
    
    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron proveedores</td></tr>';
    }
}

// ============================================
// RENDER FACTURAS PAGADAS
// ============================================

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
        const facturaCell = f.documento_file 
            ? `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;cursor:pointer;color:var(--primary)" onclick="viewFacturaDoc('${f.documento_file}')">${f.numero}</td>`
            : `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${f.numero}</td>`;
        const fechaCell = f.pago_file
            ? `<td style="cursor:pointer;color:var(--primary)" onclick="viewFacturaDoc('${f.pago_file}')">${formatDate(f.fecha)}</td>`
            : `<td>${formatDate(f.fecha)}</td>`;
        row.innerHTML = `<td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${f.proveedor}</td>${facturaCell}<td class="currency">${formatCurrency(f.monto)}</td>${fechaCell}`;
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
// RENDER FACTURAS POR PAGAR
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
                            clabe: prov.clabe,
                            numero: f.numero || 'S/N',
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
        row.style.cursor = 'pointer';
        if (f.documento_file) {
            row.onclick = () => viewFacturaDoc(f.documento_file);
        }
        
        const clabeAttr = f.clabe ? `data-clabe="CLABE: ${f.clabe}"` : '';
        const clabeClass = f.clabe ? 'proveedor-clabe-hover' : '';
        
        row.innerHTML = `
            <td class="${clabeClass}" ${clabeAttr} style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${f.proveedor}</td>
            <td>${f.numero}</td>
            <td class="currency">${formatCurrency(f.monto)}</td>
            <td>${formatDateVencimiento(f.vencimiento)}</td>
        `;
    });
    
    if (porPagar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light)">No hay facturas por pagar</td></tr>';
    } else {
        const row = tbody.insertRow();
        row.className = 'total-row';
        row.innerHTML = `<td colspan="2" style="text-align:right;padding:1rem"><strong>TOTAL:</strong></td><td class="currency"><strong>${formatCurrency(totalPorPagar)}</strong></td><td></td>`;
    }
}

// ============================================
// SHOW PROVEEDOR DETAIL
// ============================================

function showProveedorDetail(id) {
    const prov = proveedores.find(p => p.id === id);
    if (!prov) {
        alert('ERROR: Proveedor no encontrado');
        return;
    }
    
    currentProveedorId = id;
    
    // HEADER
    const nombreEl = document.getElementById('proveedorDetailNombre');
    const servicioEl = document.getElementById('proveedorDetailServicio');
    if (nombreEl) nombreEl.textContent = prov.nombre;
    if (servicioEl) servicioEl.textContent = prov.servicio || '';
    
    // TELÉFONO Y EMAIL
    const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
    const telefonoEl = document.getElementById('proveedorTelefono');
    if (telefonoEl) telefonoEl.textContent = primerContacto.telefono || '-';
    
    const emailLink = document.getElementById('proveedorEmailLink');
    const emailSpan = document.getElementById('proveedorEmail');
    if (emailLink && emailSpan) {
        if (primerContacto.email) {
            emailLink.href = `mailto:${primerContacto.email}`;
            emailSpan.textContent = primerContacto.email;
        } else {
            emailLink.href = '#';
            emailSpan.textContent = '-';
        }
    }
    
    // RFC Y CLABE
    const rfcEl = document.getElementById('detailProvRFC');
    const clabeEl = document.getElementById('detailProvClabe');
    if (rfcEl) rfcEl.textContent = prov.rfc || '-';
    if (clabeEl) clabeEl.textContent = prov.clabe || '-';
    
    // CONTACTOS ADICIONALES
    const contactosSection = document.getElementById('proveedorContactosSection');
    if (contactosSection) {
        if (prov.contactos && prov.contactos.length > 1) {
            const contactosAdicionales = prov.contactos.slice(1);
            contactosSection.innerHTML = `
                <div style="background:var(--bg);padding:1rem;border-radius:4px;border:1px solid var(--border);margin-bottom:1.5rem;">
                    <div style="font-weight:600;color:var(--primary);margin-bottom:0.75rem;font-size:0.9rem;">Contactos Adicionales</div>
                    ${contactosAdicionales.map(c => `
                        <div style="padding:0.75rem;background:white;border-radius:4px;margin-bottom:0.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                            <div style="font-weight:600;margin-bottom:0.25rem;">${c.nombre}</div>
                            <div style="font-size:0.875rem;color:var(--text-light);">
                                📞 ${c.telefono || '-'} | ✉️ ${c.email || '-'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            contactosSection.innerHTML = '';
        }
    }
    
    // FACTURAS PAGADAS
    const facturasPagadasDiv = document.getElementById('facturasPagadas');
    if (facturasPagadasDiv) {
        const facturasPagadas = prov.facturas ? prov.facturas.filter(f => f.fecha_pago) : [];
        let totalPagadas = 0;
        
        if (facturasPagadas.length > 0) {
            facturasPagadasDiv.innerHTML = facturasPagadas.map(f => {
                totalPagadas += f.monto;
                const tieneFactura = !!f.documento_file;
                const tienePago = !!f.pago_file;
                
                return `
                    <div style="background:white;border:1px solid var(--border);border-radius:4px;padding:1rem;margin-bottom:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);display:flex;justify-content:space-between;align-items:center;">
                        <div style="display:flex;gap:1rem;align-items:center;flex:1;">
                            ${tieneFactura ? `
                                <div onclick="viewDocumento('${f.documento_file}')" style="cursor:pointer;background:var(--bg);padding:0.5rem 1rem;border-radius:4px;border:1px solid var(--border);transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.1);" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
                                    <div style="font-size:0.875rem;font-weight:600;">Factura ${f.numero || 'S/N'} del ${formatDate(f.fecha)}</div>
                                </div>
                            ` : `
                                <div style="background:var(--bg);padding:0.5rem 1rem;border-radius:4px;border:1px solid var(--border);opacity:0.6;">
                                    <div style="font-size:0.875rem;font-weight:600;">Factura ${f.numero || 'S/N'} del ${formatDate(f.fecha)}</div>
                                </div>
                            `}
                            ${tienePago ? `
                                <div onclick="viewDocumento('${f.pago_file}')" style="cursor:pointer;background:var(--bg);padding:0.5rem 1rem;border-radius:4px;border:1px solid var(--border);transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.1);" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
                                    <div style="font-size:0.875rem;font-weight:600;">Pago del ${formatDate(f.fecha_pago)}</div>
                                </div>
                            ` : `
                                <div style="background:var(--bg);padding:0.5rem 1rem;border-radius:4px;border:1px solid var(--border);opacity:0.6;">
                                    <div style="font-size:0.875rem;font-weight:600;">Pago del ${formatDate(f.fecha_pago)}</div>
                                </div>
                            `}
                        </div>
                        <div style="font-size:1.1rem;font-weight:700;color:var(--success);margin-left:1rem;">${formatCurrency(f.monto)}</div>
                    </div>
                `;
            }).join('') + `
                <div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;border-top:2px solid var(--primary);">
                    TOTAL PAGADO: <span style="color:var(--success);font-size:1.2rem;">${formatCurrency(totalPagadas)}</span>
                </div>
            `;
        } else {
            facturasPagadasDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas pagadas</p>';
        }
    }
    
    // FACTURAS X PAGAR
    const facturasPorPagarDiv = document.getElementById('facturasPorPagar');
    if (facturasPorPagarDiv) {
        const facturasPorPagar = prov.facturas ? prov.facturas.filter(f => !f.fecha_pago) : [];
        let totalPorPagar = 0;
        
        if (facturasPorPagar.length > 0) {
            facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
                totalPorPagar += f.monto;
                
                const facturaTexto = f.documento_file 
                    ? `<span onclick="viewDocumento('${f.documento_file}')" style="cursor:pointer;color:var(--primary);text-decoration:underline;">Factura ${f.numero || 'S/N'} del ${formatDate(f.fecha)}</span>`
                    : `<span>Factura ${f.numero || 'S/N'} del ${formatDate(f.fecha)}</span>`;
                
                return `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border);background:white;">
                        <div style="flex:1;">
                            ${facturaTexto} - <strong>Vence:</strong> ${formatDate(f.vencimiento)}
                        </div>
                        <div style="display:flex;align-items:center;gap:1rem;">
                            <button 
                                class="btn-icon-action" 
                                onclick="event.stopPropagation(); showEditFacturaModal(${f.id})" 
                                title="Modificar datos factura"
                                style="font-size:1.25rem;cursor:pointer;border:none;background:transparent;color:var(--primary);padding:0.25rem;transition:transform 0.2s;">
                                ✏️
                            </button>
                            <button 
                                class="btn-icon-action" 
                                onclick="event.stopPropagation(); showPagarFacturaModal(${f.id})" 
                                title="Dar por pagada"
                                style="font-size:1.25rem;cursor:pointer;border:none;background:transparent;color:var(--success);padding:0.25rem;transition:transform 0.2s;">
                                🏦
                            </button>
                            <button 
                                class="btn-icon-action" 
                                onclick="event.stopPropagation(); confirmDeleteFactura(${f.id}, '${(f.numero || 'S/N').replace(/'/g, "\\'")}', ${f.monto})" 
                                title="Eliminar factura"
                                style="font-size:1.25rem;cursor:pointer;border:none;background:transparent;color:var(--danger);padding:0.25rem;transition:transform 0.2s;">
                                ❌
                            </button>
                            <div style="font-size:1.1rem;font-weight:700;color:var(--danger);margin-left:1rem;min-width:100px;text-align:right;">
                                ${formatCurrency(f.monto)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('') + `
                <div style="text-align:right;padding:1rem;background:#fff3cd;font-weight:bold;border-top:2px solid var(--warning);">
                    TOTAL POR PAGAR: <span style="color:var(--danger);font-size:1.2rem;">${formatCurrency(totalPorPagar)}</span>
                </div>
            `;
        } else {
            facturasPorPagarDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas por pagar</p>';
        }
    }
    
    // DOCUMENTOS
    const docsDiv = document.getElementById('proveedorDocumentosAdicionales');
    if (docsDiv) {
        if (prov.documentos && prov.documentos.length > 0) {
            docsDiv.innerHTML = `
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:var(--bg);border-bottom:2px solid var(--border);">
                            <th style="padding:0.75rem;text-align:left;">Nombre</th>
                            <th style="padding:0.75rem;text-align:left;">Fecha</th>
                            <th style="padding:0.75rem;text-align:left;">Usuario</th>
                            <th style="padding:0.75rem;text-align:center;width:50px;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${prov.documentos.map(d => `
                            <tr style="border-bottom:1px solid var(--border);transition:background 0.2s;" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='white'">
                                <td onclick="viewDocumento('${d.archivo}')" style="padding:0.75rem;cursor:pointer;">${d.nombre || 'Sin nombre'}</td>
                                <td onclick="viewDocumento('${d.archivo}')" style="padding:0.75rem;cursor:pointer;">${d.fecha ? formatDate(d.fecha) : '-'}</td>
                                <td onclick="viewDocumento('${d.archivo}')" style="padding:0.75rem;cursor:pointer;">${d.usuario || 'Sistema'}</td>
                                <td style="padding:0.75rem;text-align:center;">
                                    <button 
                                        onclick="event.stopPropagation(); confirmDeleteDocumentoProveedor(${d.id}, '${(d.nombre || 'este documento').replace(/'/g, "\\'")}')" 
                                        style="background:transparent;border:none;color:var(--danger);font-size:1.25rem;cursor:pointer;padding:0.25rem;"
                                        title="Eliminar documento">
                                        ❌
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay documentos adicionales</p>';
        }
    }
    
    // NOTAS
    const notasEl = document.getElementById('notasProveedor');
    if (notasEl) notasEl.textContent = prov.notas || 'No hay notas para este proveedor.';
    
    // Abrir modal
    const modal = document.getElementById('proveedorDetailModal');
    if (modal) modal.classList.add('active');
    
    // Activar primera pestaña
    if (typeof switchTab === 'function') {
        switchTab('proveedor', 'pagadas');
    }
}

// ============================================
// MODALS & ACTIONS
// ============================================

function showRegistrarFacturaModalFromDetail() {
    // Resetear formulario
    const form = document.getElementById('facturaForm');
    if (form) form.reset();
    
    isEditMode = false;
    currentFacturaId = null;
    
    const fileNameEl = document.getElementById('facturaDocumentoFileName');
    if (fileNameEl) fileNameEl.textContent = '';
    
    const modal = document.getElementById('registrarFacturaModal');
    if (modal) modal.classList.add('active');
}

function showAgregarDocumentoProveedorModal() {
    const form = document.getElementById('documentoProveedorForm');
    if (form) form.reset();
    
    const fileNameEl = document.getElementById('nuevoDocProveedorPDFFileName');
    if (fileNameEl) fileNameEl.textContent = '';
    
    const modal = document.getElementById('agregarDocumentoProveedorModal');
    if (modal) modal.classList.add('active');
}

function showEditarNotasProveedorModal() {
    const prov = proveedores.find(p => p.id === currentProveedorId);
    if (!prov) return;
    
    const notasEl = document.getElementById('editNotasProveedor');
    if (notasEl) notasEl.value = prov.notas || '';
    
    const modal = document.getElementById('editarNotasProveedorModal');
    if (modal) modal.classList.add('active');
}

function showEditFacturaModal(facturaId) {
    const prov = proveedores.find(p => p.id === currentProveedorId);
    if (!prov) return;
    
    const factura = prov.facturas.find(f => f.id === facturaId);
    if (!factura) return;
    
    currentFacturaId = facturaId;
    isEditMode = true;
    
    const numeroEl = document.getElementById('facturaNumero');
    const fechaEl = document.getElementById('facturaFecha');
    const vencEl = document.getElementById('facturaVencimiento');
    const montoEl = document.getElementById('facturaMonto');
    const ivaEl = document.getElementById('facturaIVA');
    const fileNameEl = document.getElementById('facturaDocumentoFileName');
    
    if (numeroEl) numeroEl.value = factura.numero || '';
    if (fechaEl) fechaEl.value = factura.fecha;
    if (vencEl) vencEl.value = factura.vencimiento;
    if (montoEl) montoEl.value = factura.monto;
    if (ivaEl) ivaEl.value = factura.iva || 0;
    if (fileNameEl) fileNameEl.textContent = factura.documento_file ? 'Archivo existente' : '';
    
    const modal = document.getElementById('registrarFacturaModal');
    if (modal) modal.classList.add('active');
}

function showPagarFacturaModal(facturaId) {
    currentFacturaId = facturaId;
    
    const form = document.getElementById('pagarFacturaForm');
    if (form) form.reset();
    
    const fileName = document.getElementById('pagoPDFFacturaFileName');
    if (fileName) fileName.textContent = '';
    
    const modal = document.getElementById('pagarFacturaModal');
    if (modal) modal.classList.add('active');
}

function confirmDeleteFactura(facturaId, numeroFactura, monto) {
    if (confirm(`¿Seguro quieres eliminar la factura ${numeroFactura} por ${formatCurrency(monto)}?`)) {
        deleteFactura(facturaId);
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
        
        alert('✅ Factura eliminada exitosamente');
        
        if (typeof ensureProveedoresFullLoaded === 'function') {
            await ensureProveedoresFullLoaded();
        } else {
            await loadProveedores();
        }
        
        showProveedorDetail(currentProveedorId);
        
    } catch (error) {
        console.error('Error eliminando factura:', error);
        alert('❌ Error al eliminar factura: ' + error.message);
    } finally {
        hideLoading();
    }
}

function confirmDeleteDocumentoProveedor(docId, nombreDoc) {
    if (confirm(`¿Seguro quieres eliminar el documento "${nombreDoc}"?`)) {
        deleteDocumentoProveedor(docId);
    }
}

async function deleteDocumentoProveedor(docId) {
    showLoading();
    try {
        const { error } = await supabaseClient
            .from('proveedores_documentos')
            .delete()
            .eq('id', docId);
        
        if (error) throw error;
        
        alert('✅ Documento eliminado exitosamente');
        
        if (typeof ensureProveedoresFullLoaded === 'function') {
            await ensureProveedoresFullLoaded();
        } else {
            await loadProveedores();
        }
        
        showProveedorDetail(currentProveedorId);
        
    } catch (error) {
        console.error('Error eliminando documento:', error);
        alert('❌ Error al eliminar documento: ' + error.message);
    } finally {
        hideLoading();
    }
}

function showAddProveedorModal() {
    isEditMode = false;
    currentProveedorId = null;
    tempProveedorContactos = [];
    
    const titleEl = document.getElementById('addProveedorTitle');
    if (titleEl) titleEl.textContent = 'Agregar Proveedor';
    
    const form = document.getElementById('proveedorForm');
    if (form) form.reset();
    
    const listaEl = document.getElementById('proveedorContactosList');
    if (listaEl) listaEl.innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
    
    const fileNameEl = document.getElementById('provDocAdicionalFileName');
    if (fileNameEl) fileNameEl.textContent = '';
    
    const docGroupEl = document.getElementById('nombreProvDocGroup');
    if (docGroupEl) docGroupEl.classList.add('hidden');
    
    const modal = document.getElementById('addProveedorModal');
    if (modal) modal.classList.add('active');
}

function editProveedor() {
    const prov = proveedores.find(p => p.id === currentProveedorId);
    if (!prov) {
        alert('Error: Proveedor no encontrado');
        return;
    }
    
    isEditMode = true;
    tempProveedorContactos = [...(prov.contactos || [])];
    
    const titleEl = document.getElementById('addProveedorTitle');
    if (titleEl) titleEl.textContent = 'Editar Proveedor';
    
    const nombreEl = document.getElementById('proveedorNombre');
    if (nombreEl) nombreEl.value = prov.nombre;
    
    const servicioEl = document.getElementById('proveedorServicio');
    if (servicioEl) servicioEl.value = prov.servicio;
    
    const clabeEl = document.getElementById('proveedorClabe');
    if (clabeEl) clabeEl.value = prov.clabe || '';
    
    const rfcEl = document.getElementById('proveedorRFC');
    if (rfcEl) rfcEl.value = prov.rfc || '';
    
    const notasEl = document.getElementById('proveedorNotas');
    if (notasEl) notasEl.value = prov.notas || '';
    
    if (typeof renderContactosList === 'function') {
        renderContactosList(tempProveedorContactos, 'proveedorContactosList', 'deleteProveedorContacto', 'showEditContactoProveedorModal');
    }
    
    closeModal('proveedorDetailModal');
    
    const modal = document.getElementById('addProveedorModal');
    if (modal) modal.classList.add('active');
}

function deleteProveedor() {
    if (!confirm('¿Eliminar este proveedor? Esta acción no se puede deshacer.')) return;
    
    showLoading();
    
    supabaseClient
        .from('proveedores')
        .delete()
        .eq('id', currentProveedorId)
        .then(({ error }) => {
            if (error) throw error;
            
            if (typeof ensureProveedoresFullLoaded === 'function') {
                return ensureProveedoresFullLoaded();
            } else {
                return loadProveedores();
            }
        })
        .then(() => {
            closeModal('proveedorDetailModal');
            if (currentSubContext === 'proveedores-list') {
                renderProveedoresTable();
            }
            alert('Proveedor eliminado exitosamente');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar proveedor: ' + error.message);
        })
        .finally(() => {
            hideLoading();
        });
}

// ============================================
// LAZY LOADING - SOLO 1 VEZ
// ============================================

let proveedoresYaCargados = false;

async function cargarProveedoresSiNecesario() {
    if (!proveedoresYaCargados) {
        showLoadingBanner('Cargando proveedores...');
        if (typeof ensureProveedoresFullLoaded === 'function') {
            await ensureProveedoresFullLoaded();
        }
        proveedoresYaCargados = true;
        hideLoadingBanner();
    }
}

// Interceptar showProveedoresView para agregar lazy loading
const originalShowProveedoresView = showProveedoresView;
window.showProveedoresView = async function(view) {
    await cargarProveedoresSiNecesario();
    originalShowProveedoresView(view);
};

console.log('✅ PROVEEDORES-UI.JS cargado y listo');

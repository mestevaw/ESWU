/* ========================================
   PROVEEDORES-UI.JS - Proveedores Interface
   ======================================== */

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
    document.getElementById('proveedorDetailNombre').textContent = prov.nombre;
    document.getElementById('proveedorDetailServicio').textContent = prov.servicio || '';
    
    // TELÉFONO Y EMAIL (primer contacto)
    const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
    document.getElementById('proveedorTelefono').textContent = primerContacto.telefono || '-';
    
    const emailLink = document.getElementById('proveedorEmailLink');
    const emailSpan = document.getElementById('proveedorEmail');
    if (primerContacto.email) {
        emailSpan.textContent = primerContacto.email;
        emailLink.href = `mailto:${primerContacto.email}`;
    } else {
        emailSpan.textContent = '-';
        emailLink.href = '#';
        emailLink.onclick = (e) => e.preventDefault();
    }
    
    // RFC Y CLABE
    document.getElementById('detailProvRFC').textContent = prov.rfc || '-';
    document.getElementById('detailProvClabe').textContent = prov.clabe || '-';
    
    // CONTACTOS ADICIONALES (solo si hay más de 1)
    const contactosSection = document.getElementById('proveedorContactosSection');
    if (prov.contactos && prov.contactos.length > 1) {
        const contactosAdicionales = prov.contactos.slice(1);
        contactosSection.innerHTML = `
            <div style="background:var(--bg);padding:1rem;border-radius:4px;border:1px solid var(--border);margin-bottom:1.5rem;">
                <div style="font-weight:600;color:var(--primary);margin-bottom:0.75rem;font-size:0.9rem;">Contactos Adicionales</div>
                ${contactosAdicionales.map((c, index) => `
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
    
    // ✅ FACTURAS PAGADAS - LAYOUT SIMPLE CON RECUADROS CLICKEABLES
    const facturasPagadasDiv = document.getElementById('facturasPagadas');
    const facturasPagadas = prov.facturas ? prov.facturas.filter(f => f.fecha_pago) : [];
    let totalPagadas = 0;
    
    if (facturasPagadas.length > 0) {
        facturasPagadasDiv.innerHTML = facturasPagadas.map(f => {
            totalPagadas += f.monto;
            
            // Determinar si hay documentos
            const tieneFactura = f.documento_file;
            const tienePago = f.pago_file;
            
            return `
                <div style="background:white;border:1px solid var(--border);border-radius:4px;padding:1rem;margin-bottom:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);display:flex;justify-content:space-between;align-items:center;">
                    <div style="display:flex;gap:1rem;align-items:center;flex:1;">
                        ${tieneFactura ? `
                            <div onclick="viewDocumento('${f.documento_file}')" style="cursor:pointer;background:var(--bg);padding:0.5rem 1rem;border-radius:4px;border:1px solid var(--border);transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.1);" onmouseover="this.style.background='#e2e8f0';this.style.transform='translateY(-2px)';this.style.boxShadow='0 2px 4px rgba(0,0,0,0.15)'" onmouseout="this.style.background='var(--bg)';this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
                                <div style="font-size:0.875rem;font-weight:600;">Factura ${f.numero || 'S/N'} del ${formatDate(f.fecha)}</div>
                            </div>
                        ` : `
                            <div style="background:var(--bg);padding:0.5rem 1rem;border-radius:4px;border:1px solid var(--border);opacity:0.6;">
                                <div style="font-size:0.875rem;font-weight:600;">Factura ${f.numero || 'S/N'} del ${formatDate(f.fecha)}</div>
                            </div>
                        `}
                        
                        ${tienePago ? `
                            <div onclick="viewDocumento('${f.pago_file}')" style="cursor:pointer;background:var(--bg);padding:0.5rem 1rem;border-radius:4px;border:1px solid var(--border);transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.1);" onmouseover="this.style.background='#e2e8f0';this.style.transform='translateY(-2px)';this.style.boxShadow='0 2px 4px rgba(0,0,0,0.15)'" onmouseout="this.style.background='var(--bg)';this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
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
            <div style="text-align:right;padding:1rem;background:#e6f7ed;border-radius:4px;font-weight:bold;margin-top:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                TOTAL PAGADO: <span style="color:var(--success);font-size:1.2rem;">${formatCurrency(totalPagadas)}</span>
            </div>
        `;
    } else {
        facturasPagadasDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem;background:var(--bg);border-radius:4px;">No hay facturas pagadas</p>';
    }
    
    // ✅ FACTURAS POR PAGAR CON SOMBRAS
    const facturasPorPagarDiv = document.getElementById('facturasPorPagar');
    const facturasPorPagar = prov.facturas ? prov.facturas.filter(f => !f.fecha_pago) : [];
    let totalPorPagar = 0;
    
    if (facturasPorPagar.length > 0) {
        facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
            totalPorPagar += f.monto;
            const hoyMas7 = new Date();
            hoyMas7.setDate(hoyMas7.getDate() + 7);
            const vencimiento = new Date(f.vencimiento + 'T00:00:00');
            const esProximo = vencimiento <= hoyMas7;
            
            return `
                <div style="background:white;border:${esProximo ? '2px solid var(--danger)' : '1px solid var(--border)'};border-radius:4px;padding:1rem;margin-bottom:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                        <div style="font-weight:600;color:var(--primary);">Factura ${f.numero || 'S/N'}</div>
                        <div style="font-size:1.1rem;font-weight:700;color:var(--danger);">${formatCurrency(f.monto)}</div>
                    </div>
                    <div style="display:flex;gap:1rem;font-size:0.875rem;color:var(--text-light);margin-bottom:0.75rem;">
                        <span>📅 Fecha: ${formatDate(f.fecha)}</span>
                        <span style="color:${esProximo ? 'var(--danger)' : 'var(--text-light)'};font-weight:${esProximo ? 'bold' : 'normal'};">⏰ Vence: ${formatDate(f.vencimiento)}</span>
                    </div>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        ${f.documento_file ? `<button class="btn btn-sm btn-secondary" onclick="viewDocumento('${f.documento_file}')" style="box-shadow:0 1px 3px rgba(0,0,0,0.1);">Ver Factura</button>` : ''}
                        <button class="btn btn-sm btn-primary" onclick="showPagarFacturaModal(${f.id})" style="box-shadow:0 1px 3px rgba(0,0,0,0.1);">Dar X Pagada</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteFactura(${f.id})" style="box-shadow:0 1px 3px rgba(0,0,0,0.1);">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('') + `
            <div style="text-align:right;padding:1rem;background:#fff3cd;border-radius:4px;font-weight:bold;margin-top:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                TOTAL POR PAGAR: <span style="color:var(--danger);font-size:1.2rem;">${formatCurrency(totalPorPagar)}</span>
            </div>
        `;
    } else {
        facturasPorPagarDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem;background:var(--bg);border-radius:4px;">No hay facturas pendientes</p>';
    }
    
    // DOCUMENTOS ADICIONALES
const docsDiv = document.getElementById('proveedorDocumentosAdicionales');
if (prov.documentos && prov.documentos.length > 0) {
    docsDiv.innerHTML = `
        <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:var(--bg);">
                        <th style="padding:0.75rem;text-align:left;border-bottom:2px solid var(--border);">Nombre</th>
                        <th style="padding:0.75rem;text-align:left;border-bottom:2px solid var(--border);">Fecha</th>
                        <th style="padding:0.75rem;text-align:left;border-bottom:2px solid var(--border);">Usuario</th>
                    </tr>
                </thead>
                <tbody>
                    ${prov.documentos.map(d => `
                        <tr style="cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='white'" onclick="viewDocumento('${d.archivo}')">
                            <td style="padding:0.75rem;border-bottom:1px solid var(--border);">${d.nombre || 'Documento'}</td>
                            <td style="padding:0.75rem;border-bottom:1px solid var(--border);">${formatDate(d.fecha)}</td>
                            <td style="padding:0.75rem;border-bottom:1px solid var(--border);">${d.usuario || 'Sistema'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
} else {
    docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem;background:var(--bg);border-radius:4px;">No hay documentos adicionales</p>';
}
    
    // NOTAS
    document.getElementById('notasProveedor').textContent = prov.notas || 'No hay notas para este proveedor.';
    
    // Abrir modal y activar primera pestaña
    document.getElementById('proveedorDetailModal').classList.add('active');
    switchTab('proveedor', 'pagadas');
}
// ============================================
// MODALS
// ============================================

function showRegistrarFacturaModalFromDetail() {
    if (!currentProveedorId) {
        alert('Error: No hay proveedor seleccionado');
        return;
    }
    
    isEditMode = false;
    currentFacturaId = null;
    
    // ✅ AGREGAR MODAL SI NO EXISTE
    let modal = document.getElementById('registrarFacturaModal');
    if (!modal) {
        console.error('❌ Modal registrarFacturaModal no existe en el HTML');
        alert('Error: Modal de factura no encontrado. Por favor recarga la página.');
        return;
    }
    
    const facturaForm = document.getElementById('facturaForm');
    if (facturaForm) {
        facturaForm.reset();
    }
    
    const fileName = document.getElementById('facturaDocumentoFileName');
    if (fileName) {
        fileName.textContent = '';
    }
    
    modal.classList.add('active');
}

function showAgregarDocumentoProveedorModal() {
    document.getElementById('nuevoDocProveedorNombre').value = '';
    document.getElementById('nuevoDocProveedorPDF').value = '';
    document.getElementById('nuevoDocProveedorPDFFileName').textContent = '';
    document.getElementById('agregarDocumentoProveedorModal').classList.add('active');
}

function showEditarNotasProveedorModal() {
    const prov = proveedores.find(p => p.id === currentProveedorId);
    document.getElementById('editNotasProveedor').value = prov?.notas || '';
    document.getElementById('editarNotasProveedorModal').classList.add('active');
}

async function saveDocumentoProveedor(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const nombre = document.getElementById('nuevoDocProveedorNombre').value;
        const file = document.getElementById('nuevoDocProveedorPDF').files[0];
        
        if (!file) {
            throw new Error('Seleccione un archivo PDF');
        }
        
        const pdfBase64 = await fileToBase64(file);
        
        const { error } = await supabaseClient
            .from('proveedores_documentos')
            .insert([{
                proveedor_id: currentProveedorId,
                nombre_documento: nombre,
                archivo_pdf: pdfBase64,
                fecha_guardado: new Date().toISOString().split('T')[0],
                usuario_guardo: currentUser.nombre
            }]);
        
        if (error) throw error;
        
        await ensureProveedoresFullLoaded();
        showProveedorDetail(currentProveedorId);
        closeModal('agregarDocumentoProveedorModal');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar documento: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function saveNotasProveedor(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const notas = document.getElementById('editNotasProveedor').value;
        
        const { error } = await supabaseClient
            .from('proveedores')
            .update({ notas: notas })
            .eq('id', currentProveedorId);
        
        if (error) throw error;
        
        await ensureProveedoresFullLoaded();
        showProveedorDetail(currentProveedorId);
        closeModal('editarNotasProveedorModal');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar notas: ' + error.message);
    } finally {
        hideLoading();
    }
}

function showRegistrarFacturaModalGlobal() {
    const select = document.createElement('select');
    select.style.cssText = 'width: 100%; padding: 0.75rem; border: 2px solid var(--border); border-radius: 4px; font-size: 1rem; margin-bottom: 1rem;';
    select.innerHTML = '<option value="">-- Seleccione Proveedor --</option>' + 
        proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
    
    const modalContent = document.querySelector('#registrarFacturaModal .modal-content');
    const formContainer = modalContent.querySelector('form').parentElement;
    const existingSelect = formContainer.querySelector('select[data-proveedor-select]');
    if (existingSelect) existingSelect.remove();
    
    select.setAttribute('data-proveedor-select', 'true');
    select.onchange = () => { currentProveedorId = parseInt(select.value); };
    
    const firstFormGroup = formContainer.querySelector('.form-group');
    formContainer.insertBefore(select, firstFormGroup);
    
    isEditMode = false;
    currentFacturaId = null;
    currentProveedorId = null;
    
    document.getElementById('facturaForm').reset();
    document.getElementById('facturaDocumentoFileName').textContent = '';
    document.getElementById('registrarFacturaModal').classList.add('active');
}

function editFactura(facturaId) {
    let factura = null;
    let proveedorId = null;
    
    for (const prov of proveedores) {
        if (prov.facturas) {
            factura = prov.facturas.find(f => f.id === facturaId);
            if (factura) {
                proveedorId = prov.id;
                break;
            }
        }
    }
    
    if (!factura) {
        alert('Factura no encontrada');
        return;
    }
    
    isEditMode = true;
    currentFacturaId = facturaId;
    currentProveedorId = proveedorId;
    
    document.getElementById('facturaNumero').value = factura.numero || '';
    document.getElementById('facturaFecha').value = factura.fecha;
    document.getElementById('facturaVencimiento').value = factura.vencimiento;
    document.getElementById('facturaMonto').value = factura.monto;
    document.getElementById('facturaIVA').value = factura.iva || '';
    document.getElementById('facturaDocumentoFileName').textContent = factura.documento_file ? 'Archivo existente' : '';
    
    document.getElementById('registrarFacturaModal').classList.add('active');
}

function showAddProveedorModal() {
    isEditMode = false;
    currentProveedorId = null;
    tempProveedorContactos = [];
    
    document.getElementById('addProveedorTitle').textContent = 'Agregar Proveedor';
    document.getElementById('proveedorForm').reset();
    document.getElementById('proveedorContactosList').innerHTML = '<p style="color:var(--text-light);font-size:0.875rem">No hay contactos agregados</p>';
    document.getElementById('provDocAdicionalFileName').textContent = '';
    document.getElementById('nombreProvDocGroup').classList.add('hidden');
    
    document.getElementById('addProveedorModal').classList.add('active');
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

function deleteProveedor() {
    if (!confirm('¿Eliminar este proveedor? Esta acción no se puede deshacer.')) return;
    
    showLoading();
    
    supabaseClient
        .from('proveedores')
        .delete()
        .eq('id', currentProveedorId)
        .then(({ error }) => {
            if (error) throw error;
            
            return loadProveedores();
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
// FORCE LOAD ON VIEW
// ============================================

const originalShowProveedoresView = showProveedoresView;
showProveedoresView = async function(view) {
    showLoadingBanner('Cargando proveedores...');
    
    await ensureProveedoresFullLoaded();
    
    hideLoadingBanner();
    
    originalShowProveedoresView(view);
};

console.log('✅ PROVEEDORES-UI.JS cargado');

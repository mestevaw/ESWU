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
        alert('Proveedor no encontrado');
        return;
    }
    
    currentProveedorId = id;
    
    // ✅ NOMBRE + SERVICIO
    document.getElementById('proveedorDetailNombre').textContent = prov.nombre;
    document.getElementById('proveedorDetailServicio').textContent = prov.servicio;
    
    // ✅ TELÉFONO Y EMAIL (primer contacto)
    const primerContacto = prov.contactos && prov.contactos.length > 0 ? prov.contactos[0] : {};
    const telefono = primerContacto.telefono || 'Sin teléfono';
    const email = primerContacto.email || 'Sin email';
    
    document.getElementById('proveedorTelefono').textContent = telefono;
    document.getElementById('proveedorEmail').textContent = email;
    
    const emailLink = document.getElementById('proveedorEmailLink');
    if (email !== 'Sin email') {
        emailLink.href = `mailto:${email}`;
        emailLink.style.pointerEvents = 'auto';
    } else {
        emailLink.href = '#';
        emailLink.style.pointerEvents = 'none';
    }
    
    // ✅ RFC Y CLABE
    document.getElementById('detailProvRFC').textContent = prov.rfc || '-';
    document.getElementById('detailProvClabe').textContent = prov.clabe || '-';
    
    // ✅ CONTACTOS ADICIONALES (si hay más de 1)
    const contactosSection = document.getElementById('proveedorContactosSection');
    if (prov.contactos && prov.contactos.length > 1) {
        const contactosAdicionales = prov.contactos.slice(1); // Excluir el primero
        contactosSection.innerHTML = `
            <div style="background:var(--bg);padding:1rem;border-radius:4px;border:1px solid var(--border);margin-bottom:1.5rem;">
                <div style="font-weight:600;color:var(--primary);margin-bottom:0.75rem;font-size:0.875rem;text-transform:uppercase;">Contactos Adicionales</div>
                ${contactosAdicionales.map((c, index) => `
                    <div style="padding:0.75rem 0;${index < contactosAdicionales.length - 1 ? 'border-bottom:1px solid var(--border);' : ''}display:flex;justify-content:space-between;align-items:center;gap:1rem;">
                        <div style="flex:1;">
                            <strong>${c.nombre}</strong>
                            ${c.telefono ? `<span style="margin-left:1rem;color:var(--text-light);">📞 ${c.telefono}</span>` : ''}
                        </div>
                        ${c.email ? `<a href="mailto:${c.email}" style="color:var(--primary);text-decoration:none;white-space:nowrap;">✉️ ${c.email}</a>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        contactosSection.innerHTML = '';
    }
    
    // ✅ FACTURAS PAGADAS - TODO CON SOMBRA
    const facturasPagadasDiv = document.getElementById('facturasPagadas');
    const facturasPagadas = prov.facturas.filter(f => f.fecha_pago);
    let totalPagadas = 0;
    
    if (facturasPagadas.length > 0) {
        facturasPagadasDiv.innerHTML = facturasPagadas.map(f => {
            totalPagadas += f.monto;
            
            return `
                <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;padding:0.75rem 1rem;background:white;border-radius:4px;box-shadow:var(--shadow);align-items:center;justify-content:space-between;">
                    <div style="display:flex;gap:1.5rem;flex:1;align-items:center;">
                        ${f.documento_file 
                            ? `<a href="#" onclick="event.preventDefault(); viewFacturaDoc('${f.documento_file}')" style="color:var(--primary);text-decoration:underline;white-space:nowrap;">📄 Factura ${f.numero || 'S/N'} del ${formatDate(f.fecha)}</a>`
                            : `<span style="color:var(--text-light);white-space:nowrap;">📄 Factura ${f.numero || 'S/N'} del ${formatDate(f.fecha)}</span>`
                        }
                        ${f.pago_file 
                            ? `<a href="#" onclick="event.preventDefault(); viewFacturaDoc('${f.pago_file}')" style="color:var(--primary);text-decoration:underline;white-space:nowrap;">💰 Pago del ${formatDate(f.fecha_pago)}</a>`
                            : `<span style="color:var(--text-light);white-space:nowrap;">💰 Pago del ${formatDate(f.fecha_pago)}</span>`
                        }
                    </div>
                    <div style="font-weight:bold;min-width:120px;text-align:right;">
                        ${formatCurrency(f.monto)}
                    </div>
                </div>
            `;
        }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem;border-radius:4px;">TOTAL: <strong>${formatCurrency(totalPagadas)}</strong></div>`;
    } else {
        facturasPagadasDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas pagadas</p>';
    }
    
    // ✅ FACTURAS POR PAGAR - BOTONES CON SOMBRA
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
                    <div class="factura-box" ${clickAction} style="border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:1rem;background:white;box-shadow:var(--shadow);${cursorStyle}">
                        <div style="margin-bottom:0.5rem;">
                            <strong>Factura ${f.numero || 'S/N'}</strong> del <strong>${formatDate(f.fecha)}</strong>
                        </div>
                        <div style="margin-bottom:0.5rem;">
                            Vence: <strong>${formatDate(f.vencimiento)}</strong>
                        </div>
                        <div style="margin-bottom:0.5rem;">
                            <strong>Monto:</strong> ${formatCurrency(f.monto)}
                            ${f.iva ? `<br><strong>IVA:</strong> ${formatCurrency(f.iva)}` : ''}
                        </div>
                        <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;" onclick="event.stopPropagation()">
                            <button class="btn btn-sm btn-secondary" style="box-shadow:var(--shadow);" onclick="editFactura(${f.id})">✏️</button>
                            <button class="btn btn-sm btn-primary" style="box-shadow:var(--shadow);" onclick="showPagarFacturaModal(${f.id})">Dar X Pagada</button>
                            <button class="btn btn-sm btn-danger" style="box-shadow:var(--shadow);" onclick="deleteFactura(${f.id})">Eliminar</button>
                        </div>
                    </div>
                `;
            }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem;border-radius:4px;">TOTAL: <strong>${formatCurrency(totalPorPagar)}</strong></div>`;
        } else {
            facturasPorPagarDiv.innerHTML = facturasPorPagar.map(f => {
                totalPorPagar += f.monto;
                return `
                    <div style="padding:1rem;background:white;border-radius:4px;box-shadow:var(--shadow);margin-bottom:0.75rem;display:flex;justify-content:space-between;align-items:center;gap:1rem;">
                        <div style="flex:1;">
                            <div><strong>Factura ${f.numero || 'S/N'}</strong> del <strong>${formatDate(f.fecha)}</strong></div>
                            <div>Vence: ${formatDateVencimiento(f.vencimiento)}</div>
                            <div style="margin-top:0.5rem;">
                                <strong>Monto:</strong> ${formatCurrency(f.monto)}
                                ${f.iva ? ` | <strong>IVA:</strong> ${formatCurrency(f.iva)}` : ''}
                            </div>
                        </div>
                        <div style="display:flex;gap:0.5rem;align-items:center;">
                            ${f.documento_file ? `<button class="btn btn-sm btn-secondary" style="box-shadow:var(--shadow);" onclick="viewFacturaDoc('${f.documento_file}')">Ver</button>` : ''}
                            <button class="btn btn-sm btn-secondary" style="box-shadow:var(--shadow);" onclick="editFactura(${f.id})">✏️</button>
                            <button class="btn btn-sm btn-primary" style="box-shadow:var(--shadow);" onclick="showPagarFacturaModal(${f.id})">Dar X Pagada</button>
                            <button class="btn btn-sm btn-danger" style="box-shadow:var(--shadow);" onclick="deleteFactura(${f.id})">Eliminar</button>
                        </div>
                    </div>
                `;
            }).join('') + `<div style="text-align:right;padding:1rem;background:#e6f2ff;font-weight:bold;margin-top:1rem;border-radius:4px;">TOTAL: <strong>${formatCurrency(totalPorPagar)}</strong></div>`;
        }
    } else {
        facturasPorPagarDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay facturas por pagar</p>';
    }
    
    // ✅ DOCUMENTOS ADICIONALES
    const docsDiv = document.getElementById('proveedorDocumentosAdicionales');
    if (prov.documentos && prov.documentos.length > 0) {
        docsDiv.innerHTML = '<table style="width:100%;table-layout:fixed"><thead><tr><th style="width:50%">Nombre</th><th style="width:25%">Fecha</th><th style="width:25%">Usuario</th></tr></thead><tbody>' +
            prov.documentos.map(d => `
                <tr class="doc-item" style="cursor:pointer;" onclick="viewDocumento('${d.archivo}')">
                    <td style="word-wrap:break-word">${d.nombre}</td>
                    <td>${formatDate(d.fecha)}</td>
                    <td>${d.usuario}</td>
                </tr>
            `).join('') + '</tbody></table>';
    } else {
        docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay documentos adicionales</p>';
    }
    
    // ✅ NOTAS
    document.getElementById('notasProveedor').textContent = prov.notas || 'No hay notas para este proveedor.';
    
    document.getElementById('proveedorDetailModal').classList.add('active');
    switchTab('proveedor', 'pagadas');
}
// ============================================
// MODALS
// ============================================

function showRegistrarFacturaModalFromDetail() {
    isEditMode = false;
    currentFacturaId = null;
    
    document.getElementById('facturaForm').reset();
    document.getElementById('facturaDocumentoFileName').textContent = '';
    document.getElementById('registrarFacturaModal').classList.add('active');
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

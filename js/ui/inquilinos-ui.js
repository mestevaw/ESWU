/* ========================================
   INQUILINOS-UI.JS - Inquilinos Interface Functions
   ======================================== */

// ============================================
// INQUILINOS - VIEWS
// ============================================

// Estado de ordenamiento
let inquilinosSortColumn = null;
let inquilinosSortOrder = 'asc';

function showInquilinosView(view) {
    document.getElementById('inquilinosSubMenu').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('inquilinosPage').classList.add('active');
    
    document.getElementById('inquilinosListView').classList.add('hidden');
    document.getElementById('inquilinosRentasRecibidasView').classList.add('hidden');
    document.getElementById('inquilinosVencimientoContratosView').classList.add('hidden');
    
    currentSubContext = 'inquilinos-' + view;
    
    document.getElementById('btnRegresa').classList.remove('hidden');
    
    if (view === 'list') {
        document.getElementById('btnSearch').classList.remove('hidden');
        currentSearchContext = 'inquilinos';
    } else {
        document.getElementById('btnSearch').classList.add('hidden');
        currentSearchContext = null;
    }
    
    document.getElementById('contentArea').classList.remove('with-submenu');
    document.getElementById('menuSidebar').classList.add('hidden');
    document.getElementById('contentArea').classList.add('fullwidth');
    
    if (view === 'list') {
        document.getElementById('inquilinosListView').classList.remove('hidden');
        ensureInquilinosFullLoaded().then(() => renderInquilinosTable());
    } else if (view === 'rentasRecibidas') {
        document.getElementById('inquilinosRentasRecibidasView').classList.remove('hidden');
        ensureInquilinosFullLoaded().then(() => renderInquilinosRentasRecibidas());
    } else if (view === 'vencimientoContratos') {
        document.getElementById('inquilinosVencimientoContratosView').classList.remove('hidden');
        ensureInquilinosFullLoaded().then(() => renderInquilinosVencimientoContratos());
    }
}

// ============================================
// RENDER INQUILINOS TABLE
// ============================================

function renderInquilinosTable() {
    const tbody = document.getElementById('inquilinosTable').querySelector('tbody');
    const thead = document.getElementById('inquilinosTable').querySelector('thead tr');
    
    // Actualizar headers con indicadores de ordenamiento
    thead.innerHTML = `
        <th style="cursor:pointer" onclick="sortInquilinos('nombre')">Empresa ${inquilinosSortColumn === 'nombre' ? (inquilinosSortOrder === 'asc' ? '↑' : '↓') : '↕'}</th>
        <th style="cursor:pointer" onclick="sortInquilinos('renta')">Renta Mensual ${inquilinosSortColumn === 'renta' ? (inquilinosSortOrder === 'asc' ? '↑' : '↓') : '↕'}</th>
        <th style="cursor:pointer" onclick="sortInquilinos('vencimiento')">Vencimiento Contrato ${inquilinosSortColumn === 'vencimiento' ? (inquilinosSortOrder === 'asc' ? '↑' : '↓') : '↕'}</th>
    `;
    
    // Ordenar inquilinos si hay columna seleccionada
    let sortedInquilinos = [...inquilinos];
    if (inquilinosSortColumn) {
        sortedInquilinos.sort((a, b) => {
            let valA, valB;
            
            if (inquilinosSortColumn === 'nombre') {
                valA = a.nombre.toLowerCase();
                valB = b.nombre.toLowerCase();
                return inquilinosSortOrder === 'asc' 
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            } else if (inquilinosSortColumn === 'renta') {
                valA = a.renta;
                valB = b.renta;
                return inquilinosSortOrder === 'asc' ? valA - valB : valB - valA;
            } else if (inquilinosSortColumn === 'vencimiento') {
                valA = new Date(a.fecha_vencimiento || '9999-12-31');
                valB = new Date(b.fecha_vencimiento || '9999-12-31');
                return inquilinosSortOrder === 'asc' ? valA - valB : valB - valA;
            }
        });
    }
    
    // Renderizar filas
    const rows = sortedInquilinos.map(inq => {
        const nombreCorto = inq.nombre.length > 25 ? inq.nombre.substring(0, 25) + '...' : inq.nombre;
        const inactivo = !inq.contrato_activo;
        const styleClass = inactivo ? 'style="opacity:0.4;font-style:italic"' : '';
        
        return `
            <tr style="cursor: pointer;" onclick="showInquilinoDetail(${inq.id})" ${styleClass}>
                <td style="font-size:0.9rem">${nombreCorto}</td>
                <td class="currency">${formatCurrency(inq.renta)}</td>
                <td>${formatDateVencimiento(inq.fecha_vencimiento)}</td>
            </tr>
        `;
    }).join('');
    
    if (sortedInquilinos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light);padding:2rem">No hay inquilinos</td></tr>';
    } else {
        tbody.innerHTML = rows;
    }
}

function sortInquilinos(column) {
    if (inquilinosSortColumn === column) {
        // Cambiar dirección
        inquilinosSortOrder = inquilinosSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        // Nueva columna
        inquilinosSortColumn = column;
        inquilinosSortOrder = 'asc';
    }
    
    renderInquilinosTable();
}
function filtrarInquilinos(query) {
    const tbody = document.getElementById('inquilinosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filtrados = inquilinos.filter(inq => inq.nombre.toLowerCase().includes(query));
    
    filtrados.forEach(inq => {
        const nombreCorto = inq.nombre.length > 25 ? inq.nombre.substring(0, 25) + '...' : inq.nombre;
        tbody.innerHTML += `
            <tr style="cursor: pointer;" onclick="showInquilinoDetail(${inq.id})">
                <td style="font-size:0.9rem">${nombreCorto}</td>
                <td class="currency">${formatCurrency(inq.renta)}</td>
                <td>${formatDateVencimiento(inq.fecha_vencimiento)}</td>
            </tr>
        `;
    });
    
    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron resultados</td></tr>';
    }
}

// ============================================
// RENTAS RECIBIDAS
// ============================================

function renderInquilinosRentasRecibidas() {
    const tbody = document.getElementById('inquilinosRentasRecibidasTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filterType = document.getElementById('inquilinosRentasFilter').value;
    const year = parseInt(document.getElementById('inquilinosRentasYear').value);
    const monthSelect = document.getElementById('inquilinosRentasMonth');
    
    if (filterType === 'mensual') {
        monthSelect.classList.remove('hidden');
    } else {
        monthSelect.classList.add('hidden');
    }
    
    const month = filterType === 'mensual' ? parseInt(monthSelect.value) : null;
    const rentas = [];
    let totalPeriodo = 0;

    inquilinos.forEach(inq => {
        if (inq.pagos) {
            inq.pagos.forEach(pago => {
                const pd = new Date(pago.fecha + 'T00:00:00');
                if (pd.getFullYear() === year && (month === null || pd.getMonth() === month)) {
                    rentas.push({
                        empresa: inq.nombre,
                        monto: pago.monto,
                        fecha: pago.fecha,
                        inquilinoId: inq.id
                    });
                    totalPeriodo += pago.monto;
                }
            });
        }
    });
    
    rentas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    rentas.forEach(r => {
        tbody.innerHTML += `
            <tr class="clickable" style="cursor: pointer;" onclick="showInquilinoDetail(${r.inquilinoId})">
                <td>${r.empresa}</td>
                <td class="currency">${formatCurrency(r.monto)}</td>
                <td>${formatDate(r.fecha)}</td>
            </tr>
        `;
    });
    
    if (rentas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light)">No hay rentas</td></tr>';
    } else {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        if (filterType === 'mensual') {
            const row = tbody.insertRow();
            row.style.fontWeight = 'bold';
            row.style.backgroundColor = '#e6f2ff';
            row.innerHTML = `<td style="text-align:right;padding:1rem;font-size:1.1rem">TOTAL ${monthNames[month].toUpperCase()} ${year}:</td><td class="currency" style="color:var(--primary);font-size:1.2rem">${formatCurrency(totalPeriodo)}</td><td></td>`;
        }
        
        let totalAnual = 0;
        inquilinos.forEach(inq => {
            if (inq.pagos) {
                inq.pagos.forEach(pago => {
                    const pd = new Date(pago.fecha + 'T00:00:00');
                    if (pd.getFullYear() === year) {
                        totalAnual += pago.monto;
                    }
                });
            }
        });
        
        const rowAnual = tbody.insertRow();
        rowAnual.style.fontWeight = 'bold';
        rowAnual.style.backgroundColor = '#d4edda';
        rowAnual.innerHTML = `<td style="text-align:right;padding:1rem;font-size:1.1rem">TOTAL ${year}:</td><td class="currency" style="color:var(--success);font-size:1.2rem">${formatCurrency(totalAnual)}</td><td></td>`;
    }
}

// ============================================
// VENCIMIENTO CONTRATOS
// ============================================

function renderInquilinosVencimientoContratos() {
    const tbody = document.getElementById('inquilinosVencimientoContratosTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    inquilinos.forEach(inq => {
        const venc = new Date(inq.fecha_vencimiento + 'T00:00:00');
        const diffDays = Math.ceil((venc - today) / (1000 * 60 * 60 * 24));
        let estado = '';
        let badgeClass = '';
        
        if (diffDays < 0) {
            estado = 'Vencido';
            badgeClass = 'badge-danger';
        } else if (diffDays <= 30) {
            estado = 'Próximo a vencer';
            badgeClass = 'badge-warning';
        } else {
            estado = 'Vigente';
            badgeClass = 'badge-success';
        }
        
        tbody.innerHTML += `
            <tr class="clickable" style="cursor: pointer;" onclick="showInquilinoDetail(${inq.id})">
                <td>${inq.nombre}</td>
                <td>${formatDate(inq.fecha_inicio)}</td>
                <td>${formatDateVencimiento(inq.fecha_vencimiento)}</td>
                <td>${diffDays}</td>
                <td><span class="badge ${badgeClass}">${estado}</span></td>
            </tr>
        `;
    });

    if (inquilinos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light)">No hay contratos</td></tr>';
    }
}

// ============================================
// INQUILINO DETAIL MODAL
// ============================================

function showInquilinoDetail(id) {
    const inq = inquilinos.find(i => i.id === id);
    
    if (!inq) {
        alert('ERROR: Inquilino no encontrado con ID ' + id);
        return;
    }
    
    currentInquilinoId = id;
    
    try {
        document.getElementById('inquilinoDetailNombre').textContent = inq.nombre;
        
        const contactosList = document.getElementById('detailContactosList');
        if (inq.contactos && inq.contactos.length > 0) {
            contactosList.innerHTML = inq.contactos.map(c => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:white;border-radius:4px">
                    <strong>${c.nombre}</strong><br>
                    <small><strong>Tel:</strong> ${c.telefono || '-'} | <strong>Email:</strong> ${c.email || '-'}</small>
                </div>
            `).join('');
        } else {
            contactosList.innerHTML = '<p style="color:var(--text-light)">No hay contactos</p>';
        }
        
        document.getElementById('detailRFC').textContent = inq.rfc || '-';
        document.getElementById('detailClabe').textContent = inq.clabe || '-';
        document.getElementById('detailRenta').textContent = formatCurrency(inq.renta);
        document.getElementById('detailM2').textContent = inq.m2 || '-';
        document.getElementById('detailDespacho').textContent = inq.numero_despacho || '-';
        document.getElementById('detailFechaInicio').textContent = formatDate(inq.fecha_inicio);
        document.getElementById('detailFechaVenc').innerHTML = formatDateVencimiento(inq.fecha_vencimiento);
        
        const contratoSection = document.getElementById('contratoOriginalSection');
        if (inq.contrato_file) {
            contratoSection.innerHTML = '<a href="#" onclick="event.preventDefault(); viewContrato();" style="color:var(--primary);text-decoration:underline;">Contrato de Renta Original</a>';
        } else {
            contratoSection.innerHTML = '<p style="color:var(--text-light)">No hay contrato cargado</p>';
        }
        
        const historialDiv = document.getElementById('historialPagos');
        if (inq.pagos && inq.pagos.length > 0) {
            historialDiv.innerHTML = inq.pagos.map(p => `
                <div class="payment-item">
                    <div><strong>${formatDate(p.fecha)}</strong><br>${formatCurrency(p.monto)}</div>
                    <div><span class="badge badge-success">Pagado</span><br><small style="color:var(--text-light)">${formatDate(p.fecha)}</small></div>
                </div>
            `).join('');
        } else {
            historialDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay pagos</p>';
        }
        
        const docsDiv = document.getElementById('documentosAdicionales');
        if (inq.documentos && inq.documentos.length > 0) {
            docsDiv.innerHTML = '<table style="width:100%"><thead><tr><th>Nombre</th><th>Fecha</th><th>Usuario</th><th style="width:50px;"></th></tr></thead><tbody>' +
                inq.documentos.map(d => `
                    <tr class="doc-item">
                        <td onclick="viewDocumento('${d.archivo}')" style="cursor:pointer;">${d.nombre}</td>
                        <td onclick="viewDocumento('${d.archivo}')" style="cursor:pointer;">${formatDate(d.fecha)}</td>
                        <td onclick="viewDocumento('${d.archivo}')" style="cursor:pointer;">${d.usuario}</td>
                        <td><button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteDocumentoAdicional(${d.id})">×</button></td>
                    </tr>
                `).join('') + '</tbody></table>';
        } else {
            docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay documentos adicionales</p>';
        }
        
        document.getElementById('notasInquilino').textContent = inq.notas || 'No hay notas para este inquilino.';
        
        document.getElementById('inquilinoDetailModal').classList.add('active');
        
        switchTab('inquilino', 'renta');
        
    } catch (error) {
        console.error('ERROR en showInquilinoDetail:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// EDIT INQUILINO
// ============================================

function editInquilino() {
    const inq = inquilinos.find(i => i.id === currentInquilinoId);
    if (!inq) return;
    
    isEditMode = true;
    tempInquilinoContactos = [...(inq.contactos || [])];
    
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

// ============================================
// CONTACTOS FUNCTIONS
// ============================================

function showAddContactoInquilinoModal() {
    document.getElementById('contactoInquilinoForm').reset();
    delete window.editingContactoIndex;
    document.getElementById('addContactoInquilinoModal').classList.add('active');
}

function saveContactoInquilino(event) {
    event.preventDefault();
    
    const contacto = {
        nombre: document.getElementById('contactoInquilinoNombre').value,
        telefono: document.getElementById('contactoInquilinoTelefono').value,
        email: document.getElementById('contactoInquilinoEmail').value
    };
    
    if (window.editingContactoIndex !== undefined) {
        tempInquilinoContactos[window.editingContactoIndex] = contacto;
        delete window.editingContactoIndex;
    } else {
        tempInquilinoContactos.push(contacto);
    }
    
    renderContactosList(tempInquilinoContactos, 'inquilinoContactosList', 'deleteInquilinoContacto', 'showEditContactoInquilinoModal');
    
    document.getElementById('contactoInquilinoForm').reset();
    closeModal('addContactoInquilinoModal');
}

function deleteInquilinoContacto(index) {
    tempInquilinoContactos.splice(index, 1);
    renderContactosList(tempInquilinoContactos, 'inquilinoContactosList', 'deleteInquilinoContacto', 'showEditContactoInquilinoModal');
}

function showEditContactoInquilinoModal(index) {
    const contacto = tempInquilinoContactos[index];
    
    document.getElementById('contactoInquilinoNombre').value = contacto.nombre;
    document.getElementById('contactoInquilinoTelefono').value = contacto.telefono || '';
    document.getElementById('contactoInquilinoEmail').value = contacto.email || '';
    
    window.editingContactoIndex = index;
    
    document.getElementById('addContactoInquilinoModal').classList.add('active');
}

// ============================================
// VIEW DOCUMENTS
// ============================================

function viewContrato() {
    const inq = inquilinos.find(i => i.id === currentInquilinoId);
    if (inq && inq.contrato_file) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe width='100%' height='100%' src='${inq.contrato_file}'></iframe>`);
    }
}

function viewDocumento(archivo) {
    if (archivo) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe width='100%' height='100%' src='${archivo}'></iframe>`);
    }
}

async function deleteDocumentoAdicional(docId) {
    if (!confirm('¿Eliminar este documento?')) return;
    
    showLoading();
    try {
        const { error } = await supabaseClient
            .from('inquilinos_documentos')
            .delete()
            .eq('id', docId);
        
        if (error) throw error;
        
        await loadInquilinos();
        showInquilinoDetail(currentInquilinoId);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar documento: ' + error.message);
    } finally {
        hideLoading();
    }
}

console.log('✅ INQUILINOS-UI.JS cargado');

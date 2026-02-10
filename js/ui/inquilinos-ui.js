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
    
    // Mostrar mensaje de carga
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem;color:var(--primary)">⏳ Cargando inquilinos...</td></tr>';
    
    // Usar setTimeout para permitir que el mensaje se muestre
    setTimeout(() => {
        // Copiar array para no mutar el original
        let sortedInquilinos = [...inquilinos];
        
        // Aplicar ordenamiento si hay columna seleccionada
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
                    valA = parseFloat(a.renta) || 0;
                    valB = parseFloat(b.renta) || 0;
                    return inquilinosSortOrder === 'asc' 
                        ? valA - valB 
                        : valB - valA;
                } else if (inquilinosSortColumn === 'vencimiento') {
                    valA = new Date(a.fecha_vencimiento || '9999-12-31');
                    valB = new Date(b.fecha_vencimiento || '9999-12-31');
                    return inquilinosSortOrder === 'asc' 
                        ? valA - valB 
                        : valB - valA;
                }
                return 0;
            });
        }
        
        // Generar filas
        const rows = sortedInquilinos.map(inq => {
            const nombreCorto = inq.nombre.length > 25 ? inq.nombre.substring(0, 25) + '...' : inq.nombre;
            const inactivo = !inq.contrato_activo;
            const opacityStyle = inactivo ? 'opacity:0.4;font-style:italic;' : '';
            
            return `
                <tr style="cursor:pointer;${opacityStyle}" onclick="showInquilinoDetail(${inq.id})">
                    <td style="font-size:0.9rem">${nombreCorto}</td>
                    <td class="currency">${formatCurrency(inq.renta)}</td>
                    <td>${formatDateVencimiento(inq.fecha_vencimiento)}</td>
                </tr>
            `;
        }).join('');
        
        if (inquilinos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light);padding:2rem">No hay inquilinos</td></tr>';
        } else {
            tbody.innerHTML = rows;
        }
        
        // Actualizar headers de ordenamiento
        document.querySelectorAll('#inquilinosTable th').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
        });
        
        if (inquilinosSortColumn) {
            const columnMap = {
                'nombre': 0,
                'renta': 1,
                'vencimiento': 2
            };
            const thIndex = columnMap[inquilinosSortColumn];
            const th = document.querySelectorAll('#inquilinosTable th')[thIndex];
            if (th) {
                th.classList.add(inquilinosSortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        }
    }, 100);
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
        
        // CONTACTOS EN UNA LÍNEA
const contactosList = document.getElementById('detailContactosList');
if (inq.contactos && inq.contactos.length > 0) {
    contactosList.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
            ${inq.contactos.map(c => `
                <div>
                    <strong>${c.nombre}</strong> | Tel: ${c.telefono || '-'} | Email: ${c.email || '-'}
                </div>
            `).join('')}
        </div>
    `;
} else {
    contactosList.innerHTML = '<span style="color:var(--text-light)">No hay contactos</span>';
}
        
        document.getElementById('detailRFC').textContent = inq.rfc || '-';
        document.getElementById('detailClabe').textContent = inq.clabe || '-';
        document.getElementById('detailRenta').textContent = formatCurrency(inq.renta);
        document.getElementById('detailM2').textContent = inq.m2 || '-';
        document.getElementById('detailDespacho').textContent = inq.numero_despacho || '-';
        document.getElementById('detailFechaInicio').textContent = formatDate(inq.fecha_inicio);
        document.getElementById('detailFechaVenc').innerHTML = formatDateVencimiento(inq.fecha_vencimiento);
        
        // BOTÓN DE CONTRATO
        const contratoButtonSection = document.getElementById('contratoButtonSection');
        if (inq.contrato_file) {
            contratoButtonSection.innerHTML = `
                <button class="btn btn-primary" onclick="viewContrato()" style="width:100%;font-size:1.1rem;padding:1rem;">
                    📄 Ver Contrato Original
                </button>
            `;
        } else {
            contratoButtonSection.innerHTML = `
                <div style="padding:1rem;background:var(--bg);border-radius:4px;text-align:center;color:var(--text-light);">
                    No hay contrato cargado
                </div>
            `;
        }
        
        // HISTORIAL DE PAGOS
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
        
        // DOCUMENTOS ADICIONALES
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
        
        // NOTAS
        document.getElementById('notasInquilino').textContent = inq.notas || 'No hay notas para este inquilino.';
        
        document.getElementById('inquilinoDetailModal').classList.add('active');
        
        // Activar primera pestaña
        switchTab('inquilino', 'pagos');
        
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

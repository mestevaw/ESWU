/* ========================================
   INQUILINOS-UI.JS - Inquilinos Interface Functions
   Última actualización: 2026-02-12 20:30 CST
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
    
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--primary)">⏳ Cargando inquilinos...</td></tr>';
    
    setTimeout(() => {
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
        
        const rows = sortedInquilinos.map(inq => {
            const nombreCorto = inq.nombre.length > 25 ? inq.nombre.substring(0, 25) + '...' : inq.nombre;
            const inactivo = !inq.contrato_activo;
            const opacityStyle = inactivo ? 'color:#999;font-style:italic;' : '';
            const contacto = (inq.contactos && inq.contactos.length > 0) ? inq.contactos[0].nombre : '';
            
            return `
                <tr style="cursor:pointer;${opacityStyle}" onclick="showInquilinoDetail(${inq.id})">
                    <td style="font-size:0.9rem">${nombreCorto}</td>
                    <td style="font-size:0.85rem">${contacto}</td>
                    <td>${formatDateVencimiento(inq.fecha_vencimiento)}</td>
                    <td class="currency">${formatCurrency(inq.renta)}</td>
                </tr>
            `;
        }).join('');
        
        if (inquilinos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light);padding:2rem">No hay inquilinos</td></tr>';
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
                'vencimiento': 2,
                'renta': 3
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
    
    const filtrados = inquilinos.filter(inq => {
        const nombre = inq.nombre.toLowerCase();
        const contacto = (inq.contactos && inq.contactos.length > 0) ? inq.contactos[0].nombre.toLowerCase() : '';
        return nombre.includes(query) || contacto.includes(query);
    });
    
    filtrados.forEach(inq => {
        const nombreCorto = inq.nombre.length > 25 ? inq.nombre.substring(0, 25) + '...' : inq.nombre;
        const contacto = (inq.contactos && inq.contactos.length > 0) ? inq.contactos[0].nombre : '';
        tbody.innerHTML += `
            <tr style="cursor: pointer;" onclick="showInquilinoDetail(${inq.id})">
                <td style="font-size:0.9rem">${nombreCorto}</td>
                <td style="font-size:0.85rem">${contacto}</td>
                <td>${formatDateVencimiento(inq.fecha_vencimiento)}</td>
                <td class="currency">${formatCurrency(inq.renta)}</td>
            </tr>
        `;
    });
    
    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light);padding:2rem">No se encontraron resultados</td></tr>';
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
        
        // INFO BOXES (ya están en el HTML como divs fijos)
        document.getElementById('detailRenta').textContent = formatCurrency(inq.renta);
        document.getElementById('detailM2').textContent = inq.m2 || '-';
        document.getElementById('detailDespacho').textContent = inq.numero_despacho || '-';
        document.getElementById('detailFechaInicio').textContent = formatDate(inq.fecha_inicio);
        document.getElementById('detailFechaVenc').innerHTML = formatDateVencimiento(inq.fecha_vencimiento);
        
        // CONTACTOS
        const contactosList = document.getElementById('detailContactosList');
        if (inq.contactos && inq.contactos.length > 0) {
            contactosList.innerHTML = inq.contactos.map(c => `
                <div style="font-size:0.9rem;">
                    <strong>${c.nombre}</strong> | Tel: ${c.telefono || '-'} | Email: ${c.email || '-'}
                </div>
            `).join('');
        } else {
            contactosList.innerHTML = '<span style="color:var(--text-light); font-size:0.85rem;">No hay contactos</span>';
        }
        
        // RFC y CLABE
        document.getElementById('detailRFC').textContent = inq.rfc || '-';
        document.getElementById('detailClabe').textContent = inq.clabe || '-';
        
        // CONTRATO ORIGINAL (recuadro con icono 📄)
        const contratoSection = document.getElementById('contratoOriginalSection');
        if (inq.has_contrato) {
            contratoSection.innerHTML = `
                <div onclick="fetchAndViewContrato(${inq.id})" style="background:var(--bg); border:1px solid var(--border); border-radius:6px; padding:0.6rem 0.75rem; cursor:pointer; display:flex; align-items:center; gap:0.5rem; transition:background 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='var(--bg)'">
                    <span style="font-size:1.2rem;">📄</span>
                    <div>
                        <div style="font-size:0.7rem; color:var(--text-light); text-transform:uppercase; font-weight:600;">Contrato Original</div>
                        <div style="font-size:0.85rem; color:var(--primary); font-weight:600;">Ver PDF</div>
                    </div>
                </div>
            `;
        } else {
            contratoSection.innerHTML = `
                <div style="background:var(--bg); border:1px solid var(--border); border-radius:6px; padding:0.6rem 0.75rem; color:var(--text-light);">
                    <div style="font-size:0.7rem; text-transform:uppercase; font-weight:600;">Contrato Original</div>
                    <div style="font-size:0.85rem;">No hay contrato cargado</div>
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
                        <td onclick="fetchAndViewDocInquilino(${d.id})" style="cursor:pointer;">${d.nombre}</td>
                        <td onclick="fetchAndViewDocInquilino(${d.id})" style="cursor:pointer;">${formatDate(d.fecha)}</td>
                        <td onclick="fetchAndViewDocInquilino(${d.id})" style="cursor:pointer;">${d.usuario}</td>
                        <td><button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteDocumentoAdicional(${d.id})">×</button></td>
                    </tr>
                `).join('') + '</tbody></table>';
        } else {
            docsDiv.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:2rem">No hay documentos adicionales</p>';
        }
        
        // NOTAS
        document.getElementById('notasInquilino').textContent = inq.notas || 'No hay notas para este inquilino.';
        
        document.getElementById('inquilinoDetailModal').classList.add('active');
        
        // Activar primera pestaña (Historial de Pagos)
        document.querySelectorAll('#inquilinoDetailModal .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#inquilinoDetailModal .tab-content').forEach(tc => tc.classList.remove('active'));
        document.querySelector('#inquilinoDetailModal .tab:nth-child(1)').classList.add('active');
        document.getElementById('inquilinoPagosTab').classList.add('active');
        
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
// VIEW DOCUMENTS (on-demand via loaders.js)
// ============================================

function viewContrato() {
    // Usa la función on-demand de loaders.js
    if (currentInquilinoId) {
        fetchAndViewContrato(currentInquilinoId);
    }
}

function viewDocumento(docIdOrArchivo) {
    // Si es un número, es un ID → usar fetch on-demand
    if (typeof docIdOrArchivo === 'number') {
        fetchAndViewDocInquilino(docIdOrArchivo);
    } else if (docIdOrArchivo) {
        // Fallback: si es base64 directo (legacy)
        openPDFViewer(docIdOrArchivo);
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

// ============================================
// EXPORTAR INQUILINOS A EXCEL
// ============================================

function exportarInquilinosExcel() {
    if (!inquilinos || inquilinos.length === 0) {
        alert('No hay inquilinos para exportar');
        return;
    }
    
    const data = inquilinos.map(inq => {
        const contacto = (inq.contactos && inq.contactos.length > 0) ? inq.contactos[0] : {};
        return {
            'Inquilino': inq.nombre,
            'Contacto': contacto.nombre || '',
            'Teléfono': contacto.telefono || '',
            'Email': contacto.email || '',
            'Renta Mensual': inq.renta || 0,
            'M²': inq.m2 || '',
            'Despacho': inq.numero_despacho || '',
            'Inicio Renta': inq.fecha_inicio || '',
            'Vencimiento': inq.fecha_vencimiento || '',
            'RFC': inq.rfc || '',
            'CLABE': inq.clabe || ''
        };
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 14 }, { wch: 8 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 15 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inquilinos');
    XLSX.writeFile(wb, `Inquilinos_${new Date().toISOString().split('T')[0]}.xlsx`);
}

console.log('✅ INQUILINOS-UI.JS cargado (2026-02-12 20:30 CST)');

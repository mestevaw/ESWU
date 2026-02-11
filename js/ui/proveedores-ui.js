<!-- Proveedor Detail Modal -->
<div id="proveedorDetailModal" class="modal">
    <div class="modal-content">
        <div class="modal-header modal-header-sticky">
            <div class="modal-header-left">
                <div class="dropdown">
                    <button class="dropdown-toggle" onclick="toggleDropdown('proveedorDetailDropdown')" style="font-size: 1rem; padding: 0.5rem 1rem;">☰</button>
                    <div id="proveedorDetailDropdown" class="dropdown-content">
                        <a href="#" onclick="event.preventDefault(); editProveedor();">Modificar Datos</a>
                        <a href="#" onclick="event.preventDefault(); deleteProveedor();">Eliminar</a>
                    </div>
                </div>
            </div>
            <div style="flex:1;text-align:center;">
                <h2 class="modal-title" id="proveedorDetailNombre" style="margin:0;"></h2>
                <div id="proveedorDetailServicio" style="color:var(--text-light);font-size:0.9rem;margin-top:0.25rem;"></div>
            </div>
            <button class="close-modal" onclick="closeModal('proveedorDetailModal')">×</button>
        </div>
        
        <div style="padding: 1.5rem; padding-top: 2rem;">
            
            <!-- ✅ TELÉFONO Y EMAIL CON ICONOS -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
                <div style="background:white;padding:1rem;border-radius:4px;box-shadow:var(--shadow);display:flex;align-items:center;gap:0.75rem;">
                    <span style="font-size:1.5rem;">📞</span>
                    <div>
                        <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:0.25rem;">Teléfono</div>
                        <div style="font-weight:600;" id="proveedorTelefono">-</div>
                    </div>
                </div>
                <a id="proveedorEmailLink" href="#" style="text-decoration:none;color:inherit;">
                    <div style="background:white;padding:1rem;border-radius:4px;box-shadow:var(--shadow);display:flex;align-items:center;gap:0.75rem;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <span style="font-size:1.5rem;">✉️</span>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:0.25rem;">Email</div>
                            <div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" id="proveedorEmail">-</div>
                        </div>
                    </div>
                </a>
            </div>
            
            <!-- ✅ RFC Y CLABE -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
                <div style="background:var(--bg);padding:1rem;border-radius:4px;border:1px solid var(--border);">
                    <div style="font-size:0.875rem;color:var(--text-light);margin-bottom:0.25rem;">RFC</div>
                    <div style="font-size:1rem;font-weight:600;" id="detailProvRFC"></div>
                </div>
                <div style="background:var(--bg);padding:1rem;border-radius:4px;border:1px solid var(--border);">
                    <div style="font-size:0.875rem;color:var(--text-light);margin-bottom:0.25rem;">CLABE</div>
                    <div style="font-size:1rem;font-weight:600;" id="detailProvClabe"></div>
                </div>
            </div>
            
            <!-- CONTACTOS ADICIONALES (si hay más de uno) -->
            <div id="detailProvContactosList"></div>
            
            <!-- PESTAÑAS -->
            <div class="tabs-container">
                <div class="tabs">
                    <button class="tab active" onclick="switchTab('proveedor', 'pagadas')">Facturas Pagadas</button>
                    <button class="tab" onclick="switchTab('proveedor', 'porpagar')">
                        Facturas X Pagar 
                        <span onclick="event.stopPropagation(); showRegistrarFacturaModalFromDetail();" 
                              style="color:var(--success);font-weight:bold;font-size:1.2rem;margin-left:0.5rem;cursor:pointer;transition:transform 0.2s;" 
                              onmouseover="this.style.transform='scale(1.2)';this.title='Agregar Factura'" 
                              onmouseout="this.style.transform='scale(1)'">+</span>
                    </button>
                    <button class="tab" onclick="switchTab('proveedor', 'docs')">Documentos Adicionales</button>
                    <button class="tab" onclick="switchTab('proveedor', 'notas')">Notas</button>
                </div>
                <div id="proveedorPagadasTab" class="tab-content active">
                    <div id="facturasPagadas"></div>
                </div>
                <div id="proveedorPorPagarTab" class="tab-content">
                    <div id="facturasPorPagar"></div>
                </div>
                <div id="proveedorDocsTab" class="tab-content">
                    <div id="proveedorDocumentosAdicionales"></div>
                </div>
                <div id="proveedorNotasTab" class="tab-content">
                    <p id="notasProveedor"></p>
                </div>
            </div>
        </div>
    </div>
</div>

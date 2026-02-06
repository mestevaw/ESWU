/* ========================================
   ESWU - CONFIGURATION
   Supabase client and global variables
   ======================================== */

// Supabase configuration
const SUPABASE_URL = 'https://tzuvoceilkqurnujrraq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dXZvY2VpbGtxdXJudWpycmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg3NDIsImV4cCI6MjA4NTEwNDc0Mn0.2bGNuh7nVhAFGULlXBT85wsKUMgJJbEEGtUq0jerqno';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales de estado
let currentUser = null;
let inquilinos = [];
let proveedores = [];
let activos = [];
let usuarios = [];
let bancosDocumentos = [];
let estacionamiento = [];
let bitacoraSemanal = [];

// Variables de contexto
let currentInquilinoId = null;
let currentProveedorId = null;
let currentActivoId = null;
let currentFacturaId = null;
let currentUsuarioId = null;
let currentPageContext = 'home';
let currentHomeTable = null;

// Variables de modo edición
let isEditMode = false;

// Variables temporales para contactos
let tempInquilinoContactos = [];
let tempProveedorContactos = [];

console.log('✅ Config.js cargado correctamente');

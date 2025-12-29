// ============================================
// HACCP-CMR Documentation Builder v2.0
// localStorage-only version - No backend
// ============================================

// ==================== CONFIGURATION ====================
const APP_NAME = 'HACCP-CMR Documentation Builder';
const STORAGE_PREFIX = 'haccp_cmr_';
const VERSION = '2.0.0';

// ==================== GLOBAL STATE ====================
let currentDocumentId = null;
let documents = {};
let clients = {};
let templates = {};
let groups = {};
let groupCounter = 0;
let blockCounter = 0;
let currentEditingBlock = null;
let editingClientId = null;
let editingGroupId = null;
let blockEditorQuill = null;

// Drag and drop state
let draggedType = null; // 'block' or 'document-block'
let draggedElement = null;

// ==================== DEFAULT BLOCK TEMPLATES ====================
// Initialize with default group
groups = {
    'group-0': {
        name: 'Alapértelmezett Blokkok',
        blocks: {
            'heading1': {
                name: 'Főcím (H1)',
                content: '<h1>Főcím</h1>'
            },
            'heading2': {
                name: 'Alcím (H2)',
                content: '<h2>Alcím</h2>'
            },
            'heading3': {
                name: 'Alcím (H3)',
                content: '<h3>Alcím</h3>'
            },
            'paragraph': {
                name: 'Bekezdés',
                content: '<p>Írja be a szöveget ide...</p>'
            },
            'bullet-list': {
                name: 'Felsorolás',
                content: '<ul><li>Első pont</li><li>Második pont</li><li>Harmadik pont</li></ul>'
            },
            'numbered-list': {
                name: 'Számozott lista',
                content: '<ol><li>Első lépés</li><li>Második lépés</li><li>Harmadik lépés</li></ol>'
            },
            'image': {
                name: 'Kép',
                content: '<div class="image-upload-area" onclick="uploadImage(this)" style="border: 2px dashed #ccc; padding: 40px; text-align: center; cursor: pointer; border-radius: 8px;">📷 Kattintson a kép feltöltéséhez</div>'
            }
        }
    }
};

// ==================== STORAGE LAYER (localStorage) ====================

/**
 * Save data to localStorage
 * @param {string} key - Storage key (without prefix)
 * @param {any} data - Data to store
 * @returns {boolean} Success status
 */
function saveToStorage(key, data) {
    try {
        const fullKey = STORAGE_PREFIX + key;
        localStorage.setItem(fullKey, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        if (error.name === 'QuotaExceededError') {
            alert('Nincs elég tárhely! Kérjük, töröljön néhány dokumentumot vagy készítsen biztonsági mentést és kezdje újra.');
        }
        return false;
    }
}

/**
 * Get data from localStorage
 * @param {string} key - Storage key (without prefix)
 * @returns {any} Retrieved data or null
 */
function getFromStorage(key) {
    try {
        const fullKey = STORAGE_PREFIX + key;
        const data = localStorage.getItem(fullKey);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from storage:', error);
        return null;
    }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key (without prefix)
 */
function removeFromStorage(key) {
    try {
        const fullKey = STORAGE_PREFIX + key;
        localStorage.removeItem(fullKey);
    } catch (error) {
        console.error('Error removing from storage:', error);
    }
}

/**
 * Get all storage keys with app prefix
 * @returns {Array<string>} Array of keys
 */
function getAllKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(STORAGE_PREFIX)) {
            keys.push(key.substring(STORAGE_PREFIX.length));
        }
    }
    return keys;
}

/**
 * Clear all app data from localStorage
 */
function clearAllStorage() {
    const keys = getAllKeys();
    keys.forEach(key => removeFromStorage(key));
}

// ==================== INITIALIZATION ====================

/**
 * Initialize application on page load
 */
function initApp() {
    console.log(`${APP_NAME} v${VERSION} - Initializing...`);
    
    // Check localStorage availability
    if (!window.localStorage) {
        alert('⚠️ A böngésző nem támogatja a localStorage-t!\n\nAz alkalmazás nem fog működni.');
        return;
    }
    
    // Load data from localStorage
    loadAllData();
    
    // Initialize Quill editor for block content
    initBlockEditor();
    
    // Render initial UI
    renderDocumentsList();
    renderBlocksList();
    renderClientsList();
    renderTemplatesList();
    updateClientSelector();
    
    // Set up drag and drop
    initDragAndDrop();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Show welcome message on first load
    const hasDocuments = Object.keys(documents).length > 0;
    if (!hasDocuments) {
        setTimeout(() => {
            showNotification('👋 Üdvözöljük! Kezdje új dokumentum létrehozásával.', 'info');
        }, 500);
    }
    
    console.log('✅ Application initialized successfully');
    console.log('📊 Statistics:', {
        documents: Object.keys(documents).length,
        clients: Object.keys(clients).length,
        templates: Object.keys(templates).length,
        groups: Object.keys(groups).length
    });
}

/**
 * Load all data from localStorage
 */
function loadAllData() {
    // Load groups (block templates)
    const savedGroups = getFromStorage('groups');
    if (savedGroups) {
        groups = savedGroups;
    } else {
        // Save default groups if nothing exists
        saveToStorage('groups', groups);
    }
    
    // Load clients
    const savedClients = getFromStorage('clients');
    if (savedClients) {
        clients = savedClients;
    }
    
    // Load templates
    const savedTemplates = getFromStorage('templates');
    if (savedTemplates) {
        templates = savedTemplates;
    }
    
    // Load documents - each document is stored separately
    const allKeys = getAllKeys();
    allKeys.forEach(key => {
        if (key.startsWith('document_')) {
            const doc = getFromStorage(key);
            if (doc) {
                documents[doc.id] = doc;
            }
        }
    });
    
    // Load counters
    groupCounter = getFromStorage('groupCounter') || 0;
    blockCounter = getFromStorage('blockCounter') || 0;
}

/**
 * Initialize Quill rich text editor for block content
 */
function initBlockEditor() {
    const editorElement = document.getElementById('block-content-editor');
    if (editorElement && !blockEditorQuill) {
        blockEditorQuill = new Quill('#block-content-editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link'],
                    ['clean']
                ]
            }
        });
    }
}

// ==================== TAB NAVIGATION ====================

/**
 * Switch between sidebar tabs
 * @param {string} tabName - Name of tab to switch to
 */
function switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Add active class to selected tab
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data for the tab
    switch(tabName) {
        case 'documents':
            renderDocumentsList();
            break;
        case 'blocks':
            renderBlocksList();
            break;
        case 'clients':
            renderClientsList();
            break;
        case 'templates':
            renderTemplatesList();
            break;
    }
}

// ==================== DOCUMENT MANAGEMENT ====================

/**
 * Create a new document
 */
function createNewDocument() {
    const timestamp = Date.now();
    const docId = `doc_${timestamp}`;
    
    const newDocument = {
        id: docId,
        title: 'Új dokumentum',
        clientId: null,
        blocks: [],
        createdAt: timestamp,
        updatedAt: timestamp
    };
    
    documents[docId] = newDocument;
    saveToStorage(`document_${docId}`, newDocument);
    
    // Open the document
    openDocument(docId);
    renderDocumentsList();
    
    showNotification('📄 Új dokumentum létrehozva', 'success');
}

/**
 * Open a document for editing
 * @param {string} docId - Document ID
 */
function openDocument(docId) {
    currentDocumentId = docId;
    const doc = documents[docId];
    
    if (!doc) {
        alert('Dokumentum nem található!');
        return;
    }
    
    // Update UI
    document.getElementById('document-title').value = doc.title;
    document.getElementById('client-selector').value = doc.clientId || '';
    
    // Update document stats
    updateDocumentStats(doc);
    
    // Render blocks
    renderDocumentBlocks();
    
    // Update active state in list
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`[data-doc-id="${docId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

/**
 * Update document statistics display
 * @param {Object} doc - Document object
 */
function updateDocumentStats(doc) {
    const statsElement = document.getElementById('document-stats');
    if (!statsElement) {
        // Create stats element if it doesn't exist
        const canvasActions = document.querySelector('.canvas-actions');
        const stats = document.createElement('div');
        stats.id = 'document-stats';
        stats.style.cssText = 'margin-top: var(--spacing-sm); font-size: 12px; color: var(--text-secondary);';
        canvasActions.appendChild(stats);
    }
    
    const blockCount = doc.blocks ? doc.blocks.length : 0;
    const createdDate = new Date(doc.createdAt).toLocaleDateString('hu-HU');
    const updatedDate = new Date(doc.updatedAt).toLocaleDateString('hu-HU');
    
    document.getElementById('document-stats').innerHTML = `
        📊 ${blockCount} blokk | 
        📅 Létrehozva: ${createdDate} | 
        🔄 Módosítva: ${updatedDate}
    `;
}

/**
 * Update document title
 */
function updateDocumentTitle() {
    if (!currentDocumentId) return;
    
    const title = document.getElementById('document-title').value;
    documents[currentDocumentId].title = title;
    documents[currentDocumentId].updatedAt = Date.now();
    
    saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
    renderDocumentsList();
}

/**
 * Assign client to current document
 */
function assignClientToDocument() {
    if (!currentDocumentId) return;
    
    const clientId = document.getElementById('client-selector').value;
    documents[currentDocumentId].clientId = clientId || null;
    documents[currentDocumentId].updatedAt = Date.now();
    
    saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
    renderDocumentsList();
}

/**
 * Delete a document
 * @param {string} docId - Document ID
 */
function deleteDocument(docId) {
    if (!confirm('Biztosan törli ezt a dokumentumot?')) return;
    
    delete documents[docId];
    removeFromStorage(`document_${docId}`);
    
    if (currentDocumentId === docId) {
        currentDocumentId = null;
        document.getElementById('document-title').value = '';
        document.getElementById('blocks-canvas').innerHTML = '<div class="empty-state"><p>🧱 Húzd ide a blokkokat a bal oldali menüből</p><p>vagy kattints az "Új blokk hozzáadása" gombra</p></div>';
    }
    
    renderDocumentsList();
}

/**
 * Duplicate a document
 * @param {string} docId - Document ID to duplicate
 */
function duplicateDocument(docId) {
    const original = documents[docId];
    if (!original) return;
    
    const timestamp = Date.now();
    const newDocId = `doc_${timestamp}`;
    
    const duplicate = {
        ...original,
        id: newDocId,
        title: original.title + ' (másolat)',
        createdAt: timestamp,
        updatedAt: timestamp
    };
    
    documents[newDocId] = duplicate;
    saveToStorage(`document_${newDocId}`, duplicate);
    
    renderDocumentsList();
    openDocument(newDocId);
}

/**
 * Render documents list in sidebar
 */
function renderDocumentsList() {
    const container = document.getElementById('documents-list');
    const docArray = Object.values(documents);
    
    if (docArray.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Még nincs dokumentum</p><p>Kattintson az "+ Új dokumentum" gombra</p></div>';
        return;
    }
    
    // Sort by updated date (newest first)
    docArray.sort((a, b) => b.updatedAt - a.updatedAt);
    
    container.innerHTML = docArray.map(doc => {
        const client = doc.clientId && clients[doc.clientId] ? clients[doc.clientId] : null;
        const date = new Date(doc.updatedAt).toLocaleDateString('hu-HU');
        
        return `
            <div class="list-item ${currentDocumentId === doc.id ? 'active' : ''}" 
                 data-doc-id="${doc.id}" 
                 data-doc-title="${doc.title.toLowerCase()}"
                 data-client-name="${client ? client.companyName.toLowerCase() : ''}"
                 onclick="openDocument('${doc.id}')">
                <div class="list-item-title">${doc.title}</div>
                <div class="list-item-meta">
                    <span>${client ? '👤 ' + client.companyName : '—'}</span>
                    <span>${date}</span>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-small btn-icon" onclick="event.stopPropagation(); duplicateDocument('${doc.id}')" title="Másolat">📋</button>
                    <button class="btn btn-small btn-icon" onclick="event.stopPropagation(); deleteDocument('${doc.id}')" title="Törlés">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Filter documents by search query
 * @param {string} query - Search query
 */
function filterDocuments(query) {
    const items = document.querySelectorAll('#documents-list .list-item');
    const searchLower = query.toLowerCase().trim();
    
    if (!searchLower) {
        // Show all documents
        items.forEach(item => item.style.display = '');
        return;
    }
    
    let visibleCount = 0;
    items.forEach(item => {
        const title = item.getAttribute('data-doc-title') || '';
        const client = item.getAttribute('data-client-name') || '';
        
        const matches = title.includes(searchLower) || client.includes(searchLower);
        item.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
    });
    
    // Show message if no results
    const container = document.getElementById('documents-list');
    const existingMessage = container.querySelector('.search-no-results');
    
    if (visibleCount === 0 && !existingMessage) {
        const message = document.createElement('div');
        message.className = 'empty-state search-no-results';
        message.innerHTML = '<p>🔍</p><p>Nincs találat: "' + query + '"</p>';
        container.appendChild(message);
    } else if (visibleCount > 0 && existingMessage) {
        existingMessage.remove();
    }
}

/**
 * Render document blocks in canvas
 */
function renderDocumentBlocks() {
    if (!currentDocumentId) return;
    
    const doc = documents[currentDocumentId];
    const canvas = document.getElementById('blocks-canvas');
    
    // Update stats
    updateDocumentStats(doc);
    
    if (!doc.blocks || doc.blocks.length === 0) {
        canvas.innerHTML = '<div class="empty-state"><p>🧱 Húzd ide a blokkokat a bal oldali menüből</p><p>vagy kattints az "Új blokk hozzáadása" gombra</p></div>';
        return;
    }
    
    canvas.innerHTML = doc.blocks.map((block, index) => `
        <div class="document-block" data-block-index="${index}" draggable="true">
            <div class="block-toolbar">
                <button class="btn btn-small btn-icon" onclick="editDocumentBlock(${index})" title="Szerkesztés">✏️</button>
                <button class="btn btn-small btn-icon" onclick="moveBlockUp(${index})" title="Fel" ${index === 0 ? 'disabled' : ''}>⬆️</button>
                <button class="btn btn-small btn-icon" onclick="moveBlockDown(${index})" title="Le" ${index === doc.blocks.length - 1 ? 'disabled' : ''}>⬇️</button>
                <button class="btn btn-small btn-icon" onclick="deleteDocumentBlock(${index})" title="Törlés">🗑️</button>
            </div>
            <div class="block-content">${block.content}</div>
        </div>
    `).join('');
    
    // Re-init drag and drop for document blocks
    initDocumentBlocksDragDrop();
}

// ==================== DRAG AND DROP ====================

/**
 * Initialize drag and drop for blocks from sidebar
 */
function initDragAndDrop() {
    // This will be called after blocks list is rendered
    // Implemented in renderBlocksList
}

/**
 * Initialize drag and drop for document blocks
 */
function initDocumentBlocksDragDrop() {
    const canvas = document.getElementById('blocks-canvas');
    if (canvas && window.Sortable) {
        Sortable.create(canvas, {
            animation: 150,
            handle: '.document-block',
            onEnd: function(evt) {
                if (evt.oldIndex !== evt.newIndex) {
                    moveBlock(evt.oldIndex, evt.newIndex);
                }
            }
        });
    }
}

/**
 * Handle block drop from sidebar to canvas
 * @param {string} groupId - Group ID
 * @param {string} blockId - Block ID
 */
function addBlockToDocument(groupId, blockId) {
    if (!currentDocumentId) {
        alert('Először nyisson meg egy dokumentumot!');
        return;
    }
    
    const group = groups[groupId];
    if (!group || !group.blocks[blockId]) return;
    
    const block = group.blocks[blockId];
    const newBlock = {
        id: `block_${++blockCounter}`,
        name: block.name,
        content: block.content
    };
    
    documents[currentDocumentId].blocks.push(newBlock);
    documents[currentDocumentId].updatedAt = Date.now();
    
    saveToStorage('blockCounter', blockCounter);
    saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
    
    renderDocumentBlocks();
}

/**
 * Move block up in document
 * @param {number} index - Current block index
 */
function moveBlockUp(index) {
    if (!currentDocumentId || index === 0) return;
    
    const blocks = documents[currentDocumentId].blocks;
    [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    
    documents[currentDocumentId].updatedAt = Date.now();
    saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
    
    renderDocumentBlocks();
}

/**
 * Move block down in document
 * @param {number} index - Current block index
 */
function moveBlockDown(index) {
    if (!currentDocumentId) return;
    
    const blocks = documents[currentDocumentId].blocks;
    if (index === blocks.length - 1) return;
    
    [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    
    documents[currentDocumentId].updatedAt = Date.now();
    saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
    
    renderDocumentBlocks();
}

/**
 * Move block to new position (used by Sortable.js)
 * @param {number} oldIndex - Old position
 * @param {number} newIndex - New position
 */
function moveBlock(oldIndex, newIndex) {
    if (!currentDocumentId) return;
    
    const blocks = documents[currentDocumentId].blocks;
    const block = blocks.splice(oldIndex, 1)[0];
    blocks.splice(newIndex, 0, block);
    
    documents[currentDocumentId].updatedAt = Date.now();
    saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
    
    renderDocumentBlocks();
}

/**
 * Delete block from document
 * @param {number} index - Block index
 */
function deleteDocumentBlock(index) {
    if (!currentDocumentId) return;
    if (!confirm('Biztosan törli ezt a blokkot?')) return;
    
    documents[currentDocumentId].blocks.splice(index, 1);
    documents[currentDocumentId].updatedAt = Date.now();
    
    saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
    
    renderDocumentBlocks();
}

/**
 * Edit document block content
 * @param {number} index - Block index
 */
function editDocumentBlock(index) {
    if (!currentDocumentId) return;
    
    const block = documents[currentDocumentId].blocks[index];
    currentEditingBlock = index;
    
    // Open block editor modal
    document.getElementById('block-name-input').value = block.name;
    blockEditorQuill.root.innerHTML = block.content;
    
    document.getElementById('block-editor-modal').classList.add('active');
}

/**
 * Save edited block content
 */
function saveBlock() {
    if (!currentDocumentId || currentEditingBlock === null) return;
    
    const name = document.getElementById('block-name-input').value;
    const content = blockEditorQuill.root.innerHTML;
    
    documents[currentDocumentId].blocks[currentEditingBlock].name = name;
    documents[currentDocumentId].blocks[currentEditingBlock].content = content;
    documents[currentDocumentId].updatedAt = Date.now();
    
    saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
    
    closeBlockEditor();
    renderDocumentBlocks();
}

/**
 * Close block editor modal
 */
function closeBlockEditor() {
    document.getElementById('block-editor-modal').classList.remove('active');
    currentEditingBlock = null;
}

// ==================== BLOCK TEMPLATES MANAGEMENT ====================

/**
 * Render blocks list in sidebar
 */
function renderBlocksList() {
    const container = document.getElementById('blocks-list');
    const groupArray = Object.entries(groups);
    
    if (groupArray.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Még nincs blokk csoport</p></div>';
        return;
    }
    
    container.innerHTML = groupArray.map(([groupId, group]) => {
        const blocksHtml = Object.entries(group.blocks).map(([blockId, block]) => `
            <div class="block-item" draggable="true" onclick="addBlockToDocument('${groupId}', '${blockId}')">
                <span>${block.name}</span>
                <button class="btn btn-small btn-icon" onclick="event.stopPropagation(); editBlockTemplate('${groupId}', '${blockId}')" title="Szerkesztés">✏️</button>
            </div>
        `).join('');
        
        return `
            <div class="block-group">
                <div class="block-group-header">
                    <span class="block-group-title">${group.name}</span>
                    <div>
                        <button class="btn btn-small btn-icon" onclick="editGroup('${groupId}')" title="Csoport szerkesztése">✏️</button>
                        <button class="btn btn-small btn-icon" onclick="addBlockTemplate('${groupId}')" title="Új blokk">➕</button>
                        ${groupId !== 'group-0' ? `<button class="btn btn-small btn-icon" onclick="deleteGroup('${groupId}')" title="Csoport törlése">🗑️</button>` : ''}
                    </div>
                </div>
                ${blocksHtml}
            </div>
        `;
    }).join('');
}

/**
 * Create new block group
 */
function createNewGroup() {
    const groupId = `group-${++groupCounter}`;
    groups[groupId] = {
        name: 'Új csoport',
        blocks: {}
    };
    
    saveToStorage('groupCounter', groupCounter);
    saveToStorage('groups', groups);
    
    renderBlocksList();
}

/**
 * Edit group name
 * @param {string} groupId - Group ID
 */
function editGroup(groupId) {
    editingGroupId = groupId;
    document.getElementById('group-name-input').value = groups[groupId].name;
    document.getElementById('group-editor-modal').classList.add('active');
}

/**
 * Save group name
 */
function saveGroup() {
    if (!editingGroupId) return;
    
    const name = document.getElementById('group-name-input').value;
    groups[editingGroupId].name = name;
    
    saveToStorage('groups', groups);
    
    closeGroupEditor();
    renderBlocksList();
}

/**
 * Close group editor modal
 */
function closeGroupEditor() {
    document.getElementById('group-editor-modal').classList.remove('active');
    editingGroupId = null;
}

/**
 * Delete block group
 * @param {string} groupId - Group ID
 */
function deleteGroup(groupId) {
    if (!confirm('Biztosan törli ezt a csoportot és az összes blokkját?')) return;
    
    delete groups[groupId];
    saveToStorage('groups', groups);
    
    renderBlocksList();
}

/**
 * Add new block template to group
 * @param {string} groupId - Group ID
 */
function addBlockTemplate(groupId) {
    const blockId = `custom_block_${Date.now()}`;
    groups[groupId].blocks[blockId] = {
        name: 'Új blokk',
        content: '<p>Új blokk tartalom...</p>'
    };
    
    saveToStorage('groups', groups);
    renderBlocksList();
}

/**
 * Edit block template
 * @param {string} groupId - Group ID
 * @param {string} blockId - Block ID
 */
function editBlockTemplate(groupId, blockId) {
    // Implementation here - similar to editDocumentBlock
    alert('Blokk sablon szerkesztése hamarosan elérhető');
}

// ==================== CLIENT MANAGEMENT ====================

/**
 * Render clients list
 */
function renderClientsList() {
    const container = document.getElementById('clients-list');
    const clientArray = Object.values(clients);
    
    if (clientArray.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Még nincs ügyfél</p><p>Kattintson az "+ Új ügyfél" gombra</p></div>';
        return;
    }
    
    container.innerHTML = clientArray.map(client => `
        <div class="list-item" onclick="editClient('${client.id}')">
            <div class="list-item-title">${client.companyName}</div>
            <div class="list-item-meta">
                <span>${client.contactPerson || '—'}</span>
                <span>${client.email || '—'}</span>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-small btn-icon" onclick="event.stopPropagation(); deleteClient('${client.id}')" title="Törlés">🗑️</button>
            </div>
        </div>
    `).join('');
}

/**
 * Create new client
 */
function createNewClient() {
    editingClientId = null;
    clearClientForm();
    document.getElementById('client-editor-modal').classList.add('active');
}

/**
 * Edit existing client
 * @param {string} clientId - Client ID
 */
function editClient(clientId) {
    editingClientId = clientId;
    const client = clients[clientId];
    
    // Populate form
    document.getElementById('client-company-name').value = client.companyName || '';
    document.getElementById('client-contact-person').value = client.contactPerson || '';
    document.getElementById('client-email').value = client.email || '';
    document.getElementById('client-phone').value = client.phone || '';
    document.getElementById('client-address').value = client.address || '';
    document.getElementById('client-city').value = client.city || '';
    document.getElementById('client-country').value = client.country || 'Magyarország';
    document.getElementById('client-postal-code').value = client.postalCode || '';
    document.getElementById('client-tax-id').value = client.taxId || '';
    document.getElementById('client-industry').value = client.industry || '';
    document.getElementById('client-website').value = client.website || '';
    document.getElementById('client-notes').value = client.notes || '';
    
    document.getElementById('client-editor-modal').classList.add('active');
}

/**
 * Save client data
 */
function saveClient() {
    const companyName = document.getElementById('client-company-name').value.trim();
    
    if (!companyName) {
        alert('A cégnév megadása kötelező!');
        return;
    }
    
    const clientData = {
        companyName: companyName,
        contactPerson: document.getElementById('client-contact-person').value.trim(),
        email: document.getElementById('client-email').value.trim(),
        phone: document.getElementById('client-phone').value.trim(),
        address: document.getElementById('client-address').value.trim(),
        city: document.getElementById('client-city').value.trim(),
        country: document.getElementById('client-country').value.trim(),
        postalCode: document.getElementById('client-postal-code').value.trim(),
        taxId: document.getElementById('client-tax-id').value.trim(),
        industry: document.getElementById('client-industry').value.trim(),
        website: document.getElementById('client-website').value.trim(),
        notes: document.getElementById('client-notes').value.trim()
    };
    
    if (editingClientId) {
        // Update existing client
        clients[editingClientId] = {
            ...clients[editingClientId],
            ...clientData,
            updatedAt: Date.now()
        };
    } else {
        // Create new client
        const clientId = `client_${Date.now()}`;
        clients[clientId] = {
            id: clientId,
            ...clientData,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
    }
    
    saveToStorage('clients', clients);
    
    closeClientEditor();
    renderClientsList();
    updateClientSelector();
}

/**
 * Delete client
 * @param {string} clientId - Client ID
 */
function deleteClient(clientId) {
    if (!confirm('Biztosan törli ezt az ügyfelet?')) return;
    
    delete clients[clientId];
    saveToStorage('clients', clients);
    
    renderClientsList();
    updateClientSelector();
}

/**
 * Close client editor modal
 */
function closeClientEditor() {
    document.getElementById('client-editor-modal').classList.remove('active');
    editingClientId = null;
}

/**
 * Clear client form
 */
function clearClientForm() {
    document.getElementById('client-company-name').value = '';
    document.getElementById('client-contact-person').value = '';
    document.getElementById('client-email').value = '';
    document.getElementById('client-phone').value = '';
    document.getElementById('client-address').value = '';
    document.getElementById('client-city').value = '';
    document.getElementById('client-country').value = 'Magyarország';
    document.getElementById('client-postal-code').value = '';
    document.getElementById('client-tax-id').value = '';
    document.getElementById('client-industry').value = '';
    document.getElementById('client-website').value = '';
    document.getElementById('client-notes').value = '';
}

/**
 * Update client selector dropdown
 */
function updateClientSelector() {
    const selector = document.getElementById('client-selector');
    const clientArray = Object.values(clients);
    
    selector.innerHTML = '<option value="">Válassz ügyfelet...</option>' +
        clientArray.map(client => 
            `<option value="${client.id}">${client.companyName}</option>`
        ).join('');
}

// ==================== TEMPLATE MANAGEMENT ====================

/**
 * Render templates list
 */
function renderTemplatesList() {
    const container = document.getElementById('templates-list');
    const templateArray = Object.values(templates);
    
    if (templateArray.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Még nincs sablon</p><p>Nyisson meg egy dokumentumot és mentse sablonként</p></div>';
        return;
    }
    
    container.innerHTML = templateArray.map(template => `
        <div class="list-item" onclick="applyTemplate('${template.id}')">
            <div class="list-item-title">${template.name}</div>
            <div class="list-item-meta">
                <span>${template.blocks.length} blokk</span>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-small btn-icon" onclick="event.stopPropagation(); deleteTemplate('${template.id}')" title="Törlés">🗑️</button>
            </div>
        </div>
    `).join('');
}

/**
 * Save current document as template
 */
function saveCurrentAsTemplate() {
    if (!currentDocumentId) {
        alert('Először nyisson meg egy dokumentumot!');
        return;
    }
    
    const doc = documents[currentDocumentId];
    const templateName = prompt('Sablon neve:', doc.title);
    
    if (!templateName) return;
    
    const templateId = `template_${Date.now()}`;
    templates[templateId] = {
        id: templateId,
        name: templateName,
        blocks: [...doc.blocks],
        createdAt: Date.now()
    };
    
    saveToStorage('templates', templates);
    
    alert('Sablon sikeresen mentve!');
    renderTemplatesList();
}

/**
 * Apply template to current document
 * @param {string} templateId - Template ID
 */
function applyTemplate(templateId) {
    if (!currentDocumentId) {
        alert('Először nyisson meg egy dokumentumot!');
        return;
    }
    
    if (!confirm('Ez felülírja a jelenlegi dokumentum tartalmát. Folytatja?')) return;
    
    const template = templates[templateId];
    documents[currentDocumentId].blocks = [...template.blocks];
    documents[currentDocumentId].updatedAt = Date.now();
    
    saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
    
    renderDocumentBlocks();
}

/**
 * Delete template
 * @param {string} templateId - Template ID
 */
function deleteTemplate(templateId) {
    if (!confirm('Biztosan törli ezt a sablont?')) return;
    
    delete templates[templateId];
    saveToStorage('templates', templates);
    
    renderTemplatesList();
}

// ==================== EXPORT TO WORD ====================

/**
 * Convert HTML block to docx.js paragraph
 * @param {string} html - HTML content
 * @returns {Array} Array of docx paragraph objects
 */
function htmlToDocxParagraphs(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const paragraphs = [];
    
    // Process each child element
    Array.from(tempDiv.children).forEach(element => {
        const tagName = element.tagName.toLowerCase();
        
        switch(tagName) {
            case 'h1':
                paragraphs.push(new docx.Paragraph({
                    text: element.textContent,
                    heading: docx.HeadingLevel.HEADING_1,
                    spacing: { before: 240, after: 120 }
                }));
                break;
                
            case 'h2':
                paragraphs.push(new docx.Paragraph({
                    text: element.textContent,
                    heading: docx.HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 }
                }));
                break;
                
            case 'h3':
                paragraphs.push(new docx.Paragraph({
                    text: element.textContent,
                    heading: docx.HeadingLevel.HEADING_3,
                    spacing: { before: 180, after: 80 }
                }));
                break;
                
            case 'p':
                const children = [];
                element.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        children.push(new docx.TextRun(node.textContent));
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const text = node.textContent;
                        const tag = node.tagName.toLowerCase();
                        
                        if (tag === 'strong' || tag === 'b') {
                            children.push(new docx.TextRun({ text, bold: true }));
                        } else if (tag === 'em' || tag === 'i') {
                            children.push(new docx.TextRun({ text, italics: true }));
                        } else if (tag === 'u') {
                            children.push(new docx.TextRun({ text, underline: {} }));
                        } else {
                            children.push(new docx.TextRun(text));
                        }
                    }
                });
                
                paragraphs.push(new docx.Paragraph({
                    children: children.length > 0 ? children : [new docx.TextRun(element.textContent)],
                    spacing: { before: 120, after: 120 }
                }));
                break;
                
            case 'ul':
                Array.from(element.children).forEach((li, index) => {
                    paragraphs.push(new docx.Paragraph({
                        text: li.textContent,
                        bullet: { level: 0 },
                        spacing: { before: 80, after: 80 }
                    }));
                });
                break;
                
            case 'ol':
                Array.from(element.children).forEach((li, index) => {
                    paragraphs.push(new docx.Paragraph({
                        text: li.textContent,
                        numbering: {
                            reference: 'default-numbering',
                            level: 0
                        },
                        spacing: { before: 80, after: 80 }
                    }));
                });
                break;
                
            case 'img':
                // Images are handled as base64 - add placeholder text
                paragraphs.push(new docx.Paragraph({
                    text: '[Kép: ' + (element.alt || 'csatolt kép') + ']',
                    spacing: { before: 120, after: 120 }
                }));
                break;
                
            case 'div':
                // Handle div content recursively
                if (element.querySelector('img')) {
                    const img = element.querySelector('img');
                    paragraphs.push(new docx.Paragraph({
                        text: '[Kép: ' + (img.alt || 'csatolt kép') + ']',
                        spacing: { before: 120, after: 120 }
                    }));
                } else if (element.textContent.trim()) {
                    paragraphs.push(new docx.Paragraph({
                        text: element.textContent,
                        spacing: { before: 120, after: 120 }
                    }));
                }
                break;
                
            default:
                // Fallback for unknown elements
                if (element.textContent.trim()) {
                    paragraphs.push(new docx.Paragraph({
                        text: element.textContent,
                        spacing: { before: 120, after: 120 }
                    }));
                }
        }
    });
    
    return paragraphs;
}

/**
 * Export current document to Word (.docx) format
 */
async function exportToWord() {
    if (!currentDocumentId) {
        alert('Nincs megnyitott dokumentum!');
        return;
    }
    
    const doc = documents[currentDocumentId];
    
    if (!doc.blocks || doc.blocks.length === 0) {
        alert('A dokumentum üres! Adjon hozzá tartalmat az exportáláshoz.');
        return;
    }
    
    try {
        // Convert all blocks to docx paragraphs
        const allParagraphs = [];
        
        // Add document title as main heading
        allParagraphs.push(new docx.Paragraph({
            text: doc.title || 'Névtelen dokumentum',
            heading: docx.HeadingLevel.TITLE,
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
        }));
        
        // Add client info if present
        if (doc.clientId && clients[doc.clientId]) {
            const client = clients[doc.clientId];
            allParagraphs.push(new docx.Paragraph({
                text: 'Ügyfél: ' + client.companyName,
                spacing: { after: 240 }
            }));
            
            if (client.contactPerson) {
                allParagraphs.push(new docx.Paragraph({
                    text: 'Kapcsolattartó: ' + client.contactPerson,
                    spacing: { after: 120 }
                }));
            }
            
            // Add spacing after client info
            allParagraphs.push(new docx.Paragraph({
                text: '',
                spacing: { after: 240 }
            }));
        }
        
        // Add document creation date
        allParagraphs.push(new docx.Paragraph({
            text: 'Létrehozva: ' + new Date(doc.createdAt).toLocaleDateString('hu-HU'),
            spacing: { after: 400 }
        }));
        
        // Process each block
        doc.blocks.forEach(block => {
            const blockParagraphs = htmlToDocxParagraphs(block.content);
            allParagraphs.push(...blockParagraphs);
        });
        
        // Create the document
        const docxDocument = new docx.Document({
            numbering: {
                config: [{
                    reference: 'default-numbering',
                    levels: [
                        {
                            level: 0,
                            format: docx.LevelFormat.DECIMAL,
                            text: '%1.',
                            alignment: docx.AlignmentType.LEFT,
                            style: {
                                paragraph: {
                                    indent: { left: 720, hanging: 360 }
                                }
                            }
                        }
                    ]
                }]
            },
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440,
                            right: 1440,
                            bottom: 1440,
                            left: 1440
                        }
                    }
                },
                children: allParagraphs
            }]
        });
        
        // Generate and download
        const blob = await docx.Packer.toBlob(docxDocument);
        saveAs(blob, (doc.title || 'dokumentum') + '.docx');
        
        alert('✅ A dokumentum sikeresen exportálva Word formátumba!');
        
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ Hiba történt az exportálás során:\n' + error.message);
    }
}

// ==================== BACKUP & RESTORE ====================

/**
 * Open backup modal
 */
function openBackupModal() {
    document.getElementById('backup-modal').classList.add('active');
}

/**
 * Close backup modal
 */
function closeBackupModal() {
    document.getElementById('backup-modal').classList.remove('active');
}

/**
 * Create backup of all data
 */
function createBackup() {
    const backupData = {
        version: VERSION,
        timestamp: Date.now(),
        documents: documents,
        clients: clients,
        templates: templates,
        groups: groups,
        groupCounter: groupCounter,
        blockCounter: blockCounter
    };
    
    const json = JSON.stringify(backupData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `haccp-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    alert('Biztonsági mentés letöltve!');
}

/**
 * Restore data from backup file
 */
function restoreBackup() {
    const fileInput = document.getElementById('backup-file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Kérjük, válasszon ki egy fájlt!');
        return;
    }
    
    if (!confirm('Ez felülírja az összes jelenlegi adatot! Biztosan folytatja?')) {
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            // Restore data
            documents = backupData.documents || {};
            clients = backupData.clients || {};
            templates = backupData.templates || {};
            groups = backupData.groups || {};
            groupCounter = backupData.groupCounter || 0;
            blockCounter = backupData.blockCounter || 0;
            
            // Save to localStorage
            Object.values(documents).forEach(doc => {
                saveToStorage(`document_${doc.id}`, doc);
            });
            saveToStorage('clients', clients);
            saveToStorage('templates', templates);
            saveToStorage('groups', groups);
            saveToStorage('groupCounter', groupCounter);
            saveToStorage('blockCounter', blockCounter);
            
            alert('Adatok sikeresen visszaállítva!');
            
            // Reload UI
            currentDocumentId = null;
            renderDocumentsList();
            renderBlocksList();
            renderClientsList();
            renderTemplatesList();
            updateClientSelector();
            
            closeBackupModal();
            
        } catch (error) {
            console.error('Restore error:', error);
            alert('Hiba történt a visszaállítás során! Érvénytelen fájl formátum.');
        }
    };
    
    reader.readAsText(file);
}

/**
 * Clear all data
 */
function clearAllData() {
    if (!confirm('FIGYELEM! Ez véglegesen törli az összes adatot!\n\nBiztosan folytatja?')) {
        return;
    }
    
    if (!confirm('Ez a művelet NEM VISSZAVONHATÓ!\n\nUtoljára megkérdezzük: Biztosan törli az összes adatot?')) {
        return;
    }
    
    clearAllStorage();
    
    // Reset state
    documents = {};
    clients = {};
    templates = {};
    groups = {
        'group-0': {
            name: 'Alapértelmezett Blokkok',
            blocks: {
                'heading1': { name: 'Főcím (H1)', content: '<h1>Főcím</h1>' },
                'heading2': { name: 'Alcím (H2)', content: '<h2>Alcím</h2>' },
                'heading3': { name: 'Alcím (H3)', content: '<h3>Alcím</h3>' },
                'paragraph': { name: 'Bekezdés', content: '<p>Írja be a szöveget ide...</p>' },
                'bullet-list': { name: 'Felsorolás', content: '<ul><li>Első pont</li><li>Második pont</li><li>Harmadik pont</li></ul>' },
                'numbered-list': { name: 'Számozott lista', content: '<ol><li>Első lépés</li><li>Második lépés</li><li>Harmadik lépés</li></ol>' },
                'image': { name: 'Kép', content: '<div class="image-upload-area" onclick="uploadImage(this)" style="border: 2px dashed #ccc; padding: 40px; text-align: center; cursor: pointer; border-radius: 8px;">📷 Kattintson a kép feltöltéséhez</div>' }
            }
        }
    };
    groupCounter = 0;
    blockCounter = 0;
    currentDocumentId = null;
    
    saveToStorage('groups', groups);
    
    alert('Minden adat törölve!');
    
    // Reload UI
    renderDocumentsList();
    renderBlocksList();
    renderClientsList();
    renderTemplatesList();
    updateClientSelector();
    
    closeBackupModal();
}

// ==================== IMAGE UPLOAD ====================

/**
 * Upload image to block with size optimization
 * @param {HTMLElement} element - Image upload area element
 */
function uploadImage(element) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file size (max 2MB recommended)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            if (!confirm('A kép mérete ' + Math.round(file.size / 1024 / 1024 * 10) / 10 + ' MB.\n' +
                        'A nagy képek növelhetik a tárolási helyet és lassíthatják az alkalmazást.\n' +
                        'Javasolt: max 2MB, 800px szélesség.\n\n' +
                        'Biztosan folytatja a feltöltést?')) {
                return;
            }
        }
        
        // Show loading indicator
        element.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">📤 Kép feltöltése...</div>';
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Create canvas for potential resizing
                let width = img.width;
                let height = img.height;
                const maxWidth = 800;
                
                // Resize if needed
                if (width > maxWidth) {
                    height = Math.round(height * maxWidth / width);
                    width = maxWidth;
                }
                
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 (with quality adjustment for JPEGs)
                const quality = file.size > maxSize ? 0.7 : 0.9;
                const imageDataUrl = canvas.toDataURL('image/jpeg', quality);
                
                // Display image
                element.innerHTML = `
                    <div style="position: relative; display: inline-block; max-width: 100%;">
                        <img src="${imageDataUrl}" 
                             style="max-width: 100%; height: auto; border-radius: 8px; display: block;"
                             alt="${file.name}">
                        <button onclick="removeImage(this)" 
                                style="position: absolute; top: 8px; right: 8px; 
                                       background: rgba(239, 68, 68, 0.9); color: white; 
                                       border: none; border-radius: 4px; padding: 6px 10px; 
                                       cursor: pointer; font-size: 12px; font-weight: 600;">
                            🗑️ Eltávolítás
                        </button>
                    </div>
                `;
                
                // Save document if in document context
                if (currentDocumentId) {
                    documents[currentDocumentId].updatedAt = Date.now();
                    saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
                }
            };
            
            img.onerror = function() {
                element.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;">❌ Hiba a kép betöltésekor</div>';
            };
            
            img.src = event.target.result;
        };
        
        reader.onerror = function() {
            element.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;">❌ Hiba a fájl olvasásakor</div>';
        };
        
        reader.readAsDataURL(file);
    };
    
    input.click();
}

/**
 * Remove image from block
 * @param {HTMLElement} button - Remove button element
 */
function removeImage(button) {
    if (!confirm('Biztosan eltávolítja ezt a képet?')) return;
    
    const container = button.closest('.image-upload-area, div[style*="position: relative"]')?.parentElement;
    if (container) {
        container.innerHTML = '<div class="image-upload-area" onclick="uploadImage(this)" style="border: 2px dashed #ccc; padding: 40px; text-align: center; cursor: pointer; border-radius: 8px;">📷 Kattintson a kép feltöltéséhez</div>';
        
        // Save document if in document context
        if (currentDocumentId) {
            documents[currentDocumentId].updatedAt = Date.now();
            saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
        }
    }
}

// ==================== INITIALIZATION ON PAGE LOAD ====================

/**
 * Show notification toast message
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info', 'warning'
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Handle keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S - Save document
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (currentDocumentId) {
                documents[currentDocumentId].updatedAt = Date.now();
                saveToStorage(`document_${currentDocumentId}`, documents[currentDocumentId]);
                showNotification('✅ Dokumentum mentve', 'success');
            }
        }
        
        // Ctrl/Cmd + N - New document
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            createNewDocument();
            showNotification('📄 Új dokumentum létrehozva', 'success');
        }
        
        // Ctrl/Cmd + E - Export to Word
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            if (currentDocumentId) {
                exportToWord();
            } else {
                showNotification('⚠️ Nincs megnyitott dokumentum', 'warning');
            }
        }
    });
}

window.addEventListener('DOMContentLoaded', initApp);

/**
 * State Module - Centralized state management
 * Part of HACCP-CMR Documentation Builder v2.2.0
 */

const StateModule = (function() {
    'use strict';
    
    // ==================== PRIVATE STATE ====================
    
    let state = {
        // Current document
        currentDocumentId: null,
        
        // Data collections
        documents: {},
        clients: {},
        templates: {},
        groups: {},
        
        // Counters
        groupCounter: 0,
        blockCounter: 0,
        
        // Editor state
        currentEditingBlock: null,
        editingClientId: null,
        editingGroupId: null,
        blockEditorQuill: null,
        
        // Inline editor state
        activeBlockEditor: null,
        activeBlockId: null,
        activeBlockIndex: null,
        blockEditorSaveTimeout: null,
        
        // Drag and drop
        draggedType: null,
        draggedElement: null,
        
        // UI state
        currentTab: 'documents'
    };
    
    // State change listeners
    const listeners = new Map();
    
    // ==================== PUBLIC API ====================
    
    /**
     * Get entire state (read-only)
     * @returns {Object} Current state
     */
    function getState() {
        return { ...state };
    }
    
    /**
     * Get specific state value
     * @param {string} key - State key
     * @returns {any} State value
     */
    function get(key) {
        return state[key];
    }
    
    /**
     * Set specific state value
     * @param {string} key - State key
     * @param {any} value - New value
     * @param {boolean} notify - Whether to notify listeners
     */
    function set(key, value, notify = true) {
        const oldValue = state[key];
        state[key] = value;
        
        if (notify && oldValue !== value) {
            notifyListeners(key, value, oldValue);
        }
    }
    
    /**
     * Update multiple state values
     * @param {Object} updates - Key-value pairs to update
     * @param {boolean} notify - Whether to notify listeners
     */
    function update(updates, notify = true) {
        Object.keys(updates).forEach(key => {
            set(key, updates[key], false);
        });
        
        if (notify) {
            notifyListeners('*', state, null);
        }
    }
    
    /**
     * Reset state to initial values
     */
    function reset() {
        state = {
            currentDocumentId: null,
            documents: {},
            clients: {},
            templates: {},
            groups: {},
            groupCounter: 0,
            blockCounter: 0,
            currentEditingBlock: null,
            editingClientId: null,
            editingGroupId: null,
            blockEditorQuill: null,
            activeBlockEditor: null,
            activeBlockId: null,
            activeBlockIndex: null,
            blockEditorSaveTimeout: null,
            draggedType: null,
            draggedElement: null,
            currentTab: 'documents'
        };
        
        notifyListeners('*', state, null);
    }
    
    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch (or '*' for all)
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    function subscribe(key, callback) {
        if (!listeners.has(key)) {
            listeners.set(key, []);
        }
        
        listeners.get(key).push(callback);
        
        // Return unsubscribe function
        return function unsubscribe() {
            const callbacks = listeners.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }
    
    /**
     * Notify listeners of state change
     * @private
     * @param {string} key - Changed key
     * @param {any} newValue - New value
     * @param {any} oldValue - Old value
     */
    function notifyListeners(key, newValue, oldValue) {
        // Notify specific key listeners
        if (listeners.has(key)) {
            listeners.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error('Error in state listener:', error);
                }
            });
        }
        
        // Notify wildcard listeners
        if (key !== '*' && listeners.has('*')) {
            listeners.get('*').forEach(callback => {
                try {
                    callback(state, null, key);
                } catch (error) {
                    console.error('Error in state listener:', error);
                }
            });
        }
    }
    
    // ==================== HELPER FUNCTIONS ====================
    
    /**
     * Get current document
     * @returns {Object|null} Current document
     */
    function getCurrentDocument() {
        return state.currentDocumentId ? state.documents[state.currentDocumentId] : null;
    }
    
    /**
     * Get all documents as array
     * @returns {Array} Documents array
     */
    function getDocumentsArray() {
        return Object.values(state.documents);
    }
    
    /**
     * Get all clients as array
     * @returns {Array} Clients array
     */
    function getClientsArray() {
        return Object.values(state.clients);
    }
    
    /**
     * Get all templates as array
     * @returns {Array} Templates array
     */
    function getTemplatesArray() {
        return Object.values(state.templates);
    }
    
    /**
     * Get all groups as array
     * @returns {Array} Groups array
     */
    function getGroupsArray() {
        return Object.values(state.groups);
    }
    
    // ==================== INITIALIZATION ====================
    
    console.log('✅ State module loaded');
    
    // ==================== PUBLIC API ====================
    
    return {
        // Core state methods
        getState,
        get,
        set,
        update,
        reset,
        subscribe,
        
        // Helper methods
        getCurrentDocument,
        getDocumentsArray,
        getClientsArray,
        getTemplatesArray,
        getGroupsArray
    };
    
})();

// Export to global scope
window.StateModule = StateModule;

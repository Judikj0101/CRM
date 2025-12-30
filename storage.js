/**
 * Storage Module - localStorage wrapper with error handling
 * Part of HACCP-CMR Documentation Builder v2.2.0
 */

const StorageModule = (function() {
    'use strict';
    
    const STORAGE_PREFIX = 'haccp_cmr_';
    
    // ==================== PUBLIC API ====================
    
    /**
     * Save data to localStorage
     * @param {string} key - Storage key (without prefix)
     * @param {any} data - Data to store
     * @returns {boolean} Success status
     */
    function save(key, data) {
        try {
            const fullKey = STORAGE_PREFIX + key;
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            if (error.name === 'QuotaExceededError') {
                if (window.showNotification) {
                    window.showNotification(
                        'Nincs elég tárhely! Kérjük, töröljön néhány dokumentumot vagy készítsen biztonsági mentést.',
                        'error'
                    );
                } else {
                    alert('Nincs elég tárhely! Kérjük, töröljön néhány dokumentumot vagy készítsen biztonsági mentést.');
                }
            }
            return false;
        }
    }
    
    /**
     * Load data from localStorage
     * @param {string} key - Storage key (without prefix)
     * @returns {any} Stored data or null
     */
    function load(key) {
        try {
            const fullKey = STORAGE_PREFIX + key;
            const item = localStorage.getItem(fullKey);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return null;
        }
    }
    
    /**
     * Remove data from localStorage
     * @param {string} key - Storage key (without prefix)
     * @returns {boolean} Success status
     */
    function remove(key) {
        try {
            const fullKey = STORAGE_PREFIX + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    }
    
    /**
     * Clear all app data from localStorage
     * @returns {boolean} Success status
     */
    function clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
    
    /**
     * Get storage usage statistics
     * @returns {Object} Storage usage information
     */
    function getUsageStats() {
        try {
            let totalSize = 0;
            const keys = Object.keys(localStorage);
            
            keys.forEach(key => {
                if (key.startsWith(STORAGE_PREFIX)) {
                    const item = localStorage.getItem(key);
                    totalSize += item ? item.length : 0;
                }
            });
            
            // Approximate size in MB (UTF-16 = 2 bytes per character)
            const sizeInMB = (totalSize * 2) / (1024 * 1024);
            const maxSizeMB = 5; // Typical localStorage limit
            const percentUsed = (sizeInMB / maxSizeMB) * 100;
            
            return {
                usedMB: sizeInMB.toFixed(2),
                maxMB: maxSizeMB,
                percentUsed: percentUsed.toFixed(1),
                itemCount: keys.filter(k => k.startsWith(STORAGE_PREFIX)).length,
                isNearLimit: percentUsed > 80
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return null;
        }
    }
    
    /**
     * Check if localStorage is available
     * @returns {boolean} Availability status
     */
    function isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Export all app data for backup
     * @returns {Object} All app data
     */
    function exportAll() {
        const data = {};
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                const shortKey = key.replace(STORAGE_PREFIX, '');
                data[shortKey] = load(shortKey);
            }
        });
        
        return data;
    }
    
    /**
     * Import app data from backup
     * @param {Object} data - Data to import
     * @returns {boolean} Success status
     */
    function importAll(data) {
        try {
            Object.keys(data).forEach(key => {
                save(key, data[key]);
            });
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
    
    // ==================== INITIALIZATION ====================
    
    console.log('✅ Storage module loaded');
    
    // ==================== PUBLIC API ====================
    
    return {
        save,
        load,
        remove,
        clearAll,
        getUsageStats,
        isAvailable,
        exportAll,
        importAll
    };
    
})();

// Export to global scope
window.StorageModule = StorageModule;

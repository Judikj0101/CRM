/**
 * Utils Module - Common utility functions
 * Part of HACCP-CMR Documentation Builder v2.2.0
 */

const UtilsModule = (function() {
    'use strict';
    
    // ==================== DEBOUNCE ====================
    
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // ==================== DATE FORMATTING ====================
    
    /**
     * Format date to Hungarian locale
     * @param {number|Date} date - Date to format
     * @returns {string} Formatted date
     */
    function formatDate(date) {
        if (!date) return '—';
        
        const d = typeof date === 'number' ? new Date(date) : date;
        
        return d.toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Format date as relative time (e.g., "2 napja")
     * @param {number|Date} date - Date to format
     * @returns {string} Relative time string
     */
    function formatRelativeTime(date) {
        if (!date) return '—';
        
        const d = typeof date === 'number' ? new Date(date) : date;
        const now = new Date();
        const diffMs = now - d;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) return 'Most';
        if (diffMin < 60) return `${diffMin} perce`;
        if (diffHour < 24) return `${diffHour} órája`;
        if (diffDay === 1) return 'Tegnap';
        if (diffDay < 7) return `${diffDay} napja`;
        
        return formatDate(d);
    }
    
    // ==================== STRING UTILITIES ====================
    
    /**
     * Truncate string to max length
     * @param {string} str - String to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated string
     */
    function truncate(str, maxLength) {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    }
    
    /**
     * Generate unique ID
     * @param {string} prefix - ID prefix
     * @returns {string} Unique ID
     */
    function generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Sanitize filename
     * @param {string} filename - Original filename
     * @returns {string} Safe filename
     */
    function sanitizeFilename(filename) {
        return filename
            .replace(/[^a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ\s_-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 100);
    }
    
    // ==================== NUMBER UTILITIES ====================
    
    /**
     * Format number with thousands separator
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    function formatNumber(num) {
        if (typeof num !== 'number') return num;
        return num.toLocaleString('hu-HU');
    }
    
    /**
     * Format bytes to human readable
     * @param {number} bytes - Bytes
     * @returns {string} Formatted size
     */
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // ==================== ARRAY UTILITIES ====================
    
    /**
     * Move array element
     * @param {Array} arr - Array
     * @param {number} from - From index
     * @param {number} to - To index
     * @returns {Array} New array
     */
    function moveArrayElement(arr, from, to) {
        const newArr = [...arr];
        const element = newArr.splice(from, 1)[0];
        newArr.splice(to, 0, element);
        return newArr;
    }
    
    /**
     * Remove duplicates from array
     * @param {Array} arr - Array
     * @returns {Array} Array without duplicates
     */
    function unique(arr) {
        return [...new Set(arr)];
    }
    
    // ==================== OBJECT UTILITIES ====================
    
    /**
     * Deep clone object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => deepClone(item));
        
        const clonedObj = {};
        Object.keys(obj).forEach(key => {
            clonedObj[key] = deepClone(obj[key]);
        });
        
        return clonedObj;
    }
    
    /**
     * Check if object is empty
     * @param {Object} obj - Object to check
     * @returns {boolean} Is empty
     */
    function isEmpty(obj) {
        if (!obj) return true;
        return Object.keys(obj).length === 0;
    }
    
    // ==================== DOM UTILITIES ====================
    
    /**
     * Create element with attributes
     * @param {string} tag - Tag name
     * @param {Object} attrs - Attributes
     * @param {string} content - Inner HTML
     * @returns {HTMLElement} Created element
     */
    function createElement(tag, attrs = {}, content = '') {
        const el = document.createElement(tag);
        
        Object.keys(attrs).forEach(key => {
            if (key === 'className') {
                el.className = attrs[key];
            } else if (key === 'dataset') {
                Object.keys(attrs[key]).forEach(dataKey => {
                    el.dataset[dataKey] = attrs[key][dataKey];
                });
            } else {
                el.setAttribute(key, attrs[key]);
            }
        });
        
        if (content) {
            el.innerHTML = content;
        }
        
        return el;
    }
    
    // ==================== VALIDATION ====================
    
    /**
     * Validate email
     * @param {string} email - Email address
     * @returns {boolean} Is valid
     */
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    /**
     * Validate Hungarian tax number
     * @param {string} taxNumber - Tax number
     * @returns {boolean} Is valid
     */
    function isValidHungarianTaxNumber(taxNumber) {
        const re = /^\d{8}-\d-\d{2}$/;
        return re.test(taxNumber);
    }
    
    // ==================== INITIALIZATION ====================
    
    console.log('✅ Utils module loaded');
    
    // ==================== PUBLIC API ====================
    
    return {
        // Function utilities
        debounce,
        
        // Date utilities
        formatDate,
        formatRelativeTime,
        
        // String utilities
        truncate,
        generateId,
        sanitizeFilename,
        
        // Number utilities
        formatNumber,
        formatBytes,
        
        // Array utilities
        moveArrayElement,
        unique,
        
        // Object utilities
        deepClone,
        isEmpty,
        
        // DOM utilities
        createElement,
        
        // Validation
        isValidEmail,
        isValidHungarianTaxNumber
    };
    
})();

// Export to global scope
window.UtilsModule = UtilsModule;

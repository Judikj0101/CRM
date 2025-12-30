/**
 * Sanitizer Module - Input sanitization for XSS protection
 * Part of HACCP-CMR Documentation Builder v2.2.0
 * Requires: DOMPurify library
 */

const SanitizerModule = (function() {
    'use strict';
    
    // ==================== CONFIGURATION ====================
    
    const HTML_CONFIG = {
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'ul', 'ol', 'li',
            'strong', 'em', 'u', 's', 'strike',
            'a', 'span', 'div',
            'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: [
            'href', 'target', 'rel',
            'class', 'style',
            'src', 'alt', 'width', 'height',
            'colspan', 'rowspan'
        ],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
    };
    
    // ==================== PUBLIC API ====================
    
    /**
     * Sanitize HTML content
     * @param {string} dirty - Unsanitized HTML
     * @param {Object} config - Custom DOMPurify config (optional)
     * @returns {string} Sanitized HTML
     */
    function html(dirty, config = null) {
        if (!dirty) return '';
        
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(dirty, config || HTML_CONFIG);
        }
        
        console.warn('DOMPurify not loaded, sanitization skipped!');
        return dirty;
    }
    
    /**
     * Sanitize plain text (escape HTML entities)
     * @param {string} text - Plain text
     * @returns {string} Escaped text
     */
    function text(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Sanitize object attributes recursively
     * @param {Object} obj - Object to sanitize
     * @returns {Object} Sanitized object
     */
    function object(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        
        const clean = Array.isArray(obj) ? [] : {};
        
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            
            if (typeof value === 'string') {
                clean[key] = text(value);
            } else if (typeof value === 'object' && value !== null) {
                clean[key] = object(value);
            } else {
                clean[key] = value;
            }
        });
        
        return clean;
    }
    
    /**
     * Sanitize URL
     * @param {string} url - URL to sanitize
     * @returns {string} Sanitized URL
     */
    function url(url) {
        if (!url) return '';
        
        // Remove javascript: protocol and other dangerous protocols
        const dangerous = /^(javascript|data|vbscript|file):/i;
        if (dangerous.test(url)) {
            return '';
        }
        
        return text(url);
    }
    
    /**
     * Sanitize filename
     * @param {string} filename - Filename to sanitize
     * @returns {string} Safe filename
     */
    function filename(filename) {
        if (!filename) return '';
        
        return filename
            .replace(/[^a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ\s._-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 255);
    }
    
    /**
     * Sanitize for use in HTML attribute
     * @param {string} value - Attribute value
     * @returns {string} Safe attribute value
     */
    function attribute(value) {
        if (!value) return '';
        
        return value
            .replace(/['"<>&]/g, (match) => {
                const map = {
                    '"': '&quot;',
                    "'": '&#39;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '&': '&amp;'
                };
                return map[match];
            });
    }
    
    /**
     * Strip all HTML tags
     * @param {string} html - HTML string
     * @returns {string} Plain text
     */
    function stripHtml(html) {
        if (!html) return '';
        
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }
    
    /**
     * Check if string contains potential XSS
     * @param {string} input - Input to check
     * @returns {boolean} Contains potential XSS
     */
    function containsXss(input) {
        if (!input) return false;
        
        const xssPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,  // onclick, onload, etc.
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /eval\(/i,
            /expression\(/i
        ];
        
        return xssPatterns.some(pattern => pattern.test(input));
    }
    
    /**
     * Sanitize CSS (remove potentially dangerous styles)
     * @param {string} css - CSS string
     * @returns {string} Safe CSS
     */
    function css(css) {
        if (!css) return '';
        
        // Remove expressions and imports
        return css
            .replace(/expression\s*\(/gi, '')
            .replace(/@import/gi, '')
            .replace(/javascript:/gi, '');
    }
    
    // ==================== BATCH OPERATIONS ====================
    
    /**
     * Sanitize array of strings
     * @param {Array} arr - Array of strings
     * @param {Function} sanitizeFn - Sanitization function
     * @returns {Array} Sanitized array
     */
    function batch(arr, sanitizeFn = text) {
        if (!Array.isArray(arr)) return arr;
        return arr.map(item => sanitizeFn(item));
    }
    
    // ==================== INITIALIZATION ====================
    
    // Check if DOMPurify is loaded
    if (typeof DOMPurify === 'undefined') {
        console.warn('⚠️ DOMPurify not loaded! HTML sanitization will be disabled.');
    } else {
        console.log('✅ Sanitizer module loaded (DOMPurify available)');
    }
    
    // ==================== PUBLIC API ====================
    
    return {
        // Sanitization methods
        html,
        text,
        object,
        url,
        filename,
        attribute,
        css,
        stripHtml,
        
        // Validation
        containsXss,
        
        // Batch operations
        batch,
        
        // Configuration
        getHtmlConfig: () => ({ ...HTML_CONFIG })
    };
    
})();

// Export to global scope
window.SanitizerModule = SanitizerModule;

// Also export as Sanitizer for backward compatibility
window.Sanitizer = SanitizerModule;

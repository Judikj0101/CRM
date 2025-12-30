/**
 * Event Module - Event delegation and cleanup
 * Part of HACCP-CMR Documentation Builder v2.2.0
 */

const EventModule = (function() {
    'use strict';
    
    // ==================== EVENT CLEANUP CLASS ====================
    
    /**
     * Event listener cleanup to prevent memory leaks
     */
    class EventCleanup {
        constructor(name = 'default') {
            this.name = name;
            this.listeners = [];
        }
        
        /**
         * Add event listener with tracking
         * @param {Element} element - DOM element
         * @param {string} event - Event name
         * @param {Function} handler - Event handler
         * @param {Object} options - Event options
         */
        add(element, event, handler, options) {
            element.addEventListener(event, handler, options);
            this.listeners.push({ element, event, handler, options });
        }
        
        /**
         * Remove all tracked event listeners
         */
        removeAll() {
            this.listeners.forEach(({ element, event, handler, options }) => {
                try {
                    element.removeEventListener(event, handler, options);
                } catch (e) {
                    console.warn(`Failed to remove listener (${this.name}):`, e);
                }
            });
            this.listeners = [];
        }
        
        /**
         * Remove specific event listener
         * @param {Element} element - DOM element
         * @param {string} event - Event name
         * @param {Function} handler - Event handler
         */
        remove(element, event, handler) {
            const index = this.listeners.findIndex(l => 
                l.element === element && 
                l.event === event && 
                l.handler === handler
            );
            
            if (index !== -1) {
                const listener = this.listeners[index];
                try {
                    listener.element.removeEventListener(listener.event, listener.handler, listener.options);
                } catch (e) {
                    console.warn(`Failed to remove listener (${this.name}):`, e);
                }
                this.listeners.splice(index, 1);
            }
        }
        
        /**
         * Get number of tracked listeners
         * @returns {number} Count
         */
        count() {
            return this.listeners.length;
        }
        
        /**
         * Clear all listeners without removing them
         */
        clear() {
            this.listeners = [];
        }
    }
    
    // ==================== EVENT REGISTRY ====================
    
    /**
     * Central event handler registry for event delegation
     */
    const EventRegistry = {
        handlers: new Map(),
        
        /**
         * Register an action handler
         * @param {string} action - Action name
         * @param {Function} handler - Handler function
         */
        register(action, handler) {
            this.handlers.set(action, handler);
        },
        
        /**
         * Unregister an action handler
         * @param {string} action - Action name
         */
        unregister(action) {
            this.handlers.delete(action);
        },
        
        /**
         * Handle an action
         * @param {string} action - Action name
         * @param {Object} params - Parameters
         * @param {Event} event - DOM event
         */
        handle(action, params, event) {
            const handler = this.handlers.get(action);
            if (handler) {
                try {
                    handler(params, event);
                } catch (error) {
                    console.error(`Error handling action "${action}":`, error);
                    if (window.NotificationsModule) {
                        window.NotificationsModule.error('Hiba történt. Próbálja újra.');
                    }
                }
            } else {
                console.warn('No handler registered for action:', action);
            }
        },
        
        /**
         * Check if action has handler
         * @param {string} action - Action name
         * @returns {boolean} Has handler
         */
        has(action) {
            return this.handlers.has(action);
        },
        
        /**
         * Get all registered actions
         * @returns {Array} Action names
         */
        getActions() {
            return Array.from(this.handlers.keys());
        },
        
        /**
         * Clear all handlers
         */
        clear() {
            this.handlers.clear();
        }
    };
    
    // ==================== GLOBAL CLEANUP INSTANCES ====================
    
    const globalCleanup = new EventCleanup('global');
    const modalCleanup = new EventCleanup('modals');
    const formCleanup = new EventCleanup('forms');
    
    // ==================== EVENT DELEGATION ====================
    
    /**
     * Initialize event delegation
     */
    function initEventDelegation() {
        const clickHandler = function(e) {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            
            const action = target.dataset.action;
            let params = {};
            
            try {
                params = target.dataset.params ? JSON.parse(target.dataset.params) : {};
            } catch (error) {
                console.error('Failed to parse action params:', error);
            }
            
            EventRegistry.handle(action, params, e);
        };
        
        globalCleanup.add(document, 'click', clickHandler);
        console.log('✅ Event delegation initialized');
    }
    
    // ==================== INITIALIZATION ====================
    
    console.log('✅ Event module loaded');
    
    // ==================== PUBLIC API ====================
    
    return {
        // Classes
        EventCleanup,
        
        // Registry
        registry: EventRegistry,
        
        // Cleanup instances
        globalCleanup,
        modalCleanup,
        formCleanup,
        
        // Delegation
        initEventDelegation,
        
        // Helper to create new cleanup instance
        createCleanup: (name) => new EventCleanup(name)
    };
    
})();

// Export to global scope
window.EventModule = EventModule;

// Export specific instances for backward compatibility
window.EventCleanup = EventModule.EventCleanup;
window.EventRegistry = EventModule.registry;
window.globalCleanup = EventModule.globalCleanup;
window.modalCleanup = EventModule.modalCleanup;
window.formCleanup = EventModule.formCleanup;

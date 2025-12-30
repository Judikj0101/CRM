/**
 * UI Module - Notifications
 * Part of HACCP-CMR Documentation Builder v2.2.0
 */

const NotificationsModule = (function() {
    'use strict';
    
    // ==================== CONFIGURATION ====================
    
    const DEFAULT_DURATION = 3000; // 3 seconds
    const TYPES = {
        success: { icon: '✅', color: '#10b981' },
        error: { icon: '❌', color: '#ef4444' },
        warning: { icon: '⚠️', color: '#f59e0b' },
        info: { icon: 'ℹ️', color: '#3b82f6' }
    };
    
    let notificationQueue = [];
    let currentNotification = null;
    
    // ==================== PRIVATE FUNCTIONS ====================
    
    /**
     * Create notification element
     * @private
     */
    function createNotificationElement(message, type, duration) {
        const config = TYPES[type] || TYPES.info;
        
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-left: 4px solid ${config.color};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 500px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        const icon = document.createElement('span');
        icon.textContent = config.icon;
        icon.style.fontSize = '20px';
        
        const text = document.createElement('span');
        text.textContent = message;
        text.style.cssText = 'flex: 1; color: #1f2937; font-size: 14px;';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
            color: #9ca3af;
            padding: 0;
            width: 24px;
            height: 24px;
        `;
        closeBtn.onclick = () => hideNotification(notification);
        
        notification.appendChild(icon);
        notification.appendChild(text);
        notification.appendChild(closeBtn);
        
        return notification;
    }
    
    /**
     * Hide notification
     * @private
     */
    function hideNotification(notification) {
        if (!notification || !notification.parentNode) return;
        
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            currentNotification = null;
            
            // Show next notification in queue
            if (notificationQueue.length > 0) {
                const next = notificationQueue.shift();
                showNotification(next.message, next.type, next.duration);
            }
        }, 300);
    }
    
    // ==================== PUBLIC API ====================
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {number} duration - Duration in ms (0 = no auto-hide)
     */
    function showNotification(message, type = 'info', duration = DEFAULT_DURATION) {
        // If notification is already showing, queue this one
        if (currentNotification) {
            notificationQueue.push({ message, type, duration });
            return;
        }
        
        const notification = createNotificationElement(message, type, duration);
        document.body.appendChild(notification);
        currentNotification = notification;
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                hideNotification(notification);
            }, duration);
        }
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    /**
     * Show success notification
     * @param {string} message - Message
     * @param {number} duration - Duration in ms
     */
    function success(message, duration) {
        showNotification(message, 'success', duration);
    }
    
    /**
     * Show error notification
     * @param {string} message - Message
     * @param {number} duration - Duration in ms
     */
    function error(message, duration) {
        showNotification(message, 'error', duration);
    }
    
    /**
     * Show warning notification
     * @param {string} message - Message
     * @param {number} duration - Duration in ms
     */
    function warning(message, duration) {
        showNotification(message, 'warning', duration);
    }
    
    /**
     * Show info notification
     * @param {string} message - Message
     * @param {number} duration - Duration in ms
     */
    function info(message, duration) {
        showNotification(message, 'info', duration);
    }
    
    /**
     * Hide current notification
     */
    function hide() {
        if (currentNotification) {
            hideNotification(currentNotification);
        }
    }
    
    /**
     * Clear notification queue
     */
    function clearQueue() {
        notificationQueue = [];
    }
    
    // ==================== INITIALIZATION ====================
    
    // Add animation styles if not present
    if (!document.getElementById('notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ Notifications module loaded');
    
    // ==================== PUBLIC API ====================
    
    return {
        show: showNotification,
        success,
        error,
        warning,
        info,
        hide,
        clearQueue
    };
    
})();

// Export to global scope
window.NotificationsModule = NotificationsModule;

// Also export as showNotification for backward compatibility
window.showNotification = NotificationsModule.show;

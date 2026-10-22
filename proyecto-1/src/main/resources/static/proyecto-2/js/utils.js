/**
 * =============================================================================
 * MULTIVERSE EXPLORER - UTILITIES MODULE (utils.js)
 * =============================================================================
 * Provides reusable helper functions:
 * 1. debounce(fn, delay): Delays execution until 'delay' ms of silence.
 * 2. throttle(fn, limit): Limits execution rate to once every 'limit' ms.
 * 3. escapeHtml(str): Sanitizes text for safe DOM rendering.
 * 4. formatId(id, padLength): Formats numeric IDs (e.g. #025).
 * =============================================================================
 */

(function (window) {
    'use strict';

    /**
     * Debounce helper
     * Ensures that the provided function is only called after the specified delay
     * has elapsed since the last time it was invoked.
     *
     * @param {Function} func - The target function to debounce.
     * @param {number} delay - Delay in milliseconds (e.g. 4000ms).
     * @returns {Function} Debounced function with a .cancel() method.
     */
    function debounce(func, delay = 4000) {
        let timerId = null;

        const debounced = function (...args) {
            const context = this;
            if (timerId !== null) {
                clearTimeout(timerId);
            }
            timerId = setTimeout(() => {
                func.apply(context, args);
                timerId = null;
            }, delay);
        };

        // Allows manual cancellation of pending execution
        debounced.cancel = function () {
            if (timerId !== null) {
                clearTimeout(timerId);
                timerId = null;
            }
        };

        return debounced;
    }

    /**
     * Throttle helper
     * Guarantees that the wrapped function is executed at most once
     * within the specified interval, ignoring spam calls.
     *
     * @param {Function} func - The function to throttle.
     * @param {number} limit - Interval in milliseconds (e.g. 500ms).
     * @returns {Function} Throttled function.
     */
    function throttle(func, limit = 500) {
        let inThrottle = false;
        let lastRan = 0;

        return function (...args) {
            const context = this;
            const now = Date.now();

            if (!inThrottle) {
                func.apply(context, args);
                lastRan = now;
                inThrottle = true;

                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    /**
     * Sanitizes strings to prevent XSS injection in HTML.
     *
     * @param {string} str - Raw string.
     * @returns {string} Escaped string.
     */
    function escapeHtml(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Formats an ID with leading zeros (e.g., 25 -> #025).
     *
     * @param {number|string} id - Identifier.
     * @param {number} padLength - Desired string length.
     * @returns {string} Formatted ID.
     */
    function formatId(id, padLength = 3) {
        return '#' + String(id).padStart(padLength, '0');
    }

    // Expose utilities on global namespace
    window.AppUtils = {
        debounce,
        throttle,
        escapeHtml,
        formatId
    };

})(window);

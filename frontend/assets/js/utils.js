// Shared utilities
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Display error message in form
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        // Auto hide after 5 seconds
        setTimeout(() => element.style.display = 'none', 5000);
    }
}

// Display success message in form
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        // Auto hide after 5 seconds
        setTimeout(() => element.style.display = 'none', 5000);
    }
}

// Export for ES modules fallback (some scripts import this)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { escapeHtml, showError, showSuccess };
}

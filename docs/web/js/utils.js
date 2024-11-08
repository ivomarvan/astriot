

/**
 * Function to get debug mode from URL
 * @param {string} denugParamName - name of the parameter in URL
 * @returns {boolean} - debug mode
 */
export function getDebugModeFromUrl(denugParamName='debugMode') {
    // reading from URL
    const params = new URLSearchParams(window.location.search);
    const debugParam = params.get(denugParamName);
    let debugMode = false;

    // setting debugMode by parameter from URL
    if (debugParam !== null) {
         // conversion to boolean
        debugMode = debugParam.toLowerCase() === 'true' || debugParam === '1';
    }
    return debugMode;
} // getDebugModeFromUrl
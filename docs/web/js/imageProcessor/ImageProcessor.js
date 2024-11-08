// ImageProcessor.js
export default class ImageProcessor {
    constructor(name='EmptyImageProcessor', options = {}) {
        this.name = name;        // Name of the processor
        this.options = options;  // Parameters for the processor
        this._initialized = false; // Flag indicating if the processor is initialized
        this._cost = 0; // Default cost is 0
    }

    async init() {
        if (!this._initialized) {
            await this.initialize();  // Call initialize if not already done
            this._initialized = true;
        }
    }

    async release() {
        if (this._initialized) {
            await this.releaseFromMemory(); // Ensure async in case cleanup is needed
            this._initialized = false;
        }
    }

    isInitialized() {
        return this._initialized;
    }

    // Initialize the processor (default does nothing)
    initialize() {
        // No initialization needed for default processor
    }

    // Release the processor from memory (default does nothing)
    releaseFromMemory() {
        // No cleanup needed for default processor
    }

    // Process a single frame and return data like landmarks, etc.
    async videoToStructuredData(video, currentTime) {
        return {};
    }

    // Draw the text data onto the image data
    drawTextDataToImageData(structuredData, canvasContext, isMirrored) {
        // Default does nothing
    }

    getCost() {
        return this._cost;
    }

    registerCost() {}

    mirrorLandmarks(landmarks) {
        if (Array.isArray(landmarks) && landmarks.length > 0) {
            // Check if the first element is an array
            if (Array.isArray(landmarks[0])) {
                //Array of arrays
                return landmarks.map(subArray => 
                    subArray.map(point => ({
                        ...point,
                        x: 1 - point.x
                    }))
                );
            } else {
                // Simple array of objects
                return landmarks.map(point => ({
                    ...point,
                    x: 1 - point.x
                }));
            }
        }
        return landmarks; // If not an array, return as is
    }
    

    getLandmarks(landmarks, isMirrored) {
        return isMirrored ? this.mirrorLandmarks(landmarks) : landmarks;
    }
    
} // ImageProcessor

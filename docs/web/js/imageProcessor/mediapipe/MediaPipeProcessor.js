// MediaPipeProcessor.js
import ImageProcessor from './js/imageProcessor/ImageProcessor.js';
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FilesetResolver, DrawingUtils } = vision;



export default class MediaPipeProcessor extends ImageProcessor {
    constructor(name, landmarkerClass, options = {}) {
        super(name, options);
        this.visionTaskRunnerClass = landmarkerClass;
        this.filesetResolver = null;
        this.drawingUtils = null;
        this.baseUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    }

    // Initialize the FilesetResolver
    async initializeFilesetResolver() {
        this.filesetResolver = await FilesetResolver.forVisionTasks(this.baseUrl);
    }


    // Initialize DrawingUtils
    initializeDrawingUtils(canvasContext) {
        if (!this.drawingUtils) {
            this.drawingUtils = new DrawingUtils(canvasContext);
        }
    }

    // Release MediaPipe resources
    async releaseFromMemory() {
        if (this.visionTaskRunner) {
            await this.visionTaskRunner.close();
            this.visionTaskRunner = null;
        }
        this.drawingUtils = null;
        this.filesetResolver = null;
    }

    // Implement the method to create the specific landmarker using the passed class
    async createTaskRunner() {
        return await this.visionTaskRunnerClass.createFromOptions(this.filesetResolver, this.options);
    }

    // Initialize the landmarker
    async initialize() {
        if (!this.filesetResolver) {
            await this.initializeFilesetResolver();
        }
        this.visionTaskRunner = await this.createTaskRunner();
        console.log(`${this.name} initialized successfully.`);
    }

    // Process video frame
    async videoToStructuredData(video, currentTime) {
        if (!this.visionTaskRunner) {
            throw new Error(`${this.name} is not initialized.`);
        }
        return await this.visionTaskRunner.detectForVideo(video, currentTime);
    }

    // count the size of the model
    async getModelSizeMB(modelAssetPath) {
        try {
            const response = await fetch(modelAssetPath, { method: "HEAD" });
            const size = response.headers.get("Content-Length");
            return size ? parseInt(size, 10) / (1024 * 1024) : 0; // Convert bytes to MB
        } catch (error) {
            console.warn(`Failed to fetch model size for ${modelAssetPath}:`, error);
            return 0;
        }
    }

    async registerCost() {
        if (this.options?.baseOptions?.modelAssetPath) {
            this._cost = await this.getModelSizeMB(this.options.baseOptions.modelAssetPath);
            console.log(`Dynamically imported class "${this.name}", cost: ${this.getCost()} MB`);
        }
    }

} // MediaPipeProcessor


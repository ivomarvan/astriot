export default class FpsCounter {
    constructor() {
        this._lastRegTime = null;
        this._frameCount = 0;
    }
    
    registrateFrame(performenceCurrentTime) {
        if (!this._lastRegTime) {
            this._lastRegTime = performenceCurrentTime;
        }
        this._frameCount++;
    }

    getLastFps() {
        const now = performance.now();
        
        // Kopie hodnot, aby nedošlo ke konfliktu s registrateFrame
        const elapsedMs = now - this._lastRegTime;
        const frameCountCopy = this._frameCount;
        
        let fps = 0;
        if (this._lastRegTime && elapsedMs > 0) {            
            fps = (1000 * frameCountCopy) / elapsedMs;
        }
        
        // Reset počítadel až po výpočtu
        this._lastRegTime = now;
        this._frameCount = 0;

        return fps;
    }
} // class FpsCounter
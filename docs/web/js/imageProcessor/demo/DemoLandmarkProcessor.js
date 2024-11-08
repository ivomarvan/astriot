// DemoLandmarkProcessor.js
import ImageProcessor from '/js/imageProcessor/ImageProcessor.js';

export default class DemoLandmarkProcessor extends ImageProcessor {
    constructor(options = {}) {
        super('DemoLandmarkProcessor', options); // Přidání názvu procesoru
    }

    // Generuje náhodné body (landmarks) s relativními souřadnicemi (0-1)
    async videoToStructuredData(video, currentTime) {
        const landmarks = [];
        for (let i = 0; i < 5; i++) {
            const x = (Math.random()).toFixed(2); // Náhodná hodnota 0-1 (2 desetinná místa)
            const y = (Math.random()).toFixed(2);
            landmarks.push({ x: parseFloat(x), y: parseFloat(y) });
        }
        return { landmarks }; // Vrací objekt s náhodnými body
    }

    // Implementace zpracování jednoho snímku
    drawTextDataToImageData(structuredData, canvasContext, isMirrored) {
        let landmarks = structuredData.landmarks; // Získání landmarků

        if (isMirrored) {
            landmarks = landmarks.map(point => ({
                ...point,
                x: 1 - point.x
            }));
        }

        
        // Nastavení stylu čar
        canvasContext.strokeStyle = 'red';
        canvasContext.lineWidth = 3; // Tlustá čára

        // Zahájení vykreslování spojnic
        canvasContext.beginPath();
        canvasContext.moveTo(landmarks[0].x * canvasContext.canvas.width, landmarks[0].y * canvasContext.canvas.height); // První bod

        // Procházení a spojování všech bodů
        for (let i = 1; i < landmarks.length; i++) {
            canvasContext.lineTo(landmarks[i].x * canvasContext.canvas.width, landmarks[i].y * canvasContext.canvas.height);
        }

        canvasContext.stroke(); // Vykreslení čar
        canvasContext.closePath();

    } // drawTextDataToImageData
} // DemoLandmarkProcessor

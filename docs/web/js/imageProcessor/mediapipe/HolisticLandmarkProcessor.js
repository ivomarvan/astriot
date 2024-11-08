// HolisticLandmarkProcessor.js
import MediaPipeProcessor from "./js/imageProcessor/mediapipe/MediaPipeProcessor.js";
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { HolisticLandmarker } = vision;


export default class HolisticLandmarkProcessor extends MediaPipeProcessor {
    constructor(options = {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task`,
            delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHolistics: 1,
    }) {
        super("HolisticLandmarkProcessor", HolisticLandmarker, options); // Pass HolisticLandmarker
    }

    // Override drawTextDataToImageData to handle holistic landmarks
    drawTextDataToImageData(structuredData, canvasContext, isMirrored) {
        this.initializeDrawingUtils(canvasContext);

        let landmarks = structuredData.holisticLandmarks[0] || [];

        if (!landmarks || landmarks.length === 0) return;

        landmarks = this.getLandmarks(landmarks, isMirrored);

        // Příklad vykreslování spojnic, upravte podle skutečných konekcí
        /* this.drawingUtils.drawConnectors(
            landmarks,
            HOLISTIC_CONNECTIONS,
            { color: "#FFFFFF", lineWidth: 2 }
        ); */

        // Vykreslení landmarků
        this.drawingUtils.drawLandmarks(landmarks, {
            color: "#FF0000",
            lineWidth: 1,
        });
    }
}

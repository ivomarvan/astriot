// HandsLandmarkProcessor.js
import MediaPipeProcessor from "/js/imageProcessor/mediapipe/MediaPipeProcessor.js";
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { HandLandmarker } = vision;

export default class HandsLandmarkProcessor extends MediaPipeProcessor {
  constructor(
    options = {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
    }
  ) {
    super("HandsLandmarkProcessor", HandLandmarker, options);
  }


  drawTextDataToImageData(structuredData, canvasContext, isMirrored) {
    this.initializeDrawingUtils(canvasContext);

    if (structuredData.landmarks && Array.isArray(structuredData.landmarks)) {
      for (let i = 0; i < structuredData.landmarks.length; i++) {
        let landmarks = structuredData.landmarks[i];

        landmarks = this.getLandmarks(landmarks, isMirrored);

        const handedness = structuredData.handednesses[i][0].categoryName; // "Left" nebo "Right"

        // Nastavíme barvu podle toho, zda jde o levou nebo pravou ruku
        const color = handedness === "Left" ? "#0000FF" : "#00FF00"; // Modrá pro levou, zelená pro pravou ruku

        this.drawingUtils.drawConnectors(
          landmarks,
          HandLandmarker.HAND_CONNECTIONS,
          {
            color: color,
            lineWidth: 5,
          }
        );

        this.drawingUtils.drawLandmarks(landmarks, {
          color: "#FF0000",
          lineWidth: 1,
        });
      }
    } else {
      console.warn("No landmarks detected or invalid format");
    }
  } // drawTextDataToImageData
}

// PoseLandmarkProcessor.js
import MediaPipeProcessor from "/js/imageProcessor/mediapipe/MediaPipeProcessor.js";
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { PoseLandmarker, DrawingUtils } = vision;

export default class PoseLandmarkProcessor extends MediaPipeProcessor {
  constructor(
    options = {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
    }
  ) {
    super("PoseLandmarkProcessor", PoseLandmarker, options);
  }

  // Override drawTextDataToImageData to handle face landmarks
  drawTextDataToImageData(structuredData, canvasContext, isMirrored) {
    this.initializeDrawingUtils(canvasContext);

    let landmarks = structuredData.landmarks || [];

    if (!landmarks || landmarks.length === 0) return;

    landmarks = this.getLandmarks(landmarks, isMirrored);

    for (const landmark of landmarks) {
      this.drawingUtils.drawLandmarks(landmark, {
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
      });
      this.drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    }
  } // drawTextDataToImageData
} // PoseLandmarkProcessor

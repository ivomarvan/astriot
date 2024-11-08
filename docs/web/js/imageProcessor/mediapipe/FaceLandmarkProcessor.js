// FaceLandmarkProcessor.js
import MediaPipeProcessor from "./js/imageProcessor/mediapipe/MediaPipeProcessor.js";
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker } = vision;

console.log(FaceLandmarker);

export default class FaceLandmarkProcessor extends MediaPipeProcessor {
  constructor(
    options = {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    }
  ) {
    super("FaceLandmarkProcessor", FaceLandmarker, options);
  }

  // Override drawTextDataToImageData to handle face landmarks
  drawTextDataToImageData(structuredData, canvasContext, isMirrored) {
    this.initializeDrawingUtils(canvasContext);

    let landmarks = structuredData.faceLandmarks[0] || [];

    if (!landmarks || landmarks.length === 0) return;

    landmarks = this.getLandmarks(landmarks, isMirrored);

    this.drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      { color: "#C0C0C070", lineWidth: 1 }
    );
    this.drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      { color: "#FF3030" }
    );
    this.drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      { color: "#FF3030" }
    );
    this.drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      { color: "#30FF30" }
    );
    this.drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      { color: "#30FF30" }
    );
    this.drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      { color: "#E0E0E0" }
    );
    this.drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LIPS,
      { color: "#E0E0E0" }
    );
  }
}

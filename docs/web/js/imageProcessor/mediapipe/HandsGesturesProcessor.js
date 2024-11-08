// HandsGesturesProcessor.js
import MediaPipeProcessor from "/js/imageProcessor/mediapipe/MediaPipeProcessor.js";
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { GestureRecognizer, HandLandmarker } = vision;



export default class HandsGesturesProcessor extends MediaPipeProcessor {
  constructor(
    options = {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 2,
    }
  ) {
    super("HandsGesturesProcessor", GestureRecognizer, options);
    this._fontItialized = false;

    this._gesturesSigns =  {
      'Thumb_Up': '👍',
      'Thumb_Down': '👎',
      'Victory': '✌️',
      'Pointing_Up': '☝️',
      'Closed_Fist': '✊',
      'ILoveYou': '🤟',
      'Open_Palm': '🖐️',
      null: '🤷',
    };
  }

  // Process video frame
  async videoToStructuredData(video, currentTime) {
    if (!this.visionTaskRunner) {
      throw new Error(`${this.name} is not initialized.`);
    }
    return await this.visionTaskRunner.recognizeForVideo(video, currentTime);
  }

  processGestures(structuredData, canvasContext, isMirrored) {
    if (structuredData.gestures && structuredData.gestures.length > 0) {
      const emoji = this._gesturesSigns[structuredData.gestures[0][0].categoryName] || this._gesturesSigns[null];      
      this._lastEmoji = emoji;
      if (!this._fontItialized) {
        this._fontItialized = true;
        canvasContext.font = '172px sans-serif';
        canvasContext.textAlign = 'right';
        canvasContext.textBaseline = 'top';
        canvasContext.fillStyle = '#FFFFFF'; // Bílá barva pro viditelnost
      }


      // Vykreslení emoji v pravém horním rohu s odsazením
      const padding = 20;
      canvasContext.fillText(emoji, canvasContext.canvas.width - padding, 2*padding);          
    }
  }

  // Override drawTextDataToImageData to handle face landmarks
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

    this.processGestures(structuredData, canvasContext, isMirrored);
  } // drawTextDataToImageData
} // HandsGesturesProcessor


// /js/control/VideoControl.js
/**
 * @module VideoControl
 *
 * @description VideoControl class
 * Controls the video stream on/off and processing.
 */
import Control from "./js/control/Control.js";
import VideoLoop from "./js/video/VideoLoop.js";
import ImageProcessor from "./js/imageProcessor/ImageProcessor.js";
import ImageProcessorStorage from './js/imageProcessor/ImageProcessorStorage.js';

/**
 * @class VideoControl
 * @extends Control
 * @param {Object} camerasReactiveVars - Camera data - vue reactive object for selected camera
 * @param {VideoLoop} videoLoop - Video loop object
 * @param {Object} textareaOutput - Textarea output object
 * @param {Object} fpsCounter - FPS counter object
 * @param {Object} imageProcessorStorage - Image processor storage object
 * @description VideoControl class
 *
 */
export default class VideoControl extends Control {
  constructor(
    camerasReactiveVars,
    switchReactiveVars,
    videoLoop,
    textareaOutput,
    fpsCounter,
    imageProcessorStorage
  ) {
    super();
    if (!(videoLoop instanceof VideoLoop)) {
      throw new Error("videoLoop must be an instance of VideoLoop");
    }
    if (!(imageProcessorStorage instanceof ImageProcessorStorage)) {
      throw new Error("imageProcessorStorage must be an instance of ImageProcessorStorage");
    }
    this.videoLoop = videoLoop;
    this.canvasElement = this.videoLoop.canvasElement;
    this.videoElement = this.videoLoop.videoElement;
    this.videoLoop.setProcessFrameCallback(this.processFrame.bind(this));
    this.camerasReactiveVars = camerasReactiveVars;
    this.switchReactiveVars = switchReactiveVars;
    this.imageProcessor = null;
    this.textareaOutput = textareaOutput;
    this.fpsCounter = fpsCounter;
    this.imageProcessorStorage = imageProcessorStorage;
    this._lastCameraId = null;
    this._isRunning = false;
    this._lastVideoTime = null;
  }

  setImageProcessor(imageProcessor) {
    if (!(imageProcessor instanceof ImageProcessor)) {
      throw new Error("Processor must be an instance of ImageProcessor");
    }
    this.imageProcessor = imageProcessor;
  }

  async start() {
    Control._run(async () => {
      if (this._isRunning) {
        console.log("VideoControl.start(): Already running");
        return;
      }
      try {
        if (!this._lastCameraId) {
          this._lastCameraId = this.camerasReactiveVars.selectedCameraId;
        }
        await this.videoLoop.start();

        this._isRunning = true;
      } catch (error) {
        console.error("Error starting the videdo loop:", error);
      }
    });
  }

  stop() {
    Control._run(() => {
      if (!this._isRunning) {
        console.log("VideoControl.stop(): Not running");
        return;
      }
      this._isRunning = false;

      this.videoLoop.stop();
    });
  }

  async processFrame(video, canvasContext) {
    if (video.currentTime === this._lastVideoTime) {
      return;
    }

    if (!this._isRunning) {
      return;
    }

    this._lastVideoTime = video.currentTime;

    // Update the FPS counter
    this.fpsCounter.registrateFrame();

    if (this.switchReactiveVars.showVideoOn) {
      // Draw the video frame to the canvas
      if (this.switchReactiveVars.mirrorViewOn) {
        canvasContext.save();
        canvasContext.scale(-1, 1); // Flip horizontally
        canvasContext.drawImage(
          this.videoElement,
          -this.canvasElement.width,
          0,
          this.canvasElement.width,
          this.canvasElement.height
        );
        canvasContext.restore();
      } else {
        canvasContext.drawImage(
          this.videoElement,
          0,
          0,
          this.canvasElement.width,
          this.canvasElement.height
        );
      }
    } else {
      this.videoLoop.cleanCanvas();
    }

    // Check if the image processor is set
    if (!this.imageProcessor) {
      console.warn("VideoControl.processFrame: No image processor set yet.");
      return;
    }

    // Check if the image processor is initialized
    if (!this.imageProcessor.isInitialized()) {
      // console.warn("VideoControl.processFrame: The image processor is not initialized yet.");
      return;
    }

    // Imgage processing -> StructuredData (landmarks, etc.)
    let processedData = {};
    const startTimeMs = performance.now();
    this.fpsCounter.registrateFrame(startTimeMs);

    try {
      processedData = await this.imageProcessor.videoToStructuredData(
        video,
        startTimeMs
      );
    } catch (error) {
      console.error("Error processing video frame:", error);
    }

    // StructuredData -> Text
    if (this.switchReactiveVars.resultInTextOn) {
      this.textareaOutput.value = JSON.stringify(processedData, null, 2);
    }

    // StructuredData -> Image
    if (this.switchReactiveVars.resultInVideoOn) {
      try {
        this.imageProcessor.drawTextDataToImageData(
          processedData,
          canvasContext,
          this.switchReactiveVars.mirrorViewOn
        );
      } catch (error) {
        console.error("Error drawing text data to image data:", error);
      }
    }
  } // processFrame

  /* onSelectedCameraChange() {
    if (this.camerasReactiveVars.selectedCameraId !== this._lastCameraId) {
      this._lastCameraId = this.camerasReactiveVars.selectedCameraId;
      this.videoLoop.setselectedCameraId(this._lastCameraId);
      if (this.switchReactiveVars.appOn) {
        this.stop();
        this.videoLoop.setselectedCameraId(this._lastCameraId);
        this.start();
      } else {
        this.videoLoop.setselectedCameraId(this._lastCameraId);
      }
    }
  }
 */

  // Návrh od GPT na plynulejší přepínání kamer, dělá problémy s přerušením běžícího procesu modelu mediapipe.
  onSelectedCameraChange() {
    if (this.camerasReactiveVars.selectedCameraId !== this._lastCameraId) {
      this._lastCameraId = this.camerasReactiveVars.selectedCameraId;
      this.videoLoop.setselectedCameraId(this._lastCameraId);

      // Spusťte nový stream bez přerušení běžícího procesu
      this.videoLoop
        ._startStream()
        .then(() => {
          console.log("Camera switched successfully.");
        })
        .catch((error) => {
          console.error("Error switching camera:", error);
        });
    }
  }

  onAppOnChange(newValue, oldValue) {
    if (newValue) {
      this.start();
    } else {
      this.stop();
    }
  }

  async onImageProcessorChange(selectedProcessorName) {
    try {
      const processor = await this.imageProcessorStorage.getProcessor(selectedProcessorName);
      this.setImageProcessor(processor); // Napojíme procesor na VideoControl
    } catch (error) {
      console.error("Failed to change image processor:", error);
    }
  }
} // class VideoControl

// js/model/VideoLoop.js
/**
 * @module VideoLoop
 * 
 * @description
 * This module provides a class for video processing by looping through frames.
 * Each frame is processed by a FrameProcessor instance.
 * 
 */

// @see https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js#video
export default class VideoLoop {
  constructor(videoElement, canvasElement) {
    this.stream = null;
    this.selectedCameraId = null;
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.processFrameCallback = null;
    this._lastAnimationId = null;
    this.canvasContext = this.canvasElement.getContext("2d");    
    videoElement.addEventListener("loadedmetadata", this._initialize_canvas.bind(this));
  }

  setProcessFrameCallback(processFrameCallback) {
    if ((typeof processFrameCallback !== 'function') || (processFrameCallback.length !== 2)) {
      throw new Error("'processFrameCallback' must be a function like processFrameCallback(video, canvasContext)");
    }
    this.processFrameCallback = processFrameCallback;
  }

  setselectedCameraId(cameraId) {
    this.selectedCameraId = cameraId;
  }

  /*
  async _startStream() {
    const constraints = {
      video: {
        deviceId: this.selectedCameraId
          ? { exact: this.selectedCameraId }
          : undefined,
      },
    };
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.videoElement.srcObject = this.stream;
    this.videoElement.play();
    return this.stream;
  }
    */

  async _startStream() {
    const constraints = {
        video: {
            deviceId: this.selectedCameraId
                ? { exact: this.selectedCameraId }
                : undefined,
        },
    };
    const newStream = await navigator.mediaDevices.getUserMedia(constraints);

    // Zastavíme staré tracky, pokud existují
    if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
    }

    return new Promise((resolve, reject) => {
        this.videoElement.srcObject = newStream;
        this.videoElement.onloadedmetadata = () => {
            this.stream = newStream;
            this.videoElement.play().then(resolve).catch(reject);
        };
    });
  }



  _stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  _initialize_canvas() {
    const aspectRatio = this.videoElement.videoWidth / this.videoElement.videoHeight;
    this.canvasElement.width = this.canvasElement.offsetWidth;
    this.canvasElement.height = this.canvasElement.width / aspectRatio;
  }

  _processFrame(video, canvasContext) {
    if (this.processFrameCallback) {
      this.processFrameCallback(video, canvasContext);
    } else {
      console.warn("processFrameCallback not set yet.");
    }
  }

  _render() {
    this._processFrame(this.videoElement, this.canvasContext);
    this._lastAnimationId = requestAnimationFrame(this._render.bind(this)); // Request the next frame
  }

  cleanCanvas() {     
    this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  async start() {
    await this._startStream();
    //this._initialize_canvas(); 
    this._lastAnimationId = this._render(); // Start rendering
  }

  stop() {
    if (this._lastAnimationId) {
      cancelAnimationFrame(this._lastAnimationId);
      this._lastAnimationId = null;
    }
    this._stopStream();
    this.cleanCanvas();
  }
} // class VideoLoop

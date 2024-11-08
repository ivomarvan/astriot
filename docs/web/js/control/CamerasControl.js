// /js/control/CamerasControl.js
import Control from "/js/control/Control.js";
import Cameras from "/js/video/Cameras.js";

/**
 * @module CamerasControl
 * @extends Control
 * @description Manages selectin the camera devices
 */
export default class CamerasControl extends Control {
  constructor(camerasReactiveVars) {
    super();    
    this.camerasReactiveVars = camerasReactiveVars;
  }

  _select_camera(cameraDevice) {
    this.camerasReactiveVars.selectedCameraId = cameraDevice.deviceId;
  }

  async updateCameraList() {
    Control._run(async () => {
      const cameras = await Cameras.getAvailableCameras();
      this.camerasReactiveVars.cameras.splice(
        0,
        this.camerasReactiveVars.cameras.length,
        ...cameras
      );
      if (this.camerasReactiveVars.cameras.length > 0) {
        this._select_camera(this.camerasReactiveVars.cameras[0]);
      }      
    });
  }

} // class CamerasControl

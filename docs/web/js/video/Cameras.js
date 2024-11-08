// js/model/Cameras.js
export default class Cameras {
  
  static async getAvailableCameras() {
    const cameras = []; // Initialize an empty array to hold available cameras

    try {
      await navigator.mediaDevices.getUserMedia({ video: true });

      // Get the list of all media devices
      const devices = await navigator.mediaDevices.enumerateDevices();

      // Filter for video input devices (cameras)
      devices.forEach((device) => {
        if (device.kind === "videoinput") {
          cameras.push(device); // Add camera device to the array
        }
      });

      // Return the array of available cameras
      return cameras;
    } catch (error) {
      // Handle errors (e.g., access denied)
      console.error("An error occurred while fetching camera devices:", error);
      return []; // Return an empty array in case of error
    }
  }
  
} // class Cameras

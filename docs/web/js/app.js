// app.js
// js/app.js
import { createApp, reactive } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

import { getDebugModeFromUrl } from './utils.js';
import Control from '/js/control/Control.js';
import CamerasControl from "/js/control/CamerasControl.js";
import VideoControl from '/js/control/VideoControl.js';
import VideoLoop from '/js/video/VideoLoop.js';
import FpsCounter from '/js/video/FpsCounter.js';
import ImageProcessorStorage from '/js/imageProcessor/ImageProcessorStorage.js';


const imgProcStorage = new ImageProcessorStorage(
    [
        { name: "Face Landmarks", className: "FaceLandmarkProcessor", dir: "/js/imageProcessor/mediapipe/" },
        { name: "Hands Landmarks", className: "HandsLandmarkProcessor", dir: "/js/imageProcessor/mediapipe/" },
        { name: "Pose Landmarks", className: "PoseLandmarkProcessor", dir: "/js/imageProcessor/mediapipe/" },
        { name: "Hands Gestures", className: "HandsGesturesProcessor", dir: "/js/imageProcessor/mediapipe/" },
        //{ name: "Holistic Landmarks", className: "HolisticLandmarkProcessor", dir: "/js/imageProcessor/mediapipe/" },
        //{ name: "Demo Landmarks", className: "DemoLandmarkProcessor", dir: "/js/ImageProcessor/demo" },
    ],
    80 // maxCostPercents
);




let camerasControl, videoControl, videoLoop, fpsCounter;    


const camerasReactiveVars = reactive({
  cameras: [],
  selectedCameraId: null,
});

const switchReactiveVars = reactive({
    appOn: true,   // On/Off state of the app
    showVideoOn: true, // On/Off state of the video
    resultInVideoOn: true, // On/Off showing the image processor result in video/canvas
    resultInTextOn: false, // On/Off showing the image processor result in text
    mirrorViewOn: true, // On/Off mirroring the video
});

createApp({
    data() {
        return {
            camerasReactiveVars,
            switchReactiveVars,

            processorNames: [], // List of available processors
            selectedProcessorName: '',

            connectionStatus: 'disconnected', // 'connected' or 'disconnected'
            fps: 0,
            messages: '',        // For message output
            showMessages: true,  // To toggle message output visibility
            canvas: null, // Adding a variable to hold a reference to the canvas
        };
    },
    methods: {
        // Swith the switcher with the given name
        toggleSwitch(switchName) {this.switchReactiveVars[switchName] = !this.switchReactiveVars[switchName];},
        
        // Logs status messages to the console and appends to messages
        logStatus(message) {
            console.log(message); // Later, redirect this output to a user-visible element
            this.messages += message + '<br>'; // Append messages with HTML line breaks
        },
        startCamera: () => videoControl.start(),
        stopCamera: () => videoControl.stop(),
        onSelectedCameraChange: () => videoControl.onSelectedCameraChange(),
        async onImageProcessorChange() {
            const selectedProcessorName = this.selectedProcessorName; // Správný přístup k `this`
            await videoControl.onImageProcessorChange(selectedProcessorName);
        },

        // Updates the connection status
        updateConnectionStatus(status) {this.connectionStatus = status;},

    },
    mounted() {
        // @TODO: Rozvaž, kam taková kontrola patří
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            this.logStatus('The device enumeration API is not supported in this browser.');
            return;
        }

        let controlDebugMode = getDebugModeFromUrl();
        Control.initClass(controlDebugMode);
        try {
            let videoElement = this.videoElement || document.createElement('video');
        
            camerasControl = new CamerasControl(camerasReactiveVars);      
            camerasControl.updateCameraList();
            videoLoop = new VideoLoop(videoElement, this.$refs.cameraCanvas);
            
            this.processorNames = imgProcStorage.getProcessorNames();

            


            fpsCounter = new FpsCounter()
            videoControl = new VideoControl(
                camerasReactiveVars, 
                switchReactiveVars, 
                videoLoop, 
                this.$refs.textareaOutput,
                fpsCounter,
                imgProcStorage
            );
            videoControl.start();

            this.selectedProcessorName = this.processorNames[0]; // Výběr prvního procesoru
            this.onImageProcessorChange(); // Inicializace prvního procesoru
            imgProcStorage.initOnBackground();

        } catch (error) {
            console.error("An error occurred during control initialization:", error);
        }


        // Simulate PeerJS connection status
        // Replace this with actual PeerJS connection logic later
        this.updateConnectionStatus('disconnected');

        // Aktualizace GUI s FPS každých 500 ms
        setInterval(() => {
            const avgFps = Math.round(fpsCounter.getLastFps());
            this.fps = avgFps;
        }, 500);


    },  watch: {
        // Watcher pro změny v appOn
        'switchReactiveVars.appOn': (newValue, oldValue) => videoControl.onAppOnChange(newValue, oldValue),        
    },
}).mount('#app');

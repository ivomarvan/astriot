
// /js/control/Control.js
export default class Control {

    // Default implementation of _run
    static async _run_no_debug(code) {
        try {
            await code();
        } catch (error) {
          console.error("An error occurred:", error);
        }
    } // _run_no_debug

    static async _run_debug(code) {
        console.log("Control action started in debug mode");
        console.log(`${code}`);
    } // _run_debug

    
    static initClass(debug=false) {
        if (debug) {
            Control._run = Control._run_debug;
        } else {
            Control._run = Control._run_no_debug;
        }
    } // initClass
} // Control

Control.initClass(false);
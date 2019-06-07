import EXA from "../sim/EXA";


class Profiler {
    constructor() {

    }

    startProfiling(exa: EXA) {
        // todo validate exa??
        /*
        while (!exa.isHalted) {
            exa.runStep()
            this.stateFrames.push({state: exa.captureState(), <...metadata>})
        }
        // metadata can include time it took to run individual steps etc.
         */
    }
}


export default Profiler;

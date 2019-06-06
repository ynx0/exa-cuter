import EXA from "./sim/EXA";
import EXAState from "./sim/EXAState";
import * as util from "util";


class ExaTester {
    constructor() {

    }

    static verifyState(exa: EXA, testState: EXAState): boolean {
        return util.isDeepStrictEqual(exa.captureState(), testState);
    }
}

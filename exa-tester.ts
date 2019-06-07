import EXA from "./sim/EXA";
import EXAState from "./sim/EXAState";
import * as util from "util";


class ExaTester {
    static verifyState(exa: EXA, testState: EXAState): boolean {
        return util.isDeepStrictEqual(exa.captureState(), testState);
    }

    static verifyRegisterContent(exa: EXA, testState: EXAState) {
        return exa.X === testState.X
            && exa.T === testState.T;
    }
}

import EXAValue from "./type/EXAValue";
import CastError from "./error/CastError";
import Keywords from "./type/Keywords";


// todo figure out if this is necessary or if im just dumb with union types
// yeah i think i can just use as statements lol but do that later ig
class SimUtils {
    static castValueToNumber(exaVal: EXAValue): number {
        let castResult = parseInt(String(exaVal));
        if (isNaN(castResult)) {
            throw new CastError(`Error: Tried to cast value: ${exaVal} to number but failed`);
        }

        return castResult
    }
    static castValueToKeywords(exaVal: EXAValue): Keywords {
        if (exaVal.constructor.name !== "Array") {
            throw new CastError(`Error: Tried to cast value: ${exaVal} to Keywords but failed`);
        }

        return exaVal as Keywords;
    }
}

export default SimUtils;

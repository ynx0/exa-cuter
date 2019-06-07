import EXAValue from "../sim/type/EXAValue";
import CastError from "../sim/error/CastError";
import Keywords from "../sim/type/Keywords";
import EXANumber from "../parse/ast/EXANumber";


// todo figure out if this is necessary or if im just dumb with union types
// yeah i think i can just use as statements lol but do that later ig
class SimUtils {

    public static readonly MAX_NUMBER = 9999;
    public static readonly MIN_NUMBER = -9999;

    static clampNumber(num: number): number {
        return Math.min(Math.max(num, -9999), 9999)
    }


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

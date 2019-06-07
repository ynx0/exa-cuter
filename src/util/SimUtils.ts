import EXAValue from "../sim/type/EXAValue";
import CastError from "../error/CastError";
import Keyword from "../sim/type/Keyword";


// todo figure out if this is necessary or if im just dumb with union types
// yeah i think i can just use as statements lol but do that later ig
class SimUtils {

    public static readonly MAX_NUMBER = 9999;
    public static readonly MIN_NUMBER = -9999;

    static clampNumber(num: number): number {
        return SimUtils.clampToRange(num, -9999, 9999);
    }

    static clampToRange(num: number, min: number, max: number): number {
        return Math.min(Math.max(num, min), max);
    }


    static castValueToNumber(exaVal: EXAValue): number {
        let castResult = parseInt(String(exaVal));
        if (isNaN(castResult)) {
            throw new CastError(`Error: Tried to cast value: ${exaVal} to number but failed`);
        }

        return castResult
    }

    static castValueToKeywords(exaVal: EXAValue): Keyword {
        if (exaVal.constructor.name !== "Array") {
            throw new CastError(`Error: Tried to cast value: ${exaVal} to Keywords but failed`);
        }

        return exaVal as Keyword;
    }

    // from https://stackoverflow.com/a/1527820

    static getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export default SimUtils;

import EXAValue from "../EXAValue";
import {EXAResult} from "../../../util/EXAResult";

// should this class, the exa register, clamp any incoming values or
// should that be something that the simulation handles?
// im gonna go with simulation for now, but we will see

class EXARegister {
    protected value: EXAValue;
    protected readonly maxKeywordLength: number;

    constructor(value = 0) {
        this.value = value;
        this.maxKeywordLength = 500; // todo change to real maxlen
    }

    isValid(value: EXAValue): boolean {
        if (typeof value === "number") {
            return -9999 <= value && value <= 9999;
        } else if (value.constructor.name === "string") {
            return value.length < this.maxKeywordLength;
        } else {
            return false;
        }
    }

    /**
     *
     * @param newVal
     * @returns success or failure of write
     */
    setValue(newVal: EXAValue): EXAResult<boolean> {
        if (this.isValid(newVal)) {
            this.value = newVal;
            return {result: true};
        } else {
            // return {error: SimErrors.}
            //return false; // todo do this instead of erroring out the top level language
            throw new Error("Tried to set an invalid value " + newVal + "to a register");
        }
    }


    getValue(): EXAValue {
        if (typeof this.value === "number") {
            return parseInt(String(this.value)); // typescript complains if this is not wrapped with String(...) so...
        } else {
            return this.value;
        }
    }

    toString() {
        return `EXARegister {${this.value}}`
    }

}

export default EXARegister;

import Keywords from "./Keywords";
import EXAValue from "./EXAValue";


class EXARegister {
    private value: EXAValue;
    private readonly maxKeywordsInArray: number;

    constructor(value = 0) {
        this.value = value;
        this.maxKeywordsInArray = 500; // todo change to real maxlen
    }

    isValid(value: Keywords | number) {
        if (typeof value === "number") {
            return -9999 < value && value < 9999;
        } else if (value.constructor.name === "Array") {
            return value.length < this.maxKeywordsInArray;
        }
    }

    setValue(newVal: Keywords | number) {
        if (this.isValid(newVal)) {
            this.value = newVal;
        } else {
            throw new Error("Tried to set an invalid value " + newVal + "to a register");
        }
    }


    getValue() {
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

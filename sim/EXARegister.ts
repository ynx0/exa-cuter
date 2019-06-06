class EXARegister {
    private value: string | number;
    private maxStringLength: number;

    constructor(value = 0) {
        this.value = value;
        this.maxStringLength = 500; // todo change to real maxlen
    }

    isValid(value: string | number) {
        if (typeof value === "number") {
            return -9999 < value && value < 9999;
        } else if (typeof value === "string") {
            return value.length < this.maxStringLength;
        }
    }

    setValue(newVal: string | number) {
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

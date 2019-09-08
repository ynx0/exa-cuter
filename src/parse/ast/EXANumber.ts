import ParameterRef from "./ParameterRef";

class EXANumber extends ParameterRef {
    private value: number;

    constructor(num: string) {
        super();
        this.value = parseInt(num);
    }

    getValue() {
        return this.value;
    }

    toString() {
        return this.value.toString();
    }

}

export default EXANumber;

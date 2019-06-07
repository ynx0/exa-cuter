import Parameter from "./Parameter";

class EXANumber extends Parameter {
    private value: number;

    constructor(num: string) {
        super();
        this.value = parseInt(num);
    }

    getValue() {
        return this.value;
    }

}

export default EXANumber;

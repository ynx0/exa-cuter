import Parameter from "./Parameter";

class EXANumber extends Parameter {
    private value: string;

    constructor(num: any) {
        super();
        this.value = num;
    }

    getValue() {
        return this.value;
    }

}

export default EXANumber;

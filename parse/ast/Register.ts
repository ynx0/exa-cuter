import Parameter from "./Parameter";
import LocalRegisters from "./LocalRegisters";


class Register extends Parameter {

    readonly name: LocalRegisters;

    constructor(name: LocalRegisters) {
        super();

        this.name = name;
    }

    toString() {
        return this.name;
    }

    getValue(): any {
        // TODO Fix
        return this.name;
    }
}

export default Register;

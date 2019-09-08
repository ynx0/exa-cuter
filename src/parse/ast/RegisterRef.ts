import ParameterRef from "./ParameterRef";
import LocalRegisters from "./LocalRegisters";


class Register extends ParameterRef {

    readonly name: LocalRegisters;

    constructor(nameInfo: LocalRegisters) {
        // the reference to the register comes in an array i.e. `['X']`, instead of just 'X'
        super();
        this.name = <LocalRegisters>nameInfo[0];
    }

    toString() {
        return this.name.toString();
    }

    getValue(): any {
        // TODO Fix
        return this.name;
    }
}

export default Register;

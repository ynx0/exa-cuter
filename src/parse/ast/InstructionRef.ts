import InstructionNames from "../../sim/type/InstructionNames";
import TestExpression from "./TestExpression";
import RegisterRef from "./RegisterRef";
import EXANumber from "./EXANumber";

class InstructionRef {
    readonly name: InstructionNames;
    readonly args: Array<EXANumber | RegisterRef | TestExpression | string | number>;

    constructor(info: Array<any>) {
        this.name = info[0];
        this.args = [info[1], info[2], info[3]]; // todo cleanup
    }

    toString() {
        return `{${this.name} ${this.args}}`
    }

    getAbos() {

    }

}
export default InstructionRef;

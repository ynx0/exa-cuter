import InstructionNames from "../../sim/type/InstructionNames";
import TestExpression from "./TestExpression";
import Register from "./Register";
import EXANumber from "./EXANumber";

class Instruction {
    readonly name: InstructionNames;
    readonly args: Array<EXANumber | Register | TestExpression | string | number>;

    constructor(info: Array<any>) {
        this.name = info[0];
        this.args = [info[1] || null, info[2] || null, info[3] || null]; // todo cleanup
    }

    toString() {
        return `{${this.name} ${this.args}}`
    }
}
export default Instruction;

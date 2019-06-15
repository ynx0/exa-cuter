import Instruction from "./Instruction";

class Program {
    readonly instructions: Instruction[];


    constructor(instructions: Instruction[]) {
        this.instructions = instructions;
    }


    toString() {
        let str = '';
        for (let instr of this.instructions) {
            str += instr.toString()
        }
        return str;
    }

}

export default Program;

import InstructionRef from "./InstructionRef";

class Program {
    readonly instructions: InstructionRef[];


    constructor(instructions: InstructionRef[]) {
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

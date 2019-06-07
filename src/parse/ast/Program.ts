import Instruction from "./Instruction";

class Program {
	readonly instructions: Instruction[];


	constructor(instructions: Instruction[]) {
		this.instructions = instructions;
	}
}

export default Program;

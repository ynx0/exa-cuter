import GrammarInstructions from "./GrammarInstructions";
import Registers from "./Registers";
import Program from "./Program";
import ParameterRef from "./ParameterRef";
import InstructionRef from "./InstructionRef";
import RegisterRef from "./RegisterRef";
import LocalRegisters from "./LocalRegisters";
import Operations from "./Operations";
import TestExpression from "./TestExpression";
import EXANumber from "./EXANumber";


export default {
    Instruction: InstructionRef,
    Instructions: GrammarInstructions,
    Register: RegisterRef,
    Registers,
    Parameter: ParameterRef,
    Program,
    LocalRegisters,
    Operations,
    EXANumber,
    TestExpression,
}

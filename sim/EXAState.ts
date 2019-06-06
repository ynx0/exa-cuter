import Program from "../parse/ast/Program";
import CommMode from "./CommMode";
import EXARegister from "./EXARegister";

interface EXAState {
    id: number,
    pc: number,
    cycleCount: number,
    program: Program,
    halted: boolean,
    blocked: boolean,
    mode: CommMode,
    labelMap: {[key: string]: number },
    X: EXARegister,
    T: EXARegister,
}
export default EXAState;

import Program from "../../parse/ast/Program";
import CommMode from "./CommMode";
import EXARegister from "./register/EXARegister";
import {EntityID} from "./Entity";
import BlockReason from "./BlockReason";
import {EXAError} from "../../util/EXAResult";
import SimErrors from "../SimErrors";

interface EXAState {
    id: EntityID,
    pc: number,
    cycleCount: number,
    program: Program,
    halted: boolean,
    blocked: boolean,
    errorState: SimErrors | null
    blockReason: BlockReason | null
    mode: CommMode,
    labelMap: {[key: string]: number },
    X: EXARegister,
    T: EXARegister,
    F: EXARegister,
    M: EXARegister
}
export default EXAState;

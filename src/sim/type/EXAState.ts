import Program from "../../parse/ast/Program";
import CommMode from "./CommMode";
import EXARegister from "./register/EXARegister";
import {EntityID} from "./Entity";
import BlockReason from "./BlockReason";
import {EXAError} from "../../util/EXAResult";
import SimErrors from "../SimErrors";
import Environment from "../Environment";

interface EXAState {
    id: EntityID,
    pc: number,
    cycleCount: number,
    program: Program,
    halted: boolean,
    blocked: boolean,
    killed: boolean,
    killer: any // todo stricter type
    errorState: SimErrors | null
    blockReason: BlockReason | null
    mode: CommMode,
    labelMap: {[key: string]: number },
    X: EXARegister,
    T: EXARegister,
    F: EXARegister,
    M: EXARegister,
    env: Environment
}
export default EXAState;

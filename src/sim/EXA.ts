import Program from "../parse/ast/Program";
import AST from "../parse/ast/AST";
import Register from "../parse/ast/Register";
import Instruction from "../parse/ast/Instruction";
import util from "util";
import CommMode from "./type/CommMode";
import EXARegister from "./type/register/EXARegister";
import EXAState from "./type/EXAState";
import SimUtils from "../util/SimUtils";
import InstructionNames from "./type/InstructionNames";
import TestExpression from "../parse/ast/TestExpression";
import Parameter from "../parse/ast/Parameter";
import Operations from "../parse/ast/Operations";
import EXAValue from "./type/EXAValue";
import EXAFileRegister from "./type/register/EXAFileRegister";
import EXAMessageRegister from "./type/register/EXAMessageRegister";
import Simulation from "./Simulation";
import SimErrors from "./SimErrors";


export type EXAOptions = {
    commMode?: CommMode;
    initialHostID?: string
};

export default class EXA {

    public static MAX_CYCLE_COUNT = 1_000_000;

    private readonly id: number;
    private pc: number;
    private cycleCount: number;
    private readonly program: Program;
    private halted: boolean;
    private readonly blocked: boolean;
    private mode: CommMode;
    private hostID: string;
    private readonly labelMap: { [key: string]: number };
    public readonly X: EXARegister;
    public readonly T: EXARegister;
    public readonly F: EXAFileRegister;
    public readonly M: EXARegister;

    private sim: Simulation;
    private errorState: SimErrors | null;


    constructor(program: Program, sim: Simulation, options: EXAOptions) {

        this.id = 0; // TODO make id (autoincremented thing?)
        this.pc = 0; // program counter. the line number of current executing program
        this.cycleCount = 0; // todo implement and take into account pseudoInstructionNames (mark)
        this.program = program;
        this.halted = false;
        this.blocked = false;
        this.mode = options.commMode || CommMode.GLOBAL;
        this.hostID = options.initialHostID || 'RHIZOME';
        this.labelMap = {};
        this.X = new EXARegister();
        this.T = new EXARegister();
        this.F = new EXAFileRegister();
        this.M = new EXAMessageRegister();
        this.sim = sim;
        this.errorState = null;
        // todo support F and M registers
        // TODO refactor this to be shared in the parser?

        this.setupLabels();
        this.setupCoreDump();
    }

    public getCurrentHostID(): string {
        return this.hostID;
    }

    // todo better name
    // todo check if the access level makes sense
    private setErrorStateAndHalt(error: SimErrors): void {
        this.errorState = error;
        this.halted = true;
    }

    setupCoreDump() {
        process.on('uncaughtException', (err: string | Error) => {
            console.error(err);
            console.error("==========================CORE DUMP==========================");
            this.coreDump();
        });

    }

    coreDump() {
        console.error(`
        EXA#${this.id}
        PC: ${this.pc}
        CYCLE: ${this.cycleCount}
        HALTED: ${this.halted}
        BLOCKED: ${this.blocked}
        LABELS: ${util.inspect(this.labelMap)}
        REGISTERS: [
            X: ${this.X}
            T: ${this.T}
        ]
        `);
    }

    setupLabels() {
        // Structure of labelMap: { <loop_name> : <line_num> }
        for (let lineNum in this.program.instructions) {
            let instr = this.program.instructions[lineNum];
            if (instr.name ===  InstructionNames.MARK) {
                let labelName = instr.args[0];
                this.labelMap[labelName as string] = parseInt(lineNum);
            }
        }
    }

    // when the method name contains something akin to the words "Reference" or "AST", it takes in an ast param, not a sim param
    getValueFromParamRef(paramRef: Parameter): EXAValue {
        // registers and numbers are both parameters
        if (paramRef instanceof AST.Register) {
            return this.getRegisterFromParamRef(paramRef).getValue();
        } else if (paramRef instanceof AST.EXANumber) {
            return paramRef.getValue();
        } else {
            throw new Error("Invalid paramRef given:" + util.inspect(paramRef));
        }
    }

    getRegisterFromParamRef(paramRef: Register): EXARegister {

        let rawRegisterReference = paramRef.getValue();
        switch (rawRegisterReference) {
            case AST.LocalRegisters.X:
                return this.X;
            case AST.LocalRegisters.T:
                return this.T;
            case AST.LocalRegisters.F:
            case AST.LocalRegisters.M:
                throw new Error("Unsupported register '" + rawRegisterReference + "' encountered");
            default:
                throw new Error("Illegal param '" + rawRegisterReference.toString() + "' given");
        }
    }

    toggleMode() {
        if (this.mode === CommMode.GLOBAL) {
            this.mode = CommMode.LOCAL;
        } else {
            this.mode = CommMode.GLOBAL;
        }
    }

    processInstruction(instr: Instruction) {


        let args = instr.args;

        switch (instr.name) {

            // the reason for the parenthesized closures in this switch statement is essentially namespacing/scoping lol

            case InstructionNames.NOTE:
            case InstructionNames.MARK:
                // need preincrement otherwise this doesn't work...
                this.cycleCount = Math.max(0, --this.cycleCount); // do not add to cycle-count for markInstructionNames
                break;
            case InstructionNames.NOOP:
                break;
            case InstructionNames.HALT:
                this.halted = true;
                break;
            case InstructionNames.MODE:
                this.toggleMode();
                break;
            case InstructionNames.COPY:
                (() => {
                    let newValue = this.getValueFromParamRef(args[0] as Parameter);
                    let dest = this.getRegisterFromParamRef(args[1] as Register);
                    dest.setValue(newValue);
                })();
                break;

            // MARK - Logic Processing
            case InstructionNames.JUMP:
                (() => {
                    let label = args[0] as string;
                    // console.log(`Current pc = ${this.pc}`);
                    this.pc = this.labelMap[label];
                    // console.log(`After pc = ${this.pc}`);
                })();
                break;
            case InstructionNames.TJMP:
                (() => {
                    let label = args[0] as string;
                    let labelLineNum = this.labelMap[label];
                    if (typeof this.T.getValue() === "string" || this.T.getValue() >= 1) {
                        this.pc = labelLineNum;
                    }
                })();
                break;
            case InstructionNames.FJMP:
                (() => {
                    let label = args[0] as string;
                    let labelLineNum = this.labelMap[label];
                    console.log(util.inspect(this.T));
                    // TODO ensure that these conditions match the game
                    if (typeof (this.T.getValue()) !== "string" && this.T.getValue() < 1) {
                        this.pc = labelLineNum;
                    }
                })();
                break;
            case InstructionNames.TEST:
                (() => {

                    let testExpr = args[0] as TestExpression;
                    // TODO what to do for strings?/keywords
                    let param1 = this.getValueFromParamRef(testExpr.param1);
                    let param2 = this.getValueFromParamRef(testExpr.param2);
                    let operation = testExpr.operation;

                    let result;

                    if (operation === Operations.EQUALS) {
                        // todo make another method that actually tests for equality? cause this tests for raw js equality
                        result = param1 === param2;
                    } else if (operation === Operations.LESS_THAN) {
                        result = param1 < param2;
                    } else if (operation === Operations.GREATER_THAN) {
                        result = param1 > param2;
                    }
                    if (result) {
                        this.T.setValue(1);
                    } else {
                        this.T.setValue(0);
                    }
                })();
                break;


            // MARK - Arithmetic Processing
            case InstructionNames.ADDI:
            case InstructionNames.SUBI:
            case InstructionNames.MULI:
            case InstructionNames.DIVI:
                (() => {
                    let a = SimUtils.castValueToNumber(this.getValueFromParamRef(args[0] as Parameter));
                    let b = SimUtils.castValueToNumber(this.getValueFromParamRef(args[1] as Parameter));
                    let dest = this.getRegisterFromParamRef(args[2] as Register);
                    // console.log(`${a} ${instr.name} ${b} -> ${dest}`);
                    if (instr.name === InstructionNames.ADDI) {
                        dest.setValue(SimUtils.clampNumber(a + b));
                    } else if (instr.name === InstructionNames.SUBI) {
                        dest.setValue(SimUtils.clampNumber(a - b));
                    } else if (instr.name === InstructionNames.MULI) {
                        dest.setValue(SimUtils.clampNumber(a * b));
                    } else if (instr.name === InstructionNames.DIVI) {
                        // enforce integer division
                        dest.setValue(parseInt(String(SimUtils.clampNumber(a / b))));
                    }
                })();
                break;

            case InstructionNames.SWIZ:
                (() => {
                    // gets number from param, turns it into string, turns that string into array, turns into int array
                    // 9999 -> "9999" -> ["9", "9", "9", "9"] -> [9, 9, 9, 9]
                    // the pad start ensures numbers are interpreted as 0001 instead of just 1 if less than 4 digits
                    // the reason for reverse is because the swiz instruction operates from right to left. For example
                    // in the number [1 3 5 7], the mask of `4` translates to the digit '1'
                    //                4 3 2 1

                    let mask = SimUtils.castValueToNumber(this.getValueFromParamRef(args[1] as Register));
                    let number = SimUtils.castValueToNumber(this.getValueFromParamRef(args[0] as Register));
                    let resultSign = Math.sign(mask * number);

                    let numArray: Array<string> = Array.from(number.toString().padStart(4, '0'));
                    let maskArray: Array<number> = Array.from(mask.toString().padStart(4, '0')).map(Number);
                    let dest = this.getRegisterFromParamRef(args[2] as Register);
                    let swizArray = [];
                    for (let swizIndex of maskArray) {
                        if (swizIndex === 0) {
                            swizArray.push(0);
                        } else {
                            swizArray.push(numArray[4 - swizIndex]);
                        }
                    }
                    let finalValue = resultSign * parseInt(swizArray.join().replace(/,/g, ''));
                    // console.log(`SWIZ: ${util.inspect(numArray)} ${util.inspect(maskArray)} ${finalValue} ${dest}`);
                    dest.setValue(finalValue);
                })();
                break;

            // MARK - File Processing and Manipulation
            case InstructionNames.MAKE:
                (() => {
                    if (this.F.hasFile()) {
                        this.setErrorStateAndHalt(SimErrors.CANNOT_GRAB_SECOND_FILE);
                    }
                    this.F.setFile(this.sim.createFile());
                })();
                break;

            case InstructionNames.DROP:
                (() => {
                    if (!this.F.hasFile()) {
                        this.setErrorStateAndHalt(SimErrors.NO_FILE_IS_HELD);
                    }
                    // must block if there is no space on the host for the file
                    this.sim.requestFileDrop(this, this.F.getFile());
                })();
                break;

            case InstructionNames.HOST:
                (() => {
                    let target = this.getRegisterFromParamRef(args[0] as Register);
                    target.setValue(this.hostID);
                })();
                break;

            case InstructionNames.LINK:
                (() => {
                    let id = (this.getValueFromParamRef(args[0] as Parameter)) as number;
                    this.sim.requestLinkToID(id);
                })();
                break;


            default:
                console.log("Unimplemented instruction: " + instr.name);
        }
    }

    runStep() {
        // this.validateState();
        if (this.pc >= this.program.instructions.length) {
            this.setErrorStateAndHalt(SimErrors.OUT_OF_INSTRUCTIONS);
            return;
        }
        if (this.cycleCount >= EXA.MAX_CYCLE_COUNT) {
            this.setErrorStateAndHalt(SimErrors.TOO_MANY_CYCLES);
        }

        let currentInstr = this.program.instructions[this.pc];
        this.processInstruction(currentInstr);
        this.pc++;
        this.cycleCount++;
    }

    runUntil(lineNum: number) {
        while (this.pc <= lineNum - 1) {
            this.runStep();
        }
    }

    runUntilCycle(cycleNum: number) {
        while (!this.halted && this.cycleCount < cycleNum) {
            this.runStep();
        }
    }

    run() {
        while (!this.halted) {
            if (!this.blocked) {
                this.runStep();
            } else {
                // wait for environment to unblock?
                console.log('Waiting to be unblocked');
            }
        }
    }

    validateState() {
        let stateChecks = [
            this.pc > 0,

        ];
        stateChecks.forEach(check => {
            if (!check) {
                throw new Error(`
                FATAL: Invalid state encountered.
                ============CORE DUMP============
                ${this.toString()}
                `)
            }
        });
    }

    // WARNING, ALWAYS UPDATE WITH NEW STATE
    captureState(): EXAState  {
        // aw man i really wish nodejs supported es6 property shorthand init
        return {
            id: this.id,
            pc: this.pc,
            cycleCount: this.cycleCount,
            program: this.program,
            halted: this.halted,
            blocked: this.blocked,
            mode: this.mode,
            labelMap: this.labelMap,
            X: this.X,
            T: this.T,
        }
    }


}

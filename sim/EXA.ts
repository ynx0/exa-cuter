import Program from "../parse/ast/Program";
import AST from "../parse/ast/AST";
import Register from "../parse/ast/Register";
import EXANumber from "../parse/ast/EXANumber";
import Instruction from "../parse/ast/Instruction";
import util from "util";
import CommMode from "./CommMode";
import EXARegister from "./EXARegister";
import EXAState from "./EXAState";

enum Instructions {
    NOOP = "NOOP",
    MARK = "MARK",
    COPY = "COPY",
    SWIZ = "SWIZ",
    ADDI = "ADDI",
    SUBI = "SUBI",
    MULI = "MULI",
    DIVI = "DIVI",
    JUMP = "JUMP",
    TJMP = "TJMP",
    FJMP = "FJMP",
    TEST = "TEST",
    HALT = "HALT",
    MODE = "MODE",
    NOTE = "NOTE",
}

export default class EXA {
    private id: number;
    private pc: number;
    private cycleCount: number;
    private program: Program;
    private halted: boolean;
    private blocked: boolean;
    private mode: CommMode;
    private labelMap: { [key: string]: number };
    private X: EXARegister;
    private T: EXARegister;


    constructor(program: Program) {

        this.id = 0; // TODO make id (autoincremented thing?)
        this.pc = 0; // program counter. the line number of current executing program
        this.cycleCount = 0; // todo implement and take into account pseudoinstructions (mark)
        this.program = program;
        this.halted = false;
        this.blocked = false;
        this.mode = CommMode.GLOBAL;
        this.labelMap = {};
        this.X = new EXARegister();
        this.T = new EXARegister();
        // todo support F and M registers
        // TODO refactor this to be shared in the parser?

        this.setupLabels();
        this.setupCoreDump();
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
            if (instr.name ===  Instructions.MARK) {
                this.labelMap[instr.args[0]] = parseInt(lineNum);
            }
        }
    }

    // when the method name contains something akin to the words "Reference" or "AST", it takes in an ast param, not a sim param
    getValueFromParamRef(paramRef: Register | EXANumber): (string | number) {
        if (paramRef instanceof AST.Register) {
            // return (this[param.name]).getValue(); // THIS WORKS IN JS but not TS so :(((
            return this.getRegisterFromParamRef(paramRef).getValue();
        } else if (paramRef instanceof AST.EXANumber) {
            return paramRef.getValue();
        } else {
            throw new Error("Invalid paramRef given:" + util.inspect(paramRef));
        }
    }

    getRegisterFromParamRef(paramRef: Register): EXARegister {

        let rawRegisterReference = paramRef.getValue();
        // console.log(rawRegisterReference);
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

        // console.log(instr);
        let args = instr.args;


        // todo handle overflow
        // noinspection JSUnresolvedVariable
        switch (instr.name) {

            case Instructions.NOTE:
            case Instructions.MARK:
                // need preincrement otherwise this doesn't work...
                this.cycleCount = Math.max(0, --this.cycleCount); // do not add to cycle-count for markInstructions
                break;
            case Instructions.NOOP:
                break;
            case Instructions.HALT:
                this.halted = true;
                break;
            case Instructions.MODE:
                this.toggleMode();
                break;
            case Instructions.COPY:
                (() => {
                    let newValue = this.getValueFromParamRef(args[0]);
                    let dest = this.getRegisterFromParamRef(args[1]);
                    dest.setValue(newValue);
                })();
                break;
            case Instructions.JUMP:
                (() => {
                    let label = args[0];
                    // console.log(`Current pc = ${this.pc}`);
                    this.pc = this.labelMap[label];
                    // console.log(`After pc = ${this.pc}`);
                })();
                break;
            case Instructions.TJMP:
                (() => {
                    let label = args[0];
                    let labelLineNum = this.labelMap[label];
                    if (typeof this.T.getValue() === "string" || this.T.getValue() >= 1) {
                        this.pc = labelLineNum;
                    }
                })();
                break;
            case Instructions.FJMP:
                (() => {
                    let label = args[0];
                    let labelLineNum = this.labelMap[label];
                    console.log(util.inspect(this.T));
                    // TODO ensure that these conditions match the game
                    if (typeof (this.T.getValue()) !== "string" && this.T.getValue() < 1) {
                        this.pc = labelLineNum;
                    }
                })();
                break;
            case Instructions.TEST:
                (() => {

                    let testExpr = args[0];
                    // TODO what to do for strings?
                    let param1 = this.getValueFromParamRef(testExpr.param1);
                    let param2 = this.getValueFromParamRef(testExpr.param2);
                    let operationObj = testExpr.operation;
                    let operationSymbol = operationObj.operation;
                    let opmap = operationObj.opmap;
                    let result;
                    // console.log(`${util.inspect(operation)}`);
                    if (operationSymbol === opmap.EQUALS) {
                        // todo make another method that actually tests for equality?
                        result = param1 === param2;
                    } else if (operationSymbol === opmap.LESS_THAN) {
                        result = param1 < param2;
                    } else if (operationSymbol === opmap.GREATER_THAN) {
                        result = param1 > param2;
                    }
                    if (result) {
                        this.T.setValue(1);
                    } else {
                        this.T.setValue(0);
                    }
                })();
                break;

            case Instructions.ADDI:
            case Instructions.SUBI:
            case Instructions.MULI:
            case Instructions.DIVI:
                (() => {
                    let a = parseInt(<string>this.getValueFromParamRef(args[0]));
                    let b = parseInt(<string>this.getValueFromParamRef(args[1]));
                    let dest = this.getRegisterFromParamRef(args[2]);
                    // console.log(`${a} ${instr.name} ${b} -> ${dest}`);
                    if (instr.name === Instructions.ADDI) {
                        dest.setValue(a + b);
                    } else if (instr.name === Instructions.SUBI) {
                        dest.setValue(a - b);
                    } else if (instr.name === Instructions.MULI) {
                        dest.setValue(a * b);
                    } else if (instr.name === Instructions.DIVI) {
                        // enforce integer division
                        dest.setValue(parseInt(String(a / b)));
                    }
                })();
                break;

            case Instructions.SWIZ:
                (() => {
                    // gets number from param, turns it into string, turns that string into array, turns into int array
                    // 9999 -> "9999" -> ["9", "9", "9", "9"] -> [9, 9, 9, 9]
                    // the pad start ensures numbers are interpreted as 0001 instead of just 1 if less than 4 digits
                    // the reason for reverse is because the swiz instruction operates from right to left. For example
                    // in the number [1 3 5 7], the mask of `4` translates to the digit '1'
                    //                4 3 2 1
                    let number = Array.from(this.getValueFromParamRef(args[0]).toString().padStart(4, '0'));
                    let mask = Array.from(this.getValueFromParamRef(args[1]).toString().padStart(4, '0')).map(Number);
                    let dest = this.getRegisterFromParamRef(args[2]);
                    let swizArray = [];
                    for (let swizIndex of mask) {
                        if (swizIndex === 0) {
                            swizArray.push(0);
                        } else {
                            swizArray.push(number[swizIndex - 1]);
                        }
                    }
                    let finalValue = parseInt(swizArray.join().replace(/,/g, ''));
                    console.log(`SWIZ: ${util.inspect(number)} ${util.inspect(mask)} ${finalValue} ${dest}`);
                    dest.setValue(finalValue);
                    console.log(`Dest ${finalValue} is now ${dest.getValue()}`)
                })();
                break;

            default:
                console.log("Unimplemented instruction: " + instr.name);
        }
    }

    runStep() {
        // this.validateState();
        // console.log(`pc: ${this.pc}, prl: ${this.program.instructions.length}`);
        if (this.pc >= this.program.instructions.length) {
            this.halted = true;
            return;
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

import Program from "../parse/ast/Program";
import AST from "../parse/ast/AST";
import RegisterRef from "../parse/ast/RegisterRef";
import InstructionRef from "../parse/ast/InstructionRef";
import util from "util";
import CommMode from "./type/CommMode";
import EXARegister from "./type/register/EXARegister";
import EXAState from "./type/EXAState";
import SimUtils from "../util/SimUtils";
import InstructionNames from "./type/InstructionNames";
import TestExpression from "../parse/ast/TestExpression";
import ParameterRef from "../parse/ast/ParameterRef";
import Operations from "../parse/ast/Operations";
import EXAValue from "./type/EXAValue";
import EXAFileRegister from "./type/register/EXAFileRegister";
import EXAMessageRegister from "./type/register/EXAMessageRegister";
import Environment from "./Environment";
import SimErrors from "./SimErrors";
import {EnvRequestType} from "./EnvRequestType";
import {EnvRequest} from "./EnvRequest";
import {EntityID} from "./type/Entity";
import BlockReason from "./type/BlockReason";
import {StatusUpdate, StatusUpdateType} from "./type/StatusUpdate";
import {EXAResult} from "../util/EXAResult";
import Tokens from "../parse/ast/Tokens";
import EXANumber from "../parse/ast/EXANumber";


export type EXAOptions = {
    commMode?: CommMode;
};

export default class EXA {

    public static MAX_CYCLE_COUNT = 1_000_000;

    readonly id: EntityID;
    private pc: number;
    private cycleCount: number;
    private readonly program: Program;
    private halted: boolean;
    private blocked: boolean;
    private killed: boolean;
    private mode: CommMode;
    // private readonly hostID: number;
    // private readonly hostName: string;
    private readonly labelMap: { [key: string]: number };
    public readonly X: EXARegister;
    public readonly T: EXARegister;
    public readonly F: EXAFileRegister;
    public readonly M: EXARegister;

    private env: Environment;
    private errorState: SimErrors | null;
    private blockReason: BlockReason | null;
    private killer: EntityID | null;

    private readonly HALT_REQ: EnvRequest;


    constructor(id: EntityID, program: Program, env: Environment, options: EXAOptions = {}) {

        this.id = id; // TODO make exaID (autoincremented thing?)
        this.pc = 0; // program counter. the line number of current executing program
        this.cycleCount = 0; // todo implement and take into account pseudoInstructionNames (mark)
        this.program = program;
        this.halted = false;
        this.blocked = false;
        this.killed = false;
        this.killer = null;
        this.blockReason = null;
        this.mode = options.commMode || CommMode.GLOBAL;
        // this.hostID = 0; // Special exaID of the HOME host. it should always be 0
        // this.hostName = 'HOME';
        this.labelMap = {};

        this.X = new EXARegister();
        this.T = new EXARegister();
        this.F = new EXAFileRegister();
        this.M = new EXAMessageRegister();

        this.env = env;
        this.errorState = null;

        this.HALT_REQ = new EnvRequest(this.id, EnvRequestType.INFORM_HALT);

        // TODO refactor this to be shared in the parser?

        this.setupLabels();
        // this.setupCoreDump();
    }

    // WARNING, ALWAYS UPDATE WITH NEW STATE
    captureState(): EXAState {
        // aw man i really wish nodejs supported es6 property shorthand init
        return {
            id: this.id,
            pc: this.pc,
            cycleCount: this.cycleCount,
            program: this.program,
            halted: this.halted,
            blocked: this.blocked,
            killed: this.killed,
            killer: this.killer,
            blockReason: this.blockReason,
            mode: this.mode,
            errorState: this.errorState,
            labelMap: this.labelMap,
            X: this.X,
            T: this.T,
            F: this.F,
            M: this.M,
            env: this.env,
        }
    }


    log(message?: any, ...args: any[]) {
        console.log(`[${this.id}]` + message, ...args);
    }

    public isHalted() {
        return this.halted;
    }

    private getValueOrError<T>(result: EXAResult<T>): T {
        if (result.error) {
            this.setErrorStateAndHalt(result.error);
        } else if (result.value) {
            return result.value;
        } else {
            throw `Typescript Broke?`
        }
        throw 'Should be unreachable, but this is for you typescript'
    }

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
            F: ${this.F}
            
        ]
        `);
    }

    setupLabels() {
        // Structure of labelMap: { <loop_name> : <line_num> }
        for (let lineNum in this.program.instructions) {
            let instr = this.program.instructions[lineNum];
            if (instr.name === InstructionNames.MARK) {
                let labelName = instr.args[0];
                this.labelMap[labelName as string] = parseInt(lineNum);
            }
        }
    }

    // when the method name contains something akin to the words "Reference" or "AST", it takes in an ast param, not a env param
    getValueFromParamRef(paramRef: ParameterRef): EXAResult<EXAValue> {
        // registers and numbers are both parameters
        if (paramRef instanceof AST.Register) {
            // todo see if wrapping this in this.getValueOrError() makes sense
            return this.getRegisterFromParamRef(paramRef).attemptRead();
        } else if (paramRef instanceof AST.EXANumber) {
            return {error: null, value: paramRef.getValue()};
        } else {
            throw new Error("Invalid paramRef given:" + util.inspect(paramRef));
        }
    }

    getRegisterFromParamRef(paramRef: RegisterRef): EXARegister {

        let rawRegisterReference = paramRef.getValue();
        switch (rawRegisterReference) {
            case AST.LocalRegisters.X:
                return this.X;
            case AST.LocalRegisters.T:
                return this.T;
            case AST.LocalRegisters.F:
                return this.F;
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

    // returns a list of side effects, empty array if none
    processInstruction(instr: InstructionRef): EnvRequest {


        let args = instr.args;
        let environmentRequest: EnvRequest = new EnvRequest(this.id, EnvRequestType.NO_REQ);

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
                environmentRequest = this.HALT_REQ;
                this.halted = true;
                break;
            case InstructionNames.MODE:
                this.toggleMode();
                break;
            case InstructionNames.COPY:
                (() => {
                    let possibleValue = this.getValueFromParamRef(args[0] as ParameterRef);
                    if (possibleValue.error) {
                        environmentRequest = this.HALT_REQ;
                        this.setErrorStateAndHalt(possibleValue.error);
                    } else {
                        let dest = this.getRegisterFromParamRef(args[1] as RegisterRef);
                        dest.setValue(possibleValue.value);
                    }

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
                    let valueOfT = this.getValueOrError(this.T.attemptRead());

                    if (typeof valueOfT === "string" || valueOfT >= 1) {
                        this.pc = labelLineNum;
                    }
                })();
                break;
            case InstructionNames.FJMP:
                (() => {
                    let label = args[0] as string;
                    let labelLineNum = this.labelMap[label];
                    let valueOfT = this.getValueOrError(this.T.attemptRead());

                    // TODO ensure that these conditions match the game
                    if (typeof valueOfT !== "string" && valueOfT < 1) {
                        this.pc = labelLineNum;
                    }
                })();
                break;
            case InstructionNames.TEST:
                (() => {
                    let testExpr = args[0];
                    // Handle `TEST EOF`
                    if (testExpr === Tokens.EOF) {
                        if (!this.F.hasFile()) {
                            environmentRequest = this.HALT_REQ;
                            this.setErrorStateAndHalt(SimErrors.NO_FILE_IS_HELD);
                        } else {
                            if (this.F.isAtEOF()) {
                                this.T.setValue(1);
                            } else {
                                this.T.setValue(0);
                            }
                        }

                    // Handle `TEST MRD`
                    } else if (testExpr === Tokens.MRD) {
                        // tests without pausing (blocking)
                        this.T.setValue(Number(this.env.canExaReadMsg(this.id)))

                    // Handle regular TestExpressions (i.e. `TEST X > 1`)
                    } else {

                        testExpr = testExpr as TestExpression; // Ensure we are working with a real TypeExpr Obj

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
                    }
                })();
                break;


            // MARK - Arithmetic Processing
            case InstructionNames.ADDI:
            case InstructionNames.SUBI:
            case InstructionNames.MULI:
            case InstructionNames.DIVI:
                (() => {
                    let a = SimUtils.castValueToNumber(
                        this.getValueOrError(this.getValueFromParamRef(args[0] as ParameterRef))
                    );
                    let b = SimUtils.castValueToNumber(
                        this.getValueOrError(this.getValueFromParamRef(args[1] as ParameterRef))
                    );
                    let dest = this.getRegisterFromParamRef(args[2] as RegisterRef);
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

                    let mask = SimUtils.castValueToNumber(
                        this.getValueOrError(this.getValueFromParamRef(args[1] as RegisterRef))
                    );
                    let number = SimUtils.castValueToNumber(
                        this.getValueOrError(this.getValueFromParamRef(args[0] as RegisterRef))
                    );
                    let resultSign = Math.sign(mask * number);

                    let numArray: Array<string> = Array.from(number.toString().padStart(4, '0'));
                    let maskArray: Array<number> = Array.from(mask.toString().padStart(4, '0')).map(Number);
                    let dest = this.getRegisterFromParamRef(args[2] as RegisterRef);
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
                // TODO deduplicate the if !hasFile logic
            case InstructionNames.MAKE:
                (() => {
                    if (this.F.hasFile()) {
                        environmentRequest = this.HALT_REQ;
                        this.setErrorStateAndHalt(SimErrors.CANNOT_GRAB_SECOND_FILE);
                    } else {
                        environmentRequest = (new EnvRequest(this.id, EnvRequestType.MAKE_FILE));
                        // console.log("Requesting for file");
                    }
                    // if the requestType was fulfilled
                    // the exa will process the environment changes
                    // and will receive a StatusUpdate that will be an object with the
                    // file that it needed, and will then set the F register as such

                    // this.F.setFile();
                })();
                break;

            case InstructionNames.DROP:
                (() => {
                    if (!this.F.hasFile()) {
                        environmentRequest = this.HALT_REQ;
                        this.setErrorStateAndHalt(SimErrors.NO_FILE_IS_HELD);
                    } else {
                        environmentRequest = (new EnvRequest(this.id, EnvRequestType.DROP_FILE));
                    }
                    // must block if there is no space on the host for the file
                    // this.env.requestFileDrop(this, this.F.getFile());


                })();
                break;

            case InstructionNames.FILE:
                (() => {
                    let targetRegister = this.getRegisterFromParamRef(args[0] as RegisterRef);

                    if (!this.F.hasFile()) {
                        environmentRequest = this.HALT_REQ;
                        this.setErrorStateAndHalt(SimErrors.NO_FILE_IS_HELD);
                    } else {
                        targetRegister.setValue(this.F.getFile().id);
                    }
                })();
                break;

            case InstructionNames.WIPE:
                (() => {
                    if (!this.F.hasFile()) {
                        environmentRequest = this.HALT_REQ;
                        this.setErrorStateAndHalt(SimErrors.NO_FILE_IS_HELD);
                    } else {
                        environmentRequest = new EnvRequest(this.id, EnvRequestType.WIPE_FILE)
                    }
                })();
                break;

            case InstructionNames.SEEK:
                (() => {

                    let seekAmount = args[0] as EXANumber;

                    if (!this.F.hasFile()) {
                        environmentRequest = this.HALT_REQ;
                        this.setErrorStateAndHalt(SimErrors.NO_FILE_IS_HELD);
                    } else {
                        this.F.seekCursor(seekAmount.getValue());
                    }
                })();
                break;

            // MARK - Movement Instructions
            case InstructionNames.HOST:
                (() => {
                    let target = this.getRegisterFromParamRef(args[0] as RegisterRef);
                    target.setValue(this.env.getHostName(this.id));
                })();
                break;

            case InstructionNames.LINK:
                (() => {
                    let id = this.getValueOrError(this.getValueFromParamRef(args[0] as ParameterRef)) as number;
                    environmentRequest = (new EnvRequest(this.id, EnvRequestType.LINK, [id]));
                    // this.env.requestLinkToID(exaID);
                })();
                break;


            default:
                throw new Error("Unimplemented instruction: " + instr.name);
        }
        return environmentRequest;

    }

    processStatusUpdates() {
        let statusUpdate: StatusUpdate | null = this.env.getStatusUpdates(this.id);

        if (statusUpdate) {
            // console.log("[EXA] received status update for me " + this.id + statusUpdate);
        } else {
            return;
        }
        // console.log("[EXA] received status update" + statusUpdate.type);
        switch (statusUpdate.type) {
            case StatusUpdateType.NEW_FILE:
                // console.log("[EXA] Recieved file");
                let newFile = statusUpdate.args[0];
                this.F.setFile(newFile);
                break;
            case StatusUpdateType.KILLED:
                let killer = statusUpdate.args[0];
                this.setKilled(killer);
                break;

            default:
                throw `Error: unsupported status update type: ${statusUpdate.type}`;

        }

        // TODO implement
        // this is where we will get blocked or unblocked
    }


    runStep(): EnvRequest | undefined {
        // this.validateState();
        if (!this.halted) {
            this.processStatusUpdates();

            // TODO Make one obj that represents <EnvRequest(this.id, EnvRequestType.INFORM_HALT)>
            if (this.pc >= this.program.instructions.length) {
                this.setErrorStateAndHalt(SimErrors.OUT_OF_INSTRUCTIONS);
                return this.HALT_REQ
            }
            if (this.cycleCount >= EXA.MAX_CYCLE_COUNT) {
                this.setErrorStateAndHalt(SimErrors.TOO_MANY_CYCLES);
                return this.HALT_REQ
            }
            if (this.blocked) {
                return new EnvRequest(this.id, EnvRequestType.INFORM_BLOCKED);
            }
            if (this.killed) {
                this.setErrorStateAndHalt(SimErrors.EXA_KILLED);
                return new EnvRequest(this.id, EnvRequestType.CONFIRM_KILLED)
            }

            let environmentRequest;
            let currentInstr = this.program.instructions[this.pc];
            environmentRequest = this.processInstruction(currentInstr);
            this.pc++;
            this.cycleCount++;
            return environmentRequest;
        }
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

    setBlocked(reason: BlockReason) {
        this.blocked = true;
        this.blockReason = reason;
    }

    unblock() {
        // todo actually unblock an exa
        this.blocked = false;
        this.blockReason = null;
    }

    setKilled(killerID: EntityID) {
        this.killed = true;
        this.killer = killerID;
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

}

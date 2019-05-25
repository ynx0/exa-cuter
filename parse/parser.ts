import * as ohm from "ohm-js";
import path from "path";
import fs from "fs";

import AST from "./ast/AST";
import {Action} from "ohm-js";
import Instructions from "./ast/Instructions";
import Registers from "./ast/Registers";

type ArityMap = {[key: string] :number}


// type ArityMap = {
//     [key in Registers | Instructions]: number;
// };


let instructionMap: ArityMap = {
    "CopyInstr": 3,
    "SwizInstr": 4,
    "MarkInstr": 2,
    "JumpInstr": 2,
    "TJumpInstr": 2,
    "FJumpInstr": 2,
    // "TestInstr": 1, // testinstr needs extra logic, so we won't autogenerate its handler
    "ReplInstr": 2,
    "HaltInstr": 1,
    "KillInstr": 1,
    "LinkInstr": 2,
    "HostInstr": 2,
    "ModeInstr": 1,
    "VoidInstr": 2,
    "MakeInstr": 1,
    "GrabInstr": 2,
    "FileInstr": 2,
    "SeekInstr": 2,
    "DropInstr": 1,
    "WipeInstr": 1,
    "NoopInstr": 1,
    "noteInstr": 2,
    "RandInstr": 4,
    "AddInstr": 4,
    "SubtractInstr": 4,
    "MultiplyInstr": 4,
    "DivideInstr": 4,
    "LoopMacro": 4,
};

let registerMap: ArityMap = {
    GeneralRegister: 1,
    TestRegister: 1,
    FileRegister: 1,
    MessageRegister: 1,
    HardwareRegister: 2,
};


export default class Parser {
    private parser: ohm.Grammar;
    private semantics: ohm.Semantics;
    private actionMap: ohm.ActionDict;

    constructor() {
        this.parser = ohm.grammar(fs.readFileSync(path.join(__dirname, "exa_grammar.ohm")).toString());
        this.semantics = this.parser.createSemantics();
        this.actionMap = {
            Program(body) {
                return new AST.Program(body.tree())
            },
            Instruction(data) {
                return new AST.Instruction(data.tree());
            },
            Parameter(param) {
                return param.tree()
            },
            Register(reg) {
                return new AST.Register(reg.tree())
            },
            GeneralRegister(reg) {
                reg.tree()
            },
            EXANumber(numData) {
                // return numData.tree();
                return new AST.EXANumber(numData.tree())
            },
            /**
             * @return {number}
             */
            EXANumber_positive(posnum) {
                return posnum.tree()
            },
            /**
             * @return {number}
             */
            EXANumber_negative(sign, negnum) {
                return negnum.tree() * -1;
            },
            // TODO Fix this
            TestInstr(info) {
                // console.log("reeeeee");
                // console.log(info.tree());
                return info.tree()
            },
            TestInstr_value(name, p1, testExpr, p2) {
                return [name.tree(), new AST.TestExpression(p1.tree(), testExpr.tree(), p2.tree())]
            },
            TestInstr_comm(name, mrd) {
                return [name.tree(), mrd.tree()]
            },
            TestInstr_file(name, eof) {
                return [name.tree(), eof.tree()]
            },
            digit4(digit1, digit2, digit3, digit4, _) {
                return parseInt(digit1.tree() + digit2.tree() + digit3.tree() + digit4.tree())
            },
            label(str) {
                return str.tree()
            },

            validString(_, str, __) {
                let charArray: Array<string> = str.tree();
                // noinspection UnnecessaryLocalVariableJS
                let stringifyedVal = charArray.reduce((str, char) => {
                    return str + char;
                });
                return stringifyedVal;
            },

            // this will return the raw value of the element.
            _terminal() {
                // console.log(this.primitiveValue);
                return this.primitiveValue
            },

        };
        // add all intermediate command semnatics
        for (let instr in instructionMap) {
            this.actionMap[instr] = Parser.makeInstr(<Instructions>instr, instructionMap);
        }
        for (let reg in registerMap) {
            this.actionMap[reg] = Parser.makeInstr(<Registers>reg, registerMap);
        }
        // instructionMap.forEach(instr => {
        //     this.actionMap[instr] = new Function(
        //         'p1', '', return [p1.tree(), ];
        //     );
        // });

        this.semantics.addOperation('tree', <ohm.ActionDict>this.actionMap);
    }

    static makeInstr(instr: Instructions | Registers, map: ArityMap): Action {

        // let has2Args = map[instr] > 1;
        // let has3Args = map[instr] > 2;
        // let has4Args = map[instr] > 3;
        let numArgs = map[instr];

        let argsStr = 'param1';
        let bodyStr = `return [
                        param1.tree(),`;

        for (let i = 0; i < numArgs; i++) {
            argsStr += `\nparam${i}`;
            bodyStr += `\nparam${i}.tree()`

        }

        return new Function(argsStr, bodyStr) as Action;

        // yeah i know this is an abomination but idk how else to do it...
        // return new Function(
        //     'param1,'
        //     + `${has2Args ? 'param2,' : ''}`
        //     + `${has3Args ? 'param3,' : ''}`
        //     + `${has4Args ? 'param4,' : ''}`,
        //     `return [
        //     param1.tree(),
        //     ${has2Args ? 'param2.tree(),' : ''}
        //     ${has3Args ? 'param3.tree(),' : ''}
        //     ${has4Args ? 'param4.tree(),' : ''}
        //     ]`
        // );
    }

    getProgramAST(program: string) {
        if (!program) {
            throw new Error("ERROR: No Program Provided");
        }
        let match = this.parser.match(program);
        if (match.succeeded()) {
            return this.semantics(match).tree();
        } else {
            throw new Error("Invalid program given\nReason:" + match.message);
        }
    }

}

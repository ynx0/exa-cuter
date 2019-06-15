import BinaryFile from "binary-file";
import {ProgramList, Solution} from "./Solution";
import Loader from "./loader";
import Program from "../parse/ast/Program";
import ntol from "number-to-letter";
import _ from 'lodash';
import * as fs from "fs";

enum HeaderLengths {
    FILE_HEADER = 4,
    ZERO_PADDING = 102,
}

enum Symbols {
    NEW_PROGRAM = 0x020A // because little endian big endian mix up /*0x0A02*/
}

// better name
export class SolutionManager {

    // from https://stackoverflow.com/a/39347308
    private static byteArrayToNum(array: Uint8Array) {
        let buffer = Buffer.from(array);
        return buffer.readUIntLE(0, array.length);
    }

    private static writeNullBytes(file: BinaryFile, num: number) {
        for (let i = 0; i < num; i++) {
            file.cursor += fs.writeSync(file.fd, Buffer.from([0x00]), 0, 1, file.cursor);
        }
    }

    /**
     * This translates a program number into an exa name
     * For example, 0 -> XA,
     *              1 -> XB
     *              etc.
     * @param programNumber
     * @return string
     * @returns The corresponding EXA Name based on the program number.
     */
    private static getExaName(programNumber: number): string {
        return `X${ntol(programNumber)}`;
    }

    private static writeZeroPadding(file: BinaryFile): void {
        SolutionManager.writeNullBytes(file, HeaderLengths.ZERO_PADDING)
    }

    static async readSolution(filepath: string): Promise<Solution> {

        let solutionFile: BinaryFile = new BinaryFile(filepath, 'r', true);
        try {
            await solutionFile.open();

            let fileHeader = (await solutionFile.read(HeaderLengths.FILE_HEADER)).buffer as Uint8Array;
            let headerTwoLen = await solutionFile.readUInt32();
            let headerTwo = (await solutionFile.read(headerTwoLen)).buffer as Uint8Array; //https://stackoverflow.com/a/31394257/3807967
            let solutionNameLen = await solutionFile.readUInt32();
            let solutionName = (await solutionFile.read(solutionNameLen)).toString();


            // console.log(`
            //     fileHeader: ${ab2str(fileHeader)}
            //     headerTwoLen: ${headerTwoLen},
            //     headerTwo: ${ab2str(headerTwo)},
            //     solutionNameLen: ${solutionNameLen},
            //     solutionName: ${solutionName}
            // `);


            let programList: ProgramList = {};
            let currByte: number = 0;
            // while we aren't at the end of the file
            mainLoop:
                while (await solutionFile.size() > solutionFile.tell()) {

                    // read zeroes until there is indication of a program
                    currByte = 0;
                    // todo understand the header info right before the first EXA code.
                    // console.log(`Reading Zeroes: ${solutionFile.tell()}: ${currByte.toString(16)}`);
                    while (currByte !== Symbols.NEW_PROGRAM) {
                        currByte = await solutionFile.readUInt16();
                        if (await solutionFile.size() === solutionFile.tell()) break mainLoop; // stop if we've hit EOF
                    }

                    // assert.strictEqual(programFlag, Symbols.NEW_PROGRAM, "Invalid Symbol detected");
                    // read 3 bytes of zeroes
                    for (let i = 0; i < 3; i++) {
                        await solutionFile.readUInt8();
                    }
                    let exaName = await solutionFile.readString(2);
                    let programLen = await solutionFile.readUInt32();
                    let programText = await solutionFile.readString(programLen);
                    programList[exaName] = Loader.compileProgram(programText);

                }

            return new Solution(fileHeader, headerTwo, solutionName, programList);
        } catch (e) {
            throw new Error("Hey, something went wrong reading a solution" + e);
        }

    }

    static makeSolution(solutionName: string, programs: Array<Program>): Solution {
        // todo make real headers lol
        let fileHeader = new Uint8Array([0xEF, 0x03, 0x00, 0x00]);
        let headerTwo = new Uint8Array(Buffer.from("PB011B"));
        let programNames = [];

        for (let i = 0; i < programs.length; i++) {
            programNames.push(SolutionManager.getExaName(i));
        }

        return new Solution(fileHeader, headerTwo, solutionName, _.zipObject(programNames, programs));
    }

    static sol2bin(solution: Solution, filepath: string): boolean {
        let success = false;
        let bytes2num = SolutionManager.byteArrayToNum;
        let rawFilePointer = fs.openSync(filepath, 'w');
        let file = new BinaryFile(filepath, 'w', true);
        file.open()
            .then(() => file.writeUInt32(bytes2num(solution.fileHeader)))
            .then(() => file.writeUInt32(solution.headerTwo.length))
            .then(() => file.write(Buffer.from(solution.headerTwo)))
            .then(() => file.writeUInt32(solution.solutionName.length))
            .then(() => file.writeString(solution.solutionName))
            .then(() => SolutionManager.writeNullBytes(file, 16)) // todo work on this, for now fill in 16 zeroes
            .then(() => {

                let programs: Array<Program> = Object.values(solution.programs);
                // write each program
                for (let programNum = 0; programNum < programs.length; programNum++) {

                    file.writeUInt16(Symbols.NEW_PROGRAM);
                    SolutionManager.writeNullBytes(file, 3);

                    file.writeString(SolutionManager.getExaName(programNum));
                    let programStr = programs[programNum].toString();
                    file.writeUInt32(programStr.length);
                    file.writeString(programStr);
                    SolutionManager.writeZeroPadding(file);
                }

            })
            .catch(e => {
                success = false;
                console.error(e);
            })
            .finally(() => success = true);

        return success;

    }

    static programToText(program: Program): string {
        let programText = '';
        for (let instr of program.instructions) {
            programText += (instr.name + ' ' + instr.args.map(arg => arg.toString()));
            programText += '\n';
        }
        return programText;
    }


}

import fs from "fs";
import * as path from "path";
import Program from "./parse/ast/Program";
import Parser from "./parse/parser";
import _ from "lodash-es";

let parser = new Parser();
class Loader {

    private loadedPrograms: {[key:string]: Program}; // the program id is its file name.
    // structure: {
    //  <id>: <program>,
    //  <id>: <program>,
    // }
    public static TEST_PROGRAM_DIR = './programs/test/';
    public static PASSING_PROGRAMS_DIR = Loader.TEST_PROGRAM_DIR + 'should-pass';
    public static FAILING_PROGRAMS_DIR = Loader.TEST_PROGRAM_DIR + 'should-fail';

    constructor() {
        this.loadedPrograms = {};
    }

    isLoaded(targetProgramID: string) {
        for (let program of _.values(this.loadedPrograms)) {
            if (program.id === targetProgramID) {
                return true;
            }
        }
        return false;
    }

    loadProgramsFromDirectory(dirPath: string): void {
        // TODO support should-fail programs
        let fileNames = Loader.getProgramNames(dirPath);
        let nonLoadedFileNames = [];

        for (let fileName of fileNames) {
            if (!this.isLoaded(fileName)) {
                nonLoadedFileNames.push(fileName);
            }
        }
        if (nonLoadedFileNames === []) {
            return; // there are no programs that haven't been already loaded, exit early
        }

        let programStrings = Loader.readProgramFiles(dirPath, nonLoadedFileNames);
        let compiledOutput = Loader.compilePrograms(programStrings);


        let programs = [];
        programs = _.zip(fileNames, compiledOutput);
        console.log()
    }

    loadProgram(filePath: string) {
        let fileName = path.basename(filePath, path.extname(filePath));
        if (this.isLoaded(fileName)) {
            console.warn(`WARNING: Program: ${fileName} has already been loaded`)
        }
    }

    static getProgramNames(directory: string): Array<string> {
        return fs.readdirSync(directory);
    }

    static readProgramFiles(baseDir: string, programNames: Array<string>): Array<string> {
        let programStrings: Array<string> = [];

        // reads each program file, converts file to string, pushes it to result array
        programNames.forEach(programName => {
            let fileContents = fs.readFileSync(path.join(baseDir, programName), 'utf-8');
            programStrings.push(fileContents);
        });
        return programStrings;
    }

    static compilePrograms(programStrings: Array<string>): Array<Program> {
        let programs: Array<Program> = [];
        programStrings.forEach(program => {
            programs.push(parser.getProgramAST(program));
        });
        return programs;
    }


}

export default Loader;

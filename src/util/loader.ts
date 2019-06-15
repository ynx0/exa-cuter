import fs from "fs";
import * as path from "path";
import Program from "../parse/ast/Program";
import Parser from "../parse/parser";
import _ from "lodash";


class Loader {

    private loadedPrograms: {[key:string]: {id: string, prg: Program}}; // the program id is its file name.

    public static TEST_PROGRAM_DIR = './programs/test/';
    public static PASSING_PROGRAMS_DIR = Loader.TEST_PROGRAM_DIR + 'should-pass';
    public static FAILING_PROGRAMS_DIR = Loader.TEST_PROGRAM_DIR + 'should-fail';
    private static readonly parser = new Parser();

    constructor() {
        this.loadedPrograms = {};
    }

    private static isValidFile(filename: string): boolean {
        return filename.endsWith('.exa');
    }

    private static getFileNameFromPath(filepath: string): string {
        return path.basename(filepath, path.extname(filepath)) + path.extname(filepath);
    }

    public isLoaded(targetProgramID: string): boolean {
        for (let programID of _.keys(this.loadedPrograms)) {
            if (programID === targetProgramID) {
                return true;
            }
        }
        return false;
    }

    public getProgramList(): Array<string> {
        return _.keys(this.loadedPrograms);
    }
    public getLoadedPrograms(): Array<Program> {
        // inspired by https://stackoverflow.com/a/28354808/3807967
        return _.values(this.loadedPrograms).map(program => program.prg);
    }


    private static readProgram(filePath: string): string {
        let fn = Loader.getFileNameFromPath(filePath);
        if(!Loader.isValidFile(fn)) throw new Error(`Invalid Program Filename: ${fn}`);
        return fs.readFileSync(filePath, 'utf-8');
    }

    public static compileProgram(programText: string): Program {
        return Loader.parser.getProgramAST(programText)
    }

    /**
     * This method loads a single program into the cache
     * @param filePath
     * @return success - whether or not the program was loaded
     */
    public loadProgram(filePath: string): boolean {
        let fileName = Loader.getFileNameFromPath(filePath);
        if (this.isLoaded(fileName)) {
            console.warn(`WARNING: Program: ${fileName} has already been loaded`);
            return false;
        }
        let programText = Loader.readProgram(filePath);
        this.loadedPrograms[fileName] = {id: fileName, prg: Loader.compileProgram(programText)};
        return true;
    }

    public getLoadedProgram(programID: string): Program {
        for (let program of _.values(this.loadedPrograms)) {
            if (program.id === programID) {
                return program.prg;
            }
        }
        throw new Error(`Invalid ProgramID: '${programID}' given.`)
    }

    private static getProgramNames(directory: string): Array<string> {
        // sorting alphabetically ensures some sort of order
        let allFileNames =  fs.readdirSync(directory);
        return allFileNames.filter(f => Loader.isValidFile(f)).sort();
    }

    private static readProgramFiles(baseDir: string, programNames: Array<string>): Array<string> {
        let programStrings: Array<string> = [];

        // reads each program file, converts file to string, pushes it to result array
        programNames.forEach(programName => {
            let fileContents = Loader.readProgram(path.join(baseDir, programName));
            programStrings.push(fileContents);
        });
        return programStrings;
    }

    public static compilePrograms(programStrings: Array<string>): Array<Program> {
        let programs: Array<Program> = [];
        programStrings.forEach(program => {
            programs.push(Loader.compileProgram(program));
        });
        return programs;
    }

    /**
     *
     * @param dirPath
     * @return success
     */
    // TODO improve success or whatever
    public loadProgramsFromDirectory(dirPath: string): boolean {
        // TODO support should-fail programs
        let fileNames: string[] = Loader.getProgramNames(dirPath);
        let nonLoadedFileNames = [];

        for (let fileName of fileNames) {
            if (!this.isLoaded(fileName)) {
                nonLoadedFileNames.push(fileName);
            }
        }
        if (nonLoadedFileNames === []) {
            return true; // there are no programs that haven't been already loaded, exit early and successfully
        }

        let programStrings = Loader.readProgramFiles(dirPath, nonLoadedFileNames);
        let compiledOutput = Loader.compilePrograms(programStrings);

        for (let i = 0; i < compiledOutput.length; i++) {
            let filename = fileNames[i];
            this.loadedPrograms[filename] = {id: filename, prg: compiledOutput[i]};
        }
        return true;
    }

}

export default Loader;

import fs from 'fs';
import * as path from "path";
import test from 'ava';
import Parser from "./parse/Parser";
import Program from "./parse/ast/Program";

// @ts-ignore
import execution_time from "execution-time";
const perf = execution_time();

const TEST_PROGRAM_DIR = './programs/test/';
const PASSING_PROGRAMS_DIR = TEST_PROGRAM_DIR + 'should-pass';
const FAILING_PROGRAMS_DIR = TEST_PROGRAM_DIR + 'should-fail';

// passing
let fileNames: Array<string> = [];
let testStrings: Array<string> = [];
let testCases: Array<Program> = [];
let parser = new Parser();


function getProgramNames(directory: string): Array<string> {
    return fs.readdirSync(directory);
}
function readProgramFiles(baseDir: string, programNames: Array<string>): Array<string> {
    let programStrings: Array<string> = [];

    // reads each program file, converts file to string, pushes it to result array
    programNames.forEach(programName => {
        let fileContents = fs.readFileSync(path.join(baseDir, programName), 'utf-8');
        programStrings.push(fileContents);
    });
    return programStrings;
}
function compilePrograms(programStrings: Array<string>): Array<Program> {
    let programs: Array<Program> = [];
    programStrings.forEach(program => {
        programs.push(parser.getProgramAST(program));
    });
    return programs;
}


test.before('Initialize Test Cases',t => {
    // reads all files in a directory and appends their names into an array
    let results;

    perf.start();
    fileNames = getProgramNames(PASSING_PROGRAMS_DIR);
    testStrings = readProgramFiles(PASSING_PROGRAMS_DIR, fileNames);
    // testCases = convertStringsToPrograms(readProgramFiles(fileNames));
    results = perf.stop();

    t.log(`Initialized ${fileNames.length} test cases in ${results.time.toFixed(1)} ms`)

});

test('File Names have been populated', t => {
    t.assert(fileNames.length > 0);
});

test('Test Programs Compile', t => {
    let res;

    perf.start();
    testCases = compilePrograms(testStrings);
    res = perf.stop();

    t.assert(testStrings.length === testCases.length);
    t.log(`Successfully Compiled ${testStrings.length} cases in ${res.preciseWords}`)

});


test.todo('Actually Test `should-fail` cases');

import test from 'ava';
import Program from "./parse/ast/Program";
// @ts-ignore
import execution_time from "execution-time";
import Loader from "./loader";

const perf = execution_time();


// passing
let fileNames: Array<string> = [];
let testStrings: Array<string> = [];
let testCases: Array<Program> = [];


test.before('Initialize Test Cases', t => {
    // reads all files in a directory and appends their names into an array
    let results;

    perf.start();
    fileNames = Loader.getProgramNames(Loader.PASSING_PROGRAMS_DIR);
    testStrings = Loader.readProgramFiles(Loader.PASSING_PROGRAMS_DIR, fileNames);
    results = perf.stop();

    t.log(`Initialized ${fileNames.length} test cases in ${results.time.toFixed(1)} ms`)

});

test('File Names have been populated', t => {
    t.assert(fileNames.length > 0);
});

test('Test Programs Compile', t => {
    let res;

    perf.start();
    testCases = Loader.compilePrograms(testStrings);
    res = perf.stop();

    t.assert(testStrings.length === testCases.length);
    t.log(`Successfully Compiled ${testStrings.length} cases in ${res.preciseWords}`)

});


test.todo('Actually Test `should-fail` cases');

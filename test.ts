import test from 'ava';
import Program from "./parse/ast/Program";
// @ts-ignore
import execution_time from "execution-time";
import Loader from "./util/loader";

const perf = execution_time();


// passing
let fileNames: Array<string> = [];
let testStrings: Array<string> = [];
let testCases: Array<Program> = [];

let ProgramLoader = new Loader();


test.before('Initialize and Compile Test Cases', t => {

    let results;

    perf.start();
    ProgramLoader.loadProgramsFromDirectory(Loader.TEST_PROGRAM_DIR);
    results = perf.stop();

    t.log(`Initialized ${ProgramLoader.getProgramList().length} test cases in ${results.time.toFixed(1)} ms`)

});

test('Successfully Loaded Programs', t => {
    t.assert(ProgramLoader.getProgramList().length > 0);
});




// test.todo('Actually Test `should-fail` cases');

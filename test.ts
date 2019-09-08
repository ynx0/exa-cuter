import test from 'ava';
// @ts-ignore
import execution_time from "execution-time";
import Loader from "./src/util/loader";

const perf = execution_time();


let ProgramLoader = new Loader();


test.before('Initialize and Compile Test Cases', t => {

    let results;

    perf.start();
    ProgramLoader.loadProgramsFromDirectory(Loader.TEST_PROGRAM_DIR);
    // noinspection JSDeprecatedSymbols
    results = perf.stop();
    t.log(`Initialized ${ProgramLoader.getProgramList().length} test cases in ${results.time.toFixed(1)} ms`)

});

test('Successfully Loaded Programs', t => {
    t.assert(ProgramLoader.getProgramList().length > 0);
});

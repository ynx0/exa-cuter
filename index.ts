import Loader from "./src/util/loader";
import {SolutionManager} from "./src/util/SolutionManager";

// todo make loader a singleton
let ProgramLoader = new Loader();
ProgramLoader.loadProgramsFromDirectory(Loader.PASSING_PROGRAMS_DIR);

// let programID: string = ProgramLoader.getProgramList()[0];
// let program = ProgramLoader.getLoadedProgram(programID);


let programText = `
ADDI 1 1 T
MULI T T T
SUBI T 200 T
`.trim();

let solution = SolutionManager.makeSolution("Test Solution 1", [Loader.compileProgram(programText)]);
console.log(solution);
let success = SolutionManager.sol2bin(solution, './solutions/arith1.solution');
console.log(success);

// let solution1;
// SolutionManager.readSolution('./solutions/mitsuzen-hdi10-3.solution').then(solution => {
//     solution1 = solution;
//     console.log(solution1);
// });


// let sim = new Simulation();
// //
// let XA = new EXA(program, sim, {});
// XA.run();

// console.log(`Ran Program ${programID}`);
// console.log(XA.captureState());





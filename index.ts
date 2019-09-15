import Loader from "./src/util/loader";
import Environment from "./src/sim/Environment";
import EXA from "./src/sim/EXA";

// todo make loader a singleton
let ProgramLoader = new Loader();
ProgramLoader.loadProgramsFromDirectory(Loader.PASSING_PROGRAMS_DIR);

// let programID: string = ProgramLoader.getProgramList()[0];
// let program = ProgramLoader.getLoadedProgram(programID);


// let solution = SolutionManager.makeSolution("Test Solution 1", [Loader.compileProgram(programText)]);
// console.log(solution);
// let success = SolutionManager.sol2bin(solution, './solutions/arith1.solution');
// console.log(success);

// let solution1;
// SolutionManager.readSolution('./solutions/mitsuzen-hdi10-3.solution').then(solution => {
//     solution1 = solution;
//     console.log(solution1);
// });


const fileProgramText2 = `
MAKE
COPY 30 F
TEST EOF
WIPE
`;

const fileProgramText3 = `
MAKE
COPY 5 F
COPY 6 F
SEEK -1
TEST EOF
SEEK 9999
TEST EOF
NOOP
`;

let compiledProgram = Loader.compileProgram(fileProgramText3);
let env = new Environment();
let homeHost = env.createHost("RHIZOME", 3, 3);
let XA = new EXA("EXATEST001", compiledProgram, env);

env.addExa(XA);
homeHost.addEntity(XA);

// env.setup();

env.step();
env.step();
env.step();
env.step();
console.log(XA.F);
env.step();
console.log(XA.F);
env.step();
console.log(XA.F);
console.log(XA.isHalted());
env.step();
env.step();
env.step();
console.log(XA.captureState());
// XA.run();

// console.log(`Ran Program ${programID}`);
// console.log(XA.captureState());





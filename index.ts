// this file will export a bunch of stuff essentially. Right now it is gonna serve as an experimental entry point

import EXA from "./sim/EXA";
import Loader from "./loader";

// todo make loader a singleton
let ProgramLoader = new Loader();
ProgramLoader.loadProgramsFromDirectory(Loader.PASSING_PROGRAMS_DIR);

let programID: string = ProgramLoader.getProgramList()[0];
let program = ProgramLoader.getLoadedProgram(programID);


let XA = new EXA(program);
XA.run();


console.log(XA);





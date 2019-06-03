// this file will export a bunch of stuff essentially. Right now it is gonna serve as an experimental entry point

import EXA from "./sim/EXA";
import Loader from "./loader";


let compiledProgram = parser.getProgramAST(program6);

let XA = new EXA(compiledProgram);
XA.runUntilCycle(5);


console.log(XA);





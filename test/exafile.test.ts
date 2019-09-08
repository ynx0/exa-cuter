import test from 'ava';
import Loader from "../src/util/loader";
import Environment from "../src/sim/Environment";
import EXA from "../src/sim/EXA";
import Host from "../src/sim/Host";
import Program from "../src/parse/ast/Program";


/*
This file contains various tests related to the file functionality of EXAPUNKS.
 */


const fileProgram =
    `
MAKE
COPY 45 F
COPY 50 F
COPY F X
ADDI X 1 X
`;
let compiledProgram: Program;
let env: Environment;
let homeHost: Host;
let XA: EXA;


test.before('Init and Compile', t => {
    compiledProgram = Loader.compileProgram(fileProgram);
    env = new Environment();
    homeHost = env.createHost("RHIZOME", 3, 3);
    XA = new EXA("EXATEST001", compiledProgram, env);
    env.addExa(XA);
    homeHost.addEntity(XA);

});

// probably shouldn't do it like this but eh whatever
test.serial('Ensure file is properly written to', t => {
    env.step();
    env.step();
    env.step();
    t.assert(XA.F.getFile().getValueAt(0) === 45);
});

test.serial('Ensure EXA A properly halts', t => {
    env.step();
    env.step();
    t.assert(XA.isHalted());
});

test.serial('Ensure File Dropped after Exa Halts', t => {
    t.assert(homeHost.getFileIDs().length > 0);
});


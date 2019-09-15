import test from 'ava';
import Loader from "../src/util/loader";
import Environment from "../src/sim/Environment";
import EXA from "../src/sim/EXA";
import Host from "../src/sim/Host";
import Program from "../src/parse/ast/Program";



const fileProgramText2 = `
MAKE
COPY 30 F
WIPE
`;

let compiledProgram: Program;
let compiledProgram2: Program;
let env: Environment;
let homeHost: Host;
let XA: EXA;



test.before('Init and Compile', t => {
    compiledProgram = Loader.compileProgram(fileProgramText2);
    env = new Environment();
    homeHost = env.createHost("RHIZOME", 3, 3);
    XA = new EXA("EXATEST001", compiledProgram, env);
    env.addExa(XA);
    homeHost.addEntity(XA);
});

// probably shouldn't do it like this but eh whatever
test.serial('Ensure file is created', t => {
    env.step();
    env.step();
    t.assert(XA.F.hasFile());
});


test.serial('Ensure file is copied to', t => {
    env.step();
    t.log("File is" + XA.F.getFile().toString());
    t.assert(XA.F.getFile().getValueAt(0) === 30);
});

test.serial('Ensure File Dropped after Exa Halts', t => {
    env.step();
    env.step();
    t.assert(!XA.F.hasFile())
});


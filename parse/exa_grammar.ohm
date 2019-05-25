EXAScript {

    Program = Instruction*

    Instruction = CopyInstr
                | SwizInstr
                | MarkInstr
                | JumpInstr
                | TJumpInstr
                | FJumpInstr
                | TestInstr
                | ReplInstr
                | HaltInstr
                | KillInstr
                | LinkInstr
                | HostInstr
                | ModeInstr
                | VoidInstr
                | MakeInstr
                | GrabInstr
                | FileInstr
                | SeekInstr
                | DropInstr
                | WipeInstr
                | NoopInstr
                | noteInstr
                | RandInstr
                | AddInstr
                | SubtractInstr
                | MultiplyInstr
                | DivideInstr
                | LoopMacro

    Register = GeneralRegister
             | TestRegister
             | FileRegister
             | MessageRegister
             | HardwareRegister

    EXANumber = "-" digit4 -- negative
              |     digit4 -- positive

    // there must be a better way to do this
    digit4 = digit digit? digit? digit? space?
    // todo create a strict digit4 for swiz instruction which requires all 4 digits

    GeneralRegister = "X"
    TestRegister = "T"
    FileRegister = "F"
    MessageRegister = "M"
    HardwareRegister = "#" validString



    Parameter = Register | EXANumber
    label = validString //alnum+ newline
    newline = "\n"
    TestSubChars = "<" | "=" | ">"
    onlySpace = " " // todo make a more elegant solution to this
    validString = onlySpace? (alnum | "_")* newline?
    // apparently in ohm space is any whitespace not " " so i got messed up real bad
	validNoteString = onlySpace? (alnum | "_" | onlySpace)*

    CopyInstr = "COPY" Parameter Register // works
    SwizInstr = "SWIZ" Parameter Parameter Register

    MarkInstr = "MARK" label
    JumpInstr = "JUMP" label
    TJumpInstr = "TJMP" label
    FJumpInstr = "FJMP" label

    TestInstr = "TEST" Parameter TestSubChars Parameter -- value
              | "TEST" "MRD" -- comm
              | "TEST" "EOF" -- file

    // Interaction with other EXAs
    ReplInstr = "REPL" label
    HaltInstr = "HALT"
    KillInstr = "KILL"

    // Exa Movement and Host Inters
    LinkInstr = "LINK" Parameter
    HostInstr = "HOST" Register

    // EXA State Instructions
    ModeInstr = "MODE"
    VoidInstr = "VOID" MessageRegister
              | "VOID" FileRegister

    // File Instructions
    MakeInstr = "MAKE"
    GrabInstr = "GRAB" Parameter
    FileInstr = "FILE" Register
    SeekInstr = "SEEK" Parameter
    DropInstr = "DROP"
    WipeInstr = "WIPE"

    // Auxilary Instructions
    NoopInstr = "NOOP"
    noteInstr = "NOTE" validNoteString
    RandInstr = "RAND" Parameter Parameter Register

    // Arithmetic
    AddInstr = "ADDI" Parameter Parameter Register
    SubtractInstr = "SUBI" Parameter Parameter Register
    MultiplyInstr = "MULI"  Parameter Parameter Register
    DivideInstr = "DIVI" Parameter Parameter Register

    LoopMacro = "@REP" digit Instruction* "@END"

}

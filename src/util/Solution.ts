import Program from "../parse/ast/Program";

export type ProgramList  = {[key: string]: Program}

export class Solution {


    // these will be uint8arrs until I figure out what they represent

    public readonly fileHeader: Uint8Array;
    public readonly headerTwo: Uint8Array;
    public readonly solutionName: string;
    public readonly programs: ProgramList; // {<EXA Name>: Program>}

    constructor(fileHeader: Uint8Array, headerTwo: Uint8Array, solutionName: string, programs: ProgramList) {
        this.fileHeader = fileHeader;
        this.headerTwo = headerTwo;
        this.solutionName = solutionName;
        this.programs = programs;
    }

}

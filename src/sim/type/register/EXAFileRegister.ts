import EXARegister from "./EXARegister";
import EXAFile from "../../EXAFile";
import EXAValue from "../EXAValue";
import SimUtils from "../../../util/SimUtils";

class EXAFileRegister extends EXARegister{

    private file: EXAFile;
    private cursorPosition: number; // [0, fileReference.size() - 1]

    constructor() {
        super();
        this.cursorPosition = 0;
        this.file = EXAFile.NULL_FILE;
    }

    public hasFile() {
        return this.file !== EXAFile.NULL_FILE;
    }

    public getFile() {
        return this.file;
    }

    seekCursor(amount: number): void {
        this.cursorPosition = SimUtils.clampToRange(amount, 0, this.file.size() - 1);
    }

    getValue(): EXAValue {
        let word =  this.file.getValueAt(this.cursorPosition);
        this.cursorPosition++;
        return word;
    }

    void(): void {
        this.file.voidValueAt(this.cursorPosition);
    }

    testForEOF(): boolean {
        return this.cursorPosition === this.file.size() - 1;
    }

    setFile(file: EXAFile) {
        this.file = file;
    }
}

export default EXAFileRegister;

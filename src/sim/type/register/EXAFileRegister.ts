import EXARegister from "./EXARegister";
import {EXAFile} from "../../EXAFile";
import EXAValue from "../EXAValue";
import SimUtils from "../../../util/SimUtils";
import {EXAResult} from "../../../util/EXAResult";
import SimErrors from "../../SimErrors";

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

    public seekCursor(amount: number): void {
        this.cursorPosition = SimUtils.clampToRange(amount, 0, this.file.size() - 1);
    }

    getValue(): EXAValue {
        let word =  this.file.getValueAt(this.cursorPosition);
        this.cursorPosition++;
        return word;
    }

    setValue(newVal: EXAValue): EXAResult<boolean> {
        if (!this.hasFile()) {
            return {error: SimErrors.NO_FILE_IS_HELD};
        }
        this.file.setValueAt(this.cursorPosition, newVal);
        return {result: true};
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

/*
class EXAFileRegister extends EXARegister {

    private fileID: EXAFileID;
    private cursorPosition: number; // [0, fileReference.size() - 1]

    private static readonly NULL_FILE_ID = -1;

    constructor() {
        super();
        this.cursorPosition = 0;
        this.fileID = EXAFileRegister.NULL_FILE_ID;
    }

    public hasFile() {
        return this.fileID !== EXAFileRegister.NULL_FILE_ID;
    }

    public getFile() {
        return this.fileID;
    }

    seekCursor(amount: number): void {
        this.cursorPosition = SimUtils.clampToRange(amount, 0, this.fileID.size() - 1);
    }

    getValue(): EXAValue {
        let word =  this.fileID.getValueAt(this.cursorPosition);
        this.cursorPosition++;
        return word;
    }

    void(): void {
        this.fileID.voidValueAt(this.cursorPosition);
    }

    testForEOF(): boolean {
        return this.cursorPosition === this.fileID.size() - 1;
    }

    setFile(file: EXAFile) {
        this.fileID = file;
    }
}

// old code

 */

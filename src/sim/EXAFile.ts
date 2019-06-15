import Keywords from "./type/Keywords";
import EXAValue from "./type/EXAValue";


export class EXAFile {

    private readonly words: Keywords;
    private readonly id: EXAFileID;
    public static readonly NULL_FILE = new EXAFile(-1, []);

    constructor(id: number, words: Keywords) {
        this.id = id;
        this.words = words;
    }

    getValueAt(cursorPosition: number): EXAValue {
        return this.words[cursorPosition];
    }

    size(): number {
        return this.words.length;
    }

    getID(): number {
        return this.id;
    }

    voidValueAt(cursorPosition: number): void {
        this.words.splice(cursorPosition, 1);
    }

    setValueAt(cursorPosition: number, newVal: EXAValue) {
        this.words.splice(cursorPosition, 1, newVal);
    }
}

export type EXAFileID = number;

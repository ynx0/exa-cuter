import Keywords from "./type/Keywords";
import EXAValue from "./type/EXAValue";
import {EIDPrefixes, EntityID} from "./type/Entity";


export class EXAFile {

    private readonly words: Keywords;
    public readonly id: EntityID;
    public static readonly NULL_FILE = new EXAFile(EIDPrefixes.FILE + "???", []);

    constructor(id: EntityID, words: Keywords) {
        this.id = id;
        this.words = words;
    }

    getValueAt(cursorPosition: number): EXAValue {
        return this.words[cursorPosition];
    }

    size(): number {
        return this.words.length;
    }

    voidValueAt(cursorPosition: number): void {
        this.words.splice(cursorPosition, 1);
    }

    setValueAt(cursorPosition: number, newVal: EXAValue) {
        this.words.splice(cursorPosition, 1, newVal);

    }

    toString() {
        return JSON.stringify(this);
    }
}


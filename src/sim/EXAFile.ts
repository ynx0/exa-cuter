import Keyword from "./type/Keyword";
import Keywords from "./type/Keywords";

class EXAFile {

    private readonly words: Keywords;
    private readonly id: number;
    public static readonly NULL_FILE = new EXAFile(-1, []);

    constructor(id: number, words: Keywords) {
        this.id = id;
        this.words = words;
    }

    getValueAt(cursorPosition: number): Keyword {
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
}

export default EXAFile;

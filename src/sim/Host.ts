import Queue = require("queue-fifo");
import EXAMessage from "./type/EXAMessage";

class Host {
    private localMessageQueue: Queue<EXAMessage>;
    private readonly maxObjNum: number; // the maximum number of exa's/file objs a host can contain
    private currentObjCount: number;

    private objects: Array<File>; // this will store all the objects besides exas

    // the name will be used as its id
    constructor(name: string, x: number, y: number, width: number, height: number, initialObjectCount: number) {
        this.localMessageQueue = new Queue<EXAMessage>();
        this.maxObjNum =  width * height || (3 * 3);
        this.currentObjCount = initialObjectCount || 0;
        this.objects = [];
    }



    incrementObjectCount() {
        this.currentObjCount++;
    }

    decrementObjectCount() {
        this.currentObjCount--;
    }

    isFull() {

        return this.currentObjCount >= this.maxObjNum;
    }
}

export default Host;

import Queue = require("queue-fifo");
import EXAMessage from "./type/EXAMessage";

class Host {
    private localMessageQueue: Queue<EXAMessage>;

    constructor() {
        this.localMessageQueue = new Queue<EXAMessage>();
    }

}

export default Host;

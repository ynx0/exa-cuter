import EXAValue from "./EXAValue";
import Host from "../Host";

class EXAMessage {

    private value: EXAValue;
    private isGlobal: boolean;
    private originatingHost: Host;

    constructor(value: EXAValue, isGlobal: boolean, originatingHost: Host) {
        this.value = value;
        this.isGlobal = isGlobal;
        this.originatingHost = originatingHost;
    }

}

export default EXAMessage;

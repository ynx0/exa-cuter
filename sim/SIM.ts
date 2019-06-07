import Queue from "queue-fifo";

import EXAFile from "./EXAFile";
import Host from "./Host";
import Link from "./Link";
import HardwareRegister from "./HardwareRegister";
import EXAMessage from "./type/EXAMessage";

class SIM {

    private files: Array<EXAFile>;
    private hosts: Array<Host>;
    private links: Array<Link>;
    private hardwareRegisters: Array<HardwareRegister>;
    private globalMessageQueue: Queue<EXAMessage>;


    constructor() {
        this.files = [];
        this.hosts = [];
        this.links = [];
        this.hardwareRegisters = [];
        this.globalMessageQueue = new Queue<EXAMessage>();
        
    }



}

export default SIM;

import Queue from "queue-fifo";

import {EXAFile, EXAFileID} from "./EXAFile";
import Host from "./Host";
import Link from "./Link";
import HardwareRegister from "./HardwareRegister";
import EXAMessage from "./type/EXAMessage";
import EXA from "./EXA";
import HashMap from "hashmap";

class Simulation {

    private files: HashMap<EXAFileID, EXAFile>;
    private hosts: HashMap<string, Host>; // todo move to hashmap by file id
    private links: Array<Link>;
    private hardwareRegisters: Array<HardwareRegister>;
    private globalMessageQueue: Queue<EXAMessage>;
    private numberOfFilesCreated: number;


    constructor() {
        this.files = new HashMap();
        this.hosts = new HashMap();
        this.links = [];
        this.hardwareRegisters = [];
        this.globalMessageQueue = new Queue<EXAMessage>();
        this.numberOfFilesCreated = 0;
    }

    private generateFileID(): number {
        // user created files tend to start at 400, and increase
        // TODO get algorithm that accounts for already used file nums and stuff
        //  but also there are some weird behaviours on the axiomconnect doc so also that
        return 400 + this.numberOfFilesCreated++;
    }


    createFile(): EXAFile {
        return new EXAFile(this.generateFileID(), []);
    }

    /**
     *
     * @param requester
     * @param file
     * @returns whether or not to block
     */
    requestFileDrop(requester: EXA, file: EXAFile): boolean {
        throw new Error("UNIMPLEMENTED");
        let currHost = this.hosts.get(requester.getCurrentHostID());
        // todo must block if no space and figure out how to do so
        if (currHost.isFull()) {
            throw new Error("Blocking Behaviour encountered, Implement");
        }



    }

    requestLinkToID(valueFromParamRef: number) {
        throw new Error("UNIMPLEMENTED")
    }
}

export default Simulation;

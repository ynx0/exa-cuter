import {EIDPrefixes, EntityID} from "./type/Entity";

const fileBaseID = 400; // files created by player start at 400

class EntityIDGenerator {

    private numExa: number;
    private numFiles: number;
    private numHWRegs: number;
    private numHosts: number;

    constructor(numExa: number, numFiles: number, numHWRegs: number, numHosts: number) {
        this.numExa = numExa;
        this.numFiles = numFiles;
        this.numHWRegs = numHWRegs;
        this.numHosts = numHosts;
    }

    generateExaID(): EntityID {
        return EIDPrefixes.EXA + (this.numExa++);
    }

    generateFileID(): EntityID {
        return EIDPrefixes.FILE + (this.numFiles++) + fileBaseID;
    }

    generateHWRegID(): EntityID {
        return EIDPrefixes.HARDWARE_REGISTER + (this.numHWRegs++);
    }

    generateHostID() {
        return EIDPrefixes.HOST + (this.numHosts++);
    }

}

export default EntityIDGenerator;


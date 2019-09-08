import {EIDPrefixes, EntityID} from "./type/Entity";

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
        return EIDPrefixes.FILE + (this.numFiles++);
    }

    generateHWRegID(): EntityID {
        return EIDPrefixes.HARDWARE_REGISTER + (this.numHWRegs++);
    }

    generateHostID() {
        return EIDPrefixes.HOST + (this.numHosts++);
    }

}

export default EntityIDGenerator;


import HashMap from "hashmap";
import EXA from "./EXA";
import {EnvRequest} from "./EnvRequest";
import {EnvRequestType} from "./EnvRequestType";
import Host from "./Host";
import {EntityID} from "./type/Entity";
import HardwareRegister from "./HardwareRegister";
import {EXAFile} from "./EXAFile";
import Keywords from "./type/Keywords";
import EntityIDGenerator from "./EntityIDGenerator";
import BlockReason from "./type/BlockReason";
import {StatusUpdate, StatusUpdateType} from "./type/StatusUpdate";
import _ from "lodash";

class Environment {

    // Note, right now the exa returns a list of side effects,
    // but i think that they might only able to create at most one at a time
    // if this is proven, i will refactor to make it into an object instead of a list of one object
    // TODO Refactor the envbuses to have a more specific object type
    // private envbus_in: Array<object>;  // Queue<SimulationEvent>
    private envbus_out: HashMap<EntityID, StatusUpdate | null>; // {key: <exa exaID>, value: Array of statusupdates}
    private exaList: Array<EXA>;
    private hwrList: Array<HardwareRegister>;
    private fileList: Array<EXAFile>;
    private readonly hostList: Array<Host>;
    private idGen: EntityIDGenerator;
    private graveyardList: Array<EXA>;
    private cycleCount: number;


    // TODO Possibly refactor the {exa,hwr,file,host}List to be jsobjects of type {[key:EntityID]:$objtype}
    // because im really not iterating much over them. the primary use is lookup by id so using js object/hashmap would prob be best...
    // but that is for another refactor cause i just want thing working

    constructor() {
        this.envbus_out = new HashMap<EntityID, StatusUpdate | null>();
        this.hwrList = [];
        this.fileList = [];
        this.exaList = [];
        this.graveyardList = [];
        this.hostList = [];
        this.idGen = new EntityIDGenerator(0, 0, 0, 0);
        this.cycleCount = 0;
    }

    // POSSIBLE TODO: Deduplicate the create$ENTITY() methods because they share 90% the same code, and do it based on the constructor passed in.

    /**
     *
     * @param keywords
     * @return The ID associated with the newly created file.
     */
    createNewFile(keywords: Keywords): EXAFile {
        const newFileID = this.idGen.generateFileID();
        let newFile = new EXAFile(newFileID, keywords);
        this.fileList.push(newFile);
        return newFile;
    }

    createHWRegister(): HardwareRegister {
        const newHWRegID = this.idGen.generateHWRegID();
        let newHWReg = new HardwareRegister();
        this.hwrList.push(newHWReg);
        return newHWReg;
    }

    addEntityIDToHost(entityID: EntityID, hostID: string) {
        const targetHost = this.hostList.find(h => h.id === hostID); // get the the target host by exaID
        if (targetHost) {
            targetHost.addEntityID(entityID); // add the exaID to the host
        } else {
            throw new Error(`Error: Tried to add entity ${entityID} to non-existent host ${hostID}`);
        }
    }


    // MARK - Exa Methods
    getExaByID(exaId: EntityID): EXA {
        let exa = this.exaList.find(exa => exa.id === exaId);
        if (!exa) {
            throw `Unable to find exa with id ${exaId}`;
        }
        return exa;
    }

    // MARK - Host Methods
    createHost(hostname: EntityID, width: number, height: number): Host {
        const newHostID = this.idGen.generateHostID();
        const newHost = new Host(newHostID, hostname, 0, 0, width, height);
        this.hostList.push(newHost);
        return newHost;
    }

    getHostByID(hostID: EntityID): Host {
        let host = this.hostList.find(host => host.id === hostID);
        if (!host) {
            throw `Unable to find exa with id ${hostID}`;
        }
        return host;
    }

    getHostFromExaID(exaID: EntityID): Host {
        // this seems kinda bad performance wise,
        // maybe a better data structure would be way better
        // but idk real programming so this will have to do for now
        let host = this.hostList.find(host => host.getExaIDs().includes(exaID));
        if (!host) {
            throw new Error(`Error: Unable to find host for exaID: ${exaID}. This means that the EXA is not assigned to a host (dangling exa)`);
        }
        return host;
    }

    getHostName(exaID: EntityID): string {
        return this.getHostFromExaID(exaID).hostName;
    }


    addExa(exa: EXA) {
        this.exaList.push(exa);
    }

    /**
     *
     * @param exaID
     * @returns the removed exa
     */
    removeExa(exaID: EntityID): EXA | null {
        let exaIndex = this.exaList.findIndex(exa => exa.id === exaID);
        let exaToRemove = this.exaList[exaIndex];
        if (exaIndex) {
            this.getHostFromExaID(exaToRemove.id).removeEntity(exaToRemove.id);
            this.exaList.splice(exaIndex, 1);
        }
        return exaToRemove;
    }


    processEnvRequest(req: EnvRequest) {
        const reqType = req.requestType;
        const exaID = req.exaID;
        const exa = this.getExaByID(exaID);
        let currHost = this.getHostFromExaID(exaID);


        switch (reqType) {
            case EnvRequestType.NO_REQ:
                break;
            case EnvRequestType.GET_HOST:
                break;
            case EnvRequestType.MAKE_FILE:
                let newFile = this.createNewFile([]);
                this.pushStatusUpdate(exaID, new StatusUpdate(StatusUpdateType.NEW_FILE, [newFile]));
                console.log("[ENV] Created file for id: " + exaID);
                break;
            case EnvRequestType.LINK:
                break;
            case EnvRequestType.DROP_FILE:
                // first, figure out if there is room on the host
                // if there is, create a file, put it in the list of files, and give the exa the file object
                // otherwise, set the exa's state to blocked and do not make the file object
                if (currHost.isFull()) {
                    exa.setBlocked(BlockReason.BLOCKED_ON_DROP);
                } else {
                    let poppedFile = exa.F.popFile();
                    currHost.addEntityID(poppedFile.id);
                }
                break;
            case EnvRequestType.INFORM_HALT:
            case EnvRequestType.CONFIRM_KILLED:
                console.log(`[ENV] INFO: ${exaID} has been terminated`);
                this.graveyardList.push(exa);
                currHost.addEntityID(exa.F.popFile().id); // EXAs drop their file when they are terminated
                this.removeExa(exaID);
                break;

            case EnvRequestType.INFORM_BLOCKED:
                break;

            case EnvRequestType.WIPE_FILE:
                let fileToRemove = exa.F.popFile();
                _.pull(this.fileList, fileToRemove);
                break;
            default:
                throw `Unknown EnvRequest: ${req}`;
        }
        this.cycleCount++;
    }



    step() {
        for (let exa of this.exaList) {
            let envRequest;
            envRequest = exa.runStep();
            if (envRequest) {
                // console.log(("[ENV] Received new env request:"));
                // console.dir(envRequest);
                this.processEnvRequest(envRequest);
            }
        }
    }


    getStatusUpdates(exaID: EntityID) {
        return this.envbus_out.get(exaID);
    }

    pushStatusUpdate(exaID: EntityID, event: StatusUpdate) {
        this.envbus_out.set(exaID, event)
    }


    canExaReadMsg(exaID: EntityID) {

    }
}

export default Environment;

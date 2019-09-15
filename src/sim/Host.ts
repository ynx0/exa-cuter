import Queue = require("queue-fifo");
import EXAMessage from "./type/EXAMessage";
import {EIDPrefixes, EntityID} from "./type/Entity";


class Host {

    private localMessageQueue: Queue<EXAMessage>;
    private readonly maxObjNum: number; // the maximum number of exa's/file objs a host can contain
    private entityIDs: Array<EntityID>;     // this will store all the object ids, including exa ids
    public readonly id: EntityID; // i guess a host is an entity too, but its not an object so be careful in mixing the two up
    public readonly hostName: string;

    // the name will be used as its exaID
    constructor(id: EntityID, hostName: string, x: number, y: number, width: number, height: number) {
        this.localMessageQueue = new Queue<EXAMessage>();
        this.maxObjNum = width * height;
        this.entityIDs = [];
        this.id = id;
        this.hostName = hostName;
    }

    /**
     * Convenience method to add any id
     */
    addEntity<T extends { id: EntityID }>(entity: T) {
        console.log(`Added entity ${entity.constructor.name} with id ${entity.id}`);
        if (!this.hasEntity(entity.id)) {
            // ensure no duplicates
            this.addEntityID(entity.id);
        } else {
            console.warn("[WARN] Tried to add duplicate Entity with id " + entity.id);
        }
    }

    addEntityID(id: EntityID) {
        if (this.isFull()) {
            throw new Error("Error: Tried to add object to a host that was full.");
        }


        this.entityIDs.push(id);
    }

    getExaIDs() {
        // console.log(this.entityIDs);
        return this.entityIDs.filter(id => id.startsWith(EIDPrefixes.EXA))
    }

    getFileIDs() {
        return this.entityIDs.filter(id => id.startsWith(EIDPrefixes.FILE))
    }

    getHWRegIDs() {
        return this.entityIDs.filter(id => id.startsWith(EIDPrefixes.HARDWARE_REGISTER))
    }

    isFull() {
        return this.entityIDs.length >= this.maxObjNum;
    }

    removeEntity(id: EntityID) {
        this.entityIDs.indexOf(id);
    }

    private hasEntity(id: EntityID) {
        return this.entityIDs.indexOf(id) > -1;
    }
}

export default Host;

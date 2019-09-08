import {EXAFile} from "../EXAFile";

export class StatusUpdate {

    public readonly args: any[];
    public readonly type: StatusUpdateType;

    constructor(type: StatusUpdateType, args: Array<EXAFile | null>) {
        this.type = type;
        this.args = args;
    }
}

export enum StatusUpdateType {
    KILLED,
    NEW_FILE
}

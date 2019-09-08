import {EnvRequestType} from "./EnvRequestType";
import {EntityID} from "./type/Entity";

export class EnvRequest {
    public readonly exaID: EntityID;
    public readonly requestType: EnvRequestType;
    public readonly params: Array<any>;

    constructor(id: EntityID, request: EnvRequestType, params: Array<any> = []) {
        this.exaID = id;
        this.requestType = request;
        this.params = params;
    }
}

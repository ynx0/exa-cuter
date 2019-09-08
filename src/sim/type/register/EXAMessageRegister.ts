import EXARegister from "./EXARegister";
import EXAValue from "../EXAValue";
import {EXAResult} from "../../../util/EXAResult";

class EXAMessageRegister extends EXARegister {


    constructor() {
        super();

    }

    setValue(newVal: EXAValue): EXAResult<boolean> {
        // TODO Work out the message register
        return super.setValue(newVal);
    }

    attemptRead(): EXAResult<EXAValue> {
        throw 'unimplemented'
        // return {value: 0};
    }

}

export default EXAMessageRegister;

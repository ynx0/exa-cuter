import EXARegister from "./EXARegister";
import EXAValue from "../EXAValue";

class EXAMessageRegister extends EXARegister {


    constructor() {
        super();

    }

    setValue(newVal: EXAValue) {
        super.setValue(newVal);

    }

    getValue(): EXAValue {
        return 0;
    }

}

export default EXAMessageRegister;

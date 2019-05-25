import Parameter from "./Parameter";
import Operations from "./Operations";


class TestExpression {
    readonly param1: Parameter;
    readonly operation: Operations;
    readonly param2: Parameter;


    constructor(param1: Parameter, operationString: string, param2: Parameter) {
        this.param1 = param1;
        let operationEnumStr = operationString as keyof typeof Operations;
        this.operation = Operations[operationEnumStr];
        this.param2 = param2;
    }

}

export default TestExpression

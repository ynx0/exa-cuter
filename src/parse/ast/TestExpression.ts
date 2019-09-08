import ParameterRef from "./ParameterRef";
import Operations from "./Operations";


class TestExpression {
    readonly param1: ParameterRef;
    readonly operation: Operations;
    readonly param2: ParameterRef;


    constructor(param1: ParameterRef, operationString: string, param2: ParameterRef) {
        this.param1 = param1;

        // todo refactor
        switch (operationString) {
            case Operations.EQUALS:
                this.operation = Operations.EQUALS;
                break;
            case Operations.GREATER_THAN:
                this.operation = Operations.GREATER_THAN;
                break;
            case Operations.LESS_THAN:
                this.operation = Operations.LESS_THAN;
                break;
            default:
                throw new Error(`Invalid operation string given: '${operationString}'`);
        }

        this.param2 = param2;
    }

    toString() {
        return this.param1.toString() + ' ' + this.operation.toString() + ' ' + this.param2.toString();
    }


}

export default TestExpression

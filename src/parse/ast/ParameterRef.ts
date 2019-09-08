
export default abstract class ParameterRef {
    abstract getValue(): any;

    toString() {
        return this.getValue().toString();
    }
}



export default abstract class Parameter {
    abstract getValue(): any;

    toString() {
        return this.getValue().toString();
    }
}


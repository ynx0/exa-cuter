class Instruction {
    readonly name: any;
    readonly args: any[];

    constructor(info: any) {
        this.name = info[0];
        this.args = [info[1] || null, info[2] || null, info[3] || null];
    }

    toString() {
        return `{${this.name} ${this.args}}`
    }
}
export default Instruction;

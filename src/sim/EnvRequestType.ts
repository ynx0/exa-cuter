// todo possibly just use InstructionNames instead of this
export enum EnvRequestType {
    CONFIRM_KILLED, // this request also seems redundant.
    INFORM_BLOCKED, // i really don't think this is necessary, but i just put it here anyway
    NO_REQ, // means that the exa did not produce any side effects
    // Although this is not a "request" per-se, it allows the environment to know when an exa halted and handle it gracefully
    INFORM_HALT,
    GET_HOST,
    MAKE_FILE,
    DROP_FILE,
    LINK
}

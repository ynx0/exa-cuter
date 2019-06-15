import SimErrors from "../sim/SimErrors";


export type EXAError = {error: SimErrors};
export type Value<T> = {result: T}; // todo refactor this to just T instead of result: T

export type EXAResult<T> = EXAError | Value<T>;


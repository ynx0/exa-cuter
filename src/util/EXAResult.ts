import SimErrors from "../sim/SimErrors";


export type EXAError = {error: SimErrors, value: null};
export type Value<T> = {error: null, value: T}; // todo refactor this to just T instead of value: T

export type EXAResult<T> = EXAError | Value<T>;



declare module 'binary-file' {
    type NumericType = 'Int8' | 'UInt8' | 'Int16' | 'UInt16' | 'Int32' | 'UInt32' | 'Float' | 'Double'
    type Endianness = 'LE' | 'BE'
    class BinaryFile {

        fd: number;
        littleEndian: boolean;
        path: string;
        mode: string;
        endianness: Endianness;
        cursor: number;


        constructor (path: string, mode: string, littleEndian: boolean)
        open(): Promise<any>;
        size(): Promise<number>
        seek(position: number): number
        tell(): number
        close(): Promise<any>
        read(length: number, position?: number): Promise<Buffer>
        _readNumericType(type: NumericType, position?: number): number

        readInt8(position?: number): Promise<number>
        readUInt8(position?: number): Promise<number>
        readInt16(position?: number): Promise<number>
        readUInt16(position?: number): Promise<number>
        readInt32(position?: number): Promise<number>
        readUInt32(position?: number): Promise<number>
        readFloat(position?: number): Promise<number>
        readDouble(position?: number): Promise<number>

        readString(length: number, position?: number): Promise<string>

        write(buffer: Buffer, position?: number): Promise<number>

        readInt8(position?: number): Promise<number>
        readUInt8(position?: number): Promise<number>
        readInt16(position?: number): Promise<number>
        readUInt16(position?: number): Promise<number>
        readInt32(position?: number): Promise<number>
        readUInt32(position?: number): Promise<number>
        readFloat(position?: number): Promise<number>
        readDouble(position?: number): Promise<number>

        writeInt8(value: number, position?: number): Promise<number>
        writeUInt8(value: number, position?: number): Promise<number>
        writeInt16(value: number, position?: number): Promise<number>
        writeUInt16(value: number, position?: number): Promise<number>
        writeInt32(value: number, position?: number): Promise<number>
        writeUInt32(value: number, position?: number): Promise<number>
        writeFloat(value: number, position?: number): Promise<number>
        writeDouble(value: number, position?: number): Promise<number>

        writeString(value: string, position?: number): Promise<number>
    }

    export = BinaryFile;
}


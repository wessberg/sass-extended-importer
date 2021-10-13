import fsModule from "fs";

export type ReadonlyFileSystem = Pick<typeof fsModule, "stat" | "statSync" | "lstat" | "lstatSync" | "readFileSync" | "readdirSync" | "realpathSync">;
export type FileSystem = ReadonlyFileSystem & Pick<typeof fsModule, "writeFileSync" | "mkdirSync" | "unlinkSync">;

import {FsHook} from "./fs/fs-hook";

export interface Hooks {
	fs: Partial<FsHook>;
}
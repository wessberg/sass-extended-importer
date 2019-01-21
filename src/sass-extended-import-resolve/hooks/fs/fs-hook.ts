export interface FsHook {
	existsSync: typeof import("fs").existsSync;
}
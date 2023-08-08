import path from "crosspath";
import type {TestFileRecord} from "./test-file.js";
import {createFsFromVolume, Volume} from "memfs";
import type {FileSystem} from "../../src/lib/file-system.js";

export function createVirtualFileSystem(files: Pick<TestFileRecord, "fileName" | "text">[]): FileSystem {
	const vol = new Volume();
	for (const file of files) {
		vol.mkdirSync(path.dirname(file.fileName), {recursive: true});
		vol.writeFileSync(path.normalize(file.fileName), file.text);
	}

	return createFsFromVolume(vol) as unknown as FileSystem;
}

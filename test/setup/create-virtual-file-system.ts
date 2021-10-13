import path from "crosspath";
import {TestFileRecord} from "./test-file";
import {createFsFromVolume, Volume} from "memfs";
import {FileSystem} from "../../src/lib/file-system";

export function createVirtualFileSystem(files: Pick<TestFileRecord, "fileName"|"text">[]): FileSystem {
	const vol = new Volume();
	for (const file of files) {
		vol.mkdirSync(path.dirname(file.fileName), {recursive: true});
		vol.writeFileSync(path.normalize(file.fileName), file.text);
	}

	return createFsFromVolume(vol) as unknown as FileSystem;
}

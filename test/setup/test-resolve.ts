import {TestFileRecord} from "./test-file";
import {resolve, ExtendedImporterOptions} from "../../src/importer";
import {FileResult} from "./test-result";
import {createVirtualFileSystem} from "./create-virtual-file-system";

export interface TestResolveResult {
	output: FileResult;
}

export interface TestResolveOptions extends Omit<ExtendedImporterOptions, "fileSystem"> {}

/**
 * Prepares a test
 */
export async function testResolve(path: string, dependencies: Omit<TestFileRecord, "entry">[], options?: Partial<TestResolveOptions>): Promise<TestResolveResult> {
	const fileSystem = createVirtualFileSystem(dependencies);

	const result = resolve(path, {...options, fileSystem});
	if (result == null) {
		throw new ReferenceError(`Could not resolve ${path} from ${options?.cwd ?? process.cwd()}`);
	}

	return {
		output: {
			code: result.contents,
			fileName: result.file
		}
	};
}

import type {TestFileRecord} from "./test-file.js";
import type {ExtendedImporterOptions} from "../../src/importer.js";
import {resolve} from "../../src/importer.js";
import type {FileResult} from "./test-result.js";
import {createVirtualFileSystem} from "./create-virtual-file-system.js";

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

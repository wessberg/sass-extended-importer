/* eslint-disable @typescript-eslint/naming-convention */
import type {TestContext} from "./test-context.js";
import {createTestContext} from "./test-context.js";
import type {TestFileRecord, TestFileStructure} from "./test-file.js";
import {createTestFileStructure} from "./test-file.js";
import {createVirtualFileSystem} from "./create-virtual-file-system.js";
import type {FileSystem} from "../../src/lib/file-system.js";

export interface TestSetup {
	context: TestContext;
	fileSystem: FileSystem;
	fileStructure: TestFileStructure;
}

export function createTestSetup(inputFiles: TestFileRecord[], options?: Partial<TestContext>): TestSetup {
	const context = createTestContext(options);
	const fileStructure = createTestFileStructure(inputFiles, context);
	const fileSystem = createVirtualFileSystem(fileStructure.files);

	return {
		context,
		fileStructure,
		fileSystem
	};
}

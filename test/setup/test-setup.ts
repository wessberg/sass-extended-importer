/* eslint-disable @typescript-eslint/naming-convention */
import {createTestContext, TestContext} from "./test-context";
import {createTestFileStructure, TestFileRecord, TestFileStructure} from "./test-file";
import {createVirtualFileSystem} from "./create-virtual-file-system";
import {FileSystem} from "../../src/lib/file-system";

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

import {createTestSetup} from "./test-setup.js";
import type {TestFileRecord} from "./test-file.js";
import {promisify} from "util";
import type {ExtendedImporterOptions} from "../../src/importer.js";
import {createImporter} from "../../src/importer.js";
import type {FileResult} from "./test-result.js";
import type {Sass} from "../../src/lib/sass.js";

export interface TestImporterResult {
	output: FileResult[];
}

export interface TestImporterOptions extends Omit<ExtendedImporterOptions, "fileSystem"> {
	sass: Sass;
}

/**
 * Prepares a test
 */
export async function testImporter(inputFiles: TestFileRecord[], options?: Partial<TestImporterOptions>): Promise<TestImporterResult> {
	const {
		context,
		fileSystem,
		fileStructure: {entries}
	} = createTestSetup(inputFiles, options);
	const output: FileResult[] = [];

	if (entries.length === 0) {
		throw new ReferenceError(`No entry could be found`);
	}

	const importer = createImporter({...options, ...context, fileSystem});
	const sass = promisify(context.sass.render);

	for (const entry of entries) {
		const result = await sass({
			file: entry.fileName,
			data: entry.text,
			importer
		});
		if (result == null) continue;
		const {css, stats} = result;

		output.push({
			code: css.toString(),
			fileName: stats.entry
		});
	}

	return {
		output
	};
}

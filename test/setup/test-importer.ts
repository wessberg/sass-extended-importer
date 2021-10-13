import {createTestSetup} from "./test-setup";
import {TestFileRecord} from "./test-file";
import {promisify} from "util";
import {createImporter, ExtendedImporterOptions} from "../../src/importer";
import {FileResult} from "./test-result";
import {Sass} from "../../src/lib/sass";

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
		const {css, stats} = await sass({
			file: entry.fileName,
			data: entry.text,
			importer
		});
		output.push({
			code: css.toString(),
			fileName: stats.entry
		});
	}

	return {
		output
	};
}

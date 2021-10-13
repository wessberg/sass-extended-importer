import {createTestSetup} from "./test-setup";
import {TestFileRecord} from "./test-file";
import {promisify} from "util";
import extendedImporter, {ExtendedImporterOptions} from "../../src/importer";
import {FileResult} from "./test-result";
import {Sass} from "../../src/lib/sass";

export interface TestSassResult {
	output: FileResult[];
}

export interface TestSassOptions extends Omit<ExtendedImporterOptions, "fileSystem"> {
	sass: Sass;
}

/**
 * Prepares a test
 */
export async function testSass(inputFiles: TestFileRecord[], options?: Partial<TestSassOptions>): Promise<TestSassResult> {
	const {
		context,
		fileSystem,
		fileStructure: {entries}
	} = createTestSetup(inputFiles, options);
	const output: FileResult[] = [];

	if (entries.length === 0) {
		throw new ReferenceError(`No entry could be found`);
	}

	const importer = extendedImporter({...options, ...context, fileSystem});
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

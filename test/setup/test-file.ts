import path from "crosspath";
import type {TestContext} from "./test-context.js";

export interface TestFileRecord {
	entry: boolean;
	fileName: string;
	text: string;
}

export interface TestFileStructure {
	files: TestFileRecord[];
	entries: TestFileRecord[];
}

export interface ExternalTestFilesOptions {
	main: string;
	subPath: string;
}

export function createExternalTestFiles(module: string, text: string, {main = "index.scss", subPath = `/index.scss`}: Partial<ExternalTestFilesOptions> = {}): TestFileRecord[] {
	return [
		{
			entry: false,
			fileName: `node_modules/${module}/package.json`,
			text: `
				{
					"name": "${module}",
					"version": "1.0.0",
					"main": "${main}"
				}
			`
		},
		{
			entry: false,
			fileName: `node_modules/${module}${subPath}`,
			text
		}
	];
}

export function createTestFileStructure(input: TestFileRecord[], context: TestContext): TestFileStructure {
	const files = input.map(file => ({...file, fileName: path.isAbsolute(file.fileName) ? file.fileName : path.join(context.cwd, file.fileName)}));

	const entries = files.filter(file => file.entry);

	return {
		files,
		entries
	};
}

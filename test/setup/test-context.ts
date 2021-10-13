import path from "crosspath";
import sassModule from "sass";
import {Sass} from "../../src/lib/sass";

export interface TestContext {
	cwd: string;
	sass: Sass;
}

export function createTestContext({sass = sassModule, cwd = process.cwd()}: Partial<TestContext> = {}): TestContext {
	if (!path.isAbsolute(cwd)) {
		cwd = path.join(process.cwd(), cwd);
	}

	return {
		cwd,
		sass
	};
}

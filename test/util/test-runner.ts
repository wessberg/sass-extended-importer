import path from "crosspath";
import fs from "fs";
import semver from "semver";
import avaTest, {type ExecutionContext} from "ava";
import type * as Sass from "sass";

function getNearestPackageJson(from = import.meta.url): Record<string, unknown> | undefined {
	// There may be a file protocol in from of the path
	const normalizedFrom = path.urlToFilename(from);
	const currentDir = path.dirname(normalizedFrom);

	const pkgPath = path.join(currentDir, "package.json");
	if (fs.existsSync(pkgPath)) {
		return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
	} else if (currentDir !== normalizedFrom) {
		return getNearestPackageJson(currentDir);
	} else {
		return undefined;
	}
}

const pkg = getNearestPackageJson();

export interface ExecutionContextOptions {
	sass: typeof Sass;
	version: string;
}

export type ExtendedImplementation = (t: ExecutionContext, options: ExecutionContextOptions) => void | Promise<void>;

const {devDependencies} = pkg as {devDependencies: Record<string, string>};

// Map of all Sass and NodeSass versions parsed from package.json
const SASS_OPTIONS_ENTRIES = new Map<string, ExecutionContextOptions>();
const NODE_SASS_OPTIONS_ENTRIES = new Map<string, ExecutionContextOptions>();

const sassRangeRegex = /(npm:sass@)?[\^~]*(.+)$/;
const nodeSassRangeRegex = /(npm:node-sass@)?[\^~]*(.+)$/;

const sassFilter = process.env.SASS_VERSION;
const nodeSassFilter = process.env.NODE_SASS_VERSION;

for (const [specifier, range] of Object.entries(devDependencies)) {
	const sassMatch = range.match(sassRangeRegex);
	const nodeSassMatch = range.match(nodeSassRangeRegex);

	const sassMatchContext = sassMatch?.[1];
	const sassMatchVersion = sassMatch?.[2];

	const nodeSassMatchContext = nodeSassMatch?.[1];
	const nodeSassMatchVersion = nodeSassMatch?.[2];

	if (sassMatchVersion != null && (sassMatchContext === "npm:sass@" || specifier === "sass")) {
		if (
			sassFilter === undefined ||
			(sassFilter.toUpperCase() === "CURRENT" && specifier === "typescript") ||
			semver.satisfies(sassMatchVersion, sassFilter, {includePrerelease: true})
		) {
			SASS_OPTIONS_ENTRIES.set(sassMatchVersion, {
				sass: await import(specifier),
				version: sassMatchVersion
			});
		}
	} else if (nodeSassMatchVersion != null && (nodeSassMatchContext === "npm:node-sass@" || specifier === "node-sass")) {
		if (
			nodeSassFilter === undefined ||
			(nodeSassFilter.toUpperCase() === "CURRENT" && specifier === "node-sass") ||
			semver.satisfies(nodeSassMatchVersion, nodeSassFilter, {includePrerelease: true})
		) {
			NODE_SASS_OPTIONS_ENTRIES.set(nodeSassMatchVersion, {
				sass: await import(specifier),
				version: nodeSassMatchVersion
			});
		}
	}
}

if (SASS_OPTIONS_ENTRIES.size === 0) {
	throw new Error(`The SASS_VERSION environment variable matches none of the available Sass versions.
Filter: ${process.env.SASS_VERSION}`);
}

if (NODE_SASS_OPTIONS_ENTRIES.size === 0) {
	throw new Error(`The NODE_SASS_VERSION environment variable matches none of the available NodeSass versions.
Filter: ${process.env.NODE_SASS_VERSION}`);
}

interface TestRunOptions {
	only: boolean;
	serial: boolean;
	skip: boolean;
}

interface TestVersionGlobs {
	sass: string;
	nodeSass: string;
}

export function test(title: string, versionGlobs: Partial<TestVersionGlobs> | "*" | undefined, impl: ExtendedImplementation, runOptions?: Partial<TestRunOptions>) {
	const allSassOptions = [...SASS_OPTIONS_ENTRIES.values()];
	const allNodeSassOptions = [...NODE_SASS_OPTIONS_ENTRIES.values()];

	const sassVersionGlob = versionGlobs === "*" || versionGlobs?.sass === undefined ? "*" : versionGlobs.sass;
	const nodeSassVersionGlob = versionGlobs === "*" || versionGlobs?.nodeSass === undefined ? "*" : versionGlobs.nodeSass;

	const filteredSassOptions =
		sassVersionGlob === "*"
			? allSassOptions
			: [...SASS_OPTIONS_ENTRIES.entries()].filter(([version]) => semver.satisfies(version, sassVersionGlob, {includePrerelease: true})).map(([, options]) => options);

	const filteredNodeSassOptions =
		nodeSassVersionGlob === "*"
			? allNodeSassOptions
			: [...NODE_SASS_OPTIONS_ENTRIES.entries()].filter(([version]) => semver.satisfies(version, nodeSassVersionGlob, {includePrerelease: true})).map(([, options]) => options);

	const iterationOptions = [
		...allSassOptions.map(options => ({
			options,
			type: "sass",
			matchesGlob: filteredSassOptions.includes(options)
		})),
		...allNodeSassOptions.map(options => ({
			options,
			type: "node-sass",
			matchesGlob: filteredNodeSassOptions.includes(options)
		}))
	] as const;
	for (const {options, type, matchesGlob} of iterationOptions) {
		const fullTitle = `${title} (${type} v${options.version}${matchesGlob ? "" : " is not applicable"})`;

		const testHandler = async (t: ExecutionContext) => (matchesGlob ? impl(t, options) : t.pass());

		if (Boolean(runOptions?.only)) {
			avaTest.only(fullTitle, testHandler);
		} else if (Boolean(runOptions?.serial)) {
			avaTest.serial(fullTitle, testHandler);
		} else if (Boolean(runOptions?.skip)) {
			avaTest.skip(fullTitle, testHandler);
		} else {
			avaTest(fullTitle, testHandler);
		}
	}
}

test.only = function (title: string, versionGlobs: Partial<TestVersionGlobs> | "*" | undefined, impl: ExtendedImplementation) {
	return test(title, versionGlobs, impl, {only: true});
};

test.serial = function (title: string, versionGlobs: Partial<TestVersionGlobs> | "*" | undefined, impl: ExtendedImplementation) {
	return test(title, versionGlobs, impl, {serial: true});
};

test.skip = function (title: string, versionGlobs: Partial<TestVersionGlobs> | "*" | undefined, impl: ExtendedImplementation) {
	return test(title, versionGlobs, impl, {skip: true});
};

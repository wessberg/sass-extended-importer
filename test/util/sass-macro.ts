import pkg from "../../package.json";
import type {ExecutionContext, OneOrMoreMacros, Macro} from "ava";
import {Sass} from "../../src/lib/sass";

// ava macros
export interface ExtendedImplementationArgumentOptions {
	sass: Sass;
}
export type ExtendedImplementation = (t: ExecutionContext, options: ExtendedImplementationArgumentOptions) => void | Promise<void>;
function makeSassMacro(specifier: string) {
	const macro: Macro<[ExtendedImplementation]> = async (t, impl) => impl(t, {sass: await import(specifier)});
	macro.title = (provided = "") => `${provided} (${specifier})`;

	return macro;
}

const noMatchingImplementationMacro: Macro<[ExtendedImplementation]> = t => {
	t.pass("No matching Sass implementation");
};
noMatchingImplementationMacro.title = (provided = "") => `${provided} (No matching Sass implementation)`;

const {devDependencies} = pkg as {devDependencies: Record<string, string>};

// Set of all sass implementations parsed from package.json
const availableSassImplementations = new Set<string>();
// Map of sass implementations to ava macros
const macros = new Map<string, Macro<[ExtendedImplementation]>>();

const filter = process.env.SASS_IMPLEMENTATION;

for (const specifier of Object.keys(devDependencies)) {
	if (specifier !== "sass" && specifier !== "node-sass") continue;
	availableSassImplementations.add(specifier);
	if (filter === undefined || filter.toUpperCase() === "*" || filter.toUpperCase() === "ALL" || filter.toUpperCase() === specifier.toUpperCase()) {
		macros.set(specifier, makeSassMacro(specifier));
	}
}

if (macros.size === 0) {
	throw new Error(`The SASS_IMPLEMENTATION environment variable matches none of the available TypeScript versions.
Filter: ${process.env.SASS_IMPLEMENTATION}
Available implementations: ${[...availableSassImplementations].join(", ")}`);
}

export function withSassImplementation(extraFilter: string): OneOrMoreMacros<[ExtendedImplementation], unknown> {
	const filteredMacros = [...macros.entries()].filter(([specifier]) => extraFilter === "*" || extraFilter === "ALL" || specifier === extraFilter).map(([, macro]) => macro);

	if (filteredMacros.length === 0) {
		filteredMacros.push(noMatchingImplementationMacro);
	}

	return filteredMacros as OneOrMoreMacros<[ExtendedImplementation], unknown>;
}

export const withSass = withSassImplementation("*");

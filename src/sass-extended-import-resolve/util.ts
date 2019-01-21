import {LIB_PREFIX} from "./constant";
import {extname, join, parse} from "path";

/**
 * Returns true if the given path is using node module resolution
 * @param {string} path
 * @return {boolean}
 */
export function isLib (path: string): boolean {
	return path.startsWith(LIB_PREFIX);
}

/**
 * Normalizes the given iterable of extensions
 * @param {Iterable<string>} extNames
 * @return {string[]}
 */
export function normalizeExtensions (extNames: Iterable<string>): string[] {
	return [...extNames]
		.map(extName => extName === "" ? "" : extName.startsWith(".") ? extName : `.${extName}`)
}

/**
 * Strips the extension from a file
 * @param {string} file
 * @returns {string}
 */
export function stripExtension (file: string) {
	if (extname(file) === "") {
		return file;
	}

	let {dir, name} = parse(file);
	return join(dir, name);
}
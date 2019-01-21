import {Options} from "./options";
import {isLib, normalizeExtensions, stripExtension} from "./util";
import {DEFAULT_EXTENSIONS} from "./constant";
import {basename, dirname, extname, isAbsolute, join} from "path";
import {SanitizedOptions} from "./sanitized-options";
import {existsSync, statSync} from "fs";
import {sync} from "resolve";

/**
 * Helps with resolving the absolute path of a .scss, .sass, or .css file, including support for node module resolution
 * @param {string} path
 * @param {Options} options
 * @returns {string|undefined}
 */
export function resolve(path: string, {cwd = process.cwd(), extensions = DEFAULT_EXTENSIONS, hooks: {fs = {}} = {}}: Partial<Options> = {}): string | undefined {
	// Sanitize the options
	const sanitizedOptions: SanitizedOptions = {
		cwd,
		extensions: normalizeExtensions(extensions),
		hooks: {
			fs: {
				existsSync,
				...fs
			}
		}
	};

	return isLib(path)
		? resolveLib(path.slice(1), sanitizedOptions)
		: resolveAbsolute(
				// Ensure that the path is absolute
				isAbsolute(path) ? path : join(sanitizedOptions.cwd, path),
				sanitizedOptions
		  );
}

/**
 * Resolves file from node_modules using the node module resolution algorithm
 * @param {string} path
 * @param {SanitizedOptions} options
 * @returns {string?}
 */
function resolveLib(path: string, options: SanitizedOptions): string | undefined {
	let matchedValue: string|undefined;
	try {
		sync(path, {
			basedir: options.cwd,
			extensions: options.extensions,
			pathFilter(_, currentPath): string {
				if (matchedValue == null) {
					matchedValue = resolveAbsolute(stripExtension(currentPath), options);
				}
				return currentPath;
			}
		});
		return matchedValue;
	} catch (ex) {
		return undefined;
	}
}

/**
 * Resolves a file relative to the given working directory an with any of the given extensions
 * @param {string} path
 * @param {SanitizedOptions} options
 * @return {string | undefined}
 */
function resolveAbsolute(path: string, options: SanitizedOptions): string | undefined {
	const ext = extname(path);

	// If the path has a specific extension, and it is supported, resolve it directly
	if (options.extensions.some(validExt => ext === validExt)) {
		return exactlyOne(tryPath(path, options));
	}

	const match = exactlyOne(tryPathWithExtensions(path, options));
	return match != null ? match : tryPathAsDirectory(path, options);
}

/**
 * Like tryPath, but checks for all possible extensions
 * @param {string} path
 * @param {SanitizedOptions} options
 * @return {string[]}
 */
function tryPathWithExtensions(path: string, options: SanitizedOptions): string[] {
	return ([] as string[]).concat.apply([], options.extensions.map(validExtension => tryPath(`${path}${validExtension}`, options)));
}

/**
 * Returns the path and/or the partial with the same name, if either or both exists
 * @param {string} path
 * @param {SanitizedOptions} options
 * @return {string[]}
 */
function tryPath(path: string, options: SanitizedOptions): string[] {
	const paths: string[] = [];
	const partial = join(dirname(path), `_${basename(path)}`);

	if (options.hooks.fs.existsSync(partial)) paths.push(partial);
	if (options.hooks.fs.existsSync(path)) paths.push(path);
	return paths;
}

/// Returns the resolved index file for [path] if [path] is a directory and the
/// index file exists.
///
/// Otherwise, returns `null`.

/**
 * Returns the resolved index file for path if path is a directory and the index file exists.
 * Otherwise returns undefined
 * @param {string} path
 * @param {SanitizedOptions} options
 * @return {string?}
 */
function tryPathAsDirectory(path: string, options: SanitizedOptions): string | undefined {
	return dirExists(path) ? exactlyOne(tryPathWithExtensions(join(path, "index"), options)) : undefined;
}

/**
 * Returns true if the given path represents a directory and it exists
 * @param {string} path
 * @return {boolean}
 */
function dirExists(path: string): boolean {
	try {
		return statSync(path).isDirectory();
	} catch (error) {
		if (error.code === "ENOENT") return false;
		throw error;
	}
}

/**
 * If paths contains exactly one path, return that path.
 * If it contains no paths, return undefined. If it contains more than one,
 * throw an exception
 * @param {string[]} paths
 * @return {string?}
 */
function exactlyOne(paths: string[]): string | undefined {
	if (paths.length < 1) return undefined;
	if (paths.length === 1) return paths[0];

	throw new ReferenceError("It's not clear which file to import. Found:\n" + paths.map(path => "  " + path).join("\n"));
}

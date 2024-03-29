import path from "crosspath";
import type {Stats} from "fs";
import fs from "fs";
import {minimatch} from "minimatch";
import resolveModule from "resolve";
import type {FileSystem} from "./lib/file-system.js";

interface ResolveResult {
	file: string;
	contents: string;
}

const SCRIPT_EXTENSIONS = [".js", ".mjs", ".cjs"];

type Importer = (url: string, prev: string) => ResolveResult | null;

interface ResolveInternalOptions extends ResolveOptions {
	/**
	 * The directory from which to resolve import specifiers.
	 * May change with path mapping
	 */
	baseDir: string;
}

interface MaybeAliasedPathResult {
	paths: string[];
	baseDir: string;
}

export interface ResolveOptions extends ExtendedImporterOptions {
	/**
	 * The directory of the parent file from which the path is imported
	 */
	parentDir: string | undefined;
}

export interface ExtendedImporterOptions {
	/**
	 * The file system implementation to use
	 */
	fileSystem: FileSystem;

	/**
	 * The working directory to use as root. Defaults to process.cwd()
	 */
	cwd: string;

	/**
	 * The character to use as the prefix to resolve modules with Node Module Resolution. Defaults to `~`
	 */
	nodeModuleResolutionPrefix: string;

	/**
	 * The extensions to support resolving. Defaults to .scss, .sass, and .css
	 */
	extensions: string[];

	/**
	 * Path mapping globs. Can be used to map virtual paths to other paths on disk
	 */
	paths: Record<string, string[] | string>;
}

/**
 * Creates a Custom Importer for sass/scss with support for Node Module Resolution and path mapping/aliasing
 */
export function createImporter(options?: Partial<ExtendedImporterOptions>): Importer {
	return (p, parent) => resolve(p, {...options, parentDir: path.dirname(parent)});
}

/**
 * Resolves sass/scss files with support for Node Module Resolution and path mapping/aliasing
 */
export function resolve(p: string, options?: Partial<ResolveOptions>): ResolveResult | null {
	const sanitizedOptions = sanitizeOptions(options);

	const useNodeModuleResolution = p.startsWith(sanitizedOptions.nodeModuleResolutionPrefix);
	const {baseDir, paths} = resolveMaybeAliasedPath(path.normalize(useNodeModuleResolution ? p.slice(sanitizedOptions.nodeModuleResolutionPrefix.length) : p), sanitizedOptions);
	const internalOptions = {...sanitizedOptions, baseDir};

	for (const sanitizedPath of paths) {
		const resolved = useNodeModuleResolution ? nodeModuleResolutionStrategy(sanitizedPath, internalOptions) : sassStrategy(sanitizedPath, internalOptions);
		if (resolved != null) return resolved;
	}

	return null;
}

function sanitizeOptions(options?: Partial<ResolveOptions>): ResolveOptions {
	const {fileSystem = fs, nodeModuleResolutionPrefix = "~", extensions = [".scss", ".sass", ".css"], paths = {}, cwd = process.cwd(), parentDir} = options ?? {};
	return {fileSystem, nodeModuleResolutionPrefix, extensions, paths, cwd, parentDir};
}

function resolveMaybeAliasedPath(p: string, options: ResolveOptions): MaybeAliasedPathResult {
	for (const key of Object.keys(options.paths)) {
		// Replace single asterisks with multiple ones
		const normalizedKey = key.replace(/(?<!\*)\*(?!\*)/, "**");

		if (!minimatch(p, normalizedKey)) continue;
		const lastIndexOfAsterisk = key.lastIndexOf("*");
		const pFromAsterisk = lastIndexOfAsterisk < 0 ? "" : p.slice(lastIndexOfAsterisk);
		const paths = ensureArray(options.paths[key]).map(value => path.join(value.replace(/(\\|\/)+\*$/gi, ""), pFromAsterisk));

		return {
			paths,
			// Resolve mapped paths from the cwd
			baseDir: options.cwd
		};
	}
	return {
		paths: [p],
		baseDir: options.parentDir == null ? options.cwd : options.parentDir
	};
}

function nodeModuleResolutionStrategy(p: string, options: ResolveInternalOptions): ResolveResult | undefined {
	try {
		const resolvedFile = resolveModule.sync(p, {
			basedir: options.cwd,
			extensions: [...options.extensions, ...SCRIPT_EXTENSIONS],
			readFileSync: file => options.fileSystem.readFileSync(file).toString(),
			isFile: file => isFileSync(file, options.fileSystem),
			isDirectory: file => isDirectorySync(file, options.fileSystem),

			// We can use the main property as a pointer to where in the package to look for a .scss/.sass/.css file with an equivalent name
			pathFilter: (_, currentPath) => {
				const mainExtname = path.extname(currentPath);

				// If the main property already has a supported extension, leave it be
				if (options.extensions.some(extension => mainExtname === extension)) {
					return currentPath;
				}

				// Remove the extension from the path and see if a related .scss, .sass, or .css file can be resolved
				return sassStrategy(replaceScriptExtension(currentPath, ""), options)?.file ?? currentPath;
			}
		});

		return {
			file: path.native.normalize(resolvedFile),
			contents: options.fileSystem.readFileSync(path.native.normalize(resolvedFile), "utf-8")
		};
	} catch (ex) {
		return undefined;
	}
}

function sassStrategy(p: string, options: ResolveInternalOptions): ResolveResult | undefined {
	let resolvedFile: string | undefined;

	// If the path has a specific extension, we might skip a lot of work and just be able to resolve that file directly.
	// Note that it may still not be able to resolve a file, for example if p is 'foo.bar', then '.bar' is technically an extension,
	// but no such file may exist, and we might still be able to resolve a file such as 'foo.bar.scss'
	if (path.extname(p) !== "") {
		resolvedFile = exactlyOne(tryPathSync(p, options));
	}

	if (resolvedFile == null) {
		resolvedFile = exactlyOne(tryPathWithExtensionsSync(p, options));
	}

	if (resolvedFile == null) return undefined;

	return {
		file: path.native.normalize(resolvedFile),
		contents: options.fileSystem.readFileSync(path.native.normalize(resolvedFile), "utf-8")
	};
}

/**
 * Like tryPath, but checks for all possible extensions
 */
function tryPathWithExtensionsSync(p: string, options: ResolveInternalOptions): string[] {
	return options.extensions.map(extension => [tryPathSync(`${p}${extension}`, options), tryPathSync(path.join(p, `index${extension}`), options)]).flat(2);
}

/**
 * Returns the path and/or the partial with the same name, if either or both exists
 */
function tryPathSync(p: string, options: ResolveInternalOptions): string[] {
	const absolutePath = path.isAbsolute(p) ? p : path.join(options.baseDir, p);
	const absolutePartial = path.join(path.dirname(absolutePath), `_${path.basename(absolutePath)}`);

	return [...(isFileSync(absolutePartial, options.fileSystem) ? [absolutePartial] : []), ...(isFileSync(absolutePath, options.fileSystem) ? [absolutePath] : [])];
}

function isFileSync(p: string, fileSystem: FileSystem): boolean {
	return safeStatSync(p, fileSystem)?.isFile() ?? false;
}

function isDirectorySync(p: string, fileSystem: FileSystem): boolean {
	return safeStatSync(p, fileSystem)?.isDirectory() ?? false;
}

function safeStatSync(p: string, fileSystem: FileSystem): Stats | undefined {
	try {
		return fileSystem.statSync(path.native.normalize(p));
	} catch {
		return undefined;
	}
}

/**
 * If paths contains exactly one path, return that path.
 * If it contains no paths, return undefined. If it contains more than one,
 * throw an exception
 */
function exactlyOne(paths: string[]): string | undefined {
	const [head, ...tail] = paths;
	if (head == null) return undefined;
	if (tail.length > 0) {
		throw new ReferenceError("It's not clear which file to import. Found:\n" + paths.map(p => `  ${p}`).join("\n"));
	}
	return head;
}

function ensureArray<T>(item: T[] | T): T[] {
	return Array.isArray(item) ? item : [item];
}

/**
 * Sets the given extension for the given file
 */
function replaceScriptExtension(file: string, extension: string): string {
	return path.normalize(`${removeScriptExtension(file)}${extension}`);
}

/**
 * Strips the extension from a file
 */
function removeScriptExtension(file: string): string {
	let currentExtname: string | undefined;

	for (const extName of SCRIPT_EXTENSIONS) {
		if (file.endsWith(extName)) {
			currentExtname = extName;
			break;
		}
	}

	if (currentExtname == null) return file;

	return file.slice(0, file.lastIndexOf(currentExtname));
}

import path from "crosspath";
import fs, {Stats} from "fs";
import minimatch from "minimatch";
import {sync as resolve} from "resolve";
import {FileSystem} from "./lib/file-system";

interface ResolveResult {
	file: string;
	contents: string;
}

const SCRIPT_EXTENSIONS = [".js", ".mjs", ".cjs"];

type Importer = (url: string, prev: string) => ResolveResult | null;

export interface ExtendedImporterOptions {
	fileSystem: FileSystem;

	/**
	 * The working directory to use as root. Defaults to using that of the importing file
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

export default function extendedImporter(options?: Partial<ExtendedImporterOptions>): Importer {
	const {fileSystem = fs, nodeModuleResolutionPrefix = "~", extensions = [".scss", ".sass", ".css"], paths = {}, cwd} = options ?? {};

	return (url, prev) => {
		const sanitizedOptions = {
			fileSystem,
			nodeModuleResolutionPrefix,
			extensions,
			paths,
			cwd: cwd ?? path.dirname(prev)
		};

		const useNodeModuleResolution = url.startsWith(sanitizedOptions.nodeModuleResolutionPrefix);
		const sanitizedUrls = resolveMaybeAliasedPath(path.normalize(useNodeModuleResolution ? url.slice(sanitizedOptions.nodeModuleResolutionPrefix.length) : url), sanitizedOptions);

		for (const sanitizedUrl of sanitizedUrls) {
			const resolved = useNodeModuleResolution ? nodeModuleResolutionStrategy(sanitizedUrl, sanitizedOptions) : sassStrategy(sanitizedUrl, sanitizedOptions);
			if (resolved != null) return resolved;
		}

		return null;
	};
}

function resolveMaybeAliasedPath(p: string, options: ExtendedImporterOptions): string[] {
	for (const key of Object.keys(options.paths)) {
		if (!minimatch(p, key)) continue;
		const lastIndexOfAsterisk = key.lastIndexOf("*");
		const pFromAsterisk = lastIndexOfAsterisk < 0 ? "" : p.slice(lastIndexOfAsterisk);
		return ensureArray(options.paths[key]).map(value => path.join(value.replace(/(\\|\/)+\*$/gi, ""), pFromAsterisk));
	}
	return [p];
}

function nodeModuleResolutionStrategy(p: string, options: ExtendedImporterOptions): ResolveResult | undefined {
	try {
		const resolvedFile = resolve(p, {
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
			file: resolvedFile,
			contents: options.fileSystem.readFileSync(resolvedFile, "utf-8")
		};
	} catch (ex) {
		return undefined;
	}
}

function sassStrategy(p: string, options: ExtendedImporterOptions): ResolveResult | undefined {
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
		file: resolvedFile,
		contents: options.fileSystem.readFileSync(resolvedFile, "utf-8")
	};
}

/**
 * Like tryPath, but checks for all possible extensions
 */
function tryPathWithExtensionsSync(p: string, options: ExtendedImporterOptions): string[] {
	return options.extensions.map(extension => [tryPathSync(`${p}${extension}`, options), tryPathSync(path.join(p, `index${extension}`), options)]).flat(2);
}

/**
 * Returns the path and/or the partial with the same name, if either or both exists
 */
function tryPathSync(p: string, options: ExtendedImporterOptions): string[] {
	const partial = path.join(path.dirname(p), `_${path.basename(p)}`);

	return [...(isFileSync(partial, options.fileSystem) ? [partial] : []), ...(isFileSync(p, options.fileSystem) ? [p] : [])];
}

function isFileSync(p: string, fileSystem: FileSystem): boolean {
	return safeStatSync(p, fileSystem)?.isFile() ?? false;
}

function isDirectorySync(p: string, fileSystem: FileSystem): boolean {
	return safeStatSync(p, fileSystem)?.isDirectory() ?? false;
}

function safeStatSync(p: string, fileSystem: FileSystem): Stats | undefined {
	try {
		return fileSystem.statSync(p);
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

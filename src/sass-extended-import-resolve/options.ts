import {Hooks} from "./hooks/hooks";

export interface Options {
	cwd: string;
	extensions: Iterable<string>;
	hooks: Partial<Hooks>;
}
import {Hooks} from "./hooks/hooks";

type DeepRequired<T> = {
	[P in keyof T]-?: Required<T[P]>;
};

export interface SanitizedOptions {
	cwd: string;
	extensions: string[];
	hooks: DeepRequired<Hooks>;
}
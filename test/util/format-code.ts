import {format} from "prettier";

export function formatCode(code: string, parser: "typescript" | "scss" | "json" = "scss"): string {
	return format(code, {parser, endOfLine: "lf"});
}

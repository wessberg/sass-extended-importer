import prettier from "@prettier/sync";

export function formatCode(code: string, parser: "typescript" | "scss" | "json" = "scss"): string {
	return prettier.format(code, {parser, endOfLine: "lf"});
}

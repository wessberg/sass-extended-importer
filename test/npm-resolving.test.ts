import test from "ava";
import {formatCode} from "./util/format-code";
import {testSass} from "./setup/test-sass";
import {createExternalTestFiles} from "./setup/test-file";
import {withSass} from "./util/sass-macro";

test("Can resolve modules via Node Module Resolution. #1", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			...createExternalTestFiles("my-library", `$color: red;`, {
				subPath: `/index.scss`
			}),
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "~my-library";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Can resolve modules via Node Module Resolution. #2", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			...createExternalTestFiles("my-library", `$color: red`, {
				subPath: `/index.sass`
			}),
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "~my-library";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Can resolve modules via Node Module Resolution. #3", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			...createExternalTestFiles("my-library", `h1 {color: green}`, {
				subPath: `/index.css`
			}),
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "~my-library";
					p {
						color: red;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		h1 {color: green}

		p {
			color: red;
		}
		`)
	);
});

test("Can resolve modules via Node Module Resolution. #4", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			...createExternalTestFiles("my-library", `$color: red;`, {
				subPath: `/index.scss`
			}),
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "~my-library/index";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Can resolve modules via Node Module Resolution. #5", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			...createExternalTestFiles("my-library", `$color: red;`, {
				subPath: `/index.scss`
			}),
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "~my-library/index.scss";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Can resolve modules via Node Module Resolution. #6", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			...createExternalTestFiles("my-library", `$color: red;`, {
				subPath: `/styles/base.scss`
			}),
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "~my-library/styles/base";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Can resolve modules via Node Module Resolution. #7", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			...createExternalTestFiles("my-library", `$color: red;`, {
				main: "dist/index.js",
				subPath: `/dist/index.scss`
			}),
			{
				entry: false,
				fileName: `node_modules/my-library/dist/index.js`,
				text: ``
			},
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "~my-library";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Can resolve partials. #1", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			{
				entry: false,
				fileName: "_partial.scss",
				text: `\
					h1 {
						color: green;
					}
					`
			},
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "partial";
					p {
						color: red;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		h1 {
			color: green;
		}

		p {
			color: red;
		}
		`)
	);
});

test("Can resolve scss files with specific extensions. #1", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			{
				entry: false,
				fileName: "foo.bar.scss",
				text: `\
					$color: red;
					`
			},
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "foo.bar";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Can resolve scss files with specific extensions. #2", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			{
				entry: false,
				fileName: "foo.bar.scss",
				text: `\
					$color: red;
					`
			},
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "foo.bar.scss";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Can resolve scss files with specific extensions. #3", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			{
				entry: false,
				fileName: "foo.bar.scss",
				text: `\
					$color: red;
					`
			},
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "./foo.bar.scss";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Can resolve scss files with specific extensions. #4", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			{
				entry: false,
				fileName: "../foo.scss",
				text: `\
					$color: red;
					`
			},
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "../foo";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Supports path mapping. #1", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			{
				entry: false,
				fileName: "../my-library/src/index.scss",
				text: `\
					$color: red;
					`
			},
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "my-library/index.scss";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass,
			paths: {
				"my-library": ["../my-library/src/index.scss"],
				"my-library/*": ["../my-library/src/*"]
			}
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Supports path mapping. #2", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			{
				entry: false,
				fileName: "../my-library/src/index.scss",
				text: `\
					$color: red;
					`
			},
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "~my-library/index.scss";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass,
			paths: {
				"my-library": ["../my-library/src/index.scss"],
				"my-library/*": ["../my-library/src/*"]
			}
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

test("Supports path mapping. #3", withSass, async (t, {sass}) => {
	const result = await testSass(
		[
			{
				entry: false,
				fileName: "../my-library/src/index.scss",
				text: `\
					$color: red;
					`
			},
			{
				entry: true,
				fileName: "index.scss",
				text: `\
					@import "~my-library";
					p {
						color: $color;
					}
					`
			}
		],
		{
			sass,
			paths: {
				"my-library": ["../my-library/src/index.scss"],
				"my-library/*": ["../my-library/src/*"]
			}
		}
	);
	const {
		output: [file]
	} = result;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		p {
			color: red;
		}
		`)
	);
});

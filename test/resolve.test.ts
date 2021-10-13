import test from "ava";
import path from "crosspath";
import {testResolve} from "./setup/test-resolve";

test("Supports using the 'resolve' function directly. #1", async t => {
	const result = await testResolve("../../lib/styles/base", [
		{
			fileName: "../../lib/styles/base.scss",
			text: `\
					$color: red;
					`
		}
	]);
	const {output} = result;

	t.deepEqual(path.normalize(output.fileName), path.join(process.cwd(), `../../lib/styles/base.scss`));
});

test("Supports using the 'resolve' function directly. #2", async t => {
	const result = await testResolve("~@foo/bar/baz", [
		{
			fileName: "../../lib/bar/baz.scss",
			text: `\
					$color: red;
					`
		}
	], {paths: {
		"@foo/*": ["../../lib/*"]
	}});
	const {output} = result;

	t.deepEqual(path.normalize(output.fileName), path.join(process.cwd(), `../../lib/bar/baz.scss`));
});



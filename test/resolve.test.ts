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
	], {cwd: "."});
	const {output} = result;

	t.deepEqual(path.normalize(output.fileName), path.normalize(`../../lib/styles/base.scss`));
});

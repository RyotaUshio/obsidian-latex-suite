import { EditorView } from "@codemirror/view";
import { setCursor } from "src/utils/editor_utils";
import { getLatexSuiteConfig } from "src/snippets/codemirror/config";
import { Context } from "src/utils/context";


export const runMatrixShortcuts = (view: EditorView, ctx: Context, key: string, shiftKey: boolean): boolean => {
	const settings = getLatexSuiteConfig(view);

	// Check whether we are inside a matrix / align / case environment
	let isInsideAnEnv = false;

	for (const envName of settings.matrixShortcutsEnvNames) {
		const env = { openSymbol: "\\begin{" + envName + "}", closeSymbol: "\\end{" + envName + "}" };

		isInsideAnEnv = ctx.isWithinEnvironment(ctx.pos, env);
		if (isInsideAnEnv) break;
	}

	if (!isInsideAnEnv) return false;


	if (key === "Tab") {
		switch (settings.matrixShortcutsMode) {
			case "original":
				view.dispatch(view.state.replaceSelection(" & "));
				break;
			case "alternative":
				moveCursorToEndOfNextLine(view, ctx);
				break;
			default:
				return false;
		}

		return true;
	}
	else if (key === "Enter") {
		if (shiftKey) {
			switch (settings.matrixShortcutsMode) {
				case "original":
					moveCursorToEndOfNextLine(view, ctx);
					break;
				case "alternative":
					return false;
				default:
					return false;
			}
		}
		else {
			view.dispatch(view.state.replaceSelection(" \\\\\n"));
		}

		return true;
	}
	else {
		return false;
	}

}

const moveCursorToEndOfNextLine = (view: EditorView, ctx: Context) => {
	const d = view.state.doc;

	const nextLineNo = d.lineAt(ctx.pos).number + 1;
	const nextLine = d.line(nextLineNo);

	setCursor(view, nextLine.to);
}

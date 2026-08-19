/**
 * compileTypeScriptToGraph — compiles user-authored TypeScript source (using
 * `AlgorithmBuilder` as an ambient global, no `import` statement) into a
 * `GeoArtGraph`, entirely client-side, in the main thread.
 *
 * This is the inverse of `graphToBuilderCode` (see `./builderCodegen`): where
 * that turns a `GeoArtGraph` into TypeScript source for a read-only "view as
 * TypeScript" panel, this turns user-typed TypeScript source back into a
 * `GeoArtGraph` for the "Import Algorithm" flow.
 *
 * ## Trust boundary
 * The only place this source ever comes from is the user's own paste/typing
 * into the app's TypeScript import editor — never a URL, share-link, or any
 * other remote source. That's the same trust boundary as opening devtools
 * console on your own page, so there is no sandboxing here (no iframe, no
 * worker): the script is transpiled and executed directly via `new
 * Function(...)` in the main thread. Sandboxing guards against "don't trust
 * where remote code came from," which does not apply here.
 *
 * ## User-facing contract
 * The user writes a normal TypeScript script:
 *   - `AlgorithmBuilder` is available as an ambient global — no `import`.
 *   - Any number of statements are allowed (const/let, loops, helper
 *     functions, etc.) — this is the ergonomic point of TS-authoring.
 *   - The script must end with a plain expression statement whose value is
 *     the constructed graph, typically `new AlgorithmBuilder()....construct();`
 *     or `builder.construct();`. The user never writes `return` — a bare
 *     top-level `return` is invalid TS/JS outside a function body, so it must
 *     never appear in what the user types.
 *
 * Internally, the last expression statement is rewritten to a `return`
 * statement so the transpiled script can run inside a function body. This
 * rewrite is purely internal: it is never shown to the user, and Monaco only
 * ever type-checks the user's original, un-rewritten source.
 */
import * as ts from "typescript";
import { AlgorithmBuilder } from "../schema/builder";
import type { GeoArtGraph } from "../schema/_generated/schema-types";
import { tryCompileGraph } from "../graphEngine/exports";

export type CompileTypeScriptResult =
    | { success: true; graph: GeoArtGraph }
    | { success: false; error: string };

/**
 * Prepares source text suitable for execution inside a function body (where
 * `return` is valid), based on the source file's last top-level statement:
 *   - A plain expression statement (the normal, documented case — e.g.
 *     `builder.construct();`) is rewritten into a `return` of that
 *     expression, and the rewritten source is printed back to text.
 *   - A statement that is already a `return` statement is left as-is — it's
 *     already valid once embedded in the wrapping function body.
 *   - Anything else (a `for` loop, a `const` declaration, etc. with nothing
 *     after it) has no sensible value to return, so this returns `null`.
 */
function prepareExecutableSource(sourceFile: ts.SourceFile): string | null {
    const statements = sourceFile.statements;
    const lastStatement = statements[statements.length - 1];

    if (ts.isReturnStatement(lastStatement)) {
        return sourceFile.text;
    }

    if (!ts.isExpressionStatement(lastStatement)) {
        return null;
    }

    const rewrittenStatements = [
        ...statements.slice(0, statements.length - 1),
        ts.factory.createReturnStatement(lastStatement.expression),
    ];

    const rewrittenSourceFile = ts.factory.updateSourceFile(sourceFile, rewrittenStatements);
    const printer = ts.createPrinter();
    return printer.printFile(rewrittenSourceFile);
}

function formatDiagnostics(diagnostics: readonly ts.Diagnostic[]): string {
    return diagnostics
        .map(d => {
            const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
            if (d.file && d.start !== undefined) {
                const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start);
                return `Line ${line + 1}, Column ${character + 1}: ${message}`;
            }
            return message;
        })
        .join("\n");
}

export function compileTypeScriptToGraph(source: string): CompileTypeScriptResult {
    const sourceFile = ts.createSourceFile(
        "userAlgorithm.ts",
        source,
        ts.ScriptTarget.ES2020,
        true,
        ts.ScriptKind.TS
    );

    if (sourceFile.statements.length === 0) {
        return { success: false, error: "Script is empty." };
    }

    // Check the user's original, untouched source for syntax errors before
    // doing any AST surgery. The rewrite step below reprints the parsed AST,
    // which "heals" genuinely malformed input via the parser's error
    // recovery (e.g. inserting a missing closing paren) — so a diagnostics
    // check run only on the rewritten text would silently miss real syntax
    // errors in what the user actually typed.
    const originalDiagnostics = ts.transpileModule(source, {
        compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.None,
            ignoreDeprecations: "6.0",
        },
        reportDiagnostics: true,
    }).diagnostics ?? [];
    const originalErrorDiagnostics = originalDiagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
    if (originalErrorDiagnostics.length > 0) {
        return { success: false, error: formatDiagnostics(originalErrorDiagnostics) };
    }

    const rewrittenText = prepareExecutableSource(sourceFile);
    if (rewrittenText === null) {
        return {
            success: false,
            error:
                "Script must end with an expression whose value is the constructed graph — e.g. `builder.construct()`.",
        };
    }

    const transpileResult = ts.transpileModule(rewrittenText, {
        compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.None,
            // `module: None` is flagged as an error-category deprecation
            // diagnostic as of TS 6.0 (removal planned for TS 7.0); this is
            // deliberate (the user script is a plain, moduleless program —
            // no import/export), so silence the deprecation notice itself
            // rather than the real compile errors we still want to catch.
            ignoreDeprecations: "6.0",
        },
        reportDiagnostics: true,
    });

    const errorDiagnostics = (transpileResult.diagnostics ?? []).filter(
        d => d.category === ts.DiagnosticCategory.Error
    );
    if (errorDiagnostics.length > 0) {
        return { success: false, error: formatDiagnostics(errorDiagnostics) };
    }

    let constructedValue: unknown;
    try {
        const runScript = new Function("AlgorithmBuilder", transpileResult.outputText);
        constructedValue = runScript(AlgorithmBuilder);
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }

    const compileResult = tryCompileGraph(constructedValue);
    if (!compileResult.success) {
        return { success: false, error: compileResult.error };
    }

    return { success: true, graph: constructedValue as GeoArtGraph };
}

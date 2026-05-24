import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
    GITHUB_REPOSITORY: str(),
    GH_TOKEN:          str(),
    GITHUB_TOKEN:      str(),
    ISSUE_NUMBER:      str(),
    PR_NUMBER:         str(),
});

interface AgentCall {
    subagent_type: string;
    description: string;
}

interface Session {
    model: string;
    total: number;
    agent_calls: AgentCall[];
}

interface UsageEntry {
    type?: string;
    message?: {
        model?: string;
        usage?: {
            input_tokens?: number;
            output_tokens?: number;
        };
        content?: Array<{
            type?: string;
            name?: string;
            input?: {
                subagent_type?: string;
                description?: string;
            };
        }>;
    };
}

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

function getJsonlFiles(claudeDir: string): string[] {
    const results: string[] = [];

    function walk(dir: string): void {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
                results.push(fullPath);
            }
        }
    }

    walk(claudeDir);

    return results.sort(
        (a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs
    );
}

function parseSession(filepath: string): Session {
    let model = "unknown";
    let inpTok = 0;
    let outTok = 0;
    const agentCalls: AgentCall[] = [];

    const lines = fs.readFileSync(filepath, "utf-8").split("\n");
    for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;

        let entry: UsageEntry;
        try {
            entry = JSON.parse(line);
        } catch {
            continue;
        }

        if (entry.type === "assistant") {
            const msg = entry.message ?? {};
            const usage = msg.usage ?? {};

            if (msg.model) model = msg.model;
            inpTok += usage.input_tokens ?? 0;
            outTok += usage.output_tokens ?? 0;

            for (const block of msg.content ?? []) {
                if (
                    block?.type === "tool_use" &&
                    block?.name === "Agent" &&
                    block?.input
                ) {
                    agentCalls.push({
                        subagent_type: block.input.subagent_type ?? "agent",
                        description: (block.input.description ?? "").slice(0, 60),
                    });
                }
            }
        }
    }

    return { model, total: inpTok + outTok, agent_calls: agentCalls };
}

function main(): void {
    const claudeDir = path.join(os.homedir(), ".claude");
    if (!fs.existsSync(claudeDir)) process.exit(0);

    const jsonlFiles = getJsonlFiles(claudeDir);
    if (jsonlFiles.length === 0) process.exit(0);

    const sessions = jsonlFiles
        .map(parseSession)
        .filter((s) => s.total > 0);

    if (sessions.length === 0) process.exit(0);

    const grandTotal = sessions.reduce((sum, s) => sum + s.total, 0);

    // Session with most agent calls is the orchestrator
    const main_ = sessions.reduce((best, s) =>
        s.agent_calls.length > best.agent_calls.length ||
            (s.agent_calls.length === best.agent_calls.length && s.total > best.total)
            ? s
            : best
    );
    const subs = sessions.filter((s) => s !== main_);

    const lines: string[] = ["### Claude Token Usage", ""];
    lines.push(`\`${main_.model}\` (${fmt(main_.total)} tokens)`);

    for (let i = 0; i < main_.agent_calls.length; i++) {
        const call = main_.agent_calls[i];
        const sub = i < subs.length ? subs[i] : undefined;
        const desc = call.description ? ` (${call.description})` : "";
        const subTok = sub ? ` — ${fmt(sub.total)} tokens` : "";
        lines.push(`  - \`${call.subagent_type}\`${desc}${subTok}`);
    }

    lines.push("", `**Total: ${fmt(grandTotal)} tokens**`);
    const summary = lines.join("\n");

    console.log(summary);
    fs.writeFileSync("token-summary.md", summary);

    // Post as a GitHub issue/PR comment if running in CI
    if (!fs.existsSync("token-summary.md")) process.exit(0);

    const repo = env.GITHUB_REPOSITORY;
    const ghEnv = { env: { ...process.env, GH_TOKEN: env.GH_TOKEN || env.GITHUB_TOKEN }, stdio: "inherit" } as const;

    try {
        if (env.ISSUE_NUMBER) {
            execSync(
                `gh issue comment "${env.ISSUE_NUMBER}" --repo "${repo}" --body "$(cat token-summary.md)"`,
                ghEnv
            );
        } else if (env.PR_NUMBER) {
            execSync(
                `gh pr comment "${env.PR_NUMBER}" --repo "${repo}" --body "$(cat token-summary.md)"`,
                ghEnv
            );
        } else {
            console.log("No PR/issue number, skipping comment");
        }
    } catch (err) {
        console.error("Failed to post GitHub comment:", err);
        process.exit(1);
    }
}

main();
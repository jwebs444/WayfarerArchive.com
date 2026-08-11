import { readFile, writeFile } from "node:fs/promises";

const configPath = new URL("../dist/server/wrangler.json", import.meta.url);
const config = JSON.parse(await readFile(configPath, "utf8"));

// Vinext beta still emits this removed Wrangler field. Modern Wrangler uses
// the same per-environment Worker behavior by default, so it is safe to omit.
delete config.legacy_env;

await writeFile(configPath, `${JSON.stringify(config)}\n`, "utf8");

import semver from "semver";

export function setup() {



    /**
     * Note that the vitest tests are actually still running on the node runtime. 
     * 
     * We can get it to use bun by passing the `--bun` flag - https://bun.com/docs/runtime#bun
     * but I tested and it doesn't appear to be any faster. 
     * 
     * bun does not support devEngines - https://github.com/oven-sh/bun/issues/26512
     * so we do a manual check here for the versions. 
     */
    const nodeVersion = process.version;

    if (!semver.gte(nodeVersion, "24.0.0")) {
        throw new Error(`Node.js >= 24 required, found ${nodeVersion}`);
    }
}
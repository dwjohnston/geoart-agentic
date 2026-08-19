# Feature Brief: Algorithm Render Endpoint

Work on a branch and in a worktree.

Observe that on main we have a basic shell for rendering the application in cloudflare.

What we need now is that src/server/renderShell.ts needs to inspect an `?a=` query param. This query param contains a base64 encoded representation of the algorithm in json.

The <meta og:image content="render/<raw-base-64-encoded-value-here>"> is added.

Then, when accessing render/<base64 value>, the worker logic is:
- decode the algorithm
- Go through the regular validation and graph construction logic. If this fails, return a 404.
- Otherwise, render the algorithm to image, see existing behaviour for doing this.

Add to the Schema a `previewSettings` top level property.

This has for now:
{
    staticImageNumTicks: number
}

If that property does not exist, the default value is 10.

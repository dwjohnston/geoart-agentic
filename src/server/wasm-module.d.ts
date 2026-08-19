// The Cloudflare Worker bundler resolves a bare `.wasm` import to a
// `WebAssembly.Module`. Bun (used to run this project's tests) instead
// resolves it to the resolved filesystem path as a string — see the runtime
// branch in renderAlgorithmImage.ts that handles both.
declare module '*.wasm' {
  const value: string | WebAssembly.Module;
  export default value;
}

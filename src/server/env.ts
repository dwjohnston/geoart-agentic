/**
 * Worker bindings. Mirror of the `assets` and `r2_buckets` sections in
 * wrangler.jsonc — keep the two in sync (there is no `wrangler types`
 * generated file in this project).
 */
export interface Env {
  ASSETS: Fetcher;
  /** Durable store for finished renders — see renderAlgorithmMedia.ts. */
  RENDERS: R2Bucket;
}

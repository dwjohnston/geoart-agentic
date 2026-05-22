import { validateGeoArtGraph } from '../src/schema/validateGeoArtGraph'

export function validateSchema(json: unknown): true {
  const valid = validateGeoArtGraph(json)
  if (!valid) {
    throw new Error('Schema validation failed: algorithm JSON does not conform to the GeoArt schema')
  }
  return true
}

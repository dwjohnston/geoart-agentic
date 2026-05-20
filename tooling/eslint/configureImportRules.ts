import { objectEntries } from "../../src/common-tooling/typedObject";

type ZoneNameToZonePathMap = Record<string, string>;

type AllowedMappingConfig<T extends ZoneNameToZonePathMap> = {
	[K in keyof T]: {
		allowedZones: Array<keyof T>;
	};
};

export function createImportNoRestrictedPathsZones<
	T extends ZoneNameToZonePathMap,
>(
	folderConfigMapping: T,
	allowMappings: AllowedMappingConfig<T>,
): Array<{
	from: string;
	target: string;
	message: string;
}> {
	const entries = objectEntries(folderConfigMapping);

	const zoneNamesAsSet = new Set(Object.keys(folderConfigMapping));

	return entries.flatMap((v) => {
		const [zoneName, zonePath] = v;

		const allowedZones = allowMappings[zoneName].allowedZones;
		const disallowedZones = [
			...zoneNamesAsSet.difference(new Set(allowedZones)),
		];

		return disallowedZones
			.map((w) => {
				if (zoneName === w) {
					return null;
				}

				return {
					target: zonePath,
					from: folderConfigMapping[w],
					message: `Files in zone: [${zoneName as string}] are not allowed to import from files in zone [${w}]`,
				};
			})
			.filter((v) => !!v);
	});
}

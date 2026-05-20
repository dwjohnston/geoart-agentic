export class UnreachableError {
	constructor(value: never) {
		throw new Error(value);
	}
}

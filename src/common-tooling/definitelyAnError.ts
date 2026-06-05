export function definitelyAnError(err: unknown): Error {
    if (err instanceof Error) {
        return err;
    }

    return new Error(`An unknown error of type: "${typeof err}" was encountered.`)
}
/**
 * This error is thrown just for type narrowing purposes
 *
 * Often a thing will be typed as being optional, but in practise we know that it will always exist.
 * In that case, we can check for the non existence, and throw if it doesn't exist, to narrow the type.
 * But we don't actually expect this error to ever actually be thrown.
 *
 * @example
 * function handleClick() {
 *     if(!someRef.value){
 *        throw new TypeNarrowingError();
 *     }
 *     someRef.value.doSomething(); // For type purposes we can trust that someRef.value exists
 * }
 */
export class TypeNarrowingError extends Error {}

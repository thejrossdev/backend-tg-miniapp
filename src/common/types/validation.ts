/**
 * Represents a validation detail field containing path and error message.
 *
 * @property {string} path - The dot-notation path to the validated property (e.g., "user.email").
 * @property {string} issue - The translated error message describing the validation failure.
 */
export type ValidationDetailField = {
	path: string;
	issue: string;
};

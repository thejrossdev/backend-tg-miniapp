/**
 * Abstract base class for domain-specific exceptions in the application.
 * Provides a common structure for exceptions with error codes and status codes.
 */
export abstract class DomainException extends Error {
	/**
	 * Unique identifier for this exception type.
	 */
	public abstract readonly code: string;

	/**
	 * HTTP status code associated with this exception.
	 */
	public abstract readonly statusCode: number;

	/**
	 * Optional context data related to the exception.
	 */
	public readonly context?: Record<string, any>;

	/**
	 * Creates an instance of DomainException.
	 *
	 * @param {string} message - The error message
	 * @param {Record<string, any>} [context] - Additional context data for the exception
	 */
	protected constructor(message: string, context?: Record<string, any>) {
		super(message);
		this.name = this.constructor.name;
		this.context = context;
	}
}

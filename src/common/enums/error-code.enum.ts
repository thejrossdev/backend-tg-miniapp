/**
 * Enum representation of Error codes.
 */
export enum ErrorCode {
	'INTERNAL_ERROR' = 'INTERNAL_ERROR', // apologize + traceId (no blame, no details)
	'NOT_FOUND' = 'NOT_FOUND', //  user’s reference is stale (refresh or reselect)
	'AUTH_REQUIRED' = 'AUTH_REQUIRED', // user must sign in
	'VALIDATION_FAILED' = 'VALIDATION_FAILED', // user can fix input
	'FORBIDDEN' = 'FORBIDDEN', // user lacks permission (don’t suggest retry)
	'CONFLICT' = 'CONFLICT', // user must resolve a state mismatch (retry with new data)
	'RATE_LIMITED' = 'RATE_LIMITED', // user should slow down / wait
	'UPSTREAM_UNAVAILABLE' = 'UPSTREAM_UNAVAILABLE ', // try again later (and tell them)
}

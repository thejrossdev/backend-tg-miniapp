import { TSuccessMessage } from '@/common/constants';
import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for storing success message configurations.
 */
export const SUCCESS_MESSAGE_KEY = 'success_message';

/**
 * Metadata key for storing success message arguments.
 */
export const SUCCESS_MESSAGE_ARGS = 'success_message_args';

/**
 * Decorator that sets metadata for success messages to be used by interceptors.
 *
 * @param {...TSuccessMessage[]} messages - Array of success messages (strings or objects with key/args/condition)
 * @returns {MethodDecorator & ClassDecorator} Decorator function for methods or classes
 *
 * Example usage:
 * @SuccessMessage('success.resource-found', { key: 'success.resource-created', args: { name: 'User' } })
 */
export const SuccessMessage = (...messages: TSuccessMessage[]): MethodDecorator & ClassDecorator => {
	return SetMetadata(SUCCESS_MESSAGE_KEY, messages);
};

/**
 * Decorator that sets metadata for success message arguments.
 *
 * @param {Record<string, any>} args - Arguments to pass to the success message
 * @returns {MethodDecorator & ClassDecorator} Decorator function for methods or classes
 *
 * Example usage:
 * @SuccessMessageArgs({ resource: 'User' })
 */
export const SuccessMessageArgs = (args: Record<string, any>): MethodDecorator & ClassDecorator =>
	SetMetadata(SUCCESS_MESSAGE_ARGS, args);

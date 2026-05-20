import { I18nPath } from '@/generated/i18n.generated';
import { z } from 'zod';
import { FastifyRequest } from 'fastify';

/**
 * Zod schema for validating a single success message item with conditional logic.
 */
export const successMessageItemSchema = z.object({
	key: z.string().refine((val): val is I18nPath => true, { message: 'Invalid I18nPath' }),
	args: z.record(z.any(), z.any()).optional(),
	condition: z
		.custom<((data: any, req: FastifyRequest) => boolean) | undefined>((val) => {
			return typeof val === 'function' || val === undefined;
		})
		.optional(),
});

/**
 * Type inferred from the success message item schema.
 */
export type TSuccessMessageItem = z.infer<typeof successMessageItemSchema>;

/**
 * Zod schema that accepts either a string or a success message item object.
 */
export const successMessageSchema = z.union([z.string(), successMessageItemSchema]);

/**
 * Type inferred from the success message schema.
 */
export type TSuccessMessage = z.infer<typeof successMessageSchema>;

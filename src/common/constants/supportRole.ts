import { z } from 'zod';

/**
 * Enum representation of Support roles.
 */
export enum RoleSupport {
	'ADMIN' = 'ADMIN',
	'SPECIALIST' = 'SPECIALIST',
	'AGENT' = 'AGENT',
}

/**
 * Zod schema for validating support roles.
 * Accepts only 'ADMIN, 'SPECIALIST', 'AGENT' as valid role values.
 */
export const roleSupportSchema = z.enum(RoleSupport);

/**
 * Type representing a valid support role.
 *
 * @type {RoleSupport} Role
 */
export type TRoleSupport = z.infer<typeof roleSupportSchema>;

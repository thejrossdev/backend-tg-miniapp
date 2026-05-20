import { z } from 'zod';

/**
 * Enum representation of User roles.
 */
export enum Role {
	'ADMIN' = 'ADMIN',
	'USER' = 'USER',
}

/**
 * Zod schema for validating user roles.
 * Accepts only 'ADMIN' or 'USER' as valid role values.
 */
export const roleSchema = z.enum(Role);

/**
 * Type representing a valid user role.
 *
 * @type {Role} Role
 */
export type TRole = z.infer<typeof roleSchema>;

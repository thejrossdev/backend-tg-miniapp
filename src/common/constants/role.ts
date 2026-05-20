import { z } from 'zod';
import { Role } from '@/common/enums';

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

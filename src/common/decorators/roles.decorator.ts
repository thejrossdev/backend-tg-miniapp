import { SetMetadata } from '@nestjs/common';
import { TRole } from '../constants';

/**
 * Metadata key used to store required roles for a route or controller.
 * @type {string}
 */
export const ROLES_KEY: string = 'roles';

/**
 * Decorator to specify required roles for a route or controller.
 *
 * @param {TRole[]} roles - Array of roles that are permitted to access the route.
 * @returns {MethodDecorator & ClassDecorator} Decorator function to set the roles metadata.
 */
export const Roles = (...roles: TRole[]): MethodDecorator & ClassDecorator => SetMetadata(ROLES_KEY, roles);

import { AfterInsert, AfterLoad, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Abstract base entity class providing common fields for all entities.
 *
 * @property {string} id - Unique identifier generated as a UUID.
 * @property {Date} createdAt - Timestamp when the entity was created.
 * @property {Date} updatedAt - Timestamp when the entity was last updated.
 */
@Entity()
export abstract class Base {
	/**
	 * Unique identifier generated as a UUID.
	 * @type {string}
	 */
	@PrimaryGeneratedColumn('uuid')
	id: string;

	/**
	 * Timestamp when the entity was created.
	 * @type {Date}
	 */
	@CreateDateColumn()
	createdAt: Date;

	/**
	 * Timestamp when the entity was last updated.
	 * @type {Date}
	 */
	@UpdateDateColumn()
	updatedAt: Date;

	/**
	 * Entity name.
	 * @type {String}
	 */
	__entity?: string;

	/**
	 * Sets the entity name after the entity is loaded or inserted.
	 * This method is called automatically by TypeORM after the entity is loaded or inserted.
	 * It sets the `__entity` property to the name of the entity's constructor.
	 * */
	@AfterLoad()
	@AfterInsert()
	setEntityName(): void {
		this.__entity = this.constructor.name;
	}
}

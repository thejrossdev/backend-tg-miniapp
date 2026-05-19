import { Base } from '@/common/entities';
import { Column, Entity, JoinColumn, OneToOne, Relation } from 'typeorm';
import { User } from './user.entity';

/**
 * Entity representing a user's profile.
 *
 * @property {Relation<User>} user - The user associated with this profile.
 * @property {string} user_id - The user ID.
 */
@Entity()
export class Profile extends Base {
	// =========== RELATIONSHIPS ===========

	/**
	 * The user associated with this profile.
	 * @type {Relation<User>}
	 */
	@OneToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
	user: Relation<User>;

	/**
	 * The user ID.
	 * @type {string}
	 */
	@Column({ type: 'uuid' })
	user_id: string;
}

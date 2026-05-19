import { Base } from '@/common/entities';
import { Session } from '@/features/auth/entities/session.entity';
import { Profile } from '@/features/users/entities/profile.entity';
import { Column, Entity, OneToMany, OneToOne, Relation } from 'typeorm';

/**
 * Entity representing a user account.
 *
 * @property {Relation<Session[]>} sessions - Sessions associated with the user.
 * @property {Relation<Profile>} profile - Profile associated with the user.
 */
@Entity()
export class User extends Base {
	/**
	 * The user's tg id.
	 * @type {Buffer}
	 */
	@Column({
		type: 'bytea',
		nullable: false,
		comment: 'AEGIS-256 encrypted Telegram ID',
	})
	telegramIdEncrypted: Buffer;

	/**
	 * The user's hashed tg id.
	 * @type {string}
	 */
	@Column({
		type: 'varchar',
		length: 64,
		unique: true,
		nullable: false,
		comment: 'HMAC-SHA256 hash',
	})
	telegramIdHash: string;

	// =========== RELATIONSHIPS ===========

	/**
	 * Sessions associated with the user.
	 * @type {Relation<Session[]>}
	 */
	@OneToMany(() => Session, (session) => session.user, {
		cascade: true,
	})
	sessions: Relation<Session[]>;

	/**
	 * Profile associated with the user.
	 * @type {Relation<Profile>}
	 */
	@OneToOne(() => Profile, (profile) => profile.user, {
		cascade: true,
	})
	profile: Relation<Profile>;
}

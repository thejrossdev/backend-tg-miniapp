import { Base } from '@/common/entities';
import { Session } from '@/features/auth/entities/session.entity';
import { Profile } from '@/features/users/entities/profile.entity';
import { Column, Entity, OneToMany, OneToOne, Relation } from 'typeorm';

/**
 * Entity representing a user account.
 *
 * @property {string} email - The user's email address.
 * @property {string} password - The user's hashed password.
 * @property {string} username - The user's username.
 * @property {boolean} isEmailVerified - Whether the user's email is verified.
 * @property {Date} emailVerifiedAt - The date and time when the email was verified.
 * @property {Relation<Session[]>} sessions - Sessions associated with the user.
 * @property {Relation<Profile>} profile - Profile associated with the user.
 */
@Entity()
export class User extends Base {
	/**
	 * The user's tg id.
	 * @type {string}
	 */
	@Column({
		type: 'bytea',
		name: 'telegram_id_encrypted',
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
		name: 'telegram_id_hash',
		unique: true,
		nullable: false,
		comment: 'HMAC-SHA256 hash',
	})
	telegramIdHash: string;

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

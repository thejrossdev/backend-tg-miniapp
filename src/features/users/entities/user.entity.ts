import { Base } from '@/common/entities';
import { Role, RoleSupport } from '@/common/enums';
import { getUniqueReferralCode } from '@/common/utils';
import { Session } from '@/features/auth/entities';
import { Order } from '@/features/orders/entities';
import { PromoCode } from '@/features/promocodes/entities';
import { BeforeInsert, Column, Entity, Index, OneToMany, Relation } from 'typeorm';

/**
 * Entity representing a user account.
 *
 * @property {Relation<Session[]>} sessions - Sessions associated with the user.
 * @property {Relation<Profile>} profile - Profile associated with the user.
 */
@Entity()
@Index(['isSupport', 'roleSupport', 'language', 'role'])
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

	/**
	 * The user's language code.
	 * @type {string}
	 */
	@Column({
		type: 'varchar',
		length: 5,
		default: 'ru',
		nullable: false,
	})
	language: string;

	/**
	 * Referral code for invite.
	 * @type {string}
	 */
	@Column({
		type: 'varchar',
		length: 34,
		nullable: true,
	})
	referralCode: string;

	// =========== BOOLEANS ===========

	/**
	 * Is user support. Can user access to support panel.
	 * @type {boolean}
	 */
	@Column({ type: 'boolean', nullable: false, default: false })
	isSupport: boolean;

	// =========== ENUMS ===========

	/**
	 * The Role of the user.
	 * @type {string}
	 */
	@Column({ type: 'enum', enum: Role, default: Role.USER })
	role?: string;

	/**
	 * The support role of the user.
	 * @type {string}
	 */
	@Column({ type: 'enum', enum: RoleSupport, nullable: true })
	roleSupport?: string;

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
	 * Promo codes associated with the user.
	 * @type {Relation<Session[]>}
	 */
	@OneToMany(() => PromoCode, (promoCode) => promoCode.createdBy, {
		cascade: true,
	})
	promoCodes: Relation<PromoCode[]>;

	/**
	 * Orders associated with the user.
	 * @type {Relation<Order[]>}
	 */
	@OneToMany(() => Order, (order) => order.user)
	orders: Relation<Order[]>;

	/**
	 * Generate referral code before insert.
	 */
	@BeforeInsert()
	async generateOrderNumber(): Promise<void> {
		if (!this.referralCode) {
			this.referralCode = getUniqueReferralCode();
		}
	}
}

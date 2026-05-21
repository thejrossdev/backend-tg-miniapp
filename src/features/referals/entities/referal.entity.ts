import { Base } from '@/common/entities';
import { User } from '@/features/users/entities';
import { Column, Entity, Index, ManyToOne, Relation } from 'typeorm';

/**
 * Entity representing a referral relationship.
 * Tracks referrals from one user to another.
 */
@Entity()
@Index(['referrer', 'referred'], { unique: true })
export class Referral extends Base {
	/**
	 * Bonus amount earned by referrer.
	 * @type {number}
	 */
	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	bonusAmount: number;

	// =========== RELATIONSHIPS ===========

	/**
	 * User who made the referral.
	 * @type {Relation<User>}
	 */
	@ManyToOne(() => User, { nullable: false })
	referrer: Relation<User>;

	/**
	 * User who was referred.
	 * @type {Relation<User>}
	 */
	@ManyToOne(() => User, { nullable: false })
	referred: Relation<User>;

	// /**
	//  * Mark referral as completed when referred user makes first order.
	//  */
	// @AfterInsert()
	// async notifyReferrer(): Promise<void> {
	// 	// Logic to notify referrer about successful referral
	// 	// Could integrate with notification service
	// }
}

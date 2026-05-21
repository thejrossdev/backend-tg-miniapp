import { Base } from '@/common/entities';
import { Order } from '@/features/orders/entities';
import { PromoCodeType } from '@/features/promocodes/enums';
import { User } from '@/features/users/entities';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Relation } from 'typeorm';

/**
 * Entity representing a promo code.
 * Supports both percentage and fixed discount types.
 */
@Entity()
@Index(['code'], { unique: true })
@Index(['isActive', 'expiresAt'])
export class PromoCode extends Base {
	/**
	 * Unique promo code string.
	 * @type {string}
	 */
	@Column({ type: 'varchar', length: 50, nullable: false })
	code: string;

	/**
	 * Promo code description.
	 * @type {string}
	 */
	@Column({ type: 'text', nullable: true })
	description?: string;

	/**
	 * Discount value (percentage or fixed amount).
	 * @type {number}
	 */
	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	value: number;

	/**
	 * Expiry date.
	 * @type {Date}
	 */
	@Column({ type: 'timestamp', nullable: true })
	expiresAt?: Date;

	/**
	 * Maximum usage limit.
	 * @type {number}
	 */
	@Column({ type: 'integer', default: 1 })
	usageLimit: number;

	/**
	 * Current usage count.
	 * @type {number}
	 */
	@Column({ type: 'integer', default: 0 })
	usedCount: number;

	// =========== BOOLEANS ===========

	/**
	 * Whether promo code is active.
	 * @type {boolean}
	 */
	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	// =========== ENUMS ===========

	/**
	 * Discount type: percentage or fixed amount.
	 * @type {PromoCodeType}
	 */
	@Column({
		type: 'enum',
		enum: PromoCodeType,
		nullable: false,
	})
	type: PromoCodeType;

	// =========== RELATIONSHIPS ===========

	/**
	 * User who created the promo code.
	 * @type {Relation<User>}
	 */
	@ManyToOne(() => User, (user) => user.promoCodes, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
	createdBy: Relation<User>;

	/**
	 * Orders that used this promo code.
	 * @type {Relation<Order[]>}
	 */
	@OneToMany(() => Order, (order) => order.promoCode)
	orders: Relation<Order[]>;
}

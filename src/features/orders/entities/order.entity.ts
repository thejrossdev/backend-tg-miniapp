import { Base } from '@/common/entities';
import { getOrderNumber } from '@/common/utils';
import { OrderStatus } from '@/features/orders/enums';
import { Payment } from '@/features/payments/entities';
import { PromoCode } from '@/features/promocodes/entities';
import { User } from '@/features/users/entities';
import { BeforeInsert, Column, Entity, Index, ManyToOne, OneToOne, Relation } from 'typeorm';

/**
 * Entity representing an order.
 */
@Entity()
@Index(['user', 'status'])
@Index(['createdAt'])
export class Order extends Base {
	/**
	 * Order number/identifier.
	 * @type {string}
	 */
	@Column({ type: 'varchar', length: 50, unique: true, nullable: false })
	orderNumber: string;

	/**
	 * Total amount before discounts.
	 * @type {number}
	 */
	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	totalAmount: number;

	/**
	 * Discount amount.
	 * @type {number}
	 */
	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	discountAmount: number;

	/**
	 * Final amount after discounts.
	 * @type {number}
	 */
	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	finalAmount: number;

	// TODO Create items for orders
	// /**
	//  * Cart items stored as JSON.
	//  * @type {Array<{productId: string, quantity: number, price: number}>}
	//  */
	// @Column({ type: 'jsonb', nullable: false })
	// items: Array<{
	// 	productId: string;
	// 	quantity: number;
	// 	price: number;
	// }>;

	// =========== ENUMS ===========

	/**
	 * Order status.
	 * @type {OrderStatus}
	 */
	@Column({
		type: 'enum',
		enum: OrderStatus,
		default: OrderStatus.PENDING,
	})
	status: OrderStatus;

	// =========== RELATIONSHIPS ===========

	/**
	 * User who placed the order.
	 * @type {Relation<User>}
	 */
	@ManyToOne(() => User, { nullable: false })
	user: Relation<User>;

	/**
	 * Applied promo code.
	 * @type {Relation<PromoCode>}
	 */
	@ManyToOne(() => PromoCode, { nullable: true })
	promoCode?: Relation<PromoCode>;

	/**
	 * Associated payment.
	 * @type {Relation<Payment>}
	 */
	@OneToOne(() => Payment, (payment) => payment.order)
	payment: Relation<Payment>;

	/**
	 * Generate order number before insert.
	 */
	@BeforeInsert()
	async generateOrderNumber(): Promise<void> {
		if (!this.orderNumber) {
			this.orderNumber = getOrderNumber();
		}
	}
}

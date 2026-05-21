import { Base } from '@/common/entities';
import { Order } from '@/features/orders/entities';
import { PaymentMethod, PaymentStatus } from '@/features/payments/enums';
import { User } from '@/features/users/entities';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, Relation } from 'typeorm';

/**
 * Entity representing a payment transaction.
 * Supports multiple payment methods and stores provider-specific data.
 */
@Entity()
@Index(['transactionId'])
@Index(['status', 'createdAt'])
export class Payment extends Base {
	/**
	 * Payment amount.
	 * @type {number}
	 */
	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	amount: number;

	/**
	 * Currency code (USD, EUR, etc.).
	 * @type {string}
	 */
	@Column({ type: 'varchar', length: 3, default: 'USD' })
	currency: string;

	/**
	 * Gateway transaction ID.
	 * @type {string}
	 */
	@Column({ type: 'varchar', length: 255, nullable: true })
	transactionId?: string;

	/**
	 * Provider-specific response data.
	 * @type {object}
	 */
	@Column({ type: 'jsonb', nullable: true })
	providerData?: object;

	/**
	 * Crypto wallet address (if method is crypto).
	 * @type {string}
	 */
	@Column({ type: 'varchar', length: 255, nullable: true })
	cryptoAddress?: string;

	// =========== ENUMS ===========

	/**
	 * Payment method.
	 * @type {PaymentMethod}
	 */
	@Column({
		type: 'enum',
		enum: PaymentMethod,
		nullable: false,
	})
	method: PaymentMethod;

	/**
	 * Payment status.
	 * @type {PaymentStatus}
	 */
	@Column({
		type: 'enum',
		enum: PaymentStatus,
		default: PaymentStatus.PENDING,
	})
	status: PaymentStatus;

	// =========== RELATIONSHIPS ===========

	/**
	 * Associated order.
	 * @type {Relation<Order>}
	 */
	@OneToOne(() => Order, { nullable: false })
	@JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
	order: Relation<Order>;

	/**
	 * User who made the payment.
	 * @type {Relation<User>}
	 */
	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
	user: Relation<User>;

	// /**
	//  * Update order status on payment success/failure.
	//  */
	// @AfterUpdate()
	// async updateOrderStatus(): Promise<void> {
	// 	if (this.status === PaymentStatus.SUCCESS) {
	// 		const order = this.order;
	// 		order.status = OrderStatus.CONFIRMED;
	// 		await order.save();
	// 	}
	// }
}

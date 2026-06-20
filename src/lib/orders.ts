import { apiGet, apiPost, apiPatch } from './api'

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "card" | "paystack" | "bank_transfer" | "pay_on_delivery";

export interface OrderLine {
  productId: string;
  name: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  promoPrice?: number | null;
  image?: string;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  items: OrderLine[];
  deliveryFee?: number;
  notes?: string;
  paymentReference?: string;
  paystackAuthorizationUrl?: string;
  paymentProofUrl?: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  fulfillment_status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  items: OrderLine[];
  payment_reference?: string | null;
  paystack_authorization_url?: string | null;
  payment_proof_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

type OrderRealtimeEvent =
  | { type: "INSERT" | "UPDATE"; order: OrderRecord }
  | { type: "DELETE"; order: Pick<OrderRecord, "id"> };

export async function createOrder(input: CreateOrderInput): Promise<OrderRecord> {
  return apiPost<OrderRecord>('/api/orders', {
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    paymentMethod: input.paymentMethod,
    items: input.items,
    deliveryFee: input.deliveryFee ?? 0,
    notes: input.notes,
    paymentReference: input.paymentReference,
    paystackAuthorizationUrl: input.paystackAuthorizationUrl,
    paymentProofUrl: input.paymentProofUrl,
  })
}

export async function updateOrderPayment(id: string, updates: {
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paystackAuthorizationUrl?: string | null;
}): Promise<OrderRecord> {
  return apiPatch<OrderRecord>(`/api/orders/${id}/payment`, {
    paymentStatus: updates.paymentStatus,
    paymentReference: updates.paymentReference ?? null,
    paystackAuthorizationUrl: updates.paystackAuthorizationUrl ?? null,
  })
}

export async function updateOrderStatus(id: string, fulfillmentStatus: OrderStatus): Promise<OrderRecord> {
  return apiPatch<OrderRecord>(`/api/orders/${id}/status`, { fulfillmentStatus })
}

export async function listOrders(): Promise<OrderRecord[]> {
  return apiGet<OrderRecord[]>('/api/orders')
}

export function subscribeOrders(onChange: (event: OrderRealtimeEvent) => void): () => void {
  const knownIds = new Set<string>()
  const knownStatuses = new Map<string, { payment: string; fulfillment: string }>()
  let initialized = false
  let stopped = false

  async function poll() {
    if (stopped) return
    try {
      const orders = await listOrders()
      if (!initialized) {
        orders.forEach((o) => {
          knownIds.add(o.id)
          knownStatuses.set(o.id, { payment: o.payment_status, fulfillment: o.fulfillment_status })
        })
        initialized = true
      } else {
        orders.forEach((order) => {
          if (!knownIds.has(order.id)) {
            knownIds.add(order.id)
            knownStatuses.set(order.id, { payment: order.payment_status, fulfillment: order.fulfillment_status })
            onChange({ type: 'INSERT', order })
          } else {
            const prev = knownStatuses.get(order.id)
            if (prev && (prev.payment !== order.payment_status || prev.fulfillment !== order.fulfillment_status)) {
              knownStatuses.set(order.id, { payment: order.payment_status, fulfillment: order.fulfillment_status })
              onChange({ type: 'UPDATE', order })
            }
          }
        })
      }
    } catch (err) {
      console.warn('[subscribeOrders] poll error:', err)
    }
    if (!stopped) setTimeout(poll, 5000)
  }

  poll()

  return () => { stopped = true }
}

export interface OrderNotificationPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  itemCount: number;
  paymentMethod: string;
  deliveryAddress: string;
}

export async function notifyAdminOrderCreated(payload: OrderNotificationPayload) {
  const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
  const response = await fetch(`${baseUrl}/api/notify-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WhatsApp notification failed: ${response.status} ${response.statusText} ${text}`);
  }

  return response.json();
}

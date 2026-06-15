import { apiGet, apiPost, apiPatch } from './api'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingRecord {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  product_id: string;
  product_name: string;
  quantity: number;
  booking_time: string;
  status: BookingStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

type BookingRealtimeEvent =
  | { type: 'INSERT' | 'UPDATE'; booking: BookingRecord }
  | { type: 'DELETE'; booking: Pick<BookingRecord, 'id'> };

export async function createBooking(
  input: Omit<Partial<BookingRecord>, 'id' | 'booking_number' | 'created_at' | 'updated_at'>
): Promise<BookingRecord | null> {
  try {
    return await apiPost<BookingRecord>('/api/bookings', input)
  } catch (err) {
    console.error('[createBooking]', err)
    return null
  }
}

export async function listBookings(): Promise<BookingRecord[]> {
  return apiGet<BookingRecord[]>('/api/bookings')
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<BookingRecord> {
  return apiPatch<BookingRecord>(`/api/bookings/${id}/status`, { status })
}

export function subscribeBookings(onChange: (ev: BookingRealtimeEvent) => void): () => void {
  const knownIds = new Set<string>()
  const knownStatuses = new Map<string, string>()
  let initialized = false
  let stopped = false

  async function poll() {
    if (stopped) return
    try {
      const bookings = await listBookings()
      if (!initialized) {
        bookings.forEach((b) => {
          knownIds.add(b.id)
          knownStatuses.set(b.id, b.status)
        })
        initialized = true
      } else {
        bookings.forEach((booking) => {
          if (!knownIds.has(booking.id)) {
            knownIds.add(booking.id)
            knownStatuses.set(booking.id, booking.status)
            onChange({ type: 'INSERT', booking })
          } else {
            const prev = knownStatuses.get(booking.id)
            if (prev !== undefined && prev !== booking.status) {
              knownStatuses.set(booking.id, booking.status)
              onChange({ type: 'UPDATE', booking })
            }
          }
        })
      }
    } catch (err) {
      console.warn('[subscribeBookings] poll error:', err)
    }
    if (!stopped) setTimeout(poll, 5000)
  }

  poll()

  return () => { stopped = true }
}

/** GET /api/v1/futsal/ → data (the arena record this whole site is about). */
export interface Futsal {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  price_per_slot: string;
  /** Slot length in minutes (e.g. 60). */
  slot_duration: number;
  /** "HH:mm:ss" */
  opening_time: string;
  /** "HH:mm:ss" */
  closing_time: string;
  status: "ACTIVE" | "INACTIVE" | string;
  created_at: string;
  updated_at: string;
}

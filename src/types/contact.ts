/**
 * Contact API contracts — mirror the backend's /api/v1/contact/** responses.
 */

/** POST /api/v1/contact/ */
export interface ContactPayload {
  name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
}

/** A submitted contact message, as echoed back by the backend. */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

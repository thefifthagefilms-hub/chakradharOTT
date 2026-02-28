import crypto from "crypto";

/**
 * Generates human-readable ticket code
 * Format: CHK-XXXXXX
 * Example: CHK-A8F9B2
 */
export function generateTicketCode() {
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `CHK-${random}`;
}
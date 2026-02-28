/**
 * Creates a standardized Premiere object
 * This ensures future-proof structure
 */

export function createPremiereObject({
  title,
  movieId,
  directorId,
  startTime,
  endTime,
  type = "free", // free | limited | paid
  maxSeats = null,
  requiresTicket = false,
  transferable = false,
  paymentEnabled = false,
  paymentType = "none", // none | upi | qr | link
  upiId = null,
  paymentLink = null,
  createdBy,
}) {
  return {
    title,
    movieId,
    directorId,
    startTime,
    endTime,
    status: "upcoming", // upcoming | live | ended
    type,
    maxSeats,
    requiresTicket,
    transferable,
    paymentEnabled,
    paymentType,
    upiId,
    paymentLink,
    createdBy,
    createdAt: new Date(),
  };
}
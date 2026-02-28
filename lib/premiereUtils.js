export function createPremiereObject(data) {
  return {
    title: data.title,
    description: data.description,
    scheduledAt: new Date(data.scheduledAt),
    maxTickets: data.maxTickets || 100,
    ticketsSold: 0,
    isPaid: data.isPaid || false,
    price: data.isPaid ? Number(data.price) : null,
    status: "scheduled",
    createdBy: data.createdBy,
  };
}
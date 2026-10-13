export type StoreInfoTopic = 'contact' | 'shipping' | 'refund' | 'terms' | 'privacy';

export const STORE_INFO: Record<StoreInfoTopic, { title: string; body: string }> = {
  contact: { title: 'Contact information', body: 'For order questions, delivery updates, or product concerns, contact Above Apprl through the official social links shown on this website. Include your order reference when contacting us about an existing order.' },
  shipping: { title: 'Shipping policy', body: 'Orders are confirmed before fulfillment. Delivery fees, destination coverage, and estimated delivery dates are communicated before an order is finalized. Delivery times may vary by location, courier, weather, and other circumstances outside the store\'s control.' },
  refund: { title: 'Refund and order concerns', body: 'Please contact Above Apprl as soon as possible if your order arrives damaged, incomplete, or different from what was confirmed. Include your order reference and clear photos when relevant. Requests are reviewed based on the order status and the issue reported.' },
  terms: { title: 'Terms of service', body: 'By submitting an order request, you confirm that your name, contact details, delivery address, product, size, and quantity are correct. An order request is not final until availability and delivery details have been confirmed by Above Apprl.' },
  privacy: { title: 'Privacy policy', body: 'Above Apprl uses account, contact, and delivery information to process orders, provide customer support, and maintain account access. Information is handled only for store operations and is not requested beyond what is needed for these services.' },
};

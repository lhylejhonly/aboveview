export type StoreInfoTopic = 'contact' | 'shipping' | 'refund' | 'terms' | 'privacy';

// Safe defaults: replace these strings with the store's final policy wording when available.
export const STORE_INFO: Record<StoreInfoTopic, { title: string; body: string }> = {
  contact: { title: 'Contact information', body: 'For order questions, delivery updates, or product concerns, contact Above Apprl through the official social links shown below.' },
  shipping: { title: 'Shipping policy', body: 'Shipping details and the expected delivery window are confirmed with the customer before fulfillment. Availability may vary by destination and order status.' },
  refund: { title: 'Refund and order concerns', body: 'If there is an issue with an order, contact Above Apprl as soon as possible with your order reference and photos when relevant. Eligibility is reviewed per order.' },
  terms: { title: 'Terms of service', body: 'By placing an order, you confirm that your delivery details are accurate and that the product, size, quantity, and order information have been reviewed before submission.' },
  privacy: { title: 'Privacy policy', body: 'Account and delivery information is used to process orders, provide support, and maintain customer access. Do not submit sensitive information that is not required for fulfillment.' },
};
